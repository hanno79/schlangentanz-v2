import { describe, expect, it } from 'vitest'
import { pruefeAktion } from '../../index'
import type { ZweiAbwerfenDreiZiehenAktion, Spielzustand } from '../../index'
import type { Kartenwahl } from '../../testing/szenario'
import { meldeZugerweiterung } from '../../zuggrenzen'
import { comebackAktion, einsetzen, mitBedingung, schlangeAus } from '../comeback_hilfen'
import { ablage, aktionen, ereignisseVom, fuehreAus, grund, hand, zugBeenden } from '../zugablauf_hilfen'
import { abwerfenUndZiehen, angeboteneBoni, handIds, KORB, korbId, korbtisch, mitWirkung, spiele, spieleKarte, spieleKorb } from '../korb_hilfen'

/*
X6, Kriterium 3, Bonus 4 des Schlangenkorbs (A7.10): „Führe zwei zusätzliche
Aktionen in diesem Zug aus.“ Nach D46 sind es dieselben drei wie bei der
Comeback-Karte (A8.1): eine Farbkarte, eine Sonderkarte, oder zwei Karten
abwerfen und drei neue vom Nachziehstapel ziehen; auch zweimal dieselbe. Eine
zweite Farbenfusion gibt es nicht (A7.7, D46, D56), ein Verdoppler wirkt nicht
(A7.8, D46). „Zwei abwerfen, drei ziehen“ folgt D49: mit weniger als zwei
Handkarten und in der Schlussrunde nicht wählbar, bei weniger als drei im
Stapel zieht man, was da ist (D57). Kriterium 4: Verdoppler, Comeback und die
zugerweiternden Boni schliessen sich aus (D47).
*/

/** Spieler 1 hat den Korb mit „zwei zusätzliche Aktionen“ gespielt; vorher hielt er `hand` mit dem Korb. */
function nachKorb(hand: Kartenwahl[], schlange: Kartenwahl[] = ['Grün', 'Grün', 'Braun', 'Braun']): Spielzustand {
  return spieleKorb(korbtisch([KORB, ...hand]).schlange(0, schlange).schlange(1, ['Gelb']).zustand(), 'aktionen').zustand
}

describe('A7.10/D46: zwei zusätzliche Aktionen', () => {
  it('D46: der Bonus gibt zwei Zusatzaktionen für eine Farbkarte, eine Sonderkarte oder „Zwei Karten abwerfen, drei ziehen“', () => {
    const zustand = nachKorb(['Blau'])
    expect(zustand.zug.zusatzaktionen).toEqual([
      { quelle: 'Schlangenkorb', erlaubt: ['Farbkarte', 'Sonderkarte', 'Zwei Karten abwerfen, drei ziehen'], nurKarten: null },
      { quelle: 'Schlangenkorb', erlaubt: ['Farbkarte', 'Sonderkarte', 'Zwei Karten abwerfen, drei ziehen'], nurKarten: null },
    ])
    expect(zustand.zug.runde).toEqual(['Schlangenkorb'])
  })

  it('D46/A8.1: auch zweimal dieselbe Art: drei Farbkarten in einem Zug, eine vierte nicht', () => {
    let zustand = nachKorb(['Blau', 'Rot', 'Gelb', 'Violett'])
    for (const farbe of ['Blau', 'Rot', 'Gelb']) zustand = spieleKarte(zustand, handIds(zustand, 0, farbe)[0]).zustand
    expect(zustand.zug).toMatchObject({ gespielteFarbkarten: 3, gespielteSonderkarten: 1 })
    expect(mitWirkung(zustand, handIds(zustand, 0, 'Violett')[0])).toBe(false)
  })

  it('D46: zwei weitere Sonderkarten neben dem Korb', () => {
    let zustand = nachKorb(['Schlangenblockade', 'Regenbogenschlange', 'Schlangenblockade'])
    zustand = spieleKarte(zustand, handIds(zustand, 0, 'Schlangenblockade')[0]).zustand
    zustand = spieleKarte(zustand, handIds(zustand, 0, 'Regenbogenschlange')[0]).zustand
    expect(zustand.zug.gespielteSonderkarten).toBe(3)
    expect(mitWirkung(zustand, handIds(zustand, 0, 'Schlangenblockade')[0]), 'D46: eine dritte nicht').toBe(false)
  })

  it('A7.7/D46/D56: eine zweite Farbenfusion gibt es auch so nicht; sie lässt sich nur wirkungslos ablegen', () => {
    let zustand = nachKorb(['Farbenfusion', 'Farbenfusion'])
    zustand = spieleKarte(zustand, handIds(zustand, 0, 'Farbenfusion')[0]).zustand
    const [zweite] = handIds(zustand, 0, 'Farbenfusion')
    expect(mitWirkung(zustand, zweite)).toBe(false)
    expect(aktionen(zustand, 'SonderkarteWirkungslosAblegen').map((aktion) => 'karteId' in aktion && aktion.karteId)).toEqual([zweite])
  })

  it('A7.8/D46/D47: ein Verdoppler als Zusatzaktion wirkt nicht', () => {
    const zustand = nachKorb(['Verdoppler'])
    const [verdoppler] = handIds(zustand, 0, 'Verdoppler')
    expect(mitWirkung(zustand, verdoppler)).toBe(false)
    expect(grund(zustand, { typ: 'VerdopplerSpielen', spielerId: 'spieler-1', karteId: verdoppler })).toMatch(/Schlangenkorbs.*D47/)
  })

  it('D46: die Zusatzaktionen gelten nur in diesem Zug; der nächste Spieler beginnt ohne', () => {
    const zustand = nachKorb(['Blau'])
    const weiter = fuehreAus(zustand, zugBeenden(zustand)).zustand
    expect(weiter.zug).toMatchObject({ spielerIndex: 1, zusatzaktionen: [], runde: [] })
  })
})

