/**
 * @vitest-environment jsdom
 * Author: rahn
 * Datum: 12.06.2026
 * Version: 1.0
 * Beschreibung: R174 A11y-Test — die bestehende Empfohlene-Aktion-Unterregion kündigt wechselnde Empfehlung atomar an.
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
  expect(labelZiele[0]).toHaveTextContent('Empfohlene Aktion')
}

describe('R174 Empfohlene-Aktion-Live-Region', () => {
  it('kündigt die empfohlene Aktion höflich und atomar über ihr sichtbares Label an', () => {
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const aktionen = within(spielbereich).getByRole('region', { name: 'Aktionen' })
    const empfohleneAktion = within(aktionen).getByRole('region', { name: 'Empfohlene Aktion' })

    expect(empfohleneAktion).toHaveAttribute('aria-live', 'polite')
    expect(empfohleneAktion).toHaveAttribute('aria-atomic', 'true')
    erwarteEindeutigesLokalesLabel(empfohleneAktion)
    expect(within(empfohleneAktion).getByRole('heading', { name: 'Empfohlene Aktion' })).toBeVisible()
    expect(within(empfohleneAktion).getByRole('button')).toHaveAccessibleName(/Neue Schlange starten mit Karte/)
  })
})
