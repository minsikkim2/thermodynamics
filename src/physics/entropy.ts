import { K_B, R, assertPositive } from './constants'
import { molarCv, type DegreesOfFreedom } from './internalEnergy'

export interface EntropyChange {
  /** 온도 항 nC_v ln(T₂/T₁) [J/K] */
  thermal: number
  /** 부피 항 nR ln(V₂/V₁) [J/K] */
  volumetric: number
  total: number
}

/** 이상기체 ΔS = nC_v ln(T₂/T₁) + nR ln(V₂/V₁) */
export function idealGasEntropyChange(
  f: DegreesOfFreedom,
  n: number,
  T1: number,
  T2: number,
  V1: number,
  V2: number,
): EntropyChange {
  for (const [name, v] of [['n', n], ['T1', T1], ['T2', T2], ['V1', V1], ['V2', V2]] as const) {
    assertPositive(name, v)
  }
  const thermal = n * molarCv(f) * Math.log(T2 / T1)
  const volumetric = n * R * Math.log(V2 / V1)
  return { thermal, volumetric, total: thermal + volumetric }
}

// ── 미시적 엔트로피 ─────────────────────────────────────

/** ln(n!) – 큰 n에서도 넘치지 않도록 로그를 더한다 */
export function lnFactorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new RangeError('n은 0 이상의 정수여야 합니다')
  let sum = 0
  for (let i = 2; i <= n; i++) sum += Math.log(i)
  return sum
}

/** ln C(N, k) */
export function lnBinomial(N: number, k: number): number {
  if (k < 0 || k > N) throw new RangeError('0 ≤ k ≤ N이어야 합니다')
  return lnFactorial(N) - lnFactorial(k) - lnFactorial(N - k)
}

/** N개 입자 중 k개가 왼쪽 칸에 있는 배치의 경우의 수 Ω = C(N, k) */
export const multiplicity = (N: number, k: number): number => Math.round(Math.exp(lnBinomial(N, k)))

/** S = k_B ln Ω [J/K] */
export const boltzmannEntropy = (N: number, k: number): number => K_B * lnBinomial(N, k)

/** 왼쪽 칸 입자 수가 k일 확률 C(N,k)/2^N */
export function leftCountProbabilities(N: number): number[] {
  return Array.from({ length: N + 1 }, (_, k) => Math.exp(lnBinomial(N, k) - N * Math.LN2))
}

// ── 가역/비가역 팽창과 우주의 엔트로피 ───────────────────────

export type ExpansionKind = 'reversible' | 'irreversible' | 'free'

export interface UniverseEntropy {
  system: number
  surroundings: number
  universe: number
  /** 계가 흡수한 열 [J] */
  Q: number
}

/**
 * 이상기체가 온도 T에서 V₁ → V₂로 등온 팽창할 때 엔트로피 변화.
 * - reversible: 준정적 등온 팽창
 * - irreversible: 외부 압력을 P₂로 한 번에 낮춘 팽창
 * - free: 진공으로의 자유 팽창 (Q = W = 0)
 */
export function expansionEntropy(
  kind: ExpansionKind,
  n: number,
  T: number,
  V1: number,
  V2: number,
): UniverseEntropy {
  assertPositive('n', n)
  assertPositive('T', T)
  assertPositive('V1', V1)
  assertPositive('V2', V2)
  // 상태 함수이므로 계의 ΔS는 경로와 무관하다
  const system = n * R * Math.log(V2 / V1)
  let Q: number
  switch (kind) {
    case 'reversible':
      Q = n * R * T * Math.log(V2 / V1)
      break
    case 'irreversible':
      Q = n * R * T * (1 - V1 / V2) // W = P₂(V₂ − V₁), ΔU = 0
      break
    case 'free':
      Q = 0
      break
  }
  const surroundings = -Q / T
  return { system, surroundings, universe: system + surroundings, Q }
}
