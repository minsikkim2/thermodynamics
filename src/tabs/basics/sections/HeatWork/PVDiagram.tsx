import { scaleLinear } from 'd3-scale'
import { useChartTheme } from '../../../../hooks/useChartTheme'
import { useElementWidth } from '../../../../hooks/useElementWidth'
import { fmt } from '../../../../lib/format'

export interface PVPoint {
  /** [L] */
  V: number
  /** [kPa] */
  P: number
}

interface Props {
  path: PVPoint[]
  /** 계가 한 일 [J] – 면적 색과 라벨에 사용 */
  W: number
  /** 배경에 흐리게 그릴 기준 곡선 (예: 시작 온도의 등온선) */
  guides?: { label: string; points: PVPoint[] }[]
  vMax: number
  pMax: number
}

const HEIGHT = 340
const M = { top: 16, right: 20, bottom: 44, left: 60 }

/** P-V 선도: 과정 경로와 곡선 아래 면적(= 일)을 그린다. */
export function PVDiagram({ path, W, guides = [], vMax, pMax }: Props) {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const c = useChartTheme()
  const x = scaleLinear().domain([0, vMax]).range([M.left, width - M.right])
  const y = scaleLinear().domain([0, pMax]).range([HEIGHT - M.bottom, M.top]).nice()

  const toD = (pts: PVPoint[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.V)},${y(p.P)}`).join('')
  const first = path[0]
  const last = path[path.length - 1]
  const areaD = `${toD(path)}L${x(last.V)},${y(0)}L${x(first.V)},${y(0)}Z`
  const expanding = W > 0
  const areaColor = expanding ? c.work : c.warn
  const hasArea = Math.abs(last.V - first.V) > 1e-9

  // 경로 중간의 진행 방향 화살표
  const mid = Math.floor(path.length / 2)
  const a = path[Math.max(mid - 1, 0)]
  const b = path[Math.min(mid + 1, path.length - 1)]
  const angle = (Math.atan2(y(b.P) - y(a.P), x(b.V) - x(a.V)) * 180) / Math.PI
  const midPt = path.length > 2 ? path[mid] : { V: (first.V + last.V) / 2, P: (first.P + last.P) / 2 }

  return (
    <div ref={ref} className="w-full">
      <svg width={width} height={HEIGHT} role="img" aria-label="P-V 선도">
        {/* 격자와 축 */}
        {x.ticks(8).map((t) => (
          <g key={`x${t}`}>
            <line x1={x(t)} x2={x(t)} y1={M.top} y2={HEIGHT - M.bottom} stroke={c.grid} strokeDasharray="3 3" />
            <text x={x(t)} y={HEIGHT - M.bottom + 16} textAnchor="middle" fontSize={11} fill={c.axis}>
              {fmt(t, 0)}
            </text>
          </g>
        ))}
        {y.ticks(6).map((t) => (
          <g key={`y${t}`}>
            <line x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} stroke={c.grid} strokeDasharray="3 3" />
            <text x={M.left - 6} y={y(t) + 4} textAnchor="end" fontSize={11} fill={c.axis}>
              {fmt(t, 0)}
            </text>
          </g>
        ))}
        <line x1={M.left} x2={width - M.right} y1={y(0)} y2={y(0)} stroke={c.axis} />
        <line x1={M.left} x2={M.left} y1={M.top} y2={HEIGHT - M.bottom} stroke={c.axis} />
        <text x={(M.left + width - M.right) / 2} y={HEIGHT - 8} textAnchor="middle" fontSize={12} fill={c.axis}>
          V [L]
        </text>
        <text
          transform={`translate(16 ${(M.top + HEIGHT - M.bottom) / 2}) rotate(-90)`}
          textAnchor="middle"
          fontSize={12}
          fill={c.axis}
        >
          P [kPa]
        </text>

        <defs>
          <clipPath id="pv-plot">
            <rect x={M.left} y={M.top} width={Math.max(width - M.left - M.right, 0)} height={HEIGHT - M.top - M.bottom} />
          </clipPath>
          <marker id="pv-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0L10,5L0,10Z" fill={c.text} />
          </marker>
        </defs>

        <g clipPath="url(#pv-plot)">
          {guides.map((g) => (
            <g key={g.label}>
              <path d={toD(g.points)} fill="none" stroke={c.muted} strokeWidth={1} strokeDasharray="4 4" />
            </g>
          ))}
          {/* 일 = 곡선 아래 면적 */}
          {hasArea && <path d={areaD} fill={areaColor} fillOpacity={0.22} stroke="none" />}
          <path d={toD(path)} fill="none" stroke={c.text} strokeWidth={2.5} />
        </g>

        {/* 진행 방향 */}
        <g transform={`translate(${x(midPt.V)} ${y(midPt.P)}) rotate(${angle})`}>
          <path d="M-7,-6L5,0L-7,6Z" fill={c.text} />
        </g>

        {/* 상태 점 */}
        {[
          { p: first, label: '1' },
          { p: last, label: '2' },
        ].map(({ p, label }) => (
          <g key={label}>
            <circle cx={x(p.V)} cy={y(p.P)} r={7} fill={label === '1' ? c.series[0] : c.heat} stroke={c.surface} strokeWidth={2} />
            <text x={x(p.V) + 10} y={y(p.P) - 10} fontSize={12} fontWeight={600} fill={c.text}>
              {label} ({fmt(p.V, 1)} L, {fmt(p.P, 0)} kPa)
            </text>
          </g>
        ))}

        {hasArea && (
          <text
            x={x((first.V + last.V) / 2)}
            y={y(0) - 10}
            textAnchor="middle"
            fontSize={13}
            fontWeight={700}
            fill={areaColor}
          >
            W {expanding ? '> 0' : '< 0'}
          </text>
        )}
      </svg>
    </div>
  )
}
