/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1bz verdichtet den oberen Waldtanz-Spielerrahmen auf /game zu einem Stitch-Gegner-HUD statt einer scrollenden Status-/Gegnerliste.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import type { SonderkarteInfo } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')
const smokeScript = readFileSync('scripts/m1bz_gegner_hud_smoke.mjs', 'utf8')
const cssBlock = (selector: string) =>
  appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''
const sonderkarte = (id: string, name: string): SonderkarteInfo => ({ typ: 'Sonderkarte', id, name })

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1bz Waldtanz-Gegner-HUD', () => {
  it('nutzt auf /game den oberen Spielerrahmen als kompaktes Stitch-Gegner-HUD ueber dem Waldstein', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(4, () => 0.62))} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const rahmen = within(spieltisch).getByRole('region', { name: 'Waldtanz-Spielerrahmen' })
    const gartenkopf = within(rahmen).getByRole('group', { name: 'Waldtanz-Gartenkopf' })
    const arenastein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })

    expect(gartenkopf).toBeVisible()
    expect(within(gartenkopf).getByText('Gegnerfokus')).toBeVisible()
    expect(within(gartenkopf).getByRole('list', { name: 'Top-Kartenfächer von Spieler 2' })).toBeVisible()
    expect(within(gartenkopf).getByLabelText('Zugtempo')).toBeVisible()
    expect(rahmen.compareDocumentPosition(arenastein) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('legt den route-sicheren CSS- und Smoke-Vertrag fuer das nicht-scrollende Gegner-HUD ab', () => {
    const rahmen = cssBlock('.spielbereich--game-route [class~="waldtanz-spielerrahmen"]')
    const gartenkopf = cssBlock('.spielbereich--game-route [class~="waldtanz-spielerrahmen__gartenkopf"]')
    const statusband = cssBlock('.spielbereich--game-route [class~="waldtanz-spielerrahmen__statusband"]')
    const gegnerliste = cssBlock('.spielbereich--game-route [class~="waldtanz-spielerrahmen"]:not(:has([class~="waldtanz-spielerrahmen__gegnerplatz--grubenziel"])) [class~="waldtanz-spielerrahmen__gegnerliste"]')
    const grubenAusnahme = cssBlock('.spielbereich--game-route [class~="waldtanz-spielerrahmen"]:has([class~="waldtanz-spielerrahmen__gegnerplatz--grubenziel"])')
    const eigeneReihe = cssBlock('.spielbereich--game-route [class~="waldtanz-spielerrahmen__reihe--du"]')
    const topkarte = cssBlock('.spielbereich--game-route [class~="waldtanz-spielerrahmen__topkarte"]')
    const tempo = cssBlock('.spielbereich--game-route [class~="waldtanz-spielerrahmen__tempo"]')

    // M1d0 22.06.2026: Spielerrahmen auf 6vh komprimiert (vorher 9vh),
    // damit Spielerrahmen + Gegnerplakette + Arenastein + Bottom-Row
    // zusammen in den 900-px-Viewport passen.
    expect(rahmen).toMatch(/max-height:\s*clamp\(3\.6rem,\s*6vh,\s*4\.6rem\)/)
    expect(rahmen).toMatch(/overflow:\s*visible/)
    expect(rahmen).toMatch(/padding:\s*0/)
    expect(gartenkopf).toMatch(/background:\s*transparent/)
    expect(gartenkopf).toMatch(/border-color:\s*transparent/)
    expect(gartenkopf).toMatch(/box-shadow:\s*none/)
    expect(statusband).toMatch(/display:\s*none/)
    expect(gegnerliste).toMatch(/display:\s*none/)
    expect(grubenAusnahme).toMatch(/max-height:\s*clamp\(12rem,\s*32vh,\s*18rem\)/)
    expect(grubenAusnahme).toMatch(/overflow:\s*auto/)
    expect(grubenAusnahme).toMatch(/padding:\s*0\.45rem/)
    expect(eigeneReihe).toMatch(/display:\s*none/)
    expect(topkarte).toMatch(/width:\s*clamp\(3\.8rem,\s*5\.8vw,\s*5\.2rem\)/)
    expect(tempo).toMatch(/background:\s*var\(--st-color-primary-container\)/)
    expect(smokeScript).toContain('M1bz Gegner-HUD')
    expect(smokeScript).toContain('M1bz Gruben-Ausnahme')
    expect(smokeScript).toContain('statusbandDisplay !== \'none\'')
    expect(smokeScript).toContain('rahmenScrollt')
    expect(packageJson).toContain('scripts/m1by_spielbrettweite_smoke.mjs && node scripts/m1bz_gegner_hud_smoke.mjs')
  })

  it('laesst die Gegnerliste auf /game wieder Raum einnehmen, sobald eine Schlangengrube ein Spielerziel braucht', () => {
    window.history.pushState({}, '', '/game')
    const zustand = starteAusspielphase(erstelleSpielzustand(3, () => 0.999999))
    zustand.spieler[0].hand = [sonderkarte('schlangengrube-m1bz', 'Schlangengrube')]
    zustand.spieler[1].hand = []
    zustand.spieler[2].hand = []
    render(<App initialZustand={zustand} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const rahmen = within(spieltisch).getByRole('region', { name: 'Waldtanz-Spielerrahmen' })
    const gegnerliste = within(rahmen).getByRole('list', { name: 'Gegner am Tisch' })

    fireEvent.click(within(handkarten).getByRole('button', { name: /schlangengrube-m1bz/ }))

    const gegnerSpieler2 = within(gegnerliste).getByText('Gegner: Spieler 2').closest('li') as HTMLElement
    expect(gegnerSpieler2).toHaveClass('waldtanz-spielerrahmen__gegnerplatz--grubenziel')
    expect(within(gegnerSpieler2).getByRole('button', {
      name: 'Schlangengrube im Spielerrahmen mit Karte schlangengrube-m1bz auf Spieler 2',
    })).toBeVisible()
  })
})
