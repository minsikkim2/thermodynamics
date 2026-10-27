import { useMemo, useState } from 'react'
import { Arrow } from '../../../../components/Arrow'
import { ConceptCard } from '../../../../components/ConceptCard'
import { FormulaBlock, Tex } from '../../../../components/FormulaBlock'
import { ObservationGuide } from '../../../../components/ObservationGuide'
import { ParameterSlider } from '../../../../components/ParameterSlider'
import { PlotPanel } from '../../../../components/PlotPanel'
import { XYChart } from '../../../../components/XYChart'
import { useAnimationFrame } from '../../../../hooks/useAnimationFrame'
import { useChartTheme } from '../../../../hooks/useChartTheme'
import { temperatureColor } from '../../../../lib/color'
import { fmt } from '../../../../lib/format'
import { linspace } from '../../../../physics/constants'
import { contactTemperatures, equilibriumTemperature, relaxationTime } from '../../../../physics/laws'

const T_LO = 200
const T_HI = 600
const K = 1 // 열전달 계수 [W/K]
/** 애니메이션 한 번(5τ)에 걸리는 실제 시간 [s] */
const PLAY_SECONDS = 8

export function ZerothLaw() {
  const c = useChartTheme()
  const [TA, setTA] = useState(500)
  const [TB, setTB] = useState(300)
  const [CA, setCA] = useState(30)
  const [CB, setCB] = useState(60)
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)

  const params = { TA, TB, CA, CB, k: K }
  const tau = relaxationTime(params)
  const tMax = 5 * tau
  const Teq = equilibriumTemperature(params)
  const now = contactTemperatures(params, t)

  // 매개변수가 바뀌면 처음부터 다시
  const reset = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v)
    setT(0)
    setPlaying(false)
  }

  useAnimationFrame((dt) => {
    const next = t + (dt * tMax) / PLAY_SECONDS
    if (next >= tMax) {
      setT(tMax)
      setPlaying(false)
    } else {
      setT(next)
    }
  }, playing)

  const series = useMemo(() => {
    const p = { TA, TB, CA, CB, k: K }
    const ts = linspace(0, 5 * relaxationTime(p), 80)
    const pts = ts.map((ti) => ({ t: ti, ...contactTemperatures(p, ti) }))
    return [
      { name: '물체 A', data: pts.map((p) => ({ x: p.t, y: p.TA })), color: c.heat, width: 2.5 },
      { name: '물체 B', data: pts.map((p) => ({ x: p.t, y: p.TB })), color: c.work, width: 2.5 },
    ]
  }, [TA, TB, CA, CB, c])

  const flow = K * (now.TA - now.TB) // A → B 열흐름률 [W]
  const maxFlow = K * (T_HI - T_LO)

  return (
    <ConceptCard title="제0법칙 — 열평형과 온도">
      <p>
        두 물체가 각각 세 번째 물체와 열평형이면, 두 물체끼리도 열평형입니다. 이 법칙 덕분에 <strong>온도</strong>를
        &ldquo;열평형이면 같은 값&rdquo;으로 정의하고 온도계로 잴 수 있습니다. 온도가 다른 두 물체를 접촉시키면 열이
        뜨거운 쪽에서 차가운 쪽으로 흘러 결국 같은 온도가 됩니다.
      </p>
      <FormulaBlock
        tex="T_{eq} = \frac{C_A T_A + C_B T_B}{C_A + C_B}"
        caption="평형 온도: 열용량이 큰 물체 쪽 온도에 가깝다"
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="space-y-3">
          <svg viewBox="0 0 400 110" className="w-full" role="img" aria-label="접촉한 두 물체의 온도">
            <rect x={20} y={15} width={150} height={80} rx={8} fill={temperatureColor(now.TA, T_LO, T_HI)} />
            <rect x={230} y={15} width={150} height={80} rx={8} fill={temperatureColor(now.TB, T_LO, T_HI)} />
            <text x={95} y={50} textAnchor="middle" fill="#fff" fontWeight={700} fontSize={14}>A</text>
            <text x={95} y={72} textAnchor="middle" fill="#fff" fontSize={13}>{fmt(now.TA, 1)} K</text>
            <text x={305} y={50} textAnchor="middle" fill="#fff" fontWeight={700} fontSize={14}>B</text>
            <text x={305} y={72} textAnchor="middle" fill="#fff" fontSize={13}>{fmt(now.TB, 1)} K</text>
            {flow > 0.05 ? (
              <Arrow x1={176} y1={55} x2={224} y2={55} thickness={3 + (flow / maxFlow) * 20} color={c.heat} />
            ) : flow < -0.05 ? (
              <Arrow x1={224} y1={55} x2={176} y2={55} thickness={3 + (-flow / maxFlow) * 20} color={c.heat} />
            ) : (
              <text x={200} y={60} textAnchor="middle" fontSize={12} fill={c.energy}>평형</text>
            )}
            <text x={200} y={20} textAnchor="middle" fontSize={11} fill={c.axis}>열 Q</text>
          </svg>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (t >= tMax) setT(0)
                setPlaying((p) => !p)
              }}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              {playing ? '⏸ 일시정지' : t > 0 && t < tMax ? '▶ 계속' : '▶ 접촉시키기'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaying(false)
                setT(0)
              }}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
            >
              ↺ 처음으로
            </button>
            <span className="text-sm tabular-nums text-slate-500">
              t = {fmt(t, 1)} s · τ = {fmt(tau, 1)} s
            </span>
          </div>
          <PlotPanel title="온도–시간 그래프" height={240}>
            <XYChart
              series={series}
              xLabel="t [s]"
              yLabel="T [K]"
              xDomain={[0, tMax]}
              yDomain={[T_LO - 20, T_HI + 20]}
              hLines={[{ y: Teq, color: c.energy, label: `T_eq = ${fmt(Teq, 1)} K` }]}
              vLines={[{ x: t, color: c.muted }]}
              legend
              yDigits={0}
            />
          </PlotPanel>
        </div>
        <div className="space-y-4">
          <ParameterSlider label="A의 처음 온도 T_A" unit="K" min={T_LO} max={T_HI} step={10} value={TA} onChange={reset(setTA)} digits={0} />
          <ParameterSlider label="B의 처음 온도 T_B" unit="K" min={T_LO} max={T_HI} step={10} value={TB} onChange={reset(setTB)} digits={0} />
          <ParameterSlider label="A의 열용량 C_A" unit="J/K" min={10} max={100} step={5} value={CA} onChange={reset(setCA)} digits={0} />
          <ParameterSlider label="B의 열용량 C_B" unit="J/K" min={10} max={100} step={5} value={CB} onChange={reset(setCB)} digits={0} />
        </div>
      </div>
      <ObservationGuide
        items={[
          <>
            <Tex tex="C_B" />를 <Tex tex="C_A" />보다 훨씬 크게 해 보세요. 평형 온도가 B의 처음 온도에 가까워집니다(B가
            &ldquo;열 저장소&rdquo; 역할).
          </>,
          <>온도 차가 클수록 처음 화살표(열흐름)가 굵고, 평형에 가까워질수록 가늘어집니다.</>,
        ]}
      />
    </ConceptCard>
  )
}
