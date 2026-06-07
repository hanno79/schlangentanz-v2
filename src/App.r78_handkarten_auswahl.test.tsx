/*
Author: rahn
Datum: 05.06.2026
Version: 1.1
Beschreibung: R78 UI-Test für die auswählbare Handkartenleiste im Bereich des aktiven Spielers.
Änderung v1.0: Klick auf eine Handkarte markiert sie als ausgewählt und zeigt die Auswahl im Spieltisch an.
# ÄNDERUNG 07.06.2026: R110 ergänzt Regression gegen doppelte Detail-Titel-IDs bei mehrfach gerendertem Panel.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import HandkartenPanel from './components/HandkartenPanel'
import { erstelleSpielzustand } from './engine'
import { farbkarte } from './engine/__tests__/testHelpers'

const TEST_KARTE = farbkarte('karte r110 mit leerzeichen', 'Rot', 3)
const ZWEITE_KARTE = farbkarte('zweite karte r110 mit leerzeichen', 'Rot', 3)

describe('R78 Handkarten-Auswahl', () => {
  it('markiert eine angeklickte Handkarte als ausgewählt und zeigt die Auswahl an', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999)
    const hand = zustand.spieler[0].hand

    render(<App initialZustand={zustand} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const handBereich = within(aktiverSpielerBereich).getByRole('region', { name: 'Handkarten' })
    const ersteKarte = within(handBereich).getByRole('button', { name: new RegExp(hand[0].id) })

    fireEvent.click(ersteKarte)

    expect(ersteKarte).toHaveAttribute('aria-pressed', 'true')
    const erwarteteDetails = hand[0].typ === 'Farbkarte'
      ? `Farbkarte ${hand[0].farbe} · ${hand[0].punkte} Punkte`
      : `Sonderkarte ${hand[0].name}`

    expect(within(aktiverSpielerBereich).getByRole('region', { name: `Ausgewählte Handkarte: ${hand[0].id}` })).toHaveTextContent(
      `Ausgewählte Handkarte: ${hand[0].id}`,
    )
    expect(within(aktiverSpielerBereich).getByRole('region', { name: `Ausgewählte Handkarte: ${hand[0].id}` })).toHaveTextContent(
      erwarteteDetails,
    )
  })

  it('hebt die Auswahl bei erneutem Klick auf dieselbe Handkarte wieder auf', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999)
    const hand = zustand.spieler[0].hand

    render(<App initialZustand={zustand} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const handBereich = within(aktiverSpielerBereich).getByRole('region', { name: 'Handkarten' })
    const ersteKarte = within(handBereich).getByRole('button', { name: new RegExp(hand[0].id) })

    fireEvent.click(ersteKarte)
    fireEvent.click(ersteKarte)

    expect(ersteKarte).toHaveAttribute('aria-pressed', 'false')
    expect(within(aktiverSpielerBereich).queryByRole('region', { name: /Ausgewählte Handkarte/i })).toBeNull()
  })

  it('erzeugt eindeutige Detail-Titel-IDs, wenn mehrere HandkartenPanels gerendert werden', () => {
    render(
      <>
        <HandkartenPanel
          handkarten={[TEST_KARTE]}
          ausgewaehlteHandkarte={TEST_KARTE}
          onKarteWaehlen={() => undefined}
          onKarteDragStart={() => undefined}
          onKarteDragEnd={() => undefined}
        />
        <HandkartenPanel
          handkarten={[ZWEITE_KARTE]}
          ausgewaehlteHandkarte={ZWEITE_KARTE}
          onKarteWaehlen={() => undefined}
          onKarteDragStart={() => undefined}
          onKarteDragEnd={() => undefined}
        />
      </>,
    )

    const details = screen.getAllByRole('region', { name: /Ausgewählte Handkarte:/ })
    const titleIds = details.map((detail) => detail.getAttribute('aria-labelledby'))

    expect(new Set(titleIds).size).toBe(2)
    titleIds.forEach((titleId) => {
      expect(titleId?.trim().split(/\s+/)).toHaveLength(1)
      expect(document.getElementById(titleId as string)).toBeInTheDocument()
    })
  })
})
