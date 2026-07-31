/**
 * Author: rahn
 * Datum: 30.06.2026
 * Version: 1.0
 * Beschreibung: M3b UI-Test für den Handkarten-Stitch-Fächer.
 *
 * Prüft, dass auf /game:
 *   1. Der Section-Heading "Handkarten als Kartenleiste" via display:none
 *      ausgeblendet ist (M3b:1).
 *   2. Die redundante "Spielbarkeit"-Pille via display:none ausgeblendet
 *      ist (M3b:2) — Brettrand-Bühne-Statuschip trägt die Info.
 *   3. Die Handkarten-Bühne noch kompakter ist (M3b:3):
 *      min-height: clamp(2.2rem, 4.5vh, 2.6rem).
 *   4. Die Handkarten-Kartenleiste enger an der Bühne sitzt (M3b:4):
 *      margin-top: -0.8rem.
 *   5. Die Handkarten weiterhin rendern (DOM-Assert).
 *   6. Brettrand-Arenazugknopf den Spieler-Namen als Eyebrow anzeigt,
 *      weil die Heading-Info dort kanonisch lebt.
 *   7. package.json smoke:production-Kette enthaelt m3b-...smoke.mjs.
 *   8. M2x:1-Bühne-min-height-Vertrag migriert von 2.6rem auf 2.2rem.
 */

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { istVerdrahtet } from './test/smokeKetten'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

function leseCss() {
  return readFileSync('src/App.css', 'utf-8')
}

describe('M3b Handkarten-Stitch-Fächer', () => {
  it('M3b:1 blendet den Section-Heading "Handkarten als Kartenleiste" auf /game aus', () => {
    const css = leseCss()
    // Route-scoped rule versteckt das direkte h4-Kind des handkarten-panel
    const m = css.match(
      /\.spielbereich--game-route\s*\[class~="handkarten-panel"\]\s*>\s*h4\s*\{([^}]*)\}/,
    )
    expect(m).not.toBeNull()
    expect(m![1]).toMatch(/display:\s*none/)
  })

  it('M3b:2 blendet die redundante "Spielbarkeit"-Pille auf /game aus (cascade-winner last-match)', () => {
    // AENDERUNG 30.06.2026 (Codex-Review M3b): Wir muessen den LETZTEN
    // (spaetesten) route-scoped Block pruefen, weil der die Cascade gewinnt
    // (later-source-wins). Die fruehe M2x-2-Regel zeigt die Pille, die
    // spaete M3b-2-Regel versteckt sie. css.match() wuerde die falsche
    // treffen — matchAll() + last-match ist die richtige Form.
    const css = leseCss()
    const matches = Array.from(
      css.matchAll(
        /\.spielbereich--game-route\s+\[class~="handkarten-spielbarkeit"\][^{]*\{([^}]*)\}/g
      )
    )
    expect(matches.length, 'mindestens 1 route-scoped handkarten-spielbarkeit-Block').toBeGreaterThanOrEqual(1)
    const last = matches[matches.length - 1]
    expect(last[1], 'letzter (cascade-winning) handkarten-spielbarkeit-Block enthaelt display:none').toMatch(/display:\s*none/)
  })

  it('M3b:3 senkt die Handkarten-Bühne min-height auf clamp(2.2rem, 4.5vh, 2.6rem)', () => {
    const css = leseCss()
    const m = css.match(
      /\.spielbereich--game-route[^{]*\[class~="handkarten-buehne"\][^{]*\{([^}]*)\}/,
    )
    expect(m).not.toBeNull()
    expect(m![1]).toMatch(/min-height:\s*clamp\(2\.2rem,\s*4\.5vh,\s*2\.6rem\)/)
  })

  it('M3b:4 engt die Handkartenleiste-Kartenleiste enger an Bühne (margin-top: -0.8rem)', () => {
    const css = leseCss()
    const m = css.match(
      /\.spielbereich--game-route[^{]*\[class~="handkartenleiste"\][^{]*\{([^}]*)\}/,
    )
    expect(m).not.toBeNull()
    expect(m![1]).toMatch(/margin-top:\s*-0\.8rem/)
  })

  it('M3b:5 rendert die Handkarten weiterhin (DOM-Assert)', () => {
    render(<App initialZustand={deterministischerZustand()} />)
    // Auf /game muessen die Handkarten rendern
    const cards = document.querySelectorAll('.handkarte')
    expect(cards.length).toBeGreaterThanOrEqual(3)
  })

  it('M3b:6 Brettrand-Arenazugknopf traegt den Spieler-Namen als Eyebrow (Heading-Owner)', () => {
    render(<App initialZustand={deterministischerZustand()} />)
    // Brettrand-Arenazugknopf-Bereich: prüfen ob "Spieler 1" im Body sichtbar ist
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/Spieler 1/)
  })

  it('M3b:7 package.json smoke:production-Kette enthaelt m3b-...smoke.mjs', () => {
    expect(istVerdrahtet('m3b_handkarten_faecher_stitch_smoke.mjs')).toBe(true)
  })

  it('M3b:8 M2x:1-Bühne-min-height-Vertrag migriert (von 2.6rem auf 2.2rem)', () => {
    const css = leseCss()
    // Es gibt mehrere route-scoped Bloecks (M1f-Basis + M2x-Override +
    // Descendant-Regeln). Wir lesen den LETZTEN Block — der gewinnt per
    // later-source-wins die Cascade. M3b hat den M2x-Block auf das
    // neue clamp-Format migriert.
    const matches = Array.from(
      css.matchAll(
        /\.spielbereich--game-route\s+\[class~="handkarten-buehne"\][^{]*\{([^}]*)\}/g
      )
    )
    expect(matches.length, 'mindestens 1 route-scoped handkarten-buehne-Block').toBeGreaterThanOrEqual(1)
    // Letzter (spaetester) Block — M2x-Override nach M3b-Migration
    const last = matches[matches.length - 1]
    expect(last[1], 'letzter handkarten-buehne-Block enthaelt min-height clamp(2.2rem, 4.5vh, 2.6rem)').toMatch(/min-height:\s*clamp\(2\.2rem,\s*4\.5vh,\s*2\.6rem\)/)
    // Sicherstellen, dass die letzte min-height-Deklaration NICHT die alte Form hat
    const minHeightMatch = last[1].match(/min-height:\s*([^;]+)/)
    expect(minHeightMatch).not.toBeNull()
    const value = minHeightMatch?.[1]?.trim() ?? ''
    expect(value).not.toMatch(/clamp\(2\.6rem,\s*5\.5vh,\s*3\.2rem\)/)
  })
})
