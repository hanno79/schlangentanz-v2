import { describe, expect, it } from 'vitest'
import { deserialisiere, ermittleAktionen, ermittleEntscheider, serialisiere } from '../engine'
import type { Ereignis } from '../engine'
import { SZENARIEN } from './szenarien'
import { erzeuge, klicke } from './szenarienTesthilfe'
import type { Wahl } from './szenarienTesthilfe'

/*
X3: Die Szenarien des Rahmens lassen sich am Entwicklertisch so durchklicken,
wie ihre Erwartung es sagt. Jeder Schritt ist ein Knopf, den die Engine aufzählt.
*/

const waehle = (wahl: string): Wahl => (aktion) => aktion.typ === 'Entscheiden' && aktion.wahl === wahl
const farbkarte: Wahl = (aktion) => aktion.typ === 'FarbkarteLegen'
const beenden: Wahl = (aktion) => aktion.typ === 'ZugBeenden'
const abwerfen: Wahl = (aktion) => aktion.typ === 'UeberhandAbwerfen'
const typen = (ereignisse: Ereignis[]) => ereignisse.map((ereignis) => ereignis.typ)

describe('X3: Szenarien des Rahmens am Entwicklertisch', () => {
  it('X3: die Szenarien sind da', () => {
    expect(SZENARIEN.map((szenario) => szenario.name)).toEqual(expect.arrayContaining(['entscheidung-gegner', 'entscheidung-letzte-karte']))
  })

  it('D52/A8.2: entscheidung-gegner: erst wählt Spieler 1 den Gegner, dann der Gegner die Karte; der Gegner baut erst an seinem Zugende ab', () => {
    const start = erzeuge('entscheidung-gegner')
    expect(ermittleEntscheider(start)).toBe(0)
    expect(ermittleAktionen(start)).toEqual([
      { typ: 'Entscheiden', spielerId: 'spieler-1', wahl: 'spieler-2' },
      { typ: 'Entscheiden', spielerId: 'spieler-1', wahl: 'spieler-3' },
    ])
    expect(deserialisiere(serialisiere(start)), 'Speichern und Laden mitten in der Entscheidung').toEqual(start)
    const gegner = klicke(start, waehle('spieler-3'))
    expect(typen(gegner.ereignisse)).toEqual(['Entschieden', 'EntscheidungVerlangt'])
    expect(ermittleEntscheider(gegner.zustand)).toBe(2)
    const genommen = klicke(gegner.zustand, waehle('aufgedeckte'))
    expect(genommen.zustand.spieler[2].hand).toHaveLength(7)
    expect(ermittleEntscheider(genommen.zustand)).toBe(0)
    const runde = klicke(genommen.zustand, farbkarte, beenden, farbkarte, beenden, farbkarte, beenden)
    expect(typen(runde.ereignisse)).toContain('AbwerfenVerlangt')
    expect(runde.ereignisse.find((ereignis) => ereignis.typ === 'AbwerfenVerlangt')).toEqual({ typ: 'AbwerfenVerlangt', spielerIndex: 2, anzahl: 1 })
    const danach = klicke(runde.zustand, abwerfen)
    expect(danach.zustand.spieler[2].hand).toHaveLength(5)
    expect(danach.zustand.zug.spielerIndex).toBe(0)
  })

  it('D55: entscheidung-letzte-karte: zieht der Gegner die letzte Karte, löst Spieler 1 die Schlussrunde aus', () => {
    const gegner = klicke(erzeuge('entscheidung-letzte-karte'), waehle('spieler-2'))
    const gezogen = klicke(gegner.zustand, waehle('stapel'))
    expect(typen(gezogen.ereignisse)).toEqual(['Entschieden', 'KartenVersetzt', 'SchlussrundeBegonnen'])
    expect(gezogen.zustand).toMatchObject({ partiephase: 'Schlussrunde', schlussrundeAusloeser: 0 })
    const ende = klicke(gezogen.zustand, farbkarte, beenden, farbkarte, beenden, farbkarte, beenden)
    expect(ende.zustand.partiephase).toBe('Beendet')
  })
})
