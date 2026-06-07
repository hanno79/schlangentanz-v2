/*
Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: R101 UI-Regressionstest — Schlangenhäutung bietet als kleinen Auswahlslice die Aktion, die erste Karte einer eigenen Schlange ans Ende zu setzen.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import type { Spielzustand } from './engine'
import { erstelleSpielzustand } from './engine'
import { farbkarte, schlange, sonderkarte } from './engine/__tests__/testHelpers'

function zustandMitSchlangenhaeutungAuswahl(): Spielzustand {
  const basis = erstelleSpielzustand(2, () => 0.999999)
  return {
    ...basis,
    zugphase: 'Ausspielphase',
    spieler: basis.spieler.map((spieler, index) =>
      index === 0
        ? {
            ...spieler,
            hand: [sonderkarte('schlangenhaeutung-r101', 'Schlangenhäutung')],
            schlangen: [
              schlange([
                farbkarte('rot-r101-1', 'Rot'),
                farbkarte('blau-r101-1', 'Blau'),
                farbkarte('gruen-r101-1', 'Grün'),
              ], 'schlange-r101-1'),
            ],
          }
        : spieler,
    ),
  }
}

describe('R101 Schlangenhäutung-UI-Auswahl', () => {
  it('setzt die erste Karte einer eigenen aktiven Schlange über den Hinweise-Bereich ans Ende', () => {
    render(<App initialZustand={zustandMitSchlangenhaeutungAuswahl()} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
    const sonderhinweise = within(aktionenBereich).getByRole('region', { name: 'Weitere verfügbare Aktionen' })
    const schlangenhaeutungOptionen = within(sonderhinweise).getByRole('group', { name: 'Schlangenhäutung-Optionen' })

    expect(within(sonderhinweise).getByText('Du hast eine Schlangenhäutung und mindestens eine eigene aktive Schlange zum Neuordnen. Wähle eine verfügbare Neuordnung und führe sie über die Schlangenhäutung aus.')).toBeInTheDocument()
    expect(within(sonderhinweise).queryByText('Die konkrete Reihenfolge wählst du in einem folgenden UI-Slice.')).not.toBeInTheDocument()

    fireEvent.click(
      within(schlangenhaeutungOptionen).getByRole('button', {
        name: 'Schlangenhäutung: Schlange schlange-r101-1 erste Karte ans Ende setzen',
      }),
    )

    const aktiverSpieler = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const material = screen.getByRole('region', { name: 'Material und Aufgaben' })
    const spieleruebersicht = screen.getByRole('region', { name: 'Spielerübersicht' })

    expect(within(aktiverSpieler).getByText('Zuletzt ausgeführt: Schlangenhäutung mit Karte schlangenhaeutung-r101 auf Schlange schlange-r101-1 spielen')).toBeInTheDocument()
    expect(within(material).getByText('Ablagestapel: schlangenhaeutung-r101')).toBeInTheDocument()
    expect(within(spieleruebersicht).getByText('Schlangenübersicht spieler-1: schlange-r101-1 (blau-r101-1, gruen-r101-1, rot-r101-1)')).toBeInTheDocument()
  })
})
