/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1ap ordnet die generische Aktionsliste auf /game als Brett-Fallback unter, damit Arena und Handkarten primär bleiben.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

const appCss = readFileSync('src/App.css', 'utf8')

function cssBlockForSelector(selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return appCss.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''
}

describe('M1ap Aktionsfallback unter dem Brett', () => {
  it('macht auf /game nur Schnellzug und die Brett-Zugaktion primär und klappt die lange Aktionsliste als Fallback ein', () => {
    window.history.pushState({}, '', '/game')
    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const aktionen = within(spielbereich).getByRole('region', { name: 'Aktionen' })
    const schnellzug = aktionen.querySelector('.aktionen-dock__schnellzug') as HTMLElement
    const fallback = aktionen.querySelector('details.aktionen-fallback') as HTMLDetailsElement

    expect(aktionen).toHaveClass('aktionen-panel--brettfallback')
    expect(within(schnellzug).getByRole('region', { name: 'Empfohlene Aktion' })).toBeVisible()
    expect(within(schnellzug).queryByRole('region', { name: 'Phasenaktion' })).toBeNull()
    expect(screen.getByRole('region', { name: 'Waldtanz-Zugaktion' })).toBeVisible()
    expect(fallback).toBeInTheDocument()
    expect(fallback.open).toBe(false)
    expect(within(fallback).getByText('Brett-Fallback: weitere Aktionen und Regeln')).toBeVisible()
    expect(within(fallback).getByRole('region', { name: 'Weitere Aktionen' })).toBeInTheDocument()
    expect(within(fallback).getByRole('heading', { name: 'Phasenregeln' })).toBeInTheDocument()

    const compactBlock = cssBlockForSelector('.spielbereich--game-route [class~="aktionen-panel--brettfallback"]')
    expect(compactBlock).toMatch(/margin-top:\s*0/)
    expect(compactBlock).toMatch(/padding:\s*0\.75rem/)

    const fallbackBlock = cssBlockForSelector('.aktionen-panel--brettfallback [class~="aktionen-fallback"]')
    expect(fallbackBlock).toMatch(/border:\s*2px dashed var\(--st-color-border-strong\)/)
    expect(fallbackBlock).toMatch(/border-radius:\s*1\.5rem/)
  })

  it('bewahrt außerhalb von /game die offene Aktionsliste für bestehende Einstiegs- und Regressionstests', () => {
    window.history.pushState({}, '', '/')
    render(<App />)

    const spielbereich = screen.getByRole('region', { name: 'Spielbereich' })
    const aktionen = within(spielbereich).getByRole('region', { name: 'Aktionen' })

    expect(aktionen).not.toHaveClass('aktionen-panel--brettfallback')
    expect(aktionen.querySelector('details.aktionen-fallback')).toBeNull()
    expect(within(aktionen).getByRole('region', { name: 'Weitere Aktionen' })).toBeVisible()
  })
})
