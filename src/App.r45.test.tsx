/*
Author: rahn
Datum: 01.06.2026
Version: 1.0
Beschreibung: R45 UI-Tests für sichtbare Gesamtzahl aller Schlangen.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { anwendeAktion, ermittleLegaleAktionen, erstelleSpielzustand, starteAusspielphase } from './engine'

function schlangenGesamtText(zustand: ReturnType<typeof erstelleSpielzustand>): string {
  const gesamt = zustand.spieler.reduce((summe, spieler) => summe + spieler.schlangen.length, 0)
  return `Schlangen insgesamt: ${gesamt}`
}

describe('R45 UI-Schlangen-Gesamtzahl', () => {
  it('zeigt die Gesamtzahl aller Schlangen und aktualisiert sie nach einer Engine-Aktion', () => {
    const startZustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const [ersteAktion] = ermittleLegaleAktionen(startZustand)
    if (ersteAktion.typ !== 'NeueSchlangeStarten') {
      throw new Error('Testsetup erwartet eine NeueSchlangeStarten-Aktion.')
    }
    const erwarteterFolgezustand = anwendeAktion(startZustand, ersteAktion)

    render(<App initialZustand={startZustand} />)
    const region = screen.getByRole('region', { name: /Legale Aktionen/i })

    expect(within(region).getByText(schlangenGesamtText(startZustand))).toBeInTheDocument()

    fireEvent.click(
      within(region).getByRole('button', { name: `Neue Schlange starten mit Karte ${ersteAktion.handkartenId}` }),
    )

    expect(within(region).getByText(schlangenGesamtText(erwarteterFolgezustand))).toBeInTheDocument()
  })
})
