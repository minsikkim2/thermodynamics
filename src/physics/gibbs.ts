import { assertPositive } from './constants'

// ΔH [J/mol], ΔS [J/(mol·K)], T [K], ΔG [J/mol]

/** ΔG = ΔH − TΔS */
export function deltaG(dH: number, dS: number, T: number): number {
  assertPositive('T', T)
  return dH - T * dS
}

export type Spontaneity = 'spontaneous' | 'equilibrium' | 'nonspontaneous'

export function spontaneity(dG: number, tolerance = 1e-9): Spontaneity {
  if (Math.abs(dG) <= tolerance) return 'equilibrium'
  return dG < 0 ? 'spontaneous' : 'nonspontaneous'
}

/** ΔG의 부호가 바뀌는 온도 T* = ΔH/ΔS. 양의 온도에서 교차가 없으면 null */
export function crossoverTemperature(dH: number, dS: number): number | null {
  if (dS === 0) return null
  const T = dH / dS
  return T > 0 ? T : null
}

export type GibbsQuadrant = 'always' | 'never' | 'highT' | 'lowT'

/** ΔH, ΔS 부호 조합에 따른 자발성 분류 */
export function gibbsQuadrant(dH: number, dS: number): GibbsQuadrant {
  if (dH <= 0 && dS >= 0) return 'always'
  if (dH >= 0 && dS <= 0) return 'never'
  if (dH > 0 && dS > 0) return 'highT'
  return 'lowT'
}
