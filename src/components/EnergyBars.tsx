import { Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { tooltipStyle, useChartTheme } from '../hooks/useChartTheme'
import { fmt } from '../lib/format'

export interface EnergyBar {
  name: string
  value: number
  color: string
}

interface Props {
  bars: EnergyBar[]
  unit: string
  digits?: number
}

/** 부호가 있는 에너지 값(Q, W, ΔU 등)을 0 기준 막대로 나란히 보여준다. 부모가 높이를 정한다. */
export function EnergyBars({ bars, unit, digits = 2 }: Props) {
  const c = useChartTheme()
  const maxAbs = Math.max(...bars.map((b) => Math.abs(b.value)), 1e-9)
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={bars} margin={{ top: 20, right: 12, bottom: 4, left: 8 }}>
        <CartesianGrid stroke={c.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" stroke={c.axis} tick={{ fill: c.text, fontSize: 13, fontWeight: 600 }} />
        <YAxis
          stroke={c.axis}
          tick={{ fill: c.axis, fontSize: 11 }}
          domain={[-maxAbs * 1.2, maxAbs * 1.2]}
          tickFormatter={(v: number) => fmt(v, 1)}
          width={56}
          label={{ value: unit, angle: -90, position: 'insideLeft', fill: c.axis, fontSize: 12 }}
        />
        <Tooltip {...tooltipStyle(c)} formatter={(v) => `${fmt(Number(v), digits)} ${unit}`} cursor={{ fill: c.grid, opacity: 0.4 }} />
        <ReferenceLine y={0} stroke={c.axis} />
        <Bar dataKey="value" isAnimationActive={false} radius={[3, 3, 3, 3]}>
          {bars.map((b) => (
            <Cell key={b.name} fill={b.color} />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            formatter={(v: unknown) => fmt(Number(v), digits)}
            style={{ fill: c.text, fontSize: 12 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
