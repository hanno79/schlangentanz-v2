import { describe, expect, it } from 'vitest'
import { berechneZwischenstand } from '../index'
import { eineSchlange, endwertung, tisch } from './wertung_hilfe'

/*
E10, Satz für Satz: A11 Abschnitt 3 (längste Farbkette) und D24 (F11: eine Kette
zählt erst ab 3 Farbkarten derselben Farbe in ununterbrochener Reihe).
*/

describe('A11: längste Farbkette', () => {
  it('A11: der Spieler mit der längsten ununterbrochenen Kette einer Farbe erhält 5 Bonuspunkte', () => {
    const wertung = endwertung(false, [[['Blau', 'Blau', 'Blau', 'Blau']], [['Rot', 'Rot', 'Rot']]])
    expect(wertung.spieler.map((s) => s.kette)).toEqual([
      { laenge: 4, bonus: 5 },
      { laenge: 3, bonus: 0 },
    ])
    expect(wertung.spieler[0].summe).toBe(4 + 5)
    expect(wertung.spieler[1].summe).toBe(3)
  })

  it('A11: bei Gleichstand erhalten alle beteiligten Spieler die vollen 5 Punkte', () => {
    const wertung = endwertung(false, [[['Blau', 'Blau', 'Blau']], [['Rot', 'Rot', 'Rot']], [['Gelb', 'Gelb']]])
    expect(wertung.spieler.map((s) => s.kette?.bonus)).toEqual([5, 5, 0])
  })

  it('A11/D1: getrennte Gruppen derselben Farbe werden nicht zusammengezählt; es zählt die längste einzelne Kette', () => {
    const wertung = eineSchlange(['Rot', 'Rot', 'Rot', 'Blau', 'Rot', 'Rot', 'Rot', 'Rot'])
    expect(wertung.kette?.laenge).toBe(4)
  })

  it('A11/D1: auch Ketten in zwei Schlangen werden nicht zusammengezählt', () => {
    const wertung = endwertung(false, [[['Gelb', 'Gelb', 'Gelb'], ['Gelb', 'Gelb', 'Gelb']], [['Rot', 'Rot', 'Rot', 'Rot']]])
    expect(wertung.spieler.map((s) => s.kette)).toEqual([
      { laenge: 3, bonus: 0 },
      { laenge: 4, bonus: 5 },
    ])
  })

  it('A11 Beispiel: Rot-Rot-Rot-Regenbogenschlange-Rot-Rot-Rot-Rot hat die längste Kette 4, bringt aber 7 Gruppenpunkte', () => {
    const wertung = eineSchlange(['Rot', 'Rot', 'Rot', 'Regenbogenschlange', 'Rot', 'Rot', 'Rot', 'Rot'])
    expect(wertung.kette?.laenge).toBe(4)
    expect(wertung.gruppenPunkte).toBe(7)
  })

  it('A11: eine Farbenfusion zählt in der Kette nicht mit und unterbricht sie', () => {
    const wertung = eineSchlange(['Grün', 'Grün', 'Grün', { fusion: ['Grün', 'Grün'] }, 'Grün', 'Grün'])
    expect(wertung.kette?.laenge).toBe(3)
    expect(wertung.gruppenPunkte).toBe(3 * 5 + 6)
  })

  it('A11: andere Sonderkarten (Schlangenblockade) unterbrechen die Kette', () => {
    const wertung = eineSchlange(['Braun', 'Braun', 'Schlangenblockade', 'Braun', 'Braun', 'Braun'])
    expect(wertung.kette?.laenge).toBe(3)
  })

  it('A11: die Kette ist einfarbig; verschiedene Farben nebeneinander bilden keine Kette', () => {
    const wertung = eineSchlange(['Blau', 'Rot', 'Gelb', 'Violett', 'Braun', 'Grün'])
    expect(wertung.kette).toEqual({ laenge: 0, bonus: 0 })
  })

  it('A11: der Kettenbonus kommt erst in der Punktezählung nach Spielende, nicht in den Zwischenstand', () => {
    const zustand = tisch(false, [[['Blau', 'Blau', 'Blau', 'Blau']], [['Rot']]])
    const zwischenstand = berechneZwischenstand(zustand, zustand.spieler[0].id)
    expect(zwischenstand.spieler[0].kette).toBeNull()
    expect(zwischenstand.spieler[0].summe).toBe(4)
  })
})

describe('D24: eine Kette zählt erst ab 3 Farbkarten derselben Farbe', () => {
  it('D24: Rot-Rot ist noch keine Kette, Rot-Rot-Rot schon', () => {
    const wertung = endwertung(false, [[['Rot', 'Rot']], [['Rot', 'Rot', 'Rot']]])
    expect(wertung.spieler.map((s) => s.kette)).toEqual([
      { laenge: 0, bonus: 0 },
      { laenge: 3, bonus: 5 },
    ])
  })

  it('D24: hat niemand eine Kette ab 3, bekommt niemand den Bonus (auch nicht bei Gleichstand mit 2)', () => {
    const wertung = endwertung(false, [[['Rot', 'Rot', 'Blau']], [['Gelb', 'Gelb']], [['Grün']]])
    expect(wertung.spieler.map((s) => s.kette)).toEqual([
      { laenge: 0, bonus: 0 },
      { laenge: 0, bonus: 0 },
      { laenge: 0, bonus: 0 },
    ])
  })

  it('D24: Sonderkarten zählen nicht mit; Rot-Rot-Regenbogenschlange ist keine Kette', () => {
    const wertung = endwertung(false, [[['Rot', 'Rot', 'Regenbogenschlange']], [['Gelb']]])
    expect(wertung.spieler[0].kette).toEqual({ laenge: 0, bonus: 0 })
    expect(wertung.spieler[0].gruppenPunkte).toBe(2)
  })

  it('D24: wer keine Kette hat, bekommt den Bonus nie; ein Spieler ohne Schlange auch nicht', () => {
    const wertung = endwertung(false, [[], [['Gelb', 'Gelb', 'Gelb']]])
    expect(wertung.spieler[0].kette).toEqual({ laenge: 0, bonus: 0 })
    expect(wertung.spieler[0].summe).toBe(0)
    expect(wertung.spieler[1].kette).toEqual({ laenge: 3, bonus: 5 })
  })
})
