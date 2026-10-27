import { R } from '../constants'
import { idealGasEntropyChange } from '../entropy'
import type { DegreesOfFreedom } from '../internalEnergy'
import { computeProcess, type ProcessKind } from '../processes'

// 모든 값은 SI 단위: P [Pa], V [m³], T [K], S [J/K], 에너지 [J]

export interface CycleState {
  P: number
  V: number
  T: number
  /** 기준 상태(사이클의 상태 1)에 대한 상대 엔트로피 */
  S: number
}

export interface CycleLeg {
  /** 예: '1→2' */
  id: string
  /** 예: '등온 팽창' */
  label: string
  kind: ProcessKind
  from: CycleState
  to: CycleState
  Q: number
  W: number
  dU: number
  dS: number
  /** 경로 위 점들 (P-V, T-S 선도와 애니메이션용) */
  path: CycleState[]
}

export interface LegInput {
  id: string
  label: string
  kind: ProcessKind
  f: DegreesOfFreedom
  n: number
  from: { V: number; T: number; S: number }
  /** 등온·등압·단열의 끝 부피 */
  V2?: number
  /** 등적의 끝 온도 */
  T2?: number
}

/** 기존 computeProcess(Q, W, ΔU, P-V 경로)에 엔트로피와 온도를 더해 사이클의 한 단계를 만든다. */
export function buildLeg({ id, label, kind, f, n, from, V2, T2 }: LegInput): CycleLeg {
  const r = computeProcess({ kind, f, n, V1: from.V, T1: from.T, V2: V2 ?? from.V, T2: T2 ?? from.T })
  const entropyAt = (V: number, T: number) => from.S + idealGasEntropyChange(f, n, from.T, T, from.V, V).total

  // 등적·등압은 경로가 두 점뿐이므로 T-S 곡선을 위해 촘촘히 나눈다
  const raw = r.path.length > 2 ? r.path : subdivide(r.path[0], r.path[1], 40)
  const path = raw.map(({ V, P }) => {
    const T = (P * V) / (n * R)
    return { P, V, T, S: entropyAt(V, T) }
  })
  // 단열 과정은 수치 오차 없이 ΔS = 0
  if (kind === 'adiabatic') path.forEach((p) => (p.S = from.S))

  const start = { ...r.start, S: from.S }
  const end = { ...r.end, S: kind === 'adiabatic' ? from.S : entropyAt(r.end.V, r.end.T) }
  path[0] = start
  path[path.length - 1] = end
  return { id, label, kind, from: start, to: end, Q: r.Q, W: r.W, dU: r.dU, dS: end.S - start.S, path }
}

function subdivide(a: { V: number; P: number }, b: { V: number; P: number }, count: number) {
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1)
    return { V: a.V + (b.V - a.V) * t, P: a.P + (b.P - a.P) * t }
  })
}

export interface CycleSummary {
  /** 계가 흡수한 열의 합 (양수) */
  Qin: number
  /** 계가 방출한 열의 합 (양수) */
  Qout: number
  /** 계가 한 순일 ΣW (열기관 > 0, 냉동기 < 0) */
  Wnet: number
  sumDU: number
  sumDS: number
}

export function summarizeCycle(legs: CycleLeg[]): CycleSummary {
  let Qin = 0
  let Qout = 0
  let Wnet = 0
  let sumDU = 0
  let sumDS = 0
  for (const leg of legs) {
    if (leg.Q > 0) Qin += leg.Q
    else Qout -= leg.Q
    Wnet += leg.W
    sumDU += leg.dU
    sumDS += leg.dS
  }
  return { Qin, Qout, Wnet, sumDU, sumDS }
}

/**
 * 진행도 progress ∈ [0, legs.length]에 해당하는 상태 (애니메이션용).
 * 정수 부분은 단계 번호, 소수 부분은 그 단계 경로 위의 위치.
 */
export function stateAtProgress(legs: CycleLeg[], progress: number): { legIndex: number; state: CycleState } {
  const clamped = Math.min(Math.max(progress, 0), legs.length)
  const legIndex = Math.min(Math.floor(clamped), legs.length - 1)
  const path = legs[legIndex].path
  const pos = (clamped - legIndex) * (path.length - 1)
  const i = Math.min(Math.floor(pos), path.length - 2)
  const t = pos - i
  const a = path[i]
  const b = path[i + 1]
  const lerp = (x: number, y: number) => x + (y - x) * t
  return { legIndex, state: { P: lerp(a.P, b.P), V: lerp(a.V, b.V), T: lerp(a.T, b.T), S: lerp(a.S, b.S) } }
}

/** 사이클 전체 경로를 이어 붙인다 (마지막 점 중복 제거) */
export function cyclePath(legs: CycleLeg[]): CycleState[] {
  return legs.flatMap((leg, i) => (i === legs.length - 1 ? leg.path : leg.path.slice(0, -1)))
}
