/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.1
 * Beschreibung: M1cl hält den board-nahen End-Turn-Zugknopf im ersten /game-Spielbild sichtbar statt ihn unter die Falz zu drücken.
 *
 * # AENDERUNG 22.06.2026: M1da — margin-top des Arenazugs von
 *   clamp(-5.8rem, -9vh, -5rem) auf clamp(-3rem, -7vh, -1.5rem) reduziert,
 *   weil die Hand jetzt max-height 12.1rem hat und ein groesseres negatives
 *   margin-top den Zugknopf ueber die Hand-Unterkante schiebt. Stale-Copy
 *   hier auf den neuen Wert mitgewandert; M1da-Smoke beweist das live.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { istVerdrahtet } from './test/smokeKetten'

const appCss = readFileSync('src/App.css', 'utf8')

const cssBlock = (selector: string) =>
  appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1cl Waldtanz-Erstbild-Zugknopf', () => {
  it('ordnet den board-nahen Zugknopf direkt nach Hand und Unterholz statt unter der sichtbaren Spielkamera ein', () => {
    window.history.pushState({}, '', '/game')
    render(<App />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const hand = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const zugleiste = within(spieltisch).getByLabelText('Zugleiste')
    const arenazug = within(spieltisch).getByRole('region', { name: 'Waldtanz-Zugaktion' })

    expect(within(arenazug).getByText('End Turn')).toBeVisible()
    expect(spieltisch).toContainElement(arenazug)
    expect(hand.compareDocumentPosition(arenazug) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(zugleiste.compareDocumentPosition(arenazug) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('sichert den kompakten 900px-Spielkamera- und Smoke-Vertrag', () => {
    const spielerrahmen = cssBlock('.spielbereich--game-route [class~="waldtanz-spielerrahmen"]')
    const arena = cssBlock('.spielbereich--game-route [class~="waldtanz-arenastein"]')
    const zugleiste = cssBlock('.spielbereich--game-route [class~="waldtanz-zugseitenleiste"]')
    const arenazug = cssBlock('.spielbereich--game-route [class~="waldtanz-arenazug"]')

    // M1d0 22.06.2026: Arenastein hat jetzt grid-area: arenastein statt
    // expliziter Hoehen-Pin. Arenazug ist Teil der benannten Bottom-Row
    // "sp-plakette hand arenazug" mit grid-area: arenazug + width: 100%
    // statt width: min(100%, 22rem) + negatives margin-top.
    // M1d0 22.06.2026: Spielerrahmen auf 6vh komprimiert (vorher 9vh).
    expect(spielerrahmen).toMatch(/max-height:\s*clamp\(3\.6rem,\s*6vh,\s*4\.6rem\)/)
    expect(arena).toMatch(/grid-area:\s*arenastein/)
    expect(arena).not.toMatch(/height:\s*clamp\(32\.5rem,\s*58vh,\s*33rem\)/)
    expect(zugleiste).toMatch(/margin-top:\s*clamp\(0\.25rem,\s*0\.8vh,\s*0\.55rem\)/)
    expect(arenazug).toMatch(/grid-area:\s*arenazug/)
    expect(arenazug).toMatch(/width:\s*100%/)
    expect(arenazug).not.toMatch(/margin-top:\s*clamp\(-3rem,\s*-7vh,\s*-1\.5rem\)/)
    expect(cssBlock('.spielbereich--game-route [class~="waldtanz-arenazug__wartehinweis"]')).toMatch(/display:\s*none/)
    expect(istVerdrahtet('m1cl_erstbild_zugknopf_smoke.mjs')).toBe(true)
  })
})
