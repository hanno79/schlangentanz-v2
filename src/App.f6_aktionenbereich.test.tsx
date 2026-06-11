/*
Author: rahn
Datum: 04.06.2026
Version: 1.0
Beschreibung: F6 UI-Test für einen visuell strukturierten Aktionenbereich mit empfohlener Aktion und Phasenaktion.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { anwendeAktion, ermittleLegaleAktionen, erstelleSpielzustand, starteAusspielphase } from './engine'

function zustandMitGespielterAktion() {
  const startzustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const ersteAktion = ermittleLegaleAktionen(startzustand)[0]

  if (!ersteAktion) throw new Error('Testsetup erwartet mindestens eine legale Aktion.')

  return anwendeAktion(startzustand, ersteAktion)
}

describe('F6 Aktionenbereich', () => {
  it('gruppiert empfohlene und weitere legale Aktionen sichtbar getrennt', () => {
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
    const empfohleneAktion = within(aktionenBereich).getByRole('region', { name: 'Empfohlene Aktion' })
    const weitereAktionen = within(aktionenBereich).getByRole('region', { name: 'Weitere Aktionen' })

    expect(within(weitereAktionen).getByRole('heading', { name: 'Weitere legale Aktionen' })).toBeInTheDocument()

    expect(within(empfohleneAktion).getByRole('button')).toHaveClass('aktions-button--empfohlen')
    expect(within(weitereAktionen).getAllByRole('button').length).toBeGreaterThan(0)
    expect(within(weitereAktionen).getByText('Spielregeln prüfen jede Aktion vor dem Ausführen.')).toBeVisible()
    expect(within(weitereAktionen).queryByText(/engine\.ermittleLegaleAktionen/i)).not.toBeInTheDocument()
    expect(within(weitereAktionen).queryByText(/^Quelle:/i)).not.toBeInTheDocument()
  })

  it('gruppiert Phasenaktionen getrennt von legalen Engine-Aktionen', () => {
    render(<App initialZustand={zustandMitGespielterAktion()} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
    const phasenaktion = within(aktionenBereich).getByRole('region', { name: 'Phasenaktion' })

    expect(within(phasenaktion).getByRole('button', { name: 'Ausspielphase beenden' })).toBeInTheDocument()
  })
})
