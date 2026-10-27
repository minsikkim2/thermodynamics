import { useMemo, useState } from 'react'
import { ConceptCard } from '../../../../components/ConceptCard'
import { FormulaBlock } from '../../../../components/FormulaBlock'
import { ObservationGuide } from '../../../../components/ObservationGuide'
import { ParameterSlider } from '../../../../components/ParameterSlider'
import { PlotPanel } from '../../../../components/PlotPanel'
import { ValueReadout } from '../../../../components/ValueReadout'
import { XYChart } from '../../../../components/XYChart'
import { useChartTheme } from '../../../../hooks/useChartTheme'
import { fmt } from '../../../../lib/format'
import { debyeCurve, debyeEntropy } from '../../../../physics/laws'

const T_MAX = 300
const PRESETS = [
  { name: '납', theta: 105 },
  { name: '구리', theta: 343 },
  { name: '알루미늄', theta: 428 },
]

export function ThirdLaw() {
  const c = useChartTheme()
  const [theta, setTheta] = useState(343)
  const [T, setT] = useState(50)

  const curve = useMemo(() => debyeCurve(theta, T_MAX), [theta])
  const series = useMemo(
    () => [
      { name: 'S (엔트로피)', data: curve.map((p) => ({ x: p.T, y: p.S })), color: c.accent, width: 3 },
      { name: 'C_v (열용량)', data: curve.map((p) => ({ x: p.T, y: p.Cv })), color: c.warn, dashed: true },
    ],
    [curve, c],
  )
  const S = debyeEntropy(T, theta)

  return (
    <ConceptCard title="제3법칙 — 절대영도의 엔트로피">
      <p>
        완전한 결정의 엔트로피는 절대영도(0 K)에서 0이 됩니다. 0 K에 다가가면 원자들이 가장 낮은 에너지 상태 하나에만
        있어 가능한 배치가 하나(Ω = 1)뿐이기 때문입니다. 또 유한한 단계로는 0 K에 도달할 수 없습니다.
      </p>
      <p>
        아래는 결정의 격자 진동을 다루는 <strong>데바이 모형</strong>으로 계산한 1 mol 고체의 엔트로피입니다. 낮은
        온도에서 <span className="whitespace-nowrap">S ∝ T³</span>로 0에 수렴합니다.
      </p>
      <FormulaBlock
        tex="\lim_{T\to 0} S = 0,\qquad S(T) = \int_0^T \frac{C_v}{T'}\,dT' \;\approx\; \frac{4\pi^4}{5}R\left(\frac{T}{\Theta_D}\right)^3 \;\;(T \ll \Theta_D)"
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <PlotPanel title="엔트로피와 열용량 (1 mol)" height={280}>
          <XYChart
            series={series}
            xLabel="T [K]"
            yLabel="S, C_v [J/K]"
            xDomain={[0, T_MAX]}
            markers={[{ x: T, y: S, color: c.accent }]}
            legend
          />
        </PlotPanel>
        <div className="space-y-4">
          <ParameterSlider label="데바이 온도 Θ_D" unit="K" min={80} max={600} step={1} value={theta} onChange={setTheta} digits={0} />
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setTheta(p.theta)}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                {p.name} ({p.theta} K)
              </button>
            ))}
          </div>
          <ParameterSlider label="온도 T" unit="K" min={1} max={T_MAX} step={1} value={T} onChange={setT} digits={0} />
          <ValueReadout label={`S(${fmt(T, 0)} K)`} value={fmt(S, 3)} unit="J/K" tone="default" />
        </div>
      </div>
      <ObservationGuide
        items={[
          <>T를 1 K까지 내려 보세요. 엔트로피가 거의 0이 됩니다.</>,
          <>데바이 온도가 낮은(무른) 납은 같은 온도에서 엔트로피가 더 큽니다. 원자가 더 쉽게 진동하기 때문입니다.</>,
        ]}
      />
    </ConceptCard>
  )
}
