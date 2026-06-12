/**
 * Author: rahn
 * Datum: 12.06.2026
 * Version: 1.0
 * Beschreibung: M1c beweist kompakte Google-Stitch-Sidebars: Spielstatus, Spieler, Material und Wertung rahmen das Waldtanz-Brett als HUD statt Debuglisten-Zentrum.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

describe('M1c Stitch-Sidebar-HUD', () => {
  it('macht Status, Spieler, Material und Wertung zu kompakten Waldtanz-HUD-Plaketten um das Brett', () => {
    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const spieltisch = within(spielbereich).getByRole('region', { name: 'Spieltisch' })
    const status = within(spielbereich).getByRole('region', { name: 'Spielstatus' })
    const spieler = within(spielbereich).getByRole('region', { name: 'Spielerübersicht' })
    const material = within(spielbereich).getByRole('region', { name: 'Material und Aufgaben' })
    const wertung = within(spielbereich).getByRole('region', { name: 'Wertung' })

    for (const panel of [status, spieler, material, wertung]) {
      expect(panel).toHaveClass('waldtanz-hud')
      expect(panel.querySelector('.debug-gruppe-entwicklungsdaten')).toBeInTheDocument()
      expect(panel.querySelector('.debug-gruppe-entwicklungsdaten')).not.toBe(panel.firstElementChild)
    }

    const materialDebug = material.querySelector('.debug-gruppe-entwicklungsdaten')
    const wertungDebug = wertung.querySelector('.debug-gruppe-entwicklungsdaten')
    const aufgabenkarten = within(material).getByRole('region', { name: 'Aufgabenkarten' })
    const punktetafel = within(wertung).getByRole('region', { name: 'Punktetafel' })

    expect(materialDebug).toBeInTheDocument()
    expect(wertungDebug).toBeInTheDocument()
    expect(aufgabenkarten.compareDocumentPosition(materialDebug as Element) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(punktetafel.compareDocumentPosition(wertungDebug as Element) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )

    expect(status).toHaveClass('waldtanz-hud--status')
    expect(spieler).toHaveClass('waldtanz-hud--spieler')
    expect(material).toHaveClass('waldtanz-hud--material')
    expect(wertung).toHaveClass('waldtanz-hud--wertung')
    expect(spieltisch).toHaveClass('spielbrett--waldtanz')

    expect(appCss).toMatch(/@media \(min-width: 980px\)[\s\S]*\.spielbereich--waldtanz[\s\S]*"status\s+arena\s+spieler"/)
    expect(appCss).toMatch(/@media \(min-width: 980px\)[\s\S]*\.spielbereich--waldtanz[\s\S]*"material\s+arena\s+wertung"/)

    expect(cssBlock('waldtanz-hud')).toMatch(/border-radius:\s*2rem/)
    expect(cssBlock('waldtanz-hud')).toMatch(/max-height:\s*clamp\(14rem,\s*34vh,\s*24rem\)/)
    expect(cssBlock('waldtanz-hud')).toMatch(/overflow:\s*auto/)
    expect(appCss).toMatch(/\.waldtanz-hud h2::before/)
    expect(appCss).toMatch(/\.waldtanz-hud \.debug-gruppe-entwicklungsdaten\s*\{[^}]*opacity:\s*0\.72/s)
    expect(appCss).toMatch(/\.info-panel--waldtanz-arena\s*\{[^}]*min-height:\s*min\(78vh,\s*820px\)/s)
  })
})
