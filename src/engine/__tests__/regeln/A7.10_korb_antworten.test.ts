import { describe, expect, it } from 'vitest'
import { pruefeAktion } from '../../index'
import type { SchlangenkorbSpielenAktion, SpielAktion, Spielzustand } from '../../index'
import { einsetzen, mitBedingung, schlangeAus, tausche } from '../comeback_hilfen'
import { spieleRisiko, waehle, wahlen } from '../risiko_hilfen'
import { ablage, aktionen, fuehreAus, hand, zugBeenden } from '../zugablauf_hilfen'
import { aufEinemAblagestapel, handIds, KORB, korbId, korbtisch, mitWirkung, schlangenIds, spiele, spieleKarte, spieleKorb } from '../korb_hilfen'

/*
X6: die Antworten des Autors vom 24.11.2026 auf die drei offenen Fragen des
Schlangenkorbs. (1) Ein abgeworfener Korb, als Überzahl am Zugende (A5) oder
über „Zwei Karten abwerfen, drei ziehen“ (A8.1), kommt wie jede Karte auf den
Ablagestapel; vom Ablagestapel nimmt ihn Risiko-Aktion 4 trotzdem nie (A8.2,
D54). (2) „Tausche bis zu 2“ verlangt mindestens einen Tausch, höchstens zwei.
(3) Eine mit „Ziehe 3“ gezogene Farbkarte darf auch die reguläre Farbkarte des
Zuges sein, also sind drei gezogene Karten spielbar („Ja, drei möglich“). Dazu:
Eine Sonderkarte ohne Ziel lässt sich über eine Zusatzaktion wirkungslos
ablegen (D13, D46).
*/

/** Spieler 1 am Zug mit dem Korb und sechs Farbkarten; nach einer Farbkarte hält er am Zugende eine Karte zu viel. */
function ueberzahl(): Spielzustand {
  const start = korbtisch([KORB, 'Blau', 'Rot', 'Gelb', 'Grün', 'Braun', 'Violett'], undefined, 3).stapelOben(['Schlangengrube']).zustand()
  const gelegt = spiele(start, { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: handIds(start, 0, 'Blau')[0], ziel: { art: 'neueSchlange' } }).zustand
  return fuehreAus(gelegt, zugBeenden(gelegt)).zustand
}

function tausch(zustand: Spielzustand, anzahl: number): SpielAktion {
  const [schlange] = zustand.spieler[0].schlangen
  const farbkarten = zustand.spieler[0].hand.filter((karte) => karte.typ === 'Farbkarte')
  const aktion: SchlangenkorbSpielenAktion = {
    typ: 'SchlangenkorbSpielen',
    spielerId: 'spieler-1',
    karteId: korbId(zustand),
    bonus: { art: 'tauschen', tausch: Array.from({ length: anzahl }, (_, nummer) => ({ schlangenId: schlange.id, karteId: schlange.karten[nummer].id, handkarteId: farbkarten[nummer].id })) },
  }
  return aktion
}

describe('X6, Antwort 1: der abgeworfene Korb liegt auf dem Ablagestapel', () => {
  it('A5: als Überzahl am Zugende abgeworfen, kommt der Korb wie jede Karte auf den eigenen Ablagestapel', () => {
    const zustand = ueberzahl()
    const id = korbId(zustand)
    const abwurf = aktionen(zustand, 'UeberhandAbwerfen').find((aktion) => aktion.typ === 'UeberhandAbwerfen' && aktion.karteIds.includes(id))
    expect(abwurf, 'A5: der Korb ist als Überzahl wählbar').toBeDefined()
    const danach = spiele(zustand, abwurf!).zustand
    expect(ablage(danach, 0)).toContain(id)
    expect(danach.ausDemSpiel.map((karte) => karte.id)).not.toContain(id)
  })

  it('A8.2 Aktion 4, D54: einen echt abgeworfenen Korb nimmt die Risiko-Aktion nie vom Ablagestapel', () => {
    const zustand = ueberzahl()
    const id = korbId(zustand)
    const abwurf = aktionen(zustand, 'UeberhandAbwerfen').find((aktion) => aktion.typ === 'UeberhandAbwerfen' && aktion.karteIds.includes(id))!
    const naechster = spiele(zustand, abwurf).zustand
    expect(naechster.zug.spielerIndex, 'Testaufbau: KI-Gegner 1 ist am Zug').toBe(1)
    expect(ablage(naechster, 0), 'Testaufbau: auf dem Ablagestapel von Spieler 1 liegt nur der Korb').toEqual([id])
    // Misserfolg: Die Schlangengrube oben macht Spieler 1 wählbar; er nimmt eine Karte von seinem Ablagestapel oder die oberste Stapelkarte.
    const gegnerwahl = spieleRisiko(naechster, 4).zustand
    const beguenstigt = waehle(gegnerwahl, 'spieler-1').zustand
    expect(wahlen(beguenstigt), 'D54: der Korb steht nicht zur Wahl, nur der Stapel').toEqual(['stapel'])
    expect(aufEinemAblagestapel(waehle(beguenstigt, 'stapel').zustand, id), 'der Korb bleibt auf dem Ablagestapel').toBe(true)
  })

  it('A8.1, D49: über „Zwei Karten abwerfen, drei ziehen“ der Comeback-Karte abgeworfen, kommt der Korb ebenso auf den eigenen Ablagestapel', () => {
    const start = mitBedingung(korbtisch([KORB, 'Blau', 'Rot']).schlange(0, ['Gelb']).schlange(1, schlangeAus(8)))
    const id = korbId(start)
    const blau = handIds(start, 0, 'Blau')[0]
    const zustand = tausche(einsetzen(start).zustand, [id, blau]).zustand
    expect(ablage(zustand, 0)).toEqual([id, blau])
    expect(hand(zustand, 0)).not.toContain(id)
  })
})

