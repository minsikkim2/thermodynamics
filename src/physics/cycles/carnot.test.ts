import { describe, expect, it } from 'vitest'
import { R } from '../constants'
import { carnotCycle, type CarnotInput } from './carnot'
import { cyclePath, stateAtProgress } from './legs'

const base: CarnotInput = { f: 3, n: 1, Th: 600, Tc: 300, V1: 0.005, ratio: 2 }

describe('카르노 사이클', () => {
  const cases: Partial<CarnotInput>[] = [
    {},
    { f: 5 },
    { Th: 1200, Tc: 250 },
    { Th: 400, Tc: 390 },
    { ratio: 5, n: 2.5 },
    { f: 5, Th: 900, Tc: 150, ratio: 1.2, V1: 0.02 },
  ]

  for (const c of cases) {
    const input = { ...base, ...c }
    it(`η = W_net/Q_h = 1 − T_c/T_h (${JSON.stringify(c)})`, () => {
      const r = carnotCycle(input)
      expect(r.efficiency).toBeCloseTo(1 - input.Tc / input.Th, 9)
      expect(r.efficiency).toBeCloseTo(r.carnotEfficiency, 9)
    })
  }

  it('Q_h = nRT_h ln(V₂/V₁), W_net = Q_h − Q_c', () => {
    const r = carnotCycle(base)
    expect(r.Qh).toBeCloseTo(R * 600 * Math.log(2), 6)
    expect(r.Qc).toBeCloseTo(R * 300 * Math.log(2), 6)
    expect(r.Wnet).toBeCloseTo(r.Qh - r.Qc, 6)
  })

  it('단열 단계는 Q = 0, ΔS = 0이고 등온 단계 ΔS는 크기가 같고 부호가 반대', () => {
    const [l12, l23, l34, l41] = carnotCycle({ ...base, f: 5 }).legs
    for (const leg of [l23, l41]) {
      expect(leg.Q).toBe(0)
      expect(leg.dS).toBe(0)
    }
    expect(l12.dS).toBeCloseTo(R * Math.log(2), 9)
    expect(l34.dS).toBeCloseTo(-l12.dS, 9)
  })

  it('한 바퀴 돌면 ΣΔU = 0, ΣΔS = 0이고 상태 1로 돌아온다', () => {
    const r = carnotCycle(base)
    expect(r.sumDU).toBeCloseTo(0, 6)
    expect(r.sumDS).toBeCloseTo(0, 9)
    const last = r.legs[3].to
    expect(last.V).toBeCloseTo(r.states[0].V, 12)
    expect(last.T).toBeCloseTo(r.states[0].T, 6)
    expect(last.P).toBeCloseTo(r.states[0].P, 3)
  })

  it('V₂/V₁을 키우면 W_net은 커지지만 효율은 그대로', () => {
    const small = carnotCycle({ ...base, ratio: 1.5 })
    const large = carnotCycle({ ...base, ratio: 4 })
    expect(large.Wnet).toBeGreaterThan(small.Wnet)
    expect(large.efficiency).toBeCloseTo(small.efficiency, 9)
  })

  it('T_c를 낮추면 효율이 올라간다', () => {
    expect(carnotCycle({ ...base, Tc: 200 }).efficiency).toBeGreaterThan(carnotCycle(base).efficiency)
  })

  it('경로 위 온도·엔트로피: 등온은 T 일정, 단열은 S 일정', () => {
    const [l12, l23] = carnotCycle(base).legs
    for (const p of l12.path) expect(p.T).toBeCloseTo(600, 6)
    for (const p of l23.path) expect(p.S).toBe(l23.from.S)
  })

  it('진행도에 따른 상태: 정수 진행도는 각 꼭짓점, 끝은 상태 1', () => {
    const r = carnotCycle(base)
    expect(stateAtProgress(r.legs, 0).state.V).toBeCloseTo(r.states[0].V, 12)
    expect(stateAtProgress(r.legs, 1).state.V).toBeCloseTo(r.states[1].V, 12)
    expect(stateAtProgress(r.legs, 2).legIndex).toBe(2)
    expect(stateAtProgress(r.legs, 4).state.V).toBeCloseTo(r.states[0].V, 12)
    expect(cyclePath(r.legs).length).toBe(r.legs.reduce((n, l) => n + l.path.length - 1, 1))
  })

  it('불가능한 입력은 거부한다', () => {
    expect(() => carnotCycle({ ...base, Tc: 600 })).toThrow(RangeError)
    expect(() => carnotCycle({ ...base, ratio: 1 })).toThrow(RangeError)
  })

  it('역사이클: 같은 상태를 반대로 돌며 W_net < 0, 열은 저온에서 흡수해 고온으로 방출', () => {
    const fwd = carnotCycle(base)
    const rev = carnotCycle({ ...base, reverse: true })
    expect(rev.Wnet).toBeCloseTo(-fwd.Wnet, 6)
    expect(rev.Qh).toBeCloseTo(fwd.Qh, 6)
    expect(rev.Qc).toBeCloseTo(fwd.Qc, 6)
    expect(rev.legs.map((l) => l.id)).toEqual(['1→4', '4→3', '3→2', '2→1'])
    expect(rev.legs[1].Q).toBeGreaterThan(0) // 저온 등온 팽창에서 흡수
    expect(rev.legs[3].Q).toBeLessThan(0) // 고온 등온 압축에서 방출
    expect(rev.sumDS).toBeCloseTo(0, 9)
  })
})
