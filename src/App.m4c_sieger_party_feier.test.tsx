/**
 * Author: hermes-cron
 * Datum: 23.06.2026
 * Beschreibung: M4c beweist den emotionalen Siegesmoment als reichhaltige
 * Stitch-Feier: Konfetti-Regen (8+ Stück), schwebende Luftballons,
 * glühende Korona hinter der Gewinnerfigur, Pokal-Badge, Holztitel-Nägel
 * und Wiggle-Headline. Engine-Daten und bestehende M4b-Verträge bleiben intakt.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import type { Spielzustand } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')

function spielendeZustand(spielerAnzahl = 2): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(spielerAnzahl, () => 0.999999))
  const gruppenIds = ['blau-01', 'blau-03', 'blau-05']
  const gruppenKarten = zustand.spieler[0].hand.filter(karte => gruppenIds.includes(karte.id))
  return {
    ...zustand,
    spielphase: 'Beendet',
    zugphase: 'Spielende',
    spieler: zustand.spieler.with(0, {
      ...zustand.spieler[0],
      hand: zustand.spieler[0].hand.filter(karte => !gruppenIds.includes(karte.id)),
      schlangen: [{ id: 'schlange-m4c', karten: gruppenKarten, zustand: 'aktiv' }],
    }),
  }
}

describe('M4c Sieger-Party als freudige Stitch-Feier', () => {
  it('zeigt einen Konfetti-Regen mit mindestens 8 bunten Stücken', () => {
    render(<App initialZustand={spielendeZustand()} />)
    const party = screen.getByRole('region', { name: 'Sieger-Party' })
    const konfetti = within(party).getByText('', { selector: '.sieger-party__konfetti' })
    const stuecke = konfetti.querySelectorAll('span')
    expect(stuecke.length).toBeGreaterThanOrEqual(8)
  })

  it('zeigt schwebende Luftballons als festliches Atmosphäre-Element', () => {
    render(<App initialZustand={spielendeZustand()} />)
    const party = screen.getByRole('region', { name: 'Sieger-Party' })
    const ballons = within(party).getByText('', { selector: '.sieger-party__ballons' })
    const ballonStuecke = ballons.querySelectorAll('span')
    expect(ballonStuecke.length).toBeGreaterThanOrEqual(4)
  })

  it('zeigt eine glühende Korona hinter der Gewinnerfigur', () => {
    render(<App initialZustand={spielendeZustand()} />)
    const party = screen.getByRole('region', { name: 'Sieger-Party' })
    expect(party.querySelector('.sieger-party__korona')).not.toBeNull()
  })

  it('zeigt eine Pokal-Badge neben der Gewinnerfigur', () => {
    render(<App initialZustand={spielendeZustand()} />)
    const party = screen.getByRole('region', { name: 'Sieger-Party' })
    expect(party.querySelector('.sieger-party__pokal')).not.toBeNull()
  })

  it('bewahrt die bestehenden M4b-Datenverträge (Gewinner, Punkte, Neustart)', () => {
    render(<App initialZustand={spielendeZustand()} />)
    const party = screen.getByRole('region', { name: 'Sieger-Party' })
    expect(within(party).getByRole('heading', { name: 'Schlangentanz!' })).toBeVisible()
    expect(within(party).getByText('Sieg für Spieler 1')).toBeVisible()
    expect(within(party).getByText('Gesamtpunkte')).toBeVisible()
    expect(within(party).getByText('Farbgruppen')).toBeVisible()
    expect(within(party).getByText('Aufgaben')).toBeVisible()
    expect(within(party).getByRole('button', { name: 'Noch einmal spielen' })).toBeVisible()
  })

  it('verankert Ballon-, Wiggle- und Korona-Animationen in der CSS', () => {
    expect(appCss).toMatch(/@keyframes\s+party-balloon/s)
    expect(appCss).toMatch(/@keyframes\s+party-wiggle/s)
    expect(appCss).toMatch(/\.sieger-party__korona\s*\{/s)
    expect(appCss).toMatch(/\.sieger-party__ballons\s*\{/s)
    expect(appCss).toMatch(/\.sieger-party__pokal\s*\{/s)
  })

  it('respektiert prefers-reduced-motion für alle Feier-Animationen', () => {
    expect(appCss).toMatch(/prefers-reduced-motion[^}]*\.sieger-party[^}]*animation[^}]*none/s)
  })

  it('startet aus der angereicherten Sieger-Party eine neue Partie', () => {
    render(<App initialZustand={spielendeZustand()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Noch einmal spielen' }))
    expect(screen.queryByRole('region', { name: 'Sieger-Party' })).not.toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Spielstatus' })).getByText(/Partiestatus: Laufende Partie/i)).toBeVisible()
  })
})
