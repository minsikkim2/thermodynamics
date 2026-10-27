import { useMemo, useState } from 'react'
import { Arrow } from '../../../../components/Arrow'
import { FormulaBlock, Tex } from '../../../../components/FormulaBlock'
import { PlotPanel } from '../../../../components/PlotPanel'
import { SectionShell } from '../../../../components/SectionShell'
import { SegmentedControl } from '../../../../components/SegmentedControl'
import { ValueReadout } from '../../../../components/ValueReadout'
import { XYChart } from '../../../../components/XYChart'
import { useChartTheme } from '../../../../hooks/useChartTheme'
import { temperatureColor } from '../../../../lib/color'
import { fmt, litersToM3 } from '../../../../lib/format'
import { linspace } from '../../../../physics/constants'
import { carnotCycle } from '../../../../physics/cycles/carnot'
import { copHeatPump, copRefrigerator } from '../../../../physics/cycles/refrigeration'
import { CarnotControls } from '../../shared/CarnotControls'
import { CycleLegTable } from '../../shared/CycleLegTable'
import { CycleViewer } from '../../shared/CycleViewer'
import { DEFAULT_CARNOT, T_MAX, T_MIN, type CarnotParams } from '../../shared/carnotParams'
import { legColor } from '../../shared/legStyle'

type Mode = 'refrigerator' | 'heatPump'

const COP_Y_MAX = 30

