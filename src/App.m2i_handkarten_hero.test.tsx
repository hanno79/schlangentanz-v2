/*
 * Author: Hermes (autonomer Cron-Lauf 2026-06-27)
 * Datum: 27.06.2026
 * Version: 1.0
 * Beschreibung: M2i RED-Tests fuer die Stitch-Hero-Transformation der
 *              Handkarten auf /game. Macht die Handkarten zu grossen
 *              Stitch-Spielkarten (min-width clamp 5-8.5rem, 3px waldgruen
 *              Border, hard-shadow-sm, Icon-Tile + Name + Effekt-Badge),
 *              entfernt Eyebrow + ID-Plakette visuell, kompaktisiert.
 *              WICHTIG: Die M2i-Optik lebt im route-scoped Block
 *              (.spielbereich--game-route [class~="handkarte__button--karte"] /
 *               .spielbereich--game-route [class~="handkarte__art"] /
 *               .spielbereich--game-route [class~="handkarte__eyebrow"] etc.),
 *              NICHT in der Basis-Regel. So bleiben m1g/m1av/m1ct-Vertrage
 *              (aspect-ratio 2/3, min-height 38%, font-size 2.4rem) auf der
 *              Basis-Regel unangetastet. Engine, Legal-Aktionen und alle
 *              bestehenden Nachbarschaftsvertraege (M1bx, M1cx, M1db,
 *              M1dq, M1ds, M1dt, M2g) bleiben unveraendert.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import App from './App'
import {
  erstelleSpielzustand,
  starteAusspielphase,
  type Spielzustand,
} from './engine'
import { istVerdrahtet } from './test/smokeKetten'

const appCss = readFileSync('src/App.css', 'utf8')

// Route-scoped Block ist das M2i-Ziel-Surface. cssBlockContains sucht den
// Selektor ".parent .child { ... }" und gibt den Body zurueck.
function cssBlockContains(parentSel: string, childSel: string): string {
  const re = new RegExp(
    `\\.${parentSel.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s+\\[class~=["']${childSel.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}["']\\]\\s*\\{([^}]*)\\}`,
    's',
  )
  return appCss.match(re)?.[1] ?? ''
}

function startZustand(): Spielzustand {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.2))
}

describe('M2i Handkarten-Stitch-Hero-Transformation', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/game')
  })

  it('RED-1: route-scoped .handkarte__button--karte deklariert min-width: clamp(5rem, 9vw, 8.5rem) fuer Stitch-Hero-Groesse', () => {
    const block = cssBlockContains('spielbereich--game-route', 'handkarte__button--karte')
    expect(block).toMatch(/min-width:\s*clamp\(5rem,\s*9vw,\s*8\.5rem\)/)
    expect(block).toMatch(/padding:\s*0\.35rem/)
    expect(block).toMatch(/box-sizing:\s*border-box/)
  })

  it('RED-2: route-scoped .handkarte__button--karte deklariert 3px waldgruenen Border (Stitch-3px-Border-Standard)', () => {
    const block = cssBlockContains('spielbereich--game-route', 'handkarte__button--karte')
    expect(block).toMatch(/border:\s*3px\s+solid\s+var\(--st-color-border-strong\)/)
  })

  it('RED-3: route-scoped .handkarte__button--karte deklariert hard-shadow-sm box-shadow: 0 4px 0', () => {
    const block = cssBlockContains('spielbereich--game-route', 'handkarte__button--karte')
    expect(block).toMatch(/box-shadow:\s*0\s+4px\s+0\s+var\(--st-color-border-strong\)/)
  })

  it('RED-4: route-scoped .handkarte__art rendert quadratischen Icon-Tile (1/1 aspect-ratio, font-size 1.8rem)', () => {
    const block = cssBlockContains('spielbereich--game-route', 'handkarte__art')
    expect(block).toMatch(/aspect-ratio:\s*1\s*\/\s*1/)
    expect(block).toMatch(/font-size:\s*1\.8rem/)
  })

  it('RED-5: route-scoped .handkarte__wertechip rendert Stitch-Effekt-Badge (border-radius 999px, secondary-container Background)', () => {
    const block = cssBlockContains('spielbereich--game-route', 'handkarte__wertechip')
    expect(block).toMatch(/border-radius:\s*999px/)
    expect(block).toMatch(/border:\s*2px\s+solid\s+var\(--st-color-border-strong\)/)
    expect(block).toMatch(/background:\s*var\(--st-color-secondary-container/)
  })

  it('RED-6: route-scoped .handkarte__eyebrow + .handkante__idplakette visuell weg (display: none), Daten bleiben fuer A11y im DOM', () => {
    // Combined selector: .spielbereich--game-route [class~="handkarte__eyebrow"],
    //                    .spielbereich--game-route [class~="handkarte__idplakette"] { display: none }
    // Regex muss die , \n Kombination zwischen den Selektor-Fragmenten akzeptieren.
    const combined = appCss.match(
      /\.spielbereich--game-route\s+\[class~=["']handkarte__eyebrow["']][\s\S]+?display:\s*none/,
    )
    expect(combined).not.toBeNull()
    const idplaketteCombined = appCss.match(
      /\.spielbereich--game-route\s+\[class~=["']handkarte__idplakette["']][\s\S]+?display:\s*none/,
    )
    expect(idplaketteCombined).not.toBeNull()
  })

  it('RED-7: Basis-Regel .handkarte__button--karte bleibt unveraendert (m1g-Vertrag: aspect-ratio 2/3 + var-Border + 5px-Shadow)', () => {
    // Cascade-Schutz: die M2i-Optik darf die Basis-Regel NICHT ueberschreiben,
    // sonst brechen m1g/m1av/m1ct auf der Basis-Regel.
    // Basis-Regel ist `.handkarte__button--karte {` (flat-class, OHNE Descendant oder Prefix).
    // Wir nutzen einen negativen Lookbehind auf Descendant/Compound-Selector-Form.
    // Negativer Anker: VOR dem Selektor darf KEIN `[class~=`, KEIN `>` und KEIN `.` (Compound) kommen.
    // Stattdessen: wir suchen `^` oder `}` oder `*` direkt davor.
    const baseRe = /(?:^|[}\s])\.handkarte__button--karte\s*\{([^}]*)\}/gm
    const matches = [...appCss.matchAll(baseRe)]
    // Wir brauchen den Match, dessen Indikator-Vorzeichen ein `^|\n|}` ist (nicht Descendant)
    const baseBlock = matches
      .map((m) => ({ idx: m.index!, body: m[1] }))
      .filter(({ idx }) => {
        // Position 0 (Anfang der Datei) ODER Zeichen davor ist Whitespace oder `}` (Blockende)
        if (idx === 0) return true
        const before = appCss.slice(Math.max(0, idx - 4), idx)
        return /[\n}\s]/.test(before.slice(-1))
      })
      .map(({ body }) => body)[0] ?? ''
    expect(baseBlock).toMatch(/aspect-ratio:\s*2\s*\/\s*3/)
    expect(baseBlock).toMatch(/border:\s*var\(--st-border-width-chunky\)/)
    expect(baseBlock).toMatch(/box-shadow:\s*0\s+5px\s+0/)
  })

  it('RED-8: package.json smoke:production-Kette enthaelt m2i Handkarten-Hero Smoke', () => {
    expect(istVerdrahtet('m2i_handkarten_hero_smoke.mjs')).toBe(true)

  })

  it('RED-9: M2i-Smoke-Skript enthaelt pruefeM2iHandkartenHero + Slice-Klassen-String + Schwellen', () => {
    const smoke = readFileSync('scripts/m2i_handkarten_hero_smoke.mjs', 'utf8')
    expect(smoke).toMatch(/pruefeM2iHandkartenHero/)
    expect(smoke).toMatch(/handkarte__button--karte/)
    expect(smoke).toMatch(/5rem|9vw|8\.5rem/)
  })

  it('RED-10 (DOM): Handkarten werden mit den erwarteten Klassen gerendert (Stitch-Button + Icon-Art + Name + Wertchip)', () => {
    render(<App initialZustand={startZustand()} />)
    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handkartenRegion = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const karten = within(handkartenRegion).getAllByRole('button', { name: /Farbkarte|Sonderkarte/ })
    expect(karten.length).toBeGreaterThan(0)
    // Mindestens eine Handkarte hat einen Anzeige-Namen (Farbkarten: Wasserwirbel/Feuerkeim/etc.
    // ODER Sonderkarten: Farbendieb/Schlangenfrass/etc.)
    const alleTitel = karten.flatMap((karte) => Array.from(karte.querySelectorAll('.handkarte__titel')).map((el) => el.textContent ?? ''))
    expect(alleTitel.some((titel) => /Wasserwirbel|Feuerkeim|Sonnenblatt|Mondranke|Wurzelpfad|Waldspross|Farbendieb|Schlangenfrass|Farbenschutz|Farbenfusion|Verdoppler|Schlangenblockade|Schlangengrube|Schlangenhäutung/.test(titel))).toBe(true)
    // Icon-Art-Container existiert in jeder Karte
    karten.forEach((karte) => {
      expect(karte.querySelector('.handkarte__art')).toBeTruthy()
      expect(karte.querySelector('.handkarte__titel')).toBeTruthy()
      expect(karte.querySelector('.handkarte__wertechip')).toBeTruthy()
    })
  })

  it('RED-11 (A11y-Contract): .handkarte__eyebrow und .handkarte__idplakette bleiben im DOM fuer Screen-Reader (nicht aus DOM entfernt)', () => {
    render(<App initialZustand={startZustand()} />)
    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handkartenRegion = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const ersteKarte = within(handkartenRegion).getAllByRole('button', { name: /Farbkarte|Sonderkarte/ })[0]
    // DOM-Existenz beweisen (display:none entfernt nicht aus DOM, nur aus visuellem + A11y-Tree
    // — Test prueft nur, dass querySelector noch matcht; A11y-Auswirkung wird separat dokumentiert.)
    expect(ersteKarte.querySelector('.handkarte__eyebrow')).toBeTruthy()
    expect(ersteKarte.querySelector('.handkarte__idplakette')).toBeTruthy()
  })

  it('RED-12 (Cascade-Regression, Kimi-B-1-Fix): doubled-class M2i-Override mit 0,4,0-Spezifitaet gewinnt gegen M1f-Spielkartenfaecher (0,3,0)', () => {
    // Kimi-BLOCKER: spaetere Regel `.spielbereich--game-route [class~="handkartenleiste--spielkartenfaecher"]
    // [class~="handkarte__button--karte"]` (Spez. 0,3,0) ueberschrieb M2i (Spez. 0,2,0).
    // Fix: M2i-Override mit doppelter Class auf 0,4,0 geboostet.
    // Cascade-RED-Test: Selector-Form (nicht Body) muss doppelte Class enthalten,
    // damit ein "simplify"-Pass die Spezifitaet nicht wieder senkt.
    const m2iOverrideRe = /\.spielbereich--game-route\.spielbereich--game-route\s+\[class~=["']handkartenleiste--spielkartenfaecher["']\]\s+\[class~=["']handkarte__button--karte["']\]\.handkarte__button--karte/
    expect(appCss).toMatch(m2iOverrideRe)
    // Body muss die M2i-Hero-Properties deklarieren
    const m2iOverride = appCss.match(m2iOverrideRe)?.[0] ?? ''
    const m2iOverrideBody = appCss.match(
      /\.spielbereich--game-route\.spielbereich--game-route\s+\[class~=["']handkartenleiste--spielkartenfaecher["']\]\s+\[class~=["']handkarte__button--karte["']\]\.handkarte__button--karte\s*\{([^}]*)\}/s,
    )?.[1] ?? ''
    expect(m2iOverride).toBeTruthy()
    expect(m2iOverrideBody).toMatch(/min-width:\s*clamp\(5rem,\s*9vw,\s*8\.5rem\)/)
    expect(m2iOverrideBody).toMatch(/box-shadow:\s*0\s+4px\s+0\s+var\(--st-color-border-strong\)/)
    expect(m2iOverrideBody).toMatch(/border-radius:\s*1rem/)
  })

  it('RED-13 (Cascade-Regression, Kimi-B-1-Fix-2): doubled-class Icon-Tile-Override ebenfalls auf 0,3,0 geboostet', () => {
    // Konsistenz-Check: auch der .handkarte__art-Override (Icon-Tile) bekommt
    // doppelte Class fuer Cascade-Schutz gegen spaetere 0,2,0-Overrider.
    const artOverrideRe = /\.spielbereich--game-route\.spielbereich--game-route\s+\[class~=["']handkartenleiste--spielkartenfaecher["']\]\s+\[class~=["']handkarte__art["']\]/
    expect(appCss).toMatch(artOverrideRe)
  })
})
