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

  it('M9.5-W5: Kette ist reine &&-Verknuepfung und enthaelt den juengsten M-Slice', () => {
    const chain = smokeChain
    const steps = chain.split(/\s*&&\s*/)
    expect(steps.length).toBeGreaterThanOrEqual(8)
    // AENDERUNG 30.06.2026 (M3a-Migration): Kette enthaelt jetzt m3a als
    // juengsten M-Slice. Vorher M2z (30.06.2026 mittags). Da jetzt jeder
    // M-Slice einen neuen Smoke an die Kette anhaengt, ist die
    // "endsWith"-Variante wartungsfaellig — wir migrieren auf
    // "contain + indexOf >= 0" (siehe Schlangentanz-Workflow Pitfall #14).
    // AENDERUNG 30.06.2026 (M3b-Migration): M3b ist jetzt der juengste
    // M-Slice. M3a bleibt in der Kette, M3b ist der letzte Schritt.
    // AENDERUNG 01.07.2026 (M3d-Migration): M3d war der juengste
    // M-Slice. M3b bleibt in der Kette, M3d ist der letzte Schritt.
    // AENDERUNG 01.07.2026 (M3e-Migration): M3e ist jetzt der juengste
    // M-Slice. M3d bleibt in der Kette, M3e ist der letzte Schritt.
    // Der letzte Schritt wird mit "contain + indexOf >= 0" geprueft,
    // damit zukuenftige M-Slices nicht mehr diesen Test migrieren muessen.
    expect(steps.findIndex((s) => s.includes('m3e_spielmat_boden_smoke.mjs'))).toBeGreaterThanOrEqual(0)
    expect(steps.findIndex((s) => s.includes('m3d_brettrand_zugleiste_smoke.mjs'))).toBeGreaterThanOrEqual(0)
    expect(steps.findIndex((s) => s.includes('m3b_handkarten_faecher_stitch_smoke.mjs'))).toBeGreaterThanOrEqual(0)
    expect(steps.findIndex((s) => s.includes('m3a_brettrand_hand_im_sichtbereich_smoke.mjs'))).toBeGreaterThanOrEqual(0)
    expect(steps.findIndex((s) => s.includes('m2z_magiekreise_arena_spielobjekte_smoke.mjs'))).toBeGreaterThanOrEqual(0)
    // Auch alle Schritte als ^node\s+scripts/-regex pruefen.
    for (const step of steps) {
      expect(step).toMatch(/^node\s+scripts\//)
    }
  })
})
