/*
Author: rahn
Datum: 07.06.2026
Version: 1.2
Beschreibung: R100/R101 Helper-Regressionstests für sichere Schlangenhäutung-UI-Aktionskandidaten.
# ÄNDERUNG 07.06.2026: R101 prüft zusätzlich die kleine Auswahloption "erste Karte ans Ende" und Deduplizierung.
# ÄNDERUNG 07.06.2026: R103 entfernt den R101-Test für "erste Karte ans Ende" – diese Option ist aus der Funktion entfernt worden.
*/

import { describe, expect, it } from 'vitest'
import { erstelleSpielzustand } from '../engine'
import type { Farbe } from '../engine'
import { farbkarte, schlange, sonderkarte } from '../engine/__tests__/testHelpers'
import { erstelleSchlangenhaeutungUiOptionen, erstelleSchlangenhaeutungUmkehrAktionen } from './schlangenhaeutungUiAktionen'

function farbeFuerIndex(index: number): Farbe {
  const farben: Farbe[] = ['Rot', 'Blau', 'Grün']
  return farben[index] ?? 'Gelb'
}

function zustandMitSchlangenhaeutung(kartenIds = ['rot-r101-helper', 'blau-r101-helper', 'gruen-r101-helper']) {
  const basis = erstelleSpielzustand(2, () => 0.999999)
  return {
    ...basis,
    zugphase: 'Ausspielphase' as const,
    spieler: basis.spieler.map((spieler, index) =>
      index === 0
        ? {
            ...spieler,
            hand: [sonderkarte('schlangenhaeutung-r101-helper', 'Schlangenhäutung')],
            schlangen: [schlange(kartenIds.map((id, i) => farbkarte(id, farbeFuerIndex(i))), 'schlange-r101-helper')],
          }
        : spieler,
    ),
  }
}

describe('R100/R101 Schlangenhäutung-UI-Aktionshelper', () => {
  it('erzeugt keine Umkehr-Aktion, wenn die Engine-Aktion in der aktuellen Phase illegal ist', () => {
    const zustand = { ...zustandMitSchlangenhaeutung(), zugphase: 'Nachziehphase' as const }

    expect(erstelleSchlangenhaeutungUmkehrAktionen(zustand)).toEqual([])
  })

  it('liefert nur die Umkehr-Quick-Option, weil Karte-ans-Ende über die lokale Auswahl läuft', () => {
    const optionen = erstelleSchlangenhaeutungUiOptionen(zustandMitSchlangenhaeutung())

    expect(optionen).toHaveLength(1)
    expect(optionen[0].ariaLabel).toBe('Schlangenhäutung: Schlange schlange-r101-helper umkehren')
  })
})
