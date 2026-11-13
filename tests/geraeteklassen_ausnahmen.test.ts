// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { GERAETEKLASSEN } from '../scripts/pruefung/geraeteklassen.mjs'
import { VERGLEICH_VORGABE, abgleich, basisAusnahmen } from '../scripts/pruefung/ausnahmen.mjs'
import type { Ausnahme } from './layout/ausnahmen'

/*
P0.3c: Die Ausnahmeliste der Layout-Verträge (Zweck und Mechanik in
tests/layout/ausnahmen.ts) bleibt ehrlich: nur neue Klassen, nur bestehende
Verträge in Dateien, die die Liste anwenden, und sie wächst nicht.
*/

const WURZEL = resolve(__dirname, '..')
const LISTE = 'tests/layout/geraeteklassen_ausnahmen.json'
/** Die drei Klassen vor P0.3c waren grün; für sie gibt es keine Ausnahme. */
const NEUE_KLASSEN = ['tablet-hochkant', 'handy-quer']

const schluessel = ({ datei, vertrag, klasse }: Ausnahme) => `${klasse} | ${datei} | ${vertrag}`
const ausnahmen = (): Ausnahme[] => (JSON.parse(readFileSync(join(WURZEL, LISTE), 'utf8')) as { ausnahmen: Ausnahme[] }).ausnahmen

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

  it('P0.3c: jeder Eintrag zeigt auf einen bestehenden Vertrag in einer Datei, die die Liste anwendet', () => {
    for (const ausnahme of ausnahmen()) {
      const pfad = join(WURZEL, ausnahme.datei)
      expect(existsSync(pfad), `${ausnahme.datei} fehlt`).toBe(true)
      const quelltext = readFileSync(pfad, 'utf8')
      expect(quelltext, `${ausnahme.datei} ruft duldeBekannteAusnahmen() nicht auf`).toContain('duldeBekannteAusnahmen()')
      const gruppe = ausnahme.vertrag.split(' › ')[0]
      expect(quelltext, `${ausnahme.datei}: keine Gruppe „${gruppe}“`).toContain(gruppe)
    }
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
