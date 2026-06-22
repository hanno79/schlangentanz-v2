/**
 * Author: rahn
 * Datum: 22.06.2026
 * Version: 1.0
 * Beschreibung: M1cx Smoke-Wiring-Test stellt sicher, dass der neue
 *              Spielerplakette-Smoke in der kanonischen `smoke:production`-Kette
 *              eingebunden ist und nach dem M1cw-Smoke folgt.
 */
/// <reference types="node" />

import { readFileSync, existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts?: Record<string, string> }
const smokeChain = packageJson.scripts?.['smoke:production'] ?? ''

describe('M1cx Smoke-Wiring in der kanonischen Kette', () => {
  it('verweist auf den neuen Spielerplakette-Smoke', () => {
    expect(smokeChain).toContain('m1cx_waldtanz_spielerplakette_smoke.mjs')
  })

  it('liegt nach dem M1cw-Smoke (konsistente Slice-Reihenfolge)', () => {
    const idxM1cw = smokeChain.indexOf('m1cw_brettschritt_konsequenz_smoke.mjs')
    const idxM1cx = smokeChain.indexOf('m1cx_waldtanz_spielerplakette_smoke.mjs')
    expect(idxM1cw).toBeGreaterThanOrEqual(0)
    expect(idxM1cx).toBeGreaterThan(idxM1cw)
  })

  it('existiert als Smoke-Skript im Repo', () => {
    expect(existsSync('scripts/m1cx_waldtanz_spielerplakette_smoke.mjs')).toBe(true)
  })
})