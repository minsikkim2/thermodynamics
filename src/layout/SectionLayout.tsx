import { NavLink, useNavigate } from 'react-router'
import type { ReactNode } from 'react'

export interface SectionLink {
  id: string
  title: string
}

interface Props {
  sections: SectionLink[]
  currentId: string
  children: ReactNode
}

/** 넓은 화면에서는 왼쪽 사이드바, 모바일에서는 상단 드롭다운으로 섹션을 이동한다. */
export function SectionLayout({ sections, currentId, children }: Props) {
  const navigate = useNavigate()
  return (
    <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8">
      <aside className="hidden lg:block">
        <nav aria-label="섹션" className="sticky top-20 space-y-0.5">
          {sections.map((s, i) => (
            <NavLink
              key={s.id}
              to={`../${s.id}`}
              relative="path"
              className={({ isActive }) =>
                [
                  'flex items-baseline gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60',
                ].join(' ')
              }
            >
              <span className="w-4 text-xs tabular-nums text-slate-400">{i + 1}</span>
              {s.title}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="mb-4 lg:hidden">
        <label htmlFor="section-select" className="sr-only">
          섹션 선택
        </label>
        <select
          id="section-select"
          value={currentId}
          onChange={(e) => navigate(`../${e.target.value}`, { relative: 'path' })}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          {sections.map((s, i) => (
            <option key={s.id} value={s.id}>
              {i + 1}. {s.title}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-0">{children}</div>
    </div>
  )
}
