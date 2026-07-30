/*
Author: rahn
Datum: 01.06.2026
Version: 1.0
Beschreibung: R46 UI-Tests für sichtbare Gesamtzahl aller Handkarten.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { anwendeAktion, ermittleLegaleAktionen, erstelleSpielzustand, starteAusspielphase } from './engine'
import { labelFuer } from './testUtils'

function handkartenGesamtText(zustand: ReturnType<typeof erstelleSpielzustand>): string {
  const gesamt = zustand.spieler.reduce((summe, spieler) => summe + spieler.hand.length, 0)
  return `Handkarten insgesamt: ${gesamt}`
}

describe('R46 UI-Handkarten-Gesamtzahl', () => {
  it('zeigt die Gesamtzahl aller Handkarten und aktualisiert sie nach einer Engine-Aktion', () => {
    const startZustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const ersteAktion = ermittleLegaleAktionen(startZustand).find(aktion => aktion.typ === 'NeueSchlangeStarten')
    if (!ersteAktion) throw new Error('Testsetup erwartet eine Aktion zum Starten einer neuen Schlange.')
    const erwarteterFolgezustand = anwendeAktion(startZustand, ersteAktion)

    render(<App initialZustand={startZustand} />)
    const region = screen.getByRole('region', { name: 'Spielbereich' })

    expect(within(region).getByText(handkartenGesamtText(startZustand))).toBeInTheDocument()

    fireEvent.click(
      within(screen.getByRole('region', { name: 'Aktionen' })).getByRole('button', { name: labelFuer(startZustand, ersteAktion) }),
    )

    expect(within(region).getByText(handkartenGesamtText(erwarteterFolgezustand))).toBeInTheDocument()
  })
})
