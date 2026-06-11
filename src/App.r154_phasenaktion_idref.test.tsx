/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R154 UI-Test für die Phasenaktion-Unterregion mit sichtbarem, lokalem aria-labelledby-Ziel.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('R154 Phasenaktion aria-labelledby', () => {
  it('labelt die Phasenaktion über die sichtbare Überschrift ohne separates aria-label', () => {
    render(
      <>
        <App />
        <App />
      </>,
    )

    const spielbereiche = screen.getAllByRole('region', { name: 'Spielbereich' })
    const phasenaktionen = spielbereiche.map((spielbereich) => {
      const aktionenBereich = within(spielbereich).getByRole('region', { name: 'Aktionen' })
      return within(aktionenBereich).getByRole('region', { name: 'Phasenaktion' })
    })
    const labelIds = phasenaktionen.map((phasenaktion) => phasenaktion.getAttribute('aria-labelledby'))

    expect(new Set(labelIds).size).toBe(phasenaktionen.length)

    for (const phasenaktion of phasenaktionen) {
      const labelId = phasenaktion.getAttribute('aria-labelledby')

      expect(phasenaktion).toHaveClass('aktionen-gruppe--phasenaktion')
      expect(phasenaktion).toHaveAttribute('id')
      expect(phasenaktion).toHaveAttribute('tabindex', '-1')
      expect(phasenaktion).not.toHaveAttribute('aria-label')
      expect(labelId).toBeTruthy()
      expect(labelId?.trim().split(/\s+/)).toHaveLength(1)

      const labelZiele = document.querySelectorAll(`#${CSS.escape(labelId ?? '')}`)
      expect(labelZiele).toHaveLength(1)
      expect(phasenaktion).toContainElement(labelZiele[0] as HTMLElement)
      expect(labelZiele[0]).toHaveTextContent('Phasenaktion')
      expect(within(phasenaktion).getByRole('heading', { name: 'Phasenaktion', level: 3 })).toBe(labelZiele[0])
    }
  })
})
