/**
 * M3f Smoke-Wiring RED-Test: smoke:production-Kette enthaelt m3f_brettrund_waldobjekte_smoke.mjs.
 *
 * Pflicht-Asserts (Pitfall #14 Last-In-Chain-Discipline):
 *  1. Kette enthaelt m3f_brettrund_waldobjekte_smoke.mjs
 *  2. M3f-Smoke-Script existiert in scripts/
 *  3. M3f-Smoke-Script enthaelt die slice-spezifischen CSS-Klassen
 *  4. M3f-Smoke-Script enthaelt die aria-label="Waldobjekte" Selector
 *  5. Kette enthaelt m3f als last-in-chain
 *  6. Kette hat keine verbotenen Pipes/Greps
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const chain: string = pkg.scripts['smoke:production'] ?? ''
const m3fScript = 'scripts/m3f_brettrund_waldobjekte_smoke.mjs'
const m3fSrc = existsSync(m3fScript) ? readFileSync(m3fScript, 'utf8') : ''

describe('M3f Smoke-Wiring', () => {
  it('M3f-W1: smoke:production chain enthaelt m3f_brettrund_waldobjekte_smoke.mjs', () => {
    expect(chain).toContain('m3f_brettrund_waldobjekte_smoke.mjs')
  })

  it('M3f-W2: M3f-Smoke-Script existiert', () => {
    expect(existsSync(m3fScript)).toBe(true)
  })

  it('M3f-W3: M3f-Smoke-Script enthaelt slice-spezifische CSS-Klassen', () => {
    expect(m3fSrc).toMatch(/waldtanz-arenasstein__waldobjekte/)
    expect(m3fSrc).toMatch(/waldtanz-nachziehstapel/)
    expect(m3fSrc).toMatch(/waldtanz-ablage/)
    expect(m3fSrc).toMatch(/waldtanz-zugspur/)
    expect(m3fSrc).toMatch(/waldtanz-aufgabentafel/)
  })

  it('M3f-W4: M3f-Smoke-Script enthaelt aria-label="Waldobjekte" Selector', () => {
    expect(m3fSrc).toMatch(/Waldobjekte/)
  })

  it('M3f-W5: m3f ist in der chain enthalten (Last-in-Chain-Discipline: nur M3h danach)', () => {
    // Migration (2026-07-01): von "ist letzter Schritt" auf
    // "ist in der Kette enthalten" + M3h danach. Siehe Pitfall #14
    // (Last-In-Chain-Watcher-Test) — der Test ueberlebte nur 1 Slice,
    // muss member+index-basierte Pruefung sein.
    const steps = chain.split('&&').map((s) => s.trim())
    expect(chain).toContain('m3f_brettrund_waldobjekte_smoke.mjs')
    const m3fIndex = steps.findIndex((s) => s.includes('m3f_brettrund_waldobjekte_smoke.mjs'))
    expect(m3fIndex).toBeGreaterThanOrEqual(0)
    // M3h-Smoke MUSS nach M3f-Smoke in der Kette kommen.
    const m3hIndex = steps.findIndex((s) => s.includes('m3h_stitch_lobby_avatar_smoke.mjs'))
    expect(m3hIndex).toBeGreaterThan(m3fIndex)
  })

  it('M3f-W6: Kette enthaelt keine Pipes/Greps/awk (pure node calls)', () => {
    const steps = chain.split('&&').map(s => s.trim())
    for (const step of steps) {
      expect(step.startsWith('node ')).toBe(true)
    }
  })
})
