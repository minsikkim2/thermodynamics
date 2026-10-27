import { useState } from 'react'
import { Arrow } from '../../../../components/Arrow'
import { ConceptCard } from '../../../../components/ConceptCard'
import { FormulaBlock } from '../../../../components/FormulaBlock'
import { ObservationGuide } from '../../../../components/ObservationGuide'
import { ParameterSlider } from '../../../../components/ParameterSlider'
import { SignConventionNote } from '../../../../components/SectionShell'
import { useChartTheme } from '../../../../hooks/useChartTheme'
import { fmtSigned } from '../../../../lib/format'
import { firstLawDeltaU } from '../../../../physics/laws'

const MAX = 1000 // [J]
const thickness = (v: number) => 4 + (Math.abs(v) / MAX) * 26

export function FirstLaw() {
  const c = useChartTheme()
  const [Q, setQ] = useState(600)
  const [W, setW] = useState(250)
  const dU = firstLawDeltaU(Q, W)

  // 계(가운데 상자)
  const box = { x: 230, y: 40, w: 140, h: 160 }
  const mid = box.y + box.h / 2
  const barH = (Math.abs(dU) / (2 * MAX)) * (box.h / 2 - 10)

  return (
    <ConceptCard title="제1법칙 — 에너지 보존">
      <p>
        에너지는 생기거나 사라지지 않고 형태만 바뀝니다. 계에 들어온 열 <strong>Q</strong>는 계의 내부에너지를 늘리거나
        (<strong>ΔU</strong>), 계가 외부에 하는 일 <strong>W</strong>로 나갑니다.
      </p>
      <FormulaBlock tex="\Delta U = Q - W" caption="W: 계가 외부에 한 일" highlight />
      <SignConventionNote />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <svg viewBox="0 0 600 240" className="w-full" role="img" aria-label="에너지 흐름 다이어그램">
          {/* Q: 왼쪽에서 들어오거나 나간다 */}
          {Q >= 0 ? (
            <Arrow x1={20} y1={mid} x2={box.x - 6} y2={mid} thickness={thickness(Q)} color={c.heat} />
          ) : (
            <Arrow x1={box.x - 6} y1={mid} x2={20} y2={mid} thickness={thickness(Q)} color={c.heat} />
          )}
          <text x={110} y={mid - thickness(Q) / 2 - 14} textAnchor="middle" fontSize={14} fontWeight={700} fill={c.heat}>
            Q = {fmtSigned(Q, 0)} J
          </text>
          <text x={110} y={mid + thickness(Q) / 2 + 22} textAnchor="middle" fontSize={11} fill={c.axis}>
            {Q >= 0 ? '열 흡수' : '열 방출'}
          </text>

          {/* W: 오른쪽으로 나가거나 들어온다 */}
          {W >= 0 ? (
            <Arrow x1={box.x + box.w + 6} y1={mid} x2={580} y2={mid} thickness={thickness(W)} color={c.work} />
          ) : (
            <Arrow x1={580} y1={mid} x2={box.x + box.w + 6} y2={mid} thickness={thickness(W)} color={c.work} />
          )}
          <text x={490} y={mid - thickness(W) / 2 - 14} textAnchor="middle" fontSize={14} fontWeight={700} fill={c.work}>
            W = {fmtSigned(W, 0)} J
          </text>
          <text x={490} y={mid + thickness(W) / 2 + 22} textAnchor="middle" fontSize={11} fill={c.axis}>
            {W >= 0 ? '계가 일을 함' : '외부가 계에 일을 함'}
          </text>

          {/* 계와 ΔU 막대 */}
          <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={10} fill={c.surface} stroke={c.axis} strokeWidth={2} />
          <text x={box.x + box.w / 2} y={box.y - 10} textAnchor="middle" fontSize={12} fill={c.axis}>
            계 (기체)
          </text>
          <line x1={box.x + 20} x2={box.x + box.w - 20} y1={mid} y2={mid} stroke={c.muted} strokeDasharray="3 3" />
          <rect
            x={box.x + 45}
            y={dU >= 0 ? mid - barH : mid}
            width={50}
            height={barH}
            fill={dU >= 0 ? c.energy : c.warn}
            rx={3}
          />
          <text
            x={box.x + box.w / 2}
            y={dU >= 0 ? box.y + box.h - 12 : box.y + 22}
            textAnchor="middle"
            fontSize={14}
            fontWeight={700}
            fill={dU >= 0 ? c.energy : c.warn}
          >
            ΔU = {fmtSigned(dU, 0)} J
          </text>
        </svg>
        <div className="space-y-4">
          <ParameterSlider label="열 Q" unit="J" min={-MAX} max={MAX} step={10} value={Q} onChange={setQ} digits={0} />
          <ParameterSlider label="일 W" unit="J" min={-MAX} max={MAX} step={10} value={W} onChange={setW} digits={0} />
          <p className="rounded-md bg-slate-100 px-3 py-2 text-center text-sm tabular-nums dark:bg-slate-800">
            ΔU = {fmtSigned(Q, 0)} − ({fmtSigned(W, 0)}) = <strong>{fmtSigned(dU, 0)} J</strong>
          </p>
        </div>
      </div>
      <ObservationGuide
        items={[
          <>Q = W로 맞춰 보세요. 들어온 열이 모두 일로 나가 ΔU = 0입니다 (이상기체의 등온 과정).</>,
          <>Q = 0으로 두고 W를 양수로 올려 보세요. 열 없이 일을 하면 내부에너지가 줄어듭니다 (단열 팽창).</>,
        ]}
      />
    </ConceptCard>
  )
}
