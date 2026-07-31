/**
 * Author: rahn
 * Datum: 26.06.2026
 * Version: 1.0
 * Beschreibung: M1dm beweist die Smoke-Wiring-Konvention: das neue
 *              Production-Smoke-Skript ist in der npm-Skript-Kette
 *              smoke:production eingebunden und enthaelt die pruefeM1dm-
 *              Funktion sowie die Slice-spezifischen CSS-Klassen.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {produktionsPosition, istVerdrahtet} from './test/smokeKetten'


describe('M1dm Brettrand-Zentrum Smoke-Wiring', () => {
  it('verdrahtet das M1dm-Smoke-Skript in der smoke:production-Kette', () => {
    expect(istVerdrahtet('m1dm_waldtanz_arena_brettrand_smoke.mjs')).toBe(true)
  })

  it('platziert das M1dm-Smoke-Skript hinter dem M1dl-Smoke (Slice-Reihenfolge)', () => {
    const m1dlIdx = produktionsPosition('m1dl_waldtanz_anlegeplatz_dropzone_smoke.mjs')
    const m1dmIdx = produktionsPosition('m1dm_waldtanz_arena_brettrand_smoke.mjs')
    expect(m1dlIdx).toBeGreaterThan(-1)
    expect(m1dmIdx).toBeGreaterThan(m1dlIdx)
  })

  it('enthaelt im M1dm-Smoke-Skript die pruefeM1dm-Funktion und Slice-Klassen', () => {
    const src = readFileSync('scripts/m1dm_waldtanz_arena_brettrand_smoke.mjs', 'utf8')
    expect(src).toContain('pruefeM1dmBrettrandZentrum')
    expect(src).toContain('aktionen-panel--waldtanz-dock')
    expect(src).toContain('waldtanz-arenazug')
    expect(src).toContain('waldtanz-arenastein')
  })
})