/*
Author: rahn
Datum: 05.06.2026
Version: 1.0
Beschreibung: F28 UI-Test für die verständliche Spielerführung, wenn keine legale Aktion verfügbar ist.
*/
/// <reference types="node" />

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function zustandOhneLegaleAktionen() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const aktiverSpieler = zustand.spieler[0]

  aktiverSpieler.hand = []
  aktiverSpieler.schlangen = []

  return zustand
}

describe('F28 Spielerführung bei fehlenden legalen Aktionen', () => {
  it('zeigt eine klare Handlungsinfo statt die Klickführung zu verstecken', () => {
    render(<App initialZustand={zustandOhneLegaleAktionen()} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const spielerfuehrung = within(aktiverSpielerBereich).getByRole('region', { name: 'Spielerführung' })

    expect(within(spielerfuehrung).getByText('Derzeit keine spielbare Aktion verfügbar. Prüfe Phasenregeln oder Zugabschluss.')).toBeInTheDocument()
    expect(within(spielerfuehrung).queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getAllByText('Nächster Pflichtschritt: Derzeit keine spielbare Aktion verfügbar. Prüfe Phasenregeln oder Zugabschluss.')[0]).toBeInTheDocument()
  })
})
