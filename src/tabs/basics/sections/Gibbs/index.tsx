import { useMemo, useState } from 'react'
import { FormulaBlock, Tex } from '../../../../components/FormulaBlock'
import { ParameterSlider } from '../../../../components/ParameterSlider'
import { PlotPanel } from '../../../../components/PlotPanel'
import { ControlPanel, SectionShell } from '../../../../components/SectionShell'
import { XYChart } from '../../../../components/XYChart'
import { useChartTheme } from '../../../../hooks/useChartTheme'
import { fmt, fmtSigned } from '../../../../lib/format'
import { kelvinToCelsius, linspace } from '../../../../physics/constants'
import {
  crossoverTemperature,
  deltaG,
  gibbsQuadrant,
  spontaneity,
  type GibbsQuadrant,
} from '../../../../physics/gibbs'

const T_MIN = 10
const T_MAX = 1500

const PRESETS = [
  { name: '얼음이 녹음', dH: 6.01, dS: 22.0 },
  { name: '물이 끓음', dH: 40.7, dS: 109.0 },
  { name: '암모니아 합성', dH: -92.2, dS: -198.7 },
  { name: '메테인 연소', dH: -890.3, dS: -242.8 },
]

const QUADRANTS: { q: GibbsQuadrant; text: string }[] = [
  { q: 'lowT', text: '저온에서 자발적' },
  { q: 'always', text: '항상 자발적' },
  { q: 'never', text: '항상 비자발적' },
  { q: 'highT', text: '고온에서 자발적' },
]

