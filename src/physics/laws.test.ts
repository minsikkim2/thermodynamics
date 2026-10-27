import { describe, expect, it } from 'vitest'
import { R } from './constants'
import {
  carnotEfficiency,
  contactTemperatures,
  debyeCurve,
  debyeEntropy,
  debyeHeatCapacity,
  equilibriumTemperature,
  firstLawDeltaU,
  heatTransferEntropy,
  relaxationTime,
} from './laws'

describe('제0법칙: 열평형', () => {
  const p = { TA: 500, TB: 300, CA: 20, CB: 60, k: 1 }

  it('평형 온도는 열용량 가중 평균', () => {
    expect(equilibriumTemperature(p)).toBeCloseTo(350, 9)
  })

  it('t = 0에서 처음 온도, t → ∞에서 평형 온도', () => {
    expect(contactTemperatures(p, 0).TA).toBeCloseTo(500, 9)
    expect(contactTemperatures(p, 0).TB).toBeCloseTo(300, 9)
    const late = contactTemperatures(p, 50 * relaxationTime(p))
    expect(late.TA).toBeCloseTo(350, 6)
    expect(late.TB).toBeCloseTo(350, 6)
  })

  it('전체 에너지 C_A·T_A + C_B·T_B가 보존된다', () => {
    const E0 = p.CA * p.TA + p.CB * p.TB
    for (const t of [1, 5, 20]) {
      const { TA, TB } = contactTemperatures(p, t)
      expect(p.CA * TA + p.CB * TB).toBeCloseTo(E0, 6)
    }
  })
})

describe('제1법칙', () => {
  it('ΔU = Q − W', () => {
    expect(firstLawDeltaU(500, 200)).toBe(300)
    expect(firstLawDeltaU(-100, 50)).toBe(-150)
  })
})

describe('제2법칙', () => {
  it('카르노 효율', () => {
    expect(carnotEfficiency(600, 300)).toBeCloseTo(0.5, 12)
    expect(() => carnotEfficiency(300, 300)).toThrow(RangeError)
    expect(() => carnotEfficiency(300, 0)).toThrow(RangeError)
  })

  it('고온 → 저온 열흐름만 전체 엔트로피를 증가시킨다', () => {
    expect(heatTransferEntropy(100, 500, 300)).toBeGreaterThan(0)
    expect(heatTransferEntropy(100, 300, 500)).toBeLessThan(0)
  })
})

describe('제3법칙: 데바이 모형', () => {
  const theta = 300

  it('T = 0에서 S = 0', () => {
    expect(debyeEntropy(0, theta)).toBe(0)
  })

  it('저온에서 C_v ∝ T³', () => {
    const c1 = debyeHeatCapacity(2, theta)
    const c2 = debyeHeatCapacity(4, theta)
    expect(c2 / c1).toBeCloseTo(8, 3)
  })

  it('고온에서 C_v → 3R (뒬롱-프티)', () => {
    expect(debyeHeatCapacity(3000, theta) / (3 * R)).toBeCloseTo(1, 2)
  })

  it('엔트로피는 온도에 따라 단조 증가하고 저온 해석해와 일치', () => {
    let prev = 0
    for (const T of [1, 10, 50, 100, 200, 300]) {
      const S = debyeEntropy(T, theta)
      expect(S).toBeGreaterThan(prev)
      prev = S
    }
    const curve = debyeCurve(theta, 300)
    expect(curve[0].S).toBe(0)
    expect(curve[curve.length - 1].S / debyeEntropy(300, theta)).toBeCloseTo(1, 2)

    const T = 5
    const analytic = ((4 * Math.PI ** 4) / 5) * R * (T / theta) ** 3
    expect(debyeEntropy(T, theta) / analytic).toBeCloseTo(1, 3)
  })
})
