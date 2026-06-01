/*
Author: rahn
Datum: 01.06.2026
Version: 1.0
Beschreibung: R42 UI-Tests für sichtbare Handkarten-Details des aktiven Spielers.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { anwendeAktion, ermittleLegaleAktionen, erstelleSpielzustand, starteAusspielphase } from './engine'
import type { Spielkarte } from './engine'

function beschreibeKarte(karte: Spielkarte): string {
  if (karte.typ === 'Farbkarte') return `${karte.id} (Farbkarte ${karte.farbe}, ${karte.punkte} Punkte)`
  return `${karte.id} (Sonderkarte ${karte.name})`
}

function erwarteteHandkartenDetails(karten: Spielkarte[]): string {
  return `Handkarten-Details: ${karten.length > 0 ? karten.map(beschreibeKarte).join(', ') : 'keine'}`
}

describe('R42 UI-Handkarten-Details', () => {
  it('zeigt Details der aktiven Handkarten an und aktualisiert sie nach einer Engine-Aktion', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const aktion = ermittleLegaleAktionen(zustand).find(a => a.typ === 'NeueSchlangeStarten' && a.handkartenId === 'blau-01')
    if (!aktion) throw new Error('Testsetup erwartet blau-01 als legale Startaktion.')
    const erwarteterFolgezustand = anwendeAktion(zustand, aktion)

    render(<App initialZustand={zustand} />)
    const bereich = screen.getByRole('region', { name: /legale aktionen/i })

    expect(
      within(bereich).getByText(erwarteteHandkartenDetails(zustand.spieler[zustand.aktiverSpielerIndex]!.hand)),
    ).toBeInTheDocument()

    fireEvent.click(within(bereich).getByRole('button', { name: /neue schlange starten mit karte blau-01/i }))

    expect(
      within(bereich).getByText(
        erwarteteHandkartenDetails(erwarteterFolgezustand.spieler[erwarteterFolgezustand.aktiverSpielerIndex]!.hand),
      ),
    ).toBeInTheDocument()
    expect(within(bereich).queryByText(/Handkarten-Details:.*blau-01/)).toBeNull()
  })
})
