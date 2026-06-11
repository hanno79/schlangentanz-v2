/*
Author: rahn
Datum: 02.06.2026
Version: 1.1
Beschreibung: R59 UI-Test für den phasenabhängigen Zug- und Aktionshinweis.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R59 UI-Zugpanel mit phasenabhängigem Pflichtschritt', () => {
  it('zeigt den nächsten Pflichtschritt und aktualisiert ihn nach einer Aktion', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const aktionenBereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(
      screen.getAllByText(/nächster pflichtschritt: eine spielbare aktion auswählen/i)[0],
    ).toBeInTheDocument()

    fireEvent.click(
      within(aktionenBereich).getByRole('button', {
        name: /neue schlange starten mit karte blau-01/i,
      }),
    )

    expect(
      screen.getAllByText(/nächster pflichtschritt: ausspielphase beenden/i)[0],
    ).toBeInTheDocument()
    expect(
      within(aktionenBereich).getByRole('button', { name: /ausspielphase beenden/i }),
    ).toBeInTheDocument()
  })
})
