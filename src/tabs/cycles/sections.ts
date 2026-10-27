import { lazy } from 'react'
import type { SectionConfig } from '../../layout/SectionedTab'

/** "열기관과 사이클" 탭의 섹션 목록 */
export const sections: SectionConfig[] = [
  { id: 'carnot', title: '카르노 사이클', component: lazy(() => import('./sections/Carnot')) },
  { id: 'refrigerator', title: '냉동기와 열펌프', component: lazy(() => import('./sections/Refrigerator')) },
  { id: 'real-cycles', title: '실제 사이클과 비교', component: lazy(() => import('./sections/RealCycles')) },
]
