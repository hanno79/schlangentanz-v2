/*
Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: R105 UI-Regressionstest — Schlangenhäutung zeigt eine Vorschau von aktueller zu neuer Reihenfolge für lokale Auswahl und Umkehr.
# ÄNDERUNG 07.06.2026: R105 macht die bestehende Schlangenhäutung-Reihenfolge-Auswahl verständlicher, ohne neue Mechanik einzuführen.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import type { Spielzustand } from './engine'
import { erstelleSpielzustand } from './engine'
import { farbkarte, schlange, sonderkarte } from './engine/__tests__/testHelpers'

function zustandMitSchlangenhaeutungVorschau(): Spielzustand {
  const basis = erstelleSpielzustand(2, () => 0.999999)
  return {
    ...basis,
    zugphase: 'Ausspielphase',
    spieler: basis.spieler.map((spieler, index) =>
      index === 0
        ? {
            ...spieler,
            hand: [sonderkarte('schlangenhaeutung-r105', 'Schlangenhäutung')],
            schlangen: [
              schlange([
                farbkarte('rot-r105-1', 'Rot'),
                farbkarte('blau-r105-1', 'Blau'),
                farbkarte('gruen-r105-1', 'Grün'),
              ], 'schlange-r105-1'),
            ],
          }
        : spieler,
    ),
  }
}

describe('R105 Schlangenhäutung-Reihenfolge-Vorschau', () => {
  it('zeigt für Karte-ans-Ende und Umkehr die aktuelle und neue Reihenfolge vor der Ausführung', () => {
    render(<App initialZustand={zustandMitSchlangenhaeutungVorschau()} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
    const sonderhinweise = within(aktionenBereich).getByRole('region', { name: 'Weitere verfügbare Aktionen' })
    const reihenfolgeAuswahl = within(sonderhinweise).getByRole('group', { name: 'Schlangenhäutung-Reihenfolge-Auswahl' })

    expect(within(sonderhinweise).queryByRole('group', { name: 'Schlangenhäutung-Optionen' })).not.toBeInTheDocument()
    expect(within(reihenfolgeAuswahl).getByText('Aktuelle Reihenfolge: rot-r105-1 → blau-r105-1 → gruen-r105-1')).toBeInTheDocument()
    expect(within(reihenfolgeAuswahl).getByText('Neue Reihenfolge nach Karte ans Ende: blau-r105-1 → gruen-r105-1 → rot-r105-1')).toBeInTheDocument()
    expect(within(reihenfolgeAuswahl).getByText('Diese Aktion setzt die gewählte Karte ans Ende.')).toBeInTheDocument()
    expect(within(reihenfolgeAuswahl).getByText('Neue Reihenfolge nach Umkehr: gruen-r105-1 → blau-r105-1 → rot-r105-1')).toBeInTheDocument()
    expect(within(reihenfolgeAuswahl).getByText('Diese Aktion kehrt die Schlange um.')).toBeInTheDocument()
    expect(within(reihenfolgeAuswahl).getByText('Die Regelprüfung bleibt beim Ausführen in der Engine.')).toBeInTheDocument()

    fireEvent.change(
      within(reihenfolgeAuswahl).getByRole('combobox', { name: 'Karte aus Schlange schlange-r105-1 ans Ende setzen' }),
      { target: { value: 'blau-r105-1' } },
    )

    expect(within(reihenfolgeAuswahl).getByText('Neue Reihenfolge nach Karte ans Ende: rot-r105-1 → gruen-r105-1 → blau-r105-1')).toBeInTheDocument()
  })
})
