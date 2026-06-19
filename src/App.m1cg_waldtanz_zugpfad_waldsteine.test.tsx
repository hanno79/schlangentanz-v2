/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1cg macht den Zugpfad in der /game-Unterholzleiste als horizontale Waldstein-Spielsteine sichtbar statt als gescrollte Mini-Liste.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')
const smokeScript = readFileSync('scripts/m1cg_zugpfad_waldsteine_smoke.mjs', 'utf8')

const cssBlock = (selector: string) =>
  appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

describe('M1cg Waldtanz-Zugpfad-Waldsteine', () => {
  it('zeigt die Zugreihenfolge auf /game als horizontale Waldstein-Spielsteine in der Unterholzleiste', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(4, () => 0.999999))} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const zugleiste = within(spieltisch).getByRole('complementary', { name: 'Zugleiste' })
    const zugpfad = within(zugleiste).getByRole('region', { name: 'Zugpfad' })
    const strecke = within(zugpfad).getByRole('list')
    const stationen = within(strecke).getAllByRole('listitem')

    expect(zugpfad).toHaveClass('zugpfad--waldsteine')
    expect(strecke).toHaveClass('zugpfad__strecke--waldsteine')
    expect(stationen).toHaveLength(4)
    expect(stationen[0]).toHaveClass('zugpfad__station--aktiv')
    expect(stationen.every((station) => station.classList.contains('zugpfad__station--waldstein'))).toBe(true)
    expect(within(stationen[0]).getByText('Du')).toBeVisible()
    expect(within(stationen[1]).getByText('KI')).toBeVisible()
    expect(within(zugpfad).getByText('Nächster Halt: Spieler 2')).toBeVisible()
  })

  it('legt den route-sicheren CSS- und Smoke-Vertrag fuer eine nicht-scrollende Spielsteinleiste ab', () => {
    const zugpfadRoute = cssBlock('.spielbereich--game-route [class~="zugpfad--waldsteine"]')
    const streckeRoute = cssBlock('.spielbereich--game-route [class~="zugpfad__strecke--waldsteine"]')
    const stationRoute = cssBlock('.spielbereich--game-route [class~="zugpfad__station--waldstein"]')
    const aktivRoute = cssBlock('.spielbereich--game-route [class~="zugpfad__station--aktiv"][class~="zugpfad__station--waldstein"]')

    expect(zugpfadRoute).toMatch(/background:\s*linear-gradient\(135deg,\s*rgba\(236,\s*255,\s*227,\s*0\.94\),\s*rgba\(255,\s*224,\s*139,\s*0\.78\)\)/)
    expect(streckeRoute).toMatch(/grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(2\.25rem,\s*1fr\)\)/)
    expect(streckeRoute).toMatch(/overflow:\s*visible/)
    expect(appCss.indexOf('.spielbereich--game-route [class~="zugpfad__strecke--waldsteine"]')).toBeGreaterThan(
      appCss.lastIndexOf('.spielbereich--game-route [class~="zugpfad__strecke"]'),
    )
    expect(stationRoute).toMatch(/border-radius:\s*999px/)
    expect(stationRoute).toMatch(/min-height:\s*2\.1rem/)
    expect(aktivRoute).toMatch(/transform:\s*translateY\(-0\.35rem\)/)
    expect(packageJson).toContain('node scripts/m1cg_zugpfad_waldsteine_smoke.mjs')
    expect(smokeScript).toContain('M1cg Zugpfad-Waldsteine')
    expect(smokeScript).toContain('streckeOverflow !== \'visible\'')
    expect(smokeScript).toContain('stationen.length !== 2')
    expect(smokeScript).toContain('maxTopDelta > 10')
  })
})
