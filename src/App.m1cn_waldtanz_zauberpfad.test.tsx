/**
 * Author: rahn
 * Datum: 20.06.2026
 * Version: 1.0
 * Beschreibung: M1cn verbindet ausgewählte Sonderkarten mit konkreten Zauberpfaden in der Waldtanz-Zielspur.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, sonderkarte, schlange } from './engine/__tests__/testHelpers'
import { ermittleSpielbereiche } from './testUtils'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')
const smokeScript = readFileSync('scripts/m1cn_zauberpfad_smoke.mjs', 'utf8')

const cssBlock = (selector: string) =>
  appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

afterEach(() => {
  window.history.pushState({}, '', '/')
})

function farbenfusionZauberpfadZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [sonderkarte('farbenfusion-m1cn', 'Farbenfusion')]
  zustand.spieler[0].schlangen = [schlange([
    farbkarte('blau-m1cn-a', 'Blau', 2),
    farbkarte('blau-m1cn-b', 'Blau', 3),
    farbkarte('rot-m1cn-c', 'Rot', 4),
  ], 'fusion-pfad-m1cn')]
  return zustand
}

function farbendiebZauberpfadZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [sonderkarte('farbendieb-m1cn', 'Farbendieb')]
  zustand.spieler[0].schlangen = [schlange([farbkarte('gruen-m1cn-eigen', 'Grün', 2)], 'eigene-schlange-m1cn')]
  zustand.spieler[1].hand = []
  zustand.spieler[1].schlangen = [schlange([farbkarte('rot-m1cn-beute', 'Rot', 7)], 'gegner-schlange-m1cn')]
  return zustand
}

describe('M1cn Waldtanz-Zauberpfad', () => {
  it('zeigt fuer eine Farbenfusion einen konkreten Rankenring-Zauberpfad neben dem echten Brettobjekt', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={farbenfusionZauberpfadZustand()} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /farbenfusion-m1cn/ }))

    const zielspur = within(schlangenbereich).getByRole('note', { name: 'Waldtanz-Zielspur' })
    const zauberpfade = within(zielspur).getByRole('list', { name: 'Konkrete Zauberpfade' })
    const eintrag = within(zauberpfade).getByRole('listitem', { name: /Rankenring-Zauberpfad/ })

    expect(within(zielspur).getByText('Zauberpfad am Brett')).toBeVisible()
    expect(eintrag).toHaveTextContent('Rankenring')
    expect(eintrag).toHaveTextContent('blau-m1cn-a + blau-m1cn-b')
    expect(eintrag).toHaveTextContent('Eigene Lichtung')
    expect(within(schlangenbereich).getByRole('group', { name: 'Farbenfusion-Rankenring für blau-m1cn-a und blau-m1cn-b' })).toBeVisible()
    expect(within(zielspur).queryByText('Aktionenliste')).toBeNull()
  })

  it('zeigt Schlangenfrass als konkreten Bissspur-Zauberpfad auf der Zielkarte', () => {
    window.history.pushState({}, '', '/game')
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    zustand.spieler[0].hand = [sonderkarte('schlangenfrass-m1cn', 'Schlangenfrass')]
    zustand.spieler[0].schlangen = [schlange([
      farbkarte('rot-bissspur-m1cn', 'Rot', 1),
    ], 'eigene-bissspur-m1cn')]
    render(<App initialZustand={zustand} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /schlangenfrass-m1cn/ }))

    const zielspur = within(schlangenbereich).getByRole('note', { name: 'Waldtanz-Zielspur' })
    const zauberpfade = within(zielspur).getByRole('list', { name: 'Konkrete Zauberpfade' })
    const eintrag = within(zauberpfade).getByRole('listitem', { name: /Bissspur-Zauberpfad/ })

    expect(eintrag).toHaveTextContent('Bissspur')
    expect(eintrag).toHaveTextContent('rot-bissspur-m1cn')
    expect(eintrag).toHaveTextContent('Karte lösen')
    expect(within(schlangenbereich).getByRole('group', { name: 'Schlangenfrass-Bissspur für rot-bissspur-m1cn' })).toBeVisible()
  })

  it('dedupliziert Farbendieb-Einfuegeplaetze zu einem Beutekorb-Zauberpfad mit sichtbarer Platzanzahl', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={farbendiebZauberpfadZustand()} />)

    const { spieltisch, handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /farbendieb-m1cn/ }))

    const zielspur = within(schlangenbereich).getByRole('note', { name: 'Waldtanz-Zielspur' })
    const zauberpfade = within(zielspur).getByRole('list', { name: 'Konkrete Zauberpfade' })
    const eintraege = within(zauberpfade).getAllByRole('listitem')
    const gegnerlichtung = within(spieltisch).getByRole('region', { name: 'Waldtanz-Gegnerlichtung' })
    const beutekorb = within(gegnerlichtung).getByRole('group', { name: 'Farbendieb-Beutekorb für rot-m1cn-beute' })

    expect(eintraege).toHaveLength(1)
    expect(eintraege[0]).toHaveTextContent('Beutekorb')
    expect(eintraege[0]).toHaveTextContent('rot-m1cn-beute')
    expect(eintraege[0]).toHaveTextContent('2 Einfügeplätze')
    expect(beutekorb).toBeVisible()
    expect(within(beutekorb).getAllByRole('button', { name: /Farbendieb-Beutekorb mit Karte farbendieb-m1cn/ })).toHaveLength(2)
  })

  it('verdrahtet den Google-Stitch-Stil und den dauerhaften Browser-Smoke fuer Zauberpfade', () => {
    const pfade = cssBlock('.spielbereich--game-route [class~="waldtanz-zielspur__zauberpfade"]')
    const pfad = cssBlock('.spielbereich--game-route [class~="waldtanz-zielspur__zauberpfad"]')
    const typ = cssBlock('.spielbereich--game-route [class~="waldtanz-zielspur__zauberpfad-typ"]')
    const arena = cssBlock('.spielbereich--game-route .info-panel--waldtanz-arena')
    const spieltischGruppe = cssBlock('.spielbereich--game-route > [class~="spieltisch-gruppe"]')

    expect(spieltischGruppe).toMatch(/z-index:\s*20/)
    expect(arena).toMatch(/position:\s*relative/)
    expect(arena).toMatch(/z-index:\s*20/)
    expect(pfade).toMatch(/display:\s*grid/)
    expect(pfade).toMatch(/grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(10rem,\s*1fr\)\)/)
    expect(pfad).toMatch(/border:\s*2px solid var\(--st-color-border-strong\)/)
    expect(pfad).toMatch(/box-shadow:\s*0 3px 0 var\(--st-color-border-strong\)/)
    expect(typ).toMatch(/font-family:\s*var\(--st-font-headline\)/)
    expect(smokeScript).toContain('M1cn Zauberpfad')
    expect(smokeScript).toContain('Konkrete Zauberpfade')
    expect(packageJson).toContain('node scripts/m1cm_zielwahl_faehrten_smoke.mjs && node scripts/m1cn_zauberpfad_smoke.mjs')
  })
})
