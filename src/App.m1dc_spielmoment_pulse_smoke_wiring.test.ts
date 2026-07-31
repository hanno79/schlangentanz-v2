/**
 * Author: rahn
 * Datum: 23.06.2026
 * Version: 1.0
 * Beschreibung: M1dc Smoke-Wiring — prueft, dass
 *  - scripts/m1dc_spielmoment_pulse_smoke.mjs existiert
 *  - package.json enthaelt das Skript in smoke:production
 *  - das Skript die richtige URL-Pruefung und Region verwendet
 */
/// <reference types="node" />

import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { istVerdrahtet } from './test/smokeKetten'

const smokeScriptPath = 'scripts/m1dc_spielmoment_pulse_smoke.mjs'

describe('M1dc Smoke-Wiring', () => {
  it('enthaelt das M1dc-Smoke-Skript in smoke:production', () => {
    expect(istVerdrahtet('m1dc_spielmoment_pulse_smoke.mjs')).toBe(true)
  })

  it('Smoke-Skript existiert und referenziert die Spielmoment-Region', () => {
    expect(existsSync(smokeScriptPath)).toBe(true)
    const source = readFileSync(smokeScriptPath, 'utf8')
    expect(source).toMatch(/data-letzte-aktion-ziel/)
    expect(source).toMatch(/BASE_URL|schlangentanz/)
  })
})