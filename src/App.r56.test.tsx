/*
Author: rahn
Datum: 02.06.2026
Version: 1.0
Beschreibung: R56 UI-Test für die Spielende-Ansicht und Gewinneranzeige.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { berechneGewinner, erstelleSpielzustand } from './engine'
import type { Spielzustand } from './engine'

function spielendeZustand(): Spielzustand {
  return {
    ...erstelleSpielzustand(2, () => 0.999999),
    spielphase: 'Beendet',
    zugphase: 'Spielende',
  }
}

describe('R56 UI-Spielende und Gewinneranzeige', () => {
  it('zeigt im Spielende-Zustand eine Endstand-Meldung und die Gewinnerübersicht', () => {
    const zustand = spielendeZustand()
    const erwartung = berechneGewinner(zustand.spieler)

    render(<App initialZustand={zustand} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const wertungBereich = screen.getByRole('region', { name: 'Wertung' })
    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })

    expect(within(aktiverSpielerBereich).getByText(/Spielende erreicht/i)).toBeInTheDocument()
    expect(within(aktiverSpielerBereich).queryByText(/Nächste legale Aktion:/i)).not.toBeInTheDocument()
    expect(within(aktionenBereich).queryByRole('button')).not.toBeInTheDocument()

    const angezeigteGewinner = within(wertungBereich).getAllByText(/^Gewinner /)
    expect(angezeigteGewinner).toHaveLength(erwartung.gewinner.length)
    expect(angezeigteGewinner[0]).toHaveTextContent(
      `Gewinner ${erwartung.gewinner[0].spielerId}: ${erwartung.gewinner[0].gesamtPunkte} Punkte`,
    )
  })
})
