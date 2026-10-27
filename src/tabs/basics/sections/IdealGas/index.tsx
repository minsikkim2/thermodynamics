import { useMemo, useState } from 'react'
import { FormulaBlock, Tex } from '../../../../components/FormulaBlock'
import { ParameterSlider } from '../../../../components/ParameterSlider'
import { PlotPanel } from '../../../../components/PlotPanel'
import { ControlPanel, SectionShell } from '../../../../components/SectionShell'
import { SegmentedControl } from '../../../../components/SegmentedControl'
import { ValueReadout } from '../../../../components/ValueReadout'
import { XYChart, type XYSeries } from '../../../../components/XYChart'
import { useChartTheme } from '../../../../hooks/useChartTheme'
import { fmt, litersToM3, m3ToLiters, paToKPa } from '../../../../lib/format'
import { kelvinToCelsius } from '../../../../physics/constants'
import { isobar, isochore, isotherm, pressure } from '../../../../physics/idealGas'
import { ParticleCanvas } from './ParticleCanvas'

type FixedVar = 'T' | 'P' | 'V'

const V_MIN = 2
const V_MAX = 50
const T_MAX = 1000
const OVERLAY_TEMPS = [200, 400, 600, 800, 1000]

export default function IdealGas() {
  const c = useChartTheme()
  const [T, setT] = useState(300)
  const [V, setV] = useState(20) // L
  const [n, setN] = useState(1)
  const [fixed, setFixed] = useState<FixedVar>('T')
  const [overlay, setOverlay] = useState(false)

  const P = paToKPa(pressure(n, T, litersToM3(V))) // kPa

  const chart = useMemo(() => {
    const toLkPa = (pts: { x: number; y: number }[]) => pts.map((p) => ({ x: m3ToLiters(p.x), y: paToKPa(p.y) }))
    if (fixed === 'T') {
      const series: XYSeries[] = []
      if (overlay) {
        OVERLAY_TEMPS.forEach((Ti, i) =>
          series.push({
            name: `${Ti} K`,
            data: toLkPa(isotherm(n, Ti, litersToM3(V_MIN), litersToM3(V_MAX))),
            color: c.series[(i + 1) % c.series.length],
            width: 1.2,
            dashed: true,
          }),
        )
      }
      series.push({
        name: `현재 T = ${fmt(T, 0)} K`,
        data: toLkPa(isotherm(n, T, litersToM3(V_MIN), litersToM3(V_MAX))),
        color: c.series[0],
        width: 3,
      })
      return {
        title: 'P–V 등온선 (T 고정)',
        series,
        xLabel: 'V [L]',
        yLabel: 'P [kPa]',
        marker: { x: V, y: P },
        yDomain: [0, 'auto'] as [number, 'auto'],
      }
    }
    if (fixed === 'P') {
      const Pa = P * 1000
      return {
        title: `V–T 등압선 (P = ${fmt(P, 1)} kPa 고정)`,
        series: [
          {
            name: '등압선',
            data: isobar(n, Pa, 1, T_MAX).map((p) => ({ x: p.x, y: m3ToLiters(p.y) })),
            color: c.series[0],
            width: 3,
          },
        ],
        xLabel: 'T [K]',
        yLabel: 'V [L]',
        marker: { x: T, y: V },
        yDomain: [0, 'auto'] as [number, 'auto'],
      }
    }
    return {
      title: `P–T 등적선 (V = ${fmt(V, 1)} L 고정)`,
      series: [
        {
          name: '등적선',
          data: isochore(n, litersToM3(V), 1, T_MAX).map((p) => ({ x: p.x, y: paToKPa(p.y) })),
          color: c.series[0],
          width: 3,
        },
      ],
      xLabel: 'T [K]',
      yLabel: 'P [kPa]',
      marker: { x: T, y: P },
      yDomain: [0, 'auto'] as [number, 'auto'],
    }
  }, [fixed, overlay, n, T, V, P, c])

  return (
    <SectionShell
      title="이상기체"
      concept={
        <>
          <p>
            <strong>이상기체</strong>는 분자 자체의 크기와 분자 사이의 힘을 무시한 기체 모형입니다. 압력은 수많은
            분자가 벽에 부딪히며 주는 힘의 평균이고, 온도는 분자의 평균 운동에너지의 척도입니다.
          </p>
          <p>
            그래서 <Tex tex="T" />를 올리면 분자가 빨라져 벽을 더 세게, 더 자주 때리고(압력 증가), <Tex tex="V" />를
            줄이면 같은 분자가 좁은 공간에서 벽에 더 자주 부딪힙니다(압력 증가). 이 관계를 한 식으로 정리한 것이 이상기체
            상태방정식입니다.
          </p>
        </>
      }
      formulas={
        <>
          <FormulaBlock tex="PV = nRT" caption="이상기체 상태방정식" highlight />
          <FormulaBlock tex="R = 8.314\ \mathrm{J/(mol\cdot K)}" caption="기체 상수" />
          <FormulaBlock
            tex="\text{등온: } PV=\text{일정}\quad \text{등압: } V\propto T\quad \text{등적: } P\propto T"
            caption="한 변수를 고정했을 때 나머지 두 변수의 관계"
          />
        </>
      }
      guide={[
        <>
          <Tex tex="T" />를 300 K → 900 K로 올려 보세요. 입자 색이 빨갛게 변하며 빨라지고, 압력은 3배가 됩니다.
        </>,
        <>
          <Tex tex="V" />를 절반으로 줄여 보세요. 벽 충돌 빈도와 압력이 약 2배가 됩니다 (보일 법칙).
        </>,
        <>
          고정 변수를 “등온”으로 두고 <em>여러 온도 등온선</em>을 켜 보세요. 온도가 높을수록 등온선이 원점에서 멀어집니다.
        </>,
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <PlotPanel title="피스톤 용기 속 기체 분자">
          <ParticleCanvas T={T} volumeFraction={V / V_MAX} particleCount={Math.round(n * 30)} />
        </PlotPanel>
        <ControlPanel>
          <ParameterSlider
            label={<>온도 <Tex tex="T" /></>}
            unit="K"
            min={50}
            max={T_MAX}
            step={10}
            value={T}
            onChange={setT}
            digits={0}
            secondary={`${fmt(kelvinToCelsius(T), 0)} °C`}
          />
          <ParameterSlider
            label={<>부피 <Tex tex="V" /></>}
            unit="L"
            min={V_MIN}
            max={V_MAX}
            step={0.5}
            value={V}
            onChange={setV}
            digits={1}
          />
          <ParameterSlider
            label={<>물질의 양 <Tex tex="n" /></>}
            unit="mol"
            min={0.2}
            max={5}
            step={0.1}
            value={n}
            onChange={setN}
            digits={1}
          />
          <ValueReadout
            label={<>압력 <Tex tex="P = nRT/V" /></>}
            value={fmt(P, 1)}
            unit="kPa"
            sub={`= ${fmt(P / 101.325, 2)} atm`}
            tone="work"
          />
          <p className="text-[11px] text-slate-400">1 L = 10⁻³ m³ · 계산은 SI 단위(Pa, m³)로 수행</p>
        </ControlPanel>
      </div>

      <PlotPanel
        title={chart.title}
        height={320}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <SegmentedControl
              ariaLabel="고정 변수"
              value={fixed}
              onChange={setFixed}
              options={[
                { value: 'T', label: '등온 (T 고정)' },
                { value: 'P', label: '등압 (P 고정)' },
                { value: 'V', label: '등적 (V 고정)' },
              ]}
            />
            {fixed === 'T' && (
              <label className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" checked={overlay} onChange={(e) => setOverlay(e.target.checked)} />
                여러 온도 등온선
              </label>
            )}
          </div>
        }
      >
        <XYChart
          series={chart.series}
          xLabel={chart.xLabel}
          yLabel={chart.yLabel}
          yDomain={chart.yDomain}
          markers={[{ ...chart.marker, color: c.heat, label: '현재 상태' }]}
          legend={fixed === 'T' && overlay}
          yDigits={0}
        />
      </PlotPanel>
    </SectionShell>
  )
}
