import { useId, type ReactNode } from 'react'
import { fmt } from '../lib/format'

interface Props {
  label: ReactNode
  unit?: string
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  /** 표시 자릿수 */
  digits?: number
  /** 값 옆에 덧붙일 보조 표시 (예: °C 환산) */
  secondary?: string
  disabled?: boolean
}

/**
 * 물리량 슬라이더. 물리적으로 불가능한 값(T ≤ 0 K, V ≤ 0 등)은 min/max로 막는다.
 */
export function ParameterSlider({
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
  digits = 2,
  secondary,
  disabled = false,
}: Props) {
  const id = useId()
  return (
    <div className={disabled ? 'opacity-50' : undefined}>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <label htmlFor={id} className="font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <output htmlFor={id} className="tabular-nums">
          <span className="font-semibold">{fmt(value, digits)}</span>
          {unit && <span className="ml-1 text-slate-500 dark:text-slate-400">{unit}</span>}
          {secondary && <span className="ml-2 text-xs text-slate-400">({secondary})</span>}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full cursor-pointer disabled:cursor-not-allowed"
      />
      <div className="flex justify-between text-[11px] text-slate-400 tabular-nums">
        <span>{fmt(min, digits)}</span>
        <span>{fmt(max, digits)}</span>
      </div>
    </div>
  )
}
