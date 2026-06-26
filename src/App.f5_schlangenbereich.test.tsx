/*
Author: rahn
Datum: 04.06.2026
Version: 1.0
Beschreibung: F5 UI-Test für einen visuell gruppierten Schlangenbereich mit eigenen und gegnerischen Schlangen.
*/

import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand } from './engine'

function zustandMitSchlangenbereich() {
  const zustand = erstelleSpielzustand(2, () => 0.999999)
  const eigeneKarte = zustand.spieler[0].hand[0]
  const gegnerKarte = zustand.spieler[1].hand[0]

  if (!eigeneKarte || !gegnerKarte) throw new Error('Testsetup erwartet Karten für beide Spieler.')

  zustand.spieler[0].hand = zustand.spieler[0].hand.slice(1)
  zustand.spieler[1].hand = zustand.spieler[1].hand.slice(1)
  zustand.spieler[0].schlangen = [{ id: 'schlange-spieler-1-1', karten: [eigeneKarte], zustand: 'aktiv' }]
  zustand.spieler[1].schlangen = [{ id: 'schlange-spieler-2-1', karten: [gegnerKarte], zustand: 'aktiv' }]

  return zustand
}

describe('F5 Schlangenbereich', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/game')
  })

  it('zeigt eigene und gegnerische Schlangen in getrennten visuellen Gruppen an', () => {
    render(<App initialZustand={zustandMitSchlangenbereich()} />)

    // M1dp: Gegnerlichtung wurde in den Arenastein extrahiert
    const schlangenbereich = screen.getByRole('region', { name: 'Schlangenbereich' })
    const eigeneGruppe = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const gegnerGruppe = screen.getByRole('region', { name: 'Waldtanz-Gegnerlichtung' })

    expect(within(eigeneGruppe).getByText('schlange-spieler-1-1')).toBeInTheDocument()
    expect(within(gegnerGruppe).getByText('schlange-spieler-2-1')).toBeInTheDocument()
  })
})
