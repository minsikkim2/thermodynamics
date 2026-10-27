import { useMemo, useState } from 'react'
import { EnergyBars } from '../../../../components/EnergyBars'
import { FormulaBlock, Tex } from '../../../../components/FormulaBlock'
import { ParameterSlider } from '../../../../components/ParameterSlider'
import { PlotPanel } from '../../../../components/PlotPanel'
import { ControlPanel, SectionShell, SignConventionNote } from '../../../../components/SectionShell'
import { SegmentedControl } from '../../../../components/SegmentedControl'
import { ValueReadout } from '../../../../components/ValueReadout'
import { useChartTheme } from '../../../../hooks/useChartTheme'
import { fmt, fmtSigned, jToKJ, litersToM3, m3ToLiters, paToKPa } from '../../../../lib/format'
import { kelvinToCelsius } from '../../../../physics/constants'
import { isotherm } from '../../../../physics/idealGas'
import type { DegreesOfFreedom } from '../../../../physics/internalEnergy'
import { computeProcess, type ProcessKind } from '../../../../physics/processes'
import { PVDiagram } from './PVDiagram'

const V_MIN = 2
const V_MAX = 40
const T_MIN = 100
const T_MAX = 1000
const N_MAX = 3

const PROCESS_INFO: Record<ProcessKind, { label: string; tex: string; caption: string }> = {
  isothermal: {
    label: '등온',
    tex: 'W = nRT\\ln\\frac{V_2}{V_1},\\quad \\Delta U = 0,\\quad Q = W',
    caption: '온도 일정: 흡수한 열이 모두 일로 나간다',
  },
  isobaric: {
    label: '등압',
    tex: 'W = P\\Delta V,\\quad Q = nC_p\\Delta T',
    caption: '압력 일정',
  },
  isochoric: {
    label: '등적',
    tex: 'W = 0,\\quad Q = \\Delta U = nC_v\\Delta T',
    caption: '부피 일정: 일을 하지 않는다',
  },
  adiabatic: {
    label: '단열',
    tex: 'PV^{\\gamma} = \\text{일정},\\quad W = \\frac{P_1V_1 - P_2V_2}{\\gamma - 1},\\quad Q = 0',
    caption: '열 출입 없음: 일을 한 만큼 내부에너지가 줄어든다',
  },
}

