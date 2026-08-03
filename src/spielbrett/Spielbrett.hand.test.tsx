/*
Author: Claude Code (G-4)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Die Abwurf-Wege der Handleiste auf dem neuen Brett.

Beide brauchen einen konstruierten Zustand — im normalen Spielverlauf treten sie
nur unter engen Bedingungen auf. Genau deshalb sind sie im alten Brett unbemerkt
kaputtgegangen: Auf `/game` warf `HandkartenPanel.tsx:207` hart
`pflichtAbwurfAktionen[0]` ab, die Kartenwahl gab es dort nicht mehr, seit das
`AktionenPanel` per CSS versteckt wurde.

R2.5 verlangt, dass der *Mensch* wählt, welche überzähligen Karten weggehen —
nicht die automatischen letzten N.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../App'
import { erstelleSpielzustand, HANDKARTENLIMIT } from '../engine'
import type { Spielzustand } from '../engine'
import { farbkarte } from '../engine/__tests__/testHelpers'
import { aufBrettRoute } from '../test/brettTest'



/**
 * Zugabschluss mit `zuViel` Karten über dem Handkartenlimit.
 *
 * Die erste Karte ist rot, alle übrigen blau. Das macht sie am Spielernamen
 * unterscheidbar („Feuerkeim" gegen „Wasserwirbel") — nur so lässt sich prüfen,
 * dass wirklich die *gewählte* Karte abgeworfen wurde und nicht irgendeine.
 */
function mitUeberhand(zuViel: number): Spielzustand {
  const zustand = erstelleSpielzustand(2, () => 0.5)
  zustand.zugphase = 'Zugabschluss'
  zustand.spieler[0].hand = Array.from({ length: HANDKARTENLIMIT + zuViel }, (_, i) =>
    farbkarte(`ueberhand-${String(i).padStart(2, '0')}`, i === 0 ? 'Rot' : 'Blau'),
  )
  return zustand
}

function handbereich() {
  return screen.getByRole('region', { name: 'Deine Hand' })
}

describe('Handleiste — Überhand abwerfen', () => {
  it('nennt die geforderte Anzahl und sperrt den Knopf, bis sie erreicht ist', () => {
    aufBrettRoute()
    render(<App initialZustand={mitUeberhand(2)} />)

    expect(screen.getByText(/2 Karte\(n\) zu viel/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /0 von 2 gewählt/ })).toBeDisabled()
  })

  it('gibt den Knopf frei, sobald genau so viele Karten markiert sind', () => {
    aufBrettRoute()
    render(<App initialZustand={mitUeberhand(2)} />)
    const hand = handbereich()

    fireEvent.click(within(hand).getByRole('button', { name: /Karte 1 von/ }))
    expect(screen.getByRole('button', { name: /1 von 2 gewählt/ })).toBeDisabled()

    fireEvent.click(within(hand).getByRole('button', { name: /Karte 2 von/ }))
    expect(screen.getByRole('button', { name: /2 von 2 gewählt/ })).toBeEnabled()
  })

  it('nimmt eine Markierung auf erneuten Klick zurück', () => {
    aufBrettRoute()
    render(<App initialZustand={mitUeberhand(1)} />)
    const hand = handbereich()

    fireEvent.click(within(hand).getByRole('button', { name: /Karte 1 von/ }))
    expect(screen.getByRole('button', { name: /1 von 1 gewählt/ })).toBeEnabled()

    fireEvent.click(within(hand).getByRole('button', { name: /Karte 1 von/ }))
    expect(screen.getByRole('button', { name: /0 von 1 gewählt/ })).toBeDisabled()
  })

  it('wirft die gewählte Karte ab, nicht die automatische letzte (R2.5)', () => {
    aufBrettRoute()
    render(<App initialZustand={mitUeberhand(1)} />)
    const hand = handbereich()

    // Gezielt die EINE rote Karte wählen — der Auto-Fallback nähme die letzte,
    // also eine blaue. Genau das darf nicht passieren.
    expect(within(hand).getAllByRole('button', { name: /Feuerkeim/ })).toHaveLength(1)

    fireEvent.click(within(hand).getByRole('button', { name: /Feuerkeim/ }))
    fireEvent.click(screen.getByRole('button', { name: /1 von 1 gewählt/ }))

    const danach = handbereich()
    expect(within(danach).queryByRole('button', { name: /Feuerkeim/ })).toBeNull()
    expect(within(danach).getAllByRole('button', { name: /Wasserwirbel/ })).toHaveLength(HANDKARTENLIMIT)
  })

  it('zeigt den Überhand-Hinweis nach dem Abwurf nicht mehr', () => {
    aufBrettRoute()
    render(<App initialZustand={mitUeberhand(1)} />)

    fireEvent.click(within(handbereich()).getByRole('button', { name: /Karte 1 von/ }))
    fireEvent.click(screen.getByRole('button', { name: /1 von 1 gewählt/ }))

    expect(screen.queryByText(/Karte\(n\) zu viel/)).toBeNull()
  })
})
