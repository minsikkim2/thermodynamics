/** 표준 정규분포 난수 (Box–Muller) */
export function gaussian(rand: () => number = Math.random): number {
  let u = 0
  while (u === 0) u = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand())
}

/**
 * 맥스웰-볼츠만 분포를 따르는 상대 속력 (평균 제곱근 속력 = 1).
 * 세 성분이 정규분포인 3차원 속도의 크기.
 */
export function maxwellSpeedFactor(rand: () => number = Math.random): number {
  const vx = gaussian(rand)
  const vy = gaussian(rand)
  const vz = gaussian(rand)
  return Math.sqrt((vx * vx + vy * vy + vz * vz) / 3)
}
