/*
Author: rahn
Datum: 02.06.2026
Version: 1.0
Beschreibung: R72 UI-Test für die Anzeige der benannten Erweiterungssonderkarten im Materialbereich.
*/
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerAppZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R72 Materialanzeige der Erweiterungssonderkarten', () => {
  it('zeigt die benannten Erweiterungssonderkarten mit ihren Stückzahlen im Materialbereich', () => {
    render(<App initialZustand={deterministischerAppZustand()} />)

    const bereich = screen.getByRole('region', { name: /material und aufgaben/i })
    expect(
      within(bereich).getByText(
        /erweiterungssonderkarten: 4 schlangenhäutung, 1 schlangenkorb des glücks, 4 comeback, 8 risiko-belohnung/i
      )
    ).toBeInTheDocument()
  })
})
