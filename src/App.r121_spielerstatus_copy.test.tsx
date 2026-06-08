/**
 * Author: rahn
 * Datum: 08.06.2026
 * Version: 1.0
 * Beschreibung: R121 UI-Test für spielerfreundliche Spielerstatus-Inhalte ohne interne Übersichts- und Zustands-Copy.
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
  /Schlangen gesamt:/,
  /Handkarten gesamt:/,
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

    expect(within(spielerstatus).getByText(/Spieler spieler-1:/)).toBeVisible()
    expect(within(spielerstatus).getByText(/Schlangen von spieler-1:/)).toBeVisible()
    expect(within(spielerstatus).getByText(new RegExp('Status von Schlange spieler-1/'))).toBeVisible()
    expect(within(spielerstatus).getByText(/Schlangen insgesamt:/)).toBeVisible()
    expect(within(spielerstatus).getByText(/Handkarten insgesamt:/)).toBeVisible()

    const spielerstatusText = spielerstatus.textContent ?? ''
    for (const alterBegriff of ALTE_SPIELERSTATUS_BEGRIFFE) {
      expect(spielerstatusText).not.toMatch(alterBegriff)
    }
  })
})
