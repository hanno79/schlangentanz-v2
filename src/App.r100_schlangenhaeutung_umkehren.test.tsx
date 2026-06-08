/*
Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: R100 UI-Regressionstest — Schlangenhäutung kann als erster sicherer UI-Fallback durch Umkehren einer eigenen Schlange ausgelöst werden.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import type { Spielzustand } from './engine'
import { erstelleSpielzustand } from './engine'
import { farbkarte, schlange, sonderkarte } from './engine/__tests__/testHelpers'

function zustandMitUmkehrbarerSchlangenhaeutung(): Spielzustand {
  const basis = erstelleSpielzustand(2, () => 0.999999)
  return {
    ...basis,
    zugphase: 'Ausspielphase',
    spieler: basis.spieler.map((spieler, index) =>
      index === 0
        ? {
            ...spieler,
            hand: [sonderkarte('schlangenhaeutung-r100', 'Schlangenhäutung')],
            schlangen: [
              schlange([
                farbkarte('rot-r100-1', 'Rot'),
                farbkarte('blau-r100-1', 'Blau'),
                farbkarte('gruen-r100-1', 'Grün'),
              ], 'schlange-r100-1'),
            ],
          }
        : spieler,
    ),
  }
}

describe('R100 Schlangenhäutung-UI-Fallback', () => {
  it('kehrt eine eigene aktive Schlange über den Hinweise-Bereich um und nutzt den Engine-Pfad', () => {
    render(<App initialZustand={zustandMitUmkehrbarerSchlangenhaeutung()} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
    const sonderhinweise = within(aktionenBereich).getByRole('region', { name: 'Weitere verfügbare Aktionen' })

    fireEvent.click(
      within(sonderhinweise).getByRole('button', {
        name: 'Schlangenhäutung: Schlange schlange-r100-1 umkehren',
      }),
    )

    const aktiverSpieler = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const material = screen.getByRole('region', { name: 'Material und Aufgaben' })
    const spieleruebersicht = screen.getByRole('region', { name: 'Spielerübersicht' })

    expect(within(aktiverSpieler).getByText('Zuletzt ausgeführt: Schlangenhäutung mit Karte schlangenhaeutung-r100 auf Schlange schlange-r100-1 spielen')).toBeInTheDocument()
    expect(within(material).getByText('Ablagestapel: schlangenhaeutung-r100')).toBeInTheDocument()
    expect(within(spieleruebersicht).getByText('Schlangen von spieler-1: schlange-r100-1 (gruen-r100-1, blau-r100-1, rot-r100-1)')).toBeInTheDocument()
  })
})
