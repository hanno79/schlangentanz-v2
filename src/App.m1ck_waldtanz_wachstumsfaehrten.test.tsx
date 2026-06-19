/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1ck macht nach dem ersten Startzug Schlangenenden als direkte Wachstumsfährten spielbar.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, schlange } from './engine/__tests__/testHelpers'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')

const cssBlock = (selector: string) =>
  appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function wachstumsfaehrtenZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [farbkarte('blau-m1ck', 'Blau', 4), farbkarte('gelb-m1ck', 'Gelb', 5)]
  zustand.spieler[0].schlangen = [schlange([farbkarte('start-m1ck', 'Blau', 2)], 'pfad-m1ck')]
  return zustand
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1ck Waldtanz-Wachstumsfährten', () => {
  it('zeigt auf /game unselektierte Anlegeaktionen als direkte Wachstumsfährten am Schlangenpfad', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={wachstumsfaehrtenZustand()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const eigeneSchlange = within(schlangenbereich).getAllByRole('button', { name: /Schlange pfad-m1ck/ })[0]

    expect(within(schlangenbereich).queryByText('Keine eigenen Schlangen.')).toBeNull()
    const wachstumsfaehrten = within(eigeneSchlange).getByRole('list', { name: 'Wachstumsfährten für pfad-m1ck' })
    const buttons = within(wachstumsfaehrten).getAllByRole('button', { name: /Wachstumsfährte .* für Pfad pfad-m1ck (links|rechts) anlegen/ })

    expect(buttons.length).toBeGreaterThanOrEqual(2)
    expect(buttons.every((button) => button.closest('button') === button)).toBe(true)
    expect(buttons.map((button) => button.textContent).join(' ')).toContain('blau-m1ck')
    expect(within(eigeneSchlange).queryByLabelText('Waldtanz-Anlegeplätze für pfad-m1ck')).toBeNull()

    fireEvent.click(within(wachstumsfaehrten).getByRole('button', { name: 'Wachstumsfährte blau-m1ck für Pfad pfad-m1ck rechts anlegen' }))

    const kartenreihe = within(eigeneSchlange).getByRole('list', { name: 'Kartenreihe pfad-m1ck' })
    expect(within(kartenreihe).getByLabelText('Farbkarte blau-m1ck: Blau mit 4 Punkten')).toBeVisible()
    const spielhilfe = screen.getByRole('complementary', { name: 'Waldtanz-Spielhilfe' })
    const zugtafel = within(spielhilfe).getByRole('region', { name: 'Waldtanz-Zugtafel' })
    expect(within(zugtafel).getByText('Karte blau-m1ck an Schlange pfad-m1ck rechts anlegen')).toBeVisible()
  })

  it('lässt außerhalb der Game-Route die bestehenden Waldtanz-Anlegeplätze unverändert sichtbar', () => {
    render(<App initialZustand={wachstumsfaehrtenZustand()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const eigeneSchlange = within(schlangenbereich).getAllByRole('button', { name: /Schlange pfad-m1ck/ })[0]

    expect(within(eigeneSchlange).queryByRole('list', { name: 'Wachstumsfährten für pfad-m1ck' })).toBeNull()
    expect(within(eigeneSchlange).getByLabelText('Waldtanz-Anlegeplätze für pfad-m1ck')).toBeVisible()
    expect(within(eigeneSchlange).getByRole('button', { name: 'Schlangenbereich: Karte blau-m1ck rechts anlegen' })).toBeVisible()
  })

  it('sichert den Google-Stitch-Spielobjekt- und Smoke-Vertrag', () => {
    const faehrten = cssBlock('.schlangekarte__wachstumsfaehrten')
    const button = cssBlock('.schlangekarte__wachstumsfaehrte-button')
    const active = cssBlock('.schlangekarte__wachstumsfaehrte-button:active')

    expect(faehrten).toMatch(/display:\s*grid/)
    expect(button).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(button).toMatch(/box-shadow:\s*0 3px 0 var\(--st-color-border-strong\)/)
    expect(button).toMatch(/var\(--st-color-surface-container-lowest, #ffffff\)/)
    expect(button).toMatch(/border-radius:\s*var\(--st-radius-lg\)/)
    expect(button).toMatch(/cursor:\s*pointer/)
    expect(active).toMatch(/transform:\s*translateY\(3px\)/)
    expect(appCss).toMatch(/\.schlangekarte__wachstumsfaehrte-button--links:active[\s\S]*transform:\s*translateY\(3px\) rotate\(-1\.5deg\)/)
    expect(appCss).toMatch(/\.schlangekarte__wachstumsfaehrte-button--rechts:active[\s\S]*transform:\s*translateY\(3px\) rotate\(1\.5deg\)/)
    expect(packageJson).toContain('node scripts/m1cj_startfaehrten_smoke.mjs && node scripts/m1ck_wachstumsfaehrten_smoke.mjs')
  })
})
