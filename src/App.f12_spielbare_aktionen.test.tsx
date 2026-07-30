/*
Author: rahn
Datum: 04.06.2026
Version: 1.0
Beschreibung: F12 UI-Test für stärker spielbare Aktionsbuttons mit klarer Ausführungsaufforderung.
*/
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')

// ÄNDERUNG [30.07.2026]: AP-3 — die Standardhand aus fünf gleichen blauen Karten
// erzeugt fünf wirkungsgleiche Aktionen, die die Anzeige jetzt zusammenfasst. Für
// „Aktion 1 von N" und einen zweiten Button braucht es verschiedene Karten.
function deterministischerZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [
    { typ: 'Farbkarte', id: 'blau-f12', farbe: 'Blau', punkte: 1 },
    { typ: 'Farbkarte', id: 'rot-f12', farbe: 'Rot', punkte: 1 },
  ]
  return zustand
}

describe('F12 spielbare Aktionen', () => {
  it('macht Engine-Aktionen als klare Ausführungsbuttons mit Reihenfolge und Rückmeldung spielbarer', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
    const empfohleneAktion = within(aktionenBereich).getByRole('region', { name: 'Empfohlene Aktion' })
    const weitereAktionen = within(aktionenBereich).getByRole('region', { name: 'Weitere Aktionen' })

    const empfohlenerButton = within(empfohleneAktion).getByRole('button', {
      name: 'Neue Schlange starten mit Wasserwirbel',
    })
    expect(empfohlenerButton).toHaveClass('aktions-button')
    expect(empfohlenerButton).toHaveClass('aktions-button--empfohlen')
    expect(within(empfohlenerButton).getByText('Jetzt ausführen')).toBeInTheDocument()
    expect(within(empfohlenerButton).getByText('Aktion 1 von 2')).toBeInTheDocument()

    const zweiterButton = within(weitereAktionen).getByRole('button', {
      name: 'Neue Schlange starten mit Feuerkeim',
    })
    expect(zweiterButton).toHaveClass('aktions-button')
    expect(within(zweiterButton).getByText('Aktion 2 von 2')).toBeInTheDocument()

    expect(appCss).toContain('.aktions-button {')
    expect(appCss).toContain('min-height: 4.25rem;')
    expect(appCss).toContain('.aktions-button__meta')
    expect(appCss).toContain('.aktions-button__label')

    fireEvent.click(empfohlenerButton)

    expect(within(aktionenBereich).getByText('Spielbare Aktionen: 0')).toBeInTheDocument()
    expect(screen.getAllByText(/Zuletzt ausgeführt: Neue Schlange starten mit Wasserwirbel/)[0]).toBeInTheDocument()
  })
})
