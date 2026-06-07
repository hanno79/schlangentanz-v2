/*
Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: R113 Regressionstest für DOM-sichere Sprungziel-IDs im AktionenPanel.
ÄNDERUNG [07.06.2026]: R113 RED-Test ergänzt.
Prüft, dass parallele App-Instanzen keine doppelten AktionenPanel-Ziel-IDs erzeugen.
*/
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R113 AktionenPanel DOM-sichere Sprungziel-IDs', () => {
  it('verknüpft Spielerführungslinks in zwei App-Instanzen mit eindeutigen Aktionszielen', () => {
    render(
      <>
        <App initialZustand={deterministischerZustand()} />
        <App initialZustand={deterministischerZustand()} />
      </>,
    )

    const aktiverSpielerBereiche = screen.getAllByRole('region', { name: 'Aktiver Spieler' })
    const aktionenBereiche = screen.getAllByRole('region', { name: 'Aktionen' })

    expect(aktiverSpielerBereiche).toHaveLength(2)
    expect(aktionenBereiche).toHaveLength(2)

    const zielIds = aktionenBereiche.flatMap((aktionenBereich) => [
      within(aktionenBereich).getByRole('region', { name: 'Empfohlene Aktion' }).id,
      within(aktionenBereich).getByRole('region', { name: 'Phasenaktion' }).id,
    ])

    expect(new Set(zielIds).size).toBe(zielIds.length)

    aktiverSpielerBereiche.forEach((aktiverSpielerBereich, index) => {
      const spielerfuehrung = within(aktiverSpielerBereich).getByRole('region', { name: 'Spielerführung' })
      const sprunglink = within(spielerfuehrung).getByRole('link', { name: 'Zur empfohlenen Aktion im Aktionsbereich' })
      const empfohleneAktion = within(aktionenBereiche[index]).getByRole('region', { name: 'Empfohlene Aktion' })

      expect(sprunglink).toHaveAttribute('href', `#${empfohleneAktion.id}`)
    })
  })
})
