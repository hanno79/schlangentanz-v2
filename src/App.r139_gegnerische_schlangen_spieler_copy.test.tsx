/**
 * Author: rahn
 * Datum: 11.06.2026
 * Version: 1.0
 * Beschreibung: R139 UI-Test für spielerfreundliche Besitzer-Copy auf gegnerischen Schlangenkarten.
 */

import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte } from './engine/__tests__/testHelpers'

function zustandMitGegnerischerSchlange() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[1].schlangen = [
    { id: 'schlange-r139-gegner', zustand: 'aktiv', karten: [farbkarte('gelb-r139-1', 'Gelb')] },
  ]
  return zustand
}

describe('R139 Besitzer-Copy gegnerischer Schlangen', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/game')
  })

  it('zeigt den Spielernamen statt der rohen Spieler-ID auf gegnerischen Schlangenkarten', () => {
    render(<App initialZustand={zustandMitGegnerischerSchlange()} />)

    // M1dp: Gegnerlichtung ist jetzt im Arenastein, nicht mehr im Spieltisch
    const gegnerischeSchlangen = screen.getByRole('region', { name: 'Waldtanz-Gegnerlichtung' })

    expect(within(gegnerischeSchlangen).getByText('Gehört zu: Spieler 2')).toBeVisible()
    expect(within(gegnerischeSchlangen).queryByText('Spieler: spieler-2')).toBeNull()
  })
})
