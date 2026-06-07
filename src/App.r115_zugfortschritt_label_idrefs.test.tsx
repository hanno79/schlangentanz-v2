/*
Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: R115 Regressionstest — Zugfortschritt nutzt komponentenlokale Label-IDREFs statt statischer Landmark-Beschriftung.
# ÄNDERUNG 07.06.2026: RED-Test für eindeutige aria-labelledby-Ziele bei mehrfach gerendertem Zugfortschritt ergänzt.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Zugfortschritt from './components/Zugfortschritt'

function erwarteEindeutigesLabelZiel(container: HTMLElement, region: HTMLElement) {
  const labelId = region.getAttribute('aria-labelledby')

  expect(labelId).toBeTruthy()
  expect(labelId?.trim().split(/\s+/)).toHaveLength(1)
  expect(container.querySelectorAll(`#${CSS.escape(labelId ?? '')}`)).toHaveLength(1)
  expect(region.querySelector(`#${CSS.escape(labelId ?? '')}`)).toBeTruthy()
}

describe('R115 Zugfortschritt Label-IDREFs', () => {
  it('labelt jede Zugfortschritt-Region über eine eigene komponentenlokale Überschrift', () => {
    const { container } = render(
      <>
        <Zugfortschritt zugphase="Nachziehphase" />
        <Zugfortschritt zugphase="Ausspielphase" />
      </>,
    )

    const regionen = screen.getAllByRole('region', { name: 'Zugfortschritt' })

    expect(regionen).toHaveLength(2)
    for (const region of regionen) {
      erwarteEindeutigesLabelZiel(container, region)
      expect(within(region).getByRole('heading', { name: 'Zugfortschritt' })).toBeInTheDocument()
    }
    expect(new Set(regionen.map((region) => region.getAttribute('aria-labelledby'))).size).toBe(2)
  })
})
