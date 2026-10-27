import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { tooltipStyle, useChartTheme } from '../hooks/useChartTheme'
import { fmt } from '../lib/format'

export interface XYSeries {
  name: string
  data: { x: number; y: number }[]
  color: string
  dashed?: boolean
  width?: number
}

export interface XYMarker {
  x: number
  y: number
  color: string
  label?: string
}

interface Props {
  series: XYSeries[]
  xLabel: string
  yLabel: string
  xDomain?: [number | 'auto' | 'dataMin', number | 'auto' | 'dataMax']
  yDomain?: [number | 'auto' | 'dataMin', number | 'auto' | 'dataMax']
  markers?: XYMarker[]
  /** 수직 기준선 */
  vLines?: { x: number; color: string; label?: string }[]
  /** 수평 기준선 */
  hLines?: { y: number; color: string; label?: string }[]
  /** x 구간 음영 */
  xAreas?: { x1: number; x2: number; color: string; label?: string }[]
  legend?: boolean
  xDigits?: number
  yDigits?: number
}

/** 수치형 x-y 선 그래프 공통 래퍼 (Recharts). 부모가 높이를 정해야 한다. */
export function XYChart({
  series,
  xLabel,
  yLabel,
  xDomain = ['dataMin', 'dataMax'],
  yDomain = [0, 'auto'],
  markers = [],
  vLines = [],
  hLines = [],
  xAreas = [],
  legend = false,
  xDigits = 0,
  yDigits = 1,
}: Props) {
  const c = useChartTheme()
  const tick = { fill: c.axis, fontSize: 11 }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart margin={{ top: 10, right: 16, bottom: 24, left: 8 }}>
        <CartesianGrid stroke={c.grid} strokeDasharray="3 3" />
        {xAreas.map((a, i) => (
          <ReferenceArea
            key={`area-${i}`}
            x1={a.x1}
            x2={a.x2}
            fill={a.color}
            fillOpacity={0.12}
            stroke="none"
            ifOverflow="hidden"
            label={a.label ? { value: a.label, fill: a.color, fontSize: 11, position: 'insideTop' } : undefined}
          />
        ))}
        <XAxis
          type="number"
          dataKey="x"
          domain={xDomain}
          allowDataOverflow
          stroke={c.axis}
          tick={tick}
          tickFormatter={(v: number) => fmt(v, xDigits)}
          label={{ value: xLabel, position: 'insideBottom', offset: -14, fill: c.axis, fontSize: 12 }}
        />
        <YAxis
          type="number"
          domain={yDomain}
          allowDataOverflow
          stroke={c.axis}
          tick={tick}
          width={64}
          tickFormatter={(v: number) => fmt(v, yDigits)}
          label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 4, fill: c.axis, fontSize: 12, style: { textAnchor: 'middle' } }}
        />
        <Tooltip
          {...tooltipStyle(c)}
          formatter={(v) => fmt(Number(v), yDigits + 1)}
          labelFormatter={(v) => `${xLabel}: ${fmt(Number(v), xDigits + 1)}`}
        />
        {legend && <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 12, color: c.text }} />}
        {hLines.map((l, i) => (
          <ReferenceLine
            key={`h-${i}`}
            y={l.y}
            stroke={l.color}
            strokeDasharray="4 4"
            ifOverflow="extendDomain"
            label={l.label ? { value: l.label, fill: l.color, fontSize: 11, position: 'insideTopRight' } : undefined}
          />
        ))}
        {vLines.map((l, i) => (
          <ReferenceLine
            key={`v-${i}`}
            x={l.x}
            stroke={l.color}
            strokeDasharray="4 4"
            label={l.label ? { value: l.label, fill: l.color, fontSize: 11, position: 'top' } : undefined}
          />
        ))}
        {series.map((s) => (
          <Line
            key={s.name}
            name={s.name}
            data={s.data}
            dataKey="y"
            type="monotone"
            stroke={s.color}
            strokeWidth={s.width ?? 2}
            strokeDasharray={s.dashed ? '5 4' : undefined}
            dot={false}
            isAnimationActive={false}
          />
        ))}
        {markers.map((m, i) => (
          <ReferenceDot
            key={`m-${i}`}
            x={m.x}
            y={m.y}
            r={6}
            fill={m.color}
            stroke={c.surface}
            strokeWidth={2}
            ifOverflow="visible"
            label={m.label ? { value: m.label, fill: m.color, fontSize: 11, position: 'right' } : undefined}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
