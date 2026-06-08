/**
 * Author: rahn
 * Datum: 08.06.2026
 * Version: 1.0
 * Beschreibung: R123 UI-Test für spielerfreundliche Spielphase-Copy in den Entwicklungsdaten.
 */

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const SPIELERFREUNDLICHE_SPIELPHASE_LABELS = [
  /Aktueller Spielschritt: Ausspielphase/,
  /Spielschritt im Zug: Ausspielphase/,
  /Partiestatus: Normal/,
  /Am Zug: Spieler 1 von 2/,
]

const VERALTETE_SPIELPHASE_LABELS = [
  'Zugphase:',
  'Spielphase:',
  'Spieler am Zug:',
]

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R123 spielerfreundliche Spielphase-Copy', () => {
  it('ersetzt technische Phasen-Labels durch verständliche Spielinformationen', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const spielphase = screen.getByRole('complementary', { name: 'Entwicklungsdaten: Spielphase' })

    for (const label of SPIELERFREUNDLICHE_SPIELPHASE_LABELS) {
      expect(within(spielphase).getByText(label)).toBeVisible()
    }

    const spielphaseZeilen = Array.from(spielphase.querySelectorAll('p')).map(
      (zeile) => zeile.textContent?.trim() ?? ''
    )
    for (const label of VERALTETE_SPIELPHASE_LABELS) {
      expect(spielphaseZeilen.some((zeile) => zeile.startsWith(label))).toBe(false)
    }
  })
})
