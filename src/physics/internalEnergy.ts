import { R, assertPositive } from './constants'

/** 자유도: 단원자 3(병진), 이원자 5(병진 3 + 회전 2) */
export type DegreesOfFreedom = 3 | 5

/** U = (f/2) nRT [J] */
export function internalEnergy(f: DegreesOfFreedom, n: number, T: number): number {
  assertPositive('n', n)
  assertPositive('T', T)
  return (f / 2) * n * R * T
}

/** 몰 정적 열용량 C_v = (f/2) R [J/(mol·K)] */
export const molarCv = (f: DegreesOfFreedom): number => (f / 2) * R

/** 몰 정압 열용량 C_p = C_v + R [J/(mol·K)] */
export const molarCp = (f: DegreesOfFreedom): number => molarCv(f) + R

/** 비열비 γ = C_p / C_v = (f + 2) / f */
export const heatCapacityRatio = (f: DegreesOfFreedom): number => (f + 2) / f

export interface EnergyPartition {
  translational: number
  rotational: number
  total: number
}

/** 에너지 등분배: 자유도 하나당 (1/2) nRT */
export function energyPartition(f: DegreesOfFreedom, n: number, T: number): EnergyPartition {
  const perDof = 0.5 * n * R * T
  const translational = 3 * perDof
  const rotational = (f - 3) * perDof
  return { translational, rotational, total: internalEnergy(f, n, T) }
}
