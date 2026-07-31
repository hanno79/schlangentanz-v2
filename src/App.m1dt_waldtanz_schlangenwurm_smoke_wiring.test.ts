/**
 * Author: rahn
 * Datum: 27.06.2026
 * Version: 1.0
 * Beschreibung: M1dt Smoke-Wiring — bestätigt, dass das M1dt-Smoke-Skript in der
 * `npm run smoke:production`-Kette eingebunden ist und die richtigen M1dt-Symbole enthält.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { istVerdrahtet } from './test/smokeKetten'

const smokeSkript = readFileSync('scripts/m1dt_waldtanz_schlangenwurm_smoke.mjs', 'utf8')

describe('M1dt Smoke-Wiring', () => {
  it('M1dt-Smoke-Skript ist in der smoke:production-Kette eingebunden (nach M1ds, vor M3b)', () => {
    expect(['m1dt_waldtanz_schlangenwurm_smoke.mjs', 'm3b_sonniges_nest_spielstart_smoke.mjs'].every(istVerdrahtet)).toBe(true)
  })

  it('M1dt-Smoke-Skript enthält die Pflicht-Klassen und Test-IDs', () => {
    expect(smokeSkript).toMatch(/schlangekarte-auge-links/)
    expect(smokeSkript).toMatch(/schlangekarte-mund/)
    expect(smokeSkript).toMatch(/schlangekarte__karte--schwanz-curl/)
    expect(smokeSkript).toMatch(/schlangekarte--wriggle/)
    expect(smokeSkript).toMatch(/schlangekarte--solo/)
  })

  it('M1dt-Smoke-Skript hat einen Self-Test-Modus', () => {
    expect(smokeSkript).toMatch(/--self-test/)
  })
})
