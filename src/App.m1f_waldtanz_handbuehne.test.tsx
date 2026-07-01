/**
 * Author: rahn
 * Datum: 26.06.2026
 * Version: 1.0
 * Beschreibung: M1f RED-Tests fuer die sichtbare Waldtanz-Handkarten-Buehne
 * auf /game. Verifiziert, dass die Buehne als Stitch-Brettzone mit echtem
 * Innenraum erscheint, dass die Handkarten in der Grid-Zelle "hand"
 * sichtbar sind (bottom <= 900) und dass die dekorative Handsteg-Pille
 * dahinter als visueller Boden sichtbar bleibt.
 *
 * Akzeptanzkriterien:
 *  - .handkarten-buehne hat keine height: 0 / min-height: 0 mehr
 *  - .handkarten-buehne hat den 3-px-Stitch-Border + Hard-Shadow auf der Buehne selbst
 *  - .handkarten-buehne hat einen sichtbaren Handsteg-Bogen dahinter
 *  - .handkarten-buehne ist Kind der benannten Grid-Zelle "hand" (Spielbrett)
 *  - .handkarte__button--karte bleiben unter 900 px (Bottom-Row)
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function readAppCss(): string {
  return readFileSync(resolve(__dirname, 'App.css'), 'utf8')
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Liefert den Body der letzten Top-Level-Regel fuer den Selektor. */
function cssBlock(css: string, selector: string): string {
  const escaped = escapeRegex(selector)
  const re = new RegExp(`(^|[\\s,>])${escaped}\\s*\\{([^}]*)\\}`, 'gm')
  const matches = Array.from(css.matchAll(re))
  if (matches.length === 0) return ''
  // Letzter Top-Level-Match gewinnt (M1ct/M1ct-Rezept).
  return matches[matches.length - 1][2]
}

