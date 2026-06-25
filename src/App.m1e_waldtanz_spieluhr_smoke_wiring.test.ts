/**
 * Author: rahn
 * Datum: 24.06.2026
 * Version: 1.0
 * Beschreibung: M1e Smoke-Wiring-Test stellt sicher, dass der neue
 *              Waldtanz-Spieluhr-Smoke in der kanonischen
 *              `smoke:production`-Kette eingebunden ist. Verhindert, dass
 *              ein neuer Slice-Smoke stillschweigend vom Release uebergangen
 *              wird.
 *
 *  Zusaetzlich: M1e CSS-Token-Guard. Alle CSS-Custom-Properties, die in
 *  der Slice-CSS verwendet werden, muessen in :root definiert sein.
 *  Kimi-Review-Blocker B1 vom 24.06.2026: drei Token
 *  (--st-color-on-surface-variant, --st-color-inverse-surface,
 *  --st-color-secondary-fixed-dim) waren im Slice verwendet, aber
 *  nirgends in :root definiert. Sie fielen still auf inherited black
 *  zurueck. Regression-Test verhindert Wiederholung.
 */
/// <reference types="node" />

import { readFileSync, existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts?: Record<string, string> }
const smokeChain = packageJson.scripts?.['smoke:production'] ?? ''

describe('M1e Smoke-Wiring in der kanonischen Kette', () => {
  it('verweist auf den neuen Waldtanz-Spieluhr-Smoke', () => {
    expect(smokeChain).toContain('m1e_waldtanz_spieluhr_smoke.mjs')
  })

  it('liegt nach dem M1dd-Smoke (konsistente Slice-Reihenfolge)', () => {
    const idxM1dd = smokeChain.indexOf('m1dd_aktionsdock_im_spielbrett_smoke.mjs')
    const idxM1e = smokeChain.indexOf('m1e_waldtanz_spieluhr_smoke.mjs')
    expect(idxM1dd).toBeGreaterThanOrEqual(0)
    expect(idxM1e).toBeGreaterThan(idxM1dd)
  })

  it('existiert als Smoke-Skript im Repo', () => {
    expect(existsSync('scripts/m1e_waldtanz_spieluhr_smoke.mjs')).toBe(true)
  })
})

describe('M1e CSS-Token-Guard im :root-Block', () => {
  const appCss = readFileSync('src/App.css', 'utf8')
  const rootBlock = appCss.match(/:root\s*\{([\s\S]*?)\}/)?.[1] ?? ''

  const benoetigteToken = [
    '--st-color-on-surface-variant',
    '--st-color-inverse-surface',
    '--st-color-secondary-fixed-dim',
  ] as const

  for (const token of benoetigteToken) {
    it(`definiert ${token} in :root (verhindert silent Fallback)`, () => {
      expect(rootBlock, `Token ${token} fehlt in :root`).toMatch(
        new RegExp(`${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`),
      )
    })
  }
})
