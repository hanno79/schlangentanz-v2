/*
Author: rahn
Datum: 12.06.2026
Version: 1.0
Beschreibung: R170 A11y-Test — die bestehende Punktetafel kündigt Wertungsänderungen atomar an.
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

describe('R170 Punktetafel-Live-Region', () => {
  it('behält das sichtbare lokale Label und kündigt Punktetafeländerungen atomar höflich an', () => {
    const { container } = render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const wertung = within(spielbereich).getByRole('region', { name: 'Wertung' })
    const punktetafel = within(wertung).getByRole('region', { name: 'Punktetafel' })

    expect(punktetafel).toHaveAttribute('aria-live', 'polite')
    expect(punktetafel).toHaveAttribute('aria-atomic', 'true')
    erwarteEindeutigesLokalesLabel(container, punktetafel)
    expect(within(punktetafel).getByRole('heading', { name: 'Punktetafel' })).toBeVisible()
    expect(within(punktetafel).getAllByRole('listitem')).toHaveLength(2)
    expect(punktetafel).toHaveTextContent('Gesamt:')
    expect(punktetafel).toHaveTextContent('Farbgruppen:')
    expect(punktetafel).toHaveTextContent('Aufgaben:')
  })
})
