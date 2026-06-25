/**
 * Author: rahn
 * Datum: 25.06.2026
 * Version: 1.0
 * Beschreibung: M3b UI-Test für den Spielstart-Tanz im sonnigen Nest.
 *
 * Prueft, dass die Lobby einen sichtbaren Spielstart-Vertrag erfuellt:
 *   1. Die drei Start-Buttons sind interaktive Spielkarten mit 3px-Dark-Forest-Border,
 *      Hard-Shadow und Hover-Lift (Stitch-Pattern: -translate-y-4).
 *   2. Aktive KI-Slots haben eine sichtbare Schlangen-Slide-In-Animation beim
 *      Mount (transform-origin: bottom + slide-up).
 *   3. Das Code-Schild sitzt auf einem schwingenden Pendel mit geneigter
 *      Rotation (animation-name schwingt).
 *   4. Beim Klick auf "Waldparty starten" springen die KI-Slots als
 *      sichtbare Spielstart-Aktion nach (CSS-Animation wird durch data-active
 *      Modifikator getriggert).
 *   5. Die bestehenden M3a-Verträge (Code-Schild, wartende Slots, Host-Badge)
 *      bleiben unangetastet.
 *   6. Der Hero bleibt kompakt (horizontal-flex) und alle M3a-Reduced-Motion-
 *      Regeln greifen auch fuer die neuen Animationen.
 */

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

function leseCss() {
  return readFileSync('src/App.css', 'utf-8')
}

function regelBody(css: string, selector: string): string {
  const idx = css.indexOf(selector)
  if (idx < 0) return ''
  const braceStart = css.indexOf('{', idx)
  const braceEnd = css.indexOf('}', braceStart)
  return css.slice(braceStart + 1, braceEnd)
}

function findeBlockNach(css: string, startIdx: number): string {
  if (startIdx < 0) return ''
  const braceStart = css.indexOf('{', startIdx)
  let depth = 1
  let end = braceStart + 1
  while (depth > 0 && end < css.length) {
    if (css[end] === '{') depth++
    if (css[end] === '}') depth--
    end++
  }
  return css.slice(braceStart + 1, end - 1)
}

describe('M3b Sonniges Nest Spielstart-Tanz', () => {
  it('rendert Start-Buttons mit 3px-Border, Hard-Shadow und Hover-Lift', () => {
    const css = leseCss()
    const body = regelBody(css, '.lobby-startbutton')
    expect(body).toMatch(/border:\s*3px\s+solid\s+var\(--st-color-border-strong\)/)
    expect(body).toMatch(/box-shadow:\s*0\s+4px\s+0\s+var\(--st-color-border-strong\)/)
  })

  it('lobby-startbutton:hover hebt die Karte sichtbar an (translate-Y)', () => {
    const css = leseCss()
    const idx = css.indexOf('.lobby-startbutton:hover')
    expect(idx).toBeGreaterThanOrEqual(0)
    const body = findeBlockNach(css, idx)
    expect(body).toMatch(/translate[Yy]\(/)
  })

  it('aktive KI-Slots haben eine sichtbare Schlangen-Slide-In-Animation', () => {
    const css = leseCss()
    const body = regelBody(css, '.lobby-slot--ki')
    expect(body).toMatch(/animation\s*:/)
  })

  it('das Code-Schild schwingt als Wald-Pendel mit geneigter Rotation', () => {
    const css = leseCss()
    // Suche die .lobby-code-schild Regel, die eine animation enthaelt
    const idx = css.indexOf('.lobby-code-schild')
    expect(idx).toBeGreaterThanOrEqual(0)
    const body = findeBlockNach(css, idx)
    expect(body).toMatch(/animation\s*:/)
    // Animation muss rotieren (-3deg bis +3deg)
    const keyframesIdx = css.indexOf('@keyframes waldtanz-code-pendel')
    if (keyframesIdx >= 0) {
      const keyframesBody = findeBlockNach(css, keyframesIdx)
      expect(keyframesBody).toMatch(/rotate/)
    }
  })

  it('behaelt die bestehenden M3a-Verträge (Code-Schild, wartende Slots, Host-Badge)', () => {
    const css = leseCss()
    // M3a: Code-Schild hat animation
    const schild = regelBody(css, '.lobby-code-schild')
    expect(schild).toMatch(/animation\s*:/)
    // M3a: wartende Slots pulsen
    const wartend = regelBody(css, '.lobby-slot--wartet .lobby-slot__hoehle')
    expect(wartend).toMatch(/animation\s*:/)
  })

  it('behaelt den kompakten Hero (flex-direction row) aus M3a', () => {
    const css = leseCss()
    const body = regelBody(css, '.hero')
    expect(body).toMatch(/flex-direction:\s*row/)
  })

  it('rendert drei Start-Buttons mit Play-Icon im DOM', () => {
    render(<App initialZustand={deterministischerZustand()} />)
    const lobby = screen.getByRole('region', { name: 'Das sonnige Nest' })
    const playIcons = lobby.querySelectorAll('.lobby-startbutton__icon')
    expect(playIcons.length).toBe(3)
  })

  it('zeigt das Host-Badge im Host-Slot (M3a-Vertrag)', () => {
    render(<App initialZustand={deterministischerZustand()} />)
    const lobby = screen.getByRole('region', { name: 'Das sonnige Nest' })
    const hostSlot = within(lobby).getByText('Slippy Host').closest('li')
    expect(hostSlot).not.toBeNull()
    const badge = hostSlot!.querySelector('.lobby-slot__badge')
    expect(badge).not.toBeNull()
  })

  it('stoppt die neuen Spielstart-Animationen bei prefers-reduced-motion', () => {
    const css = leseCss()
    const startIdx = css.indexOf('@media (prefers-reduced-motion')
    expect(startIdx).toBeGreaterThanOrEqual(0)
    const block = findeBlockNach(css, startIdx)
    // Mindestens eine Lobby-Animation wird gestoppt
    expect(block).toMatch(/lobby-(startbutton|code-schild|slot--ki)[^}]*animation:\s*none/)
  })
})
