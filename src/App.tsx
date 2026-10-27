import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from './layout/AppShell'
import { ComingSoon } from './layout/ComingSoon'
import { tabs } from './tabs'

const Loading = () => <p className="p-8 text-sm text-slate-500">불러오는 중…</p>

export default function App() {
  return (
    <AppShell>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route index element={<Navigate to={`/${tabs[0].path}`} replace />} />
          {tabs.map(({ id, path, label, component: Tab }) => (
            <Route
              key={id}
              path={`${path}/*`}
              element={Tab ? <Tab /> : <ComingSoon title={label} />}
            />
          ))}
          <Route path="*" element={<Navigate to={`/${tabs[0].path}`} replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  )
}
