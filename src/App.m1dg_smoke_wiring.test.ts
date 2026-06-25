/**
 * Author: rahn
 * Datum: 25.06.2026
 * Version: 1.0
 * Beschreibung: M1dg beweist die korrekte Verdrahtung des
 * M1dg-Waldtanz-Lichtungsstein-Browser-Smokes in die kanonische
 * `smoke:production`-Kette.
 *
 * RED-Vertrag (TDD):
 *   1. Es existiert genau ein Smoke-Skript `scripts/m1dg_waldtanz_lichtungsstein_smoke.mjs`.
 *   2. Das Skript ist NICHT als `_probe` markiert (kein temporaerer
 *      Probe-Artefakt) und hat > 50 Zeilen (echte Browser-Verifikation).
 *   3. `package.json` enthaelt das Skript in der `smoke:production`-Kette.
 *   4. Die Kette-Reihenfolge ist: M1e-Spieluhr, M1df-Steinkreis, M1dg-Lichtungsstein.
 */
/// <reference types="node" />

import { existsSync, readFileSync, statSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('M1dg Smoke-Wiring (Waldtanz-Lichtungsstein)', () => {
  it('existiert das M1dg-Browser-Smoke-Skript als kanonische Datei (nicht _probe)', () => {
    const path = 'scripts/m1dg_waldtanz_lichtungsstein_smoke.mjs'
    expect(existsSync(path)).toBe(true)
    const stat = statSync(path)
    expect(stat.size).toBeGreaterThan(1500)
  })

  it('enthaelt das M1dg-Smoke-Skript den erwarteten Akzeptanzvertrag (Lichtungsstein + Magiekreise + Schlangen)', () => {
    const text = readFileSync('scripts/m1dg_waldtanz_lichtungsstein_smoke.mjs', 'utf8')
    expect(text).toMatch(/waldtanz-lichtungsstein/)
    expect(text).toMatch(/waldtanz-magiekreise/)
    expect(text).toMatch(/schlangenbereich/)
  })

  it('ist das M1dg-Smoke-Skript in package.json smoke:production eingebunden', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
    const smoke = pkg.scripts['smoke:production'] ?? ''
    expect(smoke).toMatch(/m1dg_waldtanz_lichtungsstein_smoke\.mjs/)
  })

  it('folgt die Reihenfolge M1e -> M1df -> M1dg -> M1d1 in der Smoke-Kette', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
    const smoke = pkg.scripts['smoke:production'] ?? ''
    const idxM1e = smoke.search(/m1e_waldtanz_spieluhr_smoke/)
    const idxM1df = smoke.search(/m1df_waldtanz_steinkreis_smoke/)
    const idxM1dg = smoke.search(/m1dg_waldtanz_lichtungsstein_smoke/)
    const idxM1d1 = smoke.search(/m1d1_arena_flex_column_smoke/)
    expect(idxM1e).toBeGreaterThan(-1)
    expect(idxM1df).toBeGreaterThan(-1)
    expect(idxM1dg).toBeGreaterThan(-1)
    expect(idxM1d1).toBeGreaterThan(-1)
    expect(idxM1e).toBeLessThan(idxM1df)
    expect(idxM1df).toBeLessThan(idxM1dg)
    expect(idxM1dg).toBeLessThan(idxM1d1)
  })
})