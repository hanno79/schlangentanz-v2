/*
Author: rahn
Datum: 12.06.2026
Version: 1.0
Beschreibung: R166 A11y-Test — die bestehende Spielstatus-Region kündigt Phasen-/Statuswechsel atomar an.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

function erwarteEindeutigesLokalesLabel(container: HTMLElement, region: HTMLElement) {
  const labelId = region.getAttribute('aria-labelledby')

  expect(region).not.toHaveAttribute('aria-label')
  expect(labelId).toBeTruthy()
  expect(labelId?.trim().split(/\s+/)).toHaveLength(1)
  expect(container.querySelectorAll(`#${CSS.escape(labelId ?? '')}`)).toHaveLength(1)
  expect(region.querySelector(`#${CSS.escape(labelId ?? '')}`)).toBeTruthy()
}

describe('R166 Spielstatus-Live-Region', () => {
  it('behält das sichtbare lokale Label und kündigt Statuswechsel atomar höflich an', () => {
    const { container } = render(<App initialZustand={deterministischerZustand()} />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const spielstatus = within(spielbereich).getByRole('region', { name: 'Spielstatus' })

    expect(spielstatus).toHaveAttribute('aria-live', 'polite')
    expect(spielstatus).toHaveAttribute('aria-atomic', 'true')
    erwarteEindeutigesLokalesLabel(container, spielstatus)
    expect(within(spielstatus).getByRole('heading', { name: 'Spielstatus' })).toBeVisible()
    expect(spielstatus).toHaveTextContent('Aktueller Spielschritt: Karten ausspielen')
    expect(within(spielstatus).getByRole('region', { name: 'Zugfortschritt' })).toBeVisible()
  })
})
