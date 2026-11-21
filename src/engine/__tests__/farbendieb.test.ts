import { describe, expect, it } from 'vitest'
import { ermittleFarbgruppen } from '../index'
import type { Spielzustand } from '../index'
import type { Kartenwahl } from '../testing/szenario'
import { diebId, diebstaehle, karteIn, schlangenVon, stiehl } from './farbendieb_hilfen'
import {
  ablage,
  aktionen,
  durchlassen,
  folge,
  FUENF,
  fuehreAus,
  grund,
  tischMitHaenden as tisch,
  typen,
  verletzteInvarianten,
  zugBeenden,
} from './zugablauf_hilfen'

/*
E8, der Farbendieb (A7.1, D2, D17): Er stiehlt eine Farbkarte aus einer
gegnerischen Schlange, nie eine Sonderkarte und nie eine Karte unter einer
Farbenfusion, und legt sie an eine beliebige Stelle einer eigenen Schlange; ohne
eigene Schlange beginnt sie eine neue. Danach liegt er auf dem Ablagestapel des
Diebs. Die Abwehr prüft `farbendieb_abwehr.test.ts`.
*/

const DIEB: Kartenwahl[] = ['Farbendieb', 'Blau', 'Rot', 'Gelb', 'Grün']

/** Spieler A (0) stiehlt, Spieler B (1) lässt durch: die ganze Wirkung ohne Abwehr. */
function stiehlUndDurch(zustand: Spielzustand, karteId: string, ziel: Parameters<typeof stiehl>[2]) {
  return folge(zustand, (jetzt) => stiehl(jetzt, karteId, ziel), durchlassen)
}

describe('A7.1: das Beispiel der Website', () => {
  it('A7.1 Beispiel: Spieler A stiehlt eine blaue Karte aus der Schlange von Spieler B und fügt sie an seine eigene Schlange an; der Farbendieb kommt auf seinen Ablagestapel', () => {
    const start = tisch([DIEB, FUENF]).schlange(0, ['Rot', 'Rot']).schlange(1, ['Gelb', 'Blau', 'Gelb']).zustand()
    const dieb = diebId(start, 0)
    const blau = karteIn(start, 1, 0, 1)
    const { zustand, ereignisse } = stiehlUndDurch(start, blau, { art: 'schlange', schlangenId: start.spieler[0].schlangen[0].id, position: 2 })
    expect(schlangenVon(zustand, 0)).toEqual([['Rot', 'Rot', 'Blau']])
    expect(karteIn(zustand, 0, 0, 2)).toBe(blau)
    expect(schlangenVon(zustand, 1), 'A7.1: die Karte ist aus der Schlange von B weggenommen').toEqual([['Gelb', 'Gelb']])
    expect(ablage(zustand, 0), 'A7.1: der Farbendieb kommt auf deinen Ablagestapel').toEqual([dieb])
    expect(ablage(zustand, 1)).toEqual([])
    expect(zustand.spieler[0].hand.map((karte) => karte.id)).not.toContain(dieb)
    expect(ereignisse.at(-1)).toEqual({ typ: 'AnsageEntschieden', spielerIndex: 0, karteId: dieb, abgewehrt: [], ohneWirkung: false, nach: { ort: 'Ablagestapel', spielerIndex: 0, position: 0 } })
    expect(verletzteInvarianten(zustand)).toEqual([])
  })

  it('A7.1: nützlich für eine Dreiergruppe: die gestohlene Karte vervollständigt beim Dieb eine Gruppe und fehlt dem Gegner in seiner', () => {
    const start = tisch([DIEB, FUENF]).schlange(0, ['Grün', 'Grün']).schlange(1, ['Grün', 'Grün', 'Grün']).zustand()
    const { zustand } = stiehlUndDurch(start, karteIn(start, 1, 0, 0), { art: 'schlange', schlangenId: start.spieler[0].schlangen[0].id, position: 0 })
    expect(ermittleFarbgruppen(zustand.spieler[0].schlangen[0]).map((gruppe) => [gruppe.farbe, gruppe.laenge])).toEqual([['Grün', 3]])
    expect(ermittleFarbgruppen(zustand.spieler[1].schlangen[0])).toEqual([])
  })
})

