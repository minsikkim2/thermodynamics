import { useEffect, useRef } from 'react'

/** 매 프레임마다 callback(dt[s])을 호출한다. active가 false이면 멈춘다. */
export function useAnimationFrame(callback: (dt: number) => void, active = true) {
  const cb = useRef(callback)
  useEffect(() => {
    cb.current = callback
  })

  useEffect(() => {
    if (!active) return
    let id = 0
    let last = performance.now()
    const loop = (now: number) => {
      // 탭이 숨겨졌다 돌아올 때 큰 점프를 막는다
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      cb.current(dt)
      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [active])
}
