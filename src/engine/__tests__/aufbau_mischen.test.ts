import { describe, expect, it } from 'vitest'
import { erstellePartie } from '../index'
import type { Spielzustand } from '../index'
import { mischeDeck } from '../deck'
import { erzeugeZufall } from '../testing/zufall'

/*
A4 nennt eine Reihenfolge: erst mischen, dann austeilen, für die Spielkarten
wie für die Aufgaben. Wer das vertauscht, gibt jedem Spieler in jeder Partie
dieselbe Starthand oder dieselbe geheime Aufgabe, und der Rest sieht trotzdem
gemischt aus. Deshalb wird hier je Spieler und je Platz geprüft, nicht über
alles zusammen.
*/

const SAATEN = Array.from({ length: 30 }, (_, index) => index + 1)

function partie(saat: number, spielerzahl = 3): Spielzustand {
  return erstellePartie({ spielerzahl, erweiterung: true, zufall: erzeugeZufall(saat) })
}

function verschiedene(werte: string[]): number {
  return new Set(werte).size
}

describe('A4: erst mischen, dann austeilen', () => {
  it.each([0, 1, 2])('A4: die Starthand von Spieler %i hängt von der Saat ab (Karten gemischt, dann ausgeteilt)', (index) => {
    const haende = SAATEN.map((saat) => partie(saat).spieler[index].hand.map((karte) => karte.id).join(','))
    expect(verschiedene(haende), `A4: Spieler ${index + 1} bekommt bei verschiedenen Saaten zu oft dieselbe Hand`).toBeGreaterThan(25)
    const ersteKarten = SAATEN.map((saat) => partie(saat).spieler[index].hand[0].id)
    expect(verschiedene(ersteKarten), 'A4: die erste Handkarte ist fast immer dieselbe').toBeGreaterThan(15)
  })

  it.each([0, 1, 2])('A4: die geheime Aufgabe von Spieler %i hängt von der Saat ab (Aufgaben gemischt, dann verteilt)', (index) => {
    const geheime = SAATEN.map((saat) => partie(saat).spieler[index].geheimeAufgabe!.id)
    expect(verschiedene(geheime), `A4: Spieler ${index + 1} bekommt fast immer dieselbe geheime Aufgabe`).toBeGreaterThan(8)
  })

  it.each([0, 1, 2])('A4: die offene Aufgabe auf Platz %i hängt von der Saat ab', (platz) => {
    const offen = SAATEN.map((saat) => partie(saat).offeneAufgaben[platz].id)
    expect(verschiedene(offen), `A4: auf Platz ${platz + 1} liegt fast immer dieselbe offene Aufgabe`).toBeGreaterThan(8)
  })

  it('A4: die oberste Karte des Nachziehstapels hängt von der Saat ab', () => {
    const oberste = SAATEN.map((saat) => partie(saat).nachziehstapel[0].id)
    expect(verschiedene(oberste)).toBeGreaterThan(15)
  })
})

describe('B2: Mischen nach Fisher-Yates oder gleichwertig', () => {
  it('B2: drei Karten ergeben jede ihrer sechs Reihenfolgen ungefähr gleich oft, auch die unveränderte', () => {
    const haeufigkeit = new Map<string, number>()
    const laeufe = 3000
    for (let saat = 1; saat <= laeufe; saat += 1) {
      const reihenfolge = mischeDeck(['a', 'b', 'c'], erzeugeZufall(saat)).join('')
      haeufigkeit.set(reihenfolge, (haeufigkeit.get(reihenfolge) ?? 0) + 1)
    }
    expect([...haeufigkeit.keys()].sort()).toEqual(['abc', 'acb', 'bac', 'bca', 'cab', 'cba'])
    for (const [reihenfolge, anzahl] of haeufigkeit) {
      expect(anzahl / laeufe, `B2: ${reihenfolge} kommt ${anzahl}-mal von ${laeufe} vor`).toBeGreaterThan(0.13)
      expect(anzahl / laeufe, `B2: ${reihenfolge} kommt ${anzahl}-mal von ${laeufe} vor`).toBeLessThan(0.2)
    }
  })

  it('B2: das Mischen verändert die übergebene Liste nicht', () => {
    const liste = ['a', 'b', 'c', 'd']
    mischeDeck(liste, erzeugeZufall(1))
    expect(liste).toEqual(['a', 'b', 'c', 'd'])
  })
})
