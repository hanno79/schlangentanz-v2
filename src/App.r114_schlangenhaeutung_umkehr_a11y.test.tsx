/*
Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: R114 UI-Regressionstest — Schlangenhäutung-Umkehrbutton ist semantisch mit Tastaturhilfe und Umkehr-Vorschau beschrieben.
# ÄNDERUNG 07.06.2026: RED-Test für aria-describedby am Umkehrbutton der Schlangenhäutung-Reihenfolge-Auswahl ergänzt.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import type { Spielzustand } from './engine'
import { erstelleSpielzustand } from './engine'
import { farbkarte, schlange, sonderkarte } from './engine/__tests__/testHelpers'

function zustandMitSchlangenhaeutungUmkehr(): Spielzustand {
  const basis = erstelleSpielzustand(2, () => 0.999999)
  return {
    ...basis,
    zugphase: 'Ausspielphase',
    spieler: basis.spieler.map((spieler, index) =>
      index === 0
        ? {
            ...spieler,
            hand: [sonderkarte('schlangenhaeutung-r114', 'Schlangenhäutung')],
            schlangen: [
              schlange([
                farbkarte('rot-r114-1', 'Rot'),
                farbkarte('blau-r114-1', 'Blau'),
                farbkarte('gruen-r114-1', 'Grün'),
              ], 'schlange r114 mit leerzeichen'),
            ],
          }
        : spieler,
    ),
  }
}

describe('R114 Schlangenhäutung-Umkehrbutton A11y-Beschreibung', () => {
  it('verknüpft den Umkehrbutton DOM-sicher mit Tastaturhilfe und Umkehr-Vorschau', () => {
    render(<App initialZustand={zustandMitSchlangenhaeutungUmkehr()} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
    const sonderhinweise = within(aktionenBereich).getByRole('region', { name: 'Weitere verfügbare Aktionen' })
    const reihenfolgeAuswahl = within(sonderhinweise).getByRole('group', {
      name: 'Schlangenhäutung-Reihenfolge-Auswahl',
    })
    const schlangenGruppe = within(reihenfolgeAuswahl).getByRole('group', {
      name: 'Schlangenhäutung für Schlange schlange r114 mit leerzeichen',
    })

    const tastaturhilfe = within(schlangenGruppe).getByText(/^Tastatur: Mit Tab/)
    const umkehrVorschau = within(schlangenGruppe).getByText(
      'Neue Reihenfolge nach Umkehr: gruen-r114-1 → blau-r114-1 → rot-r114-1',
    )
    const umkehrButton = within(schlangenGruppe).getByRole('button', {
      name: 'Schlangenhäutung: Schlange schlange r114 mit leerzeichen umkehren',
    })

    const beschreibungsIds = umkehrButton.getAttribute('aria-describedby')?.split(/\s+/) ?? []

    expect(beschreibungsIds).toHaveLength(2)
    expect(beschreibungsIds).toContain(tastaturhilfe.id)
    expect(beschreibungsIds).toContain(umkehrVorschau.id)
    for (const id of beschreibungsIds) {
      expect(document.getElementById(id)).not.toBeNull()
      expect(document.querySelectorAll(`#${CSS.escape(id)}`)).toHaveLength(1)
    }
    expect(umkehrButton).toHaveAccessibleDescription(expect.stringContaining('Tastatur: Mit Tab'))
    expect(umkehrButton).toHaveAccessibleDescription(expect.stringContaining('Neue Reihenfolge nach Umkehr'))
  })
})