describe('A8.1/D46/D49: Zwei Karten abwerfen, drei ziehen', () => {
  it('A8.1: zwei Handkarten kommen auf den eigenen Ablagestapel, drei Karten vom Stapel auf die Hand; das belegt eine Zusatzaktion', () => {
    const start = nachKorb(['Blau', 'Rot', 'Gelb'])
    const angebot = abwerfenUndZiehen(start)
    expect(angebot.map((aktion) => aktion.karteIds), 'jedes Paar von Handkarten einmal').toHaveLength(3)
    const aktion = angebot[0]
    const oben = start.nachziehstapel.slice(0, 3).map((karte) => karte.id)
    const { zustand, ereignisse } = spiele(start, aktion)
    expect(ablage(zustand, 0)).toEqual(aktion.karteIds)
    expect(hand(zustand, 0).sort()).toEqual([...hand(start, 0).filter((id) => !aktion.karteIds.includes(id)), ...oben].sort())
    expect(ereignisse.map((ereignis) => ereignis.typ)).toEqual(['KartenAbgeworfen', 'KartenGezogen'])
    expect(zustand.zug.verwendet.map((eintrag) => eintrag.art)).toEqual(['Sonderkarte', 'Zwei Karten abwerfen, drei ziehen'])
    expect(zustand.zug.gespielteFarbkarten + zustand.zug.gespielteSonderkarten, 'A8.1: zählt nicht als Karte des Zuges').toBe(1)
  })

  it('A8.1/D49: zweimal in einem Zug ist erlaubt; danach ist keine Zusatzaktion mehr frei, die Farbkarte des Zuges bleibt', () => {
    let zustand = nachKorb(['Blau', 'Rot', 'Gelb'])
    zustand = spiele(zustand, abwerfenUndZiehen(zustand)[0]).zustand
    zustand = spiele(zustand, abwerfenUndZiehen(zustand)[0]).zustand
    expect(abwerfenUndZiehen(zustand)).toEqual([])
    expect(zustand.spieler[0].hand).toHaveLength(5)
    expect(mitWirkung(zustand, handIds(zustand, 0, 'Blau')[0]), 'A5: die Farbkarte des Zuges ist noch frei').toBe(true)
  })

  it('D49: mit weniger als zwei Handkarten ist sie nicht wählbar', () => {
    const zustand = nachKorb(['Blau'])
    expect(abwerfenUndZiehen(zustand)).toEqual([])
    const aktion = { typ: 'ZweiAbwerfenDreiZiehen', spielerId: 'spieler-1', karteIds: [zustand.spieler[0].hand[0].id, 'rot-15'] } as ZweiAbwerfenDreiZiehenAktion
    expect(pruefeAktion(zustand, aktion).erlaubt).toBe(false)
  })

  it('D49/D57/A10: liegen weniger als drei im Stapel, zieht man, was da ist; die Schlussrunde beginnt, er spielt die Karten noch', () => {
    const start = spieleKorb(korbtisch([KORB, 'Blau', 'Rot']).stapelOben(['Gelb', 'Grün']).stapelBehalten(2).zustand(), 'aktionen').zustand
    const [gelb, gruen] = start.nachziehstapel.map((karte) => karte.id)
    const { zustand, ereignisse } = spiele(start, abwerfenUndZiehen(start)[0])
    expect(ereignisse.map((ereignis) => ereignis.typ)).toEqual(['KartenAbgeworfen', 'KartenGezogen', 'SchlussrundeBegonnen'])
    expect(ereignisseVom(ereignisse, 'KartenGezogen')[0].anzahl).toBe(2)
    expect(zustand).toMatchObject({ partiephase: 'Schlussrunde', schlussrundeAusloeser: 0 })
    expect(mitWirkung(zustand, gelb), 'D57').toBe(true)
    expect(mitWirkung(zustand, gruen), 'D57').toBe(true)
  })

  it('D49: in der Schlussrunde ist sie nicht wählbar, weil nichts gezogen werden kann', () => {
    const zustand = spieleKorb(korbtisch([KORB, 'Blau', 'Rot', 'Gelb']).schlussrunde(1).zustand(), 'aktionen').zustand
    expect(abwerfenUndZiehen(zustand)).toEqual([])
    const [erste, zweite] = hand(zustand, 0)
    expect(pruefeAktion(zustand, { typ: 'ZweiAbwerfenDreiZiehen', spielerId: 'spieler-1', karteIds: [erste, zweite] })).toEqual({ erlaubt: false, grund: expect.stringMatching(/Schlussrunde.*D49/) })
  })

  it('A8.1: ohne freie Zusatzaktion gibt es sie nicht, etwa nach dem Bonus „Tausche“', () => {
    const start = korbtisch([KORB, 'Blau', 'Rot', 'Gelb']).schlange(0, ['Grün']).zustand()
    const zustand = spieleKorb(start, 'tauschen').zustand
    expect(abwerfenUndZiehen(zustand)).toEqual([])
    const [erste, zweite] = hand(zustand, 0)
    expect(pruefeAktion(zustand, { typ: 'ZweiAbwerfenDreiZiehen', spielerId: 'spieler-1', karteIds: [erste, zweite] })).toEqual({ erlaubt: false, grund: expect.stringMatching(/D46/) })
  })

  it('A8.1: die abgeworfenen Karten müssen zwei verschiedene eigene Handkarten sein', () => {
    const zustand = nachKorb(['Blau', 'Rot'])
    const [blau] = handIds(zustand, 0, 'Blau')
    expect(pruefeAktion(zustand, { typ: 'ZweiAbwerfenDreiZiehen', spielerId: 'spieler-1', karteIds: [blau, blau] }).erlaubt).toBe(false)
    expect(pruefeAktion(zustand, { typ: 'ZweiAbwerfenDreiZiehen', spielerId: 'spieler-1', karteIds: [blau, zustand.spieler[1].hand[0].id] }).erlaubt).toBe(false)
  })
})

