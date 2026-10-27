import type { DegreesOfFreedom } from '../../../physics/internalEnergy'

export interface CarnotParams {
  f: DegreesOfFreedom
  n: number
  Th: number
  Tc: number
  /** [L] */
  V1: number
  ratio: number
}

export const DEFAULT_CARNOT: CarnotParams = { f: 3, n: 1, Th: 600, Tc: 300, V1: 5, ratio: 2 }

export const T_MIN = 200
export const T_MAX = 1200
