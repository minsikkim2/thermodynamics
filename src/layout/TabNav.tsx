import { NavLink } from 'react-router'
import { tabs } from '../tabs'

export function TabNav() {
  return (
    <nav aria-label="주제 탭" className="-mb-px flex min-w-0 overflow-x-auto">
      {tabs.map((tab) => (
        <NavLink
          key={tab.id}
          to={`/${tab.path}`}
          className={({ isActive }) =>
            [
              'shrink-0 whitespace-nowrap border-b-2 px-3 py-3.5 text-sm font-medium transition-colors',
              isActive
                ? 'border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-300'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
              tab.component ? '' : 'opacity-60',
            ].join(' ')
          }
        >
          {tab.label}
          {!tab.component && <span className="ml-1 text-[10px] align-top">준비 중</span>}
        </NavLink>
      ))}
    </nav>
  )
}
