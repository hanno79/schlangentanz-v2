/*
Author: rahn
Datum: 07.06.2026
Version: 1.1
Beschreibung: R108 UI-Regressionstest — Schlangenhäutung-Reihenfolge-Auswahl beschreibt Tastaturbedienung und Vorschau semantisch für Screenreader.
# ÄNDERUNG 07.06.2026: R108 Review-Blocker gegen rohe Schlangen-IDs in aria-describedby mit Leerzeichen-ID abgesichert.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import type { Spielzustand } from './engine'
import { erstelleSpielzustand } from './engine'
import { farbkarte, schlange, sonderkarte } from './engine/__tests__/testHelpers'

function zustandMitSchlangenhaeutungTastaturhilfe(): Spielzustand {
  const basis = erstelleSpielzustand(2, () => 0.999999)
  return {
    ...basis,
    zugphase: 'Ausspielphase',
    spieler: basis.spieler.map((spieler, index) =>
      index === 0
        ? {
            ...spieler,
            hand: [sonderkarte('schlangenhaeutung-r108', 'Schlangenhäutung')],
            schlangen: [
              schlange([
                farbkarte('rot-r108-1', 'Rot'),
                farbkarte('blau-r108-1', 'Blau'),
                farbkarte('gruen-r108-1', 'Grün'),
              ], 'schlange-r108-1'),
            ],
          }
        : spieler,
    ),
  }
}

function zustandMitLeerzeichenInSchlangenId(): Spielzustand {
  const basis = erstelleSpielzustand(2, () => 0.999999)
  return {
    ...basis,
    zugphase: 'Ausspielphase',
    spieler: basis.spieler.map((spieler, index) =>
      index === 0
        ? {
            ...spieler,
            hand: [sonderkarte('schlangenhaeutung-r108-leerzeichen', 'Schlangenhäutung')],
            schlangen: [
              schlange([
                farbkarte('rot-r108-leerzeichen', 'Rot'),
                farbkarte('blau-r108-leerzeichen', 'Blau'),
              ], 'schlange r108 mit leerzeichen'),
            ],
          }
        : spieler,
    ),
  }
}

function holeR108Auswahl() {
  const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
  const sonderhinweise = within(aktionenBereich).getByRole('region', { name: 'Weitere verfügbare Aktionen' })
  return within(sonderhinweise).getByRole('group', { name: 'Schlangenhäutung-Reihenfolge-Auswahl' })
}

describe('R108 Schlangenhäutung Tastatur- und A11y-Polish', () => {
  it('verknüpft Auswahl, Tastaturhilfe und Live-Vorschau semantisch pro Schlange', () => {
    render(<App initialZustand={zustandMitSchlangenhaeutungTastaturhilfe()} />)

    const reihenfolgeAuswahl = holeR108Auswahl()
    const schlangenGruppe = within(reihenfolgeAuswahl).getByRole('group', {
      name: 'Schlangenhäutung für Schlange schlange-r108-1',
    })

    const tastaturhilfe = within(schlangenGruppe).getByText(
      'Tastatur: Mit Tab zur Kartenauswahl wechseln, mit Pfeiltasten eine Karte wählen und danach den Ausführen-Button aktivieren.',
    )
    const auswahl = within(schlangenGruppe).getByRole('combobox', {
      name: 'Karte aus Schlange schlange-r108-1 ans Ende setzen',
    })
    const ausfuehren = within(schlangenGruppe).getByRole('button', {
      name: 'Schlangenhäutung: gewählte Karte aus Schlange schlange-r108-1 ans Ende setzen',
    })
    const vorschau = within(schlangenGruppe).getByRole('status', {
      name: 'Vorschau Karte ans Ende für Schlange schlange-r108-1',
    })

    expect(auswahl).toHaveAccessibleDescription(expect.stringContaining('Tastatur: Mit Tab'))
    expect(auswahl).toHaveAccessibleDescription(expect.stringContaining('Neue Reihenfolge nach Karte ans Ende'))
    expect(ausfuehren).toHaveAccessibleDescription(expect.stringContaining('Tastatur: Mit Tab'))
    expect(ausfuehren).toHaveAccessibleDescription(expect.stringContaining('Neue Reihenfolge nach Karte ans Ende'))
    expect(auswahl.getAttribute('aria-describedby')).toContain(tastaturhilfe.id)
    expect(ausfuehren.getAttribute('aria-describedby')).toContain(tastaturhilfe.id)
    expect(auswahl.getAttribute('aria-describedby')).toContain(vorschau.id)

    fireEvent.change(auswahl, { target: { value: 'blau-r108-1' } })

    expect(vorschau).toHaveTextContent('Neue Reihenfolge nach Karte ans Ende: rot-r108-1 → gruen-r108-1 → blau-r108-1')
  })

  it('nutzt DOM-sichere aria-describedby-IDs unabhängig von der Schlangen-ID', () => {
    render(<App initialZustand={zustandMitLeerzeichenInSchlangenId()} />)

    const reihenfolgeAuswahl = holeR108Auswahl()
    const schlangenGruppe = within(reihenfolgeAuswahl).getByRole('group', {
      name: 'Schlangenhäutung für Schlange schlange r108 mit leerzeichen',
    })
    const auswahl = within(schlangenGruppe).getByRole('combobox', {
      name: 'Karte aus Schlange schlange r108 mit leerzeichen ans Ende setzen',
    })
    const beschreibungsIds = auswahl.getAttribute('aria-describedby')?.split(/\s+/) ?? []

    expect(beschreibungsIds).toHaveLength(2)
    for (const id of beschreibungsIds) {
      expect(document.getElementById(id)).not.toBeNull()
    }
    expect(auswahl).toHaveAccessibleDescription(expect.stringContaining('Tastatur: Mit Tab'))
    expect(auswahl).toHaveAccessibleDescription(expect.stringContaining('Neue Reihenfolge nach Karte ans Ende'))
  })
})
