/**
 * Author: rahn
 * Datum: 05.07.2026
 * Version: 1.0
 * Beschreibung: Audit-Fix R2.5 — Im Zugabschluss mit Überhand wählt der MENSCH selbst,
 * welche überzähligen Karten abgeworfen werden (nicht automatisch die letzten N).
 */

import { render, screen, within } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand } from './engine'
import type { Spielzustand } from './engine'
import { farbkarte } from './engine/__tests__/testHelpers'

function zugabschlussMitUeberhand(): Spielzustand {
  const zustand = erstelleSpielzustand(2, () => 0.5)
  zustand.zugphase = 'Zugabschluss'
  zustand.spieler[0].hand = Array.from({ length: 11 }, (_, i) => farbkarte(`ueberhand-${String(i).padStart(2, '0')}`, 'Blau'))
  return zustand
}

describe('R2.5 — Überhand-Abwurf mit Spielerwahl', () => {
  it('wirft die vom Spieler gewählte Karte ab, nicht die automatische letzte', () => {
    render(<App initialZustand={zugabschlussMitUeberhand()} />)
    const hand = screen.getByRole('region', { name: /Handkarten/i })

    // Gezielt die ERSTE Karte wählen (Auto-Abwurf würde die letzte nehmen).
    fireEvent.click(within(hand).getByRole('button', { name: /ueberhand-00.*abwerfen auswählen/i }))
    fireEvent.click(within(hand).getByRole('button', { name: /^1 Karte abwerfen$/i }))

    // Die gewählte Karte ist weg, die letzte Karte bleibt erhalten.
    expect(within(hand).queryByText('ueberhand-00')).toBeNull()
    expect(within(hand).getByText('ueberhand-10')).toBeInTheDocument()
  })
})
