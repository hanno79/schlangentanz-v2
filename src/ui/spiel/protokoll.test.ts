import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, erstellePartie, pruefeAktion } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import { erzeugeZufall } from '../../engine/testing/zufall'
import { mitTestbedingungen } from '../../engine/testing/testaufgaben'
import { erzeugeSzenario, findeSzenario } from '../../entwicklung/szenarien'
import { protokollSchritt } from './protokoll'
import { tischAnsicht } from './tischAnsicht'

/*
O6, Kriterium 1: Jeder Schritt steht im Protokoll, mit Karte und Ziel. Das
Protokoll entsteht aus der Aktion und den Ereignissen der Engine; es nennt nur,
was am Tisch offen liegt (B2): eine gespielte Karte, nie eine Karte, die noch
verdeckt auf einer Hand liegt.
*/

function schritt(vorher: Spielzustand, aktion: SpielAktion): string[] {
  return protokollSchritt(vorher, aktion, anwendeAktion(vorher, aktion).ereignisse, tischAnsicht(vorher))
}

describe('O6 K1: Einträge mit Karte und Ziel', () => {
  const tisch = () =>
    baukasten({ spielerzahl: 3, erweiterung: false, zufall: erzeugeZufall(51) })
      .hand(0, ['Rot', 'Blau', 'Gelb', 'Grün', 'Violett'])
      .hand(1, ['Rot', 'Schlangenblockade', 'Schlangengrube', 'Farbendieb', 'Grün'])
      .hand(2, ['Farbenschutz', 'Blau', 'Gelb', 'Braun', 'Violett'])
      .schlange(0, ['Rot', 'Rot'])
      .schlange(2, ['Gelb', 'Gelb'])
      .amZug(1)
      .zustand()

  const finde = (zustand: Spielzustand, passt: (aktion: SpielAktion) => boolean) => {
    const aktion = ermittleAktionen(zustand).find(passt)
    if (aktion === undefined) throw new Error('Testaufbau: Die Engine zählt die erwartete Aktion nicht auf.')
    return aktion
  }

  it('O6 K1/A5: KI-Gegner 1 legt Rot an das Ende deiner Schlange', () => {
    const vorher = tisch()
    const aktion = finde(vorher, (a) => a.typ === 'FarbkarteLegen' && a.ziel.art === 'schlange' && a.ziel.schlangenId === 'schlange-1' && a.ziel.seite === 'ende')
    expect(schritt(vorher, aktion)).toEqual(['KI-Gegner 1 spielt: Rot an das Ende deiner Schlange 1.'])
  })

  it('O6 K1/A6/D33: Ansage gegen KI-Gegner 2, der durchlässt; dann wirkt die Karte', () => {
    const vorher = tisch()
    const ansage = finde(vorher, (a) => a.typ === 'BlockadeLegen' && a.schlangenId === 'schlange-2' && a.position === 1)
    expect(schritt(vorher, ansage)).toEqual(['KI-Gegner 1 sagt an: Schlangenblockade in die Schlange 1 von KI-Gegner 2, zwischen Karte 1 und 2.'])
    const angesagt = anwendeAktion(vorher, ansage).zustand
    const durch = finde(angesagt, (a) => a.typ === 'Reagieren' && a.farbenschutzId === null)
    expect(schritt(angesagt, durch)).toEqual(['KI-Gegner 2 lässt Schlangenblockade durch.', 'Schlangenblockade wirkt.'])
  })

  it('O6 K1/A7.2: KI-Gegner 2 wehrt mit Farbenschutz ab; die Karte bleibt ohne Wirkung', () => {
    const vorher = tisch()
    const angesagt = anwendeAktion(vorher, finde(vorher, (a) => a.typ === 'BlockadeLegen' && a.schlangenId === 'schlange-2')).zustand
    const abwehr = finde(angesagt, (a) => a.typ === 'Reagieren' && a.farbenschutzId !== null)
    expect(schritt(angesagt, abwehr)).toEqual(['KI-Gegner 2 wehrt Schlangenblockade mit Farbenschutz ab.', 'Schlangenblockade bleibt ohne Wirkung.'])
  })

  it('O6 K1/A7.6: Schlangengrube auf dich, du lässt durch', () => {
    const vorher = tisch()
    const ansage = finde(vorher, (a) => a.typ === 'SchlangengrubeSpielen' && a.zielSpielerId === 'spieler-1')
    expect(schritt(vorher, ansage)).toEqual(['KI-Gegner 1 sagt an: Schlangengrube auf dich.'])
    const angesagt = anwendeAktion(vorher, ansage).zustand
    expect(schritt(angesagt, finde(angesagt, (a) => a.typ === 'Reagieren'))).toEqual(['Du lässt Schlangengrube durch.', 'Schlangengrube wirkt.'])
  })

  it('O6 K1/A5: Zug beenden: wer wie viele Karten zieht, wer dran ist', () => {
    const vorher = tisch()
    const gelegt = anwendeAktion(vorher, finde(vorher, (a) => a.typ === 'FarbkarteLegen')).zustand
    expect(schritt(gelegt, finde(gelegt, (a) => a.typ === 'ZugBeenden'))).toEqual(['KI-Gegner 1 zieht 1 Karte.', 'KI-Gegner 2 ist dran.'])
  })

  it('O6 K4/A7.6: wer aussetzt, steht im Protokoll; danach ist der Nächste dran', () => {
    const vorher = baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(52) })
      .hand(1, ['Rot', 'Blau', 'Gelb', 'Grün', 'Violett'])
      .grube(1, 0)
      .haendeAuffuellen()
      .amZug(1)
      .zustand()
    const gelegt = anwendeAktion(vorher, finde(vorher, (a) => a.typ === 'FarbkarteLegen')).zustand
    expect(schritt(gelegt, finde(gelegt, (a) => a.typ === 'ZugBeenden'))).toEqual([
      'KI-Gegner 1 zieht 1 Karte.',
      'Du setzt diesen Zug aus (Schlangengrube).',
      'KI-Gegner 1 ist dran.',
    ])
  })
})

