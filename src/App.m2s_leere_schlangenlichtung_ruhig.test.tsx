/**
 * Author: rahn
 * Datum: 27.06.2026
 * Version: 1.0
 * Beschreibung: M2s — Schlangenlichtung-Empty-State als ruhige Forest-Lichtung.
 *              Im leeren Anfangszustand auf /game (kein Karte gewaehlt, keine
 *              eigene Schlange) sollen drei Notification-Bubbles, die das
 *              "Click-Simulator-Gefuehl" verstaerken, visuell verschwinden:
 *              - .waldtanz-aktiver-tanz-schritt (Info-Bubble)
 *              - .schlangen-zielkompass (Text "Waehle eine Handkarte")
 *              - .schlangen-startgarten (Text "Noch keine eigene Schlange")
 *              Die Info lebt jeweils in der Spielerfuehrung/Sidebar. Sobald
 *              eine Handkarte gewaehlt wird, kommt die Zielkompass-Bubble
 *              zurueck (Klasse schlangenbereich--karte-ausgewaehlt hebt Hide auf).
 *              Da jsdom keine imported CSS-Regeln fuer getComputedStyle aufloest,
 *              wird der Hide-Effekt ueber CSS-Source-Asserts bewiesen; der
 *              Live-Smoke validiert den Effekt in der echten Browser-Umgebung.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { istVerdrahtet } from './test/smokeKetten'

const appCss = readFileSync('src/App.css', 'utf8')

/**
 * Liefert ALLE Regel-Bodies fuer einen vollstaendigen Selector-String.
 * Wichtig: Der vollstaendige Selector (inkl. [class~="..."]-Attributsyntax)
 * wird Zeichen-fuer-Zeichen in den Regex-Anker eingesetzt; wir nutzen daher
 * einen vollstaendigen Substring-Lookup statt Zeichenklassen-Konstruktion,
 * damit der `~=` und die Anfuehrungszeichen nicht in einer Regex-Charclass landen.
 */
function alleRegelBloecksFuer(selector: string): string[] {
  // Wir verwenden indexOf auf den Selector und extrahieren den Body.
  // Das vermeidet Regex-Konstruktion mit Sonderzeichen in [class~="..."]-Syntax.
  const results: string[] = []
  let searchFrom = 0
  while (true) {
    const idx = appCss.indexOf(selector, searchFrom)
    if (idx === -1) break
    // Pruefe, dass der Selector nicht innerhalb einer groesseren Zeichenkette
    // liegt (z.B. Kommentar mit dem Selector als Literal). Wir verlangen, dass
    // das Zeichen unmittelbar vor idx ein Whitespace oder Zeilenanfang ist.
    if (idx > 0) {
      const prev = appCss[idx - 1]
      if (!/[\s,]/.test(prev ?? '')) {
        searchFrom = idx + 1
        continue
      }
    }
    // Body extrahieren: nach '{' bis zur naechsten '}' (greedy, kein nesting)
    const braceStart = appCss.indexOf('{', idx)
    if (braceStart === -1) break
    const braceEnd = appCss.indexOf('}', braceStart)
    if (braceEnd === -1) break
    results.push(appCss.slice(braceStart + 1, braceEnd))
    searchFrom = braceEnd + 1
  }
  return results
}

