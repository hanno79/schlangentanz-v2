/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R148 UI-Test für die Spielerübersicht mit sichtbarem, lokalem aria-labelledby-Ziel.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('R148 Spielerübersicht aria-labelledby', () => {
  it('labelt die Spielerübersicht über ihre sichtbare Überschrift ohne separates aria-label', () => {
    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const spieleruebersicht = within(spielbereich).getByRole('region', { name: 'Spielerübersicht' })
    const labelId = spieleruebersicht.getAttribute('aria-labelledby')

    expect(spieleruebersicht).not.toHaveAttribute('aria-label')
    expect(labelId).toBeTruthy()
    expect(labelId?.trim().split(/\s+/)).toHaveLength(1)

    const labelZiele = document.querySelectorAll(`#${CSS.escape(labelId ?? '')}`)
    expect(labelZiele).toHaveLength(1)
    expect(spieleruebersicht).toContainElement(labelZiele[0] as HTMLElement)
    expect(labelZiele[0]).toHaveTextContent('Spielerübersicht')
    expect(within(spieleruebersicht).getByRole('heading', { name: 'Spielerübersicht' })).toBe(labelZiele[0])
  })
})