/** Tauscht jede verdeckte Handkarte der Gegner, die die Aktion nicht nennt, gegen eine Karte vom Nachziehstapel. */
function tauscheVerdeckte(zustand: Spielzustand, aktion: SpielAktion): Spielzustand {
  const genannt = new Set<string>(JSON.stringify(aktion).match(/[a-zäöü]+-\d{2}/g) ?? [])
  const getauscht = structuredClone(zustand)
  getauscht.spieler.forEach((spieler, index) => {
    if (index === 0) return
    spieler.hand = spieler.hand.map((karte) => {
      if (genannt.has(karte.id) || getauscht.nachziehstapel.length === 0) return karte
      const ersatz = getauscht.nachziehstapel.shift()!
      getauscht.nachziehstapel.push(karte)
      return ersatz
    })
  })
  return getauscht
}

describe('O6 K1/B2: Jeder Schritt steht im Protokoll, und es verrät keine verdeckte Karte', () => {
  it('O6/B2: in gespielten Partien mit 2 bis 4 Spielern', () => {
    let verglichen = 0
    for (let saat = 1; saat <= 9; saat += 1) {
      const zufall = erzeugeZufall(800 + saat)
      let zustand = erstellePartie({ spielerzahl: 2 + (saat % 3), erweiterung: saat % 2 === 0, zufall })
      for (let nummer = 0; nummer < 400 && zustand.partiephase !== 'Beendet'; nummer += 1) {
        const aktionen = ermittleAktionen(zustand)
        const aktion = aktionen[Math.floor(zufall() * aktionen.length)]
        const eintraege = schritt(zustand, aktion)
        expect(eintraege.length, `Saat ${saat}, Schritt ${nummer}: ${aktion.typ} steht nicht im Protokoll`).toBeGreaterThan(0)
        const getauscht = tauscheVerdeckte(zustand, aktion)
        if (pruefeAktion(getauscht, aktion).erlaubt) {
          expect(schritt(getauscht, aktion), `Saat ${saat}, Schritt ${nummer}: ${aktion.typ} hängt an verdeckten Karten`).toEqual(eintraege)
          verglichen += 1
        }
        zustand = anwendeAktion(zustand, aktion).zustand
      }
    }
    expect(verglichen, 'verglichene Schritte').toBeGreaterThan(500)
  })
})

describe('O11 K2: Aufgaben im Protokoll', () => {
  const violettAnsEnde = (zustand: Spielzustand) => (a: SpielAktion) =>
    a.typ === 'FarbkarteLegen' && a.ziel.art === 'schlange' && a.ziel.seite === 'ende' && zustand.spieler[0].hand.some((karte) => karte.id === a.karteId && karte.typ === 'Farbkarte' && karte.farbe === 'Violett')

  it('O11 K2/A9/D5: wer eine offene Aufgabe erfüllt und welche nachrückt, steht im Protokoll', () => {
    const vorher = erzeugeSzenario('aufgabe-lila-riese')
    const aktion = ermittleAktionen(vorher).find(violettAnsEnde(vorher))
    if (aktion === undefined) throw new Error('Testaufbau: Violett an das Ende deiner Schlange fehlt in den Aktionen.')
    expect(schritt(vorher, aktion)).toEqual([
      'Du spielst: Violett an das Ende deiner Schlange 1.',
      'Du erfüllst die Aufgabe Lila Riese.',
      'Neu offen liegt die Aufgabe Farbenpracht.',
    ])
  })

  it('O11 K2/A9: erfüllt ein Gegner zu Beginn seines Zuges eine Aufgabe, steht er mit Namen da', () => {
    // Das Szenario erfüllt seine Aufgaben nur mit den Testbedingungen des Entwicklertischs.
    const szenario = findeSzenario('aufgaben-gegnerzug')
    if (szenario?.testbedingungen === undefined) throw new Error('Testaufbau: aufgaben-gegnerzug ohne Testbedingungen.')
    mitTestbedingungen(szenario.testbedingungen, () => {
      const vorher = szenario.erzeuge()
      const gelb = ermittleAktionen(vorher).find(
        (a) => a.typ === 'FarbkarteLegen' && a.ziel.art === 'schlange' && a.ziel.schlangenId === 'schlange-2' && a.ziel.seite === 'ende' && vorher.spieler[0].hand.some((karte) => karte.id === a.karteId && karte.typ === 'Farbkarte' && karte.farbe === 'Gelb'),
      )
      if (gelb === undefined) throw new Error('Testaufbau: Gelb an das Ende der Schlange von KI-Gegner 1 fehlt in den Aktionen.')
      const gelegt = anwendeAktion(vorher, gelb).zustand
      const beenden = ermittleAktionen(gelegt).find((a) => a.typ === 'ZugBeenden')
      if (beenden === undefined) throw new Error('Testaufbau: Zug beenden fehlt in den Aktionen.')
      const eintraege = schritt(gelegt, beenden)
      expect(eintraege).toContain('KI-Gegner 1 erfüllt die Aufgabe Farbkombination.')
      expect(eintraege).toContain('Neu offen liegt die Aufgabe Gelber Schatz.')
    })
  })
})
