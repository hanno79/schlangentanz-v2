import { describe, expect, it } from 'vitest'
import { eineSchlange, endwertung, jokerfarben } from '../wertung_hilfe'

/*
E10, Satz für Satz: A11 Abschnitt 2 (Vielfaltbonus, nur mit Erweiterung) und die
Sätze aus A7.3 und A7.7, die den Vielfaltbonus betreffen. E10b: D32 (eine Gruppe
nur aus Regenbogenschlangen bringt keine Farbe).
*/

/** Der Spieler hat in jedem Test hier eine Kette ab 3 Karten, der Mitspieler keine Schlange: 5 Bonuspunkte (A11). */
const KETTE = 5

const DREI_FARBEN = ['Rot', 'Rot', 'Rot', 'Violett', 'Violett', 'Violett', 'Braun', 'Braun', 'Braun'] as const

describe('A11: Vielfaltbonus [Erweiterung]', () => {
  it('A11 Vielfalt Beispiel 1: Dreiergruppen in Rot, Violett und Braun ergeben 2 Bonuspunkte', () => {
    const wertung = eineSchlange([...DREI_FARBEN], true)
    expect(wertung.schlangen[0].vielfaltFarben).toEqual(['Rot', 'Violett', 'Braun'])
    expect(wertung.vielfaltBonus).toBe(2)
    expect(wertung.summe).toBe(3 + 6 + 6 + 2 + KETTE)
  })

  it('A11 Vielfalt Beispiel 2: Blau³, Rot-Regenbogenschlange-Rot, Violett³ ergeben 2 Bonuspunkte; die Regenbogenschlange zählt als Rot', () => {
    const wertung = eineSchlange(
      ['Blau', 'Blau', 'Blau', 'Rot', 'Regenbogenschlange', 'Rot', 'Violett', 'Violett', 'Violett'],
      true,
    )
    expect(jokerfarben(wertung)).toEqual(['Rot'])
    expect(wertung.schlangen[0].vielfaltFarben).toEqual(['Blau', 'Rot', 'Violett'])
    expect(wertung.vielfaltBonus).toBe(2)
  })

  it('A11: ohne Erweiterung gibt es keinen Vielfaltbonus', () => {
    const wertung = eineSchlange([...DREI_FARBEN], false)
    expect(wertung.vielfaltBonus).toBeNull()
    expect(wertung.schlangen[0].vielfaltBonus).toBeNull()
    expect(wertung.summe).toBe(15 + KETTE)
  })

  it('A11: Voraussetzung sind Gruppen ab 3 Karten; zwei Karten einer Farbe zählen nicht als Farbe', () => {
    const wertung = eineSchlange(['Rot', 'Rot', 'Rot', 'Blau', 'Blau', 'Gelb', 'Gelb'], true)
    expect(wertung.schlangen[0].vielfaltFarben).toEqual(['Rot'])
    expect(wertung.vielfaltBonus).toBe(0)
  })

  it('A11: für die Berechnung zählt nur die längste Gruppe jeder Farbe; zwei rote Gruppen sind eine Farbe', () => {
    const wertung = eineSchlange(['Rot', 'Rot', 'Rot', 'Blau', 'Rot', 'Rot', 'Rot', 'Rot'], true)
    expect(wertung.schlangen[0].vielfaltFarben).toEqual(['Rot'])
    expect(wertung.vielfaltBonus).toBe(0)
  })

  it.each([
    [1, 0],
    [2, 1],
    [3, 2],
    [4, 3],
    [5, 4],
    [6, 4],
  ])('A11: %i verschiedene Farben mit gültigen Gruppen ergeben %i Bonuspunkte (5 und 6 beide 4)', (anzahl, bonus) => {
    const farben = (['Blau', 'Rot', 'Gelb', 'Violett', 'Braun', 'Grün'] as const).slice(0, anzahl)
    const wertung = eineSchlange(farben.flatMap((farbe) => [farbe, farbe, farbe]), true)
    expect(wertung.schlangen[0].vielfaltFarben).toHaveLength(anzahl)
    expect(wertung.vielfaltBonus).toBe(bonus)
  })

  it('A11: der Bonus wird je Schlange ermittelt, nur der höchste zählt (nicht die Summe, nicht über beide Schlangen)', () => {
    const wertung = endwertung(true, [
      [
        ['Blau', 'Blau', 'Blau', 'Rot', 'Rot', 'Rot'],
        ['Gelb', 'Gelb', 'Gelb', 'Violett', 'Violett', 'Violett', 'Braun', 'Braun', 'Braun'],
      ],
    ]).spieler[0]
    expect(wertung.schlangen.map((s) => s.vielfaltBonus)).toEqual([1, 2])
    expect(wertung.vielfaltBonus).toBe(2)
  })

  it('A11: Farben in verschiedenen Schlangen werden nicht zusammengezählt', () => {
    const wertung = endwertung(true, [[['Blau', 'Blau', 'Blau'], ['Rot', 'Rot', 'Rot']]]).spieler[0]
    expect(wertung.schlangen.map((s) => s.vielfaltBonus)).toEqual([0, 0])
    expect(wertung.vielfaltBonus).toBe(0)
  })

  it('A11: eine Gruppe mit einem Joker ist eine gültige Gruppe dieser Farbe (Farbenfusion)', () => {
    const wertung = eineSchlange(['Grün', 'Grün', 'Grün', 'Gelb', { fusion: ['Blau', 'Blau'] }, 'Gelb'], true)
    expect(wertung.schlangen[0].vielfaltFarben).toEqual(['Gelb', 'Grün'])
    expect(wertung.vielfaltBonus).toBe(1)
  })

  it('A7.7: die Farbenfusion zählt nur als eine Farbe für den Vielfaltbonus, nicht für beide Nachbargruppen', () => {
    const wertung = eineSchlange(['Blau', 'Blau', { fusion: ['Gelb', 'Gelb'] }, 'Rot', 'Rot'], true)
    expect(wertung.schlangen[0].gruppen).toHaveLength(1)
    expect(wertung.vielfaltBonus).toBe(0)
  })

  it('A7.3/A11: die Regenbogenschlange zählt für Gruppenpunkte und Vielfaltbonus als dieselbe Farbe', () => {
    const wertung = eineSchlange(['Blau', 'Blau', 'Blau', 'Gelb', 'Blau', 'Blau', 'Regenbogenschlange', 'Rot', 'Rot'], true)
    const [joker] = wertung.schlangen[0].joker
    const gruppeMitJoker = wertung.schlangen[0].gruppen.find((g) => g.kartenIds.includes(joker.karteId))
    expect(gruppeMitJoker?.farbe).toBe(joker.farbe)
    expect(wertung.schlangen[0].vielfaltFarben).toContain(joker.farbe)
  })
})

