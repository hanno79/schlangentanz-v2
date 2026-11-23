import { describe, expect, it } from 'vitest'
import type { Spielzustand } from '../../index'
import { baukasten } from '../../testing/szenario'
import { einmalJeRundeGesperrt, meldeZugerweiterung, merkeEinmalJeRunde, zugerweiterungGesperrt } from '../../zuggrenzen'
import { aktionFuer, fuehreAus, grund, zugBeenden } from '../zugablauf_hilfen'

/*
X3, D46 und D47: Der Verdoppler „kann nicht mit anderen zugerweiternden
Effekten kombiniert werden“ (A7.8). Nach D47 schliessen sich Verdoppler,
Comeback-Karte und die zugerweiternden Boni des Schlangenkorbs gegenseitig aus;
je Zug gibt es höchstens eine dieser Erweiterungen, und Risiko-Karten zählen
nicht dazu. Der zweite Zug nach einem Verdoppler gehört zu dessen Erweiterung,
deshalb gibt es dort kein Comeback (D48 verweist dafür auf D47). Nach D50 ist
eine Runde der eigene Zug samt zweitem Zug nach einem Verdoppler; darin ist
höchstens eine Risiko-Karte erlaubt.

Comeback, Schlangenkorb und Risiko-Karte kommen erst mit X4 bis X6. Die Tests
melden sie als Test-Zusatzaktionen direkt im Rahmen an.
*/

const RISIKO = 'Risiko-Belohnung'

/** Spieler 1 am Zug mit Verdoppler und Blau, KI-Gegner 1 mit fünf Farbkarten. */
function tisch(): Spielzustand {
  return baukasten({ spielerzahl: 2, erweiterung: true }).hand(0, ['Verdoppler', 'Blau']).hand(1, ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun']).zustand()
}

function nachVerdoppler(): Spielzustand {
  const start = tisch()
  return fuehreAus(start, aktionFuer(start, 'VerdopplerSpielen', start.spieler[0].hand[0].id)).zustand
}

/** Beginn des zweiten Zuges nach einem Verdoppler. */
function zweiterZug(vorher = nachVerdoppler()): Spielzustand {
  const zweiter = fuehreAus(vorher, zugBeenden(vorher)).zustand
  expect(zweiter.zug.teilzug, 'Testaufbau: der zweite Zug beginnt').toBe(2)
  return zweiter
}

/** Eine Kopie, in der `aendern` den Rahmen des laufenden Zuges anspricht. */
function mit(zustand: Spielzustand, aendern: (zustand: Spielzustand) => void): Spielzustand {
  const kopie = structuredClone(zustand)
  aendern(kopie)
  return kopie
}

describe('D47: Verdoppler, Comeback und Schlangenkorb schliessen sich aus', () => {
  it('D47: ohne Zugerweiterung lässt sich eine anmelden', () => {
    expect(zugerweiterungGesperrt(tisch().zug)).toBeNull()
  })

  it('D47: nach dem Verdoppler lässt sich im selben Zug keine weitere Zugerweiterung anmelden', () => {
    const zustand = nachVerdoppler()
    expect(zugerweiterungGesperrt(zustand.zug)).toMatch(/Verdoppler.*D47/)
    expect(() => mit(zustand, (kopie) => meldeZugerweiterung(kopie.zug, 'Comeback', []))).toThrow(/D47/)
  })

  it('D47/D48: im zweiten Zug nach einem Verdoppler ist kein Comeback möglich', () => {
    const zweiter = zweiterZug()
    expect(zugerweiterungGesperrt(zweiter.zug)).toMatch(/Verdoppler.*D47/)
    expect(() => mit(zweiter, (kopie) => meldeZugerweiterung(kopie.zug, 'Comeback', []))).toThrow(/D47/)
  })

  it('D47: nach der Comeback-Karte keine Zugerweiterung des Schlangenkorbs und kein Verdoppler mit Wirkung', () => {
    const comeback = mit(tisch(), (kopie) => meldeZugerweiterung(kopie.zug, 'Comeback', []))
    expect(() => mit(comeback, (kopie) => meldeZugerweiterung(kopie.zug, 'Schlangenkorb', []))).toThrow(/Comeback.*D47/)
    expect(grund(comeback, { typ: 'VerdopplerSpielen', spielerId: 'spieler-1', karteId: comeback.spieler[0].hand[0].id })).toMatch(/D47/)
  })

  it('D47: die Sperre gilt nur in dieser Runde; der Nächste darf wieder', () => {
    const zweiter = zweiterZug()
    const blau = zweiter.spieler[0].hand.find((karte) => karte.typ === 'Farbkarte')!.id
    const gelegt = fuehreAus(zweiter, { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: blau, ziel: { art: 'neueSchlange' } }).zustand
    const naechster = fuehreAus(gelegt, zugBeenden(gelegt)).zustand
    expect(naechster.zug).toMatchObject({ spielerIndex: 1, teilzug: 1 })
    expect(zugerweiterungGesperrt(naechster.zug)).toBeNull()
  })

  it('A7.8/D11/D23: im zweiten Zug lehnt die Engine einen Verdoppler mit demselben Grund ab wie vor X3', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false }).hand(0, ['Verdoppler']).amZug(0, 2).zustand()
    expect(grund(zustand, { typ: 'VerdopplerSpielen', spielerId: 'spieler-1', karteId: zustand.spieler[0].hand[0].id })).toBe(
      'Im zweiten Zug nach einem Verdoppler gibt ein weiterer Verdoppler keinen weiteren Zug (A7.8, D11); er lässt sich nur wirkungslos auf den eigenen Ablagestapel legen (D23).',
    )
  })
})

describe('D47/D50: Risiko-Karten zählen nicht zu den Zugerweiterungen, gehen aber nur einmal je Runde', () => {
  it('D47: neben einer Zugerweiterung bleibt eine Risiko-Karte möglich', () => {
    expect(einmalJeRundeGesperrt(nachVerdoppler().zug, RISIKO)).toBeNull()
    expect(einmalJeRundeGesperrt(mit(tisch(), (kopie) => meldeZugerweiterung(kopie.zug, 'Comeback', [])).zug, RISIKO)).toBeNull()
  })

  it('D50: nach einer Risiko-Karte geht in dieser Runde keine zweite, auch nicht im zweiten Zug nach einem Verdoppler', () => {
    const genutzt = mit(nachVerdoppler(), (kopie) => merkeEinmalJeRunde(kopie.zug, RISIKO))
    expect(einmalJeRundeGesperrt(genutzt.zug, RISIKO)).toMatch(/D50/)
    expect(() => mit(genutzt, (kopie) => merkeEinmalJeRunde(kopie.zug, RISIKO))).toThrow(/D50/)
    expect(einmalJeRundeGesperrt(zweiterZug(genutzt).zug, RISIKO), 'D50: ein Verdoppler gibt keine zweite Risiko-Karte').toMatch(/D50/)
  })

  it('D50: in der Runde des Nächsten ist wieder eine Risiko-Karte frei', () => {
    const genutzt = mit(tisch(), (kopie) => merkeEinmalJeRunde(kopie.zug, RISIKO))
    const blau = genutzt.spieler[0].hand[1].id
    const gelegt = fuehreAus(genutzt, { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: blau, ziel: { art: 'neueSchlange' } }).zustand
    const naechster = fuehreAus(gelegt, zugBeenden(gelegt)).zustand
    expect(einmalJeRundeGesperrt(naechster.zug, RISIKO)).toBeNull()
  })
})
