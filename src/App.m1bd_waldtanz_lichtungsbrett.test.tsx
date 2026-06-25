/**
 * Author: rahn
 * Datum: 18.06.2026
 * Version: 1.0
 * Beschreibung: M1bd macht die Schlangenlichtung als offenes Waldtanz-Lichtungsbrett statt verschachteltem Panel sichtbar.
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

describe('M1bd Waldtanz-Lichtungsbrett', () => {
  it('öffnet die Schlangenlichtung auf /game als zentrales Lichtungsbrett mit Schlangenbereich vor Helferflächen', () => {
    window.history.pushState({}, '', '/game')
    render(<App />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const lichtung = within(spieltisch).getByRole('region', { name: 'Schlangenlichtung' })
    const schlangenbereich = within(lichtung).getByRole('region', { name: 'Schlangenbereich' })
    const zielkompass = within(schlangenbereich).getByRole('region', { name: 'Waldtanz-Zielkompass' })

    expect(lichtung).toHaveClass('waldtanz-lichtungsbrett')
    expect(within(lichtung).getByRole('region', { name: 'Waldtanz-Tischkarte' })).toBeVisible()
    expect(within(lichtung).getByRole('region', { name: 'Waldtanz-Magiekreise' })).toBeVisible()
    expect(schlangenbereich).toContainElement(zielkompass)
    expect(within(schlangenbereich).getByRole('button', { name: 'Neue Schlange starten' })).toBeVisible()
  })

  it('legt den route-scoped Lichtungsbrett-Vertrag mit offener Schlangenfläche statt Panel-Box ab', () => {
    const lichtungsBlock = cssBlock('.spielbereich--game-route [class~="waldtanz-lichtungsbrett"]')
    const schlangenBlock = cssBlock('.spielbereich--game-route [class~="waldtanz-lichtungsbrett"] [class~="schlangenbereich--waldlichtung"]')
    const gruppenBlock = cssBlock('.spielbereich--game-route [class~="waldtanz-lichtungsbrett"] [class~="schlangen-gruppe"]')

    // AENDERUNG 25.06.2026 (M1dj): Section .waldtanz-lichtungsbrett ist jetzt
    // eine single-column Spielfeldhuell-Klasse mit grid-template-rows statt
    // der frueheren 2x2-Areas. Die alte named-area-Konfiguration
    // ("tisch magiekreise / schlangen schlangen") ist in die innere
    // .waldtanz-schlangenlichtung__schlangen gewandert.
    expect(lichtungsBlock).toMatch(/grid-template-columns:\s*minmax\(0,\s*1fr\)/)
    expect(lichtungsBlock).toMatch(/grid-template-rows:\s*auto minmax\(0,\s*1fr\)/)
    expect(lichtungsBlock).toMatch(/background:[\s\S]*radial-gradient\(ellipse at 50% 62%/)
    expect(lichtungsBlock).not.toMatch(/grid-template-areas:\s*"tisch\s+magiekreise/)
    // Schlangen-in-Lichtungsbrett ist nur noch width:100% + min-height:0;
    // die alte grid-area / margin-top / position-Verkabelung ist obsolet,
    // weil der Schlangenbereich heute ueber .__schlangen Grid-Areas seine
    // Brettmitte bekommt.
    expect(schlangenBlock).toMatch(/width:\s*100%/)
    expect(schlangenBlock).toMatch(/min-height:\s*0/)
    expect(schlangenBlock).not.toMatch(/grid-area:\s*schlangen/)
    expect(gruppenBlock).toMatch(/background:\s*rgba\(236, 255, 227, 0\.58\)/)
    expect(gruppenBlock).toMatch(/border:\s*2px solid rgba\(6, 57, 7, 0\.32\)/)
  })

  it('ordnet Kartenpop im Lichtungsbrett per named area ohne numerisches Row-Überlappen ein', () => {
    const generischerMagiekreiseBlock = cssBlock('.spielbereich--game-route [class~="waldtanz-magiekreise"]')
    const generischerSchlangenBlock = cssBlock('.spielbereich--game-route [class~="schlangenbereich--waldlichtung"]')
    const popLichtungBlock = cssBlock('.spielbereich--game-route [class~="waldtanz-lichtungsbrett"]:has(.waldtanz-kartenpop)')
    const popBlock = cssBlock('.spielbereich--game-route [class~="waldtanz-lichtungsbrett"] [class~="waldtanz-kartenpop"]')
    const popMagiekreiseBlock = cssBlock('.spielbereich--game-route [class~="waldtanz-lichtungsbrett"]:has(.waldtanz-kartenpop) [class~="waldtanz-magiekreise"]')
    const popSchlangenBlock = cssBlock('.spielbereich--game-route [class~="waldtanz-lichtungsbrett"]:has(.waldtanz-kartenpop) [class~="schlangenbereich--waldlichtung"]')

    expect(generischerMagiekreiseBlock).not.toMatch(/grid-(column|row):/)
    expect(generischerSchlangenBlock).not.toMatch(/grid-(column|row):/)
    expect(popLichtungBlock).toMatch(/grid-template-areas:[\s\S]*"tisch pop"[\s\S]*"magiekreise pop"[\s\S]*"schlangen schlangen"/)
    expect(popBlock).toMatch(/grid-area:\s*pop/)
    expect(popBlock).not.toMatch(/grid-(column|row):/)
    expect(popMagiekreiseBlock).toMatch(/grid-area:\s*magiekreise/)
    expect(popMagiekreiseBlock).not.toMatch(/grid-(column|row):/)
    expect(popSchlangenBlock).toMatch(/grid-area:\s*schlangen/)
    expect(popSchlangenBlock).not.toMatch(/grid-(column|row):/)
  })
})
