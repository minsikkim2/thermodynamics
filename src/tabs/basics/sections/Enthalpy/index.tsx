import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { FormulaBlock, Tex } from '../../../../components/FormulaBlock'
import { ParameterSlider } from '../../../../components/ParameterSlider'
import { PlotPanel } from '../../../../components/PlotPanel'
import { ControlPanel, SectionShell } from '../../../../components/SectionShell'
import { SegmentedControl } from '../../../../components/SegmentedControl'
import { ValueReadout } from '../../../../components/ValueReadout'
import { tooltipStyle, useChartTheme } from '../../../../hooks/useChartTheme'
import { fmt, jToKJ } from '../../../../lib/format'
import {
  REACTION_EXAMPLES,
  isobaricHeating,
  isochoricHeating,
  temperatureRise,
} from '../../../../physics/enthalpy'
import { molarCp, molarCv, type DegreesOfFreedom } from '../../../../physics/internalEnergy'
import { ReactionDiagram } from './ReactionDiagram'

export default function Enthalpy() {
  const c = useChartTheme()
  const [f, setF] = useState<DegreesOfFreedom>(3)
  const [n, setN] = useState(1)
  const [dT, setDT] = useState(100)
  const [Qsame, setQsame] = useState(2000)
  const [reactionId, setReactionId] = useState(REACTION_EXAMPLES[0].id)
  const reaction = REACTION_EXAMPLES.find((r) => r.id === reactionId) ?? REACTION_EXAMPLES[0]

  const v = isochoricHeating(f, n, dT)
  const p = isobaricHeating(f, n, dT)
  const data = useMemo(
    () => [
      { name: '등적 가열', ΔU: jToKJ(v.dU), PΔV: jToKJ(v.W), Q: jToKJ(v.Q) },
      { name: '등압 가열', ΔU: jToKJ(p.dU), PΔV: jToKJ(p.W), Q: jToKJ(p.Q) },
    ],
    [v.dU, v.W, v.Q, p.dU, p.W, p.Q],
  )

  const Cv = molarCv(f)
  const Cp = molarCp(f)
  const dTv = temperatureRise(Qsame, n, Cv)
  const dTp = temperatureRise(Qsame, n, Cp)

  return (
    <SectionShell
      title="엔탈피"
      concept={
        <>
          <p>
            실험실이나 생활 속 과정은 대부분 대기압, 즉 <strong>일정한 압력</strong>에서 일어납니다. 이때 계에 준 열은
            내부에너지만 올리는 것이 아니라, 기체가 팽창하며 대기를 밀어내는 일 <Tex tex="P\Delta V" />에도 쓰입니다.
          </p>
          <p>
            이 둘을 묶은 상태함수가 <strong>엔탈피 H</strong>입니다. 등압 과정에서 출입한 열은 정확히 엔탈피 변화와
            같습니다(<Tex tex="Q_p = \Delta H" />). 그래서 같은 온도를 올리는 데 등압 가열이 열이 더 많이 들고,{' '}
            <Tex tex="C_p > C_v" />입니다.
          </p>
        </>
      }
      formulas={
        <>
          <FormulaBlock tex="H = U + PV" caption="엔탈피의 정의" highlight />
          <FormulaBlock tex="\Delta H = nC_p\Delta T = \Delta U + P\Delta V" caption="이상기체 등압 과정" />
          <FormulaBlock tex="C_p = C_v + R" caption="마이어 관계식" />
        </>
      }
      guide={[
        <>막대에서 두 경우의 초록색(ΔU)은 길이가 같습니다. 같은 ΔT면 내부에너지 변화도 같기 때문입니다.</>,
        <>단원자 → 이원자로 바꿔 보세요. ΔU는 커지지만 파란색(PΔV = nRΔT)은 그대로입니다.</>,
        <>
          반응을 바꿔 보세요. 메테인 연소처럼 <Tex tex="\Delta H < 0" />이면 생성물이 더 낮은 준위에 있습니다.
        </>,
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <ControlPanel>
          <SegmentedControl
            ariaLabel="기체 종류"
            value={f}
            onChange={setF}
            options={[
              { value: 3, label: '단원자 f = 3' },
              { value: 5, label: '이원자 f = 5' },
            ]}
          />
          <ParameterSlider label={<>물질의 양 <Tex tex="n" /></>} unit="mol" min={0.2} max={5} step={0.1} value={n} onChange={setN} digits={1} />
          <ParameterSlider label={<>온도 변화 <Tex tex="\Delta T" /></>} unit="K" min={10} max={500} step={10} value={dT} onChange={setDT} digits={0} />
          <div className="grid grid-cols-2 gap-2">
            <ValueReadout label="C_v" value={fmt(Cv, 2)} unit="J/(mol·K)" />
            <ValueReadout label="C_p" value={fmt(Cp, 2)} unit="J/(mol·K)" />
          </div>
          <ValueReadout label="ΔH = nC_pΔT" value={fmt(jToKJ(p.Q), 3)} unit="kJ" tone="heat" />
        </ControlPanel>

        <PlotPanel
          title="공급한 열은 어디로 가는가? (같은 ΔT)"
          height={300}
          footer="등압 가열에서는 공급한 열 중 일부가 팽창하는 일(PΔV)로 빠져나가므로, 같은 ΔT를 얻으려면 더 많은 열이 필요합니다."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 24, right: 16, bottom: 4, left: 8 }}>
              <CartesianGrid stroke={c.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke={c.axis} tick={{ fill: c.text, fontSize: 13 }} />
              <YAxis
                stroke={c.axis}
                tick={{ fill: c.axis, fontSize: 11 }}
                tickFormatter={(x: number) => fmt(x, 1)}
                label={{ value: 'Q [kJ]', angle: -90, position: 'insideLeft', fill: c.axis, fontSize: 12 }}
              />
              <Tooltip {...tooltipStyle(c)} formatter={(x) => `${fmt(Number(x), 3)} kJ`} cursor={{ fill: c.grid, opacity: 0.4 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} verticalAlign="top" height={24} />
              <Bar dataKey="ΔU" name="ΔU (내부에너지 증가)" stackId="q" fill={c.energy} isAnimationActive={false} />
              <Bar dataKey="PΔV" name="PΔV (팽창 일)" stackId="q" fill={c.work} isAnimationActive={false}>
                <LabelList
                  dataKey="Q"
                  position="top"
                  formatter={(x: unknown) => `Q = ${fmt(Number(x), 2)} kJ`}
                  style={{ fill: c.text, fontSize: 12, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </PlotPanel>
      </div>

      <PlotPanel title="같은 열을 주면 온도는 얼마나 오를까?">
        <div className="grid items-center gap-4 md:grid-cols-[18rem_minmax(0,1fr)]">
          <ParameterSlider label="공급한 열 Q" unit="J" min={100} max={10000} step={100} value={Qsame} onChange={setQsame} digits={0} />
          <div className="grid grid-cols-2 gap-2">
            <ValueReadout label="등적 가열 ΔT = Q / (nC_v)" value={fmt(dTv, 1)} unit="K" tone="energy" />
            <ValueReadout label="등압 가열 ΔT = Q / (nC_p)" value={fmt(dTp, 1)} unit="K" tone="work" />
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          비율 ΔT_v / ΔT_p = C_p / C_v = γ = {fmt(Cp / Cv, 3)}
        </p>
      </PlotPanel>

      <PlotPanel
        title="반응 엔탈피 (298 K, 1 bar)"
        actions={
          <select
            aria-label="반응 선택"
            value={reactionId}
            onChange={(e) => setReactionId(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {REACTION_EXAMPLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        }
        footer="준위 간격은 ΔH 크기에 비례하도록 그렸습니다(작은 값은 보이도록 최소 간격 적용). 점선 경로는 개략적인 표시입니다."
      >
        <div className="text-center">
          <Tex tex={`${reaction.equation}`} display />
        </div>
        <div className="mx-auto max-w-xl">
          <ReactionDiagram reaction={reaction} />
        </div>
      </PlotPanel>
    </SectionShell>
  )
}
