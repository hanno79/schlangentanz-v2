// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { KETTENBONUS, berechneZwischenstand, erzeugeZufall } from '../../engine'
import type { Spielzustand } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import type { Baukasten, Schlangenglied } from '../../engine/testing/szenario'
import { sichtFuer } from '../sicht'
import { zufallszustaende } from '../__tests__/stellungen'
import { bewerte, gruppenwert, haltewert, hatNochZug, kettenlaenge } from './bewertung'

/*
K2: Die Bewertung der soliden KI zählt Punkte so, wie Teil D sie festlegt, und
bewertet Aussichten, Hand, Kette und Gruben nur aus der Sicht.
*/

function tisch(erweiterung = false, spielerzahl = 2): Baukasten {
  return baukasten({ spielerzahl, erweiterung, zufall: erzeugeZufall(17) })
}

/** Die Sicht von Spieler 2 (Stelle 1) auf einen Tisch, an dem er die eine Schlange `eigene` hat. */
function blick(eigene: Schlangenglied[], erweiterung = false) {
  return sichtFuer(tisch(erweiterung).schlange(1, eigene).haendeAuffuellen().amZug(1).zustand(), 1)
}

describe('K2: Punkte wie in Teil D', () => {
  it('D30: eine Farbenfusion ist ein Platz und bringt die Summe der Karten darunter; mit nur einer Karte daneben keine Gruppe', () => {
    expect(gruppenwert(blick(['Rot', { fusion: ['Rot', 'Rot'] }]).spieler[1], false), 'D30: Fusion plus eine Karte sind zwei Plätze').toBe(0)
    expect(gruppenwert(blick(['Rot', 'Rot', { fusion: ['Grün', 'Grün'] }]).spieler[1], false), 'D30: 1 + 1 + (3 + 3)').toBe(8)
  })

  it('D31: drei Regenbogenschlangen sind eine Gruppe mit 0 Punkten', () => {
    expect(gruppenwert(blick(['Regenbogenschlange', 'Regenbogenschlange', 'Regenbogenschlange']).spieler[1], false)).toBe(0)
  })

  it('D32: eine Gruppe nur aus Regenbogenschlangen zählt nicht beim Vielfaltbonus', () => {
    const glieder: Schlangenglied[] = ['Regenbogenschlange', 'Regenbogenschlange', 'Regenbogenschlange', 'Schlangenblockade', 'Blau', 'Blau', 'Blau']
    expect(gruppenwert(blick(glieder, true).spieler[1], true), 'D32: nur Blau zählt als Farbe, also kein Bonus').toBe(3)
    const zweiFarben: Schlangenglied[] = ['Rot', 'Rot', 'Rot', 'Schlangenblockade', 'Blau', 'Blau', 'Blau']
    expect(gruppenwert(blick(zweiFarben, true).spieler[1], true), 'A11: zwei Farben bringen 1 Bonuspunkt').toBe(7)
  })

  it('D24: die längste Kette zählt erst ab 3 Farbkarten; Regenbogenschlange und Fusion unterbrechen sie (A11)', () => {
    expect(kettenlaenge(blick(['Rot', 'Rot']).spieler[1]), 'D24: Rot, Rot ist noch keine Kette').toBe(0)
    expect(kettenlaenge(blick(['Rot', 'Rot', 'Rot']).spieler[1])).toBe(3)
    const unterbrochen: Schlangenglied[] = ['Rot', 'Rot', 'Rot', 'Regenbogenschlange', 'Rot', 'Rot', 'Rot', 'Rot']
    expect(kettenlaenge(blick(unterbrochen).spieler[1]), 'A11: Beispiel der Website').toBe(4)
    expect(kettenlaenge(blick(['Blau', 'Blau', { fusion: ['Blau', 'Blau'] }, 'Blau']).spieler[1]), 'A11: die Fusion unterbricht').toBe(0)
  })

  it('A11: die Bewertung zählt Farbgruppen und Vielfaltbonus wie der Zwischenstand der Engine, in 100 Zufallszuständen', () => {
    const zustaende: Spielzustand[] = zufallszustaende(100, 7000)
    for (const [nummer, zustand] of zustaende.entries()) {
      const stand = berechneZwischenstand(zustand, zustand.spieler[0].id)
      const sicht = sichtFuer(zustand, 0)
      const ohneAufgaben = stand.spieler.map((spieler) => spieler.summe - spieler.aufgabenPunkte)
      expect(sicht.spieler.map((spieler) => gruppenwert(spieler, zustand.erweiterung)), `A11: Zustand ${nummer}`).toEqual(ohneAufgaben)
    }
  })

  it('A11, D24: der Kettenbonus geht an den mit der längsten Kette; bei Gleichstand an beide, so dass er sich aufhebt', () => {
    const mit = (eigene: Schlangenglied[]) => sichtFuer(tisch().schlange(0, ['Gelb', 'Gelb', 'Gelb']).schlange(1, eigene).haendeAuffuellen().amZug(1).zustand(), 1)
    const gleich = bewerte(mit(['Rot', 'Rot', 'Rot']))
    const laenger = bewerte(mit(['Rot', 'Rot', 'Rot', 'Rot']))
    expect(laenger - gleich, 'A11: eine Karte mehr in der Gruppe und dazu der Bonus allein, statt geteilt').toBeGreaterThanOrEqual(KETTENBONUS + 1)
  })
})

