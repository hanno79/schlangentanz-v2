/**
 * @vitest-environment jsdom
 * Author: rahn
 * Datum: 12.06.2026
 * Version: 1.0
 * Beschreibung: R175 A11y-Test — die bestehende Weitere-Aktionen-Unterregion kündigt wechselnde Aktionsoptionen atomar an.
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
  expect(labelZiele[0]).toHaveTextContent('Weitere Aktionen')
}

describe('R175 Weitere-Aktionen-Live-Region', () => {
  it('kündigt weitere Aktionen höflich und atomar über ihr sichtbares Label an', () => {
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const aktionen = within(spielbereich).getByRole('region', { name: 'Aktionen' })
    const weitereAktionen = within(aktionen).getByRole('region', { name: 'Weitere Aktionen' })

    expect(weitereAktionen).toHaveAttribute('aria-live', 'polite')
    expect(weitereAktionen).toHaveAttribute('aria-atomic', 'true')
    erwarteEindeutigesLokalesLabel(weitereAktionen)
    expect(within(weitereAktionen).getByRole('heading', { name: 'Weitere Aktionen' })).toBeVisible()
    expect(within(weitereAktionen).getByText('Spielregeln prüfen jede Aktion vor dem Ausführen.')).toBeVisible()
  })
})
