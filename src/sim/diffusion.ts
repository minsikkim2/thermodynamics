import { PARTICLE_RADIUS, type Particle } from './particleBox'

/**
 * 가운데 칸막이가 있는 상자. 처음에는 모든 입자가 왼쪽 칸에 있고,
 * 칸막이를 없애면 입자가 상자 전체로 퍼진다.
 */
export class DiffusionBox {
  particles: Particle[] = []
  partition = true
  width: number
  height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  }

  reset(count: number) {
    const r = PARTICLE_RADIUS
    const half = this.width / 2
    this.partition = true
    this.particles = Array.from({ length: count }, () => {
      const angle = Math.random() * 2 * Math.PI
      return {
        x: r + Math.random() * (half - 2 * r),
        y: r + Math.random() * (this.height - 2 * r),
        dx: Math.cos(angle),
        dy: Math.sin(angle),
        speed: 0.6 + Math.random() * 0.8,
      }
    })
  }

  leftCount(): number {
    const half = this.width / 2
    return this.particles.reduce((n, p) => n + (p.x < half ? 1 : 0), 0)
  }

  step(dt: number, speedScale: number) {
    const r = PARTICLE_RADIUS
    const half = this.width / 2
    for (const p of this.particles) {
      const v = p.speed * speedScale
      const wasLeft = p.x < half
      p.x += p.dx * v * dt
      p.y += p.dy * v * dt
      if (p.x < r) {
        p.x = r
        p.dx = Math.abs(p.dx)
      } else if (p.x > this.width - r) {
        p.x = this.width - r
        p.dx = -Math.abs(p.dx)
      }
      if (p.y < r) {
        p.y = r
        p.dy = Math.abs(p.dy)
      } else if (p.y > this.height - r) {
        p.y = this.height - r
        p.dy = -Math.abs(p.dy)
      }
      // 칸막이에서 반사
      if (this.partition) {
        if (wasLeft && p.x > half - r) {
          p.x = half - r
          p.dx = -Math.abs(p.dx)
        } else if (!wasLeft && p.x < half + r) {
          p.x = half + r
          p.dx = Math.abs(p.dx)
        }
      }
    }
  }
}
