import katex from 'katex'
import { useMemo } from 'react'

interface TexProps {
  tex: string
  display?: boolean
  className?: string
}

/** KaTeX 렌더링. react-katex 대신 katex를 직접 감싼다. */
export function Tex({ tex, display = false, className }: TexProps) {
  const html = useMemo(
    () => katex.renderToString(tex, { displayMode: display, throwOnError: false, output: 'html' }),
    [tex, display],
  )
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

interface FormulaBlockProps {
  tex: string
  /** 수식 아래 짧은 설명 */
  caption?: string
  /** 강조 표시 (현재 선택된 과정의 수식 등) */
  highlight?: boolean
}

export function FormulaBlock({ tex, caption, highlight = false }: FormulaBlockProps) {
  return (
    <figure
      className={[
        'rounded-lg border px-4 py-2 transition-colors',
        highlight
          ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/40'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
      ].join(' ')}
    >
      <Tex tex={tex} display className="block" />
      {caption && (
        <figcaption className="pb-1 text-center text-xs text-slate-500 dark:text-slate-400">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
