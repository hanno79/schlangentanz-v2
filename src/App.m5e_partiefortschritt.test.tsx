/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M5e macht Endspurt- und Siegfortschritt board-nah sichtbar statt nur in Debug-/Materiallisten.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import type { Spielzustand } from './engine'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, schlange } from './engine/__tests__/testHelpers'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function zustandMitFortschritt(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(4, () => 0.999999))
  zustand.nachziehstapel = zustand.nachziehstapel.slice(0, 8)
  zustand.spieler[0].schlangen = [
    schlange([
      farbkarte('rot-m5e-1', 'Rot', 3),
      farbkarte('rot-m5e-2', 'Rot', 3),
      farbkarte('rot-m5e-3', 'Rot', 3),
    ], 'schlange-m5e-fuehrung'),
  ]
  zustand.spieler[1].schlangen = [
    schlange([
      farbkarte('blau-m5e-1', 'Blau', 1),
      farbkarte('blau-m5e-2', 'Blau', 1),
      farbkarte('blau-m5e-3', 'Blau', 1),
    ], 'schlange-m5e-verfolger'),
  ]
  return zustand
}

function zustandImEndspurt(): Spielzustand {
  const zustand = zustandMitFortschritt()
  zustand.spielphase = 'Endspurt'
  zustand.zugphase = 'Nachziehphase'
  zustand.aktiverSpielerIndex = 1
  zustand.nachziehstapel = []
  zustand.endrunde = {
    ausloeserSpielerIndex: 0,
    verbleibendeSpielerIndizes: [1, 2],
  }
  return zustand
}

function partiefortschritt() {
  const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
  return within(spieltisch).getByRole('region', { name: 'Partiefortschritt' })
}

describe('M5e Partiefortschritt', () => {
  it('zeigt Endspurt-Distanz und Führung direkt im Spieltisch zwischen Kompass und Schlangenbereich', () => {
    render(<App initialZustand={zustandMitFortschritt()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const kompass = within(spieltisch).getByRole('region', { name: 'Zugkompass' })
    const fortschritt = partiefortschritt()
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })

    expect(fortschritt).toHaveClass('partiefortschritt')
    expect(within(fortschritt).getByRole('heading', { name: 'Partiefortschritt' })).toBeInTheDocument()
    expect(within(fortschritt).getByText('8 Karten bis zum Endspurt')).toBeInTheDocument()
    expect(within(fortschritt).getByText('Aktuelle Führung: Spieler 1 mit 9 Punkten')).toBeInTheDocument()
    expect(within(fortschritt).getByText('Du: 9 Punkte')).toBeInTheDocument()
    expect(within(fortschritt).getByText(/Leere den Nachziehstapel, dann beginnt die Endrunde/i)).toBeInTheDocument()
    // M1d0 22.06.2026: Visuelle Reihenfolge = DOM-Reihenfolge. Kompass und
    // Fortschritt sitzen beide in der Zugseitenleiste (unter Arenastein).
    // Schlangenbereich sitzt im Arenastein (ueber Zugseitenleiste) und kommt
    // daher im DOM ZUERST.
    expect(schlangenbereich.compareDocumentPosition(kompass) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(schlangenbereich.compareDocumentPosition(fortschritt) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    // Kompass kommt vor Fortschritt (Reihenfolge in der Zugseitenleiste).
    expect(kompass.compareDocumentPosition(fortschritt) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)

    expect(cssBlock('partiefortschritt')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('partiefortschritt')).toMatch(/border-radius:\s*2rem/)
    expect(cssBlock('partiefortschritt')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(appCss).toMatch(/\.partiefortschritt__spur[\s\S]*grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*11rem\),\s*1fr\)\)/)
  })

  it('erklärt im Endspurt die verbleibenden Züge bis zur Sieger-Party', () => {
    render(<App initialZustand={zustandImEndspurt()} />)

    const fortschritt = partiefortschritt()
    expect(within(fortschritt).getByText('Endspurt läuft')).toBeInTheDocument()
    expect(within(fortschritt).getByText('2 Züge bis zur Sieger-Party')).toBeInTheDocument()
    expect(within(fortschritt).getByText('Noch am Zug: Spieler 2, Spieler 3')).toBeInTheDocument()
    expect(within(fortschritt).getByText(/Endrunden-Züge ohne Nachziehen/i)).toBeInTheDocument()
  })
})
