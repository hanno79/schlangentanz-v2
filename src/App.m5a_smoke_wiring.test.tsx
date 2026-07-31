/**
 * Author: hermes-cron
 * Datum: 28.06.2026
 *
 * Wire-Guards fuer M5a:
 * - scripts/m5a_sieger_party_stitch_forest_hero_smoke.mjs existiert
 * - scripts/live_smoke.mjs importiert/existiert (Smoke-Skript vorhanden)
 * - package.json smoke:production-Kette enthaelt den M5a-Smoke-Pfad
 * - der M5a-Smoke referenziert die .sieger-party CSS-Klasse und die
 *   sichtRegel-Helper-Funktion (depth-tracked last-top-level-match)
 *
 * Diese Tests sind die Pflicht-Verifikation dafuer, dass ein neuer
 * Smoke-Script tatsaechlich in der Release-Kette landet (M1dt Pattern,
 * siehe `references/smoke-wiring-regression.md`).
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { produktionsKette } from './test/smokeKetten'

const projectRoot = join(__dirname, '..')

describe('M5a Smoke-Wiring', () => {
  it('RED-W1: scripts/m5a_sieger_party_stitch_forest_hero_smoke.mjs existiert', () => {
    expect(existsSync(join(projectRoot, 'scripts/m5a_sieger_party_stitch_forest_hero_smoke.mjs'))).toBe(true)
  })

  it('RED-W2: package.json smoke:production-Kette enthaelt den M5a-Smoke', () => {
    const chain = produktionsKette()
    expect(chain).toBeDefined()
    expect(chain).toMatch(/scripts\/m5a_sieger_party_stitch_forest_hero_smoke\.mjs/)
  })

  it('RED-W3: M5a-Smoke-Skript referenziert .sieger-party CSS-Klasse', () => {
    const smoke = readFileSync(
      join(projectRoot, 'scripts/m5a_sieger_party_stitch_forest_hero_smoke.mjs'),
      'utf-8',
    )
    expect(smoke).toMatch(/\.sieger-party/)
    // sichtRegel mit depth-tracked matchAll muss vorhanden sein
    expect(smoke).toMatch(/sichtRegel/)
    expect(smoke).toMatch(/matchAll/)
  })

  it('RED-W4: Vitest erfasst M5a-Test nicht versehentlich ausgeschlossen', () => {
    const pkg = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf-8')) as {
      scripts: Record<string, string>
    }
    const testScript = pkg.scripts['test'] ?? ''
    // Default vitest (ohne --exclude) deckt src/ ab.
    // Vertrag: das M5a-Test-File wird NICHT durch ein --exclude-Pattern
    // ausgefiltert. Wenn jemand spaeter z.B. `vitest --exclude src/App.m5a_*`
    // einbaut, faellt dieser Guard.
    expect(testScript).toBeDefined()
    expect(testScript).not.toMatch(/--exclude\s+[^&|]*m5a/)
    expect(testScript).not.toMatch(/--exclude\s+[^&|]*smoke[-_]wiring/)
  })
})