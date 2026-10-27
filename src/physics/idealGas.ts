import { R, assertPositive, linspace } from './constants'

// 모든 함수는 SI 단위를 사용한다: P [Pa], V [m³], T [K], n [mol]

/** P = nRT / V */
export function pressure(n: number, T: number, V: number): number {
  assertPositive('n', n)
  assertPositive('T', T)
  assertPositive('V', V)
  return (n * R * T) / V
}

/** V = nRT / P */
export function volume(n: number, T: number, P: number): number {
  assertPositive('n', n)
  assertPositive('T', T)
  assertPositive('P', P)
  return (n * R * T) / P
}

/** T = PV / (nR) */
export function temperature(P: number, V: number, n: number): number {
  assertPositive('P', P)
  assertPositive('V', V)
  assertPositive('n', n)
  return (P * V) / (n * R)
}

export interface Point {
  x: number
  y: number
}

/** 등온선: 고정된 T에서 P(V) 곡선 */
export function isotherm(n: number, T: number, Vmin: number, Vmax: number, count = 80): Point[] {
  return linspace(Vmin, Vmax, count).map((V) => ({ x: V, y: pressure(n, T, V) }))
}

/** 등압선: 고정된 P에서 V(T) 직선 */
export function isobar(n: number, P: number, Tmin: number, Tmax: number, count = 40): Point[] {
  return linspace(Tmin, Tmax, count).map((T) => ({ x: T, y: volume(n, T, P) }))
}

/** 등적선: 고정된 V에서 P(T) 직선 */
export function isochore(n: number, V: number, Tmin: number, Tmax: number, count = 40): Point[] {
  return linspace(Tmin, Tmax, count).map((T) => ({ x: T, y: pressure(n, T, V) }))
}
