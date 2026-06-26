/**
 * Author: rahn
 * Datum: 05.06.2026
 * Version: 1.0
 * Beschreibung: F35 UI-Test für sichtbar nebeneinander liegende Karten in jeder Schlange.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (sel: string) =>
  appCss.match(new RegExp(`\\.${sel}\\s*\\{([^}]*)\\}`))?.[1] ?? ''

function zustandMitKartenreihen() {
  const zustand = erstelleSpielzustand(2, () => 0.999999)
  const eigeneKarten = zustand.spieler[0].hand.slice(0, 3)
  const gegnerKarten = zustand.spieler[1].hand.slice(0, 2)

  zustand.spieler[0].hand = zustand.spieler[0].hand.slice(3)
  zustand.spieler[1].hand = zustand.spieler[1].hand.slice(2)
  zustand.spieler[0].schlangen = [{ id: 'schlange-spieler-1-f35', karten: eigeneKarten, zustand: 'aktiv' }]
  zustand.spieler[1].schlangen = [{ id: 'schlange-spieler-2-f35', karten: gegnerKarten, zustand: 'aktiv' }]

  return { zustand, eigeneKarten, gegnerKarten }
}

describe('F35 Schlangen-Kartenreihe', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/game')
  })

  it('zeigt jede Schlange als sichtbare Kartenreihe mit allen Karten nebeneinander', () => {
    const { zustand, eigeneKarten, gegnerKarten } = zustandMitKartenreihen()

    render(<App initialZustand={zustand} />)

    // M1dp: Gegnerlichtung wurde in den Arenastein extrahiert
    const schlangenbereich = screen.getByRole('region', { name: 'Schlangenbereich' })
    const eigeneGruppe = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const gegnerGruppe = screen.getByRole('region', { name: 'Waldtanz-Gegnerlichtung' })
    const eigeneReihe = within(eigeneGruppe).getByRole('list', { name: 'Kartenreihe schlange-spieler-1-f35' })
    const gegnerReihe = within(gegnerGruppe).getByRole('list', { name: 'Kartenreihe schlange-spieler-2-f35' })

    expect(within(eigeneReihe).getAllByRole('listitem')).toHaveLength(eigeneKarten.length)
    expect(within(gegnerReihe).getAllByRole('listitem')).toHaveLength(gegnerKarten.length)

    for (const karte of eigeneKarten) {
      expect(within(eigeneReihe).getByLabelText(new RegExp(`^(Farbkarte|Sonderkarte) ${karte.id}:`))).toBeInTheDocument()
    }

    for (const karte of gegnerKarten) {
      expect(within(gegnerReihe).getByLabelText(new RegExp(`^(Farbkarte|Sonderkarte) ${karte.id}:`))).toBeInTheDocument()
    }

    expect(cssBlock('schlangekarte__kartenreihe')).toMatch(/display:\s*flex/)
    expect(cssBlock('schlangekarte__kartenreihe')).toMatch(/flex-wrap:\s*wrap/)
    expect(cssBlock('schlangekarte__kartenreihe')).toMatch(/gap:\s*0\.35rem/)
    expect(cssBlock('schlangekarte__kartenreihe')).toMatch(/align-items:\s*flex-start/)
    expect(cssBlock('schlangekarte__karte')).toMatch(/min-width:\s*5\.75rem/)
    expect(appCss).toMatch(/\.schlangekarte__karte:nth-child\(2n\)\s*\{[^}]*translateY\(0\.12rem\)/s)
    expect(appCss).toMatch(/\.schlangekarte__karte:nth-child\(3n\)\s*\{[^}]*translateY\(-0\.08rem\)/s)
  })
})
