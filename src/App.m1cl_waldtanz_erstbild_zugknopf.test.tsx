/**
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1cl hält den board-nahen End-Turn-Zugknopf im ersten /game-Spielbild sichtbar statt ihn unter die Falz zu drücken.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')
const packageJson = readFileSync('package.json', 'utf8')

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

    expect(spielerrahmen).toMatch(/max-height:\s*clamp\(4\.8rem,\s*9vh,\s*5\.8rem\)/)
    expect(arena).toMatch(/height:\s*clamp\(32\.5rem,\s*58vh,\s*33rem\)/)
    expect(zugleiste).toMatch(/margin-top:\s*clamp\(0\.25rem,\s*0\.8vh,\s*0\.55rem\)/)
    expect(arenazug).toMatch(/width:\s*min\(100%,\s*22rem\)/)
    expect(arenazug).toMatch(/margin-top:\s*clamp\(-5\.8rem,\s*-9vh,\s*-5rem\)/)
    expect(cssBlock('.spielbereich--game-route [class~="waldtanz-arenazug__wartehinweis"]')).toMatch(/display:\s*none/)
    expect(packageJson).toContain('node scripts/m1cl_erstbild_zugknopf_smoke.mjs')
  })
})
