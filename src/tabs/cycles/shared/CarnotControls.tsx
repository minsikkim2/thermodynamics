import { Tex } from '../../../components/FormulaBlock'
import { ParameterSlider } from '../../../components/ParameterSlider'
import { ControlPanel } from '../../../components/SectionShell'
import { SegmentedControl } from '../../../components/SegmentedControl'
import { fmt } from '../../../lib/format'
import { kelvinToCelsius } from '../../../physics/constants'
import { T_MAX, T_MIN, type CarnotParams } from './carnotParams'

const GAP = 10

interface Props {
  value: CarnotParams
  onChange: (next: CarnotParams) => void
}

/** 카르노·역카르노 사이클 공통 조절 패널. T_h > T_c를 슬라이더 범위로 강제한다. */
export function CarnotControls({ value, onChange }: Props) {
  const set = <K extends keyof CarnotParams>(key: K, v: CarnotParams[K]) => onChange({ ...value, [key]: v })
  return (
    <ControlPanel>
      <SegmentedControl
        ariaLabel="기체 종류"
        value={value.f}
        onChange={(f) => set('f', f)}
        options={[
          { value: 3, label: '단원자' },
          { value: 5, label: '이원자' },
        ]}
      />
      <ParameterSlider
        label={<>고온 열원 <Tex tex="T_h" /></>}
        unit="K"
        min={T_MIN + GAP}
        max={T_MAX}
        step={10}
        value={value.Th}
        onChange={(Th) => onChange({ ...value, Th, Tc: Math.min(value.Tc, Th - GAP) })}
        digits={0}
        secondary={`${fmt(kelvinToCelsius(value.Th), 0)} °C`}
      />
      <ParameterSlider
        label={<>저온 열원 <Tex tex="T_c" /></>}
        unit="K"
        min={T_MIN}
        max={value.Th - GAP}
        step={10}
        value={value.Tc}
        onChange={(Tc) => set('Tc', Tc)}
        digits={0}
        secondary={`${fmt(kelvinToCelsius(value.Tc), 0)} °C`}
      />
      <ParameterSlider label={<>물질의 양 <Tex tex="n" /></>} unit="mol" min={0.2} max={3} step={0.1} value={value.n} onChange={(n) => set('n', n)} digits={1} />
      <ParameterSlider label={<>상태 1의 부피 <Tex tex="V_1" /></>} unit="L" min={1} max={10} step={0.5} value={value.V1} onChange={(V1) => set('V1', V1)} digits={1} />
      <ParameterSlider
        label={<>등온 팽창 비율 <Tex tex="V_2/V_1" /></>}
        min={1.2}
        max={5}
        step={0.1}
        value={value.ratio}
        onChange={(ratio) => set('ratio', ratio)}
        digits={1}
      />
    </ControlPanel>
  )
}
