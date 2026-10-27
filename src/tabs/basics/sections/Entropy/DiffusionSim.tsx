import { useEffect, useMemo, useRef, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ParameterSlider } from '../../../../components/ParameterSlider'
import { PlotPanel } from '../../../../components/PlotPanel'
import { ValueReadout } from '../../../../components/ValueReadout'
import { XYChart } from '../../../../components/XYChart'
import { useAnimationFrame } from '../../../../hooks/useAnimationFrame'
import { tooltipStyle, useChartTheme } from '../../../../hooks/useChartTheme'
import { useElementWidth } from '../../../../hooks/useElementWidth'
import { fmt } from '../../../../lib/format'
import { boltzmannEntropy, lnBinomial, leftCountProbabilities } from '../../../../physics/entropy'
import { DiffusionBox } from '../../../../sim/diffusion'
import { PARTICLE_RADIUS } from '../../../../sim/particleBox'

const HEIGHT = 200
const SPEED = 90 // [px/s]
const SAMPLE_EVERY = 0.2 // [s]
const HISTORY_SECONDS = 30

/** 칸막이 제거 후 자발적 확산 시뮬레이션과 S = k_B ln Ω */
export function DiffusionSim() {
  const c = useChartTheme()
  const [wrapRef, width] = useElementWidth<HTMLDivElement>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const boxRef = useRef<DiffusionBox | null>(null)
  // 시뮬레이션 객체는 렌더와 무관하게 effect/이벤트/애니메이션 안에서만 만들고 다룬다
  const getBox = () => (boxRef.current ??= new DiffusionBox(600, HEIGHT))
  const [N, setN] = useState(20)
  const [partition, setPartition] = useState(true)
  const [nLeft, setNLeft] = useState(20)
  const [history, setHistory] = useState<{ x: number; y: number }[]>([])
  const clock = useRef({ t: 0, sinceSample: 0 })

  const restart = (count: number) => {
    const box = getBox()
    box.width = width
    box.reset(count)
    clock.current = { t: 0, sinceSample: 0 }
    setPartition(true)
    setNLeft(count)
    setHistory([])
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = HEIGHT * dpr
    canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0)
    // 상자 크기가 바뀌면 칸막이 위치도 바뀌므로 처음부터 다시 배치한다
    restart(N)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width])

  useAnimationFrame((dt) => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const box = getBox()
    box.width = width
    box.partition = partition
    box.step(dt, SPEED)

    const clk = clock.current
    clk.sinceSample += dt
    if (clk.sinceSample >= SAMPLE_EVERY) {
      clk.sinceSample = 0
      const left = box.leftCount()
      setNLeft(left)
      if (!partition) {
        clk.t += SAMPLE_EVERY
        const point = { x: clk.t, y: lnBinomial(box.particles.length, left) }
        setHistory((h) => [...h.filter((p) => p.x > clk.t - HISTORY_SECONDS), point])
      }
    }

    ctx.clearRect(0, 0, width, HEIGHT)
    ctx.fillStyle = c.surface
    ctx.fillRect(0, 0, width, HEIGHT)
    ctx.strokeStyle = c.axis
    ctx.lineWidth = 3
    ctx.strokeRect(1.5, 1.5, width - 3, HEIGHT - 3)
    // 칸막이 (제거 후에는 점선으로 경계만 표시)
    ctx.beginPath()
    ctx.moveTo(width / 2, 0)
    ctx.lineTo(width / 2, HEIGHT)
    if (partition) {
      ctx.lineWidth = 4
      ctx.setLineDash([])
    } else {
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = c.muted
    }
    ctx.stroke()
    ctx.setLineDash([])
    for (const p of box.particles) {
      ctx.fillStyle = p.x < width / 2 ? c.series[0] : c.series[1]
      ctx.beginPath()
      ctx.arc(p.x, p.y, PARTICLE_RADIUS + 1, 0, 2 * Math.PI)
      ctx.fill()
    }
  })

  const probs = useMemo(
    () => leftCountProbabilities(N).map((p, k) => ({ k, p: p * 100 })),
    [N],
  )
  const lnOmega = lnBinomial(N, nLeft)
  const lnOmegaMax = lnBinomial(N, Math.floor(N / 2))
  const S = boltzmannEntropy(N, nLeft)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <PlotPanel title="칸막이 상자 속 입자">
          <div ref={wrapRef}>
            <canvas ref={canvasRef} style={{ width: '100%', height: HEIGHT }} role="img" aria-label="입자 확산 시뮬레이션" />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!partition}
              onClick={() => setPartition(false)}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40"
            >
              칸막이 제거
            </button>
            <button
              type="button"
              onClick={() => restart(N)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
            >
              ↺ 모두 왼쪽으로 되돌리기
            </button>
          </div>
        </PlotPanel>
        <div className="space-y-3">
          <ParameterSlider
            label="입자 수 N"
            min={2}
            max={60}
            step={1}
            value={N}
            onChange={(v) => {
              setN(v)
              restart(v)
            }}
            digits={0}
          />
          <div className="grid grid-cols-2 gap-2">
            <ValueReadout label="왼쪽 n_L" value={String(nLeft)} />
            <ValueReadout label="오른쪽" value={String(N - nLeft)} />
          </div>
          <ValueReadout label="경우의 수 Ω = C(N, n_L)" value={fmt(Math.exp(lnOmega), 0)} />
          <ValueReadout
            label="S = k_B ln Ω"
            value={fmt(S, 3)}
            unit="J/K"
            sub={`ln Ω = ${fmt(lnOmega, 2)} (최대 ${fmt(lnOmegaMax, 2)})`}
            tone="good"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PlotPanel
          title="왼쪽 입자 수의 확률 분포 P(n_L)"
          height={220}
          footer={`모두 왼쪽에 모일 확률 = 1/2^N = ${fmt(2 ** -N, 2)}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={probs} margin={{ top: 8, right: 8, bottom: 16, left: 0 }}>
              <CartesianGrid stroke={c.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="k"
                stroke={c.axis}
                tick={{ fill: c.axis, fontSize: 10 }}
                label={{ value: 'n_L', position: 'insideBottom', offset: -8, fill: c.axis, fontSize: 12 }}
              />
              <YAxis stroke={c.axis} tick={{ fill: c.axis, fontSize: 10 }} tickFormatter={(v: number) => `${fmt(v, 0)}%`} width={40} />
              <Tooltip {...tooltipStyle(c)} formatter={(v) => `${fmt(Number(v), 4)} %`} labelFormatter={(k) => `n_L = ${k}`} cursor={{ fill: c.grid, opacity: 0.4 }} />
              <Bar dataKey="p" isAnimationActive={false}>
                {probs.map((d) => (
                  <Cell key={d.k} fill={d.k === nLeft ? c.heat : c.series[0]} fillOpacity={d.k === nLeft ? 1 : 0.5} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </PlotPanel>
        <PlotPanel title="시간에 따른 ln Ω (= S / k_B)" height={220} footer="칸막이를 제거하면 최댓값 근처로 올라가 그 주변에서 요동합니다.">
          <XYChart
            series={[{ name: 'ln Ω', data: history, color: c.energy }]}
            xLabel="t [s]"
            yLabel="ln Ω"
            xDomain={history.length ? ['dataMin', 'dataMax'] : [0, 1]}
            yDomain={[0, Math.ceil(lnOmegaMax + 1)]}
            hLines={[{ y: lnOmegaMax, color: c.muted, label: '최대' }]}
          />
        </PlotPanel>
      </div>
    </div>
  )
}
