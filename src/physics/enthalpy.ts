import { R, assertPositive } from './constants'
import { molarCp, molarCv, type DegreesOfFreedom } from './internalEnergy'

/** H = U + PV [J] */
export const enthalpy = (U: number, P: number, V: number): number => U + P * V

/** 이상기체의 엔탈피 H = (f/2 + 1) nRT [J] */
export function idealGasEnthalpy(f: DegreesOfFreedom, n: number, T: number): number {
  assertPositive('n', n)
  assertPositive('T', T)
  return (f / 2 + 1) * n * R * T
}

export interface HeatingSplit {
  /** 공급한 열 [J] */
  Q: number
  /** 내부에너지 증가 [J] */
  dU: number
  /** 계가 한 일 PΔV [J] */
  W: number
}

/** 등압 가열: Q = ΔH = nC_pΔT = ΔU + PΔV */
export function isobaricHeating(f: DegreesOfFreedom, n: number, dT: number): HeatingSplit {
  assertPositive('n', n)
  return { Q: n * molarCp(f) * dT, dU: n * molarCv(f) * dT, W: n * R * dT }
}

/** 등적 가열: Q = ΔU = nC_vΔT, W = 0 */
export function isochoricHeating(f: DegreesOfFreedom, n: number, dT: number): HeatingSplit {
  assertPositive('n', n)
  const dU = n * molarCv(f) * dT
  return { Q: dU, dU, W: 0 }
}

/** 같은 열 Q를 주었을 때의 온도 상승 ΔT [K] */
export function temperatureRise(Q: number, n: number, molarHeatCapacity: number): number {
  assertPositive('n', n)
  return Q / (n * molarHeatCapacity)
}

export interface ReactionExample {
  id: string
  name: string
  equation: string
  /** 표준 반응 엔탈피 ΔH° [kJ/mol] (298 K, 1 bar, 반응식 기준) */
  dH: number
}

export const REACTION_EXAMPLES: ReactionExample[] = [
  {
    id: 'methane',
    name: '메테인 연소',
    equation: '\\mathrm{CH_4(g) + 2O_2(g) \\rightarrow CO_2(g) + 2H_2O(l)}',
    dH: -890.3,
  },
  {
    id: 'ammonia',
    name: '암모니아 합성',
    equation: '\\mathrm{N_2(g) + 3H_2(g) \\rightarrow 2NH_3(g)}',
    dH: -92.2,
  },
  {
    id: 'vaporization',
    name: '물의 증발',
    equation: '\\mathrm{H_2O(l) \\rightarrow H_2O(g)}',
    dH: 44.0,
  },
  {
    id: 'ammonium-nitrate',
    name: '질산암모늄 용해',
    equation: '\\mathrm{NH_4NO_3(s) \\rightarrow NH_4^+(aq) + NO_3^-(aq)}',
    dH: 25.7,
  },
]

export const isExothermic = (dH: number): boolean => dH < 0
