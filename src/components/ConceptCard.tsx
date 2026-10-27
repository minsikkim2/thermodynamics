import type { ReactNode } from 'react'

interface Props {
  title?: ReactNode
  children: ReactNode
  className?: string
}

export function ConceptCard({ title, children, className = '' }: Props) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {title && <h3 className="mb-3 text-base font-semibold">{title}</h3>}
      <div className="space-y-3 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </section>
  )
}
