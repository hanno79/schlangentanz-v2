import { describe, expect, it } from 'vitest'
import { berechneEndwertung, berechneZwischenstand, deserialisiere, serialisiere } from '../index'
import type { Spielzustand } from '../index'
import { endwertung, erfuellt, geheim, jokerfarben, nacheinander, tisch } from './wertung_hilfe'

/*
E10, Satz für Satz: A11 (Siegbedingung, Abschnitt 4 Aufgaben), A9 (geheime
Aufgabe erst bei der Wertung), D22 (Gleichstand), dazu Zwischenstand und
Endwertung mit Aufschlüsselung (Plan E10, Kriterium 6), die entfernte
Endspurt-Verdopplung (C11) und die feste Wahl bei gleich guten Jokerfarben
(Kriterium 8).
*/

describe('A11: Sieg und Gleichstand', () => {
  it('A11: es gewinnt der Spieler mit den meisten Punkten', () => {
    const wertung = endwertung(false, [[['Blau', 'Blau', 'Blau']], [['Grün', 'Grün', 'Grün']], [['Rot', 'Rot']]])
    expect(wertung.spieler.map((s) => s.summe)).toEqual([3 + 5, 9 + 5, 0])
    expect(wertung.hoechstePunktzahl).toBe(14)
    expect(wertung.gewinner).toEqual([wertung.spieler[1].spielerId])
  })

  it('D22: bei Gleichstand gewinnen alle Punktgleichen', () => {
    const wertung = endwertung(false, [[['Blau', 'Blau', 'Blau']], [['Rot', 'Rot', 'Rot']], [['Violett', 'Violett']]])
    expect(wertung.spieler.map((s) => s.summe)).toEqual([8, 8, 0])
    expect(wertung.gewinner).toEqual([wertung.spieler[0].spielerId, wertung.spieler[1].spielerId])
  })

  it('D22: haben alle 0 Punkte, gewinnen alle', () => {
    const wertung = endwertung(false, [[], []])
    expect(wertung.gewinner).toEqual(wertung.spieler.map((s) => s.spielerId))
  })

  it('A11: Spieler ohne Schlange hat 0 Gruppenpunkte, keine Kette und keinen Vielfaltbonus', () => {
    const wertung = endwertung(true, [[], [['Rot', 'Rot', 'Rot']]]).spieler[0]
    expect(wertung.schlangen).toEqual([])
    expect(wertung.gruppenPunkte).toBe(0)
    expect(wertung.vielfaltBonus).toBe(0)
    expect(wertung.kette).toEqual({ laenge: 0, bonus: 0 })
    expect(wertung.summe).toBe(0)
  })
})

describe('A11: Aufgabenkarten [Erweiterung]', () => {
  it('A11: die Punkte erfüllter offener Aufgaben zählen', () => {
    const wertung = endwertung(true, [[], []], nacheinander(erfuellt(0, 'Farbkombination'), erfuellt(0, 'Lila Riese'))).spieler[0]
    expect(wertung.aufgaben?.map((a) => [a.name, a.punkte, a.geheim])).toEqual([
      ['Farbkombination', 5, false],
      ['Lila Riese', 5, false],
    ])
    expect(wertung.aufgabenPunkte).toBe(10)
    expect(wertung.summe).toBe(10)
  })

  it('A11: die geheime Aufgabe zählt, wenn sie erfüllt wurde', () => {
    const wertung = endwertung(true, [[], []], geheim(0, 'Farbharmonie', true)).spieler[0]
    expect(wertung.aufgaben).toEqual([expect.objectContaining({ name: 'Farbharmonie', punkte: 10, geheim: true })])
    expect(wertung.summe).toBe(10)
  })

  it('A11: eine nicht erfüllte geheime Aufgabe zählt nicht', () => {
    const wertung = endwertung(true, [[], []], geheim(0, 'Farbharmonie', false)).spieler[0]
    expect(wertung.aufgaben).toEqual([])
    expect(wertung.aufgabenPunkte).toBe(0)
  })

  it('A11: Aufgabenpunkte zählen nur mit Erweiterung', () => {
    const ohne = endwertung(false, [[['Blau', 'Blau', 'Blau']], []]).spieler[0]
    expect(ohne.aufgaben).toBeNull()
    expect(ohne.aufgabenPunkte).toBe(0)
    // Ein Zustand ohne Erweiterung mit einer Aufgabe verletzt eine Invariante (A4); die Wertung zählt sie trotzdem nicht.
    const zustand = tisch(true, [[], []], erfuellt(0, 'Gelber Schatz'))
    const verfaelscht: Spielzustand = { ...zustand, erweiterung: false }
    expect(berechneEndwertung(verfaelscht).spieler[0].aufgabenPunkte).toBe(0)
  })

  it('C11: keine Endspurt-Verdopplung; in der Schlussrunde und nach Spielende zählt jede Aufgabe einfach', () => {
    const schritte = nacheinander(erfuellt(0, 'Farbkombination'), geheim(0, 'Gelber Schatz', true))
    const beendet = endwertung(true, [[], []], (bau) => schritte(bau).beendet(1)).spieler[0]
    const schlussrunde = endwertung(true, [[], []], (bau) => schritte(bau).schlussrunde(1)).spieler[0]
    expect(beendet.aufgabenPunkte).toBe(5 + 5)
    expect(schlussrunde.aufgabenPunkte).toBe(5 + 5)
  })
})

