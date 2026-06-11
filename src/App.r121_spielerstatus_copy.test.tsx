/**
 * Author: rahn
 * Datum: 08.06.2026
 * Version: 1.1
 * Beschreibung: R121 UI-Test für spielerfreundliche Spielerstatus-Inhalte ohne interne Übersichts- und Zustands-Copy.
 *               v1.1: Angepasst an R127 spielerfreundliche Copy (Name statt ID, keine rohen Schlangen-IDs).
 */

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, schlange } from './engine/__tests__/testHelpers'

const ALTE_SPIELERSTATUS_BEGRIFFE = [
  /Spielerübersicht spieler-1:/,
  /Schlangenübersicht spieler-1:/,
  new RegExp('Schlangenzustand spieler-1/'),
  /Spieler spieler-\d:.*\((Mensch|KI)\)/,
  /Schlangen von spieler-\d/,
  /Erfüllte Aufgaben spieler-\d/,
]

function deterministischerZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].schlangen = [schlange([farbkarte('rot-r121-1', 'Rot')], 'schlange-r121-1')]
  return zustand
}

describe('R121 spielerfreundliche Spielerstatus-Inhalte', () => {
  it('benennt Spielerstatus-Zeilen als verständliche Spielinformationen statt interne Übersichten', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const spielerstatus = screen.getByRole('complementary', { name: 'Entwicklungsdaten: Spielerstatus' })

    // Spieler mit Name statt ID, keine Steuerung in Klammern
    expect(within(spielerstatus).getByText(/^Spieler 1:/)).toBeVisible()
    // Schlangenstatus spielerfreundlich
    expect(within(spielerstatus).getByText(/Schlange 1 von Spieler 1: spielbereit\./)).toBeVisible()
    expect(within(spielerstatus).getByText(/Schlangen insgesamt:/)).toBeVisible()
    expect(within(spielerstatus).getByText(/Handkarten insgesamt:/)).toBeVisible()

    const spielerstatusText = spielerstatus.textContent ?? ''
    expect(spielerstatusText).not.toMatch(/\bspieler-\d\b/)
    expect(spielerstatusText).not.toMatch(/schlange-r121-\d/)
    for (const begriff of ALTE_SPIELERSTATUS_BEGRIFFE) {
      expect(spielerstatusText).not.toMatch(begriff)
    }
    expect(spielerstatusText).not.toMatch(/\((Mensch|KI)\)/)
  })
})
