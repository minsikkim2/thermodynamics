import { useEffect, useRef, useState } from 'react'
import { useAnimationFrame } from '../../../../hooks/useAnimationFrame'
import { useChartTheme } from '../../../../hooks/useChartTheme'
import { useElementWidth } from '../../../../hooks/useElementWidth'
import { PARTICLE_RADIUS, ParticleBox } from '../../../../sim/particleBox'

interface Props {
  /** 온도 [K] */
  T: number
  /** 용기 부피 비율 (0~1], 피스톤 위치 */
  volumeFraction: number
  particleCount: number
}

const HEIGHT = 240
const PISTON_W = 14
const ROD_SPACE = 48
/** 300 K에서 평균 제곱근 속력 [px/s] */
const BASE_SPEED = 110

/** 피스톤 용기 속 기체 입자 애니메이션 */
export function ParticleCanvas({ T, volumeFraction, particleCount }: Props) {
  const [wrapRef, width] = useElementWidth<HTMLDivElement>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const boxRef = useRef<ParticleBox | null>(null)
  // 시뮬레이션 객체는 렌더와 무관하게 effect/애니메이션 안에서만 만들고 다룬다
  const getBox = () => (boxRef.current ??= new ParticleBox(600, HEIGHT))
  const colors = useChartTheme()
  const [hitRate, setHitRate] = useState(0)
  const hitAcc = useRef({ hits: 0, time: 0, ema: 0 })

  const maxBoxWidth = Math.max(width - ROD_SPACE - PISTON_W, 100)
  const boxWidth = maxBoxWidth * volumeFraction

  useEffect(() => {
    getBox().setCount(particleCount)
  }, [particleCount])

  // 캔버스 해상도를 화면 배율에 맞춘다
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = HEIGHT * dpr
    canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0)
  }, [width])

  useAnimationFrame((dt) => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const box = getBox()
    box.width = boxWidth
    box.height = HEIGHT
    const tempFactor = Math.sqrt(T / 300)
    box.step(dt, BASE_SPEED * tempFactor)

    // 벽 충돌 빈도 (지수이동평균)
    const acc = hitAcc.current
    acc.hits += box.hits
    acc.time += dt
    box.hits = 0
    if (acc.time >= 0.5) {
      const rate = acc.hits / acc.time
      acc.ema = acc.ema === 0 ? rate : acc.ema * 0.6 + rate * 0.4
      setHitRate(acc.ema)
      acc.hits = 0
      acc.time = 0
    }

    // 그리기
    ctx.clearRect(0, 0, width, HEIGHT)
    // 용기
    ctx.fillStyle = colors.surface
    ctx.fillRect(0, 0, boxWidth, HEIGHT)
    ctx.strokeStyle = colors.axis
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(maxBoxWidth + PISTON_W, 1.5)
    ctx.lineTo(1.5, 1.5)
    ctx.lineTo(1.5, HEIGHT - 1.5)
    ctx.lineTo(maxBoxWidth + PISTON_W, HEIGHT - 1.5)
    ctx.stroke()
    // 피스톤과 막대
    ctx.fillStyle = colors.muted
    ctx.fillRect(boxWidth, 3, PISTON_W, HEIGHT - 6)
    ctx.fillRect(boxWidth + PISTON_W, HEIGHT / 2 - 5, width - boxWidth - PISTON_W, 10)
    // 입자: 속력에 따라 파랑(느림) → 빨강(빠름)
    for (const p of box.particles) {
      const s = p.speed * tempFactor
      const hue = 230 - Math.min(Math.max((s - 0.3) / 2.2, 0), 1) * 230
      ctx.fillStyle = `hsl(${hue} 85% 55%)`
      ctx.beginPath()
      ctx.arc(p.x, p.y, PARTICLE_RADIUS, 0, 2 * Math.PI)
      ctx.fill()
    }
  })

  return (
    <div ref={wrapRef} className="w-full">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: HEIGHT }}
        aria-label="피스톤 용기 속 기체 입자 애니메이션"
        role="img"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>
          입자 {particleCount}개 · 벽 충돌 빈도 <strong className="tabular-nums text-slate-800 dark:text-slate-200">{Math.round(hitRate)}</strong>회/s
          (시뮬레이션 상대값)
        </span>
        <span className="flex items-center gap-1">
          느림
          <span className="inline-block h-2 w-16 rounded bg-gradient-to-r from-[hsl(230_85%_55%)] via-[hsl(115_85%_55%)] to-[hsl(0_85%_55%)]" />
          빠름
        </span>
      </div>
    </div>
  )
}
