import { describe, expect, it } from 'vitest'
import { zugInSicht } from '../../index'
import type { SpielAktion, Spielzustand } from '../../index'
import { baukasten } from '../../testing/szenario'
import { ZWEI_ABWERFEN_DREI_ZIEHEN } from '../../erweiterung/comeback'
import { beende, einsetzen, FUENF_FARBEN, karteVon, mitBedingung, mitWirkung, spiele, tauschAktionen, tausche, zwei } from '../comeback_hilfen'
import { verrateneHandkarten } from '../nachrechnen'
import { aktionen, fuehreAus, grund, typen } from '../zugablauf_hilfen'

/*
X4, A8.1: die zwei Zusatzaktionen der Comeback-Karte. Kriterien 4 und 5 aus dem
Plan: zwei Zusatzaktionen aus den drei Möglichkeiten (eine Farbkarte, eine
Sonderkarte, zwei Karten abwerfen und drei ziehen), in beliebiger Reihenfolge
mit den normalen Aktionen, auch zweimal dieselbe; pro Zug bleibt es bei einer
Farbenfusion (D46, D56). „Zwei Karten abwerfen, drei ziehen“ nach D49: mit
weniger als zwei Handkarten nicht wählbar, bei weniger als drei im Stapel zieht
man, was da ist, die zuletzt gezogene Karte darf man im selben Zug noch spielen,
dann beginnt die Schlussrunde (D57), und in der Schlussrunde ist sie nicht wählbar.
*/

/** Spieler 1 mit dieser Hand und der Schlange Grün (1 gegen 6), Comeback eingesetzt. */
function eingesetzt(hand: Parameters<typeof zwei>[0], bau = zwei(hand, 1, 6)): Spielzustand {
  return einsetzen(mitBedingung(bau)).zustand
}

const abwerfen = (zustand: Spielzustand, karteIds: string[]) => ({ typ: 'ZweiAbwerfenDreiZiehen', spielerId: zustand.spieler[0].id, karteIds })

