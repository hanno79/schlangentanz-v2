import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleEntscheider, serialisiere } from '../index'
import type { SpielAktion, Spielzustand } from '../index'
import { baukasten } from '../testing/szenario'
import type { Kartenwahl } from '../testing/szenario'
import { ablage, aktionen, ereignisseVom, fuehreAus, grund, hand, spieleZug, typen, zugBeenden } from './zugablauf_hilfen'

/*
E2, Nachziehen und Zugwechsel: A5 (Kartenhand prüfen, Zug beenden, Überhand,
Uhrzeigersinn), A6 (Grundregeln und Timing zum Auffüllen, Beispiel 1 Schritt 4,
Beispiel 2 Schritt 5) und die Ereignisse der Engine.

Wer „ausserhalb seines Zuges gespielt hat“, wird hier mit einer kürzeren Hand
nachgestellt; das Ausspielen ausserhalb des Zuges (Farbenschutz) bringt E4.
*/

const FUENF: Kartenwahl[] = ['Blau', 'Rot', 'Gelb', 'Blau', 'Rot']

function mitHaenden(haende: Kartenwahl[][]): Spielzustand {
  const bau = baukasten({ spielerzahl: haende.length, erweiterung: false })
  haende.forEach((karten, index) => bau.hand(index, karten))
  return bau.zustand()
}

describe('A5: Zug beenden und Uhrzeigersinn', () => {
  it('A5/A6: am Zugende füllt der Spieler auf 5 Handkarten auf; erst dann ist der Nächste dran', () => {
    const zustand = mitHaenden([FUENF, FUENF])
    const oben = zustand.nachziehstapel[0]
    const gespielt = fuehreAus(zustand, aktionen(zustand, 'FarbkarteLegen')[0]).zustand
    expect(gespielt.spieler[0].hand).toHaveLength(4)
    const { zustand: nach, ereignisse } = fuehreAus(gespielt, zugBeenden(gespielt))
    expect(nach.spieler[0].hand).toHaveLength(5)
    expect(hand(nach, 0)).toContain(oben.id)
    expect(nach.nachziehstapel).toHaveLength(zustand.nachziehstapel.length - 1)
    expect(nach.zug).toMatchObject({ spielerIndex: 1, teilzug: 1, gespielteFarbkarten: 0, gespielteSonderkarten: 0, abschnitt: 'Ausspielen' })
    expect(ereignisse).toEqual([
      { typ: 'KartenGezogen', spielerIndex: 0, anzahl: 1 },
      { typ: 'ZugBegonnen', spielerIndex: 1, teilzug: 1 },
    ])
  })

  it.each([3, 4])('A5: im Uhrzeigersinn: mit %i Spielern ist nach dem letzten wieder der erste dran', (spielerzahl) => {
    let zustand = mitHaenden(Array.from({ length: spielerzahl }, () => FUENF))
    const reihe: number[] = [zustand.zug.spielerIndex]
    for (let zug = 0; zug < spielerzahl; zug += 1) {
      zustand = spieleZug(zustand).zustand
      reihe.push(zustand.zug.spielerIndex)
    }
    expect(reihe).toEqual([...Array.from({ length: spielerzahl }, (_, index) => index), 0])
  })

  it('A5: wer am Zugende 5 oder mehr Karten hält, zieht nichts', () => {
    const zustand = mitHaenden([[...FUENF, 'Grün'], FUENF])
    const gespielt = fuehreAus(zustand, aktionen(zustand, 'FarbkarteLegen')[0]).zustand
    const { zustand: nach, ereignisse } = fuehreAus(gespielt, zugBeenden(gespielt))
    expect(nach.spieler[0].hand).toHaveLength(5)
    expect(nach.nachziehstapel).toHaveLength(zustand.nachziehstapel.length)
    expect(ereignisseVom(ereignisse, 'KartenGezogen')).toEqual([])
  })
})