function hatRegelMitBody(selector: string, bodyRegex: RegExp): boolean {
  return alleRegelBloecksFuer(selector).some((body) => bodyRegex.test(body))
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M2s Schlangenlichtung-Empty-State als ruhige Forest-Lichtung', () => {
  it('M2s:1 versteckt den Aktiver-Tanz-Schritt-Overlay auf /game route-scoped', () => {
    expect(
      hatRegelMitBody(
        '.spielbereich--game-route [class~="waldtanz-aktiver-tanz-schritt"]',
        /display:\s*none/,
      ),
    ).toBe(true)
  })

  it('M2s:2 versteckt die Schlangen-Zielkompass-Bubble auf /game im leeren Zustand (kein Karte gewaehlt)', () => {
    expect(
      hatRegelMitBody(
        '.spielbereich--game-route [class~="schlangen-zielkompass"]',
        /display:\s*none/,
      ),
    ).toBe(true)
  })

  it('M2s:3 macht die Zielkompass-Bubble wieder sichtbar sobald eine Handkarte gewaehlt ist', () => {
    expect(
      hatRegelMitBody(
        '.spielbereich--game-route [class~="schlangenbereich"][class~="schlangenbereich--karte-ausgewaehlt"] [class~="schlangen-zielkompass"]',
        /display:\s*flex/,
      ),
    ).toBe(true)
  })

  it('M2s:4 versteckt den schlangen-startgarten Empty-Text auf /game', () => {
    expect(
      hatRegelMitBody(
        '.spielbereich--game-route [class~="schlangen-startgarten"]',
        /display:\s*none/,
      ),
    ).toBe(true)
  })

  it('M2s:5 JSX: auf /game sind die drei Bubbles in der Schlangenlichtung gerendert (nicht entfernt)', () => {
    // CSS-only-Visual-Removal-Pattern (M1dm/M1dn/M1do): die DOM-Struktur
    // bleibt unveraendert; nur das CSS hidet die Elemente. Pruefe daher
    // dass alle drei Klassen weiterhin im rendered DOM auf /game existieren.
    // M6a (28.06.2026) ersetzt den nackten .schlangen-startgarten-Empty-Text
    // durch das reichhaltigere Onboarding .erste-schlange-onboarding — dieselbe
    // "keine eigene Schlange"-Stelle im Schlangenbereich, jetzt als eigener
    // Stitch-Onboarding-Block (siehe App.m6a_erste_schlange_forest_clearing.test.tsx).
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)
    expect(document.querySelector('.waldtanz-aktiver-tanz-schritt')).not.toBeNull()
    expect(document.querySelector('.schlangen-zielkompass')).not.toBeNull()
    expect(document.querySelector('.erste-schlange-onboarding')).not.toBeNull()
  })

  it('M2s:6 Cascade-Schutz: alle 3 Hide-Regeln tragen !important (gegen spaetere pre-existing Overrides)', () => {
    // M1dt-Pattern: doubled-class + !important gewinnt gegen 0,1,0-Descendant-Regeln.
    const bodies1 = alleRegelBloecksFuer('.spielbereich--game-route [class~="waldtanz-aktiver-tanz-schritt"]')
    const bodies2 = alleRegelBloecksFuer('.spielbereich--game-route [class~="schlangen-zielkompass"]')
    const bodies3 = alleRegelBloecksFuer('.spielbereich--game-route [class~="schlangen-startgarten"]')
    expect(bodies1.some((b) => /display:\s*none\s*!important/.test(b))).toBe(true)
    expect(bodies2.some((b) => /display:\s*none\s*!important/.test(b))).toBe(true)
    expect(bodies3.some((b) => /display:\s*none\s*!important/.test(b))).toBe(true)
  })

  it('M2s:7 Cascade-Source-Order: die Override-Regel sitzt NACH den Hide-Regeln', () => {
    const hidePos = appCss.indexOf('.spielbereich--game-route [class~="schlangen-zielkompass"]')
    const overridePos = appCss.indexOf(
      '.spielbereich--game-route [class~="schlangenbereich"][class~="schlangenbereich--karte-ausgewaehlt"]',
    )
    expect(hidePos).toBeGreaterThan(-1)
    expect(overridePos).toBeGreaterThan(-1)
    expect(overridePos).toBeGreaterThan(hidePos)
  })

  it('M2s:8 Slice-Plan-Referenz: docs/slice_plan_m2s_leere_schlangenlichtung_ruhig.md existiert', () => {
    const plan = readFileSync('docs/slice_plan_m2s_leere_schlangenlichtung_ruhig.md', 'utf8')
    expect(plan).toContain('M2s')
    expect(plan).toContain('Schlangenlichtung-Empty-State')
  })

  it('M2s:9 Slice-Plan-Referenz: docs/slice_plan_m2s_leere_schlangenlichtung_ruhig.md existiert', () => {
    const plan = readFileSync('docs/slice_plan_m2s_leere_schlangenlichtung_ruhig.md', 'utf8')
    expect(plan).toContain('M2s')
    expect(plan).toContain('Schlangenlichtung-Empty-State')
  })

  it('M2s:10 smoke-script + package.json wiring fuer M2s Live-Smoke registriert', () => {
    const smokeScript = readFileSync('scripts/m2s_leere_schlangenlichtung_ruhig_smoke.mjs', 'utf8')
    expect(smokeScript).toContain('M2s Schlangenlichtung-Empty-State')
    expect(smokeScript).toContain('pruefeM2sLeereLichtung')
    expect(smokeScript).toContain('schlangen-zielkompass')
    expect(smokeScript).toContain('schlangen-startgarten')
    expect(istVerdrahtet('m2s_leere_schlangenlichtung_ruhig_smoke.mjs')).toBe(true)
  })
})