import { describe, expect, it } from 'vitest'
import { R } from './constants'
import { computeProcess, type ProcessInput, type ProcessKind } from './processes'

const base: Omit<ProcessInput, 'kind'> = { f: 3, n: 1, V1: 0.01, T1: 300, V2: 0.03, T2: 500 }

/** 경로 아래 면적 ∫P dV (사다리꼴) */
function areaUnderPath(path: { V: number; P: number }[]): number {
  let area = 0
  for (let i = 1; i < path.length; i++) {
    area += ((path[i].P + path[i - 1].P) / 2) * (path[i].V - path[i - 1].V)
  }
  return area
}

describe('과정별 Q, W, ΔU', () => {
  const kinds: ProcessKind[] = ['isothermal', 'isobaric', 'isochoric', 'adiabatic']

  for (const kind of kinds) {
    for (const f of [3, 5] as const) {
      for (const V2 of [0.03, 0.004]) {
        it(`${kind} (f=${f}, V₂=${V2})에서 ΔU = Q − W`, () => {
          const r = computeProcess({ ...base, kind, f, V2 })
          expect(r.dU).toBeCloseTo(r.Q - r.W, 6)
        })
      }
    }
  }

  it('등온: W = nRT ln(V₂/V₁), ΔU = 0', () => {
    const r = computeProcess({ ...base, kind: 'isothermal' })
    expect(r.W).toBeCloseTo(R * 300 * Math.log(3), 6)
    expect(r.dU).toBe(0)
    expect(r.end.T).toBe(300)
  })

  it('등압: W = PΔV, 끝 온도는 V에 비례', () => {
    const r = computeProcess({ ...base, kind: 'isobaric' })
    expect(r.W).toBeCloseTo(r.start.P * 0.02, 6)
    expect(r.end.T).toBeCloseTo(900, 9)
    expect(r.end.P).toBe(r.start.P)
  })

  it('등적: W = 0, Q = nC_vΔT', () => {
    const r = computeProcess({ ...base, kind: 'isochoric' })
    expect(r.W).toBe(0)
    expect(r.Q).toBeCloseTo(1.5 * R * 200, 6)
  })

  it('단열: Q = 0, PV^γ 일정, 팽창하면 온도가 내려간다', () => {
    const r = computeProcess({ ...base, kind: 'adiabatic' })
    const g = 5 / 3
    expect(r.Q).toBe(0)
    expect(r.start.P * r.start.V ** g).toBeCloseTo(r.end.P * r.end.V ** g, 3)
    expect(r.end.T).toBeLessThan(300)
    expect(r.W).toBeCloseTo(1.5 * R * (300 - r.end.T), 6)
  })

  it('곡선 아래 면적이 W와 같다', () => {
    for (const kind of ['isothermal', 'isobaric', 'adiabatic'] as const) {
      const r = computeProcess({ ...base, kind })
      expect(areaUnderPath(r.path) / r.W).toBeCloseTo(1, 2)
    }
  })

  it('압축하면 W < 0', () => {
    expect(computeProcess({ ...base, kind: 'isothermal', V2: 0.005 }).W).toBeLessThan(0)
  })
})
