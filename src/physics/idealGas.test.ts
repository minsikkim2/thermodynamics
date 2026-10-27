import { describe, expect, it } from 'vitest'
import { R, kelvinToCelsius, linspace } from './constants'
import { isobar, isochore, isotherm, pressure, temperature, volume } from './idealGas'

describe('constants', () => {
  it('R과 °C 변환', () => {
    expect(R).toBe(8.314)
    expect(kelvinToCelsius(273.15)).toBeCloseTo(0)
  })
  it('linspace는 양 끝점을 포함한다', () => {
    expect(linspace(0, 1, 5)).toEqual([0, 0.25, 0.5, 0.75, 1])
  })
})

describe('이상기체 PV = nRT', () => {
  it('1 mol, 273.15 K, 22.4 L에서 약 1기압', () => {
    expect(pressure(1, 273.15, 0.0224)).toBeCloseTo(101_382, -2)
  })

  it('P, V, T 함수는 서로 역관계', () => {
    const P = pressure(2, 350, 0.03)
    expect(volume(2, 350, P)).toBeCloseTo(0.03, 12)
    expect(temperature(P, 0.03, 2)).toBeCloseTo(350, 9)
  })

  it('물리적으로 불가능한 입력은 거부한다', () => {
    expect(() => pressure(1, 0, 1)).toThrow(RangeError)
    expect(() => pressure(1, 300, -1)).toThrow(RangeError)
    expect(() => volume(0, 300, 1)).toThrow(RangeError)
  })

  it('등온선에서 PV는 일정', () => {
    const pts = isotherm(1, 300, 0.001, 0.05)
    for (const { x, y } of pts) expect(x * y).toBeCloseTo(R * 300, 6)
  })

  it('등압선 V-T, 등적선 P-T는 원점을 지나는 직선', () => {
    for (const { x, y } of isobar(1, 100_000, 100, 800)) expect(y / x).toBeCloseTo(R / 100_000, 12)
    for (const { x, y } of isochore(1, 0.02, 100, 800)) expect(y / x).toBeCloseTo(R / 0.02, 9)
  })
})
