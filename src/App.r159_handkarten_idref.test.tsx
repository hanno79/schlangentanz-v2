/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R159 UI-Test für das Handkarten-Panel mit sichtbarem, komponentenlokalem aria-labelledby-Ziel.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('R159 Handkarten aria-labelledby', () => {
  it('labelt das Handkarten-Panel über sichtbaren Handkarten-Text ohne separates aria-label', () => {
    render(
      <>
        <App />
        <App />
      </>,
    )

    const spielbereiche = screen.getAllByRole('region', { name: 'Spielbereich' })
    const handkartenBereiche = spielbereiche.map((spielbereich) => {
      const aktiverSpieler = within(spielbereich).getByRole('region', { name: 'Aktiver Spieler' })
      const spieltisch = within(aktiverSpieler).getByRole('region', { name: 'Spieltisch' })
      return within(spieltisch).getByRole('region', { name: 'Handkarten' })
    })
    const labelIds = handkartenBereiche.map((handkartenBereich) => handkartenBereich.getAttribute('aria-labelledby'))

    expect(new Set(labelIds).size).toBe(handkartenBereiche.length)

    for (const handkartenBereich of handkartenBereiche) {
      const labelId = handkartenBereich.getAttribute('aria-labelledby')

      expect(handkartenBereich).not.toHaveAttribute('aria-label')
      expect(labelId).toBeTruthy()
      expect(labelId?.trim().split(/\s+/)).toHaveLength(1)

      const labelZiele = document.querySelectorAll(`#${CSS.escape(labelId ?? '')}`)
      expect(labelZiele).toHaveLength(1)
      expect(handkartenBereich).toContainElement(labelZiele[0] as HTMLElement)
      expect(labelZiele[0]).toHaveTextContent('Handkarten')
      expect(within(handkartenBereich).getByRole('heading', { name: 'Handkarten als Kartenleiste' })).toBeVisible()
    }
  })
})
