import { scaleLinear } from 'd3-scale'
import { useId } from 'react'
import { useChartTheme } from '../hooks/useChartTheme'
import { useElementWidth } from '../hooks/useElementWidth'
import { fmt } from '../lib/format'

export interface DiagramPoint {
  x: number
  y: number
}

export interface DiagramLeg {
  id: string
  points: DiagramPoint[]
  color: string
}

interface Props {
  legs: DiagramLeg[]
  xLabel: string
  yLabel: string
  xDomain: [number, number]
  yDomain: [number, number]
  /** 사이클이 둘러싼 면적을 색칠하고 이 라벨을 붙인다 */
  areaLabel?: string
  areaColor?: string
  /** 꼭짓점 번호 */
  vertices?: (DiagramPoint & { label: string })[]
  /** 애니메이션 중인 현재 상태 */
  marker?: DiagramPoint
  activeLegId?: string
  height?: number
  xDigits?: number
  yDigits?: number
}

const M = { top: 16, right: 20, bottom: 44, left: 60 }

/** 단계별 색, 진행 방향, 둘러싼 면적, 현재 상태점을 그리는 닫힌 사이클 선도 (P-V, T-S 공용) */
export function CycleDiagram({
  legs,
  xLabel,
  yLabel,
  xDomain,
  yDomain,
  areaLabel,
  areaColor,
  vertices = [],
  marker,
  activeLegId,
  height = 300,
  xDigits = 0,
  yDigits = 0,
}: Props) {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const c = useChartTheme()
  const clipId = `clip-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const x = scaleLinear().domain(xDomain).range([M.left, width - M.right]).nice()
  const y = scaleLinear().domain(yDomain).range([height - M.bottom, M.top]).nice()
  const toD = (pts: DiagramPoint[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.x)},${y(p.y)}`).join('')
  const all = legs.flatMap((l) => l.points)
  const [x0] = x.domain()
  const [y0] = y.domain()

  return (
    <div ref={ref} className="w-full">
      <svg width={width} height={height} role="img" aria-label={`${yLabel}–${xLabel} 선도`}>
        <defs>
          <clipPath id={clipId}>
            <rect x={M.left} y={M.top} width={Math.max(width - M.left - M.right, 0)} height={height - M.top - M.bottom} />
          </clipPath>
        </defs>
        {x.ticks(7).map((t) => (
          <g key={`x${t}`}>
            <line x1={x(t)} x2={x(t)} y1={M.top} y2={height - M.bottom} stroke={c.grid} strokeDasharray="3 3" />
            <text x={x(t)} y={height - M.bottom + 16} textAnchor="middle" fontSize={11} fill={c.axis}>
              {fmt(t, xDigits)}
            </text>
          </g>
        ))}
        {y.ticks(6).map((t) => (
          <g key={`y${t}`}>
            <line x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} stroke={c.grid} strokeDasharray="3 3" />
            <text x={M.left - 6} y={y(t) + 4} textAnchor="end" fontSize={11} fill={c.axis}>
              {fmt(t, yDigits)}
            </text>
          </g>
        ))}
        <line x1={M.left} x2={width - M.right} y1={y(y0)} y2={y(y0)} stroke={c.axis} />
        <line x1={x(x0)} x2={x(x0)} y1={M.top} y2={height - M.bottom} stroke={c.axis} />
        <text x={(M.left + width - M.right) / 2} y={height - 8} textAnchor="middle" fontSize={12} fill={c.axis}>
          {xLabel}
        </text>
        <text
          transform={`translate(16 ${(M.top + height - M.bottom) / 2}) rotate(-90)`}
          textAnchor="middle"
          fontSize={12}
          fill={c.axis}
        >
          {yLabel}
        </text>

        <g clipPath={`url(#${clipId})`}>
          {areaLabel && <path d={`${toD(all)}Z`} fill={areaColor ?? c.accent} fillOpacity={0.16} stroke="none" />}
          {legs.map((leg) => (
            <path
              key={leg.id}
              d={toD(leg.points)}
              fill="none"
              stroke={leg.color}
              strokeWidth={leg.id === activeLegId ? 5 : 3}
              strokeLinejoin="round"
            />
          ))}
        </g>

        {/* 진행 방향 */}
        {legs.map((leg) => {
          const pts = leg.points
          const mid = Math.floor(pts.length / 2)
          const a = pts[Math.max(mid - 1, 0)]
          const b = pts[Math.min(mid + 1, pts.length - 1)]
          const angle = (Math.atan2(y(b.y) - y(a.y), x(b.x) - x(a.x)) * 180) / Math.PI
          return (
            <g key={`arrow-${leg.id}`} transform={`translate(${x(pts[mid].x)} ${y(pts[mid].y)}) rotate(${angle})`}>
              <path d="M-8,-6L6,0L-8,6Z" fill={leg.color} />
            </g>
          )
        })}

        {areaLabel && all.length > 0 && (
          <text
            x={x(all.reduce((s, p) => s + p.x, 0) / all.length)}
            y={y(all.reduce((s, p) => s + p.y, 0) / all.length)}
            textAnchor="middle"
            fontSize={13}
            fontWeight={700}
            fill={areaColor ?? c.accent}
          >
            {areaLabel}
          </text>
        )}

        {vertices.map((v) => (
          <g key={v.label}>
            <circle cx={x(v.x)} cy={y(v.y)} r={4} fill={c.text} />
            <text x={x(v.x) + 7} y={y(v.y) - 7} fontSize={12} fontWeight={700} fill={c.text}>
              {v.label}
            </text>
          </g>
        ))}

        {marker && (
          <circle cx={x(marker.x)} cy={y(marker.y)} r={8} fill={c.text} stroke={c.surface} strokeWidth={3} />
        )}
      </svg>
    </div>
  )
}
