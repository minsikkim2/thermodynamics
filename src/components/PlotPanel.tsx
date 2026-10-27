import type { ReactNode } from 'react'

interface Props {
  title: ReactNode
  /** 제목 오른쪽 조작 영역 (옵션 체크박스 등) */
  actions?: ReactNode
  /** 그래프 영역 높이 [px]. 지정하면 자식을 이 높이의 상자에 담는다 (Recharts ResponsiveContainer용) */
  height?: number
  footer?: ReactNode
  children: ReactNode
}

export function PlotPanel({ title, actions, height, footer, children }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h4>
        {actions}
      </div>
      {height ? <div style={{ height }}>{children}</div> : children}
      {footer && <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{footer}</div>}
    </div>
  )
}
