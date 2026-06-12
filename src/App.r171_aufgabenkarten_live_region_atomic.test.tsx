/**
 * @vitest-environment jsdom
 * Author: rahn
 * Datum: 12.06.2026
 * Version: 1.0
 * Beschreibung: R171 A11y-Test — die bestehende Aufgabenkarten-Unterregion kündigt Aufgabenwechsel atomar an.
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
  expect(labelZiele[0]).toHaveTextContent('Aufgabenkarten')
}

describe('R171 Aufgabenkarten-Live-Region', () => {
  it('kündigt die Aufgabenkarten-Unterregion höflich und atomar über ihr sichtbares Label an', () => {
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const materialUndAufgaben = within(spielbereich).getByRole('region', { name: 'Material und Aufgaben' })
    const aufgabenkarten = within(materialUndAufgaben).getByRole('region', { name: 'Aufgabenkarten' })

    expect(aufgabenkarten).toHaveAttribute('aria-live', 'polite')
    expect(aufgabenkarten).toHaveAttribute('aria-atomic', 'true')
    erwarteEindeutigesLokalesLabel(aufgabenkarten)
    expect(within(aufgabenkarten).getByRole('heading', { name: 'Aufgabenkarten' })).toBeVisible()
    const karten = within(aufgabenkarten).getAllByRole('listitem')
    expect(karten).toHaveLength(3)
    expect(karten[0]).toHaveTextContent('Farbkombination')
    expect(karten[0]).toHaveTextContent('Habe 5 oder mehr Karten der gleichen Farbe in einer Schlange.')
  })
})
