/*
Author: rahn
Datum: 07.06.2026
Version: 1.1
Beschreibung: R99 UI-Regressionstest — nicht enumerierte Schlangenhäutung wird als verfügbarer Engine-Hinweis mit R101-Auswahlcopy angezeigt.
# ÄNDERUNG 07.06.2026: Erwartung an R101-Copy und Optionsgruppe angepasst, ohne die R99-Hinweis-Absicherung zu schwächen.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import type { Spielzustand } from './engine'
import { erstelleSpielzustand } from './engine'
import { farbkarte, schlange, sonderkarte } from './engine/__tests__/testHelpers'

function zustandMitNichtEnumerierterSchlangenhaeutung(): Spielzustand {
  const basis = erstelleSpielzustand(2, () => 0.999999)
  return {
    ...basis,
    zugphase: 'Ausspielphase',
    spieler: basis.spieler.map((spieler, index) =>
      index === 0
        ? {
            ...spieler,
            hand: [sonderkarte('schlangenhaeutung-r99', 'Schlangenhäutung')],
            schlangen: [
              schlange([
                farbkarte('rot-r99-1', 'Rot'),
                farbkarte('blau-r99-1', 'Blau'),
                farbkarte('gruen-r99-1', 'Grün'),
              ], 'schlange-r99-1'),
            ],
          }
        : spieler,
    ),
  }
}

describe('R99 Schlangenhäutung-Hinweis', () => {
  it('zeigt im Aktionenbereich einen Hinweis, wenn Schlangenhäutung spielbar aber nicht enumeriert ist', () => {
    render(<App initialZustand={zustandMitNichtEnumerierterSchlangenhaeutung()} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
    const sonderhinweise = within(aktionenBereich).getByRole('region', { name: 'Weitere verfügbare Aktionen' })

    expect(within(aktionenBereich).getByText('Legale Aktionen: 0')).toBeInTheDocument()
    expect(within(aktionenBereich).getByText('Nächster Pflichtschritt: Schlangenhäutung vorbereiten.')).toBeInTheDocument()
    expect(within(sonderhinweise).getByText('Schlangenhäutung verfügbar')).toBeInTheDocument()
    expect(
      within(sonderhinweise).getByText(
        'Du hast eine Schlangenhäutung und mindestens eine eigene aktive Schlange zum Neuordnen. Wähle eine verfügbare Neuordnung und führe sie über die Schlangenhäutung aus.',
      ),
    ).toBeInTheDocument()
    expect(within(sonderhinweise).getByRole('group', { name: 'Schlangenhäutung-Optionen' })).toBeInTheDocument()
    expect(within(sonderhinweise).queryByText('Die konkrete Reihenfolge wählst du in einem folgenden UI-Slice.')).not.toBeInTheDocument()
  })
})