describe('A8.1/D46: zwei Zusatzaktionen aus drei Möglichkeiten, obendrauf', () => {
  it('A8.1/D46: zweimal eine Farbkarte: drei Farbkarten und eine Sonderkarte in einem Zug, danach nur noch „Zug beenden“', () => {
    let zustand = eingesetzt(['Blau', 'Rot', 'Gelb', 'Schlangenblockade', 'Violett'])
    for (const farbe of ['Blau', 'Rot', 'Gelb', 'Schlangenblockade']) zustand = spiele(zustand, karteVon(zustand, farbe)).zustand
    expect(zustand.zug).toMatchObject({ gespielteFarbkarten: 3, gespielteSonderkarten: 1 })
    expect(mitWirkung(zustand, karteVon(zustand, 'Violett')), 'D46: eine vierte Farbkarte geht nicht').toBe(false)
    expect(typen(zustand), 'X5: daneben nur die Risiko-Karte, die keinen Platz braucht').toEqual(['RisikoKarteSpielen', 'ZugBeenden'])
  })

  it('A8.1/D46: zweimal eine Sonderkarte: eine Farbkarte und drei Sonderkarten', () => {
    let zustand = eingesetzt(['Schlangenblockade', 'Schlangenblockade', 'Rot', 'Schlangenblockade', 'Blau'])
    for (const art of ['Schlangenblockade', 'Schlangenblockade', 'Rot', 'Schlangenblockade']) zustand = spiele(zustand, karteVon(zustand, art)).zustand
    expect(zustand.zug).toMatchObject({ gespielteFarbkarten: 1, gespielteSonderkarten: 3 })
    expect(typen(zustand), 'X5: daneben nur die Risiko-Karte, die keinen Platz braucht').toEqual(['RisikoKarteSpielen', 'ZugBeenden'])
  })

  it('A8.1: in beliebiger Reihenfolge mit den normalen Aktionen: erst zwei Karten, dann Comeback, dann je eine weitere Farb- und Sonderkarte', () => {
    let zustand = mitBedingung(zwei(['Blau', 'Schlangenblockade', 'Rot', 'Schlangenblockade'], 1, 6))
    zustand = spiele(spiele(zustand, karteVon(zustand, 'Schlangenblockade')).zustand, karteVon(zustand, 'Blau')).zustand
    zustand = einsetzen(zustand).zustand
    zustand = spiele(spiele(zustand, karteVon(zustand, 'Rot')).zustand, karteVon(zustand, 'Schlangenblockade')).zustand
    expect(zustand.zug).toMatchObject({ gespielteFarbkarten: 2, gespielteSonderkarten: 2 })
    expect(zustand.spieler[0].hand).toEqual([])
    expect(typen(zustand), 'X5: daneben nur die Risiko-Karte, die keinen Platz braucht').toEqual(['RisikoKarteSpielen', 'ZugBeenden'])
  })

  it('A8.1/D49: zweimal „Zwei Karten abwerfen, drei ziehen“, und die normale Farb- und Sonderkarte bleiben', () => {
    let zustand = eingesetzt(FUENF_FARBEN)
    zustand = tausche(zustand).zustand
    expect(zustand.spieler[0].hand, 'D49: 5 − 2 + 3').toHaveLength(6)
    zustand = tausche(zustand).zustand
    expect(zustand.spieler[0].hand, 'D49: zweimal erlaubt').toHaveLength(7)
    expect(tauschAktionen(zustand), 'D46: eine dritte Zusatzaktion gibt es nicht').toEqual([])
    expect(grund(zustand, abwerfen(zustand, zustand.spieler[0].hand.slice(0, 2).map((karte) => karte.id)))).toMatch(/keine zusätzliche Aktion frei.*A8\.1, D46/)
    expect(zustand.zug).toMatchObject({ gespielteFarbkarten: 0, gespielteSonderkarten: 0 })
    const farbe = zustand.spieler[0].hand.find((karte) => karte.typ === 'Farbkarte')
    expect(farbe !== undefined && mitWirkung(zustand, farbe.id), 'A5: die Farbkarte des Zuges geht noch').toBe(true)
  })

  it('A8.1: eine Zusatzaktion zum Abwerfen und eine für eine Karte: danach zwei Farbkarten, aber keine dritte', () => {
    let zustand = eingesetzt(['Blau', 'Rot', 'Gelb', 'Grün', 'Braun'])
    zustand = tausche(zustand, [karteVon(zustand, 'Blau'), karteVon(zustand, 'Rot')]).zustand
    zustand = spiele(zustand, karteVon(zustand, 'Gelb')).zustand
    zustand = spiele(zustand, karteVon(zustand, 'Grün')).zustand
    expect(zustand.zug.gespielteFarbkarten).toBe(2)
    expect(mitWirkung(zustand, karteVon(zustand, 'Braun')), 'D46: alle Plätze für Farbkarten sind belegt').toBe(false)
    expect(tauschAktionen(zustand), 'D46: auch kein zweites Abwerfen').toEqual([])
  })

  it('A7.7/D46/D56: auch mit der Comeback-Karte nur eine Farbenfusion je Zug; die zweite lässt sich nur wirkungslos ablegen', () => {
    const bau = baukasten({ spielerzahl: 2, erweiterung: true }).hand(0, ['Farbenfusion', 'Farbenfusion']).hand(1, FUENF_FARBEN).schlange(0, ['Rot', 'Rot', 'Blau', 'Blau']).schlange(1, ['Grün', 'Grün', 'Grün', 'Grün', 'Grün', 'Gelb', 'Gelb', 'Gelb', 'Gelb'])
    let zustand = eingesetzt([], bau)
    zustand = spiele(zustand, karteVon(zustand, 'Farbenfusion')).zustand
    const zweite = karteVon(zustand, 'Farbenfusion')
    expect(mitWirkung(zustand, zweite)).toBe(false)
    expect(aktionen(zustand, 'SonderkarteWirkungslosAblegen').map((aktion) => 'karteId' in aktion && aktion.karteId)).toEqual([zweite])
  })

  it('A8.1: ohne eingesetzte Comeback-Karte gibt es „Zwei Karten abwerfen, drei ziehen“ nicht', () => {
    const zustand = mitBedingung(zwei(FUENF_FARBEN, 1, 6))
    expect(tauschAktionen(zustand)).toEqual([])
    expect(grund(zustand, abwerfen(zustand, zustand.spieler[0].hand.slice(0, 2).map((karte) => karte.id)))).toMatch(/keine zusätzliche Aktion frei/)
  })
})

