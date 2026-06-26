/**
 * Author: rahn
 * Datum: 26.06.2026
 * Version: 1.0
 * Beschreibung: M1dn beweist, dass auf /game der linke "Waldtanz-Kompass" als
 *              kompakte Stitch-Indikator-Reihe rendert (kein doppelter Section-
 *              Heading + 3 sichtbar abgesetzte Pillen-Karten mit jeweils
 *              "Phase/Hand/Quest"-Label + Wert). Stattdessen erscheinen die
 *              Status-Werte als eine flache Pillen-Leiste direkt unter dem
 *              Spielerprofil. Die "Nächster Schritt"-Anweisung wird auf /game
 *              visuell reduziert — der Brettrand-End-Turn-Knopf (Waldtanz-
 *              Arenazug) traegt die phase-spezifische Handlungsanweisung.
 *
 *              Reduziertes Layout auf /game:
 *              - Profil (Avatar + Punkte-Pille) bleibt
 *              - Heading "Waldtanz-Kompass" wird auf /game ausgeblendet
 *              - 3-Indikator-Pillen-Reihe (Phase · Hand · Quest) bleibt
 *              - "Nächster Schritt"-Paragraph wird auf /game ausgeblendet
 *
 * RED-Vertrag (TDD):
 *   1. Auf /game: CSS-Source enthaelt display:none Regel fuer
 *      .spielbereich--game-route [class~="waldtanz-seitenmenue__kompass"] strong.
 *   2. Auf /game: CSS-Source enthaelt display:none Regel fuer
 *      .spielbereich--game-route [class~="waldtanz-seitenmenue__kompass"] p.
 *   3. Auf /game: 3 Rankenchips in der Ranken-Reihe vorhanden
 *      (Phase: / Handkarten: / Offene Quests: aria-labels).
 *   4. Auf / (Lobby): Waldtanz-Kompass inkl. Heading + Statgitter +
 *      "Nächster Schritt"-Paragraph sichtbar.
 *   5. Auf /game: Brettrand-Arenazug-Region sichtbar mit "End Turn"-Kicker
 *      + phase-spezifischem Text (Kicker beweist Brettrand-nahe Aktion).
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')

function cssBlockForSelector(selector: string): string {
  // Last-Match-Strategie: bei mehreren Regeln mit gleichem Selektor
  // (z.B. Basis + .spielbereich--game-route-Override) gewinnt die spaetere
  // Override-Regel. Genau die wollen wir pruefen.
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matches = [...appCss.matchAll(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 'gs'))]
  return matches.length > 0 ? (matches[matches.length - 1][1] ?? '') : ''
}

describe('M1dn Waldtanz-Kompass als flache Indikator-Pillen-Reihe', () => {
  it('versteckt auf /game den Waldtanz-Kompass-Heading per CSS (display:none Pflicht)', () => {
    window.history.pushState({}, '', '/game')
    render(<App />)

    // Suche Heading in der Kompass-Section.
    const kompass = screen.getByRole('region', { name: 'Waldtanz-Kompass' })
    const heading = within(kompass).getByText('Waldtanz-Kompass')
    expect(heading).toBeInTheDocument()
    // Source-Vertrag: die Kompass-Region enthaelt ein display:none fuer das
    // strong-Tag, damit der Heading auf /game visuell verschwindet.
    const block = cssBlockForSelector('.spielbereich--game-route [class~="waldtanz-seitenmenue__kompass"] strong')
    expect(block).toMatch(/display:\s*none/)
  })

  it('versteckt auf /game den Nächster-Schritt-Paragraph per CSS', () => {
    window.history.pushState({}, '', '/game')
    render(<App />)

    const kompass = screen.getByRole('region', { name: 'Waldtanz-Kompass' })
    const naechster = within(kompass).getByText(/Nächster Schritt/)
    expect(naechster).toBeInTheDocument()
    const block = cssBlockForSelector('.spielbereich--game-route [class~="waldtanz-seitenmenue__kompass"] p')
    expect(block).toMatch(/display:\s*none/)
  })

  it('rendert auf /game 3 Indikator-Chips in der Ranken-Reihe (Phase / Hand / Quest)', () => {
    window.history.pushState({}, '', '/game')
    render(<App />)

    // Auf /game (kompakteRanke) ist .waldtanz-seitenmenue__rankenwerte die
    // Indikator-Reihe. Sie enthaelt 3 Rankenchips mit aria-labels.
    expect(screen.getByLabelText(/Phase:/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Handkarten:/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Offene Quests:/)).toBeInTheDocument()
  })

  it('bewahrt auf / (Lobby) den Waldtanz-Kompass inkl. Heading + Statgitter + Nächster-Schritt', () => {
    window.history.pushState({}, '', '/')
    render(<App />)

    const kompass = screen.getByRole('region', { name: 'Waldtanz-Kompass' })
    // Heading ist sichtbar (Lobby braucht volle Spielvorbereitungs-Info)
    expect(within(kompass).getByText('Waldtanz-Kompass')).toBeVisible()
    // Nächster Schritt sichtbar
    expect(within(kompass).getByText(/Nächster Schritt/)).toBeVisible()
    // Statgitter sichtbar (volle Status-Liste)
    expect(within(kompass).getByText(/Handkarten:/)).toBeVisible()
  })

  it('zeigt auf /game den Brettrand-Arenazug als sichtbare Aktion mit End-Turn-Kicker', () => {
    window.history.pushState({}, '', '/game')
    render(<App />)

    // Brettrand-Arenazug-Region ist sichtbar (entweder Button oder Wartehinweis,
    // je nach Phase). Beide Varianten tragen den "End Turn"-Kicker + den
    // phase-spezifischen Text als single source of truth fuer naechsten Schritt.
    const arenazug = screen.getByRole('region', { name: 'Waldtanz-Zugaktion' })
    expect(arenazug).toBeVisible()
    // Kicker "End Turn" sichtbar (siehe M1dm).
    expect(within(arenazug).getByText('End Turn')).toBeInTheDocument()
    // Phase-spezifischer Text: Brettrand-Knopf traegt die Handlungsanweisung.
    // Es koennen mehrere Phase-Texte gerendert werden (strong + p); mindestens
    // einer muss da sein.
    const phaseTexte = within(arenazug).getAllByText(/Handkarte|Brett|Aktion|zug|Reagi/)
    expect(phaseTexte.length).toBeGreaterThanOrEqual(1)
    expect(phaseTexte[0].textContent ?? '').toMatch(/\w+/)
  })
})