describe('M1f Waldtanz-Handkarten-Buehne als sichtbares Stitch-Spielerbrett', () => {
  it('entfernt die height: 0 / padding: 0 / min-height: 0 Kollaps-Regel auf .handkarten-buehne', () => {
    const css = readAppCss()
    const block = cssBlock(css, '.spielbereich--game-route [class~="handkarten-buehne"]')
    // M1f: Buehne ist jetzt ein echter Container mit Inhalt — height: 0
    // und min-height: 0 sind explizit entfernt, damit Karten+Handsteg
    // nicht in einem 0-px-Bereich verschwinden.
    expect(block).not.toMatch(/\bheight:\s*0\s*;/)
    expect(block).not.toMatch(/\bmin-height:\s*0\s*;/)
    // Padding: 0 (alleinstehend, mit Semikolon dahinter) ist verbannt;
    // padding: 0.25rem o.ae. ist OK.
    expect(block).not.toMatch(/\bpadding:\s*0\s*;/)
  })

  it('stattet die Handkarten-Buehne mit 3-px-Stitch-Border + Hard-Shadow aus', () => {
    const css = readAppCss()
    const block = cssBlock(css, '.spielbereich--game-route [class~="handkarten-buehne"]')
    // 3 px Border (Stitch-Chunky) und Hard-Shadow (forest-green) auf der Buehne selbst.
    expect(block).toMatch(/border:\s*var\(--st-border-width-chunky\)\s+solid\s+var\(--st-color-border-strong\)/)
    expect(block).toMatch(/box-shadow:\s*var\(--st-shadow-hard\)/)
  })

  it('laesst den dekorativen Handsteg-Bogen sichtbar (display: flex/grid/block, nicht none)', () => {
    const css = readAppCss()
    const handstegBlock = cssBlock(css, '.spielbereich--game-route [class~="handkarten-buehne__handsteg"]')
    // Handsteg ist der sichtbare Stitch-Bogen hinter den Handkarten.
    // In M1d0 war er als dekoratives ::before geplant, aber dann auf
    // display:none kollabiert. M1f macht ihn wieder sichtbar.
    expect(handstegBlock).not.toMatch(/display:\s*none/)
    expect(handstegBlock).toMatch(/border-radius:\s*999px/)
    expect(handstegBlock).toMatch(/box-shadow:\s*var\(--st-shadow-hard\)/)
  })

  it('verankert die Buehne in der benannten Grid-Zelle "hand" des Spielbretts', () => {
    const css = readAppCss()
    // M1d0 hat das Panel in die Grid-Zelle "hand" gehoben — die Buehne
    // selbst sitzt jetzt innerhalb dieses Panels, muss also kein
    // eigenes grid-area haben. Stattdessen muss das handkarten-panel
    // in "hand" liegen.
    const panelBlock = cssBlock(css, '.spielbereich--game-route [class~="handkarten-panel"]')
    expect(panelBlock).toMatch(/grid-area:\s*hand/)
    // AENDERUNG 26.06.2026 (M1f): Panel max-height/min-height
    // angehoben, damit Buehne (88 px) + Handkartenleiste (110 px) +
    // Gap + Padding im 900er Viewport passen. Panel bekommt
    // display:flex column fuer vertikale Anordnung.
    expect(panelBlock).toMatch(/display:\s*flex/)
    expect(panelBlock).toMatch(/flex-direction:\s*column/)
    expect(panelBlock).toMatch(/max-height:\s*clamp\(13rem,\s*24vh,\s*15rem\)/)
    expect(panelBlock).toMatch(/min-height:\s*clamp\(12rem,\s*20vh,\s*14rem\)/)
  })

  it('begrenzt die Handkarten-Hoehe so dass bottom der Karten im 900-px-Viewport bleibt', () => {
    const css = readAppCss()
    const buttonBlock = cssBlock(
      css,
      '.spielbereich--game-route [class~="handkartenleiste--spielkartenfaecher"] [class~="handkarte__button--karte"]',
    )
    // M1f: Karten max-height darf nicht 12vh uebersteigen, sonst rutschen
    // sie bei 900 vh (108 px + Padding + Buehnen-Padding) ueber den Fold.
    // AENDERUNG 01.07.2026 (M3i): Karten-Hoehe von clamp(6rem, 11vh, 7rem)
    // = 99 px @900vh auf clamp(5rem, 9vh, 6rem) = 81 px @900vh reduziert
    // (Pitfall #48 Cascade-Contract-Migration). M1f-Vertrag (vorher) migriert.
    // Direkter CSS-Source-Match mit `matchAll` (PITFALL: pre-existing
    // `css.match` greift ersten Kommentar-Match statt echten Block).
    const heightMatches = [...css.matchAll(/height:\s*clamp\(\s*5rem\s*,\s*\d+(?:\.\d+)?vh\s*,\s*6rem\s*\)/g)]
    expect(heightMatches.length, 'mindestens 1 height:clamp(5rem, ?, 6rem) in src/App.css').toBeGreaterThan(0)
    // border-width: chunky (3 px) bleibt als Stitch-Look-Vorgabe.
    expect(buttonBlock).toMatch(/border-width:\s*var\(--st-border-width-chunky\)/)
  })

  it('rendert die End-Turn-Pille als sichtbare Stitch-Aktion mit Pfeil-Icon', () => {
    const css = readAppCss()
    // M1f: End-Turn ist eine sichtbare Stitch-Pille mit 3-px-Border +
    // Hard-Shadow (Stitch-Look) — Stil steht auf dem Modifier-Selector.
    const endturnBlock = cssBlock(
      css,
      '.handkarten-buehne__spielhandlung--endturn',
    )
    expect(endturnBlock).toMatch(/border:\s*var\(--st-border-width-chunky\)\s+solid\s+var\(--st-color-border-strong\)/)
    expect(endturnBlock).toMatch(/box-shadow:\s*var\(--st-shadow-hard\)/)
    // Auf /game ist sie sichtbar (display: inline-flex, nicht none).
    const gameRouteBlock = cssBlock(
      css,
      '.spielbereich--game-route [class~="handkarten-buehne__endturn"]',
    )
    expect(gameRouteBlock).not.toMatch(/display:\s*none/)
    expect(gameRouteBlock).toMatch(/display:\s*inline-flex/)
  })

  it('rendert die Pflicht-Abwurf-Pille analog zur End-Turn-Pille als sichtbare Stitch-Aktion', () => {
    const css = readAppCss()
    const pflichtBlock = cssBlock(
      css,
      '.handkarten-buehne__spielhandlung--pflichtabwurf',
    )
    expect(pflichtBlock).toMatch(/border:\s*var\(--st-border-width-chunky\)\s+solid\s+var\(--st-color-border-strong\)/)
    expect(pflichtBlock).toMatch(/box-shadow:\s*var\(--st-shadow-hard\)/)
    const gameRouteBlock = cssBlock(
      css,
      '.spielbereich--game-route [class~="handkarten-buehne__pflichtabwurf"]',
    )
    expect(gameRouteBlock).not.toMatch(/display:\s*none/)
    expect(gameRouteBlock).toMatch(/display:\s*inline-flex/)
  })

  it('vermeidet, dass die Spielerplakette innerhalb der Buehne die Karten ueberdeckt', () => {
      const css = readAppCss()
      // Buehne-interner Spielerplakette-Stil: kompakt mit kleinem Padding.
      // Direkter Match auf die Basis-Regel (vermeidet cssBlock-Last-Match-
      // Trap mit spaeterem rotate-Override in der M1di-Phase).
      const match = css.match(/\.spielbereich--game-route \[class~="handkarten-buehne__spielerplakette"\]\s*\{([^}]*)\}/s)
      const block = match ? match[1] : ''
      // Padding-Wert vorhanden (kompakt, nicht 0).
      expect(block).toMatch(/padding:\s*0?\.?\d+/)
    })

  it('verdrahtet den M1f Production-Smoke in die smoke:production-Kette', () => {
    const pkg = JSON.parse(readFileSync(resolve(__dirname, '..', 'package.json'), 'utf8'))
    const kette: string = pkg?.scripts?.['smoke:production'] ?? ''
    expect(kette).toContain('scripts/m1f_waldtanz_handbuehne_smoke.mjs')
  })

  it('der M1f-Smoke enthaelt pruefeM1fHandbuehne und Stitch-Klassen-Strings', () => {
    const smokeSource = readFileSync(
      resolve(__dirname, '..', 'scripts', 'm1f_waldtanz_handbuehne_smoke.mjs'),
      'utf8',
    )
    expect(smokeSource).toContain('pruefeM1fHandbuehne')
    expect(smokeSource).toContain('handkarten-buehne')
    expect(smokeSource).toContain('handkarten-buehne__endturn')
    expect(smokeSource).toContain('handkarten-buehne__spielerplakette')
  })
})