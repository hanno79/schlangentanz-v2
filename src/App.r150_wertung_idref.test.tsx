/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R150 UI-Test für den Wertungsbereich mit sichtbarem, lokalem aria-labelledby-Ziel.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('R150 Wertung aria-labelledby', () => {
  it('labelt den Wertungsbereich über die sichtbare Überschrift ohne separates aria-label', () => {
    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const wertung = within(spielbereich).getByRole('region', { name: 'Wertung' })
    const labelId = wertung.getAttribute('aria-labelledby')

    expect(wertung).not.toHaveAttribute('aria-label')
    expect(labelId).toBeTruthy()
    expect(labelId?.trim().split(/\s+/)).toHaveLength(1)

    const labelZiele = document.querySelectorAll(`#${CSS.escape(labelId ?? '')}`)
    expect(labelZiele).toHaveLength(1)
    expect(wertung).toContainElement(labelZiele[0] as HTMLElement)
    expect(labelZiele[0]).toHaveTextContent('Wertung')
    expect(within(wertung).getByRole('heading', { name: 'Wertung' })).toBe(labelZiele[0])
  })
})
