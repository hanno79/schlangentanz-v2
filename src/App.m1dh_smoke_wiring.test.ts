/**
 * Author: rahn
 * Datum: 25.06.2026
 * Version: 1.1
 * Beschreibung: M1dh Smoke-Wiring-Test stellt sicher, dass das M1dh-Skript
 *   existiert und in einer der beiden kanonischen Smoke-Ketten referenziert wird.
 *
 * ÄNDERUNG [30.07.2026]: AP-1 — M1dh navigiert nach `/game?phase=zugabschluss`
 *   und braucht damit den `?phase=`-Test-Hook. Seit AP-1 laufen hook-abhängige
 *   Smokes in `smoke:preview` statt `smoke:production`, damit die Hooks in der
 *   ausgelieferten Production-App abgeschaltet bleiben können. Der Wiring-Vertrag
 *   lautet deshalb „in einer der beiden Ketten verdrahtet"; welche Kette es sein
 *   muss, prüft `src/App.hooks_production_guard.test.ts`.
 */
/// <reference types="node" />

import { readFileSync, existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { istVerdrahtet, previewSchritte } from './test/smokeKetten'

const smokeScriptPath = 'scripts/m1dh_waldtanz_spielhandlung_smoke.mjs'

describe('M1dh Smoke-Wiring', () => {
  it('existiert als Playwright-Browser-Smoke-Skript', () => {
    expect(existsSync(smokeScriptPath)).toBe(true)
  })

  it('ist in einer der kanonischen Smoke-Ketten verdrahtet', () => {
    expect(istVerdrahtet('m1dh_waldtanz_spielhandlung_smoke.mjs')).toBe(true)
  })

  it('läuft in der Preview-Kette, weil es den ?phase=-Test-Hook braucht', () => {
    expect(previewSchritte().some((schritt) => schritt.includes('m1dh_waldtanz_spielhandlung_smoke.mjs'))).toBe(true)
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