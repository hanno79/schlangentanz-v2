/*
 * Author: rahn
 * Datum: 26.06.2026
 * Version: 1.0
 * Beschreibung: M1ds RED-Tests fuer den sichtbaren Stitch-Spielmoment der
 *              Waldtanz-Handkarten auf /game: Hover-Lift + Selected-Lift +
 *              Spielhinweis-Tooltip + Bereit-Badge + Smoke-Wiring.
 *              Engine, Legal-Aktionen, Auswahl, Drag&Drop und bestehende
 *              Nachbarschaftsverträge (M1bx, M1db, M1ct, M1da, M1dq) bleiben unveraendert.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import App from './App'
import {
  erstelleSpielzustand,
  starteAusspielphase,
  type Spielzustand,
} from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')

// (escapeRegex-Helper nicht mehr noetig, alle Assertions nutzen direkten One-Liner.)

// (cssBlock-Helper ausgelassen — direkter One-Liner wird bevorzugt für
//  Basis-Regeln ohne :hover etc., siehe css-source-helper-pattern.)

function startZustand(): Spielzustand {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.2))
}

describe('M1ds Waldtanz-Spielkarten-Heb-Dich-Hoch', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/game')
  })
  afterEach(() => {
    // globaler Reset greift (M1dq-Folgeslice)
  })

  it('rendert den "Karte spielen →"-Tooltip absolut positioniert ueber der Karte (Stitch-Pattern, nicht im Karten-Inneren)', () => {
    render(<App initialZustand={startZustand()} />)
    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handkartenRegion = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const karten = within(handkartenRegion).getAllByRole('button', { name: /Farbkarte|Sonderkarte/ })
    const ersteKarte = karten[0]
    const spielhinweis = ersteKarte.querySelector('.handkarte__spielhinweis')
    expect(spielhinweis).toBeTruthy()
    expect(spielhinweis?.textContent?.trim()).toBe('Karte spielen →')

    // CSS-Vertrag: Tooltip ist absolut positioniert, sitzt ueber der Karte
    // (-top-X), Stitch-Pille mit Border, Hard-Shadow, inverse-surface-BG
    // Direkter One-Liner fuer Basis-Regel (last-match wuerde sonst den
    // Hover/Focus-Override ohne position-Regel matchen).
    const spielhinweisRule = appCss.match(/\.handkarte__spielhinweis\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(spielhinweisRule).toMatch(/position:\s*absolute/)
    expect(spielhinweisRule).toMatch(/top:\s*-\d+/)
    expect(spielhinweisRule).toMatch(/border:\s*2px solid var\(--st-color-border-strong\)/)
    expect(spielhinweisRule).toMatch(/border-radius:\s*999px/)
    expect(spielhinweisRule).toMatch(/background:\s*var\(--st-color-inverse-surface\)/)
  })

  it('zeigt beim Hovern den Tooltip (Stitch-Spielmoment), beim Verlassen wieder verborgen', () => {
    render(<App initialZustand={startZustand()} />)
    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handkartenRegion = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const karten = within(handkartenRegion).getAllByRole('button', { name: /Farbkarte|Sonderkarte/ })
    const ersteKarte = karten[0]
    const spielhinweis = ersteKarte.querySelector('.handkarte__spielhinweis') as HTMLElement
    expect(spielhinweis).toBeTruthy()

    // Initial: opacity 0 (jsdom computed-style-trap: beweisbar ueber cssBlock)
    const baseRule = appCss.match(/\.handkarte__spielhinweis\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(baseRule).toMatch(/opacity:\s*0/)

    // Beim Hover: opacity 1
    const hoverRule = appCss.match(/\.handkarte__button--karte:hover[\s\S]+?\.handkarte__spielhinweis\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(hoverRule).toMatch(/opacity:\s*1/)
  })

  it('hebt die Handkarte beim Hovern deutlich an (Stitch-Pattern -2.5rem scale 1.12, deutlich staerker als bisheriges -1.25rem)', () => {
    render(<App initialZustand={startZustand()} />)
    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handkartenRegion = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const karten = within(handkartenRegion).getAllByRole('button', { name: /Farbkarte|Sonderkarte/ })
    expect(karten.length).toBeGreaterThanOrEqual(3)

    // CSS-Vertrag: Hover hebt deutlich an
    const hoverRule = appCss.match(/\[class~="handkartenleiste--tiefenfaecher"\]\s+\[class~="handkarte__button--karte"\]:hover\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(hoverRule).toMatch(/translateY\(-2\.5rem\)/)
    expect(hoverRule).toMatch(/scale\(1\.12\)/)
  })

  it('rendert ein sichtbares "BEREIT"-Badge an ausgewaehlten Handkarten (Stitch-Spielmoment)', () => {
    render(<App initialZustand={startZustand()} />)
    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handkartenRegion = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const karten = within(handkartenRegion).getAllByRole('button', { name: /Farbkarte|Sonderkarte/ })

    // Karte anklicken → ausgewaehlt
    fireEvent.click(karten[0])

    const ausgewaehlte = within(handkartenRegion).getAllByRole('button', { name: /Farbkarte|Sonderkarte/ }).find((b) => b.getAttribute('aria-pressed') === 'true')
    expect(ausgewaehlte).toBeTruthy()
    const badge = ausgewaehlte?.querySelector('.handkarte__bereit-badge')
    expect(badge?.textContent?.trim()).toBe('BEREIT')

    // CSS-Vertrag: Badge ist Stitch-Pille mit coral-tertiaer-Container
    const badgeRule = appCss.match(/\.handkarte__bereit-badge\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(badgeRule).toMatch(/position:\s*absolute/)
    expect(badgeRule).toMatch(/border-radius:\s*999px/)
    expect(badgeRule).toMatch(/background:\s*var\(--st-color-tertiary-container\)/)
    expect(badgeRule).toMatch(/font-family:\s*var\(--st-font-headline\)/)
  })

  it('hebt ausgewaehlte Handkarte deutlich hoeher als unselektierte (Stitch-Pattern -3.5rem scale 1.18, statt bisher -1.4rem)', () => {
    // CSS-Vertrag: Token --handkarte-lift-y ist auf -3.5rem gesetzt
    // (war vorher -1.4rem M1db) und die selected-Regel nutzt scale(1.18).
    expect(appCss).toMatch(/--handkarte-lift-y:\s*-3\.5rem/)
    const selectedRule = appCss.match(/\.handkarte--ausgewaehlt\s+\.handkarte__button--karte\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(selectedRule).toMatch(/translateY\(var\(--handkarte-lift-y\)\)/)
    expect(selectedRule).toMatch(/scale\(1\.18\)/)
    // Wackel-Keyframe: peak-Lift -3.0rem scale 1.2 (war -1.15rem scale 1.1)
    expect(appCss).toMatch(/@keyframes\s+handkarte-wackelt[\s\S]*?50%\s*\{[\s\S]*?translateY\(-3\.0rem\)[\s\S]*?scale\(1\.2\)/)
  })

  it('verdrahtet das M1ds-Smoke-Skript in der kanonischen smoke:production-Kette', () => {
    expect(packageJson).toMatch(/m1ds_waldtanz_spielkarten_hebdichhoch_smoke\.mjs/)
    // Chain-Order: M1ds kommt nach M1dq, vor M3b
    const chain = packageJson.match(/smoke:production[\s\S]+?m3b_sonniges_nest_spielstart_smoke\.mjs/)?.[0] ?? ''
    expect(chain).toMatch(/m1dq_waldtanz_sonderkarten_spielmoment_smoke\.mjs/)
    const m1dqIdx = chain.indexOf('m1dq_waldtanz_sonderkarten_spielmoment_smoke.mjs')
    const m1dsIdx = chain.indexOf('m1ds_waldtanz_spielkarten_hebdichhoch_smoke.mjs')
    const m3bIdx = chain.indexOf('m3b_sonniges_nest_spielstart_smoke.mjs')
    expect(m1dqIdx).toBeGreaterThan(-1)
    expect(m1dsIdx).toBeGreaterThan(m1dqIdx)
    expect(m3bIdx).toBeGreaterThan(m1dsIdx)
  })

  it('respektiert reduced-motion: Hover-Lift bleibt statisch ohne Wackel-Animation', () => {
    // Suche den @media-Block, der die handkarte--ausgewaehlt-Regel enthaelt
    const allMediaBlocks = appCss.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?^\}/gm) ?? []
    const relevantBlock = allMediaBlocks.find((block) => block.includes('.handkarte--ausgewaehlt .handkarte__button--karte')) ?? ''
    expect(relevantBlock).toMatch(/\.handkarte--ausgewaehlt\s+\.handkarte__button--karte\s*\{[\s\S]*?animation:\s*none/)
  })
})
