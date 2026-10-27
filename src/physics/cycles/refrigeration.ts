import { assertPositive } from '../constants'

function checkTemperatures(Th: number, Tc: number) {
  assertPositive('T_h', Th)
  assertPositive('T_c', Tc)
  if (Tc >= Th) throw new RangeError('T_h는 T_c보다 커야 합니다')
}

/** 카르노 냉동기 성능계수 COP = Q_c / W = T_c / (T_h − T_c) */
export function copRefrigerator(Th: number, Tc: number): number {
  checkTemperatures(Th, Tc)
  return Tc / (Th - Tc)
}

/** 카르노 열펌프 성능계수 COP = Q_h / W = T_h / (T_h − T_c) */
export function copHeatPump(Th: number, Tc: number): number {
  checkTemperatures(Th, Tc)
  return Th / (Th - Tc)
}
