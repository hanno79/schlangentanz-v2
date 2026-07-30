/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R140 UI-Test für spielerfreundliche Empfehlungs-Copy zur nächsten legalen Aktion.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R140 empfohlene Aktion spielerfreundlich benennen', () => {
  it('zeigt die nächste spielbare Aktion als Empfehlung statt als technische Legalitätsdiagnose', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })

    expect(within(aktiverSpielerBereich).getByText('Empfohlene Aktion: Neue Schlange starten mit Wasserwirbel')).toBeInTheDocument()
    expect(within(aktiverSpielerBereich).queryByText(/Nächste legale Aktion:/)).not.toBeInTheDocument()
  })
})
