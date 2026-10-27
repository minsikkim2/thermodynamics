/** 기체 상수 R [J/(mol·K)] */
export const R = 8.314

/** 볼츠만 상수 k_B [J/K] */
export const K_B = 1.380649e-23

/** 0 °C에 해당하는 절대온도 [K] */
export const ZERO_CELSIUS_K = 273.15

export const kelvinToCelsius = (T: number): number => T - ZERO_CELSIUS_K

/** 물리적으로 불가능한 입력(0 이하)을 막는다. */
export function assertPositive(name: string, value: number): void {
  if (!(value > 0) || !Number.isFinite(value)) {
    throw new RangeError(`${name}은(는) 0보다 큰 유한한 값이어야 합니다 (입력: ${value})`)
  }
}

/** min~max 구간을 count개의 점으로 균등 분할한다. */
export function linspace(min: number, max: number, count: number): number[] {
  if (count < 2) return [min]
  const step = (max - min) / (count - 1)
  return Array.from({ length: count }, (_, i) => min + i * step)
}
