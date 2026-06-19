/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1ca macht die zentrale Schlangenlichtung zur spielbaren Brettspur und demotet leere Gegnerlisten.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import type { FarbkarteInfo, SonderkarteInfo } from './engine'

const farbkarte = (id: string, farbe: FarbkarteInfo['farbe'], punkte: number): FarbkarteInfo => ({ typ: 'Farbkarte', id, farbe, punkte })
const sonderkarte = (id: string, name: string): SonderkarteInfo => ({ typ: 'Sonderkarte', id, name })

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')
const smokeScript = readFileSync('scripts/m1ca_schlangenlichtung_smoke.mjs', 'utf8')
const cssBlock = (selector: string) =>
  appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1ca Waldtanz-Schlangenlichtung', () => {
  it('macht die eigenen Schlangen auf /game zur zentralen Brettspur statt zu einem generischen Listenpanel', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(4, () => 0.999999))} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const eigeneSchlangen = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const startkreis = within(eigeneSchlangen).getByRole('button', { name: 'Neue Schlange starten' })

    expect(eigeneSchlangen).toHaveClass('schlangen-gruppe--eigene-lichtung')
    expect(within(eigeneSchlangen).getByText('Leuchtender Startplatz')).toBeVisible()
    fireEvent.click(startkreis)
    expect(within(eigeneSchlangen).getByRole('button', { name: /Schlange schlange-/ })).toHaveClass('schlangekarte--eigene')
  })

  it('haelt gegnerische Schlangen-Zielbuttons sichtbar, sobald eine Sonderkarte ein Gegnerziel braucht', () => {
    window.history.pushState({}, '', '/game')
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    zustand.spieler[0].hand = [sonderkarte('schlangenblockade-m1ca', 'Schlangenblockade')]
    zustand.spieler[0].schlangen = [{ id: 'eigene-schlange-m1ca', zustand: 'aktiv', karten: [farbkarte('gruen-m1ca-eigen', 'Grün', 2)] }]
    zustand.spieler[1].hand = []
    zustand.spieler[1].schlangen = [{ id: 'gegner-schlange-m1ca', zustand: 'aktiv', karten: [farbkarte('rot-m1ca-ziel', 'Rot', 5)] }]
    render(<App initialZustand={zustand} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const gegnerischeSchlangen = within(schlangenbereich).getByRole('region', { name: 'Gegnerische Schlangen' })

    expect(gegnerischeSchlangen).toHaveClass('schlangen-gruppe--gegnerfelder')
    fireEvent.click(within(handkarten).getByRole('button', { name: /schlangenblockade-m1ca/ }))
    expect(within(gegnerischeSchlangen).getByRole('button', {
      name: 'Schlangenblockade-Fessel mit Karte schlangenblockade-m1ca um Schlange gegner-schlange-m1ca legen',
    })).toBeVisible()
  })

  it('legt den route-sicheren CSS- und Smoke-Vertrag fuer Schlangenlichtung und leere Gegnerlisten ab', () => {
    const eigeneLichtung = cssBlock('.spielbereich--game-route [class~="schlangen-gruppe--eigene-lichtung"]')
    const eigeneTitel = cssBlock('.spielbereich--game-route [class~="schlangen-gruppe--eigene-lichtung"] > h5')
    const eigeneHinweise = cssBlock('.spielbereich--game-route [class~="schlangen-gruppe--eigene-lichtung"] > [class~="schlangen-drop-hinweis"]')
    const eigeneLeiste = cssBlock('.spielbereich--game-route [class~="schlangen-gruppe--eigene-lichtung"] [class~="schlangenleiste"]')
    const leereGegner = cssBlock('.spielbereich--game-route [class~="schlangen-gruppe--gegnerfelder"]:not(:has(button))')
    const zielGegner = cssBlock('.spielbereich--game-route [class~="schlangen-gruppe--gegnerfelder"]:has(button)')
    const kompakteAnlegeplaetze = cssBlock('.spielbereich--game-route [class~="schlangen-gruppe--eigene-lichtung"] [class~="schlangekarte__anlegeplaetze"]:not([class~="schlangekarte__anlegeplaetze--vorschau"])')
    const kompakteSchlange = cssBlock('.spielbereich--game-route [class~="schlangen-gruppe--eigene-lichtung"] [class~="schlangekarte--eigene"]')
    const kompakteKartenreihe = cssBlock('.spielbereich--game-route [class~="schlangen-gruppe--eigene-lichtung"] [class~="schlangekarte--eigene"] > [class~="schlangekarte__kartenreihe"]')
    const spaeteEigeneLichtung = cssBlock('.spielbereich--game-route [class~="schlangenbereich--waldlichtung"] [class~="schlangen-gruppe"][class~="schlangen-gruppe--eigene-lichtung"]:first-of-type')
    const eigeneSchlangenLichtung = cssBlock('.spielbereich--game-route [class~="schlangenbereich--waldlichtung"] [class~="schlangen-gruppe"][class~="schlangen-gruppe--eigene-lichtung"]:first-of-type:has([class~="schlangekarte--eigene"])')

    expect(eigeneLichtung).toMatch(/display:\s*grid/)
    expect(eigeneLichtung).toMatch(/grid-template-columns:\s*minmax\(12rem,\s*0\.58fr\) minmax\(13rem,\s*1fr\)/)
    expect(eigeneLichtung).toMatch(/grid-template-areas:\s*"titel titel"\s*"startgarten startzone"/)
    expect(eigeneLichtung).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(spaeteEigeneLichtung).toMatch(/gap:\s*0\.45rem 0\.65rem/)
    expect(spaeteEigeneLichtung).toMatch(/padding:\s*0\.55rem 0\.65rem/)
    expect(spaeteEigeneLichtung).toMatch(/radial-gradient/)
    expect(spaeteEigeneLichtung).toMatch(/box-shadow:\s*0 5px 0 var\(--st-color-border-strong\)/)
    expect(spaeteEigeneLichtung).toMatch(/transform:\s*translateY\(0\)/)
    expect(eigeneSchlangenLichtung).toMatch(/transform:\s*translateY\(-8rem\)/)
    expect(eigeneTitel).toMatch(/grid-column:\s*1 \/ -1/)
    expect(eigeneHinweise).toMatch(/position:\s*absolute/)
    expect(eigeneLeiste).toMatch(/grid-column:\s*2/)
    expect(eigeneLeiste).toMatch(/grid-row:\s*2/)
    expect(eigeneLeiste).toMatch(/transform:\s*translateY\(-6\.3rem\)/)
    expect(kompakteAnlegeplaetze).toMatch(/display:\s*none/)
    expect(kompakteSchlange).toMatch(/grid-template-areas:/)
    expect(kompakteSchlange).toMatch(/"typ pfad wertung"/)
    expect(kompakteSchlange).toMatch(/min-height:\s*0/)
    expect(kompakteKartenreihe).toMatch(/grid-area:\s*pfad/)
    expect(leereGegner).toMatch(/display:\s*none/)
    expect(zielGegner).toMatch(/display:\s*grid/)
    expect(smokeScript).toContain('M1ca Schlangenlichtung')
    expect(smokeScript).toContain('gegnerDisplay !== \'none\'')
    expect(smokeScript).toContain('elementFromPoint')
    expect(smokeScript).toContain('probeHits: snakeProben')
    expect(packageJson).toContain('node scripts/m1bz_gegner_hud_smoke.mjs && node scripts/m1ca_schlangenlichtung_smoke.mjs')
  })
})
