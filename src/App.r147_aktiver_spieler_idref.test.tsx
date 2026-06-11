/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R147 UI-Test für den Aktiver-Spieler-Bereich mit sichtbarem, lokalem aria-labelledby-Ziel.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('R147 Aktiver-Spieler-IDREF', () => {
  it('labelt den Aktiver-Spieler-Bereich über seine sichtbare Überschrift statt über ein separates aria-label', () => {
    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const aktiverSpielerBereich = within(spielbereich).getByRole('region', { name: 'Aktiver Spieler' })
    const labelId = aktiverSpielerBereich.getAttribute('aria-labelledby')

    expect(aktiverSpielerBereich).not.toHaveAttribute('aria-label')
    expect(aktiverSpielerBereich).toHaveAttribute('aria-live', 'polite')
    expect(labelId).toBeTruthy()
    expect(labelId).not.toMatch(/\s/)

    const targets = document.querySelectorAll(`[id="${labelId}"]`)
    expect(targets).toHaveLength(1)
    expect(aktiverSpielerBereich).toContainElement(targets[0] as HTMLElement)
    expect(targets[0]).toHaveTextContent('Aktiver Spieler')
    expect(within(aktiverSpielerBereich).getByRole('heading', { name: 'Aktiver Spieler' })).toBe(targets[0])
  })
})
