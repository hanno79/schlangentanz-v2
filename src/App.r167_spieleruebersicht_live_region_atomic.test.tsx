/*
Author: rahn
Datum: 12.06.2026
Version: 1.0
Beschreibung: R167 A11y-Test — die bestehende Spielerübersicht kündigt Statuswechsel atomar an.
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

describe('R167 Spielerübersicht-Live-Region', () => {
  it('behält das sichtbare lokale Label und kündigt Spielerstatus atomar höflich an', () => {
    const { container } = render(<App initialZustand={deterministischerZustand()} />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const spieleruebersicht = within(spielbereich).getByRole('region', { name: 'Spielerübersicht' })

    expect(spieleruebersicht).toHaveAttribute('aria-live', 'polite')
    expect(spieleruebersicht).toHaveAttribute('aria-atomic', 'true')
    erwarteEindeutigesLokalesLabel(container, spieleruebersicht)
    expect(within(spieleruebersicht).getByRole('heading', { name: 'Spielerübersicht' })).toBeVisible()
    expect(spieleruebersicht).toHaveTextContent('Spieler 1: 5 Handkarten, 0 Schlangen — am Zug')
    expect(spieleruebersicht).toHaveTextContent('Handkarten insgesamt: 10')
    expect(spieleruebersicht).toHaveTextContent('Schlangen insgesamt: 0')
  })
})
