import { describe, expect, it } from 'vitest'
import { carnotCycle } from './carnot'
import { copHeatPump, copRefrigerator } from './refrigeration'

describe('냉동기와 열펌프', () => {
  it('COP 공식', () => {
    expect(copRefrigerator(300, 250)).toBeCloseTo(5, 12)
    expect(copHeatPump(300, 250)).toBeCloseTo(6, 12)
  })

  it('COP_열펌프 = COP_냉동 + 1', () => {
    for (const [Th, Tc] of [[300, 270], [500, 200], [1000, 990]]) {
      expect(copHeatPump(Th, Tc)).toBeCloseTo(copRefrigerator(Th, Tc) + 1, 9)
    }
  })

  it('역카르노 사이클의 에너지로 계산한 COP가 공식과 일치', () => {
    for (const f of [3, 5] as const) {
      const r = carnotCycle({ f, n: 1, Th: 320, Tc: 260, V1: 0.005, ratio: 2.5, reverse: true })
      const Win = -r.Wnet
      expect(Win).toBeGreaterThan(0)
      expect(r.Qc / Win).toBeCloseTo(copRefrigerator(320, 260), 9)
      expect(r.Qh / Win).toBeCloseTo(copHeatPump(320, 260), 9)
      expect(r.Qh).toBeCloseTo(r.Qc + Win, 6)
    }
  })

  it('온도 차가 줄수록 COP가 커진다', () => {
    expect(copRefrigerator(300, 290)).toBeGreaterThan(copRefrigerator(300, 250))
  })

  it('T_h ≤ T_c는 거부한다', () => {
    expect(() => copRefrigerator(300, 300)).toThrow(RangeError)
    expect(() => copHeatPump(0, -1)).toThrow(RangeError)
  })
})