export default function HeatWork() {
  const c = useChartTheme()
  const [kind, setKind] = useState<ProcessKind>('isothermal')
  const [f, setF] = useState<DegreesOfFreedom>(3)
  const [n, setN] = useState(1)
  const [V1, setV1] = useState(10)
  const [T1, setT1] = useState(300)
  const [V2, setV2] = useState(25)
  const [T2, setT2] = useState(600)

  const result = useMemo(
    () => computeProcess({ kind, f, n, V1: litersToM3(V1), T1, V2: litersToM3(V2), T2 }),
    [kind, f, n, V1, T1, V2, T2],
  )

  const path = result.path.map((p) => ({ V: m3ToLiters(p.V), P: paToKPa(p.P) }))
  const pMax = Math.max(...path.map((p) => p.P)) * 1.3
  const guides = useMemo(
    () =>
      kind === 'isothermal'
        ? []
        : [
            {
              label: 'T₁ 등온선',
              points: isotherm(n, T1, litersToM3(V_MIN), litersToM3(V_MAX)).map((p) => ({
                V: m3ToLiters(p.x),
                P: paToKPa(p.y),
              })),
            },
          ],
    [kind, n, T1],
  )

  const Q = jToKJ(result.Q)
  const W = jToKJ(result.W)
  const dU = jToKJ(result.dU)

  return (
    <SectionShell
      title="열과 일"
      concept={
        <>
          <p>
            계와 주위가 에너지를 주고받는 방법은 두 가지입니다. 온도 차 때문에 이동하는 <strong>열 Q</strong>와, 피스톤을
            밀어내는 것처럼 힘이 작용해 전달되는 <strong>일 W</strong>입니다.
          </p>
          <p>
            기체가 피스톤을 밀며 팽창할 때 한 일은 <Tex tex="W = \int P\,dV" />로, P-V 선도에서{' '}
            <strong>곡선 아래 면적</strong>과 같습니다. 같은 시작·끝 부피라도 경로(과정)가 다르면 면적, 즉 일이 달라집니다.
            그래서 Q와 W는 경로 함수이고, ΔU는 상태 함수입니다.
          </p>
        </>
      }
      formulas={
        <>
          <FormulaBlock tex="\Delta U = Q - W" caption="열역학 제1법칙 (W: 계가 외부에 한 일)" highlight />
          {(Object.keys(PROCESS_INFO) as ProcessKind[]).map((k) => (
            <FormulaBlock
              key={k}
              tex={`\\text{${PROCESS_INFO[k].label}: }${PROCESS_INFO[k].tex}`}
              highlight={k === kind}
            />
          ))}
        </>
      }
      guide={[
        <>
          등온에서 V₂를 V₁보다 작게 만들어 보세요(압축). 면적 색이 바뀌고 W &lt; 0, Q &lt; 0이 됩니다. 외부가 계에 일을
          해 준 만큼 열이 빠져나갑니다.
        </>,
        <>
          같은 V₁ → V₂로 등온과 단열을 번갈아 선택해 보세요. 단열 곡선이 더 가파르게 떨어져 면적(W)이 더 작습니다.
        </>,
        <>어떤 과정을 고르든 오른쪽 막대에서 ΔU = Q − W가 항상 성립하는지 확인해 보세요.</>,
      ]}
    >
      <SignConventionNote />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <PlotPanel
          title="P-V 선도"
          actions={
            <SegmentedControl
              ariaLabel="과정"
              value={kind}
              onChange={setKind}
              options={(Object.keys(PROCESS_INFO) as ProcessKind[]).map((k) => ({
                value: k,
                label: PROCESS_INFO[k].label,
              }))}
            />
          }
          footer={
            <>
              색칠된 면적 = 계가 한 일 W. {PROCESS_INFO[kind].caption}.
              {kind !== 'isothermal' && ' 점선은 시작 온도 T₁의 등온선입니다.'}
            </>
          }
        >
          <PVDiagram path={path} W={result.W} guides={guides} vMax={V_MAX + 2} pMax={pMax} />
        </PlotPanel>

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
          <ParameterSlider label={<>물질의 양 <Tex tex="n" /></>} unit="mol" min={0.2} max={N_MAX} step={0.1} value={n} onChange={setN} digits={1} />
          <ParameterSlider label={<>시작 부피 <Tex tex="V_1" /></>} unit="L" min={V_MIN} max={V_MAX} step={0.5} value={V1} onChange={setV1} digits={1} />
          <ParameterSlider
            label={<>시작 온도 <Tex tex="T_1" /></>}
            unit="K"
            min={T_MIN}
            max={T_MAX}
            step={10}
            value={T1}
            onChange={setT1}
            digits={0}
            secondary={`${fmt(kelvinToCelsius(T1), 0)} °C`}
          />
          {kind === 'isochoric' ? (
            <ParameterSlider
              label={<>끝 온도 <Tex tex="T_2" /></>}
              unit="K"
              min={T_MIN}
              max={T_MAX}
              step={10}
              value={T2}
              onChange={setT2}
              digits={0}
              secondary={`${fmt(kelvinToCelsius(T2), 0)} °C`}
            />
          ) : (
            <ParameterSlider label={<>끝 부피 <Tex tex="V_2" /></>} unit="L" min={V_MIN} max={V_MAX} step={0.5} value={V2} onChange={setV2} digits={1} />
          )}
          <div className="grid grid-cols-2 gap-2">
            <ValueReadout label="끝 온도 T₂" value={fmt(result.end.T, 0)} unit="K" />
            <ValueReadout label="끝 압력 P₂" value={fmt(paToKPa(result.end.P), 0)} unit="kPa" />
          </div>
        </ControlPanel>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
        <PlotPanel title="에너지 수지: Q, W, ΔU" height={240}>
          <EnergyBars
            unit="kJ"
            bars={[
              { name: 'Q (열)', value: Q, color: c.heat },
              { name: 'W (일)', value: W, color: c.work },
              { name: 'ΔU', value: dU, color: c.energy },
            ]}
          />
        </PlotPanel>
        <div className="flex flex-col justify-center gap-2">
          <ValueReadout label="ΔU" value={fmtSigned(dU, 3)} unit="kJ" tone="energy" />
          <ValueReadout label="Q − W" value={fmtSigned(Q - W, 3)} unit="kJ" tone="energy" />
          {Math.abs(dU - (Q - W)) < 1e-9 && (
            <p className="rounded-md bg-green-50 px-3 py-2 text-center text-sm font-medium text-green-800 dark:bg-green-950/40 dark:text-green-300">
              ΔU = Q − W 성립 ✓
            </p>
          )}
        </div>
      </div>
    </SectionShell>
  )
}
