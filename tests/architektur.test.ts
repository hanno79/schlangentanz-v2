// @vitest-environment node
import { afterAll, describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import {
  AUSNAHMEN_U4,
  VOLLER_ZUSTAND_TYP,
  exportiertEngine,
  istTestdatei,
  pruefeEngineReinheit,
  pruefeEngineZugang,
  pruefeSichtZugriff,
  sammleDateien,
  type Verstoss,
} from './architektur_pruefung'
import { abgleich, merkmalDerZeile } from '../scripts/pruefung/ausnahmen.mjs'

const WURZEL = resolve(__dirname, '..')
const lies = (pfad: string) => readFileSync(join(WURZEL, pfad), 'utf8')
const ohneTests = (pfade: string[]) => pfade.filter((pfad) => !istTestdatei(pfad))

const engineDateien = ohneTests(sammleDateien(WURZEL, 'src/engine'))
const uiKiDateien = ohneTests([...sammleDateien(WURZEL, 'src/ui'), ...sammleDateien(WURZEL, 'src/ki')])
const kiDateien = uiKiDateien.filter((pfad) => pfad.startsWith('src/ki/'))

/** U4 je Datei: alle Verstösse, dazu welche davon nicht in der Ausnahmeliste stehen und welche Merkmale dort veraltet sind. */
function u4Abgleich(pfad: string, quelltext: string, erlaubt: string[]) {
  const verstoesse = pruefeEngineReinheit(pfad, quelltext)
  const { neu, veraltet } = abgleich(verstoesse.map(({ zeile }) => merkmalDerZeile(quelltext, zeile)), erlaubt)
  return { neue: neu.map((index) => verstoesse[index]), veraltet }
}
const u4 = new Map(engineDateien.map((pfad) => [pfad, u4Abgleich(pfad, lies(pfad), AUSNAHMEN_U4[pfad] ?? [])]))

const beschreibe = (verstoesse: Verstoss[]) =>
  verstoesse.map(({ regel, datei, zeile, was }) => `${regel} ${datei}:${zeile} ${was}`).join('\n')

if (uiKiDateien.length === 0) {
  console.warn(
    'Architekturtest U3/U5: src/ui und src/ki enthalten heute 0 Dateien. Die Prüfung läuft leer; ' +
      'sie greift für jede Datei, die dort entsteht (Gegenproben unten).',
  )
}

describe('U4: Die Engine ist rein', () => {
  it(`U4: ${engineDateien.length} Dateien unter src/engine (ohne Tests) nutzen kein React, kein DOM, kein Math.random, kein Date`, () => {
    expect(engineDateien.length, 'U4: unter src/engine wurde keine Datei gefunden').toBeGreaterThan(0)

    const neue = [...u4.values()].flatMap(({ neue }) => neue)

    expect(beschreibe(neue), 'U4: erwartet keine Verstösse ausserhalb der Ausnahmeliste').toBe('')
  })

  // Dass jeder Eintrag eine Liste von Merkmalen ist, prüft schon das Laden von AUSNAHMEN_U4 (pruefeFormat).
  it('U4: die Ausnahmeliste für den Altbestand ist nicht veraltet', () => {
    const veraltet = Object.entries(AUSNAHMEN_U4)
      .map(([pfad, erlaubt]) => ({ pfad, veraltet: u4.get(pfad)?.veraltet ?? erlaubt }))
      .filter(({ veraltet }) => veraltet.length > 0)

    expect(veraltet, 'U4: Merkmal unter "U4" in scripts/check_regeln_ausnahmen.json löschen').toEqual([])
  })

  it('P0.3b: U4-Tausch – ein neuer Verstoss statt eines geduldeten fällt auf', () => {
    const geduldet = 'export const wurf = (rng: () => number = () => Math.random()) => rng()\n'
    const getauscht = "export const wurf = (rng: () => number = () => Math['random']()) => rng()\n"
    const erlaubt = [merkmalDerZeile(geduldet, 1)]

    expect(u4Abgleich('src/engine/probe.ts', geduldet, erlaubt)).toEqual({ neue: [], veraltet: [] })
    const tausch = u4Abgleich('src/engine/probe.ts', getauscht, erlaubt)
    expect(tausch.neue, 'U4: der getauschte Verstoss muss neu sein').toHaveLength(1)
    expect(tausch.veraltet).toEqual(erlaubt)
  })
})

describe('U3: Oberfläche und KI kennen nur src/engine/index.ts', () => {
  it(`U3: ${uiKiDateien.length} Dateien unter src/ui und src/ki (ohne Tests) importieren die Engine nur über src/engine/index.ts`, () => {
    const verstoesse = uiKiDateien.flatMap((pfad) => pruefeEngineZugang(pfad, lies(pfad)))

    expect(beschreibe(verstoesse), 'U3: erwartet keine Importe an src/engine/index.ts vorbei').toBe('')
  })
})

describe('U5: Die KI sieht nur ihre Sicht', () => {
  it(`U5: src/engine/index.ts exportiert den vollen Zustandstyp ${VOLLER_ZUSTAND_TYP}`, () => {
    expect(
      exportiertEngine(WURZEL, VOLLER_ZUSTAND_TYP),
      `U5: ${VOLLER_ZUSTAND_TYP} fehlt in src/engine/index.ts; nach einer Umbenennung VOLLER_ZUSTAND_TYP nachziehen`,
    ).toBe(true)
  })

  it(`U5: ${kiDateien.length} Dateien unter src/ki (ohne Tests) lesen den vollen Zustand nur in src/ki/sicht.ts`, () => {
    const verstoesse = pruefeSichtZugriff(WURZEL, kiDateien)

    expect(beschreibe(verstoesse), 'U5: erwartet keinen Lesezugriff auf den vollen Zustand ausser in sicht.ts').toBe('')
  })
})

describe('P0.3: Gegenproben – die Prüfungen greifen bei absichtlichen Verstössen', () => {
  const verbotenInDerEngine = [
    "import React from 'react'",
    "import { createRoot } from 'react-dom/client'",
    "export { useState } from 'react'",
    "const r = require('react')",
    "const m = await import('react')",
    "const n = await import('re' + 'act')",
    'const o = require(modulname)',
    'const z = Math.random()',
    'const f = Math.random',
    'const t = Date.now()',
    'const d = new Date()',
    'const titel = document.title',
    'const s = window.localStorage',
    "localStorage.getItem('x')",
    'crypto.getRandomValues(new Uint8Array(1))',
  ]

  it.each(verbotenInDerEngine)('U4: „%s“ unter src/engine wird gemeldet', (zeile) => {
    const verstoesse = pruefeEngineReinheit('src/engine/probe.ts', `${zeile}\n`)

    expect(verstoesse.length, `U4: erwartet einen Verstoss für ${zeile}`).toBeGreaterThan(0)
    expect(verstoesse[0]).toMatchObject({ regel: 'U4', datei: 'src/engine/probe.ts', zeile: 1 })
  })

  const umgehungenZufall = [
    'const { random } = Math',
    'const { random: wuerfel } = Math',
    "Math['random']()",
    'const f = Math["random"]',
    'globalThis.Math.random()',
    'window.Math.random()',
    'self.Math.random()',
    "const z = globalThis['Math'].random()",
    'const M = Math',
    'export const z = Math[schluessel]()',
    'export const w = globalThis[schluessel].random()',
    'const { getRandomValues } = crypto',
    'globalThis.crypto.randomUUID()',
  ]

  it.each(umgehungenZufall)('P0.3b: U4-Umgehung „%s“ wird als Zufall gemeldet', (zeile) => {
    const verstoesse = pruefeEngineReinheit('src/engine/probe.ts', `${zeile}\n`)

    expect(
      verstoesse.filter(({ was }) => was.includes('Zufall kommt als Parameter')).map(({ zeile }) => zeile),
      `U4: erwartet eine Zufallsmeldung in Zeile 1, gefunden:\n${beschreibe(verstoesse)}`,
    ).toContain(1)
  })

  const zeitInDerEngine = ['const d = new Date', 'const t = Date.now()', 'globalThis.Date.now()', 'const { now } = Date', "const h = globalThis['Date']"]

  it.each(zeitInDerEngine)('P0.3b: U4 verbietet Date: „%s“ wird gemeldet', (zeile) => {
    const verstoesse = pruefeEngineReinheit('src/engine/probe.ts', `${zeile}\n`)

    expect(
      verstoesse.filter(({ was }) => was.includes('Date')).map(({ zeile }) => zeile),
      `U4: erwartet eine Date-Meldung in Zeile 1, gefunden:\n${beschreibe(verstoesse)}`,
    ).toContain(1)
  })

  it('U4: Harmloses mit ähnlichen Namen wird nicht gemeldet', () => {
    const quelltext = [
      'const { max, floor } = Math',
      "export const groesste = Math['max'](1, 2) + Math.max(3, 4) + max(5) + floor(6) + Math.PI",
      'const zufall = { random: () => 0 }',
      'zufall.random()',
      "const text = 'Math.random und new Date()'",
      '// Date und document im Kommentar',
      'const o = { Date: 1, window: 2 }',
      'export const summe = o.Date + o.window + zufall.random() + text.length',
      'export function mische(zufallsquelle: () => number) { return zufallsquelle() }',
      '',
    ].join('\n')

    expect(beschreibe(pruefeEngineReinheit('src/engine/probe.ts', quelltext))).toBe('')
  })

  it('U3: Importe an src/engine/index.ts vorbei werden gemeldet, über index.ts nicht', () => {
    const quelltext = [
      "import { a } from '../engine'",
      "import { b } from '../engine/index'",
      "import { c } from '../engine/index.ts'",
      "import { d } from '../engine/state'",
      "import type { E } from '../engine/types'",
      "export * from '../engine/aktionen/typen'",
      "const f = await import('../engine/legalActions')",
      "import { g } from './sicht'",
      "import { useState } from 'react'",
      '',
    ].join('\n')

    const verstoesse = pruefeEngineZugang('src/ki/schritt.ts', quelltext)

    expect(verstoesse.map(({ zeile }) => zeile)).toEqual([4, 5, 6, 7])
    expect(verstoesse.every(({ regel }) => regel === 'U3')).toBe(true)
    expect(pruefeEngineZugang('src/ui/tisch/Karte.tsx', "import { x } from '../../engine/deck'\n")).toHaveLength(1)
    expect(pruefeEngineZugang('src/ui/tisch/Karte.tsx', "import { x } from '../../engine'\n")).toEqual([])
  })

  describe('U5: Lesezugriff auf den vollen Zustand', () => {
    const probe = mkdtempSync(join(tmpdir(), 'architektur-u5-'))
    afterAll(() => rmSync(probe, { recursive: true, force: true }))
    const dateien: Record<string, string> = {
      'src/engine/index.ts': [
        'export interface Spielzustand { spieler: string[]; stapel: string[] }',
        'export function erlaubteAktionen(zustand: Spielzustand): string[] { return zustand.spieler }',
        '',
      ].join('\n'),
      'src/ki/sicht.ts': [
        "import type { Spielzustand } from '../engine'",
        'export function sicht(zustand: Spielzustand) { return { anzahl: zustand.spieler.length } }',
        '',
      ].join('\n'),
      'src/ki/schritt.ts': [
        "import { erlaubteAktionen, type Spielzustand } from '../engine'",
        "import { sicht } from './sicht'",
        'export function schritt(zustand: Spielzustand) { return [sicht(zustand), erlaubteAktionen(zustand)] }',
        '',
      ].join('\n'),
      'src/ki/boese.ts': [
        "import type { Spielzustand } from '../engine'",
        'export const a = (zustand: Spielzustand) => zustand.stapel',
        "export const b = (zustand: Spielzustand) => zustand['spieler']",
        'export function c(zustand: Spielzustand) { const { stapel } = zustand; return stapel }',
        'export const d = (zustand: Spielzustand | undefined) => zustand?.spieler',
        'export const e = (zustand: Spielzustand) => ({ ...zustand })',
        '',
      ].join('\n'),
    }
    for (const [pfad, inhalt] of Object.entries(dateien)) {
      mkdirSync(dirname(join(probe, pfad)), { recursive: true })
      writeFileSync(join(probe, pfad), inhalt)
    }

    it('U5: jeder Lesezugriff ausserhalb von sicht.ts wird gemeldet', () => {
      const verstoesse = pruefeSichtZugriff(probe, ['src/ki/sicht.ts', 'src/ki/schritt.ts', 'src/ki/boese.ts'])

      expect(verstoesse.map(({ datei, zeile }) => `${datei}:${zeile}`)).toEqual([
        'src/ki/boese.ts:2',
        'src/ki/boese.ts:3',
        'src/ki/boese.ts:4',
        'src/ki/boese.ts:5',
        'src/ki/boese.ts:6',
      ])
      expect(verstoesse.every(({ regel }) => regel === 'U5')).toBe(true)
    })

    it('U5: der Typ wird über den Export von src/engine/index.ts gefunden', () => {
      expect(exportiertEngine(probe, 'Spielzustand')).toBe(true)
      expect(exportiertEngine(probe, 'GibtEsNicht')).toBe(false)
    })
  })
})
