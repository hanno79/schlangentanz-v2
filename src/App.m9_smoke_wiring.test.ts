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

  it('M9-W4: M9-Smoke ist in der Kette enthalten (kein Ausschluss per --exclude/grep)', () => {
    // AENDERUNG 29.06.2026 (M9.5): M9.5-Slice hat einen weiteren Smoke
    // nach M9 angehaengt, daher pruefen wir jetzt "enthalten" statt
    // "am Ende". M9 bleibt aber im Kette drin.
    expect(smokeChain).toContain('m9_hand_erstbild_smoke.mjs')
    expect(smokeChain).not.toMatch(/--exclude.*m9|grep.*m9|awk.*m9/)
  })

  it('M9-W5: Kette ist reine &&-Verknuepfung ohne bedingte Verzweigungen', () => {
    const chain = smokeChain
    // Pruefe, dass alle Stufen mit "&&" verbunden sind.
    const steps = chain.split(/\s*&&\s*/)
    expect(steps.length).toBeGreaterThanOrEqual(8)
    // AENDERUNG 29.06.2026 (M9.5): M9 muss nicht mehr letzter Schritt
    // sein, da M9.5 nach M9 folgt. Pruefe stattdessen, dass M9 in der
    // Kette enthalten ist und alle Schritte gueltige node-Smoke-Calls sind.
    const m9StepIndex = steps.findIndex((s) => s.includes('m9_hand_erstbild_smoke.mjs'))
    expect(m9StepIndex).toBeGreaterThanOrEqual(0)
    steps.forEach((step) => {
      expect(step.trim()).toMatch(/^node\s+scripts\//)
    })
  })
})
