/*
Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: R103 UI-Regressionstest — Schlangenhäutung vermeidet die doppelte Quick-Option „erste Karte ans Ende“, weil die lokale Reihenfolge-Auswahl diese Aktion abdeckt.
# ÄNDERUNG 07.06.2026: R103 reduziert Redundanz zwischen R101-Quick-Option und R102-Auswahl, ohne eine neue Schlangenhäutung-Mechanik einzuführen.
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
            hand: [sonderkarte('schlangenhaeutung-r103', 'Schlangenhäutung')],
            schlangen: [
              schlange([
                farbkarte('rot-r103-1', 'Rot'),
                farbkarte('blau-r103-1', 'Blau'),
                farbkarte('gruen-r103-1', 'Grün'),
              ], 'schlange-r103-1'),
            ],
          }
        : spieler,
    ),
  }
}

describe('R103 Schlangenhäutung-Redundanzreduktion', () => {
  it('setzt die erste Karte über die lokale Auswahl ans Ende, ohne dafür eine separate Quick-Option zu zeigen', () => {
    render(<App initialZustand={zustandMitSchlangenhaeutungAuswahl()} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
    const sonderhinweise = within(aktionenBereich).getByRole('region', { name: 'Weitere verfügbare Aktionen' })
    const reihenfolgeAuswahl = within(sonderhinweise).getByRole('group', { name: 'Schlangenhäutung-Reihenfolge-Auswahl' })

    expect(within(sonderhinweise).getByText('Du hast eine Schlangenhäutung und mindestens eine eigene aktive Schlange zum Neuordnen. Wähle eine verfügbare Neuordnung und führe sie über die Schlangenhäutung aus.')).toBeInTheDocument()
    expect(within(sonderhinweise).queryByRole('button', {
      name: 'Schlangenhäutung: Schlange schlange-r103-1 erste Karte ans Ende setzen',
    })).not.toBeInTheDocument()

    fireEvent.click(
      within(reihenfolgeAuswahl).getByRole('button', {
        name: 'Schlangenhäutung: gewählte Karte aus Schlange schlange-r103-1 ans Ende setzen',
      }),
    )

    const aktiverSpieler = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const material = screen.getByRole('region', { name: 'Material und Aufgaben' })
    const spieleruebersicht = screen.getByRole('region', { name: 'Spielerübersicht' })

    expect(within(aktiverSpieler).getByText('Zuletzt ausgeführt: Schlangenhäutung mit Karte schlangenhaeutung-r103 auf Schlange schlange-r103-1 spielen')).toBeInTheDocument()
    expect(within(material).getByText('Ablagestapel: schlangenhaeutung-r103')).toBeInTheDocument()
    expect(within(spieleruebersicht).getByText('Schlangenübersicht spieler-1: schlange-r103-1 (blau-r103-1, gruen-r103-1, rot-r103-1)')).toBeInTheDocument()
  })
})
