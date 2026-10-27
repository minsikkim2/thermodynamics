import type { ReactNode } from 'react'

interface Option<T extends string | number> {
  value: T
  label: ReactNode
}

interface Props<T extends string | number> {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
}

export function SegmentedControl<T extends string | number>({ options, value, onChange, ariaLabel }: Props<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800"
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={[
              'rounded-md px-3 py-1.5 text-sm transition-colors',
              active
                ? 'bg-white font-semibold text-indigo-700 shadow-sm dark:bg-slate-950 dark:text-indigo-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
            ].join(' ')}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
