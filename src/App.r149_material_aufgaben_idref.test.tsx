/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R149 UI-Test für den Bereich Material und Aufgaben mit sichtbarem, lokalem aria-labelledby-Ziel.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('R149 Material und Aufgaben aria-labelledby', () => {
  it('labelt Material und Aufgaben über die sichtbare Überschrift ohne separates aria-label', () => {
    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const materialUndAufgaben = within(spielbereich).getByRole('region', { name: 'Material und Aufgaben' })
    const labelId = materialUndAufgaben.getAttribute('aria-labelledby')

    expect(materialUndAufgaben).not.toHaveAttribute('aria-label')
    expect(labelId).toBeTruthy()
    expect(labelId?.trim().split(/\s+/)).toHaveLength(1)

    const labelZiele = document.querySelectorAll(`#${CSS.escape(labelId ?? '')}`)
    expect(labelZiele).toHaveLength(1)
    expect(materialUndAufgaben).toContainElement(labelZiele[0] as HTMLElement)
    expect(labelZiele[0]).toHaveTextContent('Material und Aufgaben')
    expect(within(materialUndAufgaben).getByRole('heading', { name: 'Material und Aufgaben' })).toBe(labelZiele[0])
  })
})
