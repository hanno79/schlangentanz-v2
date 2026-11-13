import { describe, expect, it } from 'vitest'
import type { Farbe } from '../index'
import { eineSchlange, endwertung, erfuellt, gruppen, jokerfarben } from './wertung_hilfe'

/*
E10, Satz für Satz: A11 Abschnitt 1 (Farbgruppen), die Wertungssätze aus A7.3
(Regenbogenschlange) und A7.7 (Farbenfusion), D1. Jedes Rechenbeispiel der
Website ist ein eigener Test.
*/

describe('A11: Farbgruppen', () => {
  it('A11: eine Farbgruppe hat mindestens drei Karten; zwei gleiche Karten zählen nicht', () => {
    expect(eineSchlange(['Blau', 'Blau']).gruppenPunkte).toBe(0)
    expect(eineSchlange(['Blau', 'Blau', 'Blau']).gruppenPunkte).toBe(3)
  })

  it('A11: die Karten einer Gruppe liegen nebeneinander; eine andere Farbe dazwischen trennt', () => {
    const wertung = eineSchlange(['Blau', 'Blau', 'Rot', 'Blau'])
    expect(wertung.gruppenPunkte).toBe(0)
    expect(gruppen(wertung)).toEqual([])
  })

  it('A11: eine Gruppe liegt in einer Schlange; zwei Schlangen ergeben zusammen keine Gruppe', () => {
    const wertung = endwertung(false, [[['Rot', 'Rot'], ['Rot', 'Rot']]]).spieler[0]
    expect(wertung.gruppenPunkte).toBe(0)
  })

  it('A11: eine Schlangenblockade dazwischen trennt (sie ist keine Karte der Farbe)', () => {
    expect(eineSchlange(['Gelb', 'Gelb', 'Schlangenblockade', 'Gelb']).gruppenPunkte).toBe(0)
    expect(eineSchlange(['Gelb', 'Gelb', 'Gelb', 'Schlangenblockade', 'Gelb']).gruppenPunkte).toBe(3)
  })

  it('A11: eine Vierergruppe zählt einmal mit ihrer ganzen Länge, nicht zusätzlich als Dreiergruppe', () => {
    const wertung = eineSchlange(['Rot', 'Rot', 'Rot', 'Rot'])
    expect(gruppen(wertung)).toEqual(['Rot×4=4'])
    expect(wertung.gruppenPunkte).toBe(4)
  })

  it('A11: eine Fünfergruppe zählt einmal, nicht als Dreier- und Vierergruppe', () => {
    const wertung = eineSchlange(['Violett', 'Violett', 'Violett', 'Violett', 'Violett'])
    expect(gruppen(wertung)).toEqual(['Violett×5=10'])
  })

  it('A11/D1: Beispiel Rot-Rot-Rot-Blau-Rot-Rot-Rot-Rot bringt für Rot 3 + 4 = 7 Punkte', () => {
    const wertung = eineSchlange(['Rot', 'Rot', 'Rot', 'Blau', 'Rot', 'Rot', 'Rot', 'Rot'])
    expect(gruppen(wertung)).toEqual(['Rot×3=3', 'Rot×4=4'])
    expect(wertung.gruppenPunkte).toBe(7)
  })

  it('A11/D1: getrennte Gruppen derselben Farbe in verschiedenen Schlangen zählen je voll', () => {
    const wertung = endwertung(false, [[['Grün', 'Grün', 'Grün'], ['Grün', 'Grün', 'Grün']]]).spieler[0]
    expect(gruppen(wertung)).toEqual(['Grün×3=9', 'Grün×3=9'])
    expect(wertung.gruppenPunkte).toBe(18)
  })

  it.each<[Farbe, number]>([
    ['Blau', 1],
    ['Rot', 1],
    ['Gelb', 1],
    ['Violett', 2],
    ['Braun', 2],
    ['Grün', 3],
  ])('A11: %s bringt %i Punkt(e) pro Karte in der Gruppe', (farbe, proKarte) => {
    expect(eineSchlange([farbe, farbe, farbe]).gruppenPunkte).toBe(3 * proKarte)
    expect(eineSchlange([farbe, farbe, farbe, farbe]).gruppenPunkte).toBe(4 * proKarte)
  })

  it('A11 Beispiel 1: Blau-Blau-Blau-Rot-Rot-Rot-Rot ergibt 7 Punkte (3 + 4)', () => {
    const wertung = eineSchlange(['Blau', 'Blau', 'Blau', 'Rot', 'Rot', 'Rot', 'Rot'])
    expect(gruppen(wertung)).toEqual(['Blau×3=3', 'Rot×4=4'])
    expect(wertung.gruppenPunkte).toBe(7)
  })

  it('A11 Beispiel 2: Blau, Blau, Blau+Fusion+Blau, Violett, Violett ergibt 6 Punkte; die Fusion zählt als Violett', () => {
    const wertung = eineSchlange(['Blau', 'Blau', { fusion: ['Blau', 'Blau'] }, 'Violett', 'Violett'])
    expect(gruppen(wertung)).toEqual(['Violett×3=6'])
    expect(jokerfarben(wertung)).toEqual(['Violett'])
    expect(wertung.gruppenPunkte).toBe(6)
  })

  it('A11: Regenbogenschlange und Farbenfusion können eine Gruppe vervollständigen', () => {
    expect(gruppen(eineSchlange(['Gelb', 'Gelb', 'Regenbogenschlange']))).toEqual(['Gelb×3=2'])
    expect(gruppen(eineSchlange(['Gelb', { fusion: ['Rot', 'Rot'] }, 'Gelb']))).toEqual(['Gelb×3=4'])
  })

  it('A11: Regenbogenschlange und Farbenfusion können eine Gruppe verlängern', () => {
    expect(gruppen(eineSchlange(['Braun', 'Braun', 'Braun', 'Regenbogenschlange']))).toEqual(['Braun×4=6'])
    expect(gruppen(eineSchlange(['Braun', 'Braun', 'Braun', { fusion: ['Blau', 'Blau'] }]))).toEqual(['Braun×4=8'])
  })

  it('A11: Joker zählen als die Farbe, die die meisten Punkte bringt, auch wenn die Nachbarn links stehen', () => {
    const wertung = eineSchlange(['Grün', 'Grün', 'Regenbogenschlange', 'Blau', 'Blau'])
    expect(jokerfarben(wertung)).toEqual(['Grün'])
    expect(wertung.gruppenPunkte).toBe(6)
  })

  it('A11: wofür ein Joker bei einer Aufgabe gezählt hat, spielt keine Rolle (der Zustand kennt keine Jokerfarbe)', () => {
    // Farbvielfalt (A9: Blau, Rot, Gelb, Braun, Grün und die Regenbogenschlange als Violett) ist erfüllt;
    // in der Wertung zählt die Regenbogenschlange als Grün (Gruppe Grün×4).
    const zustand = endwertung(true, [[['Blau', 'Rot', 'Gelb', 'Braun', 'Grün', 'Regenbogenschlange', 'Grün', 'Grün']]], erfuellt(0, 'Farbvielfalt'))
    expect(zustand.spieler[0].aufgaben?.map((a) => a.name)).toEqual(['Farbvielfalt'])
    expect(jokerfarben(zustand.spieler[0])).toEqual(['Grün'])
    expect(zustand.spieler[0].gruppenPunkte).toBe(9)
  })

  it('A11: eine Regenbogenschlange selbst bringt keine Punkte, ermöglicht aber eine längere Gruppe', () => {
    expect(eineSchlange(['Grün', 'Grün', 'Grün', 'Regenbogenschlange', 'Grün']).gruppenPunkte).toBe(12)
  })

  it('A11: eine Farbenfusion bringt die Punkte der beiden fusionierten Karten, wenn sie in einer Gruppe zählt', () => {
    expect(eineSchlange(['Rot', 'Rot', { fusion: ['Grün', 'Grün'] }]).gruppenPunkte).toBe(8)
  })

  it('A11: eine Farbenfusion ausserhalb einer Gruppe bringt nichts', () => {
    expect(eineSchlange(['Rot', { fusion: ['Grün', 'Grün'] }, 'Schlangenblockade', 'Blau']).gruppenPunkte).toBe(0)
  })

  it('A11: Joker in zwei getrennten Gruppen zählen je für ihre Gruppe', () => {
    const wertung = eineSchlange(['Blau', 'Blau', 'Regenbogenschlange', 'Schlangenblockade', 'Regenbogenschlange', 'Rot', 'Rot'])
    expect(gruppen(wertung)).toEqual(['Blau×3=2', 'Rot×3=2'])
    expect(jokerfarben(wertung)).toEqual(['Blau', 'Rot'])
  })
})

