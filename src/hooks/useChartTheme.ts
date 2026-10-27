import { useTheme } from './useTheme'

/**
 * 그래프 색상. SVG 속성에는 CSS 변수가 일관되게 적용되지 않으므로 테마별 값을 직접 넘긴다.
 * 의미 색은 섹션 전체에서 통일한다: Q(열) = 빨강, W(일) = 파랑, ΔU = 초록
 */
const palettes = {
  light: {
    grid: '#e2e8f0',
    axis: '#64748b',
    text: '#0f172a',
    surface: '#ffffff',
    heat: '#dc2626',
    work: '#2563eb',
    energy: '#16a34a',
    accent: '#7c3aed',
    warn: '#d97706',
    muted: '#94a3b8',
    series: ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed'],
  },
  dark: {
    grid: '#334155',
    axis: '#94a3b8',
    text: '#f1f5f9',
    surface: '#0f172a',
    heat: '#f87171',
    work: '#60a5fa',
    energy: '#4ade80',
    accent: '#a78bfa',
    warn: '#fbbf24',
    muted: '#64748b',
    series: ['#60a5fa', '#f87171', '#4ade80', '#fbbf24', '#a78bfa'],
  },
}

export type ChartTheme = (typeof palettes)['light']

export function useChartTheme(): ChartTheme {
  const { theme } = useTheme()
  return palettes[theme]
}

/** Recharts 툴팁 공통 스타일 */
export function tooltipStyle(c: ChartTheme) {
  return {
    contentStyle: {
      background: c.surface,
      border: `1px solid ${c.grid}`,
      borderRadius: 8,
      fontSize: 12,
      color: c.text,
    },
    labelStyle: { color: c.text },
  }
}
