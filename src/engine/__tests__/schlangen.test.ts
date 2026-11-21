import { describe, expect, it } from 'vitest'
import type { Spielkarte, Spielzustand } from '../index'
import { betroffenerBesitzer, grundVerdeckt } from '../karten/schlangenstelle'
import { alleSchlangen, beginneSchlange, findeSchlange, gepruefteSchlange, nimmAusSchlange, schlangenVon } from '../schlangen'
import { baukasten } from '../testing/szenario'

/*
R1: Die gemeinsamen Hilfen, die die Kartendateien für Schlangen am Tisch
benutzen. Ein Tisch zu dritt: Spieler 1 hat schlange-1 (Rot, Blau) und
schlange-2 (Gelb), Spieler 3 hat schlange-3 (Rot, Farbenfusion auf Grün und
Grün, Blau). Spieler 2 hat keine Schlange.
*/

function tisch(): Spielzustand {
  return baukasten({ spielerzahl: 3, erweiterung: false })
    .schlange(0, ['Rot', 'Blau'])
    .schlange(0, ['Gelb'])
    .schlange(2, ['Rot', { fusion: ['Grün', 'Grün'] }, 'Blau'])
    .zustand()
}

const art = (karte: Spielkarte) => (karte.typ === 'Farbkarte' ? karte.farbe : karte.name)
const ids = (zustand: Spielzustand, spieler: number) => zustand.spieler[spieler].schlangen.map((schlange) => schlange.id)
const karten = (zustand: Spielzustand, schlangenId: string) => gepruefteSchlange(zustand, schlangenId).schlange.karten.map(art)

describe('A5/D9: Schlangen am Tisch finden und durchlaufen (R1)', () => {
  it('A5: alleSchlangen nennt jede Schlange mit Besitzer, in Sitzordnung und je Spieler in seiner Reihenfolge', () => {
    const zustand = tisch()
    expect(alleSchlangen(zustand).map(({ schlange, besitzer }) => `${schlange.id}@${besitzer}`)).toEqual(['schlange-1@0', 'schlange-2@0', 'schlange-3@2'])
  })

  it('A5: schlangenVon folgt der genannten Reihenfolge der Spieler und lässt die übrigen weg', () => {
    const zustand = tisch()
    expect(schlangenVon(zustand, [2, 0]).map(({ schlange }) => schlange.id)).toEqual(['schlange-3', 'schlange-1', 'schlange-2'])
    expect(schlangenVon(zustand, [1]), 'schlangenVon: Spieler 2 hat keine Schlange').toEqual([])
  })

  it('D9: findeSchlange findet auch die Schlange eines Mitspielers, als dasselbe Objekt; eine unbekannte Id ergibt null', () => {
    const zustand = tisch()
    const gefunden = findeSchlange(zustand, 'schlange-3')
    expect(gefunden?.besitzer, 'findeSchlange: Besitzer von schlange-3').toBe(2)
    expect(gefunden?.schlange, 'findeSchlange: dasselbe Objekt wie im Zustand').toBe(zustand.spieler[2].schlangen[0])
    expect(findeSchlange(zustand, 'schlange-9')).toBeNull()
  })

  it('D9: gepruefteSchlange wirft bei einer unbekannten Id mit Grund', () => {
    expect(() => gepruefteSchlange(tisch(), 'schlange-9')).toThrow('Die Schlange schlange-9 gibt es nicht.')
  })
})

describe('A5/D17/D19: beginneSchlange legt eine neue Schlange an (R1)', () => {
  it('A5: die neue Schlange bekommt die nächste Nummer, liegt hinten beim Besitzer und enthält die Karten', () => {
    const zustand = tisch()
    const karte = zustand.nachziehstapel[0]
    const neu = beginneSchlange(zustand, 1, [karte])
    expect(neu.id, 'beginneSchlange: Id nach drei Schlangen').toBe('schlange-4')
    expect(zustand.schlangenZaehler, 'beginneSchlange: Zähler').toBe(4)
    expect(zustand.spieler[1].schlangen, 'beginneSchlange: Schlange bei Spieler 2').toEqual([{ id: 'schlange-4', karten: [karte], fusionen: [] }])
    expect(zustand.spieler[1].schlangen[0], 'beginneSchlange: gibt das Objekt im Zustand zurück').toBe(neu)
  })

  it('A5: ohne Karten beginnt sie leer; jeder Aufruf vergibt eine eigene Id', () => {
    const zustand = tisch()
    const erste = beginneSchlange(zustand, 0)
    const zweite = beginneSchlange(zustand, 0)
    expect([erste.id, zweite.id]).toEqual(['schlange-4', 'schlange-5'])
    expect(erste.karten, 'beginneSchlange: ohne Karten leer').toEqual([])
    expect(erste.karten, 'beginneSchlange: jede Schlange hat ihre eigene Liste').not.toBe(zweite.karten)
  })
})

