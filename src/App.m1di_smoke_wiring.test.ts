/*
Author: rahn
Datum: 25.06.2026
Version: 1.0
Beschreibung: M1di Smoke-Wiring-Test.
              Prueft, dass das neue Smoke-Skript in der `smoke:production`-Kette
              eingebunden ist und die Pflicht-Funktion + Pflicht-Klassen enthaelt.
*/
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { istVerdrahtet } from './test/smokeKetten'

function readSrc(relPath: string): string {
  return readFileSync(resolve(process.cwd(), relPath), 'utf8')
}

describe('M1di Smoke-Wiring', () => {
  it('m1di:1 smoke:production-Kette enthaelt das neue M1di-Smoke-Skript', () => {
    expect(istVerdrahtet('m1di_waldtanz_schlangenlichtung_smoke.mjs')).toBe(true)
  })

  it('m1di:2 das M1di-Smoke-Skript enthaelt die Pflicht-Funktion pruefeM1diSchlangenlichtung', () => {
    const smoke = readSrc('scripts/m1di_waldtanz_schlangenlichtung_smoke.mjs')
    expect(smoke).toMatch(/function\s+pruefeM1diSchlangenlichtung\s*\(/)
  })

  it('m1di:3 das M1di-Smoke-Skript enthaelt die Pflicht-CSS-Klassen waldtanz-schlangenlichtung', () => {
    const smoke = readSrc('scripts/m1di_waldtanz_schlangenlichtung_smoke.mjs')
    expect(smoke).toMatch(/waldtanz-schlangenlichtung/)
  })
})