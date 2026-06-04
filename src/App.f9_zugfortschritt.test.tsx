/*
Author: rahn
Datum: 04.06.2026
Version: 1.0
Beschreibung: F9 UI-Test für den Zug- und Phasen-Fortschritt als Schrittleiste.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase, type Spielzustand } from './engine'

const SCHRITTE = [
  { phase: 'Nachziehphase', label: 'Nachziehphase' },
  { phase: 'Ausspielphase', label: 'Ausspielphase' },
  { phase: 'Aufgabenpruefung', label: 'Aufgabenprüfung' },
  { phase: 'Zugabschluss', label: 'Zugabschluss' },
  { phase: 'Spielende', label: 'Spielende' },
] as const

function zustandInPhase(phase: Spielzustand['zugphase']): Spielzustand {
  return {
    ...starteAusspielphase(erstelleSpielzustand(2, () => 0.999999)),
    zugphase: phase,
  }
}

describe('F9 Zugfortschritt', () => {
  it.each(SCHRITTE)('zeigt $label als aktive Phase in der Schrittleiste', ({ phase, label }) => {
    render(<App initialZustand={zustandInPhase(phase)} />)

    const spielstatus = screen.getByRole('region', { name: 'Spielstatus' })
    const zugfortschritt = within(spielstatus).getByRole('region', { name: 'Zugfortschritt' })
    const schritte = within(zugfortschritt).getAllByRole('listitem')

    expect(within(zugfortschritt).getByRole('heading', { name: 'Zugfortschritt' })).toBeInTheDocument()
    expect(schritte).toHaveLength(SCHRITTE.length)

    SCHRITTE.forEach((schritt, index) => {
      expect(schritte[index]).toHaveTextContent(`${index + 1}. ${schritt.label}`)
    })

    const aktiveSchritte = schritte.filter(schritt => schritt.getAttribute('aria-current') === 'step')
    expect(aktiveSchritte).toHaveLength(1)
    expect(within(zugfortschritt).getByText(`Aktuelle Phase: ${label}`)).toBeInTheDocument()
    expect(aktiveSchritte[0]).toHaveTextContent(label)
    expect(aktiveSchritte[0]).toHaveTextContent('Aktiv')
    expect(within(spielstatus).getByText(`Zugphase: ${phase}`)).toBeInTheDocument()
  })
})