describe('A11/A7.3/A7.7: Joker zählen als die Farbe, die insgesamt die meisten Punkte bringt (Gruppen und Vielfaltbonus)', () => {
  it('A11: bei gleichen Gruppenpunkten entscheidet der Vielfaltbonus die Jokerfarbe', () => {
    // Blau ist schon eine Gruppe. Als Blau brächte die Regenbogenschlange 2 Punkte und keine neue Farbe,
    // als Rot ebenfalls 2 Punkte und eine zweite Farbe: 1 Bonuspunkt mehr.
    const wertung = eineSchlange(['Blau', 'Blau', 'Blau', 'Gelb', 'Blau', 'Blau', 'Regenbogenschlange', 'Rot', 'Rot'], true)
    expect(jokerfarben(wertung)).toEqual(['Rot'])
    expect(wertung.gruppenPunkte).toBe(5)
    expect(wertung.vielfaltBonus).toBe(1)
    expect(wertung.summe).toBe(5 + 1 + KETTE)
  })

  it('A11: ohne Erweiterung zählt nur die Gruppenwertung, bei Gleichstand die feste Reihenfolge (Blau vor Rot)', () => {
    const wertung = eineSchlange(['Blau', 'Blau', 'Blau', 'Gelb', 'Blau', 'Blau', 'Regenbogenschlange', 'Rot', 'Rot'], false)
    expect(jokerfarben(wertung)).toEqual(['Blau'])
    expect(wertung.summe).toBe(5 + KETTE)
  })

  it('A11: die Jokerfarbe einer Schlange richtet sich nach dem Bonus der anderen Schlange (nur der höchste zählt)', () => {
    // Allein wäre die Regenbogenschlange Rot (zweite Farbe, Bonus 1). Schlange 2 hat aber schon 3 Farben (Bonus 2);
    // eine zweite Farbe in Schlange 1 hebt den höchsten Bonus nicht. Blau und Rot sind dann gleich gut,
    // es gilt die feste Reihenfolge: Blau.
    const wertung = endwertung(true, [
      [
        ['Blau', 'Blau', 'Blau', 'Gelb', 'Blau', 'Blau', 'Regenbogenschlange', 'Rot', 'Rot'],
        ['Gelb', 'Gelb', 'Gelb', 'Violett', 'Violett', 'Violett', 'Braun', 'Braun', 'Braun'],
      ],
    ]).spieler[0]
    expect(jokerfarben(wertung)).toEqual(['Blau'])
    expect(wertung.schlangen.map((s) => s.vielfaltBonus)).toEqual([0, 2])
    expect(wertung.vielfaltBonus).toBe(2)
    expect(wertung.summe).toBe(5 + 15 + 2 + KETTE)
  })

  it('A11: der Bonus der ersten Schlange bleibt der höchste, auch wenn die zweite weniger Farben hat (Codex-Befund)', () => {
    // Schlange 1 erreicht mit der Regenbogenschlange als Rot zwei Farben (Bonus 1), Schlange 2 hat nur Gelb (Bonus 0).
    // Nur wenn der Bonus von Schlange 1 über das Schlangenende hinaus zählt, ist Rot besser als Blau.
    const wertung = endwertung(true, [
      [
        ['Blau', 'Blau', 'Blau', 'Gelb', 'Blau', 'Blau', 'Regenbogenschlange', 'Rot', 'Rot'],
        ['Gelb', 'Gelb', 'Gelb'],
      ],
    ]).spieler[0]
    expect(jokerfarben(wertung)).toEqual(['Rot'])
    expect(wertung.schlangen.map((s) => s.vielfaltBonus)).toEqual([1, 0])
    expect(wertung.summe).toBe(5 + 3 + 1 + KETTE)
  })

  it('A11: Gruppenpunkte und Vielfaltbonus werden gemeinsam am höchsten, nicht nacheinander', () => {
    // Gelb-Regenbogenschlange-Regenbogenschlange-Violett: als Violett 2 Gruppenpunkte, als Gelb nur 1,
    // aber Gelb ist eine neue Farbe. Die Summe ist gleich; bei gleicher Summe gilt die feste Reihenfolge (Gelb vor Violett).
    const wertung = eineSchlange(
      ['Violett', 'Violett', 'Violett', 'Blau', 'Gelb', 'Regenbogenschlange', 'Regenbogenschlange', 'Violett'],
      true,
    )
    expect(wertung.summe).toBe(6 + 2 + 0 + KETTE)
    expect(jokerfarben(wertung)).toEqual(['Gelb', 'Gelb'])
    expect(wertung.gruppenPunkte).toBe(7)
    expect(wertung.vielfaltBonus).toBe(1)
  })
})

