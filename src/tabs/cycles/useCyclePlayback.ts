import { useState } from 'react'
import { useAnimationFrame } from '../../hooks/useAnimationFrame'

/** 한 단계를 도는 데 걸리는 실제 시간 [s] */
const SECONDS_PER_LEG = 2

/** 사이클 진행도(0 ~ legCount) 재생 상태. 재생하면 계속 반복해서 돈다. */
export function useCyclePlayback(legCount: number) {
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(false)

  useAnimationFrame((dt) => {
    setProgress((p) => (p + dt / SECONDS_PER_LEG) % legCount)
  }, playing)

  return {
    progress,
    setProgress,
    playing,
    toggle: () => setPlaying((p) => !p),
    reset: () => {
      setPlaying(false)
      setProgress(0)
    },
  }
}
