import { useState } from 'react'
import { Link } from 'react-router'
import { Arrow } from '../../../../components/Arrow'
import { ConceptCard } from '../../../../components/ConceptCard'
import { FormulaBlock } from '../../../../components/FormulaBlock'
import { ObservationGuide } from '../../../../components/ObservationGuide'
import { ParameterSlider } from '../../../../components/ParameterSlider'
import { SegmentedControl } from '../../../../components/SegmentedControl'
import { ValueReadout } from '../../../../components/ValueReadout'
import { useChartTheme } from '../../../../hooks/useChartTheme'
import { temperatureColor } from '../../../../lib/color'
import { fmt, fmtSigned } from '../../../../lib/format'
import { carnotEfficiency, heatTransferEntropy } from '../../../../physics/laws'

const QH = 1000 // 고온 열원에서 받는 열 [J]
const Q_FLOW = 100 // 열흐름 실험에서 옮기는 열 [J]
const T_MIN = 100
const T_MAX = 1500
const GAP = 10

export function SecondLaw() {
  const c = useChartTheme()
  const [Th, setTh] = useState(600)
  const [Tc, setTc] = useState(300)
  const [direction, setDirection] = useState<'hotToCold' | 'coldToHot'>('hotToCold')

  const eta = carnotEfficiency(Th, Tc)
  const W = eta * QH
  const Qc = QH - W
  const w = (q: number) => 4 + (q / QH) * 36

  const dS =
    direction === 'hotToCold' ? heatTransferEntropy(Q_FLOW, Th, Tc) : heatTransferEntropy(Q_FLOW, Tc, Th)
  const possible = dS > 0

  return (
    <ConceptCard title="제2법칙 — 엔트로피와 열기관의 한계">
      <p>
        열은 스스로 고온에서 저온으로만 흐르고, 반대로 흐르게 하려면 일이 필요합니다(클라우지우스). 또 열을 100% 일로
        바꾸는 열기관은 없습니다(켈빈–플랑크). 두 열원 사이에서 작동하는 열기관의 최대 효율은{' '}
        <strong>카르노 효율</strong>로, 오직 두 열원의 온도로 정해집니다.
      </p>
      <FormulaBlock tex="\eta_{\text{Carnot}} = \frac{W}{Q_h} = 1 - \frac{T_c}{T_h}" highlight />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <svg viewBox="0 0 420 300" className="w-full" role="img" aria-label="카르노 열기관 에너지 흐름">
          <rect x={60} y={10} width={220} height={50} rx={8} fill={temperatureColor(Th, T_MIN, T_MAX)} />
          <text x={170} y={41} textAnchor="middle" fill="#fff" fontWeight={700} fontSize={14}>
            고온 열원 T_h = {fmt(Th, 0)} K
          </text>
          <rect x={60} y={240} width={220} height={50} rx={8} fill={temperatureColor(Tc, T_MIN, T_MAX)} />
          <text x={170} y={271} textAnchor="middle" fill="#fff" fontWeight={700} fontSize={14}>
            저온 열원 T_c = {fmt(Tc, 0)} K
          </text>

          <Arrow x1={170} y1={62} x2={170} y2={118} thickness={w(QH)} color={c.heat} />
          <text x={200} y={95} fontSize={13} fill={c.heat} fontWeight={600}>
            Q_h = {fmt(QH, 0)} J
          </text>
          <circle cx={170} cy={150} r={30} fill={c.surface} stroke={c.axis} strokeWidth={2} />
          <text x={170} y={155} textAnchor="middle" fontSize={13} fill={c.text} fontWeight={700}>
            열기관
          </text>
          <Arrow x1={170} y1={182} x2={170} y2={238} thickness={w(Qc)} color={c.warn} />
          <text x={200} y={215} fontSize={13} fill={c.warn} fontWeight={600}>
            Q_c = {fmt(Qc, 0)} J
          </text>
          <Arrow x1={202} y1={150} x2={330} y2={150} thickness={w(W)} color={c.work} />
          <text x={335} y={140} fontSize={13} fill={c.work} fontWeight={600}>
            W = {fmt(W, 0)} J
          </text>
        </svg>
        <div className="space-y-4">
          <ParameterSlider
            label="고온 열원 T_h"
            unit="K"
            min={T_MIN + GAP}
            max={T_MAX}
            step={10}
            value={Th}
            onChange={(v) => {
              setTh(v)
              setTc((prev) => Math.min(prev, v - GAP)) // 항상 T_c < T_h
            }}
            digits={0}
          />
          <ParameterSlider label="저온 열원 T_c" unit="K" min={T_MIN} max={Th - GAP} step={10} value={Tc} onChange={setTc} digits={0} />
          <ValueReadout label="카르노 효율 η" value={fmt(eta * 100, 1)} unit="%" tone="work" sub={`Q_h의 ${fmt(eta * 100, 1)}%만 일이 된다`} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold">열이 스스로 흐를 수 있는 방향은?</h4>
          <SegmentedControl
            ariaLabel="열흐름 방향"
            value={direction}
            onChange={setDirection}
            options={[
              { value: 'hotToCold', label: '고온 → 저온' },
              { value: 'coldToHot', label: '저온 → 고온' },
            ]}
          />
        </div>
        <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
          <svg viewBox="0 0 400 80" className="w-full" role="img" aria-label="두 물체 사이 열흐름">
            <rect x={10} y={10} width={120} height={60} rx={8} fill={temperatureColor(Th, T_MIN, T_MAX)} />
            <text x={70} y={45} textAnchor="middle" fill="#fff" fontWeight={700} fontSize={13}>{fmt(Th, 0)} K</text>
            <rect x={270} y={10} width={120} height={60} rx={8} fill={temperatureColor(Tc, T_MIN, T_MAX)} />
            <text x={330} y={45} textAnchor="middle" fill="#fff" fontWeight={700} fontSize={13}>{fmt(Tc, 0)} K</text>
            {direction === 'hotToCold' ? (
              <Arrow x1={140} y1={40} x2={260} y2={40} thickness={14} color={c.heat} />
            ) : (
              <Arrow x1={260} y1={40} x2={140} y2={40} thickness={14} color={c.muted} />
            )}
            {!possible && (
              <text x={200} y={22} textAnchor="middle" fontSize={22} fill={c.heat} fontWeight={700}>✕</text>
            )}
          </svg>
          <div className="space-y-2">
            <ValueReadout
              label={`Q = ${Q_FLOW} J 이동 시 ΔS_전체`}
              value={fmtSigned(dS, 4)}
              unit="J/K"
              tone={possible ? 'good' : 'bad'}
            />
            <p className={`text-sm font-medium ${possible ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {possible ? '자발적으로 일어남 (ΔS > 0)' : '저절로 일어나지 않음 (ΔS < 0) — 일이 필요'}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">ΔS_전체 = −Q/T_보내는쪽 + Q/T_받는쪽</p>
      </div>

      <ObservationGuide
        items={[
          <>T_c를 T_h에 가깝게 올려 보세요. 효율이 0에 가까워집니다. 온도 차가 없으면 일을 얻을 수 없습니다.</>,
          <>T_h를 높이고 T_c를 낮출수록 효율이 올라가지만, T_c &gt; 0 K이므로 100%에는 도달할 수 없습니다.</>,
          <>열흐름 방향을 &ldquo;저온 → 고온&rdquo;으로 바꿔 보세요. 전체 엔트로피가 줄어들어 저절로는 불가능합니다.</>,
        ]}
      />
      <Link
        to="/cycles/carnot"
        className="flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-800 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200 dark:hover:bg-indigo-950/70"
      >
        <span>열기관과 사이클 탭에서 카르노 사이클을 단계별로 살펴보기</span>
        <span aria-hidden>→</span>
      </Link>
    </ConceptCard>
  )
}
