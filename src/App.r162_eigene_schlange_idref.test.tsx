/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R162 UI-Test für eigene Schlangen-Buttons mit sichtbaren, komponentenlokalen aria-labelledby-Zielen.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import type { Spielzustand } from './engine'
import { erstelleSpieltischMitEineSchlange } from './testUtils'

function zustandMitBenannterSchlange(id: string): Spielzustand {
  return erstelleSpieltischMitEineSchlange(id).zustand
}

function erwarteSichtbaresLokalesSchlangenLabel(region: HTMLElement, button: HTMLElement, erwarteteId: string) {
  expect(button).not.toHaveAttribute('aria-label')

  const labelIds = button.getAttribute('aria-labelledby')?.split(/\s+/) ?? []
  expect(labelIds).toHaveLength(2)
  expect(new Set(labelIds).size).toBe(2)

  const labelZiele = labelIds.map((id) => document.getElementById(id))
  expect(labelZiele.every(Boolean)).toBe(true)
  for (const ziel of labelZiele) {
    expect(document.querySelectorAll(`#${CSS.escape(ziel!.id)}`)).toHaveLength(1)
    expect(region).toContainElement(ziel as HTMLElement)
    expect(button).toContainElement(ziel as HTMLElement)
  }

  expect(labelZiele[0]).toHaveTextContent('Schlange')
  expect(labelZiele[1]).toHaveTextContent(erwarteteId)
  expect(button).toHaveAccessibleName(`Schlange ${erwarteteId}`)
}

describe('R162 Eigene-Schlange aria-labelledby', () => {
  it('benennt eigene Schlangen-Buttons über sichtbare lokale Ziele statt aria-label', () => {
    render(
      <>
        <App initialZustand={zustandMitBenannterSchlange('schlange r162 alpha')} />
        <App initialZustand={zustandMitBenannterSchlange('schlange r162 beta')} />
      </>,
    )

    const schlangenbereiche = screen.getAllByRole('region', { name: 'Schlangenbereich' })
    const eigeneSchlangen = schlangenbereiche.map((bereich) =>
      within(within(bereich).getByRole('region', { name: 'Eigene Schlangen' })).getByRole('button', {
        name: /Schlange schlange r162 (alpha|beta)/,
      }),
    )

    expect(eigeneSchlangen.map((schlange) => schlange.getAttribute('aria-labelledby'))).toEqual([
      expect.any(String),
      expect.any(String),
    ])
    expect(new Set(eigeneSchlangen.map((schlange) => schlange.getAttribute('aria-labelledby'))).size).toBe(2)
    erwarteSichtbaresLokalesSchlangenLabel(schlangenbereiche[0], eigeneSchlangen[0], 'schlange r162 alpha')
    erwarteSichtbaresLokalesSchlangenLabel(schlangenbereiche[1], eigeneSchlangen[1], 'schlange r162 beta')
  })
})
