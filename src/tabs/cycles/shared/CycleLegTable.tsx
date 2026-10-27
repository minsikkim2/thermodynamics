import { fmtSigned } from '../../../lib/format'
import type { CycleLeg } from '../../../physics/cycles/legs'

interface Props {
  legs: CycleLeg[]
  colors: string[]
  activeIndex?: number
}

const ZERO = 1e-9
const isZero = (v: number) => Math.abs(v) < ZERO

/** 단계별 Q, W, ΔU, ΔS 표 (합계 포함). 0인 칸(단열의 Q, ΔS 등)을 강조한다. */
export function CycleLegTable({ legs, colors, activeIndex }: Props) {
  const total = legs.reduce(
    (s, l) => ({ Q: s.Q + l.Q, W: s.W + l.W, dU: s.dU + l.dU, dS: s.dS + l.dS }),
    { Q: 0, W: 0, dU: 0, dS: 0 },
  )
  const cell = (v: number, digits: number, highlightZero: boolean) => (
    <td
      className={[
        'px-3 py-2 text-right tabular-nums',
        highlightZero && isZero(v) ? 'bg-green-50 font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400' : '',
      ].join(' ')}
    >
      {isZero(v) ? '0' : fmtSigned(v, digits)}
    </td>
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-800">
            <th className="px-3 py-2 text-left font-medium">단계</th>
            <th className="px-3 py-2 text-left font-medium">과정</th>
            <th className="px-3 py-2 text-right font-medium">Q [J]</th>
            <th className="px-3 py-2 text-right font-medium">W [J]</th>
            <th className="px-3 py-2 text-right font-medium">ΔU [J]</th>
            <th className="px-3 py-2 text-right font-medium">ΔS [J/K]</th>
          </tr>
        </thead>
        <tbody>
          {legs.map((l, i) => (
            <tr
              key={l.id}
              className={[
                'border-b border-slate-100 dark:border-slate-800/60',
                i === activeIndex ? 'bg-indigo-50/70 dark:bg-indigo-950/30' : '',
              ].join(' ')}
            >
              <td className="px-3 py-2 font-semibold">
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: colors[i] }} />
                {l.id}
              </td>
              <td className="px-3 py-2">{l.label}</td>
              {cell(l.Q, 1, l.kind === 'adiabatic')}
              {cell(l.W, 1, l.kind === 'isochoric')}
              {cell(l.dU, 1, l.kind === 'isothermal')}
              {cell(l.dS, 3, l.kind === 'adiabatic')}
            </tr>
          ))}
          <tr className="font-semibold">
            <td className="px-3 py-2" colSpan={2}>
              한 사이클 합계
            </td>
            {cell(total.Q, 1, false)}
            {cell(total.W, 1, false)}
            {cell(total.dU, 1, true)}
            {cell(total.dS, 3, true)}
          </tr>
        </tbody>
      </table>
      <p className="mt-2 text-xs text-slate-500">
        초록 칸: 값이 0. 단열 과정은 Q = 0, ΔS = 0이고, 한 사이클을 돌면 상태함수 U와 S는 처음으로 돌아와 ΣΔU = ΣΔS = 0입니다.
      </p>
    </div>
  )
}
