/**
 * Author: rahn
 * Datum: 25.06.2026
 * Version: 1.0
 * Beschreibung: M1df Smoke-Wiring + Cascade-Guard-Tests.
 *
 *   1. Kanonischer Smoke `m1df_waldtanz_steinkreis_smoke.mjs` existiert
 *      im scripts/-Verzeichnis.
 *   2. Kanonischer Smoke ist zwischen M1e-Waldtanz-Spieluhr und
 *      M1d1-Arena-Flex-Column in `package.json` `smoke:production`
 *      verdrahtet (Konsistenz mit den frueheren M1e/M1d3-Vertrag).
 *   3. _probe- und _smoke-Datei-Hygiene: keine temporaeren _probe.mjs
 *      Skripte im scripts/-Verzeichnis (nur kanonische _smoke.mjs).
 *   4. .waldtanz-steinkreis-Block kommt NACH dem
 *      .waldtanz-magiekreise-Block in src/App.css, damit der
 *      ::before-Hintergrund die M1d3-Lichtung nicht versehentlich
 *      ueberdeckt (Cascade-Reihenfolge-Schutz).
 */
/// <reference types="node" />

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { istVerdrahtet, produktionsPosition } from './test/smokeKetten'
const appCss = readFileSync('src/App.css', 'utf8')

describe('M1df Waldtanz-Spielmoment-Stein­kreis Smoke-Wiring', () => {
  it('kanonischer Smoke scripts/m1df_waldtanz_steinkreis_smoke.mjs existiert', () => {
    expect(existsSync('scripts/m1df_waldtanz_steinkreis_smoke.mjs')).toBe(true)
  })

  // ÄNDERUNG [30.07.2026]: AP-1 — M1e ist hook-abhängig (`/game?phase=…`) und
  // liegt seither in `smoke:preview`, nicht mehr in `smoke:production`. Ein
  // Positionsvergleich M1e < M1df über Kettengrenzen hinweg hätte keine Aussage
  // mehr. Erhalten bleibt der Teil des Vertrags, der innerhalb der Production-Kette
  // prüfbar ist (M1df vor M1d1), plus die Verdrahtung von M1e in *einer* Kette.
  it('M1df-Smoke ist in smoke:production vor M1d1 verdrahtet, M1e in einer der Ketten', () => {
    const m1df = produktionsPosition('m1df_waldtanz_steinkreis_smoke.mjs')
    const m1d1 = produktionsPosition('m1d1_arena_flex_column_smoke.mjs')
    expect(m1df).toBeGreaterThan(-1)
    expect(m1d1).toBeGreaterThan(-1)
    expect(m1d1).toBeGreaterThan(m1df)
    expect(istVerdrahtet('m1e_waldtanz_spieluhr_smoke.mjs')).toBe(true)
  })

  it('keine temporaeren _probe.mjs Skripte im scripts/-Verzeichnis', () => {
    const probeFiles = readdirSync('scripts').filter((f) => f.startsWith('_') && f.endsWith('_probe.mjs'))
    expect(probeFiles).toEqual([])
  })

  it('.waldtanz-steinkreis CSS-Block kommt nach .waldtanz-magiekreise-Block (Cascade-Schutz)', () => {
    const magiekreisePos = appCss.indexOf('.waldtanz-magiekreise {')
    const steinkreisPos = appCss.indexOf('.waldtanz-steinkreis {')
    // Erlaubt nur, wenn .waldtanz-magiekreise-Block ueberhaupt existiert
    // und .waldtanz-steinkreis spaeter folgt (sonst gewinnt der generische
    // M1d3-Lichtungs-Background und der ::before-Stein wird uebermalt).
    expect(magiekreisePos).toBeGreaterThan(-1)
    expect(steinkreisPos).toBeGreaterThan(magiekreisePos)
  })
})
