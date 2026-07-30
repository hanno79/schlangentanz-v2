/*
Author: rahn
Datum: 02.06.2026
Version: 1.0
Beschreibung: R68 UI-Test für die visuelle Hervorhebung der empfohlenen legalen Aktion.
*/
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

// ÄNDERUNG [30.07.2026]: AP-3 — fünf gleiche blaue Handkarten erzeugen fünf
// wirkungsgleiche Aktionen, die die Anzeige zu einer zusammenfasst. Für den
// Vergleich „erster Button ist der empfohlene" braucht es zwei verschiedene.
function deterministischerAppZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [
    { typ: 'Farbkarte', id: 'blau-r68', farbe: 'Blau', punkte: 1 },
    { typ: 'Farbkarte', id: 'rot-r68', farbe: 'Rot', punkte: 1 },
  ]
  return zustand
}

describe('R68 Hervorhebung der empfohlenen legalen Aktion', () => {
  it('markiert den ersten legalen Aktionsbutton als empfohlen', () => {
    render(<App initialZustand={deterministischerAppZustand()} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
    const buttons = within(aktionenBereich).getAllByRole('button')
    const empfohlenerButton = buttons.find(button => button.classList.contains('aktions-button--empfohlen'))

    expect(empfohlenerButton).toBe(buttons[0])
    expect(buttons[1]).not.toHaveClass('aktions-button--empfohlen')
  })
})
