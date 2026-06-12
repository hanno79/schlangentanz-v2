/**
 * @vitest-environment jsdom
 * Author: rahn
 * Datum: 12.06.2026
 * Version: 1.0
 * Beschreibung: R172 A11y-Test — der bestehende Spieltisch kündigt Hand- und Schlangenänderungen atomar an.
 */
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function erwarteEindeutigesLokalesLabel(region: HTMLElement) {
  const labelId = region.getAttribute('aria-labelledby')

  expect(region).not.toHaveAttribute('aria-label')
  expect(labelId).toBeTruthy()
  expect(labelId?.trim().split(/\s+/)).toHaveLength(1)

  const labelZiele = Array.from(document.querySelectorAll<HTMLElement>(`#${CSS.escape(labelId ?? '')}`))
  expect(labelZiele).toHaveLength(1)
  expect(region).toContainElement(labelZiele[0])
  expect(labelZiele[0]).toHaveTextContent('Spieltisch')
}

describe('R172 Spieltisch-Live-Region', () => {
  it('kündigt den Spieltisch höflich und atomar über sein sichtbares Label an', () => {
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const aktiverSpieler = within(spielbereich).getByRole('region', { name: 'Aktiver Spieler' })
    const spieltisch = within(aktiverSpieler).getByRole('region', { name: 'Spieltisch' })

    expect(spieltisch).toHaveAttribute('aria-live', 'polite')
    expect(spieltisch).toHaveAttribute('aria-atomic', 'true')
    erwarteEindeutigesLokalesLabel(spieltisch)
    expect(within(spieltisch).getByRole('heading', { name: 'Spieltisch' })).toBeVisible()
    expect(within(spieltisch).getByRole('region', { name: 'Handkarten' })).toBeVisible()
    expect(within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })).toBeVisible()
  })
})
