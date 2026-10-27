import { FormulaBlock } from '../../../../components/FormulaBlock'
import { SectionShell } from '../../../../components/SectionShell'
import { FirstLaw } from './FirstLaw'
import { SecondLaw } from './SecondLaw'
import { ThirdLaw } from './ThirdLaw'
import { ZerothLaw } from './ZerothLaw'

const LAWS = [
  { id: 'law-0', label: '제0법칙' },
  { id: 'law-1', label: '제1법칙' },
  { id: 'law-2', label: '제2법칙' },
  { id: 'law-3', label: '제3법칙' },
]

export default function Laws() {
  return (
    <SectionShell
      title="열역학 법칙"
      concept={
        <>
          <p>
            열역학은 네 개의 법칙 위에 서 있습니다. <strong>제0법칙</strong>은 온도를 정의하고, <strong>제1법칙</strong>은
            에너지 보존을, <strong>제2법칙</strong>은 과정이 일어나는 방향(엔트로피 증가)을, <strong>제3법칙</strong>은
            절대영도에서 엔트로피의 기준점을 정합니다.
          </p>
          <nav className="flex flex-wrap gap-2" aria-label="법칙 바로가기">
            {LAWS.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(l.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="rounded-full border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </>
      }
      formulas={
        <>
          <FormulaBlock tex="T_A = T_C,\ T_B = T_C \;\Rightarrow\; T_A = T_B" caption="제0법칙" />
          <FormulaBlock tex="\Delta U = Q - W" caption="제1법칙" />
          <FormulaBlock tex="\Delta S_{\text{우주}} \ge 0" caption="제2법칙" />
          <FormulaBlock tex="S \to 0 \quad (T \to 0\ \mathrm{K})" caption="제3법칙" />
        </>
      }
    >
      <div id="law-0" className="scroll-mt-20">
        <ZerothLaw />
      </div>
      <div id="law-1" className="scroll-mt-20">
        <FirstLaw />
      </div>
      <div id="law-2" className="scroll-mt-20">
        <SecondLaw />
      </div>
      <div id="law-3" className="scroll-mt-20">
        <ThirdLaw />
      </div>
    </SectionShell>
  )
}
