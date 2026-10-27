import { Suspense, type ComponentType, type LazyExoticComponent } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router'
import { SectionLayout } from './SectionLayout'

export interface SectionConfig {
  id: string
  title: string
  component: LazyExoticComponent<ComponentType>
}

function SectionRoute({ sections }: { sections: SectionConfig[] }) {
  const { sectionId } = useParams()
  const section = sections.find((s) => s.id === sectionId)
  if (!section) return <Navigate to={`../${sections[0].id}`} relative="path" replace />
  const Section = section.component
  return (
    <SectionLayout sections={sections} currentId={section.id}>
      <Suspense fallback={<p className="text-sm text-slate-500">불러오는 중…</p>}>
        <Section />
      </Suspense>
    </SectionLayout>
  )
}

/** 섹션 목록만 넘기면 사이드바(모바일 드롭다운)와 /<탭>/<섹션> 라우팅을 갖춘 탭이 된다. */
export function SectionedTab({ sections }: { sections: SectionConfig[] }) {
  return (
    <Routes>
      <Route index element={<Navigate to={sections[0].id} replace />} />
      <Route path=":sectionId" element={<SectionRoute sections={sections} />} />
    </Routes>
  )
}
