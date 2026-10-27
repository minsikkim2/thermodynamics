/** 숫자를 읽기 좋게 표시한다. 아주 크거나 작은 값은 지수 표기 */
export function fmt(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return '—'
  const abs = Math.abs(value)
  if (abs !== 0 && (abs >= 1e6 || abs < 1e-3)) {
    const [m, e] = value.toExponential(digits).split('e')
    return `${m}×10${toSuperscript(Number(e))}`
  }
  return value.toLocaleString('ko-KR', { maximumFractionDigits: digits })
}

/** 부호를 항상 붙인다 (+1.23, −4.5) */
export function fmtSigned(value: number, digits = 2): string {
  const s = fmt(Math.abs(value), digits)
  if (Math.abs(value) < 10 ** -(digits + 1)) return fmt(0, digits)
  return value > 0 ? `+${s}` : `−${s}`
}

const SUPERSCRIPT: Record<string, string> = {
  '-': '⁻',
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
}

function toSuperscript(n: number): string {
  return String(n)
    .split('')
    .map((ch) => SUPERSCRIPT[ch] ?? ch)
    .join('')
}

// 화면 단위 ↔ SI 단위 변환 (1 L = 10⁻³ m³)
export const litersToM3 = (L: number) => L / 1000
export const m3ToLiters = (m3: number) => m3 * 1000
export const paToKPa = (Pa: number) => Pa / 1000
export const jToKJ = (J: number) => J / 1000
