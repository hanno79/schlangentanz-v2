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

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('F12 spielbare Aktionen', () => {
  it('macht Engine-Aktionen als klare Ausführungsbuttons mit Reihenfolge und Rückmeldung spielbarer', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
    const empfohleneAktion = within(aktionenBereich).getByRole('region', { name: 'Empfohlene Aktion' })
    const weitereAktionen = within(aktionenBereich).getByRole('region', { name: 'Weitere Aktionen' })

    const empfohlenerButton = within(empfohleneAktion).getByRole('button', {
      name: 'Neue Schlange starten mit Karte blau-01',
    })
    expect(empfohlenerButton).toHaveClass('aktions-button')
    expect(empfohlenerButton).toHaveClass('aktions-button--empfohlen')
    expect(within(empfohlenerButton).getByText('Jetzt ausführen')).toBeInTheDocument()
    expect(within(empfohlenerButton).getByText('Aktion 1 von 5')).toBeInTheDocument()

    const zweiterButton = within(weitereAktionen).getByRole('button', {
      name: 'Neue Schlange starten mit Karte blau-03',
    })
    expect(zweiterButton).toHaveClass('aktions-button')
    expect(within(zweiterButton).getByText('Aktion 2 von 5')).toBeInTheDocument()

    expect(appCss).toContain('.aktions-button {')
    expect(appCss).toContain('min-height: 4.25rem;')
    expect(appCss).toContain('.aktions-button__meta')
    expect(appCss).toContain('.aktions-button__label')

    fireEvent.click(empfohlenerButton)

    expect(within(aktionenBereich).getByText('Legale Aktionen: 0')).toBeInTheDocument()
    expect(screen.getByText(/Zuletzt ausgeführt: Neue Schlange starten mit Karte blau-01/)).toBeInTheDocument()
  })
})
