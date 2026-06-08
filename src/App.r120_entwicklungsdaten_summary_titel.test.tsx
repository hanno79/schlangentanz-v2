/**
 * Author: rahn
 * Datum: 08.06.2026
 * Version: 1.0
 * Beschreibung: R120 UI-Test für spielerfreundliche Entwicklungsdaten-Summary-Titel ohne technische Status-/Detail-Begriffe.
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const SPIELERFREUNDLICHE_ENTWICKLUNGSDATEN_TITEL = [
  'Spielphase',
  'Aktiver Spieler',
  'Spielerstatus',
  'Karten und Aufgaben',
  'Punkteübersicht',
]

const VERALTETE_ENTWICKLUNGSDATEN_TITEL = [
  'Phasenstatus',
  'Spielerzustände',
  'Materialstatus',
  'Wertungsdetails',
]

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R120 spielerfreundliche Entwicklungsdaten-Summary-Titel', () => {
  it('benennt die einklappbaren Entwicklungsdaten nach Spielbereichen statt technischen Statusdetails', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    for (const titel of SPIELERFREUNDLICHE_ENTWICKLUNGSDATEN_TITEL) {
      expect(screen.getByRole('complementary', { name: `Entwicklungsdaten: ${titel}` })).toBeVisible()
    }

    for (const titel of VERALTETE_ENTWICKLUNGSDATEN_TITEL) {
      expect(screen.queryByRole('complementary', { name: `Entwicklungsdaten: ${titel}` })).toBeNull()
      expect(screen.queryByText(titel, { selector: 'summary' })).toBeNull()
    }
  })
})
