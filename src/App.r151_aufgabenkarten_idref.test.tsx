/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R151 UI-Test für den Aufgabenkartenbereich mit sichtbarem, lokalem aria-labelledby-Ziel.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('R151 Aufgabenkarten aria-labelledby', () => {
  it('labelt den Aufgabenkartenbereich über die sichtbare Überschrift ohne separates aria-label', () => {
    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const materialUndAufgaben = within(spielbereich).getByRole('region', { name: 'Material und Aufgaben' })
    const aufgabenkarten = within(materialUndAufgaben).getByRole('region', { name: 'Aufgabenkarten' })
    const labelId = aufgabenkarten.getAttribute('aria-labelledby')

    expect(aufgabenkarten).not.toHaveAttribute('aria-label')
    expect(labelId).toBeTruthy()
    expect(labelId?.trim().split(/\s+/)).toHaveLength(1)

    const labelZiele = document.querySelectorAll(`#${CSS.escape(labelId ?? '')}`)
    expect(labelZiele).toHaveLength(1)
    expect(aufgabenkarten).toContainElement(labelZiele[0] as HTMLElement)
    expect(labelZiele[0]).toHaveTextContent('Aufgabenkarten')
    expect(within(aufgabenkarten).getByRole('heading', { name: 'Aufgabenkarten' })).toBe(labelZiele[0])
  })
})
