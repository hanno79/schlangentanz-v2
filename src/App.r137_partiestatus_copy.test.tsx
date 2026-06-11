/**
 * Author: rahn
 * Datum: 11.06.2026
 * Version: 1.0
 * Beschreibung: R137 UI-Test für spielerfreundliche Partiestatus-Copy in den Entwicklungsdaten.
 */

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase, type Spielzustand } from './engine'

function statusText(zustand: Spielzustand): string {
  render(<App initialZustand={zustand} />)
  return screen.getByRole('complementary', { name: 'Entwicklungsdaten: Spielphase' }).textContent ?? ''
}

function normalspiel(): Spielzustand {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

function endspurt(): Spielzustand {
  const zustand = normalspiel()

  return {
    ...zustand,
    spielphase: 'Endspurt',
    endrunde: {
      ausloeserSpielerIndex: 0,
      verbleibendeSpielerIndizes: [1],
    },
  }
}

function spielende(): Spielzustand {
  return {
    ...normalspiel(),
    spielphase: 'Beendet',
    zugphase: 'Spielende',
  }
}

describe('R137 spielerfreundlicher Partiestatus', () => {
  it('zeigt im Normalspiel einen verständlichen Partiestatus ohne rohen Statuswert', () => {
    const text = statusText(normalspiel())

    expect(text).toContain('Partiestatus: Laufende Partie')
    expect(text).not.toMatch(/Partiestatus:\s*Normal\b/)
  })

  it('zeigt im Endspurt einen verständlichen Partiestatus ohne rohen Statuswert', () => {
    const text = statusText(endspurt())

    expect(text).toContain('Partiestatus: Endrunde läuft')
    expect(text).not.toMatch(/Partiestatus:\s*Endspurt\b/)
  })

  it('zeigt beim Spielende einen verständlichen Partiestatus ohne rohen Statuswert', () => {
    const text = statusText(spielende())
    const spielphaseNachRender = screen.getByRole('complementary', { name: 'Entwicklungsdaten: Spielphase' })

    expect(within(spielphaseNachRender).getByText('Spielende erreicht.')).toBeVisible()
    expect(text).toContain('Partiestatus: Partie beendet')
    expect(text).not.toMatch(/Partiestatus:\s*Beendet\b/)
  })
})