export default function Gibbs() {
  const c = useChartTheme()
  const [dH, setDH] = useState(40.7) // kJ/mol
  const [dS, setDS] = useState(109) // J/(mol·K)
  const [T, setT] = useState(298)

  const dHJ = dH * 1000
  const dG = deltaG(dHJ, dS, T) / 1000 // kJ/mol
  const state = spontaneity(dG, 1e-6)
  const Tstar = crossoverTemperature(dHJ, dS)
  const quadrant = gibbsQuadrant(dH, dS)

  const series = useMemo(
    () => [
      {
        name: 'ΔG',
        data: linspace(T_MIN, T_MAX, 60).map((Ti) => ({ x: Ti, y: deltaG(dH * 1000, dS, Ti) / 1000 })),
        color: c.accent,
        width: 3,
      },
    ],
    [dH, dS, c],
  )

  // ΔG < 0인 온도 구간을 음영으로 표시
  const spontaneousArea = useMemo(() => {
    switch (quadrant) {
      case 'always':
        return [{ x1: T_MIN, x2: T_MAX }]
      case 'never':
        return []
      case 'highT':
        return Tstar !== null && Tstar < T_MAX ? [{ x1: Math.max(Tstar, T_MIN), x2: T_MAX }] : []
      case 'lowT':
        return Tstar !== null && Tstar > T_MIN ? [{ x1: T_MIN, x2: Math.min(Tstar, T_MAX) }] : []
    }
  }, [quadrant, Tstar])

  const tone =
    state === 'spontaneous'
      ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300'
      : state === 'nonspontaneous'
        ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300'
        : 'border-slate-300 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'

  return (
    <SectionShell
      title="깁스 자유에너지"
      concept={
        <>
          <p>
            제2법칙은 &ldquo;우주의 엔트로피가 증가하는 방향&rdquo;으로 과정이 일어난다고 말하지만, 매번 주위까지 계산하기는
            번거롭습니다. 온도와 압력이 일정할 때는 계의 성질만으로 판단할 수 있는 <strong>깁스 자유에너지 G</strong>를
            씁니다.
          </p>
          <p>
            <Tex tex="\Delta G < 0" />이면 자발적, <Tex tex="\Delta G > 0" />이면 비자발적, <Tex tex="\Delta G = 0" />이면
            평형입니다. 에너지를 낮추려는 경향(ΔH)과 무질서해지려는 경향(TΔS)의 경쟁이며, 온도가 높을수록 엔트로피 항의
            영향이 커집니다.
          </p>
        </>
      }
      formulas={
        <>
          <FormulaBlock tex="G = H - TS" caption="정의" />
          <FormulaBlock tex="\Delta G = \Delta H - T\Delta S" caption="등온·등압 과정" highlight />
          <FormulaBlock tex="T^* = \frac{\Delta H}{\Delta S}" caption="ΔG의 부호가 바뀌는 온도" />
        </>
      }
      guide={[
        <>
          &ldquo;얼음이 녹음&rdquo; 예시에서 T를 273 K 위아래로 움직여 보세요. 0 °C를 경계로 자발성이 바뀝니다.
        </>,
        <>ΔH와 ΔS의 부호를 바꿔 가며 아래 2×2 표의 강조 칸이 어떻게 이동하는지 보세요.</>,
        <>ΔS를 0에 가깝게 하면 그래프가 수평에 가까워져 온도의 영향이 사라집니다.</>,
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <ControlPanel>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  setDH(p.dH)
                  setDS(p.dS)
                }}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                {p.name}
              </button>
            ))}
          </div>
          <ParameterSlider label={<><Tex tex="\Delta H" /></>} unit="kJ/mol" min={-900} max={900} step={0.1} value={dH} onChange={setDH} digits={1} />
          <ParameterSlider label={<><Tex tex="\Delta S" /></>} unit="J/(mol·K)" min={-400} max={400} step={0.1} value={dS} onChange={setDS} digits={1} />
          <ParameterSlider
            label={<>온도 <Tex tex="T" /></>}
            unit="K"
            min={T_MIN}
            max={T_MAX}
            step={1}
            value={T}
            onChange={setT}
            digits={0}
            secondary={`${fmt(kelvinToCelsius(T), 0)} °C`}
          />
          <div className={`rounded-lg border px-3 py-3 ${tone}`}>
            <div className="text-xs opacity-80">ΔG = ΔH − TΔS</div>
            <div className="text-2xl font-bold tabular-nums">
              {fmtSigned(dG, 2)} <span className="text-sm font-normal">kJ/mol</span>
            </div>
            <div className="mt-1 text-sm font-semibold">
              {state === 'spontaneous' ? '자발적 (ΔG < 0)' : state === 'nonspontaneous' ? '비자발적 (ΔG > 0)' : '평형 (ΔG = 0)'}
            </div>
          </div>
          <p className="text-xs text-slate-500">
            {Tstar !== null
              ? `T* = ΔH/ΔS = ${fmt(Tstar, 1)} K (${fmt(kelvinToCelsius(Tstar), 1)} °C)`
              : '양의 온도에서 ΔG의 부호가 바뀌지 않습니다.'}
          </p>
        </ControlPanel>

        <PlotPanel
          title="ΔG–T 그래프"
          height={340}
          footer="초록 음영: ΔG < 0 (자발적)인 온도 구간. 기울기는 −ΔS, T = 0에서의 절편은 ΔH입니다."
        >
          <XYChart
            series={series}
            xLabel="T [K]"
            yLabel="ΔG [kJ/mol]"
            xDomain={[0, T_MAX]}
            yDomain={['auto', 'auto']}
            hLines={[{ y: 0, color: c.axis }]}
            vLines={
              Tstar !== null && Tstar <= T_MAX
                ? [{ x: Tstar, color: c.warn, label: `T* = ${fmt(Tstar, 0)} K` }]
                : []
            }
            xAreas={spontaneousArea.map((a) => ({ ...a, color: c.energy }))}
            markers={[{ x: T, y: dG, color: state === 'spontaneous' ? c.energy : c.heat, label: '현재' }]}
          />
        </PlotPanel>
      </div>

      <PlotPanel title="ΔH와 ΔS 부호에 따른 자발성">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[22rem] border-separate border-spacing-1 text-center text-sm">
            <thead>
              <tr>
                <th className="w-24" />
                <th className="py-1 font-semibold">ΔS &lt; 0</th>
                <th className="py-1 font-semibold">ΔS &gt; 0</th>
              </tr>
            </thead>
            <tbody>
              {[
                { row: 'ΔH < 0', cells: [QUADRANTS[0], QUADRANTS[1]] },
                { row: 'ΔH > 0', cells: [QUADRANTS[2], QUADRANTS[3]] },
              ].map(({ row, cells }) => (
                <tr key={row}>
                  <th className="font-semibold">{row}</th>
                  {cells.map((cell) => {
                    const active = cell.q === quadrant
                    return (
                      <td
                        key={cell.q}
                        className={[
                          'rounded-lg border px-3 py-4 transition-colors',
                          active
                            ? 'border-indigo-500 bg-indigo-100 font-semibold text-indigo-900 ring-2 ring-indigo-400 dark:border-indigo-400 dark:bg-indigo-900/60 dark:text-indigo-100'
                            : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400',
                        ].join(' ')}
                      >
                        {cell.text}
                        <div className="mt-1 text-xs font-normal opacity-80">
                          {cell.q === 'lowT' && 'T < T* 에서 ΔG < 0'}
                          {cell.q === 'highT' && 'T > T* 에서 ΔG < 0'}
                          {cell.q === 'always' && '모든 T에서 ΔG < 0'}
                          {cell.q === 'never' && '모든 T에서 ΔG > 0'}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PlotPanel>
    </SectionShell>
  )
}
