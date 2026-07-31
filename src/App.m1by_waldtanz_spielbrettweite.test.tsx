/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1by macht den Waldtanz-Spieltisch breiter, indem die Zugleiste nicht mehr als rechte Spalte den Waldstein zusammendrückt.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { istVerdrahtet } from './test/smokeKetten'

const appCss = readFileSync('src/App.css', 'utf8')
const smokeScript = readFileSync('scripts/m1by_spielbrettweite_smoke.mjs', 'utf8')
const cssBlock = (selector: string) =>
  appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1by Waldtanz-Spielbrettweite', () => {
  it('behält Spieltisch, Waldstein, Zugleiste und Hand strukturell zusammen, aber gibt dem Waldstein auf /game die volle Brettbreite', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const arenastein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const zugleiste = within(spieltisch).getByRole('complementary', { name: 'Zugleiste' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })

    expect(arenastein.compareDocumentPosition(handkarten) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(zugleiste).toBeInTheDocument()
    expect(within(arenastein).getByRole('region', { name: 'Schlangenlichtung' })).toBeVisible()
    expect(within(zugleiste).getByRole('region', { name: 'Zugpfad' })).toBeVisible()
  })

  it('legt den route-sicheren CSS- und Smoke-Vertrag fuer eine breite Waldstein-Spielmatte ab', () => {
    const brett = cssBlock('.spielbereich--game-route [class~="spielbrett--waldtanz"]')
    const spielerrahmen = cssBlock('.spielbereich--game-route [class~="waldtanz-spielerrahmen"]')
    const arenastein = cssBlock('.spielbereich--game-route [class~="waldtanz-arenastein"]')
    const zugleiste = cssBlock('.spielbereich--game-route [class~="waldtanz-zugseitenleiste"]')

    // M1d0 22.06.2026: Der Spieltisch hat jetzt grid-template-areas mit
    // benannten Zeilen. Spielerrahmen, Arenastein und Zugseitenleiste sind
    // benannte Grid-Zeilen statt numerischer grid-row/grid-column.
    expect(brett).toMatch(/grid-template-areas:/)
    expect(spielerrahmen).toMatch(/grid-area:\s*spielerrahmen/)
    // M1d0 22.06.2026: Spielerrahmen auf 6vh komprimiert (vorher 9vh).
    expect(spielerrahmen).toMatch(/max-height:\s*clamp\(3\.6rem,\s*6vh,\s*4\.6rem\)/)
    expect(spielerrahmen).toMatch(/background:\s*transparent/)
    expect(spielerrahmen).toMatch(/box-shadow:\s*none/)
    expect(arenastein).toMatch(/grid-area:\s*arenastein/)
    expect(arenastein).toMatch(/width:\s*100%/)
    expect(zugleiste).toMatch(/grid-area:\s*zugseitenleiste/)
    expect(zugleiste).toMatch(/grid-template-columns:\s*minmax\(6rem,\s*0\.65fr\)\s+repeat\(6,\s*minmax\(5\.1rem,\s*1fr\)\)/)
    // M1d0 22.06.2026: Zugseitenleiste auf 7vh komprimiert (vorher 12vh).
    expect(zugleiste).toMatch(/max-height:\s*clamp\(4rem,\s*7vh,\s*5rem\)/)
    expect(smokeScript).toContain('M1by Spielbrettweite')
    expect(smokeScript).toContain('daten.gartenkopf.height > 185')
    expect(smokeScript).toContain('waldsteinWidth < 820')
    expect(smokeScript).toContain('zugleiste.y < waldstein.bottom')
    expect(['live_smoke.mjs', 'm1bw_lichtung_entflechtung_smoke.mjs', 'm1bx_spielkartenfaecher_smoke.mjs', 'm1by_spielbrettweite_smoke.mjs'].every(istVerdrahtet)).toBe(true)
  })
})
