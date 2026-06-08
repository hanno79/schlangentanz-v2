/**
 * Author: rahn
 * Datum: 08.06.2026
 * Version: 2.0
 * Beschreibung: F11 UI-Test für visuell aufgeräumte Debuggruppen.
 * Änderung R118: Debug-Summary-Copy entfernt; Assertion auf 0 sichtbare "Debug:"-Texte aktualisiert.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

function erwarteCssRegel(selector: string, eigenschaften: string[]): void {
  const start = appCss.indexOf(`${selector} {`)
  expect(start).toBeGreaterThanOrEqual(0)

  const ende = appCss.indexOf('\n}', start)
  expect(ende).toBeGreaterThan(start)

  const regel = appCss.slice(start, ende)
  for (const eigenschaft of eigenschaften) {
    expect(regel).toContain(eigenschaft)
  }
}

describe('F11 Debuggruppen-Polish', () => {
  it('macht Debuggruppen kompakt und optisch sekundär, ohne sie zu verstecken', () => {
    render(<App initialZustand={deterministischerZustand()} />)

    erwarteCssRegel('.debug-gruppe', [
      'border: 1px dashed rgba(6, 57, 7, 0.32);',
      'border-radius: 12px;',
      'padding: 0.5rem 0.65rem;',
      'background: rgba(236, 255, 227, 0.32);',
      'font-size: 0.9rem;',
    ])
    erwarteCssRegel('.debug-gruppe summary', [
      'display: flex;',
      'align-items: center;',
      'gap: 0.45rem;',
      'list-style: none;',
      'font-size: 0.82rem;',
      'letter-spacing: 0.04em;',
      'text-transform: uppercase;',
    ])
    erwarteCssRegel('.debug-gruppe p', [
      'margin: 0.35rem 0;',
      'font-size: 0.92rem;',
      'line-height: 1.45;',
    ])
    expect(appCss).toContain('.debug-gruppe summary::before')
    expect(appCss).toContain("content: '▾';")
    expect(appCss).toContain('.debug-gruppe:not([open]) summary::before')
    expect(appCss).toContain("content: '▸';")
    erwarteCssRegel('.debug-gruppe summary::-webkit-details-marker', [
      'display: none;',
    ])

    expect(screen.queryAllByText(/^Debug:/)).toHaveLength(0)
    expect(screen.getByText(/Aktueller Spielschritt:/)).toBeVisible()
    expect(screen.getByRole('region', { name: 'Zugfortschritt' })).toBeVisible()
  })
})
