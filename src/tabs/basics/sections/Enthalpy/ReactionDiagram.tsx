import { Arrow } from '../../../../components/Arrow'
import { useChartTheme } from '../../../../hooks/useChartTheme'
import { fmtSigned } from '../../../../lib/format'
import { isExothermic, type ReactionExample } from '../../../../physics/enthalpy'

const W = 480
const H = 280
const MAX_GAP = 170
const MIN_GAP = 36
/** 예시 중 가장 큰 |ΔH| — 막대 간격을 이 값에 비례시킨다 */
const SCALE_KJ = 890

/** 반응물·생성물 엔탈피 준위 다이어그램 */
export function ReactionDiagram({ reaction }: { reaction: ReactionExample }) {
  const c = useChartTheme()
  const exo = isExothermic(reaction.dH)
  const gap = Math.max(MIN_GAP, (Math.abs(reaction.dH) / SCALE_KJ) * MAX_GAP)
  const center = H / 2 + 10
  const yReact = exo ? center - gap / 2 : center + gap / 2
  const yProd = exo ? center + gap / 2 : center - gap / 2
  const color = exo ? c.heat : c.work

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="반응 엔탈피 준위 다이어그램">
      {/* H 축 */}
      <Arrow x1={30} y1={H - 20} x2={30} y2={14} thickness={2} color={c.axis} />
      <text x={40} y={22} fontSize={13} fill={c.axis}>H</text>

      <line x1={70} x2={200} y1={yReact} y2={yReact} stroke={c.text} strokeWidth={4} />
      <text x={135} y={yReact - 10} textAnchor="middle" fontSize={13} fill={c.text}>반응물</text>
      <line x1={300} x2={430} y1={yProd} y2={yProd} stroke={c.text} strokeWidth={4} />
      <text x={365} y={yProd - 10} textAnchor="middle" fontSize={13} fill={c.text}>생성물</text>
      <path
        d={`M200,${yReact} C250,${yReact} 250,${yProd} 300,${yProd}`}
        fill="none"
        stroke={c.muted}
        strokeDasharray="4 4"
      />

      <Arrow x1={250} y1={yReact} x2={250} y2={yProd} thickness={5} color={color} />
      <text x={262} y={center + 5} fontSize={15} fontWeight={700} fill={color}>
        ΔH = {fmtSigned(reaction.dH, 1)} kJ
      </text>
      <text x={W / 2} y={H - 8} textAnchor="middle" fontSize={13} fontWeight={600} fill={color}>
        {exo ? '발열 반응: 계가 주위로 열을 방출 (ΔH < 0)' : '흡열 반응: 계가 주위로부터 열을 흡수 (ΔH > 0)'}
      </text>
    </svg>
  )
}
