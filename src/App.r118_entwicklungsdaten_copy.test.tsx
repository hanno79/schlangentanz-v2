/**
 * Author: rahn
 * Datum: 08.06.2026
 * Version: 1.0
 * Beschreibung: R118 UI-Test für spielerfreundliche Entwicklungsdaten-Summaries ohne sichtbare Debug-Copy.
 */

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const ENTWICKLUNGSDATEN_TITEL = [
  'Phasenstatus',
  'Aktiver Spieler',
  'Spielerzustände',
  'Materialstatus',
  'Wertungsdetails',
]

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R118 spielerfreundliche Entwicklungsdaten-Copy', () => {
  it('zeigt Entwicklungsdaten ohne sichtbare oder zugängliche Debug-Summary-Copy', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const entwicklungsdatenBereiche = screen.getAllByRole('complementary', { name: /^Entwicklungsdaten:/ })
    expect(entwicklungsdatenBereiche).toHaveLength(ENTWICKLUNGSDATEN_TITEL.length)

    for (const [index, bereich] of entwicklungsdatenBereiche.entries()) {
      expect(bereich).toHaveAccessibleName(`Entwicklungsdaten: ${ENTWICKLUNGSDATEN_TITEL[index]}`)
      expect(within(bereich).getByText('Entwicklungsdaten')).toBeInTheDocument()
      expect(within(bereich).getByText(ENTWICKLUNGSDATEN_TITEL[index], { selector: 'summary' })).toBeVisible()
    }

    expect(screen.queryAllByText(/^Debug:/)).toHaveLength(0)
    expect(entwicklungsdatenBereiche.map((bereich) => bereich.getAttribute('aria-label'))).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/Debug:/)]),
    )
  })
})
