/*
Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: R111 UI-Regressionstest — Schlangenbereich nutzt eindeutige aria-labelledby-Ziele auch bei mehrfach gerenderter Komponente.
# ÄNDERUNG 07.06.2026: RED-Test gegen doppelte statische Label-IDs im wiederverwendbaren Schlangenbereich ergänzt.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Schlangenbereich from './components/Schlangenbereich'
import type { SpielAktion } from './engine'
import { erstelleSpieltischMitEineSchlange } from './testUtils'

function basisProps() {
  const { zustand } = erstelleSpieltischMitEineSchlange('schlange-r111')

  return {
    aktiverSpieler: zustand.spieler[0],
    gegnerSpieler: [zustand.spieler[1]],
    karteAnlegenAktionen: [] as Extract<SpielAktion, { typ: 'KarteAnlegen' }>[],
    neueSchlangeStartenAktionen: [] as Extract<SpielAktion, { typ: 'NeueSchlangeStarten' }>[],
    gezogeneHandkarteIdRef: { current: null },
    ausgewaehlteHandkarteId: null,
    onAktion: vi.fn(),
    aktionsLabel: (aktion: SpielAktion) => aktion.typ,
  }
}

function erwarteEindeutigesLabelziel(region: HTMLElement) {
  const labelIds = region.getAttribute('aria-labelledby')?.split(/\s+/) ?? []

  expect(labelIds).toHaveLength(1)
  const zielElemente = Array.from(document.querySelectorAll('[id]')).filter(
    (element) => element.id === labelIds[0],
  )
  expect(zielElemente).toHaveLength(1)
}

describe('R111 Schlangenbereich eindeutige Label-IDREFs', () => {
  it('verwendet pro Instanz eigene aria-labelledby-Ziele für Schlangenbereich und Untergruppen', () => {
    const props = basisProps()

    render(
      <>
        <Schlangenbereich {...props} />
        <Schlangenbereich {...props} />
      </>,
    )

    const schlangenbereiche = screen.getAllByRole('region', { name: 'Schlangenbereich' })
    expect(schlangenbereiche).toHaveLength(2)

    const labelRegionen = schlangenbereiche.flatMap((schlangenbereich) => [
      schlangenbereich,
      within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' }),
      within(schlangenbereich).getByRole('region', { name: 'Gegnerische Schlangen' }),
    ])
    const labelIds = labelRegionen.map((region) => region.getAttribute('aria-labelledby'))

    expect(new Set(labelIds).size).toBe(labelIds.length)
    labelRegionen.forEach(erwarteEindeutigesLabelziel)
  })
})
