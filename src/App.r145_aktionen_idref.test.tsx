/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R145 UI-Test für den Aktionenbereich mit sichtbarem, lokalem aria-labelledby-Ziel.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('R145 Aktionenbereich-IDREF', () => {
  it('labelt den Aktionenbereich über seine sichtbare Überschrift statt über ein separates aria-label', () => {
    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const aktionenBereich = within(spielbereich).getByRole('region', { name: 'Aktionen' })
    const labelId = aktionenBereich.getAttribute('aria-labelledby')

    expect(aktionenBereich).not.toHaveAttribute('aria-label')
    expect(labelId).toBeTruthy()
    expect(labelId).not.toMatch(/\s/)

    const targets = document.querySelectorAll(`[id="${labelId}"]`)
    expect(targets).toHaveLength(1)
    expect(aktionenBereich).toContainElement(targets[0] as HTMLElement)
    expect(targets[0]).toHaveTextContent('Aktionen')
    expect(within(aktionenBereich).getByRole('heading', { name: 'Aktionen' })).toBe(targets[0])
  })
})
