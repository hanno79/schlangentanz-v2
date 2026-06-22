/**
 * Author: rahn
 * Datum: 22.06.2026
 * Version: 1.0
 * Beschreibung: M1cw macht die Brettschritt-Stempel zu einer erzählten Spiel-Trace:
 * jeder Stempel zeigt unterhalb des Phasen-Badges eine zweite Zeile mit der
 * konkreten Aktions-Konsequenz, also was die Handlung auf dem Brett bewirkt hat
 * (z. B. "Karte blau-09 an Schlange spieler-1-1 rechts anlegen"). Die Konsequenz
 * wird client-seitig aus der gleichen `wechsleZustand`-Transition gepflegt wie
 * Spieler/Phase, damit die Spielerin pro Stempel nachvollziehen kann, welche
 * Aktion die Karte auf den Ablagestapel gebracht hat. Engine und Legal-Aktionen
 * bleiben unangetastet.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, schlange } from './engine/__tests__/testHelpers'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')

function zustandMitBefuelltemAblagestapel() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [farbkarte('blau-m1cw-01', 'Blau', 1)]
  zustand.spieler[0].schlangen = [schlange([farbkarte('gruen-m1cw-start', 'Grün', 1)], 'eigene-schlange-m1cw')]
  zustand.ablagestapel = [
    farbkarte('gelb-m1cw-a', 'Gelb', 2),
    farbkarte('violett-m1cw-b', 'Violett', 3),
  ]
  return zustand
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1cw Waldtanz-Brettschritt-Konsequenz', () => {
  it('rendert pro Brettschritt-Stempel eine zweite Konsequenz-Zeile mit dem Aktions-Label', () => {
    window.history.pushState({}, '', '/game')
    render(
      <App
        initialZustand={zustandMitBefuelltemAblagestapel()}
        initialBrettschrittEintraege={[
          {
            karteId: 'gelb-m1cw-a',
            spielerId: 'spieler-1',
            spielerIndex: 0,
            phase: 'Ausspielphase',
            konsequenz: 'Karte gelb-m1cw-a an Schlange eigene-schlange-m1cw links anlegen',
          },
          {
            karteId: 'violett-m1cw-b',
            spielerId: 'spieler-1',
            spielerIndex: 0,
            phase: 'Ausspielphase',
            konsequenz: 'Karte violett-m1cw-b an Schlange eigene-schlange-m1cw rechts anlegen',
          },
        ]}
      />,
    )

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const arenenstein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const stempelReihe = within(arenenstein).getByRole('list', { name: 'Brettschritt-Stempel' })
    const stempel = within(stempelReihe).getAllByRole('listitem')

    expect(stempel).toHaveLength(2)
    const ersteKonsequenz = within(stempel[0]).getByText(/Karte gelb-m1cw-a an Schlange eigene-schlange-m1cw links anlegen/)
    const zweiteKonsequenz = within(stempel[1]).getByText(/Karte violett-m1cw-b an Schlange eigene-schlange-m1cw rechts anlegen/)
    expect(ersteKonsequenz.tagName).toBe('SPAN')
    expect(ersteKonsequenz.className).toContain('brettschritt-stempel__konsequenz')
    expect(zweiteKonsequenz.className).toContain('brettschritt-stempel__konsequenz')
    expect(stempel[0].getAttribute('aria-label')).toContain('Konsequenz: Karte gelb-m1cw-a an Schlange eigene-schlange-m1cw links anlegen')
    expect(stempel[1].getAttribute('aria-label')).toContain('Konsequenz: Karte violett-m1cw-b an Schlange eigene-schlange-m1cw rechts anlegen')
  })

  it('rendert leere Konsequenz nicht, wenn ein Brettschritt-Stempel ohne Konsequenz ueberlebt', () => {
    window.history.pushState({}, '', '/game')
    render(
      <App
        initialZustand={zustandMitBefuelltemAblagestapel()}
        initialBrettschrittEintraege={[
          {
            karteId: 'gelb-m1cw-a',
            spielerId: 'spieler-1',
            spielerIndex: 0,
            phase: 'Ausspielphase',
          },
          {
            karteId: 'violett-m1cw-b',
            spielerId: 'spieler-1',
            spielerIndex: 0,
            phase: 'Ausspielphase',
            konsequenz: '   ',
          },
        ]}
      />,
    )

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const arenenstein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const stempelReihe = within(arenenstein).getByRole('list', { name: 'Brettschritt-Stempel' })
    const stempel = within(stempelReihe).getAllByRole('listitem')

    expect(stempel.every((s) => s.querySelectorAll('.brettschritt-stempel__konsequenz').length === 0)).toBe(true)
  })

  it('unterscheidet aktuelle und vergangene Konsequenz-Styles ueber die Klassen-Suffixe', () => {
    window.history.pushState({}, '', '/game')
    render(
      <App
        initialZustand={zustandMitBefuelltemAblagestapel()}
        initialBrettschrittEintraege={[
          {
            karteId: 'gelb-m1cw-a',
            spielerId: 'spieler-1',
            spielerIndex: 0,
            phase: 'Zugabschluss',
            konsequenz: 'Vergangene Konsequenz',
          },
          {
            karteId: 'violett-m1cw-b',
            spielerId: 'spieler-1',
            spielerIndex: 0,
            phase: 'Ausspielphase',
            konsequenz: 'Aktuelle Konsequenz',
          },
        ]}
      />,
    )

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const arenenstein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const stempelReihe = within(arenenstein).getByRole('list', { name: 'Brettschritt-Stempel' })
    const stempel = within(stempelReihe).getAllByRole('listitem')

    expect(stempel[0].className).toContain('brettschritt-stempel--vergangen')
    expect(stempel[1].className).toContain('brettschritt-stempel--aktuell')
    expect(within(stempel[0]).getByText('Vergangene Konsequenz').className).toContain('brettschritt-stempel__konsequenz')
    expect(within(stempel[1]).getByText('Aktuelle Konsequenz').className).toContain('brettschritt-stempel__konsequenz')
  })

  it('CSS-Source: Brettschritt-Konsequenz-Selector und Cascade sind in App.css deklariert', () => {
    expect(appCss).toMatch(/\.brettschritt-stempel__konsequenz\b/)
    const konsequenzBlock = appCss.match(/\.brettschritt-stempel__konsequenz\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(konsequenzBlock).toMatch(/font-style:\s*italic/)
    expect(konsequenzBlock).toMatch(/border-left:/)
    expect(appCss).toMatch(/\.brettschritt-stempel--aktuell\s+\.brettschritt-stempel__konsequenz/)
    expect(appCss).toMatch(/\.brettschritt-stempel--vergangen\s+\.brettschritt-stempel__konsequenz/)
  })

  it('CSS-Source: Konsequenz-Token sind in :root definiert (Regressions-Schutz fuer M1cw)', () => {
    const rootBlock = appCss.match(/:root\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(rootBlock).toMatch(/--st-color-text\s*:/)
    expect(rootBlock).toMatch(/--st-color-text-soft\s*:/)
    expect(rootBlock).toMatch(/--st-color-secondary\s*:/)
  })

  it('Smoke-Wiring: package.json npm run smoke:production enthaelt das M1cw-Smoke-Script', () => {
    expect(packageJson).toMatch(/"smoke:production"\s*:\s*"[^"]*m1cw_brettschritt_konsequenz_smoke\.mjs/)
  })
})