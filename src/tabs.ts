import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export interface TabConfig {
  id: string
  /** 상단 탭에 표시할 이름 */
  label: string
  /** URL 경로 (예: 'basics' → /basics) */
  path: string
  /** 탭 내용. 없으면 "준비 중" 화면을 보여준다 */
  component?: LazyExoticComponent<ComponentType>
}

/** 새 탭은 이 배열에 항목을 추가하기만 하면 네비게이션과 라우팅에 반영된다. */
export const tabs: TabConfig[] = [
  {
    id: 'basics',
    label: '기본 개념',
    path: 'basics',
    component: lazy(() => import('./tabs/basics/BasicsTab')),
  },
  {
    id: 'cycles',
    label: '열기관과 사이클',
    path: 'cycles',
    component: lazy(() => import('./tabs/cycles/CyclesTab')),
  },
  { id: 'phase', label: '상평형', path: 'phase' },
  { id: 'chemical', label: '화학 열역학', path: 'chemical' },
]
