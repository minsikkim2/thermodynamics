import { useMemo, useState } from 'react'
import { FormulaBlock, Tex } from '../../../../components/FormulaBlock'
import { PlotPanel } from '../../../../components/PlotPanel'
import { SectionShell, SignConventionNote } from '../../../../components/SectionShell'
import { ValueReadout } from '../../../../components/ValueReadout'
import { useChartTheme } from '../../../../hooks/useChartTheme'
import { fmt, litersToM3 } from '../../../../lib/format'
import { carnotCycle } from '../../../../physics/cycles/carnot'
import { CarnotControls } from '../../shared/CarnotControls'
import { DEFAULT_CARNOT, type CarnotParams } from '../../shared/carnotParams'
import { CycleLegTable } from '../../shared/CycleLegTable'
import { CycleViewer } from '../../shared/CycleViewer'
import { legColor } from '../../shared/legStyle'

export default function Carnot() {
  const c = useChartTheme()
  const [params, setParams] = useState<CarnotParams>(DEFAULT_CARNOT)
  const r = useMemo(() => carnotCycle({ ...params, V1: litersToM3(params.V1) }), [params])
  const colors = r.legs.map((l) => legColor(l, c, params.Th))
  const etaCarnot = 1 - params.Tc / params.Th
  const matches = Math.abs(r.efficiency - etaCarnot) < 1e-9

  return (
    <SectionShell
      title="카르노 사이클"
      concept={
        <>
          <p>
            <strong>카르노 사이클</strong>은 두 열원 사이에서 작동하는 가장 효율적인 열기관입니다. 기체가 고온 열원에 닿은 채
            팽창하며 열 <Tex tex="Q_h" />를 받고(1→2), 단열 팽창으로 저온까지 식은 뒤(2→3), 저온 열원에 닿은 채 압축되며 열{' '}
            <Tex tex="Q_c" />를 버리고(3→4), 단열 압축으로 처음 상태로 돌아옵니다(4→1).
          </p>
          <p>
            모든 단계가 가역적이므로 사이클 동안 우주의 엔트로피는 변하지 않습니다. T-S 선도에서 카르노 사이클은 직사각형이고,
            그 넓이가 바로 순일 <Tex tex="W_{net}" />입니다.
          </p>
        </>
      }
      formulas={
        <>
          <FormulaBlock tex="Q_h = nRT_h\ln\frac{V_2}{V_1},\qquad Q_c = nRT_c\ln\frac{V_3}{V_4}" caption="등온 단계의 열" />
          <FormulaBlock tex="T_hV_2^{\gamma-1} = T_cV_3^{\gamma-1},\quad T_hV_1^{\gamma-1} = T_cV_4^{\gamma-1}\;\Rightarrow\;\frac{V_3}{V_4} = \frac{V_2}{V_1}" caption="단열 단계" />
          <FormulaBlock tex="\eta = \frac{W_{net}}{Q_h} = 1 - \frac{Q_c}{Q_h} = 1 - \frac{T_c}{T_h}" caption="카르노 효율" highlight />
        </>
      }
      guide={[
        <>
          <Tex tex="T_c" />를 낮춰 보세요. 효율이 올라가고 T-S 직사각형의 아래 변이 내려가 넓이(<Tex tex="W_{net}" />)가
          커집니다.
        </>,
        <>
          <Tex tex="V_2/V_1" />을 키우면 <Tex tex="Q_h" />와 <Tex tex="W_{net}" />가 모두 커지지만 효율은 그대로입니다.{' '}
          <Tex tex="Q_h" />와 <Tex tex="Q_c" />가 같은 비율 <Tex tex="\ln(V_2/V_1)" />로 함께 늘어나서 <Tex tex="Q_c/Q_h = T_c/T_h" />가
          변하지 않기 때문입니다.
        </>,
        <>
          단원자 ↔ 이원자를 바꿔 보세요. 단열 곡선의 기울기(<Tex tex="\gamma" />)가 달라져 V₃, V₄가 바뀌지만 효율은 온도만으로
          정해집니다.
        </>,
      ]}
    >
      <SignConventionNote />
      <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <CarnotControls value={params} onChange={setParams} />
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <ValueReadout label="고온에서 받은 열 Q_h" value={fmt(r.Qh, 1)} unit="J" tone="heat" />
            <ValueReadout label="저온으로 버린 열 Q_c" value={fmt(r.Qc, 1)} unit="J" tone="work" />
            <ValueReadout label="순일 W_net = Q_h − Q_c" value={fmt(r.Wnet, 1)} unit="J" tone="energy" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <ValueReadout label="η = W_net / Q_h (에너지로 계산)" value={fmt(r.efficiency * 100, 3)} unit="%" />
            <ValueReadout label="η = 1 − T_c / T_h (온도로 계산)" value={fmt(etaCarnot * 100, 3)} unit="%" />
          </div>
          {matches && (
            <p className="rounded-md bg-green-50 px-3 py-2 text-center text-sm font-medium text-green-800 dark:bg-green-950/40 dark:text-green-300">
              두 방법으로 구한 효율이 일치합니다 ✓
            </p>
          )}
          <p className="text-xs text-slate-500">
            상태 3·4의 부피: V₃ = {fmt(r.states[2].V * 1000, 1)} L, V₄ = {fmt(r.states[3].V * 1000, 1)} L
          </p>
        </div>
      </div>

      <CycleViewer legs={r.legs} Th={params.Th} areaLabel="W_net" areaColor={c.energy} />

      <PlotPanel title="단계별 에너지와 엔트로피">
        <CycleLegTable legs={r.legs} colors={colors} />
      </PlotPanel>
    </SectionShell>
  )
}
