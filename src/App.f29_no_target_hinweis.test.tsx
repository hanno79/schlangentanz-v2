/*
Author: rahn
Datum: 05.06.2026
Version: 1.0
Beschreibung: F29 UI-Test für eine klare Spielerführung, wenn im Aktionsbereich kein Springziel verfügbar ist.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, type Spielzustand } from './engine'

function zustandOhneLegaleAktionen(): Spielzustand {
  const zustand = erstelleSpielzustand(2, () => 0.999999)

  return {
    ...zustand,
    spielphase: 'Normal',
    zugphase: 'Ausspielphase',
    spieler: zustand.spieler.map((spieler, index) => ({
      ...spieler,
      schlangen: index === 0 ? [] : spieler.schlangen,
      hand: index === 0 ? [] : spieler.hand,
    })),
    zugpflichten: {
      ...zustand.zugpflichten,
      gespielteKarten: 0,
      gespielteFarbkarten: 0,
      gespielteSonderkarten: 0,
    },
  }
}

describe('F29 Spielerführung ohne Springziel', () => {
  it('zeigt im Spielerführungsbereich einen klaren No-Target-Hinweis statt einer Klickaufforderung', () => {
    render(<App initialZustand={zustandOhneLegaleAktionen()} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const spielerfuehrung = within(aktiverSpielerBereich).getByRole('region', { name: 'Spielerführung' })

    expect(within(spielerfuehrung).getByText('Im Aktionsbereich gibt es aktuell kein Springziel.')).toBeInTheDocument()
    expect(within(spielerfuehrung).queryByText(/Klicke unten auf die empfohlene Aktion/i)).toBeNull()
    expect(within(spielerfuehrung).queryByRole('link', { name: /Zur .* im Aktionsbereich/i })).toBeNull()
  })
})
