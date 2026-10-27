import { describe, expect, it } from 'vitest'
import { REAL_CYCLES, dieselCycle, ottoCycle, type RealCycleInput } from './realCycles'

const base: RealCycleInput = { f: 5, P1: 101_325, Tmin: 300, Tmax: 1800, Vmax: 0.0005, r: 8 }

describe('오토 사이클', () => {
  it('단계별 에너지로 구한 η = 1 − r^(1−γ)', () => {
    for (const r of [4, 8, 12]) {
      const o = ottoCycle({ ...base, r })
      expect(o.valid).toBe(true)
      expect(o.efficiency).toBeCloseTo(1 - Math.pow(r, -0.4), 9)
      expect(o.efficiency).toBeCloseTo(o.formulaEfficiency, 9)
    }
  })

  it('한 사이클 ΣΔU = 0, ΣΔS = 0, W_net = Q_in − Q_out', () => {
    const o = ottoCycle(base)
    const sumDU = o.legs.reduce((s, l) => s + l.dU, 0)
    const sumDS = o.legs.reduce((s, l) => s + l.dS, 0)
    expect(sumDU).toBeCloseTo(0, 6)
    expect(sumDS).toBeCloseTo(0, 9)
    expect(o.Wnet).toBeCloseTo(o.Qin - o.Qout, 6)
    expect(o.legs[3].to.T).toBeCloseTo(base.Tmin, 6)
  })

  it('압축 후 온도가 최고 온도보다 높으면 무효', () => {
    expect(ottoCycle({ ...base, Tmax: 600 }).valid).toBe(false)
  })
})

describe('디젤 사이클', () => {
  it('단계별 에너지로 구한 효율이 공식과 일치', () => {
    for (const f of [3, 5] as const) {
      // 단원자는 r = 18에서 압축 후 2061 K이므로 최고 온도를 그보다 높게 둔다
      const d = dieselCycle({ ...base, f, r: 18, Tmax: 2500 })
      expect(d.valid).toBe(true)
      expect(d.efficiency).toBeCloseTo(d.formulaEfficiency, 9)
      expect(d.legs[1].to.P).toBeCloseTo(d.legs[1].from.P, 6) // 등압
    }
  })

  it('차단비가 1 이하이거나 압축비 이상이면 무효', () => {
    expect(dieselCycle({ ...base, Tmax: 600 }).valid).toBe(false)
    expect(dieselCycle({ ...base, r: 2, Tmax: 2500 }).valid).toBe(false)
  })
})

describe('카르노와 비교', () => {
  it('같은 T_min, T_max에서 오토·디젤 효율은 카르노보다 작다', () => {
    for (const c of REAL_CYCLES) {
      const res = c.build(base)
      expect(res.valid).toBe(true)
      expect(res.efficiency).toBeLessThan(res.carnotEfficiency)
      expect(res.carnotEfficiency).toBeCloseTo(1 - 300 / 1800, 12)
    }
  })

  it('같은 압축비에서 오토 효율 > 디젤 효율', () => {
    expect(ottoCycle(base).efficiency).toBeGreaterThan(dieselCycle(base).efficiency)
  })
})
