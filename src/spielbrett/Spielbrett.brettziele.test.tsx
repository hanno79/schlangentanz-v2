/*
Author: Claude Code (G-11)
Datum: 01.08.2026
Version: 1.0
Beschreibung: Sonderkarten am Brett anspielen — geprüft am gerenderten Brett.

`sonderkartenziele.test.ts` prüft das Zielmodell für sich. Diese Datei prüft,
dass die Klicks auch ankommen: Handkarte wählen, Ziel anklicken, Engine hat
gehandelt. Genau dazwischen lag der Fehler, den es zu vermeiden gilt — das alte
Brett bot Ziele an, die niemand erreichen konnte.

Geprüft wird je Zielart einmal, nicht je Karte: Es gibt weniger Zielarten als
Sonderkarten, und die Zielart ist das, was der Klick trifft.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../App'
import { erstelleSpielzustand, starteAusspielphase } from '../engine'
import type { Spielzustand } from '../engine'
import { farbkarte, sonderkarte } from '../engine/__tests__/testHelpers'
import { aufBrettRoute } from '../test/brettTest'



/** Zwei Spieler, der Mensch am Zug, mit vorgegebener Hand und Schlangen. */
function partie(bauen: (zustand: Spielzustand) => void): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.5))
  zustand.aktiverSpielerIndex = 0
  zustand.spieler[0].steuerung = 'Mensch'
  zustand.spieler[1].steuerung = 'KI'
  bauen(zustand)
  return zustand
}

function waehleHandkarte(name: RegExp) {
  const hand = screen.getByRole('region', { name: 'Deine Hand' })
  fireEvent.click(within(hand).getAllByRole('button', { name })[0])
}

describe('Sonderkarten über Brettziele', () => {
  it('spielt die Schlangengrube durch Klick auf den Gegner', () => {
    const zustand = partie((z) => {
      z.spieler[0].hand = [sonderkarte('grube', 'Schlangengrube')]
      z.spieler[1].schlangen = [
        { id: 'gegner-s1', karten: [farbkarte('g1', 'Blau')], zustand: 'aktiv' },
      ]
    })
    aufBrettRoute()
    render(<App initialZustand={zustand} />)

    waehleHandkarte(/Schlangengrube/)
    const gegner = screen.getByRole('region', { name: /^Gegner/ })
    fireEvent.click(within(gegner).getByRole('button', { name: /treffen/ }))

    // Die Engine hat gehandelt: Die Grube löst eine Reaktion beim Verteidiger aus.
    expect(screen.getByRole('region', { name: 'Zugaktion' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Spielverlauf' })).toHaveTextContent(/Schlangengrube/)
  })

  it('blockiert eine gegnerische Schlange durch Klick auf sie', () => {
    const zustand = partie((z) => {
      z.spieler[0].hand = [sonderkarte('blockade', 'Schlangenblockade')]
      z.spieler[1].schlangen = [
        { id: 'gegner-s1', karten: [farbkarte('g1', 'Blau'), farbkarte('g2', 'Blau')], zustand: 'aktiv' },
      ]
    })
    aufBrettRoute()
    render(<App initialZustand={zustand} />)

    waehleHandkarte(/Schlangenblockade/)
    const gegner = screen.getByRole('region', { name: /^Gegner/ })
    fireEvent.click(within(gegner).getByRole('button', { name: /blockieren/ }))

    expect(screen.getByRole('region', { name: 'Spielverlauf' })).toHaveTextContent(/Schlangenblockade/)
  })

  it('frisst eine eigene Karte mit einem einzigen Klick', () => {
    const zustand = partie((z) => {
      z.spieler[0].hand = [sonderkarte('frass', 'Schlangenfrass')]
      z.spieler[0].schlangen = [
        {
          id: 'meine-1',
          karten: [farbkarte('m1', 'Blau'), farbkarte('m2', 'Rot'), farbkarte('m3', 'Gelb')],
          zustand: 'aktiv',
        },
      ]
    })
    aufBrettRoute()
    render(<App initialZustand={zustand} />)

    waehleHandkarte(/Schlangenfrass/)
    const flaeche = screen.getByRole('region', { name: 'Deine Schlangen' })
    const vorher = within(flaeche).getAllByRole('button', { name: /Karte \d von 3/ })
    expect(vorher.length).toBeGreaterThan(0)
    fireEvent.click(vorher[0])

    // Eine Karte weniger in der Schlange — der Frass ist ausgeführt.
    expect(within(flaeche).queryAllByRole('button', { name: /Karte \d von 3/ })).toHaveLength(0)
  })

  it('verlangt beim Frass gegen Gegner zwei Klicks und sagt das auch', () => {
    const zustand = partie((z) => {
      z.spieler[0].hand = [sonderkarte('frass', 'Schlangenfrass')]
      z.spieler[0].schlangen = []
      z.spieler[1].schlangen = [
        {
          id: 'gegner-s1',
          karten: [farbkarte('g1', 'Blau'), farbkarte('g2', 'Rot'), farbkarte('g3', 'Gelb')],
          zustand: 'aktiv',
        },
      ]
    })
    aufBrettRoute()
    render(<App initialZustand={zustand} />)

    waehleHandkarte(/Schlangenfrass/)
    const gegner = screen.getByRole('region', { name: /^Gegner/ })
    const karten = within(gegner).getAllByRole('button', { name: /Karte \d von 3/ })
    fireEvent.click(karten[0])

    // Nach dem ersten Ziel steht die Aufforderung zum zweiten — und nichts ist passiert.
    expect(screen.getByRole('region', { name: 'Deine Hand' })).toHaveTextContent(/zweite Karte/)
    expect(within(gegner).getAllByRole('button', { name: /Karte \d von 3/ }).length).toBeGreaterThan(0)
  })

  it('zeigt Ziele erst, wenn eine Sonderkarte gewählt ist', () => {
    const zustand = partie((z) => {
      z.spieler[0].hand = [sonderkarte('grube', 'Schlangengrube')]
      z.spieler[1].schlangen = [
        { id: 'gegner-s1', karten: [farbkarte('g1', 'Blau')], zustand: 'aktiv' },
      ]
    })
    aufBrettRoute()
    render(<App initialZustand={zustand} />)

    const gegner = screen.getByRole('region', { name: /^Gegner/ })
    expect(within(gegner).queryByRole('button', { name: /treffen/ })).toBeNull()
  })

  it('verwirft eine halbe Zielauswahl, wenn die Handkarte gewechselt wird', () => {
    const zustand = partie((z) => {
      z.spieler[0].hand = [sonderkarte('frass', 'Schlangenfrass'), farbkarte('blau', 'Blau')]
      z.spieler[0].schlangen = []
      z.spieler[1].schlangen = [
        {
          id: 'gegner-s1',
          karten: [farbkarte('g1', 'Blau'), farbkarte('g2', 'Rot'), farbkarte('g3', 'Gelb')],
          zustand: 'aktiv',
        },
      ]
    })
    aufBrettRoute()
    render(<App initialZustand={zustand} />)

    waehleHandkarte(/Schlangenfrass/)
    const gegner = screen.getByRole('region', { name: /^Gegner/ })
    fireEvent.click(within(gegner).getAllByRole('button', { name: /Karte \d von 3/ })[0])
    expect(screen.getByRole('region', { name: 'Deine Hand' })).toHaveTextContent(/zweite Karte/)

    waehleHandkarte(/Wasserwirbel|Blau/)

    expect(screen.getByRole('region', { name: 'Deine Hand' })).not.toHaveTextContent(/zweite Karte/)
  })
})