describe('A7.1, D2: was der Farbendieb stehlen darf (E8 Kriterium 1)', () => {
  /** Drei Spieler: A mit Farbendieb und einer Schlange, B und C mit Farb- und Sonderkarten in ihren Schlangen. */
  function dreiSpieler(): Spielzustand {
    return tisch([DIEB, FUENF, FUENF])
      .schlange(0, ['Grün', 'Violett'])
      .schlange(1, ['Blau', 'Regenbogenschlange', { fusion: ['Gelb', 'Gelb'] }, 'Schlangenblockade', 'Rot'])
      .schlange(2, ['Violett'])
      .schlange(2, ['Braun', 'Braun'])
      .zustand()
  }

  it('A7.1/D2: angeboten sind genau die Farbkarten in den Schlangen der Mitspieler, im Uhrzeigersinn; nie eine eigene Karte, nie eine Sonderkarte, nie eine Karte unter einer Fusion', () => {
    const zustand = dreiSpieler()
    const quellen = [...new Set(diebstaehle(zustand).map((aktion) => `${aktion.quelle.schlangenId}/${aktion.quelle.karteId}`))]
    const [b, c1, c2] = [zustand.spieler[1].schlangen[0], zustand.spieler[2].schlangen[0], zustand.spieler[2].schlangen[1]]
    expect(quellen).toEqual([
      `${b.id}/${b.karten[0].id}`,
      `${b.id}/${b.karten[4].id}`,
      `${c1.id}/${c1.karten[0].id}`,
      `${c2.id}/${c2.karten[0].id}`,
      `${c2.id}/${c2.karten[1].id}`,
    ])
    expect(typen(zustand), 'D25: mit möglichem Ziel lässt er sich nicht wirkungslos ablegen').not.toContain('SonderkarteWirkungslosAblegen')
  })

  it.each([
    ['Regenbogenschlange', 1],
    ['Farbenfusion', 2],
    ['Schlangenblockade', 3],
  ])('D2: die Sonderkarte %s aus einer gegnerischen Schlange wird abgelehnt, mit Grund', (_name, stelle) => {
    const zustand = dreiSpieler()
    const schlange = zustand.spieler[1].schlangen[0]
    const aktion = { ...diebstaehle(zustand)[0], quelle: { schlangenId: schlange.id, karteId: schlange.karten[stelle].id } }
    expect(grund(zustand, aktion)).toMatch(/nur Farbkarten \(D2\)/)
  })

  it('A7.7/E8 Kriterium 1: eine Farbkarte unter einer Farbenfusion wird abgelehnt, mit Grund', () => {
    const zustand = dreiSpieler()
    const schlange = zustand.spieler[1].schlangen[0]
    const unter = schlange.fusionen[0].unter[0].id
    const aktion = { ...diebstaehle(zustand)[0], quelle: { schlangenId: schlange.id, karteId: unter } }
    expect(grund(zustand, aktion)).toMatch(/unter einer Farbenfusion.*\(A7\.1, A7\.7\)/)
  })

  it('A7.1: aus der eigenen Schlange stiehlt der Farbendieb nicht; abgelehnt, mit Grund', () => {
    const zustand = dreiSpieler()
    const eigene = zustand.spieler[0].schlangen[0]
    const aktion = { ...diebstaehle(zustand)[0], quelle: { schlangenId: eigene.id, karteId: eigene.karten[0].id } }
    expect(grund(zustand, aktion)).toMatch(/gegnerischen Schlange.*\(A7\.1\)/)
  })

  it('A7.1: eine unbekannte Schlange oder eine Karte, die nicht in der genannten Schlange liegt, wird abgelehnt, mit Grund', () => {
    const zustand = dreiSpieler()
    const vorlage = diebstaehle(zustand)[0]
    expect(grund(zustand, { ...vorlage, quelle: { schlangenId: 'schlange-99', karteId: vorlage.quelle.karteId } })).toMatch(/schlange-99 gibt es nicht/)
    const fremd = zustand.spieler[2].schlangen[0].karten[0].id
    expect(grund(zustand, { ...vorlage, quelle: { schlangenId: vorlage.quelle.schlangenId, karteId: fremd } })).toMatch(new RegExp(`${fremd} liegt nicht in`))
  })
})

