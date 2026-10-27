import { describe, expect, it } from 'vitest'
import { crossoverTemperature, deltaG, gibbsQuadrant, spontaneity } from './gibbs'

describe('깁스 자유에너지', () => {
  it('ΔG = ΔH − TΔS', () => {
    expect(deltaG(-50_000, 100, 300)).toBe(-80_000)
    expect(() => deltaG(0, 0, 0)).toThrow(RangeError)
  })

  it('자발성 판정', () => {
    expect(spontaneity(-1)).toBe('spontaneous')
    expect(spontaneity(1)).toBe('nonspontaneous')
    expect(spontaneity(0)).toBe('equilibrium')
  })

  it('얼음 녹는점: T* = ΔH/ΔS ≈ 273 K', () => {
    expect(crossoverTemperature(6010, 22.0)).toBeCloseTo(273.2, 0)
  })

  it('양의 교차 온도가 없으면 null', () => {
    expect(crossoverTemperature(-100, 10)).toBeNull()
    expect(crossoverTemperature(100, 0)).toBeNull()
  })

  it('ΔH, ΔS 부호 조합 4가지', () => {
    expect(gibbsQuadrant(-1, 1)).toBe('always')
    expect(gibbsQuadrant(1, -1)).toBe('never')
    expect(gibbsQuadrant(1, 1)).toBe('highT')
    expect(gibbsQuadrant(-1, -1)).toBe('lowT')
  })

  it('분류는 실제 ΔG 부호와 일치한다', () => {
    const Ts = [10, 100, 1000, 10_000]
    expect(Ts.every((T) => deltaG(-1000, 5, T) < 0)).toBe(true)
    expect(Ts.every((T) => deltaG(1000, -5, T) > 0)).toBe(true)
    expect(deltaG(1000, 5, 100)).toBeGreaterThan(0)
    expect(deltaG(1000, 5, 1000)).toBeLessThan(0)
    expect(deltaG(-1000, -5, 100)).toBeLessThan(0)
    expect(deltaG(-1000, -5, 1000)).toBeGreaterThan(0)
  })
})
