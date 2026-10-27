import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { FormulaBlock, Tex } from '../../../../components/FormulaBlock'
import { ParameterSlider } from '../../../../components/ParameterSlider'
import { PlotPanel } from '../../../../components/PlotPanel'
import { ControlPanel, SectionShell } from '../../../../components/SectionShell'
import { SegmentedControl } from '../../../../components/SegmentedControl'
import { ValueReadout } from '../../../../components/ValueReadout'
import { tooltipStyle, useChartTheme } from '../../../../hooks/useChartTheme'
import { fmt, litersToM3 } from '../../../../lib/format'
import type { DegreesOfFreedom } from '../../../../physics/internalEnergy'
import { REAL_CYCLES } from '../../../../physics/cycles/realCycles'
import { CycleLegTable } from '../../shared/CycleLegTable'
import { CycleViewer } from '../../shared/CycleViewer'
import { legColor } from '../../shared/legStyle'

/** 흡기 압력: 대기압 [Pa] */
const P_ATM = 101_325
/** 실린더 최대 부피 (배기량 수준) [L] */
const V_MAX_L = 0.5

export default function RealCycles() {
  const c = useChartTheme()
  const [cycleId, setCycleId] = useState(REAL_CYCLES[0].id)
  const [f, setF] = useState<DegreesOfFreedom>(5)
  const [r, setR] = useState(8)
  const [Tmin, setTmin] = useState(300)
  const [Tmax, setTmax] = useState(1800)

  const results = useMemo(() => {
    const input = { f, P1: P_ATM, Tmin, Tmax, Vmax: litersToM3(V_MAX_L), r }
    return REAL_CYCLES.map((def) => ({ def, res: def.build(input) }))
  }, [f, r, Tmin, Tmax])
  const { def, res } = results.find((x) => x.def.id === cycleId) ?? results[0]
  const etaCarnot = res.carnotEfficiency
  const colors = res.legs.map((l) => legColor(l, c, Tmax))

  const bars = [
    ...results.map((x, i) => ({
      id: x.def.id,
      name: x.def.name,
      eta: x.res.valid ? x.res.efficiency * 100 : 0,
      valid: x.res.valid,
      color: c.series[i % c.series.length],
    })),
    { id: 'carnot', name: '카르노 (같은 T_min·T_max)', eta: etaCarnot * 100, valid: true, color: c.energy },
  ]

  return (
    <SectionShell
      title="실제 사이클과 비교"
      concept={
        <>
          <p>
            실제 엔진은 카르노 사이클처럼 열원과 같은 온도에서 천천히 열을 주고받지 않습니다. 연료가 순간적으로 타며 온도가
            크게 오르는 동안 열이 들어오고, 뜨거운 배기가스를 버리며 열이 나갑니다. 이 과정을 이상기체로 단순화한 것이{' '}
            <strong>공기 표준 사이클</strong>입니다.
          </p>
          <p>
            열이 들어오고 나가는 온도가 최고·최저 온도보다 낮거나 높은 구간에 걸쳐 있으므로, 같은 온도 범위에서는 항상 카르노
            효율보다 낮습니다. 엔진 효율은 주로 <strong>압축비 r</strong>로 정해집니다.
          </p>
        </>
      }
      formulas={
        <>
          {REAL_CYCLES.map((d) => (
            <FormulaBlock key={d.id} tex={d.efficiencyTex} caption={d.name} highlight={d.id === cycleId} />
          ))}
          <FormulaBlock tex="r = \frac{V_{max}}{V_{min}},\qquad \eta_{\text{Carnot}} = 1 - \frac{T_{min}}{T_{max}}" />
        </>
      }
      guide={[
        <>압축비 r을 높여 보세요. 오토·디젤 모두 효율이 올라갑니다. 하지만 오토는 너무 높이면 노킹(자연 발화) 때문에 실제로는 r ≈ 8~12에 머뭅니다.</>,
        <>같은 r에서 오토가 디젤보다 효율이 높습니다. 디젤 엔진이 실제로 더 효율적인 이유는 r을 15~22로 훨씬 높게 쓸 수 있기 때문입니다.</>,
        <>
          <Tex tex="T_{max}" />를 올려도 오토 효율은 변하지 않지만(r만의 함수) 카르노 효율은 올라가 둘의 차이가 벌어집니다.
        </>,
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <ControlPanel>
          <SegmentedControl
            ariaLabel="사이클"
            value={cycleId}
            onChange={setCycleId}
            options={REAL_CYCLES.map((d) => ({ value: d.id, label: d.name }))}
          />
          <SegmentedControl
            ariaLabel="기체 종류"
            value={f}
            onChange={setF}
            options={[
              { value: 5, label: '공기(이원자)' },
              { value: 3, label: '단원자' },
            ]}
          />
          <ParameterSlider label={<>압축비 <Tex tex="r" /></>} min={2} max={25} step={0.5} value={r} onChange={setR} digits={1} />
          <ParameterSlider label={<>최저 온도 <Tex tex="T_{min}" /> (흡기)</>} unit="K" min={250} max={400} step={5} value={Tmin} onChange={setTmin} digits={0} />
          <ParameterSlider label={<>최고 온도 <Tex tex="T_{max}" /> (연소)</>} unit="K" min={1000} max={3000} step={50} value={Tmax} onChange={setTmax} digits={0} />
          <p className="text-xs text-slate-500">
            흡기: {V_MAX_L} L, 1 atm, n = {fmt(res.n * 1000, 2)} mmol
          </p>
        </ControlPanel>
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">{def.description}</p>
          {res.valid ? (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <ValueReadout label="들어온 열 Q_in" value={fmt(res.Qin, 1)} unit="J" tone="heat" />
                <ValueReadout label="버린 열 Q_out" value={fmt(res.Qout, 1)} unit="J" tone="work" />
                <ValueReadout label="순일 W_net" value={fmt(res.Wnet, 1)} unit="J" tone="energy" />
                <ValueReadout label="η = W_net / Q_in" value={fmt(res.efficiency * 100, 2)} unit="%" sub={`공식: ${fmt(res.formulaEfficiency * 100, 2)} %`} />
                <ValueReadout label="카르노 효율" value={fmt(etaCarnot * 100, 2)} unit="%" />
                {res.extras.map((e) => (
                  <ValueReadout key={e.label} label={e.label} value={fmt(e.value, 2)} unit={e.unit} />
                ))}
              </div>
            </>
          ) : (
            <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              이 조건에서는 {def.name}을 만들 수 없습니다. {res.message}
            </p>
          )}
          <PlotPanel
            title="같은 최고·최저 온도에서의 효율"
            height={240}
            footer="랭킨 사이클(증기 동력)은 수증기 물성표가 필요해 이후 추가할 예정입니다."
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars} margin={{ top: 20, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid stroke={c.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke={c.axis} tick={{ fill: c.text, fontSize: 11 }} interval={0} />
                <YAxis stroke={c.axis} tick={{ fill: c.axis, fontSize: 11 }} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} width={44} />
                <Tooltip {...tooltipStyle(c)} formatter={(v) => `${fmt(Number(v), 2)} %`} cursor={{ fill: c.grid, opacity: 0.4 }} />
                <Bar dataKey="eta" isAnimationActive={false} radius={[3, 3, 0, 0]}>
                  {bars.map((b) => (
                    <Cell key={b.id} fill={b.color} fillOpacity={b.id === cycleId || b.id === 'carnot' ? 1 : 0.45} />
                  ))}
                  <LabelList
                    dataKey="eta"
                    position="top"
                    formatter={(v: unknown) => (Number(v) > 0 ? `${fmt(Number(v), 1)}%` : '불가')}
                    style={{ fill: c.text, fontSize: 12 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </PlotPanel>
        </div>
      </div>

      {res.valid && (
        <>
          <CycleViewer key={cycleId} legs={res.legs} Th={Tmax} areaLabel="W_net" areaColor={c.energy} />
          <PlotPanel title="단계별 에너지와 엔트로피">
            <CycleLegTable legs={res.legs} colors={colors} />
          </PlotPanel>
        </>
      )}
    </SectionShell>
  )
}
