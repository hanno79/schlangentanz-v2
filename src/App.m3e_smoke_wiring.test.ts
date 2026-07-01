/**
 * M3e Smoke-Wiring RED-Test: smoke:production-Kette enthaelt m3e_spielmat_boden_smoke.mjs.
 *
 * Pflicht-Asserts (Pitfall #14 Last-In-Chain-Discipline):
 *  1. Kette enthaelt m3e_spielmat_boden_smoke.mjs
 *  2. M3e-Smoke-Script existiert in scripts/
 *  3. M3e-Smoke-Script enthaelt die slice-spezifischen CSS-Klassen
 *  4. M3e-Smoke-Script enthaelt die pruefe*-Funktion (oder aehnliches)
 *  5. Kette endet mit m3e (last-in-chain)
 *  6. Kette hat keine verbotenen Pipes/Greps
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const chain: string = pkg.scripts['smoke:production'] ?? ''
const m3eScript = 'scripts/m3e_spielmat_boden_smoke.mjs'
const m3eSrc = existsSync(m3eScript) ? readFileSync(m3eScript, 'utf8') : ''

describe('M3e Smoke-Wiring', () => {
  it('M3e-W1: smoke:production chain enthaelt m3e_spielmat_boden_smoke.mjs', () => {
    expect(chain).toContain('m3e_spielmat_boden_smoke.mjs')
  })

  it('M3e-W2: M3e-Smoke-Script existiert', () => {
    expect(existsSync(m3eScript)).toBe(true)
  })

  it('M3e-W3: M3e-Smoke-Script enthaelt slice-spezifische CSS-Klasse waldtanz-spielmat-boden', () => {
    expect(m3eSrc).toMatch(/waldtanz-spielmat-boden/)
  })

  it('M3e-W4: M3e-Smoke-Script hat aria-label="Waldtanz-Spielmat" Selector', () => {
    expect(m3eSrc).toMatch(/Waldtanz-Spielmat/)
  })

  it('M3e-W5: m3e ist last-in-chain (Kette endet mit m3e-Aufruf)', () => {
    const steps = chain.split('&&').map(s => s.trim())
    const last = steps[steps.length - 1]
    expect(last).toContain('m3e_spielmat_boden_smoke.mjs')
  })

  it('M3e-W6: Kette enthaelt keine Pipes/Greps/awk (pure node calls)', () => {
    const steps = chain.split('&&').map(s => s.trim())
    for (const step of steps) {
      expect(step.startsWith('node ')).toBe(true)
    }
  })
})
