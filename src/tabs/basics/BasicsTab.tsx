import { Suspense } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router'
import { SectionLayout } from '../../layout/SectionLayout'
import { sections } from './sections'

function SectionRoute() {
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

export default function BasicsTab() {
  return (
    <Routes>
      <Route index element={<Navigate to={sections[0].id} replace />} />
      <Route path=":sectionId" element={<SectionRoute />} />
    </Routes>
  )
}
