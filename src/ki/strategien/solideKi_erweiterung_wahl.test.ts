// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, ermittleEntscheider, erzeugeZufall } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { baukasten } from '../../engine/testing/szenario'
import { kiWahl } from '../schritt'
import { erstelleSolideKi } from './solideKi'

/*
K4, Kriterium 2 und K2.7, Befunde der Ersatzprüfung für den Codex-Lauf:
1. Wählt die KI über eine Risiko-Karte zwischen einer bekannten Karte und der obersten
   Stapelkarte (D52, D54), darf die Wahl nicht an der einen erratenen Stapelkarte hängen,
   also nicht am Zufall der KI.
2. Wer die letzte Karte zieht, löst die Schlussrunde aus und hat danach keinen Zug mehr
   (A10, D55); mit einer Karte im Stapel bringt das Ziehen über eine Risiko-Karte dann
   weniger, als die Bewertung jetzt zeigt.
*/

function spiele(zustand: Spielzustand, passt: (aktion: SpielAktion) => boolean): Spielzustand {
  const aktion = ermittleAktionen(zustand).find(passt)
  if (aktion === undefined) throw new Error(`Testaufbau: keine passende Aktion unter ${JSON.stringify(ermittleAktionen(zustand))}`)
  return anwendeAktion(zustand, aktion).zustand
}

/** Spieler 1 hat Aktion 2 mit benanntem Rot verloren und KI-Gegner 2 begünstigt; der wählt zwischen Rot und der obersten Stapelkarte (D52). */
function geplanteOderStapel(): Spielzustand {
  const start = baukasten({ spielerzahl: 3, erweiterung: true, zufall: erzeugeZufall(41) }).hand(0, ['Rot', 'Blau']).schlange(0, ['Gelb']).haendeAuffuellen().stapelOben(['Farbendieb']).zustand()
  const rot = start.spieler[0].hand.find((karte) => karte.typ === 'Farbkarte' && karte.farbe === 'Rot')!.id
  const verloren = spiele(start, (aktion) => aktion.typ === 'RisikoKarteSpielen' && aktion.risikoAktion === 2 && aktion.benannt === rot)
  return spiele(verloren, (aktion) => aktion.typ === 'Entscheiden' && aktion.wahl === 'spieler-3')
}

/** KI-Gegner 1 hat mit Aktion 4 gewonnen (oben Rot) und wählt zwischen dem Grün auf seinem Ablagestapel und der obersten Stapelkarte (D54). */
function ablageOderStapel(): Spielzustand {
  const start = baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(45) })
    .schlange(1, ['Grün', 'Grün'])
    .ablage(1, ['Grün'])
    .haendeAuffuellen()
    .stapelOben(['Rot'])
    .amZug(1)
    .zugbeginn()
    .zustand()
  return spiele(start, (aktion) => aktion.typ === 'RisikoKarteSpielen' && aktion.risikoAktion === 4)
}

describe('K4, K2.7: eine Wahl zwischen bekannter Karte und oberster Stapelkarte hängt nicht am Zufall der KI', () => {
  it.each([
    ['D52, geplante Farbkarte oder Stapel, als begünstigter Gegner', geplanteOderStapel],
    ['D54, eigener Ablagestapel oder Stapel', ablageOderStapel],
  ])('K4.2, %s: mit 20 verschiedenen Saaten der KI dieselbe Wahl', (_art, stellung) => {
    const zustand = stellung()
    expect(zustand.entscheidung?.art, 'Testaufbau: eine Risiko-Entscheidung ist offen').toMatch(/^Risiko/)
    expect(ermittleAktionen(zustand).map((aktion) => (aktion.typ === 'Entscheiden' ? aktion.wahl : aktion.typ)), 'Testaufbau: die Stapelkarte ist eine Wahl').toContain('stapel')
    const wahlen = new Set(Array.from({ length: 20 }, (_, saat) => JSON.stringify(kiWahl(zustand, erstelleSolideKi(erzeugeZufall(saat + 1))))))
    expect([...wahlen], `K2.7: Entscheider ${ermittleEntscheider(zustand)}`).toHaveLength(1)
  })
})

describe('K4, A10, D55: das Ziehen der letzten Karte löst die Schlussrunde aus', () => {
  it('K4.2: mit nur einer Karte im Stapel spielt sie keine Risiko-Karte, die zieht', () => {
    const stellung = (behalten: number) =>
      baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(46) })
        .schlange(1, ['Blau', 'Rot'])
        .hand(1, ['Gelb', 'Braun', 'Violett', 'Grün', 'Blau'])
        .hand(0, ['Rot', 'Gelb', 'Blau', 'Braun', 'Violett'])
        .stapelOben(['Rot'])
        .stapelBehalten(behalten)
        .amZug(1)
        .zugbeginn()
        .zustand()
    const knapp = stellung(1)
    expect(knapp.nachziehstapel, 'Testaufbau').toHaveLength(1)
    expect(ermittleAktionen(knapp).some((aktion) => aktion.typ === 'RisikoKarteSpielen' && aktion.risikoAktion === 1), 'Testaufbau: Aktion 1 ist spielbar').toBe(true)
    for (const saat of [1, 2, 3]) {
      const wahl = kiWahl(knapp, erstelleSolideKi(erzeugeZufall(saat)))
      expect(wahl?.typ === 'RisikoKarteSpielen' && (wahl.risikoAktion === 1 || wahl.risikoAktion === 4), `A10, D55: Saat ${saat}, gewählt ${JSON.stringify(wahl)}`).toBe(false)
    }
  })
})
