/*
Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: R104 UI-Regressionstest — Schlangenhäutung-Umkehr wird in die bestehende Reihenfolge-Auswahl integriert statt als separate Quick-Option gerendert.
# ÄNDERUNG 07.06.2026: R104 reduziert die letzte UI-Doppelung zwischen Quick-Optionen und lokaler Schlangenhäutung-Auswahl.
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
            hand: [sonderkarte('schlangenhaeutung-r104', 'Schlangenhäutung')],
            schlangen: [
              schlange([
                farbkarte('rot-r104-1', 'Rot'),
                farbkarte('blau-r104-1', 'Blau'),
                farbkarte('gruen-r104-1', 'Grün'),
              ], 'schlange-r104-1'),
            ],
          }
        : spieler,
    ),
  }
}

describe('R104 Schlangenhäutung-Umkehr in Reihenfolge-Auswahl', () => {
  it('kehrt eine Schlange in der lokalen Auswahl um und rendert keine separate Quick-Optionen-Gruppe mehr', () => {
    render(<App initialZustand={zustandMitUmkehrbarerSchlangenhaeutung()} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
    const sonderhinweise = within(aktionenBereich).getByRole('region', { name: 'Weitere verfügbare Aktionen' })
    const reihenfolgeAuswahl = within(sonderhinweise).getByRole('group', { name: 'Schlangenhäutung-Reihenfolge-Auswahl' })

    expect(within(sonderhinweise).queryByRole('group', { name: 'Schlangenhäutung-Optionen' })).not.toBeInTheDocument()

    fireEvent.click(
      within(reihenfolgeAuswahl).getByRole('button', {
        name: 'Schlangenhäutung: Schlange schlange-r104-1 umkehren',
      }),
    )

    const aktiverSpieler = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const material = screen.getByRole('region', { name: 'Material und Aufgaben' })
    const spieleruebersicht = screen.getByRole('region', { name: 'Spielerübersicht' })

    expect(within(aktiverSpieler).getByText('Zuletzt ausgeführt: Schlangenhäutung mit Karte schlangenhaeutung-r104 auf Schlange schlange-r104-1 spielen')).toBeInTheDocument()
    expect(within(material).getByText('Ablagestapel: schlangenhaeutung-r104')).toBeInTheDocument()
    expect(within(spieleruebersicht).getByText('Schlangenübersicht spieler-1: schlange-r104-1 (gruen-r104-1, blau-r104-1, rot-r104-1)')).toBeInTheDocument()
  })
})
