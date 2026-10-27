import { Arrow } from '../../../components/Arrow'
import { useChartTheme } from '../../../hooks/useChartTheme'
import { temperatureColor } from '../../../lib/color'
import { fmt } from '../../../lib/format'

export type Contact = 'hot' | 'cold' | 'insulated' | 'heating' | 'cooling'

interface Props {
  /** 현재 부피와 사이클 최대 부피 (같은 단위) */
  V: number
  Vmax: number
  /** 현재 온도와 색 범위 [K] */
  T: number
  Tmin: number
  Tmax: number
  contact: Contact
  /** 현재 단계의 열 출입 부호 (> 0 흡수, < 0 방출) */
  heatSign: number
}

const W = 220
const H = 280
const CYL = { x: 50, w: 120, top: 20, bottom: 200 }

const CONTACT_TEXT: Record<Contact, string> = {
  hot: '고온 열원 T_h',
  cold: '저온 열원 T_c',
  insulated: '단열 (열 차단)',
  heating: '가열',
  cooling: '냉각',
}

/** 세로 실린더와 피스톤. 피스톤 높이는 부피, 기체 색은 온도, 바닥은 접촉한 열원을 나타낸다. */
export function PistonCylinder({ V, Vmax, T, Tmin, Tmax, contact, heatSign }: Props) {
  const c = useChartTheme()
  const minGas = 12
  const gasH = minGas + (V / Vmax) * (CYL.bottom - CYL.top - minGas - 16)
  const pistonY = CYL.bottom - gasH
  const reservoirColor =
    contact === 'hot' || contact === 'heating' ? c.heat : contact === 'cold' || contact === 'cooling' ? c.work : c.muted

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[220px]" role="img" aria-label="피스톤-실린더">
      {/* 기체 */}
      <rect x={CYL.x} y={pistonY} width={CYL.w} height={gasH} fill={temperatureColor(T, Tmin, Tmax)} opacity={0.85} />
      <text x={CYL.x + CYL.w / 2} y={pistonY + gasH / 2 + 5} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">
        {fmt(T, 0)} K
      </text>
      {/* 피스톤과 막대 */}
      <rect x={CYL.x + 2} y={pistonY - 12} width={CYL.w - 4} height={12} fill={c.axis} rx={2} />
      <rect x={CYL.x + CYL.w / 2 - 5} y={0} width={10} height={Math.max(pistonY - 12, 0)} fill={c.muted} />
      {/* 실린더 벽 */}
      <path
        d={`M${CYL.x},${CYL.top}V${CYL.bottom}H${CYL.x + CYL.w}V${CYL.top}`}
        fill="none"
        stroke={c.text}
        strokeWidth={3}
      />
      {/* 접촉한 열원 */}
      <rect
        x={CYL.x - 20}
        y={CYL.bottom + 22}
        width={CYL.w + 40}
        height={34}
        rx={6}
        fill={reservoirColor}
        opacity={contact === 'insulated' ? 0.35 : 0.9}
      />
      {contact === 'insulated' &&
        Array.from({ length: 8 }, (_, i) => (
          <line
            key={i}
            x1={CYL.x - 14 + i * 22}
            x2={CYL.x - 2 + i * 22}
            y1={CYL.bottom + 54}
            y2={CYL.bottom + 24}
            stroke={c.axis}
            strokeWidth={2}
          />
        ))}
      <text x={W / 2} y={CYL.bottom + 44} textAnchor="middle" fontSize={12} fontWeight={600} fill={contact === 'insulated' ? c.text : '#fff'}>
        {CONTACT_TEXT[contact]}
      </text>
      {contact !== 'insulated' && heatSign !== 0 && (
        <Arrow
          x1={W / 2}
          y1={heatSign > 0 ? CYL.bottom + 20 : CYL.bottom + 2}
          x2={W / 2}
          y2={heatSign > 0 ? CYL.bottom + 2 : CYL.bottom + 20}
          thickness={6}
          color={reservoirColor}
        />
      )}
    </svg>
  )
}
