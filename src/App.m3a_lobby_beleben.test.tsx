/**
 * Author: rahn
 * Datum: 24.06.2026
 * Version: 1.0
 * Beschreibung: M3a UI-Test für das belebte sonnige Nest (Stitch-Lobby).
 *
 * Prüft, dass die Lobby:
 *   1. Ein schwingendes Codeschild hat (animation auf .lobby-code-schild).
 *   2. Wartende Slots pulsieren (animation auf .lobby-slot--wartet).
 *   3. Der Host-Slot ein Host-Badge trägt.
 *   4. Start-Buttons ein Play-Icon zeigen.
 *   5. Der Hero kompakt ist (horizontal/flex), damit die Lobby im Erstbild sichtbar wird.
 *   6. Die bestehenden Hero-Verträge (R117, App.test) nicht brechen.
 *   7. Prefer-Reduced-Motion stoppt die Lobby-Animationen.
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

describe('M3a Sonniges Nest beleben', () => {
  it('zeigt ein schwingendes Codeschild (CSS animation auf .lobby-code-schild)', () => {
    const css = leseCss()
    const body = regelBody(css, '.lobby-code-schild')
    expect(body).toMatch(/animation\s*:/)
  })

  it('lässt wartende Slots pulsieren (CSS animation auf .lobby-slot--wartet)', () => {
    const css = leseCss()
    // M3c-Migration: wartende Slots animieren jetzt .lobby-avatar
    // (vorher .lobby-slot__hoehle).
    const body = regelBody(css, '.lobby-slot--wartet .lobby-avatar')
    expect(body).toMatch(/animation\s*:/)
  })

  it('zeigt ein Host-Badge im Host-Slot', () => {
    render(<App initialZustand={deterministischerZustand()} />)
    const lobby = screen.getByRole('region', { name: 'Das sonnige Nest' })
    // M3c-Migration: Slot-Container ist jetzt <div> (vorher <li>).
    const hostSlot = within(lobby).getByText('Slippy Host').closest('.lobby-slot')
    expect(hostSlot).not.toBeNull()
    const badge = hostSlot!.querySelector('.lobby-slot__badge')
    expect(badge).not.toBeNull()
  })

  it('zeigt Start-Buttons mit Play-Icon', () => {
    render(<App initialZustand={deterministischerZustand()} />)
    const lobby = screen.getByRole('region', { name: 'Das sonnige Nest' })
    const buttons = within(lobby).getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
    const playIcons = lobby.querySelectorAll('.lobby-startbutton__icon')
    expect(playIcons.length).toBeGreaterThanOrEqual(1)
  })

  it('macht den Hero kompakt (flex-direction row für Horizontal-Layout)', () => {
    const css = leseCss()
    const body = regelBody(css, '.hero')
    expect(body).toMatch(/flex-direction:\s*row/)
  })

  it('erhält die bestehenden Hero-Verträge (h1 + Feature-Texte im Hero)', () => {
    render(<App initialZustand={deterministischerZustand()} />)
    const heroTitel = screen.getByRole('heading', { level: 1, name: /^schlangentanz$/i })
    const hero = heroTitel.closest('section')
    expect(hero).not.toBeNull()
    const withinHero = within(hero as HTMLElement)
    expect(withinHero.getByText(/baue farbige schlangen/i)).toBeInTheDocument()
    expect(withinHero.getByText(/bereit für deine nächste schlange/i)).toBeInTheDocument()
  })

  it('stoppt Lobby-Animationen bei prefers-reduced-motion', () => {
    const css = leseCss()
    const startIdx = css.indexOf('@media (prefers-reduced-motion')
    expect(startIdx).toBeGreaterThanOrEqual(0)
    const braceStart = css.indexOf('{', startIdx)
    let depth = 1
    let end = braceStart + 1
    while (depth > 0 && end < css.length) {
      if (css[end] === '{') depth++
      if (css[end] === '}') depth--
      end++
    }
    const block = css.slice(braceStart + 1, end - 1)
    expect(block).toMatch(/lobby-code-schild[^}]*animation:\s*none/)
    expect(block).toMatch(/lobby-slot--wartet[^}]*animation:\s*none/)
  })
})
