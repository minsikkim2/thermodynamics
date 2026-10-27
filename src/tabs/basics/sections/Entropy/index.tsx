import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { EnergyBars } from '../../../../components/EnergyBars'
import { FormulaBlock, Tex } from '../../../../components/FormulaBlock'
import { ParameterSlider } from '../../../../components/ParameterSlider'
import { PlotPanel } from '../../../../components/PlotPanel'
import { ControlPanel, SectionShell } from '../../../../components/SectionShell'
import { SegmentedControl } from '../../../../components/SegmentedControl'
import { ValueReadout } from '../../../../components/ValueReadout'
import { tooltipStyle, useChartTheme } from '../../../../hooks/useChartTheme'
import { fmt, fmtSigned, litersToM3 } from '../../../../lib/format'
import { expansionEntropy, idealGasEntropyChange, type ExpansionKind } from '../../../../physics/entropy'
import type { DegreesOfFreedom } from '../../../../physics/internalEnergy'
import { DiffusionSim } from './DiffusionSim'

const EXPANSIONS: { kind: ExpansionKind; label: string }[] = [
  { kind: 'reversible', label: '가역 등온 팽창' },
  { kind: 'irreversible', label: '비가역 팽창 (P_ext = P₂)' },
  { kind: 'free', label: '자유 팽창 (진공)' },
]

