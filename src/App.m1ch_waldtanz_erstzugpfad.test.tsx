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
    expect(within(startkreis.closest('.schlangen-startzone') as HTMLElement).getAllByText('Startfährte').length).toBeGreaterThanOrEqual(3)
    expect(within(handbank).getByText(/Deine Hand/)).toBeVisible()
    expect(tischkarte.compareDocumentPosition(startkreis) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(startkreis.compareDocumentPosition(handbank) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('sichert den sichtbaren Geometrie-Vertrag und den dauerhaften Production-Smoke', () => {
    // AENDERUNG 25.06.2026 (M1dj): Die Section .waldtanz-lichtungsbrett
    // traegt heute keine benannten Areas mehr. Die Brett-Aufteilung
    // (Tischkarte | Magiekreise | Schlangen) lebt jetzt in der inneren
    // .waldtanz-schlangenlichtung__schlangen-Klasse. Die eigene-Schlangen-
    // und Hand-Pfade behalten ihre benannten Areas aus M1d0.
    const lichtungRoute = cssBlock('.spielbereich--game-route [class~="waldtanz-lichtungsbrett"]')
    const eigeneRoute = cssBlock('.spielbereich--game-route [class~="schlangen-gruppe--eigene-lichtung"]')
    const startzoneRoute = cssBlock('.spielbereich--game-route [class~="schlangen-gruppe--eigene-lichtung"] [class~="schlangen-startzone"]')
    const handRoute = cssBlock('.spielbereich--game-route [class~="handkarten-panel"]')

    expect(lichtungRoute).toMatch(/grid-template-columns:\s*minmax\(0,\s*1fr\)/)
    expect(lichtungRoute).not.toMatch(/grid-template-areas:/)
    // Die innere Brett-Aufteilung muss die 3-Spalten-Areas-Konfiguration tragen.
    expect(cssBlock('.waldtanz-schlangenlichtung__schlangen')).toMatch(/grid-template-areas:\s*"tischkarte magiekreise magiekreise"/)
    expect(eigeneRoute).toMatch(/grid-template-areas:/)
    expect(eigeneRoute).toMatch(/startgarten startzone/)
    expect(startzoneRoute).toMatch(/grid-area:\s*startzone/)
    // M1d0 22.06.2026: Handkarten-Panel hat jetzt grid-area: hand in der
    // benannten Bottom-Row statt align-self: end. Die Lage ergibt sich
    // aus dem Grid-Areas-Schema, nicht mehr aus individueller Alignment-
    // Konfiguration.
    expect(handRoute).toMatch(/grid-area:\s*hand/)
    expect(handRoute).not.toMatch(/align-self:\s*end/)
    expect(packageJson).toContain('node scripts/m1bw_lichtung_entflechtung_smoke.mjs')
    expect(smokeScript).toContain('Tischkarte ueberlappt Startkreis')
    // M1d0 22.06.2026: "Startkreis laeuft in die Handbank" wurde zu
    // "Startkreis laeuft in den Viewport-Boden" umformuliert, weil M1d0
    // die Handbank-Bounding-Box explizit unter dem Startkreis erlaubt
    // (Bottom-Row first Trade-off). Der Startkreis darf die Handbank-
    // Bounding-Box beruehren, aber nicht ueber den Viewport-Boden (900 px)
    // hinausragen.
    expect(smokeScript).toContain('Startkreis laeuft in den Viewport-Boden')
    // Pruefpunkt-Phrasierung wurde von "nicht hit-testbar" auf
    // "unerwartet verdeckt" geaendert, weil die Startkreis-Pruefpunkte
    // jetzt regelmaessig in die Handbank-Bounding-Box fallen (M1d0-Trade-off).
    expect(smokeScript).toContain('Startkreis-Pruefpunkte unerwartet verdeckt')
  })
})
