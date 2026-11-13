// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { GERAETEKLASSEN } from '../scripts/pruefung/geraeteklassen.mjs'
import { VERGLEICH_VORGABE, abgleich, basisAusnahmen } from '../scripts/pruefung/ausnahmen.mjs'
import { playwrightVertraege, unbekannteAusnahmen } from '../scripts/pruefung/vertraege.mjs'
import type { Ausnahme } from './layout/ausnahmen'

/*
P0.3c: Die Ausnahmeliste der Layout-Verträge (Zweck und Mechanik in
tests/layout/ausnahmen.ts) bleibt ehrlich: nur neue Klassen, nur Verträge, die es
in dieser Klasse wirklich gibt (voller Titel), in Dateien, die die Liste anwenden,
und sie wächst nicht.
*/

const WURZEL = resolve(__dirname, '..')
const LISTE = 'tests/layout/geraeteklassen_ausnahmen.json'
/** Die drei Klassen vor P0.3c waren grün; für sie gibt es keine Ausnahme. */
const NEUE_KLASSEN = ['tablet-hochkant', 'handy-quer']

const schluessel = ({ datei, vertrag, klasse }: Ausnahme) => `${klasse} | ${datei} | ${vertrag}`
const ausnahmen = (): Ausnahme[] => (JSON.parse(readFileSync(join(WURZEL, LISTE), 'utf8')) as { ausnahmen: Ausnahme[] }).ausnahmen

/** Gegenprobe des Prüfers (Protokoll P0.3c, Mangel 1): „ausserhalb“ mit ss; den Vertrag gibt es nur mit Eszett. */
const TIPPFEHLER: Ausnahme = {
  datei: 'tests/layout/lobby.spec.ts',
  vertrag: 'O2: Regelseite › kein Bedienelement liegt ausserhalb des Bildes',
  klasse: 'handy-quer',
  befund: 'Probe: Vertragsname mit ss',
}

describe('P0.3c: Ausnahmeliste der Layout-Verträge je Geräteklasse', () => {
  it('P0.3c: jeder Eintrag nennt Datei, Vertrag, eine neue Geräteklasse und den Befund, keiner doppelt', () => {
    expect(GERAETEKLASSEN.map(({ name }) => name)).toEqual(expect.arrayContaining(NEUE_KLASSEN))
    const liste = ausnahmen()
    for (const ausnahme of liste) {
      const wo = schluessel(ausnahme)
      expect(NEUE_KLASSEN, `${wo}: nur Tablet hochkant und Handy quer dürfen Ausnahmen haben`).toContain(ausnahme.klasse)
      expect(ausnahme.befund.trim(), `${wo}: Befund fehlt`).not.toBe('')
      expect(ausnahme.vertrag, `${wo}: Vertrag als „Gruppe › Test“`).toContain(' › ')
    }
    expect(new Set(liste.map(schluessel)).size).toBe(liste.length)
  })

  it('P0.3c: jede Datei mit Einträgen wendet die Liste an', () => {
    for (const { datei } of ausnahmen()) {
      const pfad = join(WURZEL, datei)
      expect(existsSync(pfad), `${datei} fehlt`).toBe(true)
      expect(readFileSync(pfad, 'utf8'), `${datei} ruft duldeBekannteAusnahmen() nicht auf`).toContain('duldeBekannteAusnahmen()')
    }
  })

  it('P0.3c: unbekannteAusnahmen meldet einen Eintrag, dessen voller Titel in seiner Klasse nicht vorkommt', () => {
    const vertraege = [
      { projekt: 'handy-quer', datei: 'tests/layout/lobby.spec.ts', vertrag: 'O2: Regelseite › kein Bedienelement liegt außerhalb des Bildes' },
      { projekt: 'tablet-hochkant-testhooks', datei: 'tests/layout/x.hooks.spec.ts', vertrag: 'G › T' },
    ]
    const richtig = { ...TIPPFEHLER, vertrag: vertraege[0].vertrag }
    const hook = { datei: 'tests/layout/x.hooks.spec.ts', vertrag: 'G › T', klasse: 'tablet-hochkant', befund: 'b' }

    expect(unbekannteAusnahmen([TIPPFEHLER, richtig, hook], vertraege)).toEqual([TIPPFEHLER])
    expect(unbekannteAusnahmen([{ ...richtig, klasse: 'tablet-hochkant' }], vertraege)).toHaveLength(1)
    expect(unbekannteAusnahmen([{ ...richtig, datei: 'tests/layout/navigation.spec.ts' }], vertraege)).toHaveLength(1)
  })

  it('P0.3c: jeder Eintrag trifft einen Vertrag, den npx playwright test --list in seiner Klasse kennt', { timeout: 60_000 }, () => {
    const vertraege = playwrightVertraege(WURZEL)
    expect(vertraege.length, 'playwright test --list liefert keine Verträge').toBeGreaterThan(0)

    expect(unbekannteAusnahmen(ausnahmen(), vertraege).map(schluessel), 'Einträge ohne passenden Vertrag').toEqual([])
    expect(unbekannteAusnahmen([TIPPFEHLER], vertraege), 'Gegenprobe mit „ausserhalb“').toEqual([TIPPFEHLER])
  })

  it(`P0.3c: die Liste wächst nicht gegenüber der Merge-Basis mit ${VERGLEICH_VORGABE}`, () => {
    const frueher = (basisAusnahmen(WURZEL, VERGLEICH_VORGABE, LISTE).daten as { ausnahmen?: Ausnahme[] }).ausnahmen
    // Fehlt die Liste auf der Basis, legt dieser Stand sie an (P0.3c); dann gibt es nichts zu vergleichen.
    if (frueher === undefined) return
    const jetzt = ausnahmen().map(schluessel)

    const { neu } = abgleich(jetzt, frueher.map(schluessel))
    expect(neu.map((stelle) => jetzt[stelle]), 'neue Ausnahmen; die Liste darf nur schrumpfen').toEqual([])
  })
})