export default function Refrigerator() {
  const c = useChartTheme()
  const [params, setParams] = useState<CarnotParams>({ ...DEFAULT_CARNOT, Th: 300, Tc: 260 })
  const [mode, setMode] = useState<Mode>('refrigerator')
  const r = useMemo(() => carnotCycle({ ...params, V1: litersToM3(params.V1), reverse: true }), [params])
  const colors = r.legs.map((l) => legColor(l, c, params.Th))
  const Win = -r.Wnet
  const copR = copRefrigerator(params.Th, params.Tc)
  const copH = copHeatPump(params.Th, params.Tc)

  const copCurves = useMemo(() => {
    const dTs = linspace(5, Math.max(T_MAX - params.Tc, 10), 120)
    return [
      { name: 'COP 냉동기', data: dTs.map((d) => ({ x: d, y: copRefrigerator(params.Tc + d, params.Tc) })), color: c.work, width: 2.5 },
      { name: 'COP 열펌프', data: dTs.map((d) => ({ x: d, y: copHeatPump(params.Tc + d, params.Tc) })), color: c.heat, width: 2.5 },
    ]
  }, [params.Tc, c])

  const dT = params.Th - params.Tc
  const w = (q: number) => 4 + (q / r.Qh) * 30

  return (
    <SectionShell
      title="냉동기와 열펌프"
      concept={
        <>
          <p>
            카르노 사이클을 <strong>거꾸로</strong> 돌리면 일을 들여 열을 저온에서 고온으로 옮길 수 있습니다. 저온 쪽에서 열을
            빼내는 것이 목적이면 <strong>냉동기</strong>(냉장고, 에어컨), 고온 쪽에 열을 넣는 것이 목적이면{' '}
            <strong>열펌프</strong>(난방)입니다.
          </p>
          <p>
            성능은 들인 일에 대해 원하는 열이 얼마나 옮겨졌는지인 <strong>성능계수 COP</strong>로 나타냅니다. 효율과 달리 1보다
            클 수 있습니다. 열을 &ldquo;만드는&rdquo; 것이 아니라 &ldquo;옮기는&rdquo; 것이기 때문입니다.
          </p>
        </>
      }
      formulas={
        <>
          <FormulaBlock tex="Q_h = Q_c + W_{in}" caption="에너지 보존" />
          <FormulaBlock tex="\mathrm{COP}_{\text{냉동}} = \frac{Q_c}{W_{in}} = \frac{T_c}{T_h - T_c}" highlight={mode === 'refrigerator'} />
          <FormulaBlock tex="\mathrm{COP}_{\text{열펌프}} = \frac{Q_h}{W_{in}} = \frac{T_h}{T_h - T_c} = \mathrm{COP}_{\text{냉동}} + 1" highlight={mode === 'heatPump'} />
        </>
      }
      guide={[
        <>
          <Tex tex="T_c" />를 <Tex tex="T_h" />에 가깝게 올려 보세요. 온도 차가 작을수록 COP가 급격히 커집니다. 냉장고 문을
          자주 열지 않아야 하는 이유입니다.
        </>,
        <>재생해서 선도의 화살표 방향을 카르노 사이클 섹션과 비교해 보세요. 반시계 방향으로 돌고, 순일이 음수(외부에서 받는 일)입니다.</>,
        <>열펌프 COP는 항상 냉동기 COP보다 정확히 1 큽니다. 들인 일 자체도 고온 쪽으로 방출되기 때문입니다.</>,
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <CarnotControls value={params} onChange={setParams} />
        <div className="space-y-4">
          <div className="flex justify-end">
            <SegmentedControl
              ariaLabel="용도"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'refrigerator', label: '냉동기' },
                { value: 'heatPump', label: '열펌프' },
              ]}
            />
          </div>
          <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
            <svg viewBox="0 0 420 300" className="w-full" role="img" aria-label="냉동기 에너지 흐름">
              <rect x={60} y={10} width={220} height={50} rx={8} fill={temperatureColor(params.Th, T_MIN, T_MAX)} />
              <text x={170} y={41} textAnchor="middle" fill="#fff" fontWeight={700} fontSize={14}>
                {mode === 'heatPump' ? '실내' : '실외'} T_h = {fmt(params.Th, 0)} K
              </text>
              <rect x={60} y={240} width={220} height={50} rx={8} fill={temperatureColor(params.Tc, T_MIN, T_MAX)} />
              <text x={170} y={271} textAnchor="middle" fill="#fff" fontWeight={700} fontSize={14}>
                {mode === 'heatPump' ? '실외' : '냉장실'} T_c = {fmt(params.Tc, 0)} K
              </text>
              <Arrow x1={170} y1={238} x2={170} y2={182} thickness={w(r.Qc)} color={c.work} />
              <text x={200} y={215} fontSize={13} fill={c.work} fontWeight={600}>
                Q_c = {fmt(r.Qc, 0)} J
              </text>
              <circle cx={170} cy={150} r={30} fill={c.surface} stroke={c.axis} strokeWidth={2} />
              <text x={170} y={155} textAnchor="middle" fontSize={13} fill={c.text} fontWeight={700}>
                {mode === 'heatPump' ? '열펌프' : '냉동기'}
              </text>
              <Arrow x1={170} y1={118} x2={170} y2={62} thickness={w(r.Qh)} color={c.heat} />
              <text x={200} y={95} fontSize={13} fill={c.heat} fontWeight={600}>
                Q_h = {fmt(r.Qh, 0)} J
              </text>
              <Arrow x1={330} y1={150} x2={202} y2={150} thickness={w(Win)} color={c.warn} />
              <text x={290} y={135} fontSize={13} fill={c.warn} fontWeight={600}>
                W_in = {fmt(Win, 0)} J
              </text>
            </svg>
            <div className="space-y-2">
              <ValueReadout label="COP 냉동기 = Q_c / W_in" value={fmt(r.Qc / Win, 2)} sub={`공식 T_c/(T_h−T_c) = ${fmt(copR, 2)}`} tone="work" />
              <ValueReadout label="COP 열펌프 = Q_h / W_in" value={fmt(r.Qh / Win, 2)} sub={`공식 T_h/(T_h−T_c) = ${fmt(copH, 2)}`} tone="heat" />
            </div>
          </div>
        </div>
      </div>

      <CycleViewer legs={r.legs} Th={params.Th} areaLabel="W_in" areaColor={c.warn} />

      <div className="grid gap-4 lg:grid-cols-2">
        <PlotPanel
          title={`온도 차에 따른 COP (T_c = ${fmt(params.Tc, 0)} K 고정)`}
          height={300}
          footer={`세로축은 ${COP_Y_MAX}까지 표시합니다. 온도 차 → 0이면 COP → ∞`}
        >
          <XYChart
            series={copCurves}
            xLabel="T_h − T_c [K]"
            yLabel="COP"
            yDomain={[0, COP_Y_MAX]}
            markers={[
              { x: dT, y: Math.min(copR, COP_Y_MAX), color: c.work },
              { x: dT, y: Math.min(copH, COP_Y_MAX), color: c.heat },
            ]}
            vLines={[{ x: dT, color: c.muted }]}
            legend
          />
        </PlotPanel>
        <PlotPanel title="단계별 에너지와 엔트로피 (역방향)">
          <CycleLegTable legs={r.legs} colors={colors} />
        </PlotPanel>
      </div>
    </SectionShell>
  )
}