describe('A11/A9: Zwischenstand und Endwertung (E10, Kriterium 6)', () => {
  const schritte = nacheinander(erfuellt(1, 'Farbkombination'), geheim(0, 'Gelber Schatz', true), geheim(1, 'Farbharmonie', true))
  const zustand = tisch(true, [[['Blau', 'Blau', 'Blau', 'Blau']], [['Rot', 'Rot', 'Rot']]], schritte)

  it('A9: im Zwischenstand zählt die eigene erfüllte geheime Aufgabe, eine fremde nicht', () => {
    const sicht0 = berechneZwischenstand(zustand, zustand.spieler[0].id)
    expect(sicht0.betrachterId).toBe(zustand.spieler[0].id)
    expect(sicht0.spieler[0].aufgabenPunkte).toBe(5)
    expect(sicht0.spieler[1].aufgabenPunkte).toBe(5)
    expect(sicht0.spieler[1].aufgaben?.some((a) => a.geheim)).toBe(false)
    const sicht1 = berechneZwischenstand(zustand, zustand.spieler[1].id)
    expect(sicht1.spieler[0].aufgabenPunkte).toBe(0)
    expect(sicht1.spieler[1].aufgabenPunkte).toBe(5 + 10)
  })

  it('A11: der Zwischenstand hat keinen Kettenbonus, die Endwertung schon', () => {
    const sicht0 = berechneZwischenstand(zustand, zustand.spieler[0].id)
    expect(sicht0.spieler.map((s) => s.kette)).toEqual([null, null])
    expect(sicht0.spieler.map((s) => s.summe)).toEqual([4 + 5, 3 + 5])
  })

  it('A11/A9: die Endwertung deckt alle geheimen Aufgaben auf und zählt den Kettenbonus', () => {
    const wertung = berechneEndwertung(zustand)
    expect(wertung.spieler.map((s) => s.kette)).toEqual([
      { laenge: 4, bonus: 5 },
      { laenge: 3, bonus: 0 },
    ])
    expect(wertung.spieler.map((s) => s.aufgabenPunkte)).toEqual([5, 15])
    expect(wertung.spieler.map((s) => s.summe)).toEqual([4 + 5 + 5, 3 + 15])
    expect(wertung.gewinner).toEqual([zustand.spieler[1].id])
  })

  it('A11: die Aufschlüsselung nennt Gruppen je Schlange, Farbe jedes Jokers, Vielfaltbonus, Kette, Aufgaben und Summe', () => {
    const z = tisch(true, [[['Gelb', 'Gelb', 'Regenbogenschlange', 'Grün'], ['Rot', 'Rot', 'Rot', 'Blau', 'Blau', 'Blau']]])
    const s = berechneEndwertung(z).spieler[0]
    expect(s.spielerId).toBe(z.spieler[0].id)
    expect(s.name).toBe(z.spieler[0].name)
    expect(s.schlangen.map((schlange) => schlange.schlangenId)).toEqual(z.spieler[0].schlangen.map((schlange) => schlange.id))
    expect(s.schlangen[0]).toEqual({
      schlangenId: z.spieler[0].schlangen[0].id,
      gruppen: [
        {
          farbe: 'Gelb',
          startIndex: 0,
          endIndex: 2,
          laenge: 3,
          kartenIds: z.spieler[0].schlangen[0].karten.slice(0, 3).map((k) => k.id),
          punkte: 2,
        },
      ],
      gruppenPunkte: 2,
      joker: [{ karteId: z.spieler[0].schlangen[0].karten[2].id, art: 'Regenbogenschlange', farbe: 'Gelb' }],
      vielfaltFarben: ['Gelb'],
      vielfaltBonus: 0,
    })
    expect(s.schlangen[1].vielfaltBonus).toBe(1)
    expect(s).toMatchObject({ gruppenPunkte: 2 + 6, vielfaltBonus: 1, kette: { laenge: 3, bonus: 5 }, aufgaben: [], aufgabenPunkte: 0 })
    expect(s.summe).toBe(2 + 6 + 1 + 5)
  })

  it('A11: die Summe ist Gruppenpunkte + Vielfaltbonus + Kettenbonus + Aufgabenpunkte', () => {
    const wertung = berechneEndwertung(zustand)
    for (const s of wertung.spieler) {
      expect(s.summe).toBe(s.gruppenPunkte + (s.vielfaltBonus ?? 0) + (s.kette?.bonus ?? 0) + s.aufgabenPunkte)
      expect(s.gruppenPunkte).toBe(s.schlangen.reduce((summe, schlange) => summe + schlange.gruppenPunkte, 0))
    }
  })

  it('A11: ein unbekannter Betrachter wird mit Grund abgelehnt', () => {
    expect(() => berechneZwischenstand(zustand, 'niemand')).toThrow(/niemand/)
  })
})