describe('D47: Verdoppler, Comeback und die zugerweiternden Boni schliessen sich aus (X6, Kriterium 4)', () => {
  it('D47: neben einer Comeback-Karte gibt es weder „Ziehe 3“ noch „zwei zusätzliche Aktionen“; Tausch und Entfernen schon', () => {
    const start = korbtisch([KORB, 'Blau'])
      .schlange(0, ['Rot', 'Schlangenblockade'])
      .aendere((zustand) => meldeZugerweiterung(zustand.zug, 'Comeback', [{ quelle: 'Comeback', erlaubt: ['Farbkarte', 'Sonderkarte'], nurKarten: null }]))
      .zustand()
    expect(angeboteneBoni(start)).toEqual(['tauschen', 'entfernen'])
    expect(grund(start, { typ: 'SchlangenkorbSpielen', spielerId: 'spieler-1', karteId: korbId(start), bonus: { art: 'aktionen' } })).toMatch(/Comeback-Karte.*D47/)
  })

  it('A7.8/D47: im zweiten Zug nach einem Verdoppler ebenso', () => {
    const start = korbtisch([KORB, 'Blau']).schlange(0, ['Rot', 'Schlangenblockade']).amZug(0, 2).zustand()
    expect(angeboteneBoni(start)).toEqual(['tauschen', 'entfernen'])
    expect(grund(start, { typ: 'SchlangenkorbSpielen', spielerId: 'spieler-1', karteId: korbId(start), bonus: { art: 'aktionen' } })).toMatch(/Verdoppler.*D47/)
  })

  it('D47: nach einem zugerweiternden Bonus wirkt in dieser Runde kein Verdoppler, und eine Comeback-Karte liesse sich nicht mehr anmelden', () => {
    const zustand = nachKorb(['Verdoppler', 'Blau'])
    expect(mitWirkung(zustand, handIds(zustand, 0, 'Verdoppler')[0])).toBe(false)
    expect(() => meldeZugerweiterung(structuredClone(zustand).zug, 'Comeback', [])).toThrow(/Schlangenkorbs.*D47/)
  })

  it('D47: nach Tausch oder Entfernen bleibt der Zug ohne Zugerweiterung; ein Verdoppler auf der Hand hätte keinen Platz mehr (D42)', () => {
    const start = korbtisch([KORB, 'Blau', 'Verdoppler']).schlange(0, ['Rot']).zustand()
    const zustand = spieleKorb(start, 'tauschen').zustand
    expect(zustand.zug.runde).toEqual([])
    expect(mitWirkung(zustand, handIds(zustand, 0, 'Verdoppler')[0])).toBe(false)
  })
})

