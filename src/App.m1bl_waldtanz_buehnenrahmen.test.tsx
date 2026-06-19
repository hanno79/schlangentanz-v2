/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1bl demotet den äußeren Aktiver-Spieler-Chrome auf /game, damit der Spieltisch wie die primäre Waldtanz-Bühne wirkt.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1bl Waldtanz-Bühnenrahmen', () => {
  it('behält die semantischen Regionen, macht aber den Spieltisch zum primären Game-Objekt', () => {
    window.history.pushState({}, '', '/game')
    render(<App />)

    const aktiverSpieler = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const spieltisch = within(aktiverSpieler).getByRole('region', { name: 'Spieltisch' })
    const waldstein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })

    expect(aktiverSpieler).toHaveClass('info-panel--waldtanz-arena')
    expect(spieltisch).toHaveClass('spielbrett--waldtanz')
    expect(waldstein).toBeVisible()
    expect(handkarten).toBeVisible()
    expect(aktiverSpieler).toContainElement(spieltisch)
  })

  it('legt auf /game den äußeren Panel-Chrome transparent und versteckt nur die Wrapper-Überschriften visuell', () => {
    const arenaChrome = cssBlock('.spielbereich--game-route .info-panel--waldtanz-arena')
    const titelBlock = cssBlock('.spielbereich--game-route .info-panel--waldtanz-arena > h2,\n  .spielbereich--game-route [class~="spielbrett--waldtanz"] > h3')
    const brettBlock = cssBlock('.spielbereich--game-route [class~="spielbrett--waldtanz"]')

    expect(arenaChrome).toMatch(/background:\s*transparent/)
    expect(arenaChrome).toMatch(/border-color:\s*transparent/)
    expect(arenaChrome).toMatch(/box-shadow:\s*none/)
    expect(arenaChrome).toMatch(/padding:\s*0/)
    expect(titelBlock).toMatch(/position:\s*absolute/)
    expect(titelBlock).toMatch(/clip-path:\s*inset\(50%\)/)
    expect(titelBlock).toMatch(/white-space:\s*nowrap/)
    expect(brettBlock).toMatch(/box-shadow:[\s\S]*var\(--st-color-border-strong\)/)
  })
})
