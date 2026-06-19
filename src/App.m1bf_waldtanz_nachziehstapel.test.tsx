/**
 * Author: rahn
 * Datum: 18.06.2026
 * Version: 1.0
 * Beschreibung: M1bf macht den Nachziehstapel als physisches Waldobjekt im Stitch-Spielbrett sichtbar.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`${selektor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

describe('M1bf Waldtanz-Nachziehstapel', () => {
  it('zeigt den Nachziehstapel als körperliches Deck-Objekt neben Ablage und Questtafel', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const arenastein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const waldobjekte = within(arenastein).getByRole('complementary', { name: 'Waldobjekte' })
    const nachziehstapel = within(waldobjekte).getByRole('region', { name: 'Waldtanz-Nachziehstapel' })
    const ablage = within(waldobjekte).getByRole('region', { name: 'Waldtanz-Ablage' })
    const zugspur = within(waldobjekte).getByRole('region', { name: 'Waldtanz-Zugspur' })
    const aufgabentafel = within(waldobjekte).getByRole('region', { name: 'Waldtanz-Aufgabentafel' })

    expect(nachziehstapel).toHaveClass('waldtanz-nachziehstapel')
    expect(within(nachziehstapel).getByRole('heading', { name: 'Waldtanz-Nachziehstapel' })).toBeVisible()
    expect(within(nachziehstapel).getByText(/Nachziehstapel: \d+ Karten/)).toHaveClass('waldtanz-nachziehstapel__zaehler')
    expect(within(nachziehstapel).getByRole('img', { name: 'Verdeckter Nachziehstapel als Kartenrücken' })).toHaveClass('waldtanz-nachziehstapel__kartenruecken')
    expect(within(nachziehstapel).getByText('Ziehstapel')).toHaveClass('waldtanz-nachziehstapel__badge')
    expect(within(nachziehstapel).getByText('Neue Handkarten warten als Waldkarten-Stapel.')).toBeVisible()
    const taschenkopf = waldobjekte.firstElementChild as HTMLElement
    expect(taschenkopf).toHaveClass('waldtanz-waldtaschen__kopf')
    expect(within(taschenkopf).getByRole('heading', { name: 'Waldtaschen' })).toBeVisible()
    expect(waldobjekte.children[1]).toBe(nachziehstapel)
    expect(nachziehstapel.compareDocumentPosition(ablage) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(ablage.compareDocumentPosition(zugspur) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(zugspur.compareDocumentPosition(aufgabentafel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(ablage.compareDocumentPosition(aufgabentafel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('legt den Stitch-CSS-Vertrag fuer den physischen Ziehstapel ab', () => {
    expect(cssBlock('.waldtanz-nachziehstapel')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('.waldtanz-nachziehstapel')).toMatch(/border-radius:\s*var\(--st-radius-lg\)/)
    expect(cssBlock('.waldtanz-nachziehstapel')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('.waldtanz-nachziehstapel__kartenruecken')).toMatch(/aspect-ratio:\s*2\s*\/\s*3/)
    expect(cssBlock('.waldtanz-nachziehstapel__kartenruecken')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('.waldtanz-nachziehstapel__kartenruecken')).toMatch(/box-shadow:\s*0 5px 0 var\(--st-color-border-strong\)/)
    expect(appCss).toMatch(/\.waldtanz-nachziehstapel__kartenruecken::before\s*\{[^}]*content:\s*'🍃'/s)
    expect(appCss).toMatch(/\.waldtanz-nachziehstapel__kartenruecken::after\s*\{[^}]*content:\s*''/s)
  })
})
