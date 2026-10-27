import { useMemo } from 'react'
import { CycleDiagram } from '../../../components/CycleDiagram'
import { PlotPanel } from '../../../components/PlotPanel'
import { useChartTheme } from '../../../hooks/useChartTheme'
import { fmt, m3ToLiters, paToKPa } from '../../../lib/format'
import { stateAtProgress, type CycleLeg } from '../../../physics/cycles/legs'
import { useCyclePlayback } from '../useCyclePlayback'
import { PistonCylinder } from './PistonCylinder'
import { legColor, legContact } from './legStyle'

interface Props {
  legs: CycleLeg[]
  /** 고온 기준 온도 (색 구분용) [K] */
  Th: number
  /** 둘러싼 면적 라벨 (예: 'W_net') */
  areaLabel: string
  /** 순일이 음수(냉동기)이면 면적 색을 바꾼다 */
  areaColor?: string
}

/** P-V 선도, T-S 선도, 피스톤-실린더를 하나의 재생 진행도로 동기화해 보여준다. */
export function CycleViewer({ legs, Th, areaLabel, areaColor }: Props) {
  const c = useChartTheme()
  const playback = useCyclePlayback(legs.length)
  const { legIndex, state } = stateAtProgress(legs, playback.progress)
  const activeLeg = legs[legIndex]
  const colors = legs.map((l) => legColor(l, c, Th))

  const geometry = useMemo(() => {
    const pts = legs.flatMap((l) => l.path)
    const max = (f: (p: (typeof pts)[number]) => number) => Math.max(...pts.map(f))
    const min = (f: (p: (typeof pts)[number]) => number) => Math.min(...pts.map(f))
    return {
      Vmax: max((p) => p.V),
      Pmax: max((p) => p.P),
      Tmin: min((p) => p.T),
      Tmax: max((p) => p.T),
      Smin: min((p) => p.S),
      Smax: max((p) => p.S),
    }
  }, [legs])

  const pvLegs = legs.map((l, i) => ({
    id: l.id,
    color: colors[i],
    points: l.path.map((p) => ({ x: m3ToLiters(p.V), y: paToKPa(p.P) })),
  }))
  const tsLegs = legs.map((l, i) => ({
    id: l.id,
    color: colors[i],
    points: l.path.map((p) => ({ x: p.S, y: p.T })),
  }))
  const vertexLabel = (l: CycleLeg) => l.id.split('→')[0]
  const sPad = Math.max((geometry.Smax - geometry.Smin) * 0.15, 0.5)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={playback.toggle}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
        >
          {playback.playing ? '⏸ 일시정지' : '▶ 재생'}
        </button>
        <button
          type="button"
          onClick={playback.reset}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
        >
          ↺ 처음으로
        </button>
        <label className="flex min-w-[12rem] flex-1 items-center gap-2 text-sm">
          <span className="shrink-0 text-slate-500">진행</span>
          <input
            type="range"
            min={0}
            max={legs.length}
            step={0.01}
            value={playback.progress}
            onChange={(e) => playback.setProgress(Number(e.target.value))}
            className="w-full"
            aria-label="사이클 진행도"
          />
        </label>
        <span className="rounded-md px-2 py-1 text-sm font-semibold" style={{ color: colors[legIndex] }}>
          {activeLeg.id} {activeLeg.label}
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_13rem]">
        <PlotPanel title="P-V 선도">
          <CycleDiagram
            legs={pvLegs}
            xLabel="V [L]"
            yLabel="P [kPa]"
            xDomain={[0, m3ToLiters(geometry.Vmax) * 1.05]}
            yDomain={[0, paToKPa(geometry.Pmax) * 1.1]}
            areaLabel={areaLabel}
            areaColor={areaColor}
            vertices={legs.map((l) => ({ x: m3ToLiters(l.from.V), y: paToKPa(l.from.P), label: vertexLabel(l) }))}
            marker={{ x: m3ToLiters(state.V), y: paToKPa(state.P) }}
            activeLegId={activeLeg.id}
          />
        </PlotPanel>
        <PlotPanel title="T-S 선도 (S는 상태 1 기준)">
          <CycleDiagram
            legs={tsLegs}
            xLabel="S − S₁ [J/K]"
            yLabel="T [K]"
            xDomain={[geometry.Smin - sPad, geometry.Smax + sPad]}
            yDomain={[0, geometry.Tmax * 1.1]}
            areaLabel={areaLabel}
            areaColor={areaColor}
            vertices={legs.map((l) => ({ x: l.from.S, y: l.from.T, label: vertexLabel(l) }))}
            marker={{ x: state.S, y: state.T }}
            activeLegId={activeLeg.id}
            xDigits={1}
          />
        </PlotPanel>
        <PlotPanel title="피스톤-실린더">
          <PistonCylinder
            V={state.V}
            Vmax={geometry.Vmax}
            T={state.T}
            Tmin={geometry.Tmin}
            Tmax={geometry.Tmax}
            contact={legContact(activeLeg, Th)}
            heatSign={Math.sign(activeLeg.Q)}
          />
          <p className="mt-1 text-center text-xs tabular-nums text-slate-500">
            V = {fmt(m3ToLiters(state.V), 1)} L · P = {fmt(paToKPa(state.P), 0)} kPa
          </p>
        </PlotPanel>
      </div>
    </div>
  )
}
