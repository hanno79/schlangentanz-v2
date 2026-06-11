/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R157 UI-Test für die Phasenregeln-Region mit sichtbarem, lokalem aria-labelledby-Ziel.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('R157 Phasenregeln aria-labelledby', () => {
  it('labelt die Phasenregeln-Region über die sichtbare Überschrift ohne separates aria-label', () => {
    render(
      <>
        <App />
        <App />
      </>,
    )

    const spielbereiche = screen.getAllByRole('region', { name: 'Spielbereich' })
    const phasenregeln = spielbereiche.map((spielbereich) => {
      const aktionenBereich = within(spielbereich).getByRole('region', { name: 'Aktionen' })
      return within(aktionenBereich).getByRole('region', { name: 'Phasenregeln' })
    })
    const labelIds = phasenregeln.map((region) => region.getAttribute('aria-labelledby'))

    expect(new Set(labelIds).size).toBe(phasenregeln.length)

    for (const region of phasenregeln) {
      const labelId = region.getAttribute('aria-labelledby')

      expect(region).not.toHaveAttribute('aria-label')
      expect(labelId).toBeTruthy()
      expect(labelId?.trim().split(/\s+/)).toHaveLength(1)

      const labelZiele = document.querySelectorAll(`#${CSS.escape(labelId ?? '')}`)
      expect(labelZiele).toHaveLength(1)
      expect(region).toContainElement(labelZiele[0] as HTMLElement)
      expect(labelZiele[0]).toHaveTextContent('Phasenregeln')
      expect(within(region).getByRole('heading', { name: 'Phasenregeln', level: 3 })).toBe(labelZiele[0])
      expect(within(region).getByRole('heading', { name: 'Spielbare Aktionen in dieser Phase', level: 4 })).toBeVisible()
    }
  })
})
