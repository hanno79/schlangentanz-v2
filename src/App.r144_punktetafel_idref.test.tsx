/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R144 UI-Test für die Punktetafel-Region mit sichtbarem, lokalem aria-labelledby-Ziel.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('R144 Punktetafel-IDREF', () => {
  it('labelt die Punktetafel-Region über ihre sichtbare Überschrift statt über ein separates aria-label', () => {
    render(<App />)

    const wertung = screen.getByRole('region', { name: 'Wertung' })
    const punktetafel = within(wertung).getByRole('region', { name: 'Punktetafel' })
    const labelId = punktetafel.getAttribute('aria-labelledby')

    expect(punktetafel).not.toHaveAttribute('aria-label')
    expect(labelId).toBeTruthy()
    expect(labelId).not.toMatch(/\s/)

    const targets = document.querySelectorAll(`[id="${labelId}"]`)
    expect(targets).toHaveLength(1)
    expect(punktetafel).toContainElement(targets[0] as HTMLElement)
    expect(targets[0]).toHaveTextContent('Punktetafel')
    expect(within(punktetafel).getAllByRole('listitem')).toHaveLength(2)
  })
})
