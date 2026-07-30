/*
Author: rahn
Datum: 02.06.2026
Version: 1.0
Beschreibung: R54 UI-Test für die sichtbare nächste legale Aktion im aktiven Spielerbereich.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { aktionsName } from './testUtils'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R54 UI-nächste legale Aktion', () => {
  it('zeigt die nächste legale Aktion im aktiven Spielerbereich und aktualisiert sie nach einer Aktion', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const aktionsBereich = screen.getByRole('region', { name: 'Aktionen' })

    const ersteAktion = within(aktionsBereich).getAllByRole('button').find(button =>
      button.textContent?.includes('Neue Schlange starten mit'),
    )
    if (!ersteAktion) throw new Error('Erwartete mindestens eine legale Startaktion im UI.')

    const ersteHinweis = `Empfohlene Aktion: ${aktionsName(ersteAktion)}`
    expect(
      within(aktiverSpielerBereich).getByText(ersteHinweis),
    ).toBeInTheDocument()

    fireEvent.click(ersteAktion)

    const aktualisierteAktion = within(aktionsBereich).queryByRole('button', {
      name: /^(Neue Schlange starten mit|Wasserwirbel|Sonnenblatt|Feuerkeim|Mondranke|Wurzelpfad|Waldspross)/i,
    })

    if (aktualisierteAktion) {
      expect(
        within(aktiverSpielerBereich).getByText(
          `Empfohlene Aktion: ${aktionsName(aktualisierteAktion)}`,
        ),
      ).toBeInTheDocument()
    } else {
      expect(within(aktiverSpielerBereich).queryByText(ersteHinweis)).not.toBeInTheDocument()
    }

    expect(within(aktiverSpielerBereich).queryByText(/Nächste legale Aktion:/)).not.toBeInTheDocument()
  })
})
