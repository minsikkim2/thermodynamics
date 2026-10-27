import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export interface SectionConfig {
  id: string
  title: string
  component: LazyExoticComponent<ComponentType>
}

/** "기본 개념" 탭의 섹션 목록. 사이드바와 라우팅이 이 배열에서 만들어진다. */
export const sections: SectionConfig[] = [
  { id: 'ideal-gas', title: '이상기체', component: lazy(() => import('./sections/IdealGas')) },
  { id: 'internal-energy', title: '내부에너지', component: lazy(() => import('./sections/InternalEnergy')) },
  { id: 'heat-work', title: '열과 일', component: lazy(() => import('./sections/HeatWork')) },
  { id: 'laws', title: '열역학 법칙', component: lazy(() => import('./sections/Laws')) },
  { id: 'enthalpy', title: '엔탈피', component: lazy(() => import('./sections/Enthalpy')) },
  { id: 'entropy', title: '엔트로피', component: lazy(() => import('./sections/Entropy')) },
  { id: 'gibbs', title: '깁스 자유에너지', component: lazy(() => import('./sections/Gibbs')) },
]
