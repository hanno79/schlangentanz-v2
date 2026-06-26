/*
 * Author: rahn
 * Datum: 26.06.2026
 * Version: 1.1
 * Beschreibung: M1dq RED-Tests fuer die Waldtanz-Sonderkarten-Spielmoment-Bubble
 *              in der Handbuehne auf /game.
 *              - Bubble ist NICHT sichtbar ohne Auswahl
 *              - Bubble ist NICHT sichtbar bei Farbkarten-Auswahl
 *              - Bubble IST sichtbar bei Sonderkarten-Auswahl mit legaler Aktion
 *              - Bubble zeigt Sonderkarte-Name + Ziel-Art
 *              - Bubble hat Link mit real existierendem Anker (DOM-IDREF-Konsistenz)
 *              - CSS-Vertrag: Stitch-Pill-Style (Border + Shadow + Chunky-Headline-Font)
 *              - Smoke-Wiring: package.json smoke:production chain enthaelt M1dq
 */
import { beforeEach, describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fireEvent, render, screen, within } from '@testing-library/react'
import App from './App'
import {
  erstelleSpielzustand,
  starteAusspielphase,
  type FarbkarteInfo,
  type SonderkarteInfo,
  type Spielzustand,
} from './engine'

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Direkter One-Liner-Match: extrahiert den BODY einer einfachen
 * Selektor-Regel `.selektor { ... }` aus dem CSS-Source.
 * Umgeht den Prefix-Anchor + Last-Match-Trap von `cssBlock()` fuer
 * die in M1dq verwendete `[class~="..."]`-Schreibweise.
 */
function cssBodyFor(selector: string, css: string): string {
  const m = css.match(new RegExp(`\\.${escapeRegex(selector)}\\s*\\{([^}]*)\\}`, 's'))
  return m?.[1] ?? ''
}

const appCss = readFileSync(resolve(__dirname, './App.css'), 'utf8')
const packageJsonRaw = readFileSync(resolve(__dirname, '../package.json'), 'utf8')
const packageJson = JSON.parse(packageJsonRaw) as { scripts: Record<string, string> }

function bauZustandMitSonderkarteInHand(): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.42))
  // Realitaetsgetreue Sonderkarte gemaess SonderkarteInfo-Shape
  // (nur id/typ/name, keine zusaetzlichen Felder).
  const schlangenfrass: SonderkarteInfo = {
    typ: 'Sonderkarte',
    id: 'schlangenfrass-m1dq-1',
    name: 'Schlangenfrass',
  }
  zustand.spieler[0].hand = [schlangenfrass, ...zustand.spieler[0].hand.slice(1)]
  // Eigene Schlange mit Karte, damit Schlangenfrass mit 1 Ziel
  // (das ist die einzige legale 1-Ziel-Variante) ermoeglicht wird.
  const eigeneKarte: FarbkarteInfo = {
    typ: 'Farbkarte',
    id: 'gruen-m1dq-1',
    farbe: 'Grün',
    punkte: 3,
  }
  zustand.spieler[0].schlangen = [
    {
      id: 'eigene-schlange-m1dq-1',
      zustand: 'aktiv',
      karten: [eigeneKarte],
    },
  ]
  return zustand
}

function bauZustandMitSchlangenfrassInHandOhneGegnerSchlange(): Spielzustand {
  // Edge-Case: Sonderkarte in Hand, aber KEIN legales Ziel vorhanden.
  // Bubble darf dann NICHT erscheinen.
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.42))
  const schlangenfrass: SonderkarteInfo = {
    typ: 'Sonderkarte',
    id: 'schlangenfrass-m1dq-2',
    name: 'Schlangenfrass',
  }
  zustand.spieler[0].hand = [schlangenfrass, ...zustand.spieler[0].hand.slice(1)]
  // Gegner ohne aktive Schlange
  zustand.spieler[1].schlangen = []
  return zustand
}

