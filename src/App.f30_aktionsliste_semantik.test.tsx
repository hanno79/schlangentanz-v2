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
import type { FarbkarteInfo } from './engine'

function farbkarte(id: string, farbe: FarbkarteInfo['farbe'], punkte: number): FarbkarteInfo {
  return { typ: 'Farbkarte', id, farbe, punkte }
}

// ÄNDERUNG [30.07.2026]: AP-3 — die frühere Standardhand bestand aus fünf gleichen
// blauen Karten und erzeugte fünf wirkungsgleiche Aktionen. Seit die Anzeige diese
// zusammenfasst, bliebe davon eine einzige Aktion übrig und die Liste entfiele ganz.
// Für einen Test über Listensemantik braucht es echte verschiedene Aktionen.
function zustandMitVerschiedenenAktionen() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [
    farbkarte('blau-f30', 'Blau', 1),
    farbkarte('rot-f30', 'Rot', 1),
    farbkarte('gelb-f30', 'Gelb', 1),
  ]
  return zustand
}

describe('F30 weitere Aktionen als semantische Liste', () => {
  it('stellt die weiteren legalen Aktionen als echte Liste mit Listeneinträgen dar', () => {
    render(<App initialZustand={zustandMitVerschiedenenAktionen()} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
    const weitereAktionen = within(aktionenBereich).getByRole('region', { name: 'Weitere Aktionen' })
    const liste = within(weitereAktionen).getByRole('list')

    expect(liste.tagName).toBe('OL')
    expect(liste).toHaveAttribute('start', '2')
    expect(within(liste).getAllByRole('listitem')).toHaveLength(2)
    expect(within(liste).getByRole('button', { name: 'Neue Schlange starten mit Feuerkeim' })).toBeInTheDocument()
    expect(within(liste).getByText('Aktion 2 von 3')).toBeInTheDocument()
  })
})
