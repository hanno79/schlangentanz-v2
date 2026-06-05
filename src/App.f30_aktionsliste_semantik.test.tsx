/*
Author: rahn
Datum: 05.06.2026
Version: 1.0
Beschreibung: F30 UI-Test für die semantische Darstellung der weiteren Aktionen als echte Liste.
*/
/// <reference types="node" />

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('F30 weitere Aktionen als semantische Liste', () => {
  it('stellt die weiteren legalen Aktionen als echte Liste mit Listeneinträgen dar', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
    const weitereAktionen = within(aktionenBereich).getByRole('region', { name: 'Weitere Aktionen' })
    const liste = within(weitereAktionen).getByRole('list')

    expect(liste.tagName).toBe('OL')
    expect(liste).toHaveAttribute('start', '2')
    expect(within(liste).getAllByRole('listitem')).toHaveLength(4)
    expect(within(liste).getByRole('button', { name: 'Neue Schlange starten mit Karte blau-03' })).toBeInTheDocument()
    expect(within(liste).getByText('Aktion 2 von 5')).toBeInTheDocument()
  })
})
