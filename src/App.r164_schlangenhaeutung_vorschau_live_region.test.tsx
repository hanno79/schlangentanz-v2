/*
Author: rahn
Datum: 12.06.2026
Version: 1.0
Beschreibung: R164 UI-Test — Schlangenhäutung-Vorschauen bleiben sichtbare Statuszeilen und kündigen Änderungen explizit als polite Live-Regionen an.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import type { Spielzustand } from './engine'
import { erstelleSpielzustand } from './engine'
import { farbkarte, schlange, sonderkarte } from './engine/__tests__/testHelpers'

function zustandMitSchlangenhaeutungVorschauen(): Spielzustand {
  const basis = erstelleSpielzustand(2, () => 0.999999)
  return {
    ...basis,
    zugphase: 'Ausspielphase',
    spieler: basis.spieler.map((spieler, index) =>
      index === 0
        ? {
            ...spieler,
            hand: [sonderkarte('schlangenhaeutung-r164', 'Schlangenhäutung')],
            schlangen: [
              schlange([
                farbkarte('rot-r164-1', 'Rot'),
                farbkarte('blau-r164-1', 'Blau'),
                farbkarte('gruen-r164-1', 'Grün'),
              ], 'schlange-r164-1'),
            ],
          }
        : spieler,
    ),
  }
}

describe('R164 Schlangenhäutung-Vorschauen als Live-Regionen', () => {
  it('kennzeichnet beide Vorschau-Statuszeilen als polite und atomic, ohne sichtbare Vorschau-Copy zu ändern', () => {
    render(<App initialZustand={zustandMitSchlangenhaeutungVorschauen()} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
    const sonderhinweise = within(aktionenBereich).getByRole('region', { name: 'Weitere verfügbare Aktionen' })
    const reihenfolgeAuswahl = within(sonderhinweise).getByRole('group', {
      name: 'Schlangenhäutung-Reihenfolge-Auswahl',
    })
    const schlangenGruppe = within(reihenfolgeAuswahl).getByRole('group', {
      name: 'Schlangenhäutung für Schlange schlange-r164-1',
    })

    const karteAnsEndeVorschau = within(schlangenGruppe).getByRole('status', {
      name: 'Vorschau Karte ans Ende für Schlange schlange-r164-1',
    })
    const umkehrVorschau = within(schlangenGruppe).getByRole('status', {
      name: 'Vorschau Umkehr für Schlange schlange-r164-1',
    })

    expect(karteAnsEndeVorschau).toHaveTextContent(
      'Neue Reihenfolge nach Karte ans Ende: blau-r164-1 → gruen-r164-1 → rot-r164-1',
    )
    expect(umkehrVorschau).toHaveTextContent(
      'Neue Reihenfolge nach Umkehr: gruen-r164-1 → blau-r164-1 → rot-r164-1',
    )

    const kartenauswahl = within(schlangenGruppe).getByRole('combobox', {
      name: 'Karte aus Schlange schlange-r164-1 ans Ende setzen',
    })
    const ausfuehrenButton = within(schlangenGruppe).getByRole('button', {
      name: 'Schlangenhäutung: gewählte Karte aus Schlange schlange-r164-1 ans Ende setzen',
    })
    const umkehrButton = within(schlangenGruppe).getByRole('button', {
      name: 'Schlangenhäutung: Schlange schlange-r164-1 umkehren',
    })

    expect(kartenauswahl.getAttribute('aria-describedby')?.split(/\s+/)).toContain(
      karteAnsEndeVorschau.id,
    )
    expect(ausfuehrenButton.getAttribute('aria-describedby')?.split(/\s+/)).toContain(
      karteAnsEndeVorschau.id,
    )
    expect(umkehrButton.getAttribute('aria-describedby')?.split(/\s+/)).toContain(
      umkehrVorschau.id,
    )

    fireEvent.change(kartenauswahl, { target: { value: 'blau-r164-1' } })

    expect(karteAnsEndeVorschau).toHaveTextContent(
      'Neue Reihenfolge nach Karte ans Ende: rot-r164-1 → gruen-r164-1 → blau-r164-1',
    )
    expect(umkehrVorschau).toHaveTextContent(
      'Neue Reihenfolge nach Umkehr: gruen-r164-1 → blau-r164-1 → rot-r164-1',
    )
    for (const status of [karteAnsEndeVorschau, umkehrVorschau]) {
      expect(status).toHaveAttribute('aria-live', 'polite')
      expect(status).toHaveAttribute('aria-atomic', 'true')
    }
  })
})
