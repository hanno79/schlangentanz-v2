/* Author: rahn
 * Datum: 29.06.2026
 * Version: 1.0
 * Beschreibung: M9.5 Smoke-Wiring — verifiziert, dass
 *   scripts/m95_arena_cap_smoke.mjs in der kanonischen
 *   `npm run smoke:production`-Kette angehaengt ist und die richtigen
 *   Selektoren + Helper prueft.
 */
import { readFileSync, existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const packageJson = readFileSync('package.json', 'utf8')
const smokeChain = (JSON.parse(packageJson) as { scripts: Record<string, string> })
  .scripts['smoke:production'] ?? ''

describe('M9.5 Smoke-Wiring', () => {
  it('M9.5-W1: Smoke-Script existiert in scripts/', () => {
    expect(existsSync('scripts/m95_arena_cap_smoke.mjs')).toBe(true)
  })

  it('M9.5-W2: package.json smoke:production-Kette enthaelt den M9.5-Smoke-Pfad', () => {
    expect(smokeChain).toContain('m95_arena_cap_smoke.mjs')
  })

  it('M9.5-W3: Smoke-Script referenziert Arenasstein + Hand-Panel + Schlangenlichtung', () => {
    const src = readFileSync('scripts/m95_arena_cap_smoke.mjs', 'utf8')
    expect(src).toContain('BASE_URL')
    expect(src).toMatch(/waldtanz-arenastein/)
    expect(src).toMatch(/handkarten-panel/)
    expect(src).toMatch(/pruefeM95ArenaCap/)
  })

  it('M9.5-W4: M9.5-Smoke ist in der Kette enthalten (junge Slices werden angehaengt)', () => {
    // AENDERUNG 29.06.2026 (M8a-Migration): M9.5 ist nicht mehr das letzte
    // Glied der Kette — M8a wurde angehaengt. Test prüft jetzt nur die
    // Mitgliedschaft (contains + indexOf >= 0), nicht mehr endsWith.
    expect(smokeChain).toContain('m95_arena_cap_smoke.mjs')
    expect(smokeChain).not.toMatch(/--exclude.*m95|grep.*m95|awk.*m95/)
    const steps = smokeChain.split(/\s*&&\s*/)
    const m95Index = steps.findIndex((s) => s.includes('m95_arena_cap_smoke.mjs'))
    expect(m95Index).toBeGreaterThanOrEqual(0)
  })

  it('M9.5-W5: Kette ist reine &&-Verknuepfung und endet mit dem juengsten M-Slice (M8a)', () => {
    const chain = smokeChain
    const steps = chain.split(/\s*&&\s*/)
    expect(steps.length).toBeGreaterThanOrEqual(8)
    // AENDERUNG 29.06.2026 (M8a-Migration): Kette endet jetzt mit m8a.
    expect(steps[steps.length - 1].trim()).toBe('node scripts/m8a_aktions_hinweis_smoke.mjs')
  })
})
