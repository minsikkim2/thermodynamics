import type { ChartTheme } from '../../../hooks/useChartTheme'
import type { CycleLeg } from '../../../physics/cycles/legs'
import type { Contact } from './PistonCylinder'

/** 단계 색: 고온 등온 = 빨강, 저온 등온 = 파랑, 단열 팽창 = 주황, 단열 압축 = 보라, 그 외 가열/냉각 */
export function legColor(leg: CycleLeg, c: ChartTheme, Th: number): string {
  switch (leg.kind) {
    case 'isothermal':
      return Math.abs(leg.from.T - Th) < 1e-6 ? c.heat : c.work
    case 'adiabatic':
      return leg.W > 0 ? c.warn : c.accent
    default:
      return leg.Q > 0 ? c.heat : c.work
  }
}

export function legContact(leg: CycleLeg, Th: number): Contact {
  switch (leg.kind) {
    case 'isothermal':
      return Math.abs(leg.from.T - Th) < 1e-6 ? 'hot' : 'cold'
    case 'adiabatic':
      return 'insulated'
    default:
      return leg.Q > 0 ? 'heating' : 'cooling'
  }
}
