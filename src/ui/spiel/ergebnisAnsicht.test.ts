import { describe, expect, it } from 'vitest'
import { berechneEndwertung } from '../../engine'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { einstellungenVon } from '../lobby/partie'
import { endstaende } from './__tests__/endstaende'
import { ergebnisAnsicht } from './ergebnisAnsicht'

/*
O8: Aus dem beendeten Zustand wird, was die Wertung nach Spielende zeigt. Die
Punkte kommen allein aus `berechneEndwertung`; die Sicht ordnet nur die Plätze
und sagt, wer „du“ bist (U3). Die Szenarien sind die Rechenbeispiele der
Website aus E10.
*/

describe('O8 K1: Die Aufschlüsselung ist die Endwertung der Engine', () => {
  it('O8 K1/A11: je Spieler stehen Gruppen je Schlange, Kette, Vielfalt, Aufgaben und Summe wie in berechneEndwertung', () => {
    const zustand = erzeugeSzenario('wertung-beispiele')
    const ergebnis = ergebnisAnsicht(zustand)
    const endwertung = berechneEndwertung(zustand)
    expect(ergebnis.rangliste).toHaveLength(endwertung.spieler.length)
    for (const wertung of endwertung.spieler) {
      const eintrag = ergebnis.rangliste.find((zeile) => zeile.wertung.spielerId === wertung.spielerId)
      expect(eintrag?.wertung, `ergebnisAnsicht: Wertung von ${wertung.name}`).toEqual(wertung)
    }
    expect(ergebnis.hoechstePunktzahl).toBe(28)
  })

  it('O8 K1: die Rangliste steht absteigend nach Summe, mit Platz und „du“ für den Menschen', () => {
    const ergebnis = ergebnisAnsicht(erzeugeSzenario('wertung-beispiele'))
    expect(ergebnis.rangliste.map((zeile) => [zeile.person.name, zeile.person.ich, zeile.platz, zeile.wertung.summe])).toEqual([
      ['KI-Gegner 2', false, 1, 28],
      ['KI-Gegner 1', false, 2, 12],
      ['Spieler 1', true, 3, 10],
      ['KI-Gegner 3', false, 4, 6],
    ])
  })

  it('O8 K1: die Balken unter den Karten liegen an genau den Karten der gewerteten Gruppen', () => {
    const zustand = erzeugeSzenario('wertung-beispiele')
    for (const zeile of ergebnisAnsicht(zustand).rangliste) {
      expect(zeile.schlangen.map((schlange) => schlange.id)).toEqual(zeile.wertung.schlangen.map((schlange) => schlange.schlangenId))
      zeile.schlangen.forEach((schlange, index) => {
        const inGruppe = schlange.karten.filter((glied) => glied.gruppe !== null).map((glied) => glied.karte.id)
        const gewertet = zeile.wertung.schlangen[index].gruppen.flatMap((gruppe) => gruppe.kartenIds)
        expect(inGruppe, `${zeile.person.name}, Schlange ${index + 1}`).toEqual(gewertet)
      })
    }
  })

  it('O8 K1: 50 Endstände echter Partien: jede Summe und jeder Sieger stimmt mit der Endwertung überein', () => {
    for (const { saat, zustand } of endstaende(50)) {
      const ergebnis = ergebnisAnsicht(zustand)
      const endwertung = berechneEndwertung(zustand)
      const summen = Object.fromEntries(ergebnis.rangliste.map((zeile) => [zeile.wertung.spielerId, zeile.wertung.summe]))
      expect(summen, `Saat ${saat}: Summen`).toEqual(Object.fromEntries(endwertung.spieler.map((wertung) => [wertung.spielerId, wertung.summe])))
      expect(
        ergebnis.rangliste.filter((zeile) => zeile.sieger).map((zeile) => zeile.wertung.spielerId).sort(),
        `Saat ${saat}: Sieger`,
      ).toEqual([...endwertung.gewinner].sort())
    }
  }, 120_000)
})

describe('O8 K3/D22: Gleichstand zeigt alle Sieger', () => {
  it('O8 K3/D22: zwei Spieler mit 12 Punkten stehen beide auf Platz 1 und sind beide Sieger', () => {
    const ergebnis = ergebnisAnsicht(erzeugeSzenario('wertung-beispiele-kette'))
    expect(ergebnis.sieger).toEqual([
      { name: 'Spieler 1', ich: true },
      { name: 'KI-Gegner 1', ich: false },
    ])
    expect(ergebnis.rangliste.map((zeile) => [zeile.person.name, zeile.platz, zeile.sieger])).toEqual([
      ['Spieler 1', 1, true],
      ['KI-Gegner 1', 1, true],
      ['KI-Gegner 2', 3, false],
    ])
  })
})

describe('O8 K4: Die Einstellungen der Partie für „Noch einmal“', () => {
  it.each([
    ['wertung-beispiele', 3, true],
    ['wertung-beispiele-kette', 2, false],
    ['wertung-vielfalt-regenbogen', 1, true],
  ])('O8 K4: %s hatte %i Gegner, Erweiterung %s', (name, gegner, erweiterung) => {
    expect(einstellungenVon(erzeugeSzenario(name))).toEqual({ gegner, erweiterung })
  })
})

describe('O8: Ein Ergebnis gibt es erst nach Spielende', () => {
  it('O8/A10: solange die Partie läuft, wirft ergebnisAnsicht mit Grund', () => {
    expect(() => ergebnisAnsicht(erzeugeSzenario('wertung-joker'))).toThrow(/läuft noch.*A10/)
  })
})
