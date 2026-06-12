/*
Author: rahn
Datum: 12.06.2026
Version: 1.0
Beschreibung: R165 A11y-Test — die bestehende Aktiver-Spieler-Live-Region kündigt Statuswechsel atomar an.
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

describe('R165 Aktiver-Spieler-Live-Region', () => {
  it('behält das sichtbare lokale Label und kündigt Wechsel atomar höflich an', () => {
    const { container } = render(<App initialZustand={deterministischerZustand()} />)

    const aktiverSpieler = screen.getByRole('region', { name: 'Aktiver Spieler' })

    expect(aktiverSpieler).toHaveAttribute('aria-live', 'polite')
    expect(aktiverSpieler).toHaveAttribute('aria-atomic', 'true')
    erwarteEindeutigesLokalesLabel(container, aktiverSpieler)
    expect(within(aktiverSpieler).getByRole('heading', { name: 'Aktiver Spieler' })).toBeVisible()
    expect(within(aktiverSpieler).getByRole('region', { name: 'Spieltisch' })).toBeVisible()
    expect(within(aktiverSpieler).getByRole('region', { name: 'Aktionen' })).toBeVisible()
  })
})
