/** 온도를 파랑(차가움) → 빨강(뜨거움) 색으로 바꾼다 */
export function temperatureColor(T: number, Tmin: number, Tmax: number): string {
  const t = Math.min(Math.max((T - Tmin) / (Tmax - Tmin), 0), 1)
  const hue = 220 - 220 * t
  return `hsl(${hue} 80% 52%)`
}
