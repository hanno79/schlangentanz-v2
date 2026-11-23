// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { anwendeAktion, benannteHandkarten, ermittleAktionen, ermittleEntscheider, erzeugeZufall } from '../engine'
import type { SpielAktion, Spielzustand } from '../engine'
import { baukasten } from '../engine/testing/szenario'
import { bestimmeZustand, sichtFuer } from './sicht'
import { erstelleZufallsKi } from './strategien/zufallsKi'
import { alleTexte, mischeVerborgenes, verborgeneIds } from './__tests__/verborgenes'
import { partieZustaende } from './__tests__/stellungen'

/*
X5, Kriterium 7: Keine verdeckte Karten-Id eines anderen Spielers in der Sicht
der KI, auch nicht in einer offenen Risiko-Entscheidung (B2). Offen ist die
Farbkarte, die ein Spieler für Risiko-Aktion 2 benennt (D52): Sie liegt
weiter auf seiner Hand, jeder kennt sie, und der begünstigte Gegner wählt
zwischen ihr und der obersten Stapelkarte. Der Rahmen der KI muss sie deshalb
beim Erraten des Verdeckten auf diese Hand legen (Plan K2).
*/

/** Spielt die erste aufgezählte Aktion, die passt. */
function spiele(zustand: Spielzustand, passt: (aktion: SpielAktion) => boolean): Spielzustand {
  const aktion = ermittleAktionen(zustand).find(passt)
  if (aktion === undefined) throw new Error(`Testaufbau: keine passende Aktion unter ${JSON.stringify(ermittleAktionen(zustand))}`)
  return anwendeAktion(zustand, aktion).zustand
}

/** Spieler 1 hat Aktion 2 mit benannter Rot verloren und KI-Gegner 2 gewählt; der entscheidet jetzt zwischen Rot und der Stapelkarte. */
function gegnerWaehlt(): Spielzustand {
  const start = baukasten({ spielerzahl: 3, erweiterung: true, zufall: erzeugeZufall(41) })
    .hand(0, ['Rot', 'Blau'])
    .schlange(0, ['Gelb'])
    .haendeAuffuellen()
    .stapelOben(['Farbendieb'])
    .zustand()
  const rot = start.spieler[0].hand.find((karte) => karte.typ === 'Farbkarte' && karte.farbe === 'Rot')!.id
  const misserfolg = spiele(start, (aktion) => aktion.typ === 'RisikoKarteSpielen' && aktion.risikoAktion === 2 && aktion.benannt === rot)
  return spiele(misserfolg, (aktion) => aktion.typ === 'Entscheiden' && aktion.wahl === 'spieler-3')
}

/** Die Zustände mit offener Risiko-Entscheidung aus Partien der Zufalls-KI mit Erweiterung. */
function risikoStellungen(): Spielzustand[] {
  return [31, 32, 33, 34].flatMap((saat) => {
    const kis = [0, 1, 2].map((sitz) => erstelleZufallsKi(erzeugeZufall(saat * 10 + sitz)))
    return partieZustaende({ spielerzahl: 3, erweiterung: true, saat }, kis).filter((zustand) => zustand.entscheidung?.art.startsWith('Risiko') === true)
  })
}

const STELLUNGEN = [gegnerWaehlt(), ...risikoStellungen()]

/** Jedes Wort jedes Textes der Sicht; eine Wahl wie „blau-01 schlange-2 ende“ zählt Wort für Wort. */
function woerter(wert: unknown): Set<string> {
  return new Set([...alleTexte(wert)].flatMap((text) => text.split(' ')))
}

describe('B2/D52: offene Risiko-Entscheidungen in der Sicht der KI (X5, Kriterium 7)', () => {
  it('B2: die Sicht keines Spielers nennt eine verdeckte fremde Karte, auch nicht in der Entscheidung', () => {
    expect(STELLUNGEN.length, 'Testaufbau: Risiko-Entscheidungen in den Partien').toBeGreaterThan(10)
    for (const [nummer, zustand] of STELLUNGEN.entries()) {
      for (const ich of zustand.spieler.keys()) {
        const texte = woerter(sichtFuer(zustand, ich))
        expect(verborgeneIds(zustand, ich).filter((id) => texte.has(id)), `B2: Stellung ${nummer}, Sicht von Spieler ${ich}`).toEqual([])
      }
    }
  })

  it('D52: die benannte Farbkarte steht offen in der Entscheidung und liegt auf der Hand dessen, der sie benannt hat', () => {
    const zustand = gegnerWaehlt()
    expect(ermittleEntscheider(zustand)).toBe(2)
    const benannt = benannteHandkarten(zustand.entscheidung)
    expect(benannt).toHaveLength(1)
    expect(zustand.spieler[benannt[0].spielerIndex].hand.map((karte) => karte.id)).toContain(benannt[0].karteId)
    expect(woerter(sichtFuer(zustand, 2)).has(benannt[0].karteId)).toBe(true)
  })

  it('K2: der erratene Zustand zeigt jedem Spieler seine Sicht; die benannte Karte liegt auf der richtigen Hand; der Entscheider hat dieselben Wahlen', () => {
    for (const [nummer, zustand] of STELLUNGEN.entries()) {
      for (const ich of zustand.spieler.keys()) {
        const sicht = sichtFuer(zustand, ich)
        const geraten = bestimmeZustand(sicht, erzeugeZufall(nummer * 7 + ich))
        expect(sichtFuer(geraten, ich), `K2: Stellung ${nummer}, Spieler ${ich}`).toEqual(sicht)
        for (const { spielerIndex, karteId } of benannteHandkarten(zustand.entscheidung)) {
          expect(geraten.spieler[spielerIndex].hand.map((karte) => karte.id), `D52: Stellung ${nummer}`).toContain(karteId)
        }
        if (ich === ermittleEntscheider(zustand)) expect(ermittleAktionen(geraten), `K2: Stellung ${nummer}`).toEqual(ermittleAktionen(zustand))
      }
    }
  })

  it('K2.7: neu gemischtes Verdecktes ändert den erratenen Zustand nicht, auch mit offener Risiko-Entscheidung', () => {
    for (const [nummer, zustand] of STELLUNGEN.entries()) {
      for (const ich of zustand.spieler.keys()) {
        const gemischt = mischeVerborgenes(zustand, ich, erzeugeZufall(900 + nummer))
        expect(bestimmeZustand(sichtFuer(gemischt, ich), erzeugeZufall(nummer)), `K2.7: Stellung ${nummer}, Spieler ${ich}`).toEqual(
          bestimmeZustand(sichtFuer(zustand, ich), erzeugeZufall(nummer)),
        )
      }
    }
  })
})
