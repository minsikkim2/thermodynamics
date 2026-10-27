import { R, assertPositive } from '../constants'
import { heatCapacityRatio, type DegreesOfFreedom } from '../internalEnergy'
import { carnotEfficiency } from '../laws'
import { buildLeg, summarizeCycle, type CycleLeg } from './legs'

export interface RealCycleInput {
  f: DegreesOfFreedom
  /** 흡기 상태(상태 1)의 압력 [Pa] — 기체량 n을 정하는 데 쓴다 */
  P1: number
  /** 사이클 최저 온도 = 흡기 온도 [K] */
  Tmin: number
  /** 사이클 최고 온도 = 연소 직후 온도 [K] */
  Tmax: number
  /** 최대 부피 (하사점) [m³] */
  Vmax: number
  /** 압축비 r = V_max / V_min */
  r: number
}

export interface RealCycleResult {
  valid: boolean
  /** valid가 false일 때 이유 */
  message?: string
  legs: CycleLeg[]
  n: number
  Qin: number
  Qout: number
  Wnet: number
  /** W_net / Q_in (단계별 에너지로 계산) */
  efficiency: number
  /** 교과서 공식으로 계산한 효율 */
  formulaEfficiency: number
  /** 같은 T_min, T_max 사이 카르노 효율 */
  carnotEfficiency: number
  /** 화면에 덧붙일 값 (예: 차단비) */
  extras: { label: string; value: number; unit?: string }[]
}

/**
 * 공기 표준 사이클 정의. 새 사이클(예: 랭킨)은 이 형태로 REAL_CYCLES에 추가한다.
 * 랭킨 사이클은 상변화가 있어 이상기체 대신 수증기 물성표(포화 온도·엔탈피 등)가 필요하다.
 */
export interface CycleDefinition {
  id: string
  name: string
  description: string
  /** KaTeX 효율 공식 */
  efficiencyTex: string
  build: (input: RealCycleInput) => RealCycleResult
}

function prepare(input: RealCycleInput) {
  const { f, P1, Tmin, Tmax, Vmax, r } = input
  for (const [k, v] of [['P1', P1], ['Tmin', Tmin], ['Tmax', Tmax], ['Vmax', Vmax]] as const) assertPositive(k, v)
  if (!(r > 1)) throw new RangeError('압축비는 1보다 커야 합니다')
  const gamma = heatCapacityRatio(f)
  const n = (P1 * Vmax) / (R * Tmin)
  const Vmin = Vmax / r
  // 단열 압축 후 온도 T₂ = T₁ r^(γ−1)
  const T2 = Tmin * Math.pow(r, gamma - 1)
  return { gamma, n, Vmin, T2, eta: carnotEfficiency(Tmax, Tmin) }
}

function invalid(n: number, eta: number, message: string, formulaEfficiency: number): RealCycleResult {
  return {
    valid: false,
    message,
    legs: [],
    n,
    Qin: 0,
    Qout: 0,
    Wnet: 0,
    efficiency: NaN,
    formulaEfficiency,
    carnotEfficiency: eta,
    extras: [],
  }
}

function finish(legs: CycleLeg[], n: number, formulaEfficiency: number, eta: number, extras: RealCycleResult['extras']): RealCycleResult {
  const s = summarizeCycle(legs)
  return {
    valid: true,
    legs,
    n,
    Qin: s.Qin,
    Qout: s.Qout,
    Wnet: s.Wnet,
    efficiency: s.Wnet / s.Qin,
    formulaEfficiency,
    carnotEfficiency: eta,
    extras,
  }
}