describe('A7.4/A7.7: nimmAusSchlange nimmt eine Karte aus ihrer Schlange (R1)', () => {
  it('A7.4: eine Farbkarte geht weg, die Nachbarn schliessen auf', () => {
    const zustand = tisch()
    const blau = gepruefteSchlange(zustand, 'schlange-3').schlange.karten[2]
    expect(nimmAusSchlange(zustand, gepruefteSchlange(zustand, 'schlange-3'), blau.id)).toBe(blau)
    expect(karten(zustand, 'schlange-3')).toEqual(['Rot', 'Farbenfusion'])
  })

  it('A7.4/A7.7: eine Farbenfusion geht weg, ihre zwei Karten liegen wieder einzeln an ihrer Stelle', () => {
    const zustand = tisch()
    const gefunden = gepruefteSchlange(zustand, 'schlange-3')
    const fusion = gefunden.schlange.karten[1]
    expect(nimmAusSchlange(zustand, gefunden, fusion.id)).toBe(fusion)
    expect(karten(zustand, 'schlange-3')).toEqual(['Rot', 'Grün', 'Grün', 'Blau'])
    expect(gefunden.schlange.fusionen, 'nimmAusSchlange: Eintrag der Fusion entfernt').toEqual([])
  })

  it('A7.4: ist es die letzte Karte, gibt es die Schlange nicht mehr; die andere Schlange des Besitzers bleibt', () => {
    const zustand = tisch()
    const gelb = gepruefteSchlange(zustand, 'schlange-2').schlange.karten[0]
    nimmAusSchlange(zustand, gepruefteSchlange(zustand, 'schlange-2'), gelb.id)
    expect(ids(zustand, 0)).toEqual(['schlange-1'])
  })

  it('A7.4: eine Karte, die nicht offen in der Schlange liegt, ist ein Fehler der Engine; nichts ändert sich', () => {
    const zustand = tisch()
    const vorher = structuredClone(zustand)
    expect(() => nimmAusSchlange(zustand, gepruefteSchlange(zustand, 'schlange-1'), 'gelb-99')).toThrow('Die Karte gelb-99 liegt nicht in der Schlange schlange-1.')
    expect(zustand).toEqual(vorher)
  })
})

describe('A6/D10: betroffenerBesitzer, wen eine Karte in einer Schlange trifft (R1)', () => {
  it('A6: in der eigenen Schlange niemanden, in der eines Mitspielers ihn', () => {
    const zustand = tisch()
    expect(betroffenerBesitzer(zustand, { spielerId: 'spieler-1', schlangenId: 'schlange-1' })).toEqual([])
    expect(betroffenerBesitzer(zustand, { spielerId: 'spieler-1', schlangenId: 'schlange-3' })).toEqual([2])
    expect(betroffenerBesitzer(zustand, { spielerId: 'spieler-3', schlangenId: 'schlange-2' })).toEqual([0])
  })

  it('A6: eine unbekannte Schlange ist ein Fehler der Engine', () => {
    expect(() => betroffenerBesitzer(tisch(), { spielerId: 'spieler-1', schlangenId: 'schlange-9' })).toThrow('Die Schlange schlange-9 gibt es nicht.')
  })
})

describe('A7.7: grundVerdeckt, warum eine Karte nicht offen in der Schlange liegt (R1)', () => {
  it('A7.7: unter einer Farbenfusion nennt die Kartendatei den Grund, mit der Id der Fusion', () => {
    const zustand = tisch()
    const { schlange } = gepruefteSchlange(zustand, 'schlange-3')
    const gruen = schlange.fusionen[0].unter[1]
    expect(grundVerdeckt(schlange, gruen.id, (fusionId) => `unter ${fusionId}`)).toBe(`unter ${schlange.karten[1].id}`)
  })

  it('A7.7: liegt sie gar nicht in der Schlange, steht das da, ohne die Kartendatei zu fragen', () => {
    const { schlange } = gepruefteSchlange(tisch(), 'schlange-1')
    expect(grundVerdeckt(schlange, 'gelb-99', () => 'falsch')).toBe('Die Karte gelb-99 liegt nicht in der Schlange schlange-1.')
  })
})
