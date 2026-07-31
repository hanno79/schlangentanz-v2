/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1cj macht Startfährten im ersten Waldtanz-Zug zu direkt klickbaren Brettobjekten.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { istVerdrahtet } from './test/smokeKetten'

const appCss = readFileSync('src/App.css', 'utf8')
const smokeScript = readFileSync('scripts/m1cj_startfaehrten_smoke.mjs', 'utf8')
const cssBlock = (selector: string) =>
  appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1cj Waldtanz-Startfährten', () => {
  it('macht jede Startfährte auf /game zu einem eigenen Brettziel fuer die passende Handkarte', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const startkreis = within(schlangenbereich).getByRole('button', { name: 'Neue Schlange starten' })
    const startzone = startkreis.closest('.schlangen-startzone') as HTMLElement
    const startfaehrten = within(startzone).getByRole('list', { name: 'Startfährten im Startkreis' })
    const faehrtenButtons = within(startfaehrten).getAllByRole('button', { name: /Startfährte .* als neue Schlange starten/ })

    expect(faehrtenButtons).toHaveLength(5)
    expect(faehrtenButtons.every((button) => button.closest('button') === button)).toBe(true)
    expect(faehrtenButtons.map((button) => button.textContent)).toEqual([
      expect.stringContaining('blau-01'),
      expect.stringContaining('blau-03'),
      expect.stringContaining('blau-05'),
      expect.stringContaining('blau-07'),
      expect.stringContaining('blau-09'),
    ])

    fireEvent.click(within(startfaehrten).getByRole('button', { name: 'Startfährte blau-09 als neue Schlange starten' }))

    const kartenreihe = within(schlangenbereich).getByRole('list', { name: /Kartenreihe schlange-/ })
    expect(within(kartenreihe).getByLabelText('Farbkarte blau-09: Blau mit 1 Punkten')).toBeVisible()
    expect(within(screen.getByRole('status', { name: 'Waldtanz-Kartenpop' })).getByText('Wasserwirbel')).toBeVisible()
    expect(within(schlangenbereich).queryByLabelText('Farbkarte blau-01: Blau mit 1 Punkten')).toBeNull()
  })

  it('sichert den Startfährten-Button- und Smoke-Vertrag als Stitch-Spielobjekt', () => {
    const faehrteButton = cssBlock('.schlangen-startzone__faehrte-button')
    const faehrteButtonActive = cssBlock('.schlangen-startzone__faehrte-button:active')
    const routeButton = cssBlock('.spielbereich--game-route [class~="schlangen-startzone__faehrte-button"]')

    expect(faehrteButton).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(faehrteButton).toMatch(/box-shadow:\s*0 3px 0 var\(--st-color-border-strong\)/)
    expect(faehrteButton).toMatch(/cursor:\s*pointer/)
    expect(faehrteButtonActive).toMatch(/transform:\s*translateY\(3px\)/)
    expect(routeButton).toMatch(/min-height:\s*1\.55rem/)
    expect(smokeScript).toContain('M1cj Startfaehrten')
    expect(smokeScript).toContain('elementFromPoint')
    expect(smokeScript).toContain('Startfährte blau-09 als neue Schlange starten')
    expect(['m1ci_seitenranke_smoke.mjs', 'm1cj_startfaehrten_smoke.mjs'].every(istVerdrahtet)).toBe(true)
  })
})
