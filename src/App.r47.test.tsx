/*
Author: rahn
Datum: 01.06.2026
Version: 1.0
Beschreibung: R47 UI-Tests für sichtbare Ablagestapel-Details auch bei leerem Stapel.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { anwendeAktion, ermittleLegaleAktionen, erstelleSpielzustand, starteAusspielphase } from './engine'
import type { Spielzustand } from './engine'

function zustandMitPflichtAbwurf(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const sonderkarte = zustand.nachziehstapel.find(karte => karte.typ === 'Sonderkarte')
  if (!sonderkarte) throw new Error('Testsetup erwartet eine Sonderkarte im Nachziehstapel.')

  return {
    ...zustand,
    spieler: zustand.spieler.with(0, {
      ...zustand.spieler[0],
      hand: [sonderkarte],
    }),
    nachziehstapel: zustand.nachziehstapel.filter(karte => karte.id !== sonderkarte.id),
  }
}

function ablagestapelText(zustand: Spielzustand): string {
  return `Karten auf dem Ablagestapel: ${zustand.ablagestapel.length > 0 ? zustand.ablagestapel.map(karte => karte.id).join(', ') : 'keine'}`
}

describe('R47 UI-Ablagestapel-Details', () => {
  it('zeigt leere Ablagestapel-Details und aktualisiert sie nach einem Engine-Pflicht-Abwurf', () => {
    const startZustand = zustandMitPflichtAbwurf()
    const abwurfAktion = ermittleLegaleAktionen(startZustand).find(aktion => aktion.typ === 'PflichtAbwurf')
    if (!abwurfAktion) throw new Error('Testsetup erwartet eine Pflicht-Abwurf-Aktion.')
    const erwarteterFolgezustand = anwendeAktion(startZustand, abwurfAktion)

    render(<App initialZustand={startZustand} />)
    const region = screen.getByRole('region', { name: 'Spielbereich' })

    expect(within(region).getByText(ablagestapelText(startZustand))).toBeInTheDocument()

    fireEvent.click(within(screen.getByRole('region', { name: 'Aktionen' })).getByRole('button', { name: `Karte ${abwurfAktion.handkartenId} abwerfen` }))

    expect(within(region).getByText(ablagestapelText(erwarteterFolgezustand))).toBeInTheDocument()
  })
})
