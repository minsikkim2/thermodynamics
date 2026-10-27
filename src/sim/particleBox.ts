import { maxwellSpeedFactor } from './random'

export interface Particle {
  x: number
  y: number
  /** 이동 방향 단위벡터 */
  dx: number
  dy: number
  /** 맥스웰 분포에서 뽑은 상대 속력 */
  speed: number
}

export const PARTICLE_RADIUS = 4

/**
 * 피스톤 용기 안의 기체 입자 (2차원 단면, 입자끼리는 충돌하지 않는 이상기체).
 * 실제 속력 = speed × speedScale. speedScale ∝ √T 이므로 T를 바꾸면 즉시 반영된다.
 */
export class ParticleBox {
  particles: Particle[] = []
  /** 마지막 step 이후 벽 충돌 횟수 */
  hits = 0

  width: number
  height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  }

  setCount(count: number) {
    while (this.particles.length < count) this.particles.push(this.spawn())
    if (this.particles.length > count) this.particles.length = count
  }

  private spawn(): Particle {
    const angle = Math.random() * 2 * Math.PI
    const r = PARTICLE_RADIUS
    return {
      x: r + Math.random() * Math.max(this.width - 2 * r, 1),
      y: r + Math.random() * Math.max(this.height - 2 * r, 1),
      dx: Math.cos(angle),
      dy: Math.sin(angle),
      speed: maxwellSpeedFactor(),
    }
  }

  /** dt [s] 동안 입자를 움직이고 벽 충돌을 센다. width는 현재 피스톤 위치. */
  step(dt: number, speedScale: number) {
    const r = PARTICLE_RADIUS
    const right = this.width - r
    const bottom = this.height - r
    for (const p of this.particles) {
      const v = p.speed * speedScale
      p.x += p.dx * v * dt
      p.y += p.dy * v * dt
      if (p.x < r) {
        p.x = r
        p.dx = Math.abs(p.dx)
        this.hits++
      } else if (p.x > right) {
        // 피스톤이 안으로 밀려 들어온 경우도 여기서 처리된다
        p.x = Math.max(right, r)
        p.dx = -Math.abs(p.dx)
        this.hits++
      }
      if (p.y < r) {
        p.y = r
        p.dy = Math.abs(p.dy)
        this.hits++
      } else if (p.y > bottom) {
        p.y = bottom
        p.dy = -Math.abs(p.dy)
        this.hits++
      }
    }
  }
}
