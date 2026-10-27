interface Props {
  x1: number
  y1: number
  x2: number
  y2: number
  /** 화살표 몸통 두께 [px] */
  thickness: number
  color: string
  opacity?: number
}

/** 두께가 값에 비례하는 굵은 화살표 (SVG 안에서 사용) */
export function Arrow({ x1, y1, x2, y2, thickness, color, opacity = 0.9 }: Props) {
  const len = Math.hypot(x2 - x1, y2 - y1)
  if (len < 1 || thickness <= 0) return null
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
  const head = Math.min(Math.max(thickness * 1.6, 12), len * 0.6)
  const half = thickness / 2
  const headHalf = Math.max(thickness, 10)
  const d = `M0,${-half}L${len - head},${-half}L${len - head},${-headHalf}L${len},0L${len - head},${headHalf}L${len - head},${half}L0,${half}Z`
  return <path d={d} fill={color} opacity={opacity} transform={`translate(${x1} ${y1}) rotate(${angle})`} />
}
