/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M1f beweist das Google-Stitch-Seitenmenü als echten Spielrahmen um die Waldtanz-Arena statt Webformular-/Debuglisten-Gefühl.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

describe('M1f Waldtanz-Seitenmenü', () => {
  it('rahmt das Spielbrett mit einem Stitch-artigen Menü statt einer losen App-Seite', () => {
    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const menue = within(spielbereich).getByRole('complementary', { name: 'Waldtanz-Spielrahmen' })
    const spieltisch = within(spielbereich).getByRole('region', { name: 'Spieltisch' })
    const status = within(spielbereich).getByRole('region', { name: 'Spielstatus' })

    expect(menue).toHaveClass('waldtanz-seitenmenue')
    expect(within(menue).getByRole('heading', { name: 'Schlangentanz' })).toBeInTheDocument()
    expect(within(menue).getByText('Forest Spirit')).toBeInTheDocument()
    expect(within(menue).getByText('Quest').closest('.waldtanz-seitenmenue__punkt')).toHaveAttribute('aria-current', 'true')
    for (const label of ['Karte', 'Quest', 'Inventar', 'Zauber']) {
      expect(within(menue).getByText(label)).toBeInTheDocument()
    }
    expect(menue.querySelectorAll('.waldtanz-seitenmenue__punkt')).toHaveLength(4)
    expect(within(menue).queryByRole('link')).not.toBeInTheDocument()
    expect(within(menue).queryByRole('button')).not.toBeInTheDocument()
    expect(within(menue).getByText('Einstellungen')).toBeInTheDocument()
    expect(within(menue).getByText('Hilfe')).toBeInTheDocument()
    expect(menue.compareDocumentPosition(status) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(status.compareDocumentPosition(spieltisch) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)

    expect(cssBlock('waldtanz-seitenmenue')).toMatch(/grid-area:\s*nav/)
    expect(appCss).toMatch(/\.waldtanz-seitenmenue\s*\{[\s\S]*position:\s*sticky/)
    expect(appCss).toMatch(/\.waldtanz-seitenmenue\s*\{[\s\S]*border-right:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(appCss).toMatch(/\.app-shell\s*\{[\s\S]*overflow-x:\s*clip/)
    expect(appCss).toMatch(/@media \(min-width: 980px\)[\s\S]*grid-template-columns:\s*minmax\(160px,\s*0\.62fr\) minmax\(500px,\s*2\.1fr\) minmax\(160px,\s*0\.62fr\)/)
    expect(appCss).toMatch(/#root\s*\{[\s\S]*width:\s*100%[\s\S]*max-width:\s*none[\s\S]*border-inline:\s*0/)
    expect(appCss).toMatch(/@media \(min-width: 1360px\)[\s\S]*\.spielbereich--waldtanz[\s\S]*"nav\s+status\s+arena\s+spieler"/)
    expect(appCss).toMatch(/@media \(min-width: 1360px\)[\s\S]*\.spielbereich--waldtanz[\s\S]*"nav\s+material\s+arena\s+wertung"/)
  })
})
