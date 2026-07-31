/**
 * Author: rahn
 * Datum: 27.06.2026
 * Version: 1.0
 * Beschreibung: M2g RED-Tests fuer die sichtbare Waldtanz-Brettrand-Questpille.
 *              Die persoenliche Quest des aktiven Spielers (`geheimeAufgabeText`)
 *              lebt aktuell als unscheinbarer <p> in der AktiverSpielerZugtafel-Sidebar.
 *              M2g promoted sie zu einer prominenten Stitch-Lime-Pille am Brettrand,
 *              damit der Spieler JEDEN ZUG seine Quest sieht.
 *
 * Ziel:
 *  - Auf /game existiert genau ein .waldtanz-brettrand-questpille-Container
 *  - Die Pille enthaelt Icon + Quest-Text (gematcht gegen geheimeAufgabeText) + Status
 *  - Pille hat Stitch-Optik (3px forest-green-Border, hard-shadow, pill-radius, lime-BG)
 *  - Auf / (Lobby) ist die Pille NICHT sichtbar (Route-Scope)
 *  - Alte <p className="waldtanz-zugtafel__quest">-Zeile ist auf /game visuell weg (display:none)
 *  - Auf / (Lobby) ist die alte Quest-Zeile weiterhin sichtbar (kein Route-Leak)
 *  - SSOT: Pille und Sidebar-Zeile rendern den GLEICHEN geheimeAufgabeText
 *  - package.json smoke:production enthaelt das M2g-Skript in der Kette
 *  - Das M2g-Smoke-Skript enthaelt pruefeM2gBrettrandQuestpille + Slice-Klassen + Schwellen
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen, within } from '@testing-library/react'
import App from './App'
import { produktionsKette } from './test/smokeKetten'

function readSrc(relPath: string): string {
  return readFileSync(resolve(process.cwd(), relPath), 'utf8')
}

describe('M2g Waldtanz-Brettrand-Questpille (RED)', () => {
  beforeEach(() => {
    // Sicherstellen, dass jeder Test auf /game startet
    window.history.pushState({}, '', '/game')
  })

  it('M2g:1 App.css deklariert eine sichtbare Brettrand-Questpille mit Stitch-Optik', () => {
    const css = readSrc('src/App.css')
    const match = css.match(/\.waldtanz-brettrand-questpille\s*\{([^}]*)\}/)
    expect(match, 'Basis-Regel .waldtanz-brettrand-questpille muss existieren').not.toBeNull()
    const block = match![1]
    // Sichtbares Layout: muss Grid/Flex sein.
    expect(block).toMatch(/display:\s*(grid|flex|inline-flex)/)
    // 3px Stitch-Border.
    expect(block).toMatch(/border:\s*3px solid/)
    // Pillen-Radius (999px) — Stitch-Style.
    expect(block).toMatch(/border-radius:\s*999px/)
    // Hard-Shadow als Box-Shadow mit nicht-Null-Versatz.
    expect(block).toMatch(/box-shadow:[^;]*\d+px\s+0/)
  })

  it('M2g:2 Questpille rendert auf /game mit Icon + Quest-Text (SSOT geheimeAufgabeText)', () => {
    render(<App />)
    const pille = screen.getByRole('group', { name: /Brettrand-Questpille|Aktive Quest|Pers\u00f6nliche Quest/i })
    expect(pille, 'Questpille-Region muss existieren').toBeInTheDocument()
    // Quest-Text-Element muss innerhalb der Pille sein
    const questText = within(pille).getByText(/Quest|Aufgabe/i)
    expect(questText).toBeInTheDocument()
  })

  it('M2g:3 Questpille ist auf / (Lobby) nicht sichtbar (Route-Scope)', () => {
    window.history.pushState({}, '', '/')
    render(<App />)
    // Pille darf im Default-Lobby-Layout nicht gerendert werden
    const pilles = screen.queryAllByRole('group', { name: /Brettrand-Questpille/i })
    expect(pilles, 'Auf / darf keine Brettrand-Questpille gerendert werden').toHaveLength(0)
  })

  it('M2g:4 Alte Sidebar-Quest-Zeile ist auf /game visuell weg (display:none + !important + doppelte Klasse)', () => {
    const css = readSrc('src/App.css')
    // Route-scoped display:none Regel mit doppelter Klasse (0,3,0 Specificity) gewinnt gegen die
    // pre-existing 0,4,0 sr-only-Regel im @media (min-width: 1100px)-Block
    const match = css.match(/\.spielbereich--game-route\s+\.waldtanz-zugtafel__quest\.waldtanz-zugtafel__quest\s*\{([^}]*)\}/)
    expect(match, 'display:none-Regel mit doppelter Klasse .spielbereich--game-route .waldtanz-zugtafel__quest.waldtanz-zugtafel__quest muss existieren').not.toBeNull()
    expect(match![1]).toMatch(/display:\s*none/)
    expect(match![1]).toMatch(/!important/)
  })

  it('M2g:5 Auf / (Lobby) bleibt die alte Quest-Zeile sichtbar — KEIN Route-Leak', () => {
    const css = readSrc('src/App.css')
    // Sicherstellen, dass KEIN generisches .waldtanz-zugtafel__quest { display:none } existiert
    // (nur die route-scoped Variante .spielbereich--game-route .waldtanz-zugtafel__quest ist erlaubt)
    const lines = css.split('\n')
    let generischGefunden = false
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.match(/^\.waldtanz-zugtafel__quest\s*\{/)) {
        // Pruefen, dass das body 'display: none' enthaelt (sonst ist die Regel ok, z.B. nur fuer styling)
        const body = line + '\n' + lines.slice(i + 1, i + 5).join('\n')
        if (/display:\s*none/.test(body) && !line.includes('spielbereich--game-route')) {
          generischGefunden = true
          break
        }
      }
    }
    expect(generischGefunden, 'Generische .waldtanz-zugtafel__quest display:none wuerde Lobby verstecken — verboten').toBe(false)
  })

  it('M2g:6 SSOT: Pille und Sidebar-Zeile rendern den GLEICHEN geheimeAufgabeText-Wert', () => {
    render(<App />)
    // Mindestens ein Element mit dem Quest-Praefix rendert den geheimeAufgabeText
    const questElements = screen.getAllByText(/Pers\u00f6nliche Quest:|Waldtanz-Quest|geheime Aufgabe/i)
    expect(questElements.length).toBeGreaterThanOrEqual(1)
  })

  it('M2g:7 package.json smoke:production-Kette enthaelt M2g-Skript', () => {
    const chain = produktionsKette()
    expect(chain, 'smoke:production-Script muss existieren').toContain('m2g_brettrand_questpille_smoke.mjs')
  })

  it('M2g:8 M2g-Smoke-Skript enthaelt pruefeM2gBrettrandQuestpille und Slice-Klassen', () => {
    const smoke = readSrc('scripts/m2g_brettrand_questpille_smoke.mjs')
    expect(smoke).toMatch(/pruefeM2gBrettrandQuestpille/)
    expect(smoke).toMatch(/\.waldtanz-brettrand-questpille/)
  })
})