describe('A5/A6: Auffüllen zu Beginn des nächsten Zuges', () => {
  it('A5: zu Zugbeginn füllt der Spieler auf 5 Handkarten auf (Kartenhand prüfen)', () => {
    const zustand = mitHaenden([FUENF, ['Blau', 'Rot', 'Gelb']])
    const gespielt = fuehreAus(zustand, aktionen(zustand, 'FarbkarteLegen')[0]).zustand
    const { zustand: nach, ereignisse } = fuehreAus(gespielt, zugBeenden(gespielt))
    expect(nach.spieler[1].hand).toHaveLength(5)
    expect(ereignisse).toEqual([
      { typ: 'KartenGezogen', spielerIndex: 0, anzahl: 1 },
      { typ: 'ZugBegonnen', spielerIndex: 1, teilzug: 1 },
      { typ: 'KartenGezogen', spielerIndex: 1, anzahl: 2 },
    ])
    expect(ermittleEntscheider(nach)).toBe(1)
  })

  it('A6 Beispiel 1, Schritt 4: A füllt am Ende seines Zuges auf, B erst zu Beginn seines nächsten Zuges', () => {
    // B hat ausserhalb seines Zuges einen Farbenschutz gespielt und hält noch 4 Karten.
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false })
      .hand(0, FUENF)
      .hand(1, ['Blau', 'Rot', 'Gelb', 'Grün'])
      .ablage(1, ['Farbenschutz'])
      .ablage(0, ['Schlangenblockade'])
      .zustand()
    const gespielt = fuehreAus(zustand, aktionen(zustand, 'FarbkarteLegen')[0]).zustand
    expect(gespielt.spieler[1].hand).toHaveLength(4)
    const nach = fuehreAus(gespielt, zugBeenden(gespielt)).zustand
    expect(nach.spieler.map((spieler) => spieler.hand.length)).toEqual([5, 5])
  })

  it('A6 Beispiel 2, Schritt 5: A füllt am Ende seines Zuges auf, B und C erst zu Beginn ihres nächsten Zuges', () => {
    const vier: Kartenwahl[] = ['Blau', 'Rot', 'Gelb', 'Grün']
    let zustand = mitHaenden([FUENF, vier, vier])
    zustand = spieleZug(zustand).zustand
    expect(zustand.spieler.map((spieler) => spieler.hand.length)).toEqual([5, 5, 4])
    expect(zustand.zug.spielerIndex).toBe(1)
    zustand = fuehreAus(zustand, aktionen(zustand, 'FarbkarteLegen')[0]).zustand
    expect(zustand.spieler.map((spieler) => spieler.hand.length)).toEqual([5, 4, 4])
    zustand = fuehreAus(zustand, zugBeenden(zustand)).zustand
    expect(zustand.spieler.map((spieler) => spieler.hand.length)).toEqual([5, 5, 5])
  })

  it('A6: wer nicht am Zug ist, zieht nie, auch nicht, während andere ihren Zug beenden', () => {
    let zustand = mitHaenden([FUENF, FUENF, FUENF, ['Blau', 'Rot']])
    for (let zug = 0; zug < 3; zug += 1) {
      const { zustand: nach, ereignisse } = spieleZug(zustand)
      // Erst mit seinem eigenen Zug (nach dem dritten Zugwechsel) füllt Spieler 4 auf.
      expect(nach.spieler[3].hand).toHaveLength(zug === 2 ? 5 : 2)
      expect(ereignisseVom(ereignisse, 'KartenGezogen').some((ereignis) => ereignis.spielerIndex === 3)).toBe(zug === 2)
      zustand = nach
    }
  })
})

