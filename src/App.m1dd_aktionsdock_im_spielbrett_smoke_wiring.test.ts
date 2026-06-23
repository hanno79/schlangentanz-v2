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

import { readFileSync, existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts?: Record<string, string> }
const smokeChain = packageJson.scripts?.['smoke:production'] ?? ''

describe('M1dd Smoke-Wiring in der kanonischen Kette', () => {
  it('verweist auf den neuen Aktionsdock-im-Spielbrett-Smoke', () => {
    expect(smokeChain).toContain('m1dd_aktionsdock_im_spielbrett_smoke.mjs')
  })

  it('liegt nach dem M1dc-Smoke (konsistente Slice-Reihenfolge)', () => {
    const idxM1dc = smokeChain.indexOf('m1dc_spielmoment_pulse_smoke.mjs')
    const idxM1dd = smokeChain.indexOf('m1dd_aktionsdock_im_spielbrett_smoke.mjs')
    expect(idxM1dc).toBeGreaterThanOrEqual(0)
    expect(idxM1dd).toBeGreaterThan(idxM1dc)
  })

  it('existiert als Smoke-Skript im Repo', () => {
    expect(existsSync('scripts/m1dd_aktionsdock_im_spielbrett_smoke.mjs')).toBe(true)
  })
})
