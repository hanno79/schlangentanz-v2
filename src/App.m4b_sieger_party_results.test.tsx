/**
 * Author: rahn
 * Datum: 13.06.2026
 * Version: 1.0
 * Beschreibung: M4b beweist den Google-Stitch-Ergebnis-Vertical: Spielende wird als Sieger-Party statt nur als Wertungs-Text sichtbar und neu startbar.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import type { Spielzustand } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function spielendeZustandMitSpieler1Sieg(spielerAnzahl = 2): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(spielerAnzahl, () => 0.999999))
  const gruppenIds = ['blau-01', 'blau-03', 'blau-05']
  const gruppenKarten = zustand.spieler[0].hand.filter(karte => gruppenIds.includes(karte.id))
  if (gruppenKarten.length !== 3) throw new Error('Testsetup erwartet drei blaue Karten auf Spieler-1-Hand.')

  return {
    ...zustand,
    spielphase: 'Beendet',
    zugphase: 'Spielende',
    spieler: zustand.spieler.with(0, {
      ...zustand.spieler[0],
      hand: zustand.spieler[0].hand.filter(karte => !gruppenIds.includes(karte.id)),
      schlangen: [{ id: 'schlange-m4b-sieger', karten: gruppenKarten, zustand: 'aktiv' }],
    }),
  }
}

describe('M4b Sieger-Party Results', () => {
  it('zeigt bei Spielende eine Stitch-inspirierte Sieger-Party mit Gewinner, Punkteplakette und Neustart', () => {
    render(<App initialZustand={spielendeZustandMitSpieler1Sieg()} />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const party = within(spielbereich).getByRole('region', { name: 'Sieger-Party' })

    expect(spielbereich).toHaveClass('spielbereich--mit-sieger-party')
    expect(party).toHaveClass('sieger-party')
    expect(within(party).getByRole('heading', { name: 'Schlangentanz!' })).toBeVisible()
    expect(within(party).getByText('Sieg für Spieler 1')).toBeVisible()
    expect(within(party).getByText('Gewinner: Spieler 1')).toBeVisible()
    expect(within(party).getByText('Gesamtpunkte')).toBeVisible()
    expect(within(party).getAllByText('3')).toHaveLength(2)
    expect(within(party).getByText('Farbgruppen')).toBeVisible()
    expect(within(party).getByText('Aufgaben')).toBeVisible()
    expect(within(party).getByRole('button', { name: 'Noch einmal spielen' })).toBeVisible()

    expect(screen.getByRole('region', { name: 'Spieltisch' })).toHaveClass('spielbrett--waldtanz')
    expect(screen.getByRole('region', { name: 'Wertung' })).toBeVisible()
  })

  it('startet aus der Sieger-Party wieder eine laufende Partie mit sichtbarem Waldtanz-Brett', () => {
    render(<App initialZustand={spielendeZustandMitSpieler1Sieg()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Noch einmal spielen' }))

    expect(screen.queryByRole('region', { name: 'Sieger-Party' })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Spielbereich' })).not.toHaveClass('spielbereich--mit-sieger-party')
    expect(screen.getByRole('region', { name: 'Spieltisch' })).toHaveClass('spielbrett--waldtanz')
    expect(within(screen.getByRole('region', { name: 'Spielstatus' })).getByText(/Partiestatus: Laufende Partie/i)).toBeVisible()
  })

  it('bewahrt beim Neustart die laufende Runde mit bis zu drei KI-Gegnern', () => {
    const viererSpielende = { ...starteAusspielphase(erstelleSpielzustand(4, () => 0.999999)), spielphase: 'Beendet', zugphase: 'Spielende' } satisfies Spielzustand
    render(<App initialZustand={viererSpielende} />)

    fireEvent.click(screen.getByRole('button', { name: 'Noch einmal spielen' }))

    const spieleruebersicht = screen.getByRole('region', { name: 'Spielerübersicht' })
    expect(within(spieleruebersicht).getByText(/Spieler 4:/)).toBeVisible()
    expect(within(spieleruebersicht).getByText(/Spieler 4: 5 Handkarten/)).toBeVisible()
  })

  it('verankert die Ergebnisansicht visuell als Wald-Party mit Konfetti, Krone und hard-shadow Plaketten', () => {
    expect(cssBlock('spielbereich--waldtanz')).not.toMatch(/party/)
    expect(cssBlock('spielbereich--mit-sieger-party')).toMatch(/"party"/)
    expect(appCss).toMatch(/\.sieger-party\s*\{[^}]*border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/s)
    expect(appCss).toMatch(/\.sieger-party\s*\{[^}]*border-radius:\s*3rem/s)
    expect(appCss).toMatch(/\.sieger-party\s*\{[^}]*radial-gradient/s)
    expect(appCss).toMatch(/\.sieger-party__portrait\s*\{[^}]*box-shadow:\s*0 10px 0 var\(--st-color-border-strong\)/s)
    expect(appCss).toMatch(/\.sieger-party__scorekarte\s*\{[^}]*background:\s*var\(--st-color-secondary-container\)/s)
    expect(appCss).toMatch(/\.sieger-party__scorewert\s*\{[^}]*border-radius:\s*999px/s)
    expect(appCss).toMatch(/@keyframes party-float/s)
  })
})
