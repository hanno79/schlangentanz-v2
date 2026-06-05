/*
Author: rahn
Datum: 05.06.2026
Version: 1.0
Beschreibung: F24 UI-Test für eine sichtbare Ergebnis-Zusammenfassung im Spielende.
*/
// # ÄNDERUNG 05.06.2026: Ergebnis-Zusammenfassung im Spielende abgesichert.
// Der Test prüft, dass die Wertung im Spielende eine klare Ergebniszeile zeigt und im Normalspiel still bleibt.

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, type Spielzustand } from './engine'

function zustandImSpielende(): Spielzustand {
  return {
    ...erstelleSpielzustand(2, () => 0.999999),
    spielphase: 'Beendet',
    zugphase: 'Spielende',
  }
}

describe('F24 Ergebnis-Zusammenfassung im Spielende', () => {
  it('zeigt im Wertungsbereich eine sichtbare Ergebniszeile an', () => {
    render(<App initialZustand={zustandImSpielende()} />)

    const wertung = screen.getByRole('region', { name: 'Wertung' })

    expect(within(wertung).getByText(/Ergebnis:/i)).toBeInTheDocument()
    expect(within(wertung).getByText(/Ergebnis: Gleichstand/i)).toBeInTheDocument()
  })

  it('zeigt die Ergebniszeile im Normalspiel nicht an', () => {
    render(<App initialZustand={erstelleSpielzustand(2, () => 0.999999)} />)

    const wertung = screen.getByRole('region', { name: 'Wertung' })

    expect(within(wertung).queryByText(/Ergebnis:/i)).toBeNull()
  })
})
