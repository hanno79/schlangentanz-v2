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
import { istVerdrahtet, produktionsPosition } from './test/smokeKetten'

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
    expect(istVerdrahtet('m1dg_waldtanz_lichtungsstein_smoke.mjs')).toBe(true)
  })

  // ÄNDERUNG [30.07.2026]: AP-1 — M1e ist hook-abhängig (`/game?phase=…`) und liegt
  // seither in `smoke:preview`. Der Kettenpositions-Vergleich gilt deshalb nur noch
  // für die drei Smokes, die gemeinsam in `smoke:production` laufen; M1e wird auf
  // Verdrahtung in einer der beiden Ketten geprüft.
  it('folgt die Reihenfolge M1df -> M1dg -> M1d1 in der Production-Kette (M1e in Preview)', () => {
    const idxM1df = produktionsPosition('m1df_waldtanz_steinkreis_smoke')
    const idxM1dg = produktionsPosition('m1dg_waldtanz_lichtungsstein_smoke')
    const idxM1d1 = produktionsPosition('m1d1_arena_flex_column_smoke')
    expect(idxM1df).toBeGreaterThan(-1)
    expect(idxM1dg).toBeGreaterThan(-1)
    expect(idxM1d1).toBeGreaterThan(-1)
    expect(idxM1df).toBeLessThan(idxM1dg)
    expect(idxM1dg).toBeLessThan(idxM1d1)
    expect(istVerdrahtet('m1e_waldtanz_spieluhr_smoke')).toBe(true)
  })
})