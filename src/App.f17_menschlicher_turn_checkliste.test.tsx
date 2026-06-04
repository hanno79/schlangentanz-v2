/*
Author: rahn
Datum: 04.06.2026
Version: 1.0
Beschreibung: F17 UI-Test für den menschlichen Turn als kompakte Mini-Checkliste.
*/
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import Spielerfuehrung from './components/Spielerfuehrung'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

function erwarteMiniCheckliste(spielerfuehrung: HTMLElement, pflichtschritt: string, aktion: string) {
  expect(within(spielerfuehrung).getByText('Mini-Checkliste für deinen Zug')).toBeInTheDocument()

  const checkliste = within(spielerfuehrung).getByRole('list', { name: 'Mini-Checkliste für deinen Zug' })
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
      'Eine legale Aktion auswählen.',
      'Neue Schlange starten mit Karte blau-01',
    )

    expect(within(spielerfuehrung).getByText('Klicke unten auf die empfohlene Aktion, um deinen Zug fortzusetzen.')).toBeInTheDocument()
    const appCss = readFileSync('src/App.css', 'utf8')
    expect(appCss).toContain('.spielerfuehrung__checkliste')
    expect(appCss).toContain('.spielerfuehrung__checkschritt')
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
        <Spielerfuehrung pflichtschrittLabel="Eine legale Aktion auswählen." empfohleneAktionLabel="Aktion A" />
        <Spielerfuehrung pflichtschrittLabel="Ausspielphase beenden." empfohleneAktionLabel="Aktion B" />
      </>,
    )

    const checklisten = screen.getAllByRole('list', { name: 'Mini-Checkliste für deinen Zug' })
    const labelledByWerte = checklisten.map((checkliste) => checkliste.getAttribute('aria-labelledby'))

    expect(new Set(labelledByWerte).size).toBe(2)
    expect(labelledByWerte).not.toContain('checkliste-ueberschrift')
  })
})
