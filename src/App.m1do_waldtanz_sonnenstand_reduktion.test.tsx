/*
 * Author: rahn
 * Datum: 26.06.2026
 * Version: 1.0
 * Beschreibung: M1do RED-Tests fuer Sonnenstand-HUD-Reduktion auf /game.
 *              - Sonnenstand-Sektion bleibt im React-Tree
 *              - Sonnenstand-Sektion ist auf /game visuell versteckt (display:none, route-scoped)
 *              - Sonnenstand-Sektion ist auf / (Lobby) weiterhin sichtbar
 *              - Production-Smoke ist in npm-script-Wiring eingebunden
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen } from '@testing-library/react'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function cssBlock(selector: string, css: string): string {
  const matches = [...css.matchAll(new RegExp(`(^|[\\s,>])${escapeRegex(selector)}\\s*\\{`, 'g'))]
  if (matches.length === 0) return ''
  for (let i = matches.length - 1; i >= 0; i--) {
    const startIdx = matches[i].index ?? 0
    const openIdx = css.indexOf('{', startIdx)
    if (openIdx < 0) continue
    let depth = 1
    let j = openIdx + 1
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++
      else if (css[j] === '}') depth--
      j++
    }
    return css.slice(openIdx + 1, j - 1)
  }
  return ''
}

function cssBlockContains(parentSel: string, childSel: string, css: string): string {
  const re = new RegExp(`(^|[\\s,>])${escapeRegex(parentSel)}\\s+${escapeRegex(childSel)}\\s*\\{([^}]*)\\}`, 's')
  const m = css.match(re)
  return m ? m[2] : ''
}
const appCss = readFileSync(resolve(__dirname, './App.css'), 'utf8')
const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8')) as {
  scripts: Record<string, string>
}

describe('M1do Sonnenstand-Reduktion auf /game', () => {
  it('RED: route-scoped display:none Regel ist im CSS vorhanden', () => {
    const block = cssBlockContains('.spielbereich--game-route', '[class~="waldtanz-sonnenstand"]', appCss)
    expect(block).toMatch(/display:\s*none/)
  })

  it('RED: Basis-Regel .waldtanz-sonnenstand bleibt unveraendert (Lobby braucht sie sichtbar)', () => {
    const basisBlock = cssBlock('.waldtanz-sonnenstand', appCss)
    expect(basisBlock).not.toMatch(/display:\s*none/)
  })

  it('RED: Sonnenstand-Sektion ist im DOM auf /game weiterhin vorhanden', () => {
    window.history.pushState({}, '', '/game')
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    render(<App initialZustand={zustand} />)
    const sonnenstand = screen.getByRole('group', { name: 'Waldtanz-Sonnenstand' })
    expect(sonnenstand).toBeInTheDocument()
  })

  it('RED: Sonnenstand-Sektion ist auf / (Lobby) sichtbar (kein route-scope Leak)', () => {
    window.history.pushState({}, '', '/')
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    render(<App initialZustand={zustand} />)
    const sonnenstand = screen.getByRole('group', { name: 'Waldtanz-Sonnenstand' })
    expect(sonnenstand).toBeVisible()
  })
})

describe('M1do Smoke-Wiring', () => {
  it('RED: smoke:production script chain enthaelt M1do-Slice-Script', () => {
    const chain = packageJson.scripts['smoke:production'] ?? ''
    expect(chain).toMatch(/m1do_waldtanz_sonnenstand_reduktion/)
  })

  it('RED: M1do Smoke-Skript enthaelt die Slice-Funktion', () => {
    const scriptPath = resolve(__dirname, '../scripts/m1do_waldtanz_sonnenstand_reduktion_smoke.mjs')
    const scriptContent = readFileSync(scriptPath, 'utf8')
    expect(scriptContent).toContain('pruefeM1doSonnenstandReduktion')
  })
})
