/*
Author: rahn
Datum: 02.06.2026
Version: 1.0
Beschreibung: R57 UI-Test für die visuelle Kennzeichnung des aktiven Spielers in der Übersicht.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand } from './engine'

function deterministischerZustand() {
  return erstelleSpielzustand(2, () => 0.999999)
}

describe('R57 UI-aktive-Spieler-Kennzeichnung', () => {
  it('kennzeichnet den aktiven Spieler in der Spielerübersicht sichtbar als am Zug', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const spielerUebersichtBereich = screen.getByRole('region', { name: 'Spielerübersicht' })

    const aktiverEintrag = within(spielerUebersichtBereich).getByText((_, element) =>
      !!element?.getAttribute('aria-current') &&
      element.textContent?.includes('— am Zug') === true,
    )

    expect(aktiverEintrag).toBeInTheDocument()
    expect(aktiverEintrag).toHaveTextContent('Spieler spieler-1: Spieler 1 (Mensch)')
    expect(within(spielerUebersichtBereich).getByText(/Spieler spieler-2:/)).not.toHaveTextContent('— am Zug')
  })
})
