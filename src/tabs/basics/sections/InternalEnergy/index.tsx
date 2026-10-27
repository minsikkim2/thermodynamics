import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { FormulaBlock, Tex } from '../../../../components/FormulaBlock'
import { ParameterSlider } from '../../../../components/ParameterSlider'
import { PlotPanel } from '../../../../components/PlotPanel'
import { ControlPanel, SectionShell } from '../../../../components/SectionShell'
import { SegmentedControl } from '../../../../components/SegmentedControl'
import { ValueReadout } from '../../../../components/ValueReadout'
import { XYChart } from '../../../../components/XYChart'
import { tooltipStyle, useChartTheme } from '../../../../hooks/useChartTheme'
import { fmt, jToKJ, litersToM3, paToKPa } from '../../../../lib/format'
import { kelvinToCelsius, linspace } from '../../../../physics/constants'
import { pressure } from '../../../../physics/idealGas'
import {
  energyPartition,
  internalEnergy,
  molarCv,
  type DegreesOfFreedom,
} from '../../../../physics/internalEnergy'

const T_MAX = 1000
const N_MAX = 5
/** 게이지 최댓값: 이원자, n·T 최대일 때 */
const U_MAX_KJ = jToKJ(internalEnergy(5, N_MAX, T_MAX))

export default function InternalEnergy() {
  const c = useChartTheme()
  const [f, setF] = useState<DegreesOfFreedom>(3)
  const [T, setT] = useState(300)
  const [n, setN] = useState(1)
  const [V, setV] = useState(20) // L

  const U = jToKJ(internalEnergy(f, n, T))
  const P = paToKPa(pressure(n, T, litersToM3(V)))

  const partitionData = useMemo(
    () =>
      ([3, 5] as const).map((fi) => {
        const p = energyPartition(fi, n, T)
        return {
          name: fi === 3 ? '단원자 (f = 3)' : '이원자 (f = 5)',
          병진: jToKJ(p.translational),
          회전: jToKJ(p.rotational),
          selected: fi === f,
        }
      }),
    [n, T, f],
  )

  const uVsV = useMemo(
    () => [{ name: 'U', data: linspace(2, 50, 30).map((x) => ({ x, y: U })), color: c.energy, width: 3 }],
    [U, c],
  )

  return (
    <SectionShell
      title="내부에너지"
      concept={
        <>
          <p>
            <strong>내부에너지 U</strong>는 계를 이루는 분자들이 가진 에너지의 총합입니다. 이상기체는 분자 사이 힘이
            없으므로 위치에너지가 없고, 분자의 운동에너지만 남습니다.
          </p>
          <p>
            <strong>에너지 등분배 정리</strong>에 따르면 분자 1몰은 자유도 하나당 <Tex tex="\tfrac12 RT" />의 에너지를
            가집니다. 단원자 분자(He, Ar)는 병진 운동 3개(f = 3), 이원자 분자(N₂, O₂)는 상온에서 회전 2개가 더해져
            f = 5입니다.
          </p>
          <p>
            식에 <Tex tex="V" />나 <Tex tex="P" />가 없다는 점이 중요합니다. 이상기체의 내부에너지는{' '}
            <strong>온도만의 함수</strong>입니다.
          </p>
        </>
      }
      formulas={
        <>
          <FormulaBlock tex="U = \frac{f}{2}\,nRT" caption="이상기체의 내부에너지" highlight />
          <FormulaBlock tex="C_v = \frac{f}{2}R" caption="몰 정적 열용량" />
          <FormulaBlock
            tex={`C_v = ${fmt(molarCv(f), 2)}\\ \\mathrm{J/(mol\\cdot K)}\\quad (f = ${f})`}
            caption="현재 선택한 기체"
          />
        </>
      }
      guide={[
        <>
          부피 <Tex tex="V" />를 2 L에서 50 L까지 움직여 보세요. 압력은 크게 변하지만 <Tex tex="U" />는 그대로입니다.
        </>,
        <>
          같은 <Tex tex="T" />, <Tex tex="n" />에서 단원자 ↔ 이원자를 바꿔 보세요. 병진 에너지는 같고, 이원자는 회전
          에너지만큼(5/3배) 더 큽니다.
        </>,
        <>
          <Tex tex="T" />를 2배로 하면 <Tex tex="U" />도 정확히 2배가 됩니다.
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
          <ParameterSlider
            label={<>온도 <Tex tex="T" /></>}
            unit="K"
            min={50}
            max={T_MAX}
            step={10}
            value={T}
            onChange={setT}
            digits={0}
            secondary={`${fmt(kelvinToCelsius(T), 0)} °C`}
          />
          <ParameterSlider
            label={<>물질의 양 <Tex tex="n" /></>}
            unit="mol"
            min={0.2}
            max={N_MAX}
            step={0.1}
            value={n}
            onChange={setN}
            digits={1}
          />
          <ParameterSlider
            label={<>부피 <Tex tex="V" /></>}
            unit="L"
            min={2}
            max={50}
            step={0.5}
            value={V}
            onChange={setV}
            digits={1}
          />
        </ControlPanel>

        <div className="space-y-4">
          <PlotPanel title="내부에너지 게이지">
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold tabular-nums text-green-600 dark:text-green-400">
                {fmt(U, 2)} <span className="text-base font-normal text-slate-500">kJ</span>
              </span>
              <span className="text-xs text-slate-500">최대 {fmt(U_MAX_KJ, 0)} kJ</span>
            </div>
            <div className="mt-2 h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-green-500 transition-[width] duration-200"
                style={{ width: `${(U / U_MAX_KJ) * 100}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <ValueReadout label={<>압력 <Tex tex="P" /> (V에 따라 변함)</>} value={fmt(P, 1)} unit="kPa" tone="work" />
              <ValueReadout label={<>내부에너지 <Tex tex="U" /> (V와 무관)</>} value={fmt(U, 3)} unit="kJ" tone="energy" />
            </div>
          </PlotPanel>

          <PlotPanel title="자유도별 에너지 분배 (병진 + 회전)" height={220}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={partitionData} layout="vertical" margin={{ top: 4, right: 24, bottom: 16, left: 8 }}>
                <CartesianGrid stroke={c.grid} strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  stroke={c.axis}
                  tick={{ fill: c.axis, fontSize: 11 }}
                  tickFormatter={(v: number) => fmt(v, 1)}
                  label={{ value: 'U [kJ]', position: 'insideBottom', offset: -8, fill: c.axis, fontSize: 12 }}
                />
                <YAxis type="category" dataKey="name" stroke={c.axis} tick={{ fill: c.axis, fontSize: 12 }} width={96} />
                <Tooltip {...tooltipStyle(c)} formatter={(v) => `${fmt(Number(v), 3)} kJ`} cursor={{ fill: c.grid, opacity: 0.4 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} verticalAlign="top" height={24} />
                <Bar dataKey="병진" stackId="u" fill={c.series[0]} isAnimationActive={false} />
                <Bar dataKey="회전" stackId="u" fill={c.series[4]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </PlotPanel>
        </div>
      </div>

      <PlotPanel
        title="부피를 바꿔도 U는 변하지 않는다"
        height={220}
        footer="온도가 같으면 부피(또는 압력)가 달라도 내부에너지는 같은 수평선 위에 있습니다."
      >
        <XYChart
          series={uVsV}
          xLabel="V [L]"
          yLabel="U [kJ]"
          xDomain={[2, 50]}
          yDomain={[0, Math.ceil(U_MAX_KJ)]}
          markers={[{ x: V, y: U, color: c.heat, label: '현재' }]}
          yDigits={0}
        />
      </PlotPanel>
    </SectionShell>
  )
}
