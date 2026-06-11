/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R142 A11y-Test für den äußeren Spielbereich-Landmark ohne technischen Legalitätsbegriff.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R142 Spielbereich-Landmark spielerfreundlich benennen', () => {
  it('benennt den äußeren Spielbereich nicht mehr als technische Legalitätsregion', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })

    expect(within(spielbereich).getByRole('region', { name: 'Spielstatus' })).toBeInTheDocument()
    expect(within(spielbereich).getByRole('region', { name: 'Aktiver Spieler' })).toBeInTheDocument()
    expect(within(spielbereich).getByRole('region', { name: 'Aktionen' })).toBeInTheDocument()
    expect(within(spielbereich).getByRole('region', { name: 'Spielerübersicht' })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Legale Aktionen' })).not.toBeInTheDocument()
  })
})
