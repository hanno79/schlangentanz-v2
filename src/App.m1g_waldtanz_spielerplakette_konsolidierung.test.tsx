/**
 * Author: rahn
 * Datum: 26.06.2026
 * Version: 1.0
 * Beschreibung: M1g konsolidiert die doppelte Spielerplakette auf /game:
 * - .handkarten-buehne__spielerplakette ist nur noch ein Hand-Panel-Heading
 *   ohne Avatar und ohne Punkte-Anzeige.
 * - .waldtanz-spielerplakette (linke Grid-Plakette, M1cx) bleibt der einzige
 *   Ort für Avatar + Name + Punkte.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { istVerdrahtet } from './test/smokeKetten'

const appCss = readFileSync('src/App.css', 'utf8')

function cssBlockForSelector(selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return appCss.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''
}

describe('M1g Waldtanz-Spielerplakette Konsolidierung', () => {
  it('zeigt Avatar + Punkte nur in der linken Grid-Spielerplakette, nicht doppelt in der Handbühne', () => {
    window.history.pushState({}, '', '/game')
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    render(<App initialZustand={zustand} />)

    // Linke Spielerplakette (M1cx) - die einzige Quelle fuer Avatar + Punkte
    const spielerplakette = screen.getByRole('region', { name: 'Waldtanz-Spielerplakette' })
    expect(spielerplakette).toBeInTheDocument()
    const gridAvatar = within(spielerplakette).getByLabelText('Spieler-Avatar')
    expect(gridAvatar).toBeInTheDocument()
    // Punktzahl-Pille (M1cx rendert "0" als Textinhalt)
    expect(within(spielerplakette).getByLabelText(/Punktzahl:/)).toBeInTheDocument()

    // Handbuehnen-Spielerplakette - Heading ohne Avatar, ohne Punkte-Zahl
    const handkarten = screen.getByRole('region', { name: 'Handkarten' })
    const handbuehne = within(handkarten).getByRole('group', { name: 'Waldtanz-Handbühne' })
    const buehnenPlakette = handbuehne.querySelector('.handkarten-buehne__spielerplakette') as HTMLElement
    expect(buehnenPlakette).toBeInTheDocument()

    // Heading-Text bleibt (Hand-Panel-Label), Punkte UND Avatar duerfen NICHT mehr rendern
    expect(within(buehnenPlakette).getByText(/^Deine Hand —/)).toBeInTheDocument()

    // Avatar-Klasse darf in der Buehne nicht mehr existieren
    expect(buehnenPlakette.querySelector('.handkarten-buehne__avatar')).toBeNull()
    // Punkte-Anzeige in der Buehnen-Spielerplakette: keine isolierte Zahl + "Punkte" mehr
    // (Statuschip "Spielbar: N Karten" und "N Handkarten bereit" bleiben separat ausserhalb der Plakette)
    const punkteInPlakette = buehnenPlakette.querySelectorAll('span')
    const hatPunkteLabel = Array.from(punkteInPlakette).some((el) => /^0 Punkte$/.test(el.textContent?.trim() ?? ''))
    expect(hatPunkteLabel).toBe(false)
  })

  it('CSS-Vertrag: .handkarten-buehne__spielerplakette ist eine Heading-Box, kein Avatar-Container mehr', () => {
    // Keine padding-left fuer Avatar-Glyph mehr
    const block = cssBlockForSelector('.handkarten-buehne__spielerplakette')
    expect(block).toMatch(/display:\s*grid/)
    // Kein gap-left fuer Avatar (40px+ Werte typisch fuer Avatar-Container)
    expect(block).not.toMatch(/padding-left:\s*[2-9]\dpx/)
  })

  it('Smoke-Wiring: smoke:production enthaelt das M1g-Skript', () => {
    expect(istVerdrahtet('m1g_waldtanz_spielerplakette_konsolidierung_smoke.mjs')).toBe(true)
  })
})