describe('D49: Zwei Karten abwerfen, drei ziehen', () => {
  it('D49: die zwei gewählten Karten kommen auf den eigenen Ablagestapel, drei neue vom Nachziehstapel auf die Hand', () => {
    const start = eingesetzt(FUENF_FARBEN)
    const stapel = start.nachziehstapel.slice(0, 3).map((karte) => karte.id)
    const gewaehlt: [string, string] = [karteVon(start, 'Blau'), karteVon(start, 'Gelb')]
    const schritt = tausche(start, gewaehlt)
    expect(schritt.ereignisse).toEqual([
      { typ: 'KartenAbgeworfen', spielerIndex: 0, karteIds: gewaehlt },
      { typ: 'KartenGezogen', spielerIndex: 0, anzahl: 3 },
    ])
    expect(schritt.zustand.spieler[0].ablagestapel.map((karte) => karte.id)).toEqual(gewaehlt)
    expect(schritt.zustand.spieler[0].hand.map((karte) => karte.id)).toEqual([...start.spieler[0].hand.map((karte) => karte.id).filter((id) => !gewaehlt.includes(id)), ...stapel])
    expect(schritt.zustand.nachziehstapel).toHaveLength(start.nachziehstapel.length - 3)
    const umgekehrt = fuehreAus(start, abwerfen(start, [gewaehlt[1], gewaehlt[0]]) as SpielAktion)
    expect(umgekehrt.zustand, 'D49: gleiche Wahl in anderer Schreibweise, gleiche Wirkung (Reihenfolge der Hand)').toEqual(schritt.zustand)
  })

  it('B2: kein Ereignis und nicht die Sicht des Gegners nennen eine der gezogenen Karten', () => {
    const start = eingesetzt(FUENF_FARBEN)
    const gezogen = start.nachziehstapel.slice(0, 3).map((karte) => karte.id)
    const schritt = tausche(start)
    expect(verrateneHandkarten(schritt.zustand, schritt.ereignisse)).toEqual([])
    const sichtDesGegners = JSON.stringify(zugInSicht(schritt.zustand, 1))
    expect(gezogen.filter((id) => sichtDesGegners.includes(id)), 'B2: der Zug in der Sicht von KI-Gegner 1').toEqual([])
  })

  it('D49/A5: das Abwerfen zählt nicht als Karte des Zuges: ohne gespielte Karte lässt sich der Zug nicht beenden', () => {
    const getauscht = tausche(eingesetzt(FUENF_FARBEN)).zustand
    expect(typen(getauscht)).not.toContain('ZugBeenden')
    expect(grund(getauscht, { typ: 'ZugBeenden', spielerId: 'spieler-1' })).toMatch(/mindestens eine Karte/)
  })

  it('D49: aufgezählt ist jede Wahl von zwei Handkarten genau einmal, in der Reihenfolge der Hand', () => {
    const zustand = eingesetzt(['Blau', 'Rot', 'Gelb', 'Grün'])
    const ids = zustand.spieler[0].hand.map((karte) => karte.id)
    const paare = ids.flatMap((erste, stelle) => ids.slice(stelle + 1).map((zweite) => [erste, zweite]))
    expect(tauschAktionen(zustand).map((aktion) => aktion.typ === 'ZweiAbwerfenDreiZiehen' && aktion.karteIds)).toEqual(paare)
  })

  it('D49: mit weniger als zwei Handkarten nicht wählbar', () => {
    const zustand = eingesetzt(['Blau'])
    expect(tauschAktionen(zustand)).toEqual([])
    expect(grund(zustand, abwerfen(zustand, [karteVon(zustand, 'Blau'), karteVon(zustand, 'Blau')]))).toMatch(/weniger als zwei Handkarten.*D49/)
  })

  it('D49: zwei verschiedene eigene Handkarten: eine doppelt genannte oder eine fremde lehnt die Engine ab', () => {
    const zustand = eingesetzt(FUENF_FARBEN)
    const blau = karteVon(zustand, 'Blau')
    expect(grund(zustand, abwerfen(zustand, [blau, blau]))).toMatch(/doppelt/)
    expect(grund(zustand, abwerfen(zustand, [blau, zustand.spieler[1].hand[0].id]))).toMatch(/nicht auf der Hand/)
    expect(grund(zustand, abwerfen(zustand, [blau]))).toMatch(/karteIds/)
    // Codex-Review X4: Eine Liste mit Lücke hat Länge 2, nennt aber nur eine Karte.
    const mitLuecke = new Array<string>(2)
    mitLuecke[1] = blau
    expect(grund(zustand, abwerfen(zustand, mitLuecke))).toMatch(/karteIds/)
  })

  it('D49/D55: liegen weniger als drei Karten im Stapel, zieht man, was da ist; die Schlussrunde löst der Spieler am Zug aus', () => {
    const start = eingesetzt(FUENF_FARBEN, zwei(FUENF_FARBEN, 1, 6).stapelBehalten(2))
    const schritt = tausche(start)
    expect(schritt.ereignisse.map((ereignis) => ereignis.typ)).toEqual(['KartenAbgeworfen', 'KartenGezogen', 'SchlussrundeBegonnen'])
    expect(schritt.ereignisse[1]).toEqual({ typ: 'KartenGezogen', spielerIndex: 0, anzahl: 2 })
    expect(schritt.zustand).toMatchObject({ partiephase: 'Schlussrunde', schlussrundeAusloeser: 0, nachziehstapel: [] })
    expect(schritt.zustand.spieler[0].hand).toHaveLength(5)
  })

  it('D57: wer so die letzte Karte zieht, spielt sie im selben Zug noch; danach hat jeder andere einen letzten Zug', () => {
    const start = eingesetzt(['Blau', 'Rot', 'Gelb', 'Braun', 'Grün'], zwei(FUENF_FARBEN, 1, 6).stapelOben(['Violett']).stapelBehalten(1))
    let zustand = tausche(start, [karteVon(start, 'Blau'), karteVon(start, 'Rot')]).zustand
    expect(zustand.partiephase).toBe('Schlussrunde')
    const violett = karteVon(zustand, 'Violett')
    expect(mitWirkung(zustand, violett), 'D57: die eben gezogene Karte ist im selben Zug spielbar').toBe(true)
    zustand = spiele(spiele(zustand, violett).zustand, karteVon(zustand, 'Gelb')).zustand
    expect(zustand.zug.gespielteFarbkarten).toBe(2)
    expect(tauschAktionen(zustand), 'D49: in der Schlussrunde nicht wählbar').toEqual([])
    const gegner = beende(zustand)
    expect(gegner.ereignisse.map((ereignis) => ereignis.typ), 'A10: kein Nachziehen').not.toContain('KartenGezogen')
    expect(gegner.zustand.zug.spielerIndex).toBe(1)
    const ende = beende(spiele(gegner.zustand, gegner.zustand.spieler[1].hand[0].id).zustand)
    expect(ende.zustand.partiephase).toBe('Beendet')
  })

  it('D49: in der Schlussrunde nicht wählbar, die Karten-Zusatzaktionen der Comeback-Karte gehen dort aber', () => {
    const zustand = eingesetzt(FUENF_FARBEN, zwei(FUENF_FARBEN, 1, 6).schlussrunde(1).amZug(0))
    expect(tauschAktionen(zustand)).toEqual([])
    expect(grund(zustand, abwerfen(zustand, [karteVon(zustand, 'Blau'), karteVon(zustand, 'Rot')]))).toMatch(/Schlussrunde.*D49/)
    let gespielt = zustand
    for (const farbe of ['Blau', 'Rot', 'Gelb']) gespielt = spiele(gespielt, karteVon(gespielt, farbe)).zustand
    expect(gespielt.zug.gespielteFarbkarten, 'A8.1: drei Farbkarten im letzten Zug').toBe(3)
  })

  it('D49: zieht das erste Abwerfen die letzte Karte, ist das zweite nicht mehr wählbar', () => {
    const start = eingesetzt(FUENF_FARBEN, zwei(FUENF_FARBEN, 1, 6).stapelBehalten(3))
    const nach = tausche(start).zustand
    expect(nach.partiephase).toBe('Schlussrunde')
    expect(tauschAktionen(nach)).toEqual([])
  })

  it('A8.1: die Zusatzaktion steht im Zug als belegter Platz ohne Karte', () => {
    const nach = tausche(eingesetzt(FUENF_FARBEN)).zustand
    expect(nach.zug.verwendet).toEqual([{ art: ZWEI_ABWERFEN_DREI_ZIEHEN, karteId: null, kartenart: null }])
  })
})