describe('A5: mehr als 5 Handkarten am Zugende', () => {
  const ACHT: Kartenwahl[] = ['Blau', 'Rot', 'Gelb', 'Violett', 'Braun', 'Grün', 'Farbenschutz', 'Schlangenblockade']

  function amZugende(): Spielzustand {
    const zustand = mitHaenden([ACHT, FUENF])
    const gespielt = fuehreAus(zustand, aktionen(zustand, 'FarbkarteLegen')[0]).zustand
    return fuehreAus(gespielt, zugBeenden(gespielt)).zustand
  }

  it('A5: der Spieler wählt, welche überzähligen Karten auf seinen Ablagestapel gehen; danach ist der Nächste dran', () => {
    const zustand = amZugende()
    expect(zustand.zug).toMatchObject({ spielerIndex: 0, abschnitt: 'Abwerfen' })
    expect(ermittleEntscheider(zustand)).toBe(0)
    expect(zustand.spieler[0].hand).toHaveLength(7)
    const angeboten = aktionen(zustand)
    expect(typen(zustand)).toEqual(['UeberhandAbwerfen'])
    expect(angeboten).toHaveLength(21)
    const gewaehlt = [zustand.spieler[0].hand[6].id, zustand.spieler[0].hand[2].id]
    const aktion = angeboten.find(
      (eintrag) => eintrag.typ === 'UeberhandAbwerfen' && [...eintrag.karteIds].sort().join() === [...gewaehlt].sort().join(),
    )!
    const { zustand: nach, ereignisse } = fuehreAus(zustand, aktion)
    expect(nach.spieler[0].hand).toHaveLength(5)
    expect(ablage(nach, 0).sort()).toEqual([...gewaehlt].sort())
    expect(nach.zug).toMatchObject({ spielerIndex: 1, abschnitt: 'Ausspielen' })
    expect(ereignisse[0]).toEqual({ typ: 'KartenAbgeworfen', spielerIndex: 0, karteIds: aktion.typ === 'UeberhandAbwerfen' ? aktion.karteIds : [] })
    expect(ereignisse[1]).toEqual({ typ: 'ZugBegonnen', spielerIndex: 1, teilzug: 1 })
  })

  it('A5: abgeworfen wird genau die überzählige Zahl eigener Handkarten, jede einmal', () => {
    const zustand = amZugende()
    const [a, b, c] = hand(zustand, 0)
    const fremd = hand(zustand, 1)[0]
    const abwerfen = (karteIds: string[]): SpielAktion => ({ typ: 'UeberhandAbwerfen', spielerId: 'spieler-1', karteIds })
    expect(grund(zustand, abwerfen([a]))).toMatch(/genau 2 Karten.*\(A5\)/)
    expect(grund(zustand, abwerfen([a, b, c]))).toMatch(/genau 2 Karten.*\(A5\)/)
    expect(grund(zustand, abwerfen([a, a]))).toMatch(/doppelt/)
    expect(grund(zustand, abwerfen([a, fremd]))).toMatch(new RegExp(`${fremd} liegt nicht auf der Hand`))
  })

  it('A5: solange abgeworfen wird, gibt es weder Karten noch „Zug beenden“', () => {
    const zustand = amZugende()
    const blau = zustand.spieler[0].hand.find((karte) => karte.typ === 'Farbkarte')!
    expect(grund(zustand, zugBeenden(zustand))).toMatch(/überzählige Karten abwerfen \(A5\)/)
    expect(grund(zustand, { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: blau.id, ziel: { art: 'neueSchlange' } })).toMatch(
      /nur überzählige Handkarten abgeworfen/,
    )
  })

  it('A5: abwerfen gibt es nur am Zugende mit mehr als 5 Karten', () => {
    const zustand = mitHaenden([ACHT, FUENF])
    expect(grund(zustand, { typ: 'UeberhandAbwerfen', spielerId: 'spieler-1', karteIds: hand(zustand, 0).slice(0, 3) })).toMatch(
      /erst am Zugende.*\(A5\)/,
    )
  })
})

describe('A5/A6: Aktionsschicht und Ereignisse des Zugablaufs', () => {
  it('A5: anwendeAktion lässt den übergebenen Zustand unverändert', () => {
    const zustand = mitHaenden([FUENF, FUENF])
    const vorher = serialisiere(zustand)
    const gespielt = anwendeAktion(zustand, aktionen(zustand, 'FarbkarteLegen')[0]).zustand
    expect(serialisiere(zustand)).toBe(vorher)
    const zwischen = serialisiere(gespielt)
    anwendeAktion(gespielt, zugBeenden(gespielt))
    expect(serialisiere(gespielt)).toBe(zwischen)
  })

  it('A5: nach „Zug beenden“ rückt die Engine selbst bis zur nächsten Entscheidung vor', () => {
    const zustand = mitHaenden([FUENF, ['Blau']])
    const nach = spieleZug(zustand).zustand
    expect(ermittleEntscheider(nach)).toBe(1)
    expect(nach.spieler[1].hand).toHaveLength(5)
    expect(typen(nach)).toEqual(['FarbkarteLegen'])
  })

  it('A5: jede Aktion liefert ihre Ereignisse, eine Karte genau ein „KarteGespielt“', () => {
    const zustand = mitHaenden([['Blau', 'Farbenschutz'], FUENF])
    const [blau, schutz] = hand(zustand, 0)
    const erste = fuehreAus(zustand, aktionen(zustand, 'FarbkarteLegen')[0])
    expect(erste.ereignisse).toEqual([{ typ: 'KarteGespielt', spielerIndex: 0, karteId: blau, aktion: 'FarbkarteLegen' }])
    const zweite = fuehreAus(erste.zustand, aktionen(erste.zustand, 'SonderkarteWirkungslosAblegen')[0])
    expect(zweite.ereignisse).toEqual([{ typ: 'KarteGespielt', spielerIndex: 0, karteId: schutz, aktion: 'SonderkarteWirkungslosAblegen' }])
    const dritte = fuehreAus(zweite.zustand, zugBeenden(zweite.zustand))
    expect(dritte.ereignisse).toEqual([
      { typ: 'KartenGezogen', spielerIndex: 0, anzahl: 5 },
      { typ: 'ZugBegonnen', spielerIndex: 1, teilzug: 1 },
    ])
  })
})
