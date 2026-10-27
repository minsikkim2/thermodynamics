import { R, assertPositive, linspace } from './constants'
import { pressure } from './idealGas'
import { heatCapacityRatio, molarCp, molarCv, type DegreesOfFreedom } from './internalEnergy'

export type ProcessKind = 'isothermal' | 'isobaric' | 'isochoric' | 'adiabatic'

export interface GasState {
  P: number
  V: number
  T: number
}

export interface ProcessInput {
  kind: ProcessKind
  f: DegreesOfFreedom
  n: number
  /** 시작 상태 */
  V1: number
  T1: number
  /** 등온·등압·단열 과정의 끝 부피 */
  V2: number
  /** 등적 과정의 끝 온도 */
  T2: number
}

export interface ProcessResult {
  start: GasState
  end: GasState
  /** 계가 외부에 한 일 [J] */
  W: number
  /** 계가 흡수한 열 [J] */
  Q: number
  /** 내부에너지 변화 [J] */
  dU: number
  /** P-V 선도 위 경로 (V [m³], P [Pa]) */
  path: { V: number; P: number }[]
}

const PATH_POINTS = 60

/**
 * 이상기체 준정적 과정의 Q, W, ΔU를 계산한다.
 * 부호 규약: ΔU = Q − W (W는 계가 외부에 한 일)
 */
export function computeProcess(input: ProcessInput): ProcessResult {
  const { kind, f, n, V1, T1 } = input
  assertPositive('n', n)
  assertPositive('V1', V1)
  assertPositive('T1', T1)
  const Cv = molarCv(f)
  const P1 = pressure(n, T1, V1)
  const start: GasState = { P: P1, V: V1, T: T1 }

  switch (kind) {
    case 'isothermal': {
      const V2 = input.V2
      assertPositive('V2', V2)
      const W = n * R * T1 * Math.log(V2 / V1)
      return {
        start,
        end: { P: pressure(n, T1, V2), V: V2, T: T1 },
        W,
        Q: W,
        dU: 0,
        path: linspace(V1, V2, PATH_POINTS).map((V) => ({ V, P: pressure(n, T1, V) })),
      }
    }
    case 'isobaric': {
      const V2 = input.V2
      assertPositive('V2', V2)
      const T2 = (T1 * V2) / V1
      const dT = T2 - T1
      return {
        start,
        end: { P: P1, V: V2, T: T2 },
        W: P1 * (V2 - V1),
        Q: n * molarCp(f) * dT,
        dU: n * Cv * dT,
        path: [
          { V: V1, P: P1 },
          { V: V2, P: P1 },
        ],
      }
    }
    case 'isochoric': {
      const T2 = input.T2
      assertPositive('T2', T2)
      const dU = n * Cv * (T2 - T1)
      const P2 = pressure(n, T2, V1)
      return {
        start,
        end: { P: P2, V: V1, T: T2 },
        W: 0,
        Q: dU,
        dU,
        path: [
          { V: V1, P: P1 },
          { V: V1, P: P2 },
        ],
      }
    }
    case 'adiabatic': {
      const V2 = input.V2
      assertPositive('V2', V2)
      const gamma = heatCapacityRatio(f)
      // TV^(γ−1) = 일정
      const T2 = T1 * Math.pow(V1 / V2, gamma - 1)
      const P2 = pressure(n, T2, V2)
      const W = (P1 * V1 - P2 * V2) / (gamma - 1)
      // PV^γ = 일정
      const K = P1 * Math.pow(V1, gamma)
      return {
        start,
        end: { P: P2, V: V2, T: T2 },
        W,
        Q: 0,
        dU: -W,
        path: linspace(V1, V2, PATH_POINTS).map((V) => ({ V, P: K / Math.pow(V, gamma) })),
      }
    }
  }
}
