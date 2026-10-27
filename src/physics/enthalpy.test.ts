import { describe, expect, it } from 'vitest'
import { R } from './constants'
import {
  REACTION_EXAMPLES,
  enthalpy,
  idealGasEnthalpy,
  isExothermic,
  isobaricHeating,
  isochoricHeating,
  temperatureRise,
} from './enthalpy'
import { internalEnergy, molarCp, molarCv } from './internalEnergy'

describe('엔탈피', () => {
  it('H = U + PV, 이상기체에서는 PV = nRT', () => {
    const U = internalEnergy(5, 2, 300)
    expect(enthalpy(U, 100_000, 0.01)).toBeCloseTo(U + 1000, 9)
    expect(idealGasEnthalpy(5, 2, 300)).toBeCloseTo(U + 2 * R * 300, 9)
  })

  it('등압 가열: Q = ΔU + PΔV = nC_pΔT', () => {
    for (const f of [3, 5] as const) {
      const h = isobaricHeating(f, 1.5, 80)
      expect(h.Q).toBeCloseTo(h.dU + h.W, 9)
      expect(h.Q).toBeCloseTo(1.5 * molarCp(f) * 80, 9)
    }
  })

  it('등적 가열: W = 0이므로 같은 ΔT에 열이 더 적게 든다', () => {
    const v = isochoricHeating(3, 1, 100)
    const p = isobaricHeating(3, 1, 100)
    expect(v.W).toBe(0)
    expect(v.dU).toBeCloseTo(p.dU, 9)
    expect(p.Q - v.Q).toBeCloseTo(R * 100, 9)
  })

  it('같은 열이면 등적 가열의 온도 상승이 더 크다', () => {
    expect(temperatureRise(1000, 1, molarCv(5))).toBeGreaterThan(temperatureRise(1000, 1, molarCp(5)))
  })

  it('반응 예시의 발열/흡열 분류', () => {
    const byId = Object.fromEntries(REACTION_EXAMPLES.map((r) => [r.id, r]))
    expect(isExothermic(byId.methane.dH)).toBe(true)
    expect(isExothermic(byId['ammonium-nitrate'].dH)).toBe(false)
  })
})