/** 오토 사이클: 단열 압축 → 등적 가열 → 단열 팽창 → 등적 냉각 */
export function ottoCycle(input: RealCycleInput): RealCycleResult {
  const { f, Tmin, Tmax, Vmax, r } = input
  const { gamma, n, Vmin, T2, eta } = prepare(input)
  const formula = 1 - Math.pow(r, 1 - gamma)
  if (Tmax <= T2) {
    return invalid(n, eta, `압축 후 온도(${T2.toFixed(0)} K)가 최고 온도보다 높습니다. 압축비를 낮추거나 최고 온도를 올리세요.`, formula)
  }
  const base = { f, n }
  const l12 = buildLeg({ ...base, id: '1→2', label: '단열 압축', kind: 'adiabatic', from: { V: Vmax, T: Tmin, S: 0 }, V2: Vmin })
  const l23 = buildLeg({ ...base, id: '2→3', label: '등적 가열 (연소)', kind: 'isochoric', from: { V: Vmin, T: T2, S: 0 }, T2: Tmax })
  const l34 = buildLeg({ ...base, id: '3→4', label: '단열 팽창 (동력)', kind: 'adiabatic', from: { V: Vmin, T: Tmax, S: l23.to.S }, V2: Vmax })
  const l41 = buildLeg({ ...base, id: '4→1', label: '등적 냉각 (배기)', kind: 'isochoric', from: { V: Vmax, T: l34.to.T, S: l34.to.S }, T2: Tmin })
  return finish([l12, l23, l34, l41], n, formula, eta, [])
}

/** 디젤 사이클: 단열 압축 → 등압 가열 → 단열 팽창 → 등적 냉각 */
export function dieselCycle(input: RealCycleInput): RealCycleResult {
  const { f, Tmin, Tmax, Vmax, r } = input
  const { gamma, n, Vmin, T2, eta } = prepare(input)
  // 등압 가열: V ∝ T 이므로 차단비 r_c = V₃/V₂ = T_max/T₂
  const rc = Tmax / T2
  const formula = 1 - (Math.pow(rc, gamma) - 1) / (gamma * Math.pow(r, gamma - 1) * (rc - 1))
  if (rc <= 1) {
    return invalid(n, eta, `압축 후 온도(${T2.toFixed(0)} K)가 최고 온도보다 높습니다. 압축비를 낮추거나 최고 온도를 올리세요.`, NaN)
  }
  if (rc >= r) {
    return invalid(n, eta, `차단비(${rc.toFixed(2)})가 압축비 이상입니다. 압축비를 높이거나 최고 온도를 낮추세요.`, NaN)
  }
  const base = { f, n }
  const V3 = Vmin * rc
  const l12 = buildLeg({ ...base, id: '1→2', label: '단열 압축', kind: 'adiabatic', from: { V: Vmax, T: Tmin, S: 0 }, V2: Vmin })
  const l23 = buildLeg({ ...base, id: '2→3', label: '등압 가열 (연소)', kind: 'isobaric', from: { V: Vmin, T: T2, S: 0 }, V2: V3 })
  const l34 = buildLeg({ ...base, id: '3→4', label: '단열 팽창 (동력)', kind: 'adiabatic', from: { V: V3, T: Tmax, S: l23.to.S }, V2: Vmax })
  const l41 = buildLeg({ ...base, id: '4→1', label: '등적 냉각 (배기)', kind: 'isochoric', from: { V: Vmax, T: l34.to.T, S: l34.to.S }, T2: Tmin })
  return finish([l12, l23, l34, l41], n, formula, eta, [{ label: '차단비 r_c = V₃/V₂', value: rc }])
}

export const REAL_CYCLES: CycleDefinition[] = [
  {
    id: 'otto',
    name: '오토 사이클',
    description: '가솔린 엔진의 이상화 모형. 점화 플러그로 순간 연소하므로 부피가 거의 변하지 않는 동안(등적) 열이 들어옵니다.',
    efficiencyTex: '\\eta_{\\text{Otto}} = 1 - \\frac{1}{r^{\\gamma-1}}',
    build: ottoCycle,
  },
  {
    id: 'diesel',
    name: '디젤 사이클',
    description: '디젤 엔진의 이상화 모형. 압축된 고온 공기에 연료를 분사해 피스톤이 내려가는 동안 압력이 일정하게(등압) 연소합니다.',
    efficiencyTex: '\\eta_{\\text{Diesel}} = 1 - \\frac{1}{r^{\\gamma-1}}\\,\\frac{r_c^{\\gamma}-1}{\\gamma\\,(r_c-1)}',
    build: dieselCycle,
  },
]