describe('M1dq Waldtanz-Sonderkarten-Spielmoment', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/game')
  })

  it('RED-1: Bubble ist NICHT sichtbar, wenn keine Handkarte ausgewaehlt ist', () => {
    render(<App />)
    expect(screen.queryByRole('group', { name: /Waldtanz-Sonderkarten-Spielmoment/ })).toBeNull()
  })

  it('RED-2: Bubble ist NICHT sichtbar, wenn eine Farbkarte ausgewaehlt ist (Sonderkarte in Hand irrelevant)', () => {
    const zustand = bauZustandMitSonderkarteInHand()
    render(<App initialZustand={zustand} />)
    const handkarten = screen.getAllByRole('button', { name: /Farbkarte|Sonderkarte/ })
    const farbkarteButton = handkarten.find((b) => /Farbkarte/.test(b.getAttribute('aria-label') ?? ''))
    expect(farbkarteButton).toBeDefined()
    if (farbkarteButton) fireEvent.click(farbkarteButton)
    expect(screen.queryByRole('group', { name: /Waldtanz-Sonderkarten-Spielmoment/ })).toBeNull()
  })

  it('RED-3: Bubble IST sichtbar, wenn eine Sonderkarte mit legaler Aktion ausgewaehlt ist', () => {
    const zustand = bauZustandMitSonderkarteInHand()
    render(<App initialZustand={zustand} />)
    const schlangenfrassButton = screen.getByRole('button', { name: /Sonderkarte Schlangenfrass/ })
    fireEvent.click(schlangenfrassButton)
    const bubble = screen.getByRole('group', { name: /Waldtanz-Sonderkarten-Spielmoment/ })
    expect(bubble).toBeTruthy()
  })

  it('RED-4: Bubble enthaelt den Sonderkarte-Namen "Schlangenfrass" im sichtbaren Text', () => {
    const zustand = bauZustandMitSonderkarteInHand()
    render(<App initialZustand={zustand} />)
    fireEvent.click(screen.getByRole('button', { name: /Sonderkarte Schlangenfrass/ }))
    const bubble = screen.getByRole('group', { name: /Waldtanz-Sonderkarten-Spielmoment/ })
    const heading = within(bubble).getByRole('heading', { level: 5 })
    expect(heading.textContent ?? '').toMatch(/Schlangenfrass/)
  })

  it('RED-5: Bubble enthaelt die Ziel-Art-Beschreibung "Schlangenfrass-Ziel"', () => {
    const zustand = bauZustandMitSonderkarteInHand()
    render(<App initialZustand={zustand} />)
    fireEvent.click(screen.getByRole('button', { name: /Sonderkarte Schlangenfrass/ }))
    const bubble = screen.getByRole('group', { name: /Waldtanz-Sonderkarten-Spielmoment/ })
    expect(within(bubble).getByText(/Schlangenfrass-Ziel/)).toBeTruthy()
  })

  it('RED-6: Bubble hat einen <a>-Link mit real existierendem Anker im DOM', () => {
    const zustand = bauZustandMitSonderkarteInHand()
    render(<App initialZustand={zustand} />)
    fireEvent.click(screen.getByRole('button', { name: /Sonderkarte Schlangenfrass/ }))
    const bubble = screen.getByRole('group', { name: /Waldtanz-Sonderkarten-Spielmoment/ })
    const link = within(bubble).getByRole('link')
    const href = link.getAttribute('href') ?? ''
    expect(href.startsWith('#')).toBe(true)
    const zielId = href.slice(1).trim()
    expect(zielId.length).toBeGreaterThan(0)
    const zielElement = document.getElementById(zielId)
    expect(zielElement).toBeTruthy()
    expect(zielElement?.getAttribute('data-zielspur-key')).toBeTruthy()
  })

  it('RED-7: CSS-Vertrag — Bubble hat Border, Box-Shadow und Headline-Font', () => {
    // Die Regel nutzt die route-scoped Form
    // `.spielbereich--game-route [class~="handkarten-buehne__spielmoment"] { ... }`,
    // weil der Selector innerhalb der Handbuehne (M1f-Handbuehne-Container)
    // die hoehere Spezifitaet braucht. Wir matchen daher die Descendant-Variante.
    const block = cssBodyFor('handkarten-buehne__spielmoment', appCss)
    // Erwartung: die Regel enthaelt border + box-shadow + headline-font.
    // Wenn der One-Liner nichts findet, akzeptieren wir auch den
    // Descendant-Selector-Body (rule im Route-Context).
    if (block === '') {
      const descendantMatch = appCss.match(/\[class~="handkarten-buehne__spielmoment"\]\s*\{([^}]*)\}/s)
      expect(descendantMatch?.[1] ?? '').toMatch(/border/i)
      expect(descendantMatch?.[1] ?? '').toMatch(/box-shadow/i)
      expect(descendantMatch?.[1] ?? '').toMatch(/var\(--st-font-headline\)/)
      return
    }
    expect(block).toMatch(/border/i)
    expect(block).toMatch(/box-shadow/i)
    expect(block).toMatch(/var\(--st-font-headline\)/)
  })

  it('RED-8: Smoke-Wiring — package.json smoke:production chain enthaelt M1dq-Script', () => {
    const chain = packageJson.scripts['smoke:production'] ?? ''
    expect(chain).toMatch(/m1dq_waldtanz_sonderkarten_spielmoment_smoke\.mjs/)
  })

  it('RED-9: Bubble bleibt verborgen, wenn Sonderkarte gewaehlt aber KEIN legales Ziel existiert', () => {
    const zustand = bauZustandMitSchlangenfrassInHandOhneGegnerSchlange()
    render(<App initialZustand={zustand} />)
    const sonderButton = screen.queryByRole('button', { name: /Sonderkarte Schlangenfrass/ })
    if (sonderButton) fireEvent.click(sonderButton)
    expect(screen.queryByRole('group', { name: /Waldtanz-Sonderkarten-Spielmoment/ })).toBeNull()
  })
})