export default function Entropy() {
  const c = useChartTheme()
  // 거시적
  const [f, setF] = useState<DegreesOfFreedom>(3)
  const [n, setN] = useState(1)
  const [T1, setT1] = useState(300)
  const [T2, setT2] = useState(450)
  const [V1, setV1] = useState(10)
  const [V2, setV2] = useState(20)
  // 우주
  const [ratio, setRatio] = useState(2)
  const [Tu, setTu] = useState(300)

  const dS = idealGasEntropyChange(f, n, T1, T2, litersToM3(V1), litersToM3(V2))

  const universe = useMemo(
    () =>
      EXPANSIONS.map(({ kind, label }) => {
        const r = expansionEntropy(kind, 1, Tu, 1, ratio)
        return { name: label, 계: r.system, 주위: r.surroundings, 우주: r.universe }
      }),
    [ratio, Tu],
  )

  return (
    <SectionShell
      title="엔트로피"
      concept={
        <>
          <p>
            <strong>엔트로피 S</strong>는 거시적으로는 가역 과정에서 받은 열을 온도로 나눈 양(<Tex tex="dS = \delta Q_{rev}/T" />)이고,
            미시적으로는 같은 거시 상태를 만드는 <strong>미시적 배치의 수 Ω</strong>의 로그입니다.
          </p>
          <p>
            고립계에서는 경우의 수가 더 많은 상태가 압도적으로 일어나기 쉬우므로 엔트로피는 증가하는 방향으로 변합니다.
            이것이 제2법칙의 통계적 의미입니다.
          </p>
        </>
      }
      formulas={
        <>
          <FormulaBlock tex="\Delta S = nC_v\ln\frac{T_2}{T_1} + nR\ln\frac{V_2}{V_1}" caption="이상기체 (거시적)" highlight />
          <FormulaBlock tex="S = k_B \ln \Omega" caption="볼츠만 (미시적)" highlight />
          <FormulaBlock tex="\Delta S_{\text{우주}} = \Delta S_{\text{계}} + \Delta S_{\text{주위}} \ge 0" caption="등호는 가역 과정" />
        </>
      }
      guide={[
        <>T₂ = T₁, V₂ = V₁로 맞춰 보세요. 처음과 끝 상태가 같으면 ΔS = 0입니다 (상태함수).</>,
        <>입자 수 N을 크게 하고 칸막이를 제거해 보세요. 분포가 좁아지고, 모두 한쪽으로 돌아갈 확률은 사실상 0이 됩니다.</>,
        <>우주의 엔트로피 그래프에서 계의 ΔS는 세 과정 모두 같지만, 우주 전체는 가역 과정에서만 0입니다.</>,
      ]}
    >
      <h2 className="text-lg font-semibold">① 거시적 엔트로피 변화</h2>
      <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <ControlPanel>
          <SegmentedControl
            ariaLabel="기체 종류"
            value={f}
            onChange={setF}
            options={[
              { value: 3, label: '단원자' },
              { value: 5, label: '이원자' },
            ]}
          />
          <ParameterSlider label={<>물질의 양 <Tex tex="n" /></>} unit="mol" min={0.2} max={5} step={0.1} value={n} onChange={setN} digits={1} />
          <ParameterSlider label={<><Tex tex="T_1" /></>} unit="K" min={50} max={1000} step={10} value={T1} onChange={setT1} digits={0} />
          <ParameterSlider label={<><Tex tex="T_2" /></>} unit="K" min={50} max={1000} step={10} value={T2} onChange={setT2} digits={0} />
          <ParameterSlider label={<><Tex tex="V_1" /></>} unit="L" min={1} max={50} step={1} value={V1} onChange={setV1} digits={0} />
          <ParameterSlider label={<><Tex tex="V_2" /></>} unit="L" min={1} max={50} step={1} value={V2} onChange={setV2} digits={0} />
        </ControlPanel>
        <div className="space-y-4">
          <PlotPanel title="ΔS의 구성: 온도 항 + 부피 항" height={240}>
            <EnergyBars
              unit="J/K"
              digits={3}
              bars={[
                { name: 'nC_v ln(T₂/T₁)', value: dS.thermal, color: c.heat },
                { name: 'nR ln(V₂/V₁)', value: dS.volumetric, color: c.work },
                { name: 'ΔS', value: dS.total, color: c.accent },
              ]}
            />
          </PlotPanel>
          <ValueReadout
            label="계의 엔트로피 변화 ΔS"
            value={fmtSigned(dS.total, 3)}
            unit="J/K"
            tone={dS.total >= 0 ? 'good' : 'bad'}
            sub="온도가 오르거나 부피가 커지면(분자가 놓일 수 있는 상태가 많아지면) 엔트로피가 증가"
          />
        </div>
      </div>

      <h2 className="text-lg font-semibold">② 미시적 엔트로피: 칸막이를 없애면</h2>
      <DiffusionSim />

      <h2 className="text-lg font-semibold">③ 가역 과정 vs 비가역 과정: 우주의 엔트로피</h2>
      <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <ControlPanel>
          <p className="text-xs text-slate-500">이상기체 1 mol이 온도 T에서 V₁ → V₂로 팽창</p>
          <ParameterSlider label="부피비 V₂/V₁" min={1.1} max={5} step={0.1} value={ratio} onChange={setRatio} digits={1} />
          <ParameterSlider label="온도 T" unit="K" min={100} max={1000} step={10} value={Tu} onChange={setTu} digits={0} />
          <p className="text-xs leading-relaxed text-slate-500">
            ΔS_계 = nR ln(V₂/V₁)는 세 과정에서 같습니다. 차이는 주위와 주고받은 열: ΔS_주위 = −Q/T.
          </p>
        </ControlPanel>
        <PlotPanel title="엔트로피 변화 비교 [J/K]" height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={universe} margin={{ top: 8, right: 12, bottom: 4, left: 8 }}>
              <CartesianGrid stroke={c.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke={c.axis} tick={{ fill: c.text, fontSize: 11 }} interval={0} />
              <YAxis stroke={c.axis} tick={{ fill: c.axis, fontSize: 11 }} tickFormatter={(v: number) => fmt(v, 1)} width={48} />
              <Tooltip {...tooltipStyle(c)} formatter={(v) => `${fmt(Number(v), 3)} J/K`} cursor={{ fill: c.grid, opacity: 0.4 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} verticalAlign="top" height={24} />
              <ReferenceLine y={0} stroke={c.axis} />
              <Bar dataKey="계" name="ΔS_계" fill={c.series[0]} isAnimationActive={false} />
              <Bar dataKey="주위" name="ΔS_주위" fill={c.warn} isAnimationActive={false} />
              <Bar dataKey="우주" name="ΔS_우주" fill={c.accent} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </PlotPanel>
      </div>
    </SectionShell>
  )
}
