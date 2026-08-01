/*
Author: Claude Code (G-10)
Datum: 01.08.2026
Version: 1.0
Beschreibung: Beanspruchen die KI-Gegner offene Aufgaben? (R6)

Offene Aufgaben liegen für **alle** Spieler aus. Wer eine erfüllt, bekommt die
Punkte; die Aufgabe wird abgeschlossen und aus dem Stapel nachgezogen. Ob das
auch für einen Gegner gilt, der ohne Klick durchläuft, stand bisher nirgends
geprüft — `kiZug.test.ts` deckte nur den Reaktionsstopp ab.

Nachgefragt am 01.08.2026 anhand eines Spielstands, in dem Spieler 2 die Aufgabe
„Farbwechsler" erfüllt zu haben schien. Diese Tests klären beides: dass die KI
beansprucht, *und* woran „Farbwechsler" tatsächlich hängt — vier direkt
aufeinanderfolgende Farbkarten mit vier **verschiedenen** Farben. Eine
Wiederholung im Fenster genügt nicht, eine Sonderkarte im Weg setzt zurück.
*/

import { describe, expect, it } from 'vitest'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import type { AufgabenkarteInfo, Spielzustand } from './engine'
import { farbkarte, schlangeMitFarben, sonderkarte } from './engine/__tests__/testHelpers'
import { spieleKiZuegeBisZumMenschen } from './kiZug'

const FARBWECHSLER: AufgabenkarteInfo = {
  typ: 'Aufgabenkarte',
  id: 'aufgabe-05',
  name: 'Farbwechsler',
  bedingung: 'Habe in einer Schlange mindestens 4 verschiedene Farben, die direkt aufeinander folgen.',
  punkte: 6,
}

/** Ein Spielstand, in dem die KI (Spieler 2) am Zug ist und gleich fertig wird. */
function kiAmZug(schlangen: Spielzustand['spieler'][number]['schlangen']): Spielzustand {
  const basis = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  return {
    ...basis,
    aktiverSpielerIndex: 1,
    offeneAufgaben: [FARBWECHSLER],
    spieler: basis.spieler.map((spieler, index) =>
      index === 1 ? { ...spieler, schlangen, erfuellteAufgaben: [] } : spieler,
    ),
  }
}

describe('KI-Gegner und offene Aufgaben', () => {
  it('beansprucht eine erfüllte offene Aufgabe im eigenen Zug', () => {
    const zustand = kiAmZug([schlangeMitFarben('ki-1', ['Grün', 'Violett', 'Blau', 'Braun'])])

    const { zustand: nachher } = spieleKiZuegeBisZumMenschen(zustand)

    const ki = nachher.spieler[1]
    expect(ki.erfuellteAufgaben.map((aufgabe) => aufgabe.id)).toContain('aufgabe-05')
  })

  it('schließt die beanspruchte Aufgabe ab und zieht eine neue nach', () => {
    const zustand = kiAmZug([schlangeMitFarben('ki-1', ['Grün', 'Violett', 'Blau', 'Braun'])])
    const stapelVorher = zustand.aufgabenStapel.length

    const { zustand: nachher } = spieleKiZuegeBisZumMenschen(zustand)

    expect(nachher.offeneAufgaben.map((aufgabe) => aufgabe.id)).not.toContain('aufgabe-05')
    expect(nachher.offeneAufgaben).toHaveLength(1)
    expect(nachher.aufgabenStapel).toHaveLength(stapelVorher - 1)
  })

  it('gibt der KI die Punkte der beanspruchten Aufgabe', () => {
    const zustand = kiAmZug([schlangeMitFarben('ki-1', ['Grün', 'Violett', 'Blau', 'Braun'])])

    const { zustand: nachher } = spieleKiZuegeBisZumMenschen(zustand)

    expect(nachher.spieler[1].erfuellteAufgaben.reduce((summe, a) => summe + a.punkte, 0)).toBe(6)
  })

  it('beansprucht nichts, wenn sich eine Farbe im Viererfenster wiederholt', () => {
    // Genau der Fall aus dem gemeldeten Spielstand: Grün, Violett, Blau, Violett
    // sind vier Karten, aber nur drei Farben.
    const zustand = kiAmZug([schlangeMitFarben('ki-1', ['Grün', 'Violett', 'Blau', 'Violett', 'Braun'])])

    const { zustand: nachher } = spieleKiZuegeBisZumMenschen(zustand)

    expect(nachher.spieler[1].erfuellteAufgaben).toHaveLength(0)
    expect(nachher.offeneAufgaben.map((aufgabe) => aufgabe.id)).toContain('aufgabe-05')
  })

  it('beansprucht nichts, wenn eine Sonderkarte die Folge unterbricht', () => {
    const zustand = kiAmZug([
      {
        id: 'ki-1',
        karten: [
          farbkarte('a', 'Grün'),
          farbkarte('b', 'Violett'),
          sonderkarte('zauber', 'Farbenfusion'),
          farbkarte('c', 'Blau'),
          farbkarte('d', 'Braun'),
        ],
        zustand: 'aktiv',
      },
    ])

    const { zustand: nachher } = spieleKiZuegeBisZumMenschen(zustand)

    expect(nachher.spieler[1].erfuellteAufgaben).toHaveLength(0)
  })
})
