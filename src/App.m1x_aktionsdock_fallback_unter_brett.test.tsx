/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1x macht das Aktionsdock auf /game zum Fallback unter dem Waldtanz-Brett, damit die Buttonliste nicht mehr die Spielflaeche ueberlagert.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')
const selectorBlock = (selector: string) =>
  appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1x Aktionsdock als Fallback unter dem Waldtanz-Brett', () => {
  it('laesst auf der fokussierten /game-Route das Brett und die Hand vor der Buttonliste spielen', () => {
    window.history.pushState({}, '', '/game')

    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const aktiverSpielerPanel = within(spielbereich).getByRole('region', { name: 'Aktiver Spieler' })
    const spieltisch = within(aktiverSpielerPanel).getByRole('region', { name: 'Spieltisch' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const aktionen = within(aktiverSpielerPanel).getByRole('region', { name: 'Aktionen' })

    expect(spielbereich).toHaveClass('spielbereich--game-route')
    expect(aktionen).toHaveClass('aktionen-panel--waldtanz-dock')
    expect(spieltisch.nextElementSibling).toBe(aktionen)
    expect(spieltisch).toContainElement(schlangenbereich)
    expect(spieltisch).toContainElement(handkarten)

    const gameRouteOverride = selectorBlock('.spielbereich--game-route .aktionen-panel--waldtanz-dock')
    expect(gameRouteOverride).toMatch(/position:\s*static/)
    expect(gameRouteOverride).toMatch(/max-height:\s*none/)
    expect(gameRouteOverride).toMatch(/overflow:\s*visible/)
    expect(gameRouteOverride).toMatch(/pointer-events:\s*auto/)
    expect(gameRouteOverride).toMatch(/margin-top:\s*1rem/)

    expect(selectorBlock('.aktionen-panel--waldtanz-dock')).toMatch(/position:\s*sticky/)
  })
})
