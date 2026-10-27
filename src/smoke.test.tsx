// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import App from './App'
import { sections } from './tabs/basics/sections'
import { sections as cycleSections } from './tabs/cycles/sections'
import { tabs } from './tabs'

/** 모든 탭과 섹션이 런타임 오류 없이 렌더되는지 확인하는 스모크 테스트 */
beforeAll(() => {
  // jsdom에 없는 브라우저 API
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext
  window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as never
})

afterEach(cleanup)

async function renderAt(path: string) {
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
  // lazy 컴포넌트 로딩 대기
  await act(async () => {
    await new Promise((r) => setTimeout(r, 50))
  })
  const calls = errors.mock.calls.map((c) => String(c[0]))
  errors.mockRestore()
  return calls
}

describe('스모크: 라우팅과 섹션 렌더', () => {
  it('루트는 첫 탭의 첫 섹션으로 이동한다', async () => {
    await renderAt('/')
    expect(await screen.findByRole('heading', { level: 1, name: sections[0].title })).toBeTruthy()
  })

  for (const s of sections) {
    it(`/basics/${s.id} 렌더`, async () => {
      const errors = await renderAt(`/basics/${s.id}`)
      expect(await screen.findByRole('heading', { level: 1, name: s.title })).toBeTruthy()
      expect(errors.filter((e) => !e.includes('width(0) and height(0)'))).toEqual([])
    })
  }

  for (const s of cycleSections) {
    it(`/cycles/${s.id} 렌더`, async () => {
      const errors = await renderAt(`/cycles/${s.id}`)
      expect(await screen.findByRole('heading', { level: 1, name: s.title })).toBeTruthy()
      expect(errors.filter((e) => !e.includes('width(0) and height(0)'))).toEqual([])
    })
  }

  it('제2법칙 카드에서 카르노 섹션으로 가는 링크', async () => {
    await renderAt('/basics/laws')
    const link = await screen.findByRole('link', { name: /카르노 사이클을 단계별로/ })
    expect(link.getAttribute('href')).toBe('/cycles/carnot')
  })

  it('준비 중인 탭', async () => {
    const pending = tabs.find((t) => !t.component)!
    await renderAt(`/${pending.path}`)
    expect(await screen.findByText('이 탭은 준비 중입니다.')).toBeTruthy()
  })
})
