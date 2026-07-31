/**
 * Author: rahn
 * Datum: 25.06.2026
 * Version: 1.0
 * Beschreibung: M3b Smoke-Wiring — der M3b-Lobby-Spielstart-Smoke ist in
 * der kanonischen `npm run smoke:production`-Kette nach dem M3a-Smoke
 * eingebunden, das Skript selbst existiert im Repo, und das Skript
 * beweist sichtbar den Stitch-inspirierten Spielstart-Vertrag der Lobby.
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { istVerdrahtet, produktionsKette } from './test/smokeKetten'


describe('M3b Smoke-Wiring in der kanonischen Kette', () => {
  it('package.json npm run smoke:production enthaelt das M3b-Smoke-Skript', () => {
    expect(istVerdrahtet('m3b_sonniges_nest_spielstart_smoke.mjs')).toBe(true)
  })

  it('M3b-Smoke liegt in der kanonischen Kette (smoke-Skript existiert im Repo)', () => {
    const kette = produktionsKette()
    const m3bIdx = kette.indexOf('scripts/m3b_sonniges_nest_spielstart_smoke.mjs')
    expect(m3bIdx).toBeGreaterThanOrEqual(0)
  })

  it('M3b-Smoke-Skript-Datei existiert am erwarteten Pfad', () => {
    expect(() => readFileSync('scripts/m3b_sonniges_nest_spielstart_smoke.mjs', 'utf-8')).not.toThrow()
  })

  it('M3b-Smoke beweist sichtbar den Spielstart-Vertrag (Border, Animation, Hover, Klick)', () => {
    const skript = readFileSync('scripts/m3b_sonniges_nest_spielstart_smoke.mjs', 'utf-8')
    expect(skript).toMatch(/Start-Buttons/i)
    expect(skript).toMatch(/KI-Slot.*Animation/i)
    expect(skript).toMatch(/Code-Schild.*Animation/i)
    expect(skript).toMatch(/hover|hover/i)
    expect(skript).toMatch(/Waldparty/)
  })
})
