/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R141 UI-Test für spielerfreundliche Copy im Aktionenbereich ohne technische Legalitätsbegriffe.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R141 Aktionenbereich spielerfreundlich benennen', () => {
  it('zeigt spielbare Aktionen ohne technische Legalitäts-Copy', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
    const weitereAktionen = within(aktionenBereich).getByRole('region', { name: 'Weitere Aktionen' })
    const phasenregeln = within(aktionenBereich).getByRole('region', { name: 'Phasenregeln' })

    expect(within(aktionenBereich).getByText('Spielbare Aktionen: 1')).toBeInTheDocument()
    expect(within(aktionenBereich).getByText('Nächster Pflichtschritt: Eine spielbare Aktion auswählen.')).toBeInTheDocument()
    expect(within(weitereAktionen).getByRole('heading', { name: 'Weitere Aktionen' })).toBeInTheDocument()
    expect(within(phasenregeln).getByRole('heading', { name: 'Spielbare Aktionen in dieser Phase' })).toBeInTheDocument()

    expect(within(aktionenBereich).queryByText(/Legale Aktionen:/)).not.toBeInTheDocument()
    expect(within(aktionenBereich).queryByText(/legale Aktion/i)).not.toBeInTheDocument()
    expect(within(aktionenBereich).queryByRole('heading', { name: 'Weitere legale Aktionen' })).not.toBeInTheDocument()
    expect(within(aktionenBereich).queryByRole('heading', { name: 'Legale Aktionen dieser Phase' })).not.toBeInTheDocument()
  })
})
