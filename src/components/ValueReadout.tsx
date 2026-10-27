import type { ReactNode } from 'react'

interface Props {
  label: ReactNode
  value: string
  unit?: string
  sub?: ReactNode
  tone?: 'default' | 'good' | 'bad' | 'heat' | 'work' | 'energy'
}

const toneClass: Record<NonNullable<Props['tone']>, string> = {
  default: 'text-slate-900 dark:text-slate-100',
  good: 'text-green-700 dark:text-green-400',
  bad: 'text-red-700 dark:text-red-400',
  heat: 'text-red-600 dark:text-red-400',
  work: 'text-blue-600 dark:text-blue-400',
  energy: 'text-green-600 dark:text-green-400',
}

/** 계산값 표시 카드 */
export function ValueReadout({ label, value, unit, sub, tone = 'default' }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className={`text-lg font-semibold tabular-nums ${toneClass[tone]}`}>
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-slate-500 dark:text-slate-400">{unit}</span>}
      </div>
      {sub && <div className="text-xs text-slate-500 dark:text-slate-400">{sub}</div>}
    </div>
  )
}
