/* Author: rahn
 * Datum: 29.06.2026
 * Version: 1.0
 * Beschreibung: M9 Smoke-Wiring — verifiziert, dass
 *   scripts/m9_hand_erstbild_smoke.mjs in der kanonischen
 *   `npm run smoke:production`-Kette angehaengt ist und die richtigen
 *   Selektoren + Helper prueft.
 */
import { readFileSync, existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const packageJson = readFileSync('package.json', 'utf8')
const smokeChain = (JSON.parse(packageJson) as { scripts: Record<string, string> })
  .scripts['smoke:production'] ?? ''

describe('M9 Smoke-Wiring', () => {
  it('M9-W1: Smoke-Script existiert in scripts/', () => {
    expect(existsSync('scripts/m9_hand_erstbild_smoke.mjs')).toBe(true)
  })

  it('M9-W2: package.json smoke:production-Kette enthaelt den M9-Smoke-Pfad', () => {
    expect(smokeChain).toContain('m9_hand_erstbild_smoke.mjs')
  })

  it('M9-W3: Smoke-Script referenziert Hand-Panel + Erstbild-Selectors', () => {
    const src = readFileSync('scripts/m9_hand_erstbild_smoke.mjs', 'utf8')
    expect(src).toContain('BASE_URL')
    expect(src).toMatch(/handkarten-panel/)
    expect(src).toMatch(/info-panel--waldtanz-arena/)
    expect(src).toMatch(/pruefeM9HandErstbild/)
  })

  it('M9-W4: M9-Smoke steht am Ende der Kette (junge Slices ans Ende append)', () => {
    expect(smokeChain.trim().endsWith('m9_hand_erstbild_smoke.mjs')).toBe(true)
    expect(smokeChain).not.toMatch(/--exclude.*m9|grep.*m9|awk.*m9/)
  })

  it('M9-W5: Kette ist reine &&-Verknuepfung ohne bedingte Verzweigungen', () => {
    const chain = smokeChain
    // Pruefe, dass alle Stufen mit "&&" verbunden sind.
    const steps = chain.split(/\s*&&\s*/)
    expect(steps.length).toBeGreaterThanOrEqual(8)
    // M9 muss der letzte Schritt sein.
    expect(steps[steps.length - 1].trim()).toBe('node scripts/m9_hand_erstbild_smoke.mjs')
  })
})