describe('K2: Aussichten, Hand und Gruben', () => {
  it('K2: ein Paar an einem offenen Ende ist mehr wert als eine einzelne Karte, eine Gruppe mehr als ein Paar', () => {
    const einzeln = bewerte(blick(['Violett']))
    const paar = bewerte(blick(['Violett', 'Violett']))
    const gruppe = bewerte(blick(['Violett', 'Violett', 'Violett']))
    expect(paar).toBeGreaterThan(einzeln)
    expect(gruppe).toBeGreaterThan(paar)
  })

  it('K2: eine Schlangenblockade an beiden Enden nimmt dem Paar seine Aussicht (A7.5)', () => {
    expect(bewerte(blick(['Schlangenblockade', 'Violett', 'Violett', 'Schlangenblockade']))).toBeLessThan(bewerte(blick(['Violett', 'Violett'])))
  })

  it('K2: eine Gruppe des Gegners senkt die eigene Bewertung', () => {
    const ohne = bewerte(sichtFuer(tisch().schlange(1, ['Rot']).haendeAuffuellen().amZug(1).zustand(), 1))
    const mitGegner = bewerte(sichtFuer(tisch().schlange(1, ['Rot']).schlange(0, ['Grün', 'Grün', 'Grün']).haendeAuffuellen().amZug(1).zustand(), 1))
    expect(mitGegner).toBeLessThan(ohne - 8)
  })

  it('K2: eine Farbkarte auf der Hand ist mehr wert, wenn sie an ein eigenes Paar passt', () => {
    const sicht = blick(['Braun', 'Braun'])
    const braun = { typ: 'Farbkarte', id: 'braun-99', farbe: 'Braun', punkte: 2 } as const
    const rot = { typ: 'Farbkarte', id: 'rot-99', farbe: 'Rot', punkte: 1 } as const
    expect(haltewert(braun, sicht)).toBeGreaterThan(haltewert({ ...braun, farbe: 'Violett' }, sicht))
    expect(haltewert(rot, sicht)).toBeGreaterThan(0)
  })

  it('A10: im letzten eigenen Zug zählt auf der Hand nur noch der Farbenschutz, der danach abwehren kann', () => {
    const zustand = tisch(false, 3).schlange(1, ['Rot']).hand(1, ['Farbenschutz', 'Verdoppler', 'Rot']).haendeAuffuellen().schlussrunde(0).amZug(1).zustand()
    const sicht = sichtFuer(zustand, 1)
    expect(hatNochZug(sicht, 1), 'A10: KI-Gegner 1 spielt seinen letzten Zug').toBe(false)
    expect(hatNochZug(sicht, 2), 'A10: KI-Gegner 2 kommt vor dem Auslöser noch einmal dran').toBe(true)
    expect(hatNochZug(sicht, 0), 'A10: der Auslöser hat keinen Zug mehr').toBe(false)
    const werte = sicht.hand.map((karte) => haltewert(karte, sicht))
    expect(werte.slice(0, 3)).toEqual([0.8, 0, 0])
  })

  it('A7.6: eine Schlangengrube vor dem Gegner hebt die eigene Bewertung, eine vor einem selbst senkt sie', () => {
    const mitGrube = (gespieltVon: number, vor: number) => bewerte(sichtFuer(tisch().schlange(1, ['Rot']).grube(gespieltVon, vor).haendeAuffuellen().amZug(1).zustand(), 1))
    const ohne = bewerte(sichtFuer(tisch().schlange(1, ['Rot']).haendeAuffuellen().amZug(1).zustand(), 1))
    expect(mitGrube(1, 0)).toBeGreaterThan(ohne)
    expect(mitGrube(0, 1)).toBeLessThan(ohne)
  })

  it('D21: in der Schlussrunde nimmt eine Grube dem Gegner seinen letzten Zug und damit seine Aussichten', () => {
    const schluss = (mitGrube: boolean) => {
      const bau = tisch(false, 3).schlange(2, ['Grün', 'Grün']).schlange(1, ['Rot']).haendeAuffuellen()
      if (mitGrube) bau.grube(1, 2)
      return bewerte(sichtFuer(bau.schlussrunde(0).amZug(1).zustand(), 1))
    }
    expect(schluss(true)).toBeGreaterThan(schluss(false))
  })
})
