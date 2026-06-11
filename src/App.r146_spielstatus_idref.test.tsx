/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R146 UI-Test für den Spielstatusbereich mit sichtbarem, lokalem aria-labelledby-Ziel.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('R146 Spielstatus-IDREF', () => {
  it('labelt den Spielstatusbereich über seine sichtbare Überschrift statt über ein separates aria-label', () => {
    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const spielstatusBereich = within(spielbereich).getByRole('region', { name: 'Spielstatus' })
    const labelId = spielstatusBereich.getAttribute('aria-labelledby')

    expect(spielstatusBereich).not.toHaveAttribute('aria-label')
    expect(labelId).toBeTruthy()
    expect(labelId).not.toMatch(/\s/)

    const targets = document.querySelectorAll(`[id="${labelId}"]`)
    expect(targets).toHaveLength(1)
    expect(spielstatusBereich).toContainElement(targets[0] as HTMLElement)
    expect(targets[0]).toHaveTextContent('Spielstatus')
    expect(within(spielstatusBereich).getByRole('heading', { name: 'Spielstatus' })).toBe(targets[0])
  })
})
