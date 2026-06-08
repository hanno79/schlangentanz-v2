/*
Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: R102 UI-Regressionstest — Schlangenhäutung bietet eine lokale Reihenfolge-Auswahl, mit der eine gewählte Karte ans Ende gesetzt wird.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import type { Spielzustand } from './engine'
import { erstelleSpielzustand } from './engine'
import { farbkarte, schlange, sonderkarte } from './engine/__tests__/testHelpers'

function zustandMitSchlangenhaeutungReihenfolgeAuswahl(): Spielzustand {
  const basis = erstelleSpielzustand(2, () => 0.999999)
  return {
    ...basis,
    zugphase: 'Ausspielphase',
    spieler: basis.spieler.map((spieler, index) =>
      index === 0
        ? {
            ...spieler,
            hand: [sonderkarte('schlangenhaeutung-r102', 'Schlangenhäutung')],
            schlangen: [
              schlange([
                farbkarte('rot-r102-1', 'Rot'),
                farbkarte('blau-r102-1', 'Blau'),
                farbkarte('gruen-r102-1', 'Grün'),
              ], 'schlange-r102-1'),
            ],
          }
        : spieler,
    ),
  }
}

describe('R102 Schlangenhäutung-Reihenfolge-Auswahl', () => {
  it('setzt eine ausgewählte Karte der eigenen Schlange ans Ende', () => {
    render(<App initialZustand={zustandMitSchlangenhaeutungReihenfolgeAuswahl()} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
    const sonderhinweise = within(aktionenBereich).getByRole('region', { name: 'Weitere verfügbare Aktionen' })
    const reihenfolgeAuswahl = within(sonderhinweise).getByRole('group', { name: 'Schlangenhäutung-Reihenfolge-Auswahl' })

    expect(within(reihenfolgeAuswahl).getByText('Wähle lokal eine Karte, die ans Ende dieser Schlange gesetzt wird.')).toBeInTheDocument()

    fireEvent.change(
      within(reihenfolgeAuswahl).getByRole('combobox', { name: 'Karte aus Schlange schlange-r102-1 ans Ende setzen' }),
      { target: { value: 'blau-r102-1' } },
    )
    fireEvent.click(
      within(reihenfolgeAuswahl).getByRole('button', {
        name: 'Schlangenhäutung: gewählte Karte aus Schlange schlange-r102-1 ans Ende setzen',
      }),
    )

    const aktiverSpieler = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const material = screen.getByRole('region', { name: 'Material und Aufgaben' })
    const spieleruebersicht = screen.getByRole('region', { name: 'Spielerübersicht' })

    expect(within(aktiverSpieler).getByText('Zuletzt ausgeführt: Schlangenhäutung mit Karte schlangenhaeutung-r102 auf Schlange schlange-r102-1 spielen')).toBeInTheDocument()
    expect(within(material).getByText('Ablagestapel: schlangenhaeutung-r102')).toBeInTheDocument()
    expect(within(spieleruebersicht).getByText('Schlangen von spieler-1: schlange-r102-1 (rot-r102-1, gruen-r102-1, blau-r102-1)')).toBeInTheDocument()
  })
})