describe('A7.1, D17: wohin die gestohlene Karte kommt (E8 Kriterium 2)', () => {
  function mitZweiSchlangen(): Spielzustand {
    return tisch([DIEB, FUENF]).schlange(0, ['Rot', 'Rot']).schlange(0, ['Gelb']).schlange(1, ['Blau', 'Braun']).zustand()
  }

  it('A7.1/D17: angeboten ist jede Stelle jeder eigenen Schlange, vom Anfang bis hinter die letzte Karte, für jede Farbkarte des Gegners; keine neue Schlange, keine fremde', () => {
    const zustand = mitZweiSchlangen()
    const [rot, gelb] = zustand.spieler[0].schlangen.map((schlange) => schlange.id)
    const ziele = (karteId: string) => diebstaehle(zustand).filter((aktion) => aktion.quelle.karteId === karteId).map((aktion) => aktion.ziel)
    const erwartet = [
      ...[0, 1, 2].map((position) => ({ art: 'schlange', schlangenId: rot, position })),
      ...[0, 1].map((position) => ({ art: 'schlange', schlangenId: gelb, position })),
    ]
    expect(ziele(karteIn(zustand, 1, 0, 0))).toEqual(erwartet)
    expect(ziele(karteIn(zustand, 1, 0, 1))).toEqual(erwartet)
    expect(diebstaehle(zustand)).toHaveLength(10)
  })

  it.each([
    [0, ['Blau', 'Rot', 'Rot']],
    [1, ['Rot', 'Blau', 'Rot']],
    [2, ['Rot', 'Rot', 'Blau']],
  ])('A7.1: an eine beliebige Position: an Stelle %i liegt die Karte danach genau dort', (position, erwartet) => {
    const start = mitZweiSchlangen()
    const blau = karteIn(start, 1, 0, 0)
    const { zustand } = stiehlUndDurch(start, blau, { art: 'schlange', schlangenId: start.spieler[0].schlangen[0].id, position })
    expect(schlangenVon(zustand, 0)).toEqual([erwartet, ['Gelb']])
    expect(karteIn(zustand, 0, 0, position)).toBe(blau)
    expect(zustand.spieler[0].schlangen, 'A5: kein Spieler hat mehr als 2 Schlangen').toHaveLength(2)
  })

  it('A7.1: auch in die zweite eigene Schlange', () => {
    const start = mitZweiSchlangen()
    const { zustand } = stiehlUndDurch(start, karteIn(start, 1, 0, 1), { art: 'schlange', schlangenId: start.spieler[0].schlangen[1].id, position: 1 })
    expect(schlangenVon(zustand, 0)).toEqual([['Rot', 'Rot'], ['Gelb', 'Braun']])
    expect(schlangenVon(zustand, 1)).toEqual([['Blau']])
  })

  it('D17: in eine Schlange eines Mitspielers kommt die gestohlene Karte nicht, auch nicht zurück in die, aus der sie kommt; abgelehnt, mit Grund', () => {
    const zustand = tisch([DIEB, FUENF, FUENF]).schlange(0, ['Rot']).schlange(1, ['Blau', 'Gelb']).schlange(2, ['Grün']).zustand()
    const vorlage = diebstaehle(zustand)[0]
    for (const schlangenId of [zustand.spieler[1].schlangen[0].id, zustand.spieler[2].schlangen[0].id]) {
      expect(grund(zustand, { ...vorlage, ziel: { art: 'schlange', schlangenId, position: 0 } })).toMatch(/eigene Schlange.*\(D17\)/)
    }
    expect(grund(zustand, { ...vorlage, ziel: { art: 'schlange', schlangenId: 'schlange-99', position: 0 } })).toMatch(/schlange-99 gibt es nicht/)
  })

  it.each([
    [3, /Stelle 3 gibt es in schlange-1 nicht.*0 bis 2 \(A7\.1\)/],
    [-1, /Feld ziel ist ungültig/],
  ])('A7.1: die Stelle %i gibt es in einer eigenen Schlange mit zwei Karten nicht; abgelehnt, mit Grund', (position, meldung) => {
    const zustand = mitZweiSchlangen()
    const vorlage = diebstaehle(zustand)[0]
    expect(grund(zustand, { ...vorlage, ziel: { art: 'schlange', schlangenId: zustand.spieler[0].schlangen[0].id, position } })).toMatch(meldung)
  })

  it('D17/F4: ohne eigene Schlange beginnt die gestohlene Karte eine neue eigene Schlange; nur dieses Ziel ist angeboten', () => {
    const start = tisch([DIEB, FUENF]).schlange(1, ['Blau', 'Rot']).zustand()
    expect(diebstaehle(start).map((aktion) => aktion.ziel)).toEqual([{ art: 'neueSchlange' }, { art: 'neueSchlange' }])
    const rot = karteIn(start, 1, 0, 1)
    const { zustand } = stiehlUndDurch(start, rot, { art: 'neueSchlange' })
    expect(schlangenVon(zustand, 0)).toEqual([['Rot']])
    expect(zustand.spieler[0].schlangen[0]).toEqual({ id: `schlange-${start.schlangenZaehler + 1}`, karten: [start.spieler[1].schlangen[0].karten[1]], fusionen: [] })
    expect(zustand.schlangenZaehler).toBe(start.schlangenZaehler + 1)
    expect(schlangenVon(zustand, 1)).toEqual([['Blau']])
    expect(verletzteInvarianten(zustand)).toEqual([])
  })

  it('D17: hat der Dieb eine Schlange, beginnt die gestohlene Karte keine neue; abgelehnt, mit Grund', () => {
    const zustand = tisch([DIEB, FUENF]).schlange(0, ['Rot']).schlange(1, ['Blau']).zustand()
    const vorlage = diebstaehle(zustand)[0]
    expect(grund(zustand, { ...vorlage, ziel: { art: 'neueSchlange' } })).toMatch(/keine Schlange.*\(D17\)/)
  })
})

