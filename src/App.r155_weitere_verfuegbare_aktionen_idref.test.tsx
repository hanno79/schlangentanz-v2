/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: R155 UI-Test für die Weitere-verfügbare-Aktionen-Unterregion mit sichtbarem, lokalem aria-labelledby-Ziel.
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
            hand: [sonderkarte('schlangenhaeutung-r155', 'Schlangenhäutung')],
            schlangen: [
              schlange([
                farbkarte('rot-r155-1', 'Rot'),
                farbkarte('blau-r155-1', 'Blau'),
                farbkarte('gruen-r155-1', 'Grün'),
              ], 'schlange-r155-1'),
            ],
          }
        : spieler,
    ),
  }
}

describe('R155 Weitere verfügbare Aktionen aria-labelledby', () => {
  it('labelt die Hinweis-Unterregion über die sichtbare Überschrift ohne separates aria-label', () => {
    const initialZustand = zustandMitNichtEnumerierterSchlangenhaeutung()
    render(
      <>
        <App initialZustand={initialZustand} />
        <App initialZustand={initialZustand} />
      </>,
    )

    const spielbereiche = screen.getAllByRole('region', { name: 'Spielbereich' })
    const hinweisRegionen = spielbereiche.map((spielbereich) => {
      const aktionenBereich = within(spielbereich).getByRole('region', { name: 'Aktionen' })
      return within(aktionenBereich).getByRole('region', { name: 'Weitere verfügbare Aktionen' })
    })
    const labelIds = hinweisRegionen.map((region) => region.getAttribute('aria-labelledby'))

    expect(new Set(labelIds).size).toBe(hinweisRegionen.length)

    for (const hinweisRegion of hinweisRegionen) {
      const labelId = hinweisRegion.getAttribute('aria-labelledby')

      expect(hinweisRegion).toHaveClass('aktionen-gruppe--hinweise')
      expect(hinweisRegion).not.toHaveAttribute('aria-label')
      expect(labelId).toBeTruthy()
      expect(labelId?.trim().split(/\s+/)).toHaveLength(1)

      const labelZiele = document.querySelectorAll(`#${CSS.escape(labelId ?? '')}`)
      expect(labelZiele).toHaveLength(1)
      expect(hinweisRegion).toContainElement(labelZiele[0] as HTMLElement)
      expect(labelZiele[0]).toHaveTextContent('Weitere verfügbare Aktionen')
      expect(within(hinweisRegion).getByRole('heading', { name: 'Weitere verfügbare Aktionen', level: 3 })).toBe(labelZiele[0])
      expect(within(hinweisRegion).getByText('Schlangenhäutung verfügbar')).toBeInTheDocument()
      expect(within(hinweisRegion).getByRole('group', { name: 'Schlangenhäutung-Reihenfolge-Auswahl' })).toBeInTheDocument()
    }
  })
})
