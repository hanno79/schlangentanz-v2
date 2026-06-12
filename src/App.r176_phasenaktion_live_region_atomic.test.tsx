/**
 * @vitest-environment jsdom
 * Author: rahn
 * Datum: 12.06.2026
 * Version: 1.0
 * Beschreibung: R176 A11y-Test — die bestehende Phasenaktion-Unterregion kündigt wechselnde Phasenaktionen atomar an.
 */
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand } from './engine'

function erwarteEindeutigesLokalesLabel(region: HTMLElement) {
  const labelId = region.getAttribute('aria-labelledby')

  expect(region).not.toHaveAttribute('aria-label')
  expect(labelId).toBeTruthy()
  expect(labelId?.trim().split(/\s+/)).toHaveLength(1)

  const labelZiele = Array.from(document.querySelectorAll<HTMLElement>(`#${CSS.escape(labelId ?? '')}`))
  expect(labelZiele).toHaveLength(1)
  expect(region).toContainElement(labelZiele[0])
  expect(labelZiele[0]).toHaveTextContent('Phasenaktion')
}

describe('R176 Phasenaktion-Live-Region', () => {
  it('kündigt die Phasenaktion höflich und atomar über ihr sichtbares Label an', () => {
    render(<App initialZustand={erstelleSpielzustand(2, () => 0.999999)} />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const aktionen = within(spielbereich).getByRole('region', { name: 'Aktionen' })
    const phasenaktion = within(aktionen).getByRole('region', { name: 'Phasenaktion' })

    expect(phasenaktion).toHaveAttribute('aria-live', 'polite')
    expect(phasenaktion).toHaveAttribute('aria-atomic', 'true')
    erwarteEindeutigesLokalesLabel(phasenaktion)
    expect(within(phasenaktion).getByRole('heading', { name: 'Phasenaktion' })).toBeVisible()
    expect(within(phasenaktion).getByRole('button', { name: 'Ausspielphase starten' })).toBeVisible()
  })
})
