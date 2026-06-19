/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1cb macht die Zielspur nach Kartenwahl zu einem körperlichen Waldtanz-Rankenpfad.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { ermittleLegaleAktionen } from './engine'
import { ermittleSpielbereiche, erstelleSpieltischMitEineSchlange } from './testUtils'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')
const smokeScript = readFileSync('scripts/m1cb_zielranken_smoke.mjs', 'utf8')
const cssBlock = (selector: string) =>
  appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1cb Waldtanz-Zielranken', () => {
  it('zeigt nach Handkartenauswahl einen körperlichen Rankenpfad von Handkarte zu Brettziel', () => {
    window.history.pushState({}, '', '/game')
    const { zustand, anlegekarteId } = erstelleSpieltischMitEineSchlange('zielranke-schlangenpfad')
    const zielAnzahl = ermittleLegaleAktionen(zustand).filter(
      (aktion) => 'handkartenId' in aktion && aktion.handkartenId === anlegekarteId && aktion.typ !== 'PflichtAbwurf',
    ).length

    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: new RegExp(anlegekarteId) }))

    const zielspur = within(schlangenbereich).getByRole('note', { name: 'Waldtanz-Zielspur' })
    const zielranken = within(zielspur).getByRole('list', { name: 'Waldtanz-Zielranken' })
    const rankenpunkte = within(zielranken).getAllByRole('listitem')

    expect(zielspur).toHaveClass('waldtanz-zielspur--rankenpfad')
    expect(within(zielspur).getByText('Rankenpfad aktiv')).toBeVisible()
    expect(within(zielspur).getByText(`Zielkarte: ${anlegekarteId}`)).toBeVisible()
    expect(within(zielspur).getByText(`${zielAnzahl} Brettziele leuchten`)).toBeVisible()
    expect(rankenpunkte).toHaveLength(3)
    expect(rankenpunkte.map((punkt) => punkt.textContent)).toEqual([
      'Handkarte',
      'Waldlichtung',
      'Brettziel',
    ])
    expect(within(schlangenbereich).getAllByRole('status')).toHaveLength(1)
  })

  it('legt den route-sicheren CSS- und Smoke-Vertrag fuer sichtbare Zielranken ab', () => {
    const zielspur = cssBlock('.spielbereich--game-route [class~="waldtanz-zielspur--rankenpfad"]')
    const zielranken = cssBlock('.spielbereich--game-route [class~="waldtanz-zielranken"]')
    const zielranke = cssBlock('.spielbereich--game-route [class~="waldtanz-zielranke"]')
    const zielrankeAfter = cssBlock('.spielbereich--game-route [class~="waldtanz-zielranke"]::after')
    const zielspurText = cssBlock('.spielbereich--game-route [class~="waldtanz-zielspur--rankenpfad"] p')

    expect(zielspur).toMatch(/display:\s*grid/)
    expect(zielspur).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(zielspur).toMatch(/box-shadow:\s*0 6px 0 var\(--st-color-border-strong\)/)
    expect(zielspur).toMatch(/margin-top:\s*6rem/)
    expect(zielranken).toMatch(/grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/)
    expect(zielranken).toMatch(/list-style:\s*none/)
    expect(zielranke).toMatch(/border-radius:\s*999px/)
    expect(zielranke).toMatch(/background:\s*var\(--st-color-secondary-container\)/)
    expect(zielrankeAfter).toMatch(/height:\s*var\(--st-border-width-chunky\)/)
    expect(zielspurText).toMatch(/grid-column:\s*1 \/ -1/)
    expect(smokeScript).toContain('M1cb Zielranken')
    expect(smokeScript).toContain('Waldtanz-Zielranken')
    expect(smokeScript).toContain('statusCount')
    expect(packageJson).toContain('node scripts/m1ca_schlangenlichtung_smoke.mjs && node scripts/m1cb_zielranken_smoke.mjs')
  })
})
