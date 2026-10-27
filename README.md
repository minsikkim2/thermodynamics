# 열역학 인터랙티브

열역학을 시각적·인터랙티브하게 배우는 웹사이트 (Vite + React + TypeScript + Tailwind CSS).

## 실행

Node.js는 `~/.local/node`에 설치되어 있으며 `~/.zshrc`에서 PATH에 추가됩니다. 새 터미널을 열면 바로 쓸 수 있습니다.

```bash
npm install
npm run dev      # 개발 서버
npm test         # 물리 함수 단위 테스트 + 스모크 테스트
npm run build    # 타입 검사 후 프로덕션 빌드
```

## 구조

- `src/tabs.ts` — 상단 탭 목록. 항목을 추가하면 네비게이션과 라우팅(`/<path>`)에 반영됩니다. `component`가 없으면 "준비 중"으로 표시됩니다.
- `src/tabs/basics/sections.ts` — "기본 개념" 탭의 섹션 목록 (사이드바·드롭다운·라우팅 `/basics/<id>`).
- `src/physics/` — UI와 분리된 순수 물리 계산 함수와 `*.test.ts` 단위 테스트. 모두 SI 단위.
- `src/sim/` — 입자 애니메이션 엔진 (Canvas).
- `src/components/` — `ParameterSlider`, `FormulaBlock`(KaTeX), `ConceptCard`, `PlotPanel`, `XYChart` 등 재사용 컴포넌트.

## 물리 규약

- R = 8.314 J/(mol·K), k_B = 1.380649×10⁻²³ J/K
- 제1법칙: ΔU = Q − W (W는 계가 외부에 한 일)
- 온도 계산은 켈빈, 표시할 때 °C 병기