describe('A11/A7.7: gleich gute Jokerfarben werden immer gleich gewählt (E10, Kriterium 8)', () => {
  it('A7.7 Beispiel 2: die Fusion zwischen Blau-Blau und Rot-Rot zählt als Blau, Reihenfolge Blau, Rot, Gelb, Violett, Braun, Grün', () => {
    const vorwaerts = endwertung(true, [[['Blau', 'Blau', { fusion: ['Gelb', 'Gelb'] }, 'Rot', 'Rot']]]).spieler[0]
    const rueckwaerts = endwertung(true, [[['Rot', 'Rot', { fusion: ['Gelb', 'Gelb'] }, 'Blau', 'Blau']]]).spieler[0]
    expect(jokerfarben(vorwaerts)).toEqual(['Blau'])
    expect(jokerfarben(rueckwaerts)).toEqual(['Blau'])
  })

  it('A11: bei mehreren gleich guten Jokern wird von vorn nach hinten je die erste Farbe der Reihenfolge gewählt', () => {
    const wertung = endwertung(false, [[['Blau', 'Blau', 'Regenbogenschlange', 'Gelb', 'Gelb', 'Regenbogenschlange', 'Rot', 'Rot']]]).spieler[0]
    expect(jokerfarben(wertung)).toEqual(['Blau', 'Rot'])
    expect(wertung.gruppenPunkte).toBe(4)
  })

  it('A11: bei gleicher Summe liegen möglichst viele Joker in einer Gruppe; die Regenbogenschlange verlängert Braun', () => {
    // Als Braun oder als jede andere Farbe bringt sie 0 Punkte; Blau käme in der Reihenfolge zuerst.
    const wertung = endwertung(false, [[['Braun', 'Braun', 'Braun', 'Regenbogenschlange']]]).spieler[0]
    expect(jokerfarben(wertung)).toEqual(['Braun'])
    expect(wertung.schlangen[0].gruppen.map((g) => g.laenge)).toEqual([4])
  })

  it('A11: dieselbe Stellung ergibt dieselbe Wahl, auch nach Speichern und Laden', () => {
    const z = tisch(true, [[['Braun', 'Braun', { fusion: ['Blau', 'Blau'] }, 'Violett', 'Violett']], [['Grün', 'Regenbogenschlange', 'Grün']]])
    const erste = berechneEndwertung(z)
    expect(berechneEndwertung(z)).toEqual(erste)
    expect(berechneEndwertung(deserialisiere(serialisiere(z)))).toEqual(erste)
    expect(jokerfarben(erste.spieler[0])).toEqual(['Violett'])
  })
})
