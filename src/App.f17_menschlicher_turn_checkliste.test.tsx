/*
Author: rahn
Datum: 05.06.2026
Version: 1.2
Beschreibung: F17 UI-Test für den menschlichen Turn als kompakte, geordnete Mini-Checkliste.
Änderung v1.2: R113 Review – standalone Spielerführung ohne Ziel-ID rendert keinen Link auf ein Fantasieziel.
*/
/// <reference types="node" />

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import Spielerfuehrung from './components/Spielerfuehrung'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

function erwarteMiniCheckliste(spielerfuehrung: HTMLElement, pflichtschritt: string, aktion: string) {
  within(spielerfuehrung).getByRole('heading', { name: 'Mini-Checkliste für deinen Zug', level: 4 })

  const checkliste = within(spielerfuehrung).getByRole('list', { name: 'Mini-Checkliste für deinen Zug' })
  expect(checkliste.tagName).toBe('OL')
  const schritte = within(checkliste).getAllByRole('listitem')

  expect(schritte).toHaveLength(3)
  expect(schritte[0]).toHaveTextContent(`Pflichtschritt prüfen: ${pflichtschritt}`)
  expect(schritte[1]).toHaveTextContent(`Empfohlene Aktion wählen: ${aktion}`)
  expect(schritte[2]).toHaveTextContent('Unten im Aktionenbereich ausführen')
  expect(schritte[0]).not.toHaveAttribute('aria-current')
}

describe('F17 Menschlicher Turn als Mini-Checkliste', () => {
  it('zeigt dem menschlichen Spieler eine kompakte Checkliste mit Pflichtschritt, Empfehlung und Ausführung', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const spielerfuehrung = within(aktiverSpielerBereich).getByRole('region', { name: 'Spielerführung' })

    erwarteMiniCheckliste(
      spielerfuehrung,
      'Eine spielbare Aktion auswählen.',
      'Neue Schlange starten mit Karte blau-01',
    )

    expect(within(spielerfuehrung).getByText('Klicke unten auf die empfohlene Aktion, um deinen Zug fortzusetzen.')).toBeInTheDocument()
  })

  it('aktualisiert die Checkliste auch bei reinen menschlichen Phasenaktionen', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const aktionsBereich = screen.getByRole('region', { name: 'Aktionen' })

    fireEvent.click(within(aktionsBereich).getByRole('button', { name: /Neue Schlange starten mit Karte blau-01/i }))

    const spielerfuehrung = within(aktiverSpielerBereich).getByRole('region', { name: 'Spielerführung' })
    erwarteMiniCheckliste(spielerfuehrung, 'Ausspielphase beenden.', 'Ausspielphase beenden')
  })

  it('verwendet pro Spielerführung eine eindeutige Checklisten-Überschrift ohne statische ID-Kollision', () => {
    render(
      <>
        <Spielerfuehrung pflichtschrittLabel="Eine spielbare Aktion auswählen." empfohleneAktionLabel="Aktion A" />
        <Spielerfuehrung pflichtschrittLabel="Ausspielphase beenden." empfohleneAktionLabel="Aktion B" />
      </>,
    )

    const checklisten = screen.getAllByRole('list', { name: 'Mini-Checkliste für deinen Zug' })
    const labelledByWerte = checklisten.map((checkliste) => checkliste.getAttribute('aria-labelledby'))

    expect(new Set(labelledByWerte).size).toBe(2)
    expect(labelledByWerte).not.toContain('checkliste-ueberschrift')
    expect(screen.getAllByText('Im Aktionsbereich gibt es aktuell kein Springziel.')).toHaveLength(2)
    expect(screen.queryByRole('link', { name: /Zur .* im Aktionsbereich/i })).toBeNull()
  })

  it('labelt jede Spielerführung-Region über eine eigene sichtbare Überschrift', () => {
    render(
      <>
        <Spielerfuehrung pflichtschrittLabel="Eine spielbare Aktion auswählen." empfohleneAktionLabel="Aktion A" />
        <Spielerfuehrung pflichtschrittLabel="Ausspielphase beenden." empfohleneAktionLabel="Aktion B" />
      </>,
    )

    const regionen = screen.getAllByRole('region', { name: 'Spielerführung' })
    const labelIds = regionen.map((region) => region.getAttribute('aria-labelledby'))

    expect(regionen).toHaveLength(2)
    expect(new Set(labelIds).size).toBe(2)

    for (const [index, region] of regionen.entries()) {
      const labelId = labelIds[index]
      const labelTokens = labelId?.trim().split(/\s+/) ?? []

      expect(labelTokens).toHaveLength(1)
      expect(document.querySelectorAll(`#${CSS.escape(labelTokens[0] ?? '')}`)).toHaveLength(1)
      expect(region.querySelector(`#${CSS.escape(labelTokens[0] ?? '')}`)).toBeTruthy()
      expect(within(region).getByRole('heading', { name: 'Spielerführung', level: 3 })).toBeInTheDocument()
    }
  })
})
