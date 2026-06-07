/*
Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: R112 Regressionstest für komponentenlokale App-Shell-Label-IDREFs.
# ÄNDERUNG 07.06.2026: Prüft, dass mehrfach gerenderte App-Instanzen keine doppelten
# aria-labelledby-Ziele für Hero und Spieltisch erzeugen.
*/
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

function erwarteEindeutigeLabelIdrefs(container: HTMLElement, selector: string) {
  const regionen = Array.from(container.querySelectorAll<HTMLElement>(selector))
  const labelIds = regionen.map((region) => region.getAttribute('aria-labelledby'))

  expect(regionen).toHaveLength(2)
  expect(new Set(labelIds).size).toBe(2)

  for (const labelId of labelIds) {
    expect(labelId).toBeTruthy()
    expect(labelId?.trim().split(/\s+/)).toHaveLength(1)
    expect(container.querySelectorAll(`#${CSS.escape(labelId ?? '')}`)).toHaveLength(1)
  }
}

describe('R112 App-Shell Label-IDREFs', () => {
  it('erzeugt bei zwei App-Instanzen eindeutige Label-Ziele für Hero und Spieltisch', () => {
    const { container } = render(
      <>
        <App initialZustand={deterministischerZustand()} />
        <App initialZustand={deterministischerZustand()} />
      </>,
    )

    erwarteEindeutigeLabelIdrefs(container, '.hero[aria-labelledby]')
    erwarteEindeutigeLabelIdrefs(container, '.spielbrett[aria-labelledby]')
  })
})
