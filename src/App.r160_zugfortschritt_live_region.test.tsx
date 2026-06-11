/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R160 UI-Test für den Zugfortschritt als höfliche Live-Region mit stabilem sichtbaren Label.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R160 Zugfortschritt Live-Region', () => {
  it('kündigt den sichtbaren Zugfortschritt höflich an und behält das lokale Überschriftenlabel', () => {
    const { container } = render(<App initialZustand={deterministischerZustand()} />)

    const spielstatus = screen.getByRole('region', { name: 'Spielstatus' })
    const zugfortschritt = within(spielstatus).getByRole('region', { name: 'Zugfortschritt' })
    const labelId = zugfortschritt.getAttribute('aria-labelledby')

    expect(zugfortschritt).toHaveAttribute('aria-live', 'polite')
    expect(zugfortschritt).not.toHaveAttribute('aria-label')
    expect(labelId).toBeTruthy()
    expect(labelId?.trim().split(/\s+/)).toHaveLength(1)
    expect(container.querySelectorAll(`#${CSS.escape(labelId ?? '')}`)).toHaveLength(1)
    expect(zugfortschritt.querySelector(`#${CSS.escape(labelId ?? '')}`)).toBeTruthy()
    expect(within(zugfortschritt).getByRole('heading', { name: 'Zugfortschritt' })).toBeVisible()
    expect(within(zugfortschritt).getByText('Aktuelle Phase: Karten ausspielen')).toBeVisible()
  })
})
