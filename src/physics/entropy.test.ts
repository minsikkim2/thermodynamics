import { describe, expect, it } from 'vitest'
import { K_B, R } from './constants'
import {
  boltzmannEntropy,
  expansionEntropy,
  idealGasEntropyChange,
  leftCountProbabilities,
  lnBinomial,
  lnFactorial,
  multiplicity,
} from './entropy'

describe('거시적 엔트로피 변화', () => {
  it('등온에서 부피가 2배: ΔS = nR ln 2', () => {
    const s = idealGasEntropyChange(3, 1, 300, 300, 0.01, 0.02)
    expect(s.thermal).toBe(0)
    expect(s.total).toBeCloseTo(R * Math.LN2, 12)
  })

  it('가역 단열(TV^(γ−1) 일정)이면 ΔS = 0', () => {
    const V1 = 0.01
    const V2 = 0.03
    const T2 = 300 * (V1 / V2) ** (2 / 5) // f = 5, γ − 1 = 2/5
    expect(idealGasEntropyChange(5, 1, 300, T2, V1, V2).total).toBeCloseTo(0, 10)
  })
})

describe('미시적 엔트로피 S = k_B ln Ω', () => {
  it('ln n!', () => {
    expect(lnFactorial(0)).toBe(0)
    expect(lnFactorial(5)).toBeCloseTo(Math.log(120), 12)
  })

  it('경우의 수 C(N, k)', () => {
    expect(multiplicity(4, 2)).toBe(6)
    expect(multiplicity(10, 0)).toBe(1)
    expect(Math.exp(lnBinomial(20, 10))).toBeCloseTo(184_756, 3)
  })

  it('모두 한쪽에 있으면 S = 0, 반반일 때 최대', () => {
    expect(boltzmannEntropy(30, 0)).toBe(0)
    expect(boltzmannEntropy(30, 15)).toBeGreaterThan(boltzmannEntropy(30, 10))
    expect(boltzmannEntropy(2, 1)).toBeCloseTo(K_B * Math.LN2, 30)
  })

  it('확률 분포의 합은 1', () => {
    const p = leftCountProbabilities(40)
    expect(p.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12)
    expect(p[0]).toBeCloseTo(2 ** -40, 20)
  })
})

describe('우주의 엔트로피', () => {
  const n = 1
  const T = 300
  const V1 = 0.01
  const V2 = 0.02

  it('가역 과정: ΔS_univ = 0', () => {
    expect(expansionEntropy('reversible', n, T, V1, V2).universe).toBeCloseTo(0, 12)
  })

  it('비가역 과정: ΔS_univ > 0, 자유 팽창이 가장 크다', () => {
    const irr = expansionEntropy('irreversible', n, T, V1, V2)
    const free = expansionEntropy('free', n, T, V1, V2)
    expect(irr.universe).toBeGreaterThan(0)
    expect(free.universe).toBeGreaterThan(irr.universe)
    expect(free.universe).toBeCloseTo(R * Math.LN2, 12)
  })

  it('계의 ΔS는 경로와 무관 (상태 함수)', () => {
    const kinds = ['reversible', 'irreversible', 'free'] as const
    const values = kinds.map((k) => expansionEntropy(k, n, T, V1, V2).system)
    expect(new Set(values).size).toBe(1)
  })
})
