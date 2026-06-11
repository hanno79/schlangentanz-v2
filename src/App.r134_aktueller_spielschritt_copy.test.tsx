/**
 * Author: rahn
 * Datum: 11.06.2026
 * Version: 1.0
 * Beschreibung: R134 UI-Test für spielerfreundliche aktuelle Spielschritt-Copy in den Entwicklungsdaten.
 */

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R134 aktuelle Spielschritt-Copy', () => {
  it('zeigt den aktuellen Spielschritt und die Zugdiagnose spielerfreundlich', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const spielphase = screen.getByRole('complementary', { name: 'Entwicklungsdaten: Spielphase' })

    expect(within(spielphase).getByText('Aktueller Spielschritt: Karten ausspielen')).toBeVisible()
    expect(spielphase).toHaveTextContent('Spielschritt im Zug: Karten ausspielen')
    expect(spielphase).not.toHaveTextContent('Aktueller Spielschritt: Ausspielphase')
    expect(spielphase).not.toHaveTextContent('Spielschritt im Zug: Ausspielphase')
  })
})