describe('D32: eine Gruppe nur aus Regenbogenschlangen bringt keine Farbe für den Vielfaltbonus', () => {
  const ROT_BLAU_GELB = ['Rot', 'Rot', 'Rot', 'Blau', 'Blau', 'Blau', 'Gelb', 'Gelb', 'Gelb'] as const
  const DREI_REGENBOGEN = ['Regenbogenschlange', 'Regenbogenschlange', 'Regenbogenschlange'] as const

  it('D32: Rot-, Blau- und Gelbgruppe und eine Gruppe aus drei Regenbogenschlangen zählen 3 Farben, nicht 4', () => {
    const wertung = eineSchlange([...ROT_BLAU_GELB, 'Schlangenblockade', ...DREI_REGENBOGEN], true)
    // D31: Die drei Regenbogenschlangen bleiben eine Gruppe mit 0 Punkten.
    expect(wertung.schlangen[0].gruppen.map((g) => g.punkte)).toEqual([3, 3, 3, 0])
    expect(wertung.schlangen[0].vielfaltFarben).toEqual(['Blau', 'Rot', 'Gelb'])
    expect(wertung.vielfaltBonus).toBe(2)
    expect(wertung.summe).toBe(9 + 2 + KETTE)
  })

  it('D32: Regenbogenschlange, Farbenfusion aus Grün und Grün, Regenbogenschlange zählt beim Vielfaltbonus als Farbe (Antwort vom 20.11.2026)', () => {
    // Anders als eine Gruppe nur aus Regenbogenschlangen bringt diese Gruppe eine dritte Farbe (Bonus 2 statt 1).
    const wertung = eineSchlange(
      ['Rot', 'Rot', 'Rot', 'Blau', 'Blau', 'Blau', 'Schlangenblockade', 'Regenbogenschlange', { fusion: ['Grün', 'Grün'] }, 'Regenbogenschlange'],
      true,
    )
    expect(wertung.schlangen[0].vielfaltFarben).toHaveLength(3)
    expect(wertung.schlangen[0].vielfaltFarben).toEqual(expect.arrayContaining(['Rot', 'Blau']))
    expect(wertung.vielfaltBonus).toBe(2)
  })

  it('D32: die Jokerwahl setzt drei Regenbogenschlangen nicht als zusätzliche Farbe an', () => {
    // Die Regenbogenschlangen verlängern Gelb oder bilden eine eigene Gruppe; beides bringt 0 Punkte und keine
    // neue Farbe. Vor D32 wären sie Violett geworden (vierte Farbe, Bonus 3). Gleich gut: feste Reihenfolge, Blau.
    const wertung = eineSchlange([...ROT_BLAU_GELB, ...DREI_REGENBOGEN], true)
    expect(jokerfarben(wertung)).toEqual(['Blau', 'Blau', 'Blau'])
    expect(wertung.schlangen[0].vielfaltFarben).toEqual(['Blau', 'Rot', 'Gelb'])
    expect(wertung.vielfaltBonus).toBe(2)
    expect(wertung.summe).toBe(9 + 2 + KETTE)
  })

  it('D32: von vier Regenbogenschlangen vervollständigt eine die gelbe Gruppe, die anderen drei bringen keine Farbe', () => {
    // Vor D32: erste Regenbogenschlange Gelb (2 Punkte), die drei anderen Violett: 4 Farben, Bonus 3.
    const wertung = eineSchlange(
      ['Rot', 'Rot', 'Rot', 'Blau', 'Blau', 'Blau', 'Gelb', 'Gelb', ...DREI_REGENBOGEN, 'Regenbogenschlange'],
      true,
    )
    expect(jokerfarben(wertung)).toEqual(['Gelb', 'Blau', 'Blau', 'Blau'])
    expect(wertung.gruppenPunkte).toBe(8)
    expect(wertung.vielfaltBonus).toBe(2)
    expect(wertung.summe).toBe(8 + 2 + KETTE)
  })

  // Im dritten Fall sind Blau×4 + Rot×3 und Blau×3 + Rot×4 gleich gut; die feste Reihenfolge nimmt Blau zuerst.
  it.each([
    [['Rot', 'Regenbogenschlange', 'Rot'], 2, ['Rot']],
    [['Regenbogenschlange', 'Regenbogenschlange', 'Rot'], 1, ['Rot', 'Rot']],
    [['Regenbogenschlange', 'Regenbogenschlange', 'Regenbogenschlange', 'Rot'], 1, ['Blau', 'Rot', 'Rot']],
  ] as const)('D32, A7.3: in einer Gruppe mit einer roten Karte zählt die Regenbogenschlange weiter als Rot: %j', (rot, rotPunkte, farben) => {
    const wertung = eineSchlange(['Blau', 'Blau', 'Blau', ...rot], true)
    expect(jokerfarben(wertung)).toEqual(farben)
    expect(wertung.schlangen[0].vielfaltFarben).toEqual(['Blau', 'Rot'])
    expect(wertung.vielfaltBonus).toBe(1)
    expect(wertung.summe).toBe(3 + rotPunkte + 1 + KETTE)
  })
})
