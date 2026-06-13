/**
 * Author: rahn
 * Datum: 13.06.2026
 * Version: 1.0
 * Beschreibung: M4 beweist den Google-Stitch-Regelbuch-Vertical: Das Schlangenbuch macht Regeln als spielerisches Pop-up-Buch sichtbar statt als Debugtext.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')

describe('M4 Schlangenbuch Regeln', () => {
  it('zeigt ein Stitch-inspiriertes Schlangenbuch mit spielnahen Regelkarten neben Lobby und Waldtanz-Brett', () => {
    render(<App />)

    const lobby = screen.getByRole('region', { name: 'Das sonnige Nest' })
    const schlangenbuch = within(lobby).getByRole('region', { name: 'Das Schlangenbuch' })

    expect(schlangenbuch).toHaveClass('schlangenbuch')
    expect(within(schlangenbuch).getByRole('heading', { name: 'Das Schlangenbuch' })).toBeInTheDocument()
    expect(within(schlangenbuch).getByText('Regeln als Wald-Pop-up-Buch')).toBeInTheDocument()

    const tabs = within(schlangenbuch).getAllByRole('listitem')
    expect(tabs.map(tab => tab.textContent)).toEqual(['Vorbereitung', 'Zugablauf', 'Wertung'])

    const seiten = schlangenbuch.querySelectorAll('.schlangenbuch__seite')
    expect(seiten).toHaveLength(2)
    expect(within(schlangenbuch).getByText('1. Karte wählen')).toBeInTheDocument()
    expect(within(schlangenbuch).getByText('2. Schlange bauen')).toBeInTheDocument()
    expect(within(schlangenbuch).getByText('3. Aufgabe erfüllen')).toBeInTheDocument()
    expect(within(schlangenbuch).getByText(/Lege Zahlenkarten direkt an passende Schlangen/i)).toBeInTheDocument()
    expect(within(schlangenbuch).getByText(/Aufgaben bringen Punkte/i)).toBeInTheDocument()

    expect(screen.getByRole('region', { name: 'Spieltisch' })).toHaveClass('spielbrett--waldtanz')
  })

  it('verankert das Regelbuch visuell als Pop-up-Buch mit Tabs, Doppelseite und Page-Curl', () => {
    expect(appCss).toMatch(/\.schlangenbuch\s*\{[^}]*border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/s)
    expect(appCss).toMatch(/\.schlangenbuch\s*\{[^}]*border-radius:\s*3rem/s)
    expect(appCss).toMatch(/\.schlangenbuch__tabs\s*\{[^}]*list-style:\s*none/s)
    expect(appCss).toMatch(/\.schlangenbuch__seiten\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s)
    expect(appCss).toMatch(/\.schlangenbuch__seite\s*\{[^}]*background:\s*#fffdf0/s)
    expect(appCss).toMatch(/\.schlangenbuch__seite--rechts::after\s*\{[^}]*linear-gradient\(135deg, transparent 50%, #ffffff 50%\)/s)
    expect(appCss).toMatch(/\.regelkarte\s*\{[^}]*box-shadow:\s*4px 4px 0 var\(--st-color-border-strong\)/s)
  })
})
