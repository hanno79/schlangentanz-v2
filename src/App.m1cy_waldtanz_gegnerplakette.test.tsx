/**
 * Author: rahn
 * Datum: 22.06.2026
 * Version: 1.0
 * Beschreibung: M1cy macht den naechsten Gegner am Waldtanz-Brett als
 * zweite koerperliche Stitch-Gegnerplakette symmetrisch zur Spielerplakette
 * sichtbar: rechts neben der Handkartenleiste sitzt eine chunky Pill-Karte
 * mit 3px-Waldgruen-Border, Hard-Shadow und Tertiary-Container-Hintergrund,
 * die Avatar, Spielername, grosse Punktzahl und Handkarten-Zahl des
 * naechsten Gegners zeigt plus einen "kommt dran"-Indikator. So erzaehlt
 * das Brett die Geschichte beider Akteure auf einen Blick: Spieler links,
 * Handkarten Mitte, naechster Gegner rechts.
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

function zustandMitAktivemSpieler() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [farbkarte('blau-m1cy-01', 'Blau', 1), farbkarte('gelb-m1cy-02', 'Gelb', 2)]
  zustand.spieler[0].schlangen = [schlange([farbkarte('gruen-m1cy-start', 'Grün', 1)], 'eigene-schlange-m1cy')]
  // Gegner bekommt sichtbare Hand + Schlangen fuer das M1cy-Test-Setup
  zustand.spieler[1].hand = [farbkarte('rot-m1cy-01', 'Rot', 1), farbkarte('rot-m1cy-02', 'Rot', 2), farbkarte('rot-m1cy-03', 'Rot', 3)]
  zustand.spieler[1].schlangen = [schlange([farbkarte('violett-m1cy-start', 'Violett', 1)], 'gegner-schlange-m1cy')]
  return zustand
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1cy Waldtanz-Gegnerplakette', () => {
  it('rendert die Gegnerplakette sichtbar innerhalb des Spieltischs auf /game', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitAktivemSpieler()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const gegnerplakette = within(spieltisch).getByRole('region', { name: /Gegner.*Spieler 2/ })

    expect(gegnerplakette).toBeInTheDocument()
    expect(gegnerplakette.tagName).toBe('SECTION')
    expect(gegnerplakette.className).toContain('waldtanz-gegnerplakette')
    // Punkte-Pille und Handkarten-Span existieren als sichtbare Elemente
    expect(within(gegnerplakette).getByLabelText(/Punktzahl/i)).toBeInTheDocument()
    expect(within(gegnerplakette).getByLabelText(/Handkarten/i)).toBeInTheDocument()
  })

  it('rendert die Gegnerplakette NICHT auf / (Lobby bleibt ohne Gegnerplakette)', () => {
    window.history.pushState({}, '', '/')
    render(<App initialZustand={zustandMitAktivemSpieler()} />)
    expect(document.querySelector('.waldtanz-gegnerplakette')).not.toBeInTheDocument()
  })

  it('rendert die Gegnerplakette NICHT im Spielende-Zustand (Sieger-Party uebernimmt)', () => {
    window.history.pushState({}, '', '/game')
    const zustand = zustandMitAktivemSpieler()
    zustand.zugphase = 'Spielende'
    render(<App initialZustand={zustand} />)
    expect(document.querySelector('.waldtanz-gegnerplakette')).not.toBeInTheDocument()
  })

  it('rendert die Gegnerplakette NICHT wenn nur ein Spieler existiert (Single-Player-Guard)', () => {
    // Defensiver Guard: ohne Gegner waere naechsterGegner === aktiverSpieler,
    // und die Plakette wuerde den Spieler als seinen eigenen Gegner zeigen.
    // Praktisch nicht erreichbar (Lobby fordert 1+KI), aber billiger Hardening-Punkt.
    window.history.pushState({}, '', '/game')
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    zustand.spieler = [zustand.spieler[0]]
    zustand.spieler[0].hand = [farbkarte('solo-m1cy-01', 'Blau', 1)]
    render(<App initialZustand={zustand} />)
    expect(document.querySelector('.waldtanz-gegnerplakette')).not.toBeInTheDocument()
  })

  it('zeigt den Namen und Avatar des naechsten Gegners (2-Spieler: spieler[1])', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitAktivemSpieler()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const gegnerplakette = within(spieltisch).getByRole('region', { name: /Gegner.*Spieler 2/ })
    const nameText = gegnerplakette.querySelector('.waldtanz-gegnerplakette__name-text')
    const avatar = gegnerplakette.querySelector('.waldtanz-gegnerplakette__avatar')

    expect(nameText?.textContent).toMatch(/Spieler 2/)
    // Avatar: Mensch = Kobold (🧙), KI = Frosch (🐸). 2-Spieler-Default hat einen KI-Gegner
    expect(avatar?.textContent).toMatch(/[🧙🐸]/u)
  })

  it('zeigt einen "kommt dran"-Indikator fuer den naechsten Gegner', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitAktivemSpieler()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const gegnerplakette = within(spieltisch).getByRole('region', { name: /Gegner.*Spieler 2/ })
    const indikators = gegnerplakette.querySelectorAll('.waldtanz-gegnerplakette__indikator')

    expect(indikators.length).toBeGreaterThanOrEqual(1)
    // Indikator sichtbar mit "kommt dran"-Bezug (case-insensitive fuer CSS text-transform)
    const indikatorText = Array.from(indikators).map((el) => el.textContent?.trim().toLowerCase() ?? '').join(' ')
    expect(indikatorText).toMatch(/kommt|nächster|naechster|next|danach/)
  })

  it('zeigt die Handkarten-Zahl des naechsten Gegners', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitAktivemSpieler()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const gegnerplakette = within(spieltisch).getByRole('region', { name: /Gegner.*Spieler 2/ })
    const handkarten = gegnerplakette.querySelector('.waldtanz-gegnerplakette__handkarten')

    expect(handkarten?.getAttribute('aria-label')).toMatch(/3\s*Handkarten/)
    expect(handkarten?.textContent).toMatch(/3/)
  })

  it('zeigt die Punktzahl des naechsten Gegners prominent als Headline-Pille', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitAktivemSpieler()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const gegnerplakette = within(spieltisch).getByRole('region', { name: /Gegner.*Spieler 2/ })
    const punktePille = gegnerplakette.querySelector('.waldtanz-gegnerplakette__punkte')

    expect(punktePille).not.toBeNull()
    expect(punktePille?.tagName).toBe('SPAN')
    expect(punktePille?.className).toContain('waldtanz-gegnerplakette__punkte')
    expect(punktePille?.getAttribute('aria-label')).toMatch(/Punktzahl:\s*\d+\s*Punkte?/)
    expect(punktePille?.textContent?.trim()).toMatch(/^\d+$/)
  })

  it('CSS-Source: Gegnerplakette nutzt Stitch-Tokens (3px-Border, Hard-Shadow, Tertiary-Container)', () => {
    // Selector + Basis-Stitch-Styling (Klasse oder Attribut-Selektor zulaessig)
    expect(appCss).toMatch(/(\.waldtanz-gegnerplakette\b|\[class~="waldtanz-gegnerplakette"\])/)
    const plaketteBlock = appCss.match(/(\.waldtanz-gegnerplakette\b|\[class~="waldtanz-gegnerplakette"\])\s*\{([^}]*)\}/)?.[2] ?? ''
    expect(plaketteBlock).toMatch(/border:\s*var\(--st-border-width-chunky\)/)
    expect(plaketteBlock).toMatch(/box-shadow:\s*var\(--st-shadow-hard\)/)
    // Gegnerplakette nutzt Tertiary-Container (anders als Spielerplakette mit Primary-Container)
    expect(plaketteBlock).toMatch(/background:[^;]*var\(--st-color-tertiary-container\)/)

    // Punkte-Pille hat eigene Stitch-Headline-Schrift
    const punkteBlock = appCss.match(/(\.waldtanz-gegnerplakette__punkte\b|\[class~="waldtanz-gegnerplakette__punkte"\])\s*\{([^}]*)\}/)?.[2] ?? ''
    expect(punkteBlock).toMatch(/font-family:\s*var\(--st-font-headline\)/)
    expect(punkteBlock).toMatch(/border:\s*var\(--st-border-width-chunky\)/)

    // Avatar als chunky Pill mit sekundaer-Container
    const avatarBlock = appCss.match(/(\.waldtanz-gegnerplakette__avatar\b|\[class~="waldtanz-gegnerplakette__avatar"\])\s*\{([^}]*)\}/)?.[2] ?? ''
    expect(avatarBlock).toMatch(/border-radius:\s*999px/)
    expect(avatarBlock).toMatch(/background:\s*var\(--st-color-secondary-container\)/)
  })

  it('CSS-Source: Gegnerplakette sitzt auf /game RECHTS OBERHALB der Hand (Arenazugknopf-kompatibel)', () => {
    // Position: right (rechts) — M1cy spiegelt M1cx-Spielerplakette horizontal.
    // Position: top (oben) — gewaehlt weil rechts unten bereits der Arenazugknopf sitzt.
    // Begruendung im AENDERUNG-Kommentar oberhalb der Plakette-Regel.
    // M1d0 22.06.2026: Gegnerplakette ist NICHT mehr position: absolute mit
    // right/top-Properties. Sie sitzt jetzt in der benannten Grid-Zelle
    // "gegner-plakette" mit grid-area: gegner-plakette und position: static.
    // Die Kollision mit dem Arenazugknopf ist damit strukturell ausgeschlossen,
    // weil Arenazug und Gegnerplakette jetzt in getrennten Grid-Zeilen liegen.
    const gegnerplaketteBlock = appCss.match(/(\.spielbereich--game-route[^}]*\[class~="waldtanz-gegnerplakette"\][^{]*\{)([^}]*)\}/s)?.[2] ?? ''
    const cleanedBlock = gegnerplaketteBlock.replace(/\/\*[\s\S]*?\*\//g, '')
    expect(cleanedBlock).toMatch(/grid-area:\s*gegner-plakette/)
    expect(cleanedBlock).toMatch(/position:\s*static/)
    expect(cleanedBlock).not.toMatch(/position:\s*absolute/)
    expect(cleanedBlock).not.toMatch(/right:\s*clamp\(/)
    expect(cleanedBlock).not.toMatch(/top:\s*clamp\(/)
    expect(cleanedBlock).not.toMatch(/bottom:\s*clamp\(/)

    // Reihenfolge: Gegnerplakette-Block kommt NACH Spielerplakette-Block (Source-Order-Guard)
    const spielerIdx = appCss.search(/(\.waldtanz-spielerplakette\b|\[class~="waldtanz-spielerplakette"\])/)
    const gegnerIdx = appCss.search(/(\.waldtanz-gegnerplakette\b|\[class~="waldtanz-gegnerplakette"\])/)
    expect(spielerIdx).toBeGreaterThan(0)
    expect(gegnerIdx).toBeGreaterThan(spielerIdx)
  })

  it('CSS-Source: --st-color-on-tertiary-container ist in :root definiert (Kimi-Review-Regression)', () => {
    const rootBlock = appCss.match(/:root\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(rootBlock).toMatch(/--st-color-on-tertiary-container:\s*#[0-9a-fA-F]{3,6}/)
  })

  it('Gegnerplakette ist visuell eigenstaendig (nicht nur zweite Spielerplakette)', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitAktivemSpieler()} />)

    const spielerplakette = document.querySelector('.waldtanz-spielerplakette')
    const gegnerplakette = document.querySelector('.waldtanz-gegnerplakette')

    expect(spielerplakette).not.toBeNull()
    expect(gegnerplakette).not.toBeNull()
    // Beide sind im DOM, aber unterschiedliche Element-Klassen
    expect(spielerplakette?.classList.contains('waldtanz-spielerplakette')).toBe(true)
    expect(gegnerplakette?.classList.contains('waldtanz-gegnerplakette')).toBe(true)
    expect(spielerplakette?.classList.contains('waldtanz-gegnerplakette')).toBe(false)
  })

  it('Smoke-Wiring: package.json npm run smoke:production enthaelt das M1cy-Smoke-Script', () => {
    expect(packageJson).toMatch(/"smoke:production"\s*:\s*"[^"]*m1cy_waldtanz_gegnerplakette_smoke\.mjs/)
  })
})