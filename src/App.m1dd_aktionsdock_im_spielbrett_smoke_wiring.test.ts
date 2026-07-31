/**
 * Author: rahn
 * Datum: 23.06.2026
 * Version: 1.0
 * Beschreibung: M1dd Smoke-Wiring-Test stellt sicher, dass der neue
 *              Aktionsdock-im-Spielbrett-Smoke in der kanonischen
 *              `smoke:production`-Kette eingebunden ist. Verhindert, dass
 *              ein neuer Slice-Smoke stillschweigend vom Release uebergangen
 *              wird.
 */
/// <reference types="node" />

import {existsSync} from 'node:fs'
import { describe, expect, it } from 'vitest'
import { istVerdrahtet, produktionsPosition } from './test/smokeKetten'


describe('M1dd Smoke-Wiring in der kanonischen Kette', () => {
  it('verweist auf den neuen Aktionsdock-im-Spielbrett-Smoke', () => {
    expect(istVerdrahtet('m1dd_aktionsdock_im_spielbrett_smoke.mjs')).toBe(true)
  })

  it('liegt nach dem M1dc-Smoke (konsistente Slice-Reihenfolge)', () => {
    const idxM1dc = produktionsPosition('m1dc_spielmoment_pulse_smoke.mjs')
    const idxM1dd = produktionsPosition('m1dd_aktionsdock_im_spielbrett_smoke.mjs')
    expect(idxM1dc).toBeGreaterThanOrEqual(0)
    expect(idxM1dd).toBeGreaterThan(idxM1dc)
  })

  it('existiert als Smoke-Skript im Repo', () => {
    expect(existsSync('scripts/m1dd_aktionsdock_im_spielbrett_smoke.mjs')).toBe(true)
  })
})