describe('D47: mit der echten Comeback-Karte (X4)', () => {
  /** Spieler 1 hält Korb und Blau, seine Schlange hat 1 Karte mit einer Blockade, die des Gegners 7: Die Comeback-Bedingung gilt (D48). */
  function rueckstand(): Spielzustand {
    return mitBedingung(korbtisch([KORB, 'Blau']).schlange(0, ['Rot', 'Schlangenblockade']).schlange(1, schlangeAus(8)))
  }

  it('D47: nach dem Einsatz der Comeback-Karte gibt es nur noch Tausch und Entfernen; die Zusatzaktionen der Comeback-Karte bleiben', () => {
    const start = rueckstand()
    expect(comebackAktion(start), 'Testaufbau: die Comeback-Karte ist einsetzbar').toBeDefined()
    const zustand = einsetzen(start).zustand
    expect(angeboteneBoni(zustand)).toEqual(['tauschen', 'entfernen'])
    expect(grund(zustand, { typ: 'SchlangenkorbSpielen', spielerId: 'spieler-1', karteId: korbId(zustand), bonus: { art: 'ziehen' } })).toMatch(/Comeback-Karte.*D47/)
    expect(zustand.zug.zusatzaktionen.map((zusatz) => zusatz.quelle)).toEqual(['Comeback', 'Comeback'])
  })

  it('D47: nach „Ziehe 3“ oder „zwei zusätzliche Aktionen“ ist die Comeback-Karte in diesem Zug nicht mehr einsetzbar', () => {
    for (const art of ['ziehen', 'aktionen'] as const) {
      const zustand = spieleKorb(rueckstand(), art).zustand
      expect(comebackAktion(zustand), art).toBeUndefined()
      expect(grund(zustand, { typ: 'ComebackEinsetzen', spielerId: 'spieler-1', comebackId: zustand.spieler[0].comeback!.karte.id }), art).toMatch(/Schlangenkorbs.*D47/)
    }
  })

  it('D47/A8.1: nach Tausch oder Entfernen bleibt die Comeback-Karte einsetzbar; beides erweitert den Zug nicht', () => {
    for (const art of ['tauschen', 'entfernen'] as const) expect(comebackAktion(spieleKorb(rueckstand(), art).zustand), art).toBeDefined()
  })
})
