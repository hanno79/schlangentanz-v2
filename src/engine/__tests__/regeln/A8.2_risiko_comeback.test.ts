import { describe, expect, it } from 'vitest'
import type { Spielzustand } from '../../index'
import { belegungGueltig, zugerweiterungGesperrt } from '../../zuggrenzen'
import { comebackAktion, einsetzen, karteVon, mitBedingung, mitWirkung, spiele, zwei } from '../comeback_hilfen'
import { idVon, risikoAktionen, spieleRisiko, waehle } from '../risiko_hilfen'
import { aktionen } from '../zugablauf_hilfen'

/*
X5 neben X4: Risiko-Karte und Comeback-Karte im selben Zug. Die Risiko-Karte
ist keine Zugerweiterung (D47) und geht je Runde nur einmal (D50), auch mit
Comeback. Die Farbkarte, die Risiko-Aktion 2 zusätzlich legt, belegt keinen
Platz, also auch keine Zusatzaktion der Comeback-Karte (A8.2, Antwort des
Autors vom 24.11.2026).
*/

/** Spieler 1 mit dieser Hand und der Schlange Blau (1 gegen 6), Comeback-Bedingung erfüllt; oben auf dem Stapel Grün. */
function tisch(hand: Parameters<typeof zwei>[0]): Spielzustand {
  return mitBedingung(zwei(hand, 1, 6).stapelOben(['Grün', 'Gelb']))
}

const HAND: Parameters<typeof zwei>[0] = ['Blau', 'Rot', 'Gelb', 'Violett', 'Braun']

describe('D47/D50: Risiko-Karte und Comeback-Karte im selben Zug', () => {
  it('D47: nach dem Comeback ist die Risiko-Karte spielbar, und nach der Risiko-Karte ist das Comeback noch einsetzbar', () => {
    const comebackZuerst = einsetzen(tisch(HAND)).zustand
    expect(risikoAktionen(comebackZuerst).length, 'D47: die Comeback-Karte sperrt die Risiko-Karte nicht').toBeGreaterThan(0)
    const risikoZuerst = spieleRisiko(tisch(HAND), 1).zustand
    expect(zugerweiterungGesperrt(risikoZuerst.zug), 'D47: die Risiko-Karte ist keine Zugerweiterung').toBeNull()
    expect(comebackAktion(risikoZuerst), 'D47: das Comeback geht danach noch').toBeDefined()
  })

  it('D50: auch mit Comeback bleibt es bei einer Risiko-Karte in der Runde', () => {
    const beide = einsetzen(spieleRisiko(tisch(HAND), 1).zustand).zustand
    expect(beide.spieler[0].comeback?.verbraucht).toBe(true)
    expect(risikoAktionen(beide), 'D50: keine zweite Risiko-Karte').toEqual([])
  })

  it('A8.2/A8.1: die Zusatzfarbkarte aus Risiko-Aktion 2 belegt keine Zusatzaktion des Comebacks; danach gehen noch drei Farbkarten', () => {
    const start = einsetzen(tisch(HAND)).zustand
    const eigene = start.spieler[0].schlangen[0].id
    const offen = spieleRisiko(start, 2, idVon(start, 0, 'Violett')).zustand
    let zustand = waehle(offen, `${idVon(offen, 0, 'Violett')} ${eigene} ende`).zustand
    expect(belegungGueltig(zustand.zug)).toBe(true)
    expect(aktionen(zustand, 'ZugBeenden'), 'A5/D12: die Zusatzfarbkarte zählt als Karte des Zuges').toHaveLength(1)
    for (const farbe of ['Blau', 'Rot', 'Gelb']) zustand = spiele(zustand, karteVon(zustand, farbe)).zustand
    expect(zustand.zug.gespielteFarbkarten, 'eine Farbkarte des Zuges und zwei Zusatzaktionen').toBe(3)
    expect(belegungGueltig(zustand.zug)).toBe(true)
    expect(mitWirkung(zustand, karteVon(zustand, 'Braun')), 'D46: eine vierte gespielte Farbkarte geht nicht').toBe(false)
  })
})
