/**
 * Author: rahn
 * Datum: 08.06.2026
 * Version: 1.0
 * Beschreibung: R122 UI-Test für spielerfreundliche Karten-und-Aufgaben-Copy in den Entwicklungsdaten.
 */

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const SPIELERFREUNDLICHE_MATERIAL_LABELS = [
  /Karten im Ablagestapel:/,
  /Karten auf dem Ablagestapel:/,
  /Karten im Nachziehstapel:/,
  /Spielmaterial insgesamt:/,
  /Basis-Sonderkarten:/,
  /Erweiterungs-Sonderkarten:/,
  /Aufgaben im Stapel:/,
  /Aktuelle Aufgaben:/,
  /Aufgabenziele:/,
]

const VERALTETE_MATERIAL_LABELS = [
  'Ablagestapelgröße:',
  'Ablagestapel:',
  'Nachziehstapel:',
  'Materialstapel gesamt:',
  'Sonderkarten:',
  'Erweiterungssonderkarten:',
  'Aufgabenstapel:',
  'Offene Aufgaben:',
]

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R122 spielerfreundliche Karten-und-Aufgaben-Copy', () => {
  it('ersetzt technische Material-Labels durch verständliche Spielbegriffe', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const materialstatus = screen.getByRole('complementary', { name: 'Entwicklungsdaten: Karten und Aufgaben' })

    for (const label of SPIELERFREUNDLICHE_MATERIAL_LABELS) {
      expect(within(materialstatus).getByText(label)).toBeVisible()
    }

    const materialZeilen = Array.from(materialstatus.querySelectorAll('p')).map(
      (zeile) => zeile.textContent?.trim() ?? ''
    )
    for (const label of VERALTETE_MATERIAL_LABELS) {
      expect(materialZeilen.some((zeile) => zeile.startsWith(label))).toBe(false)
    }
  })
})
