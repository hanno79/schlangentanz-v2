/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R158 UI-Test für die Startzone mit sichtbarem, komponentenlokalem aria-labelledby-Ziel.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('R158 Startzone aria-labelledby', () => {
  it('labelt die Startzone über ihren sichtbaren Titel ohne separates aria-label', () => {
    render(
      <>
        <App />
        <App />
      </>,
    )

    const spielbereiche = screen.getAllByRole('region', { name: 'Spielbereich' })
    const startzonen = spielbereiche.map((spielbereich) => {
      const schlangenbereich = within(spielbereich).getByRole('region', { name: 'Schlangenbereich' })
      return within(schlangenbereich).getByRole('button', { name: 'Neue Schlange starten' })
    })
    const labelIds = startzonen.map((startzone) => startzone.getAttribute('aria-labelledby'))

    expect(new Set(labelIds).size).toBe(startzonen.length)

    for (const startzone of startzonen) {
      const labelId = startzone.getAttribute('aria-labelledby')

      expect(startzone).not.toHaveAttribute('aria-label')
      expect(labelId).toBeTruthy()
      expect(labelId?.trim().split(/\s+/)).toHaveLength(1)

      const labelZiele = document.querySelectorAll(`#${CSS.escape(labelId ?? '')}`)
      expect(labelZiele).toHaveLength(1)
      expect(startzone).toContainElement(labelZiele[0] as HTMLElement)
      expect(labelZiele[0]).toHaveTextContent('Neue Schlange starten')
      expect(within(startzone).getByText('Neue Schlange starten')).toBe(labelZiele[0])
    }
  })
})
