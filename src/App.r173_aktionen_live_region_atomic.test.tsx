/**
 * @vitest-environment jsdom
 * Author: rahn
 * Datum: 12.06.2026
 * Version: 1.0
 * Beschreibung: R173 A11y-Test — die bestehende Aktionen-Region kündigt neue Aktionsoptionen atomar an.
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
  expect(labelZiele[0]).toHaveTextContent('Aktionen')
}

describe('R173 Aktionen-Live-Region', () => {
  it('kündigt den Aktionenbereich höflich und atomar über sein sichtbares Label an', () => {
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const aktiverSpieler = within(spielbereich).getByRole('region', { name: 'Aktiver Spieler' })
    const aktionen = within(aktiverSpieler).getByRole('region', { name: 'Aktionen' })

    expect(aktionen).toHaveAttribute('aria-live', 'polite')
    expect(aktionen).toHaveAttribute('aria-atomic', 'true')
    erwarteEindeutigesLokalesLabel(aktionen)
    expect(within(aktionen).getByRole('heading', { name: 'Aktionen' })).toBeVisible()
    expect(aktionen).toHaveTextContent('Spielbare Aktionen:')
    expect(within(aktionen).getByRole('region', { name: 'Empfohlene Aktion' })).toBeVisible()
    expect(within(aktionen).getByRole('region', { name: 'Weitere Aktionen' })).toBeVisible()
  })
})
