/**
 * Author: rahn
 * Datum: 22.06.2026
 * Version: 1.0
 * Beschreibung: M1db Smoke-Wiring — stellt sicher, dass das M1db-Browser-Smoke-Skript
 * tatsaechlich in der kanonischen `smoke:production`-Kette eingebunden ist und das
 * Skript am erwarteten Pfad existiert. Verhindert die haeufige Falle, dass eine neue
 * Smoke-Datei zwar im Repo liegt, aber nicht ausgefuehrt wird.
 */
/// <reference types="node" />

import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { istVerdrahtet, produktionsPosition } from './test/smokeKetten'

describe('M1db Waldtanz-Spielmoment Smoke-Wiring', () => {
  it('package.json npm run smoke:production enthaelt das M1db-Smoke-Skript', () => {
    expect(istVerdrahtet('m1db_waldtanz_spielmoment_smoke.mjs')).toBe(true)
  })

  it('M1db-Smoke liegt in der kanonischen Kette NACH dem M1da-Smoke (Handflaeche)', () => {
    const m1daIdx = produktionsPosition('m1da_waldtanz_handflaeche_erstbild_smoke.mjs')
    const m1dbIdx = produktionsPosition('m1db_waldtanz_spielmoment_smoke.mjs')
    expect(m1daIdx).toBeGreaterThan(0)
    expect(m1dbIdx).toBeGreaterThan(m1daIdx)
  })

  it('M1db-Smoke-Skript-Datei existiert am erwarteten Pfad', () => {
    expect(existsSync('scripts/m1db_waldtanz_spielmoment_smoke.mjs')).toBe(true)
  })
})
