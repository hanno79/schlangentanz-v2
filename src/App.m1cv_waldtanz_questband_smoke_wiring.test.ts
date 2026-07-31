/**
 * Author: rahn
 * Datum: 21.06.2026
 * Version: 1.0
 * Beschreibung: M1cv Smoke-Wiring-Test stellt sicher, dass der neue
 *              Questband-Smoke in der kanonischen `smoke:production`-Kette
 *              eingebunden ist. Verhindert, dass ein neuer Slice-Smoke
 *              stillschweigend vom Release uebergangen wird.
 */
/// <reference types="node" />


import {existsSync} from 'node:fs'
import { describe, expect, it } from 'vitest'
import { istVerdrahtet, produktionsPosition } from './test/smokeKetten'


describe('M1cv Smoke-Wiring in der kanonischen Kette', () => {
  it('verweist auf den neuen Questband-Smoke', () => {
    expect(istVerdrahtet('m1cv_waldtanz_questband_smoke.mjs')).toBe(true)
  })

  it('liegt nach dem M1cu-Smoke (konsistente Slice-Reihenfolge)', () => {
    const idxM1cu = produktionsPosition('m1cu_brettschritt_lebensader_smoke.mjs')
    const idxM1cv = produktionsPosition('m1cv_waldtanz_questband_smoke.mjs')
    expect(idxM1cu).toBeGreaterThanOrEqual(0)
    expect(idxM1cv).toBeGreaterThan(idxM1cu)
  })

  it('existiert als Smoke-Skript im Repo', () => {
    expect(existsSync('scripts/m1cv_waldtanz_questband_smoke.mjs')).toBe(true)
  })
})