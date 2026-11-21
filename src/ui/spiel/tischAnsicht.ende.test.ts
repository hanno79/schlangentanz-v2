import { describe, expect, it } from 'vitest'
import { berechneEndwertung, berechneZwischenstand } from '../../engine'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { spieleBisZumEnde } from './__tests__/endstaende'
import { tischAnsicht } from './tischAnsicht'

/*
O8 am Tisch: Während der Partie steht je Spieler der Zwischenstand der Engine,
ohne Kettenbonus und ohne die geheimen Aufgaben der anderen (Kriterium 5, A9,
A11). Nach Spielende ist niemand mehr am Zug, auch wenn `zug.spielerIndex` beim
zuletzt Spielenden stehen bleibt (Hinweis H1 aus E2 und O3).
*/

describe('O8 K5: Der Zwischenstand je Platz', () => {
  it('O8 K5/A11: die Punkte am Tisch sind der Zwischenstand der Engine aus deiner Sicht', () => {
    const zustand = erzeugeSzenario('wertung-joker')
    const ansicht = tischAnsicht(zustand)
    const zwischenstand = berechneZwischenstand(zustand, zustand.spieler[0].id)
    expect([ansicht.ich.punkte, ...ansicht.gegner.map((gegner) => gegner.punkte)]).toEqual(zwischenstand.spieler.map((wertung) => wertung.summe))
    expect([ansicht.ich.punkte, ...ansicht.gegner.map((gegner) => gegner.punkte)]).toEqual([15, 14, 0, 55])
  })

  it('O8 K5/A11: ohne Kettenbonus; die Endwertung desselben Stands läge um die 5 Bonuspunkte höher', () => {
    const zustand = erzeugeSzenario('wertung-joker')
    const ki3 = tischAnsicht(zustand).gegner[2]
    const endwertung = berechneEndwertung(zustand).spieler[3]
    expect(endwertung.kette?.bonus).toBe(5)
    expect(ki3.punkte).toBe(endwertung.summe - 5)
  })

  it('O8 K5/A9: die erfüllte geheime Aufgabe eines Gegners zählt am Tisch nicht mit, deine eigene schon', () => {
    const zustand = erzeugeSzenario('wertung-joker')
    zustand.spieler[0].geheimeAufgabeErfuellt = true
    const ansicht = tischAnsicht(zustand)
    const geheim = zustand.spieler[0].geheimeAufgabe!.punkte
    expect(ansicht.ich.punkte).toBe(15 + geheim)
    expect(ansicht.gegner[0].punkte, 'KI-Gegner 1 hat Gelber Schatz erfüllt, das bleibt verdeckt').toBe(14)
  })
})

describe('O8: Nach Spielende ist niemand am Zug', () => {
  it('O8: in einem beendeten Szenario ist weder ein Gegner noch du am Zug', () => {
    const ansicht = tischAnsicht(erzeugeSzenario('wertung-beispiele'))
    expect(ansicht.ich.amZug).toBe(false)
    expect(ansicht.gegner.map((gegner) => gegner.amZug)).toEqual([false, false, false])
    expect(ansicht.status.amZug).toBeNull()
  })

  it.each([
    [3, 2],
    [8, 4],
  ])('O8/A10: nach einer ganzen Partie aus Saat %i mit %i Spielern trägt niemand mehr „am Zug“', (saat, spielerzahl) => {
    const ende = spieleBisZumEnde(saat, spielerzahl, false)
    expect(ende.partiephase).toBe('Beendet')
    const ansicht = tischAnsicht(ende)
    expect([ansicht.ich.amZug, ...ansicht.gegner.map((gegner) => gegner.amZug)].filter(Boolean)).toEqual([])
    expect(ansicht.status.amZug).toBeNull()
  })

  it('O8 Gegenprobe: solange die Partie läuft, ist genau einer am Zug', () => {
    const ansicht = tischAnsicht(erzeugeSzenario('schlussrunde-ohne-dich'))
    expect([ansicht.ich.amZug, ...ansicht.gegner.map((gegner) => gegner.amZug)]).toEqual([false, true, false, false])
    expect(ansicht.status.amZug).toEqual({ name: 'KI-Gegner 1', ich: false })
  })
})
