/*
Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: R100 Helper-Regressionstests für sichere Schlangenhäutung-UI-Aktionskandidaten.
*/

import { describe, expect, it } from 'vitest'
import { erstelleSpielzustand } from '../engine'
import { farbkarte, schlange, sonderkarte } from '../engine/__tests__/testHelpers'
import { erstelleSchlangenhaeutungUmkehrAktionen } from './schlangenhaeutungUiAktionen'

function zustandMitSchlangenhaeutung() {
  const basis = erstelleSpielzustand(2, () => 0.999999)
  return {
    ...basis,
    zugphase: 'Ausspielphase' as const,
    spieler: basis.spieler.map((spieler, index) =>
      index === 0
        ? {
            ...spieler,
            hand: [sonderkarte('schlangenhaeutung-r100-helper', 'Schlangenhäutung')],
            schlangen: [
              schlange([
                farbkarte('rot-r100-helper', 'Rot'),
                farbkarte('blau-r100-helper', 'Blau'),
              ], 'schlange-r100-helper'),
            ],
          }
        : spieler,
    ),
  }
}

describe('R100 Schlangenhäutung-UI-Aktionshelper', () => {
  it('erzeugt keine Umkehr-Aktion, wenn die Engine-Aktion in der aktuellen Phase illegal ist', () => {
    const zustand = { ...zustandMitSchlangenhaeutung(), zugphase: 'Nachziehphase' as const }

    expect(erstelleSchlangenhaeutungUmkehrAktionen(zustand)).toEqual([])
  })
})
