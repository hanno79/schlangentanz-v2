/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1ch entflechtet den ersten Waldtanz-Spielzug: Tischkarte, Startkreis und Handbank muessen als getrennte Spielflaechen lesbar und gesmoked sein.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')
const smokeScript = readFileSync('scripts/m1bw_lichtung_entflechtung_smoke.mjs', 'utf8')

const cssBlock = (selector: string) =>
  appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

describe('M1ch Waldtanz-Erstzugpfad', () => {
  it('zeigt den ersten Zug als getrennten Tischkarten-, Startkreis- und Handbank-Pfad statt als ueberlagerte Flaechen', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const lichtung = within(spieltisch).getByRole('region', { name: 'Schlangenlichtung' })
    const tischkarte = within(lichtung).getByRole('region', { name: 'Waldtanz-Tischkarte' })
    const eigeneSchlangen = within(lichtung).getByRole('region', { name: 'Eigene Schlangen' })
    const startkreis = within(eigeneSchlangen).getByRole('button', { name: 'Neue Schlange starten' })
    const startgarten = within(eigeneSchlangen).getByRole('note', { name: 'Leerer Startgarten' })
    const handbank = within(spieltisch).getByRole('region', { name: 'Handkarten' })

    expect(within(tischkarte).getByText('Kartenaltar')).toBeVisible()
    expect(within(startkreis).getByText('Startkreis')).toBeVisible()
    expect(within(startgarten).getByText('Noch keine eigene Schlange')).toBeVisible()
    expect(within(startkreis).getAllByText('Startfährte').length).toBeGreaterThanOrEqual(3)
    expect(within(handbank).getByText(/Deine Hand/)).toBeVisible()
    expect(tischkarte.compareDocumentPosition(startkreis) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(startkreis.compareDocumentPosition(handbank) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('sichert den sichtbaren Geometrie-Vertrag und den dauerhaften Production-Smoke', () => {
    const lichtungRoute = cssBlock('.spielbereich--game-route [class~="waldtanz-lichtungsbrett"]')
    const eigeneRoute = cssBlock('.spielbereich--game-route [class~="schlangen-gruppe--eigene-lichtung"]')
    const startzoneRoute = cssBlock('.spielbereich--game-route [class~="schlangen-gruppe--eigene-lichtung"] [class~="schlangen-startzone"]')
    const handRoute = cssBlock('.spielbereich--game-route [class~="handkarten-panel"]')

    expect(lichtungRoute).toMatch(/grid-template-areas:/)
    expect(eigeneRoute).toMatch(/grid-template-areas:/)
    expect(eigeneRoute).toMatch(/startgarten startzone/)
    expect(startzoneRoute).toMatch(/grid-area:\s*startzone/)
    expect(handRoute).toMatch(/align-self:\s*end/)
    expect(packageJson).toContain('node scripts/m1bw_lichtung_entflechtung_smoke.mjs')
    expect(smokeScript).toContain('Tischkarte ueberlappt Startkreis')
    expect(smokeScript).toContain('Startkreis laeuft in die Handbank')
    expect(smokeScript).toContain('Startkreis-Pruefpunkte nicht hit-testbar')
  })
})
