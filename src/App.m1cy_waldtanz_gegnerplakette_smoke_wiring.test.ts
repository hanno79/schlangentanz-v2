/**
 * Author: rahn
 * Datum: 22.06.2026
 * Version: 1.0
 * Beschreibung: M1cy Smoke-Wiring — stellt sicher, dass das M1cy-Browser-Smoke-Skript
 * tatsaechlich in der kanonischen `smoke:production`-Kette eingebunden ist und das
 * Skript am erwarteten Pfad existiert. Verhindert die haeufige Falle, dass eine neue
 * Smoke-Datei zwar im Repo liegt, aber nicht ausgefuehrt wird.
 */
/// <reference types="node" />

import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { istVerdrahtet, produktionsPosition } from './test/smokeKetten'

describe('M1cy Waldtanz-Gegnerplakette Smoke-Wiring', () => {
  it('package.json npm run smoke:production enthaelt das M1cy-Smoke-Skript', () => {
    expect(istVerdrahtet('m1cy_waldtanz_gegnerplakette_smoke.mjs')).toBe(true)
  })

  it('M1cy-Smoke liegt in der kanonischen Kette NACH dem M1cx-Smoke (Spielerplakette)', () => {
    const m1cxIdx = produktionsPosition('m1cx_waldtanz_spielerplakette_smoke.mjs')
    const m1cyIdx = produktionsPosition('m1cy_waldtanz_gegnerplakette_smoke.mjs')
    expect(m1cxIdx).toBeGreaterThan(0)
    expect(m1cyIdx).toBeGreaterThan(m1cxIdx)
  })

  it('M1cy-Smoke-Skript-Datei existiert am erwarteten Pfad', () => {
    expect(existsSync('scripts/m1cy_waldtanz_gegnerplakette_smoke.mjs')).toBe(true)
  })
})