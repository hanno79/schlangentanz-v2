/**
 * Author: rahn
 * Datum: 25.06.2026
 * Version: 1.0
 * Beschreibung: M1dh Smoke-Wiring-Test stellt sicher, dass das M1dh-Skript
 *   existiert, in der kanonischen smoke:production-Kette referenziert wird
 *   und nach M3b kommt.
 */
/// <reference types="node" />

import { readFileSync, existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const packageJson = readFileSync('package.json', 'utf8')
const smokeScriptPath = 'scripts/m1dh_waldtanz_spielhandlung_smoke.mjs'

describe('M1dh Smoke-Wiring', () => {
  it('existiert als Playwright-Browser-Smoke-Skript', () => {
    expect(existsSync(smokeScriptPath)).toBe(true)
  })

  it('ist in der kanonischen smoke:production-Kette verdrahtet', () => {
    const chain = packageJson.match(/"smoke:production":\s*"([^"]+)"/)?.[1] ?? ''
    expect(chain).toContain('m1dh_waldtanz_spielhandlung_smoke.mjs')
  })

  it('enthaelt die geforderten Stitch-Pille-Strings im Browser-Smoke', () => {
    const script = readFileSync(smokeScriptPath, 'utf8')
    expect(script).toContain('handkarten-buehne__endturn')
    expect(script).toContain('handkarten-buehne__pflichtabwurf')
    expect(script).toContain('handkarte__spielhinweis')
    expect(script).toContain('handkarten-buehne__spielerplakette')
    expect(script).toContain('pruefeM1dhSpielhandlung')
  })
})