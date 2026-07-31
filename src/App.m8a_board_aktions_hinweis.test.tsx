/*
 * Author: Hermes Agent (Cron-Lauf 2026-06-29)
 * Datum: 29.06.2026
 * Version: 1.0
 * Beschreibung: M8a RED-Tests — Sonderkarten-Board-Aktions-Hinweis.
 *
 * M8a macht das "Zuletzt ausgeführt: ..." Feedback auf /game sichtbar,
 * sodass der Spieler nach einem Sonderkarten-Klick eine Stitch-Pille
 * am Brettrand sieht. Aktuell ist das Feedback im
 * WaldtanzAktiverSpielerDebug eingesperrt, der nur auf Lobby-Route
 * (!istGameRoute) gerendert wird.
 *
 * Pflicht-RED-Tests:
 *   RED-1: Komponente existiert in src/components/
 *   RED-2: rendert letzteAktion-Text als Paragraph
 *   RED-3: hat aria-live="polite"
 *   RED-4: hat role="status"
 *   RED-5: App.tsx rendert Komponente auf /game, nicht auf /
 */

import { existsSync, readFileSync } from 'node:fs'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import WaldtanzLetzteAktionHinweis from './components/WaldtanzLetzteAktionHinweis'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { istVerdrahtet } from './test/smokeKetten'

describe('M8a Sonderkarten-Board-Aktions-Hinweis', () => {
  it('RED-1: WaldtanzLetzteAktionHinweis-Komponente existiert in src/components/', () => {
    expect(existsSync('src/components/WaldtanzLetzteAktionHinweis.tsx')).toBe(true)
  })

  it('RED-2: rendert letzteAktion-Text als Paragraph wenn nicht null', () => {
    const { container } = render(<WaldtanzLetzteAktionHinweis letzteAktion="Farbendieb mit Karte x auf Schlange y" />)
    const paragraph = container.querySelector('p')
    expect(paragraph).not.toBeNull()
    expect(paragraph?.textContent).toContain('Farbendieb mit Karte x auf Schlange y')
  })

  it('RED-3: hat aria-live="polite" fuer Screen-Reader-Feedback', () => {
    const { container } = render(<WaldtanzLetzteAktionHinweis letzteAktion="Test-Aktion" />)
    const region = container.querySelector('[aria-live]')
    expect(region).not.toBeNull()
    expect(region?.getAttribute('aria-live')).toBe('polite')
  })

  it('RED-4: hat role="status" fuer A11y', () => {
    const { container } = render(<WaldtanzLetzteAktionHinweis letzteAktion="Test-Aktion" />)
    const region = container.querySelector('[role="status"]')
    expect(region).not.toBeNull()
  })

  it('RED-5: App.tsx rendert Komponente auf /game, NICHT auf /', () => {
    const appTsx = readFileSync('src/App.tsx', 'utf-8')
    // Pruefe: Import existiert
    expect(appTsx).toMatch(/import\s+WaldtanzLetzteAktionHinweis/)
    // Pruefe: Komponente wird im JSX-Tree verwendet
    expect(appTsx).toMatch(/<WaldtanzLetzteAktionHinweis[^>]*letzteAktion=\{letzteAktion\}/)
    // Pruefe: Sie wird nur in einem istGameRoute-Block gerendert (nicht auf /)
    const gameRouteBlockMatch = appTsx.match(/\{istGameRoute[\s\S]{0,800}?<WaldtanzLetzteAktionHinweis/)
    expect(gameRouteBlockMatch).not.toBeNull()
  })
})

describe('M8a App-Integration /game vs /', () => {
  it('M8a:6 — rendert WaldtanzLetzteAktionHinweis NICHT auf / (Lobby-Route)', () => {
    // Default-Route ist / — Komponente darf dort NICHT sichtbar sein
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const { queryByRole } = render(<App initialZustand={zustand} />)
    // Default: pathname ist /, also Lobby. Komponente MUSS abwesend sein.
    expect(queryByRole('status', { name: /Zuletzt ausgeführt/ })).toBeNull()
  })

  it('M8a:7 — Smoke-Wiring: package.json smoke:production enthaelt m8a-Skript', () => {
    expect(istVerdrahtet('m8a_aktions_hinweis_smoke.mjs')).toBe(true)
  })
})
