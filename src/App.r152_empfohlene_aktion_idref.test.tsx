/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R152 UI-Test für die empfohlene Aktion mit sichtbarem, lokalem aria-labelledby-Ziel.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('R152 Empfohlene Aktion aria-labelledby', () => {
  it('labelt die empfohlene Aktion über die sichtbare Überschrift ohne separates aria-label', () => {
    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const aktionenBereich = within(spielbereich).getByRole('region', { name: 'Aktionen' })
    const empfohleneAktion = within(aktionenBereich).getByRole('region', { name: 'Empfohlene Aktion' })
    const labelId = empfohleneAktion.getAttribute('aria-labelledby')

    expect(empfohleneAktion).not.toHaveAttribute('aria-label')
    expect(labelId).toBeTruthy()
    expect(labelId?.trim().split(/\s+/)).toHaveLength(1)

    const labelZiele = document.querySelectorAll(`#${CSS.escape(labelId ?? '')}`)
    expect(labelZiele).toHaveLength(1)
    expect(empfohleneAktion).toContainElement(labelZiele[0] as HTMLElement)
    expect(labelZiele[0]).toHaveTextContent('Empfohlene Aktion')
    expect(within(empfohleneAktion).getByRole('heading', { name: 'Empfohlene Aktion' })).toBe(labelZiele[0])
  })
})
