import { describe, expect, it } from 'vitest'
import { R } from './constants'
import { energyPartition, heatCapacityRatio, internalEnergy, molarCp, molarCv } from './internalEnergy'

describe('내부에너지 U = (f/2)nRT', () => {
  it('단원자 1 mol, 300 K', () => {
    expect(internalEnergy(3, 1, 300)).toBeCloseTo(1.5 * R * 300, 9)
  })

  it('이원자는 같은 조건에서 단원자의 5/3배', () => {
    expect(internalEnergy(5, 2, 400) / internalEnergy(3, 2, 400)).toBeCloseTo(5 / 3, 12)
  })

  it('열용량과 비열비', () => {
    expect(molarCv(3)).toBeCloseTo(12.471, 3)
    expect(molarCp(5) - molarCv(5)).toBeCloseTo(R, 12)
    expect(heatCapacityRatio(3)).toBeCloseTo(5 / 3, 12)
    expect(heatCapacityRatio(5)).toBeCloseTo(1.4, 12)
  })

  it('에너지 분배: 단원자는 회전 에너지가 없고, 합은 U와 같다', () => {
    const mono = energyPartition(3, 1, 300)
    expect(mono.rotational).toBe(0)
    expect(mono.translational).toBeCloseTo(mono.total, 9)

    const di = energyPartition(5, 1, 300)
    expect(di.rotational / di.translational).toBeCloseTo(2 / 3, 12)
    expect(di.translational + di.rotational).toBeCloseTo(di.total, 9)
  })

  it('T ≤ 0은 거부한다', () => {
    expect(() => internalEnergy(3, 1, 0)).toThrow(RangeError)
  })
})