describe('A7.3: Regenbogenschlange in der Wertung', () => {
  it('A7.3 Beispiel 1: Blau-Blau-Regenbogenschlange ist eine Dreiergruppe mit 2 Punkten', () => {
    const wertung = eineSchlange(['Blau', 'Blau', 'Regenbogenschlange'])
    expect(gruppen(wertung)).toEqual(['Blau×3=2'])
    expect(jokerfarben(wertung)).toEqual(['Blau'])
  })

  it('A7.3 Beispiel 3: Rot-Rot-Regenbogenschlange-Braun-Braun bringt 4 Punkte, die Regenbogenschlange zählt als Braun', () => {
    const wertung = eineSchlange(['Rot', 'Rot', 'Regenbogenschlange', 'Braun', 'Braun'])
    expect(gruppen(wertung)).toEqual(['Braun×3=4'])
    expect(jokerfarben(wertung)).toEqual(['Braun'])
    expect(wertung.summe).toBe(4)
  })

  it('A7.3: gilt als Karte der Farbe, die für den Spieler am vorteilhaftesten ist', () => {
    expect(jokerfarben(eineSchlange(['Gelb', 'Gelb', 'Regenbogenschlange', 'Violett', 'Violett']))).toEqual(['Violett'])
    expect(jokerfarben(eineSchlange(['Violett', 'Violett', 'Regenbogenschlange', 'Gelb', 'Gelb']))).toEqual(['Violett'])
  })

  it('A7.3: die Farbe ist nie festgelegt und kann sich während des Spiels ändern', () => {
    const vorher = eineSchlange(['Blau', 'Blau', 'Regenbogenschlange', 'Violett'])
    const nachher = eineSchlange(['Blau', 'Blau', 'Regenbogenschlange', 'Violett', 'Violett'])
    expect(jokerfarben(vorher)).toEqual(['Blau'])
    expect(jokerfarben(nachher)).toEqual(['Violett'])
  })

  it('A7.3: verbindet Farbgruppen, indem sie als Karte der gewünschten Farbe zählt', () => {
    const wertung = eineSchlange(['Blau', 'Blau', 'Regenbogenschlange', 'Blau', 'Blau'])
    expect(gruppen(wertung)).toEqual(['Blau×5=4'])
  })

  it('A7.3: muss Teil einer Dreiergruppe sein; mit nur einer Nachbarkarte entsteht keine Gruppe', () => {
    expect(eineSchlange(['Grün', 'Regenbogenschlange']).gruppenPunkte).toBe(0)
    expect(jokerfarben(eineSchlange(['Grün', 'Regenbogenschlange']))).toEqual([null])
  })

  it('A7.3: die anderen Karten der Gruppe bringen ihre normalen Punkte', () => {
    expect(eineSchlange(['Violett', 'Regenbogenschlange', 'Violett']).gruppenPunkte).toBe(4)
  })

  it.each<Farbe>(['Blau', 'Rot', 'Gelb', 'Violett', 'Braun', 'Grün'])(
    'A7.3: kann als beliebige der sechs Farben gewertet werden, hier als %s',
    (farbe) => {
      const wertung = eineSchlange([farbe, farbe, 'Regenbogenschlange'])
      expect(jokerfarben(wertung)).toEqual([farbe])
      expect(gruppen(wertung)).toEqual([`${farbe}×3=${wertung.gruppenPunkte}`])
    },
  )

  it('A7.3: unterbricht keine Farbreihe, wenn sie als passende Farbe genutzt wird', () => {
    expect(gruppen(eineSchlange(['Rot', 'Regenbogenschlange', 'Rot', 'Rot']))).toEqual(['Rot×4=3'])
  })
})