describe('A7.1, D13, A5: Grenzfälle des Farbendiebs (E8)', () => {
  it('D13/E8 Grenzfall: ohne gegnerische Farbkarte am Tisch hat er kein Ziel und lässt sich nur wirkungslos ablegen', () => {
    const start = tisch([DIEB, FUENF]).schlange(0, ['Rot', 'Rot']).schlange(1, ['Regenbogenschlange', { fusion: ['Blau', 'Blau'] }]).zustand()
    expect(diebstaehle(start)).toEqual([])
    const dieb = diebId(start, 0)
    const ablegen = aktionen(start, 'SonderkarteWirkungslosAblegen')
    expect(ablegen).toEqual([{ typ: 'SonderkarteWirkungslosAblegen', spielerId: 'spieler-1', karteId: dieb }])
    const { zustand } = fuehreAus(start, ablegen[0])
    expect(ablage(zustand, 0)).toEqual([dieb])
    expect(schlangenVon(zustand, 1)).toEqual(schlangenVon(start, 1))
  })

  it('D13/E8 Grenzfall: haben nur der Dieb selbst Farbkarten und niemand sonst eine Schlange, hat er kein Ziel', () => {
    const zustand = tisch([DIEB, FUENF]).schlange(0, ['Rot', 'Blau']).zustand()
    expect(diebstaehle(zustand)).toEqual([])
    expect(typen(zustand)).toContain('SonderkarteWirkungslosAblegen')
  })

  it('E8 Grenzfall: gestohlen wird die letzte Karte einer Schlange; die Schlange verschwindet, und der Gegner darf wieder eine neue beginnen', () => {
    const start = tisch([DIEB, FUENF]).schlange(0, ['Rot']).schlange(1, ['Gelb', 'Gelb']).schlange(1, ['Blau']).zustand()
    const { zustand } = stiehlUndDurch(start, karteIn(start, 1, 1, 0), { art: 'schlange', schlangenId: start.spieler[0].schlangen[0].id, position: 1 })
    expect(schlangenVon(zustand, 1)).toEqual([['Gelb', 'Gelb']])
    expect(schlangenVon(zustand, 0)).toEqual([['Rot', 'Blau']])
    expect(verletzteInvarianten(zustand)).toEqual([])
    const amZugB = folge(zustand, zugBeenden).zustand
    expect(amZugB.zug.spielerIndex).toBe(1)
    expect(aktionen(amZugB, 'FarbkarteLegen'), 'A5: mit nur noch einer Schlange beginnt B wieder eine zweite').toContainEqual(expect.objectContaining({ ziel: { art: 'neueSchlange' } }))
  })

  it('E8 Grenzfall: die Lücke vereint beim Gegner zwei Gruppen; die Nachbarn schliessen auf', () => {
    const start = tisch([DIEB, FUENF]).schlange(0, ['Gelb']).schlange(1, ['Rot', 'Rot', 'Blau', 'Rot', 'Rot']).zustand()
    expect(ermittleFarbgruppen(start.spieler[1].schlangen[0])).toEqual([])
    const { zustand } = stiehlUndDurch(start, karteIn(start, 1, 0, 2), { art: 'schlange', schlangenId: start.spieler[0].schlangen[0].id, position: 0 })
    expect(schlangenVon(zustand, 1)).toEqual([['Rot', 'Rot', 'Rot', 'Rot']])
    expect(ermittleFarbgruppen(zustand.spieler[1].schlangen[0]).map((gruppe) => [gruppe.farbe, gruppe.laenge])).toEqual([['Rot', 4]])
  })

  it('A7.1/E8 Grenzfall: gestohlen werden darf auch die Farbkarte direkt neben einer Fusion; die Fusion bleibt mit ihren Karten liegen', () => {
    const start = tisch([DIEB, FUENF]).schlange(0, ['Rot']).schlange(1, ['Blau', { fusion: ['Gelb', 'Gelb'] }, 'Grün']).zustand()
    const fusion = structuredClone(start.spieler[1].schlangen[0].fusionen)
    const { zustand } = stiehlUndDurch(start, karteIn(start, 1, 0, 2), { art: 'schlange', schlangenId: start.spieler[0].schlangen[0].id, position: 1 })
    expect(schlangenVon(zustand, 1)).toEqual([['Blau', 'Farbenfusion']])
    expect(zustand.spieler[1].schlangen[0].fusionen).toEqual(fusion)
    expect(verletzteInvarianten(zustand)).toEqual([])
  })

  it('A5/D12: der Farbendieb ist die Sonderkarte des Zuges; danach geht noch eine Farbkarte, aber keine zweite Sonderkarte', () => {
    const start = tisch([['Farbendieb', 'Farbendieb', 'Blau'], FUENF]).schlange(0, ['Rot']).schlange(1, ['Gelb', 'Grün']).zustand()
    const nach = stiehlUndDurch(start, karteIn(start, 1, 0, 0), { art: 'schlange', schlangenId: start.spieler[0].schlangen[0].id, position: 0 }).zustand
    expect(nach.zug).toMatchObject({ gespielteSonderkarten: 1, gespielteFarbkarten: 0 })
    expect(typen(nach)).toEqual(['FarbkarteLegen', 'ZugBeenden'])
    const zweiter = { ...diebstaehle(start)[0], karteId: nach.spieler[0].hand[0].id }
    expect(grund(nach, zweiter)).toMatch(/schon eine Sonderkarte.*\(A5, D12\)/)
  })

  it('A7.1: der Dieb stiehlt in vier Spielern aus jeder gegnerischen Schlange, beginnend beim linken Nachbarn', () => {
    const zustand = tisch([FUENF, FUENF, DIEB, FUENF]).schlange(0, ['Blau']).schlange(1, ['Rot']).schlange(2, ['Gelb']).schlange(3, ['Grün']).amZug(2).zustand()
    const farben = diebstaehle(zustand).map((aktion) => schlangenVon(zustand, zustand.spieler.findIndex((spieler) => spieler.schlangen.some((s) => s.id === aktion.quelle.schlangenId)))[0][0])
    expect(farben).toEqual(['Grün', 'Grün', 'Blau', 'Blau', 'Rot', 'Rot'])
  })
})
