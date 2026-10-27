import { R, assertPositive, linspace } from './constants'

// ── 제0법칙: 두 물체의 열평형 ─────────────────────────────

export interface ContactParams {
  /** 물체 A, B의 처음 온도 [K] */
  TA: number
  TB: number
  /** 열용량 [J/K] */
  CA: number
  CB: number
  /** 접촉면의 열전달 계수 [W/K] */
  k: number
}

/** 평형 온도 T_eq = (C_A·T_A + C_B·T_B) / (C_A + C_B) */
export function equilibriumTemperature({ TA, TB, CA, CB }: ContactParams): number {
  assertPositive('C_A', CA)
  assertPositive('C_B', CB)
  return (CA * TA + CB * TB) / (CA + CB)
}

/** 온도 차가 1/e로 줄어드는 시간 상수 τ [s] */
export function relaxationTime({ CA, CB, k }: ContactParams): number {
  assertPositive('k', k)
  return 1 / (k * (1 / CA + 1 / CB))
}

/** 시각 t [s]에서 두 물체의 온도. dQ/dt = k(T_A − T_B) 모델 */
export function contactTemperatures(p: ContactParams, t: number): { TA: number; TB: number } {
  const Teq = equilibriumTemperature(p)
  const diff = (p.TA - p.TB) * Math.exp(-t / relaxationTime(p))
  return {
    TA: Teq + (p.CB / (p.CA + p.CB)) * diff,
    TB: Teq - (p.CA / (p.CA + p.CB)) * diff,
  }
}

// ── 제1법칙 ────────────────────────────────────────────

/** ΔU = Q − W (W는 계가 외부에 한 일) */
export const firstLawDeltaU = (Q: number, W: number): number => Q - W

// ── 제2법칙 ────────────────────────────────────────────

/** 카르노 효율 η = 1 − T_c / T_h (T_h > T_c > 0) */
export function carnotEfficiency(Th: number, Tc: number): number {
  assertPositive('T_h', Th)
  assertPositive('T_c', Tc)
  if (Tc >= Th) throw new RangeError('T_h는 T_c보다 커야 합니다')
  return 1 - Tc / Th
}

/** 열 Q가 온도 T_from인 물체에서 T_to인 물체로 이동할 때 전체 엔트로피 변화 [J/K] */
export function heatTransferEntropy(Q: number, Tfrom: number, Tto: number): number {
  assertPositive('T_from', Tfrom)
  assertPositive('T_to', Tto)
  return -Q / Tfrom + Q / Tto
}

// ── 제3법칙: 데바이 모형 ─────────────────────────────────

/** 데바이 적분 ∫₀^xD x⁴eˣ/(eˣ−1)² dx (심프슨 적분) */
function debyeIntegral(xD: number): number {
  const steps = 400
  const h = xD / steps
  const g = (x: number) => {
    if (x < 1e-6) return x * x // x → 0 근사
    const ex = Math.exp(x)
    return (Math.pow(x, 4) * ex) / ((ex - 1) * (ex - 1))
  }
  let sum = g(0) + g(xD)
  for (let i = 1; i < steps; i++) sum += (i % 2 === 0 ? 2 : 4) * g(i * h)
  return (sum * h) / 3
}

/** 데바이 모형의 정적 열용량 C_v(T) [J/K] */
export function debyeHeatCapacity(T: number, thetaD: number, n = 1): number {
  assertPositive('Θ_D', thetaD)
  if (T <= 0) return 0
  const xD = thetaD / T
  // 매우 낮은 온도에서는 T³ 법칙을 그대로 쓴다 (적분 상한이 무한대에 가까움)
  if (xD > 50) return ((12 * Math.PI ** 4) / 5) * n * R * Math.pow(T / thetaD, 3)
  return 9 * n * R * Math.pow(T / thetaD, 3) * debyeIntegral(xD)
}

/** 데바이 모형의 엔트로피 S(T) = ∫₀ᵀ C_v/T′ dT′ [J/K]. S(0) = 0 */
export function debyeEntropy(T: number, thetaD: number, n = 1): number {
  if (T <= 0) return 0
  // 아주 낮은 온도 구간은 해석해 S = C_v/3 (T³ 법칙)으로 처리
  const T0 = Math.min(T, thetaD / 50)
  const lowPart = debyeHeatCapacity(T0, thetaD, n) / 3
  if (T <= T0) return lowPart
  const steps = 200
  const h = (T - T0) / steps
  const f = (t: number) => debyeHeatCapacity(t, thetaD, n) / t
  let sum = f(T0) + f(T)
  for (let i = 1; i < steps; i++) sum += (i % 2 === 0 ? 2 : 4) * f(T0 + i * h)
  return lowPart + (sum * h) / 3
}

/** 0~Tmax 구간의 S(T), C_v(T) 곡선. S는 C_v/T를 누적 적분해 한 번에 구한다. */
export function debyeCurve(thetaD: number, Tmax: number, count = 120, n = 1) {
  const Ts = linspace(0, Tmax, count)
  const out = [{ T: 0, S: 0, Cv: 0 }]
  let S = 0
  for (let i = 1; i < Ts.length; i++) {
    const T = Ts[i]
    const Cv = debyeHeatCapacity(T, thetaD, n)
    if (i === 1) {
      S = Cv / 3 // 첫 구간은 T³ 법칙의 해석해
    } else {
      const prev = out[i - 1]
      S += ((Cv / T + prev.Cv / prev.T) / 2) * (T - prev.T)
    }
    out.push({ T, S, Cv })
  }
  return out
}
