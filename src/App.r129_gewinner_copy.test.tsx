/**
 * Author: rahn
 * Datum: 11.06.2026
 * Version: 1.0
 * Beschreibung: R129 UI-Test für spielerfreundliche Gewinner-Copy ohne rohe Spieler-IDs.
 */

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import type { Spielzustand } from './engine'

function spielendeZustandMitSpieler1Sieg(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const gruppenIds = ['blau-01', 'blau-03', 'blau-05']
  const gruppenKarten = zustand.spieler[0].hand.filter(karte => gruppenIds.includes(karte.id))
  if (gruppenKarten.length !== 3) throw new Error('Testsetup erwartet drei blaue Karten auf Spieler-1-Hand.')

  return {
    ...zustand,
    spielphase: 'Beendet',
    zugphase: 'Spielende',
    spieler: zustand.spieler.with(0, {
      ...zustand.spieler[0],
      hand: zustand.spieler[0].hand.filter(karte => !gruppenIds.includes(karte.id)),
      schlangen: [{ id: 'schlange-r129-gewinner', karten: gruppenKarten, zustand: 'aktiv' }],
    }),
  }
}

describe('R129 spielerfreundliche Gewinner-Copy', () => {
  it('zeigt Gewinner und Ergebnis mit Spielernamen statt roher Spieler-IDs', () => {
    render(<App initialZustand={spielendeZustandMitSpieler1Sieg()} />)

    const wertung = screen.getByRole('region', { name: 'Wertung' })
    const aktiverSpieler = screen.getByRole('region', { name: 'Aktiver Spieler' })

    expect(within(wertung).getByText('Ergebnis: Sieg für Spieler 1')).toBeVisible()
    expect(within(wertung).getByText('Gewinner Spieler 1: 3 Punkte')).toBeVisible()
    expect(within(aktiverSpieler).getByText('Gewinner: Spieler 1 (3 Punkte)')).toBeVisible()

    const wertungText = wertung.textContent ?? ''
    const aktiverSpielerText = aktiverSpieler.textContent ?? ''
    expect(wertungText).not.toMatch(/Gewinner spieler-\d/)
    expect(wertungText).not.toMatch(/Sieg für spieler-\d/)
    expect(aktiverSpielerText).not.toMatch(/Gewinner: spieler-\d/)
  })
})
