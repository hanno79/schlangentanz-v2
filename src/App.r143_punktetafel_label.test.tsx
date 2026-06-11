/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R143 UI-Test für die deutsch benannte Punktetafel statt sichtbarer Scoreboard-Copy.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('R143 Punktetafel-Copy', () => {
  it('benennt die Wertungs-Kartenliste als Punktetafel und vermeidet die englische Scoreboard-Copy', () => {
    render(<App />)

    const wertung = screen.getByRole('region', { name: 'Wertung' })
    const punktetafel = within(wertung).getByRole('region', { name: 'Punktetafel' })

    expect(within(punktetafel).getByRole('heading', { name: 'Punktetafel' })).toBeInTheDocument()
    expect(within(punktetafel).getAllByRole('listitem')).toHaveLength(2)
    expect(within(wertung).queryByRole('region', { name: 'Scoreboard' })).toBeNull()
    expect(within(wertung).queryByRole('heading', { name: 'Scoreboard' })).toBeNull()
    expect(wertung).not.toHaveTextContent(/scoreboard/i)
  })
})
