/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R153 UI-Test für die Weitere-Aktionen-Unterregion mit sichtbarem, lokalem aria-labelledby-Ziel.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('R153 Weitere Aktionen aria-labelledby', () => {
  it('labelt die Weitere-Aktionen-Unterregion über die sichtbare Überschrift ohne separates aria-label', () => {
    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const aktionenBereich = within(spielbereich).getByRole('region', { name: 'Aktionen' })
    const weitereAktionen = within(aktionenBereich).getByRole('region', { name: 'Weitere Aktionen' })
    const labelId = weitereAktionen.getAttribute('aria-labelledby')

    expect(weitereAktionen).not.toHaveAttribute('aria-label')
    expect(labelId).toBeTruthy()
    expect(labelId?.trim().split(/\s+/)).toHaveLength(1)

    const labelZiele = document.querySelectorAll(`#${CSS.escape(labelId ?? '')}`)
    expect(labelZiele).toHaveLength(1)
    expect(weitereAktionen).toContainElement(labelZiele[0] as HTMLElement)
    expect(labelZiele[0]).toHaveTextContent('Weitere Aktionen')
    expect(within(weitereAktionen).getByRole('heading', { name: 'Weitere Aktionen' })).toBe(labelZiele[0])
  })
})
