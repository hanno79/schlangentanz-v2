/*
Author: rahn
Datum: 04.06.2026
Version: 1.0
Beschreibung: F15 UI-Test für die sichtbare Hervorhebung der empfohlenen Aktion im Aktionenbereich.
*/
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')

function cssRegel(selector: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = appCss.match(new RegExp(`${escapedSelector} \\{([^}]*)\\}`))
  return match?.[1] ?? ''
}

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('F15 Empfohlene Aktion Highlight', () => {
  it('markiert den empfohlenen Aktionsbutton sichtbar ohne den Aktionsnamen zu verfälschen', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    const aktionenBereich = screen.getByRole('region', { name: 'Aktionen' })
    const empfohleneAktion = within(aktionenBereich).getByRole('region', { name: 'Empfohlene Aktion' })
    const button = within(empfohleneAktion).getByRole('button', {
      name: 'Neue Schlange starten mit Karte blau-01',
    })

    expect(within(button).getByText('Empfohlen')).toBeInTheDocument()
    expect(button).toHaveClass('aktions-button--empfohlen')
    expect(button).toHaveClass('aktions-button--hervorgehoben')
    expect(appCss).toContain('.aktions-button--hervorgehoben')
    expect(appCss).toContain('.aktions-button__badge')
    expect(cssRegel('.aktionen-gruppe--empfohlen button.aktions-button--hervorgehoben')).not.toContain('outline:')
    expect(appCss).toContain('.aktionen-gruppe--empfohlen button.aktions-button--hervorgehoben')
    expect(appCss).toContain('.aktions-button--hervorgehoben:focus-visible')
  })
})