describe('A7.7: Farbenfusion in der Wertung', () => {
  it('A7.7 Beispiel 1: Blau-Blau und eine Fusion auf zwei gelben Karten gilt als Karte beliebiger Farbe, hier Blau', () => {
    const wertung = eineSchlange(['Blau', 'Blau', { fusion: ['Gelb', 'Gelb'] }])
    expect(jokerfarben(wertung)).toEqual(['Blau'])
    expect(gruppen(wertung)).toEqual(['Blau×3=4'])
  })

  it('A7.7 Beispiel 2: Blau-Blau-Fusion(Gelb-Gelb)-Rot-Rot ergibt eine Dreiergruppe mit 4 Punkten', () => {
    const wertung = eineSchlange(['Blau', 'Blau', { fusion: ['Gelb', 'Gelb'] }, 'Rot', 'Rot'])
    expect(wertung.gruppenPunkte).toBe(4)
    expect(wertung.schlangen[0].gruppen).toHaveLength(1)
  })

  it('A7.7: zählt als eine einzelne Karte; Blau und eine Fusion sind nur zwei Karten', () => {
    expect(eineSchlange(['Blau', { fusion: ['Blau', 'Blau'] }]).gruppenPunkte).toBe(0)
    expect(gruppen(eineSchlange(['Blau', { fusion: ['Blau', 'Blau'] }, 'Blau']))).toEqual(['Blau×3=4'])
  })

  it('A7.7: die Karten unter der Fusion zählen nicht einzeln als Gruppe', () => {
    expect(eineSchlange(['Grün', { fusion: ['Grün', 'Grün'] }]).gruppenPunkte).toBe(0)
  })

  it('A7.7: zählt als Karte einer beliebigen Farbe, auch einer anderen als der Karten darunter', () => {
    const wertung = eineSchlange(['Braun', 'Braun', { fusion: ['Rot', 'Rot'] }])
    expect(jokerfarben(wertung)).toEqual(['Braun'])
    expect(wertung.gruppenPunkte).toBe(6)
  })
})
