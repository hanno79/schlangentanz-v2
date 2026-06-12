/*
Author: rahn
Datum: 12.06.2026
Version: 1.0
Beschreibung: R168 A11y-Test — die bestehende Region Material und Aufgaben kündigt Material-/Aufgabenwechsel atomar an.
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

describe('R168 Material und Aufgaben-Live-Region', () => {
  it('behält das sichtbare lokale Label und kündigt Material- und Aufgabenwechsel atomar höflich an', () => {
    const { container } = render(<App initialZustand={deterministischerZustand()} />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const materialUndAufgaben = within(spielbereich).getByRole('region', { name: 'Material und Aufgaben' })

    expect(materialUndAufgaben).toHaveAttribute('aria-live', 'polite')
    expect(materialUndAufgaben).toHaveAttribute('aria-atomic', 'true')
    erwarteEindeutigesLokalesLabel(container, materialUndAufgaben)
    expect(within(materialUndAufgaben).getByRole('heading', { name: 'Material und Aufgaben' })).toBeVisible()
    expect(within(materialUndAufgaben).getByRole('region', { name: 'Aufgabenkarten' })).toBeVisible()
    expect(materialUndAufgaben).toHaveTextContent('Karten im Nachziehstapel:')
    expect(materialUndAufgaben).toHaveTextContent('Aktuelle Aufgaben:')
  })
})
