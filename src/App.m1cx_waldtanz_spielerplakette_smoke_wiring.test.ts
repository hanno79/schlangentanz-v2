/**
 * Author: rahn
 * Datum: 22.06.2026
 * Version: 1.0
 * Beschreibung: M1cx Smoke-Wiring-Test stellt sicher, dass der neue
 *              Spielerplakette-Smoke in der kanonischen `smoke:production`-Kette
 *              eingebunden ist und nach dem M1cw-Smoke folgt.
 */
/// <reference types="node" />

import {existsSync} from 'node:fs'
import { describe, expect, it } from 'vitest'
import { istVerdrahtet, produktionsPosition } from './test/smokeKetten'


describe('M1cx Smoke-Wiring in der kanonischen Kette', () => {
  it('verweist auf den neuen Spielerplakette-Smoke', () => {
    expect(istVerdrahtet('m1cx_waldtanz_spielerplakette_smoke.mjs')).toBe(true)
  })

  it('liegt nach dem M1cw-Smoke (konsistente Slice-Reihenfolge)', () => {
    const idxM1cw = produktionsPosition('m1cw_brettschritt_konsequenz_smoke.mjs')
    const idxM1cx = produktionsPosition('m1cx_waldtanz_spielerplakette_smoke.mjs')
    expect(idxM1cw).toBeGreaterThanOrEqual(0)
    expect(idxM1cx).toBeGreaterThan(idxM1cw)
  })

  it('existiert als Smoke-Skript im Repo', () => {
    expect(existsSync('scripts/m1cx_waldtanz_spielerplakette_smoke.mjs')).toBe(true)
  })
})