import type { ReactNode } from 'react'

export function ObservationGuide({ items }: { items: ReactNode[] }) {
  return (
    <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
      <h4 className="mb-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
        🔍 이렇게 바꿔보세요
      </h4>
      <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-amber-900 dark:text-amber-100/90">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>
    </aside>
  )
}
