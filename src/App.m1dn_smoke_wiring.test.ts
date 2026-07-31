/**
 * Author: rahn
 * Datum: 26.06.2026
 * Version: 1.0
 * Beschreibung: M1dn beweist die Smoke-Wiring-Konvention: das neue
 *              Production-Smoke-Skript ist in der npm-Skript-Kette
 *              smoke:production eingebunden und enthaelt die pruefeM1dn-
 *              Funktion sowie die Slice-spezifischen CSS-Klassen.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {produktionsPosition, istVerdrahtet} from './test/smokeKetten'


describe('M1dn Waldtanz-Kompass-Flach Smoke-Wiring', () => {
  it('verdrahtet das M1dn-Smoke-Skript in der smoke:production-Kette', () => {
    expect(istVerdrahtet('m1dn_waldtanz_kompass_flach_smoke.mjs')).toBe(true)
  })

  it('platziert das M1dn-Smoke-Skript hinter dem M1dm-Smoke (Slice-Reihenfolge)', () => {
    const m1dmIdx = produktionsPosition('m1dm_waldtanz_arena_brettrand_smoke.mjs')
    const m1dnIdx = produktionsPosition('m1dn_waldtanz_kompass_flach_smoke.mjs')
    expect(m1dmIdx).toBeGreaterThan(-1)
    expect(m1dnIdx).toBeGreaterThan(m1dmIdx)
  })

  it('enthaelt im M1dn-Smoke-Skript die pruefeM1dn-Funktion und Slice-Klassen', () => {
    const src = readFileSync('scripts/m1dn_waldtanz_kompass_flach_smoke.mjs', 'utf8')
    expect(src).toContain('pruefeM1dnKompassFlach')
    expect(src).toContain('waldtanz-seitenmenue__kompass')
    expect(src).toContain('waldtanz-arenazug')
  })
})
