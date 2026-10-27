import type { ReactNode } from 'react'
import { ConceptCard } from './ConceptCard'
import { ObservationGuide } from './ObservationGuide'

interface Props {
  title: string
  /** ① 개념 설명 */
  concept: ReactNode
  /** ② 핵심 수식 (FormulaBlock 목록) */
  formulas?: ReactNode
  /** ③ 인터랙티브 시각화 */
  children: ReactNode
  /** ④ 관찰 가이드 */
  guide?: ReactNode[]
}

/** 모든 섹션이 공유하는 ①설명 ②수식 ③시각화 ④관찰 가이드 구조 */
export function SectionShell({ title, concept, formulas, children, guide }: Props) {
  return (
    <article className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <ConceptCard>{concept}</ConceptCard>
        {formulas && <div className="space-y-2">{formulas}</div>}
      </div>
      {children}
      {guide && guide.length > 0 && <ObservationGuide items={guide} />}
    </article>
  )
}

/** 슬라이더 묶음 패널 */
export function ControlPanel({ title = '조절', children }: { title?: string; children: ReactNode }) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h4>
      {children}
    </div>
  )
}

/** ΔU = Q − W 부호 규약 안내 */
export function SignConventionNote() {
  return (
    <p className="rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      <strong>부호 규약</strong> ΔU = Q − W · Q &gt; 0: 계가 열을 흡수 · W &gt; 0: 계가 외부에 일을 함
    </p>
  )
}
