import type { ReactNode } from 'react'
import { useTheme } from '../hooks/useTheme'
import { TabNav } from './TabNav'

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme()
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4">
          <span className="shrink-0 py-3 text-base font-bold tracking-tight">
            <span className="text-indigo-600 dark:text-indigo-400">ΔS</span> 열역학 인터랙티브
          </span>
          <TabNav />
          <button
            type="button"
            onClick={toggle}
            className="ml-auto shrink-0 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {theme === 'dark' ? '☀︎ 라이트' : '☾ 다크'}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  )
}