describe('X6, Antwort 2: „Tausche bis zu 2“ heisst ein oder zwei Täusche', () => {
  it('A7.10/D44: mit null und mit drei Täuschen lehnt die Engine auch eine selbst gebaute Aktion ab; mit einem und zwei nicht', () => {
    const zustand = korbtisch([KORB, 'Gelb', 'Grün', 'Violett']).schlange(0, ['Blau', 'Rot', 'Braun']).zustand()
    for (const anzahl of [0, 3]) {
      expect(pruefeAktion(zustand, tausch(zustand, anzahl)), `${anzahl} Täusche`).toEqual({ erlaubt: false, grund: 'Ungültige Aktion SchlangenkorbSpielen: Feld bonus ist ungültig.' })
    }
    for (const anzahl of [1, 2]) expect(pruefeAktion(zustand, tausch(zustand, anzahl)), `${anzahl} Täusche`).toEqual({ erlaubt: true })
  })
})

describe('X6, Antwort 3: drei gezogene Farbkarten sind spielbar', () => {
  it('A7.10/D43: ohne eigene Farbkarte auf der Hand nimmt eine gezogene Farbkarte den regulären Platz, zwei weitere die Zusatzaktionen des Korbs', () => {
    const start = korbtisch([KORB, 'Schlangenblockade']).stapelOben(['Rot', 'Gelb', 'Grün']).zustand()
    const gezogen = start.nachziehstapel.slice(0, 3).map((karte) => karte.id)
    let zustand = spieleKorb(start, 'ziehen').zustand
    zustand = spiele(zustand, { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: gezogen[0], ziel: { art: 'neueSchlange' } }).zustand
    for (const id of gezogen.slice(1)) zustand = spieleKarte(zustand, id).zustand
    expect(zustand.zug).toMatchObject({ gespielteFarbkarten: 3, gespielteSonderkarten: 1 })
    expect([...schlangenIds(zustand, 0), ...schlangenIds(zustand, 0, 1)].sort(), 'alle drei liegen in eigenen Schlangen').toEqual([...gezogen].sort())
    expect(mitWirkung(zustand, handIds(zustand, 0, 'Schlangenblockade')[0]), 'D42: keine Sonderkarte mehr').toBe(false)
  })
})

describe('X6: wirkungslos ablegen über eine Zusatzaktion', () => {
  it('D13/D46: nach „zwei zusätzliche Aktionen“ lässt sich ein Farbenschutz über eine Zusatzaktion wirkungslos ablegen; er belegt ihren Platz', () => {
    const start = korbtisch([KORB, 'Farbenschutz', 'Farbenschutz']).zustand()
    let zustand = spieleKorb(start, 'aktionen').zustand
    const schutz = handIds(zustand, 0, 'Farbenschutz')
    for (const id of schutz) {
      const ablegen = aktionen(zustand, 'SonderkarteWirkungslosAblegen').find((aktion) => 'karteId' in aktion && aktion.karteId === id)
      expect(ablegen, `D13: ${id} ist wirkungslos ablegbar`).toBeDefined()
      zustand = spiele(zustand, ablegen!).zustand
    }
    expect(ablage(zustand, 0)).toEqual(schutz)
    expect(zustand.zug.verwendet.map((eintrag) => eintrag.art)).toEqual(['Sonderkarte', 'Sonderkarte', 'Sonderkarte'])
    expect(zustand.zug.gespielteSonderkarten, 'Korb und zwei Farbenschutz').toBe(3)
  })
})
