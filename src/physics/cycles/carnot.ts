import { assertPositive } from '../constants'
import { heatCapacityRatio, type DegreesOfFreedom } from '../internalEnergy'
import { carnotEfficiency } from '../laws'
import { buildLeg, summarizeCycle, type CycleLeg, type CycleState } from './legs'

export interface CarnotInput {
  f: DegreesOfFreedom
  n: number
  /** 고온·저온 열원 [K], Th > Tc */
  Th: number
  Tc: number
  /** 상태 1의 부피 [m³] */
  V1: number
  /** 등온 팽창 비율 V₂/V₁ (> 1) */
  ratio: number
  /** true이면 역카르노 사이클 (냉동기·열펌프) */
  reverse?: boolean
}

export interface CarnotResult {
  /** 상태 1~4 */
  states: [CycleState, CycleState, CycleState, CycleState]
  legs: CycleLeg[]
  /** 고온 열원과 주고받은 열의 크기 */
  Qh: number
  /** 저온 열원과 주고받은 열의 크기 */
  Qc: number
  /** 계가 한 순일 (역사이클이면 음수) */
  Wnet: number
  /** W_net / Q_h (열기관) */
  efficiency: number
  /** 1 − T_c/T_h */
  carnotEfficiency: number
  sumDU: number
  sumDS: number
}

/**
 * 이상기체 카르노 사이클.
 * 1→2 등온 팽창(T_h) → 2→3 단열 팽창 → 3→4 등온 압축(T_c) → 4→1 단열 압축
 * 역사이클은 같은 네 상태를 반대 방향(1→4→3→2→1)으로 돈다.
 */
export function carnotCycle({ f, n, Th, Tc, V1, ratio, reverse = false }: CarnotInput): CarnotResult {
  assertPositive('n', n)
  assertPositive('V1', V1)
  const eta = carnotEfficiency(Th, Tc) // T_h > T_c > 0 검사 포함
  if (!(ratio > 1)) throw new RangeError('V₂/V₁은 1보다 커야 합니다')

  // 단열 과정: T V^(γ−1) = 일정 → V₃ = V₂ (T_h/T_c)^(1/(γ−1))
  const k = Math.pow(Th / Tc, 1 / (heatCapacityRatio(f) - 1))
  const V2 = V1 * ratio
  const V3 = V2 * k
  const V4 = V1 * k
  const base = { f, n }

  let legs: CycleLeg[]
  if (!reverse) {
    const l12 = buildLeg({ ...base, id: '1→2', label: '등온 팽창', kind: 'isothermal', from: { V: V1, T: Th, S: 0 }, V2 })
    const l23 = buildLeg({ ...base, id: '2→3', label: '단열 팽창', kind: 'adiabatic', from: { V: V2, T: Th, S: l12.to.S }, V2: V3 })
    const l34 = buildLeg({ ...base, id: '3→4', label: '등온 압축', kind: 'isothermal', from: { V: V3, T: Tc, S: l23.to.S }, V2: V4 })
    const l41 = buildLeg({ ...base, id: '4→1', label: '단열 압축', kind: 'adiabatic', from: { V: V4, T: Tc, S: l34.to.S }, V2: V1 })
    legs = [l12, l23, l34, l41]
  } else {
    const l14 = buildLeg({ ...base, id: '1→4', label: '단열 팽창', kind: 'adiabatic', from: { V: V1, T: Th, S: 0 }, V2: V4 })
    const l43 = buildLeg({ ...base, id: '4→3', label: '등온 팽창', kind: 'isothermal', from: { V: V4, T: Tc, S: 0 }, V2: V3 })
    const l32 = buildLeg({ ...base, id: '3→2', label: '단열 압축', kind: 'adiabatic', from: { V: V3, T: Tc, S: l43.to.S }, V2 })
    const l21 = buildLeg({ ...base, id: '2→1', label: '등온 압축', kind: 'isothermal', from: { V: V2, T: Th, S: l32.to.S }, V2: V1 })
    legs = [l14, l43, l32, l21]
  }

  const find = (V: number) => {
    for (const leg of legs) {
      if (leg.from.V === V) return leg.from
    }
    throw new Error('상태를 찾을 수 없습니다')
  }
  const states: CarnotResult['states'] = [find(V1), find(V2), find(V3), find(V4)]

  const s = summarizeCycle(legs)
  const Qh = reverse ? s.Qout : s.Qin
  const Qc = reverse ? s.Qin : s.Qout
  return {
    states,
    legs,
    Qh,
    Qc,
    Wnet: s.Wnet,
    efficiency: s.Wnet / Qh,
    carnotEfficiency: eta,
    sumDU: s.sumDU,
    sumDS: s.sumDS,
  }
}
