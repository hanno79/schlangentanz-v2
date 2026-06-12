/*
Author: rahn
Datum: 12.06.2026
Version: 1.0
Beschreibung: R169 A11y-Test — die bestehende Wertungsregion kündigt Punktestandsänderungen atomar an.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

function erwarteEindeutigesLokalesLabel(container: HTMLElement, region: HTMLElement) {
  const labelId = region.getAttribute('aria-labelledby')

  expect(region).not.toHaveAttribute('aria-label')
  expect(labelId).toBeTruthy()
  expect(labelId?.trim().split(/\s+/)).toHaveLength(1)
  expect(container.querySelectorAll(`#${CSS.escape(labelId ?? '')}`)).toHaveLength(1)
  expect(region.querySelector(`#${CSS.escape(labelId ?? '')}`)).toBeTruthy()
}

describe('R169 Wertung-Live-Region', () => {
  it('behält das sichtbare lokale Label und kündigt Wertungsänderungen atomar höflich an', () => {
    const { container } = render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const wertung = within(spielbereich).getByRole('region', { name: 'Wertung' })

    expect(wertung).toHaveAttribute('aria-live', 'polite')
    expect(wertung).toHaveAttribute('aria-atomic', 'true')
    erwarteEindeutigesLokalesLabel(container, wertung)
    expect(within(wertung).getByRole('heading', { name: 'Wertung' })).toBeVisible()
    expect(within(wertung).getByRole('region', { name: 'Punktetafel' })).toBeVisible()
    expect(wertung).toHaveTextContent('Punktestand von Spieler 1:')
    expect(wertung).toHaveTextContent('Gesamt:')
  })
})
