/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M1j macht den letzten Spielzug board-nah als Waldtanz-Zugspur sichtbar statt nur im Debugbereich.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { ermittleSpielbereiche } from './testUtils'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function zugspurRegion() {
  const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
  return within(spieltisch).getByRole('region', { name: 'Waldtanz-Zugspur' })
}

describe('M1j Waldtanz-Zugspur', () => {
  it('zeigt den letzten board-nahen Spielzug direkt zwischen Ablage und Schlangenbereich', () => {
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const { spieltisch, handBereich, schlangenbereich } = ermittleSpielbereiche()
    const ablage = within(spieltisch).getByRole('region', { name: 'Waldtanz-Ablage' })
    const zugspur = zugspurRegion()

    expect(zugspur).toHaveClass('waldtanz-zugspur')
    expect(within(zugspur).getByRole('heading', { name: 'Waldtanz-Zugspur' })).toBeInTheDocument()
    expect(within(zugspur).getByText('Noch keine Aktion auf der Lichtung.')).toBeVisible()
    expect(within(zugspur).getByText('Ablage wartet auf Sonderkarten oder Abwürfe.')).toBeVisible()
    expect(ablage.compareDocumentPosition(zugspur) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(zugspur.compareDocumentPosition(schlangenbereich) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)

    fireEvent.click(within(handBereich).getByRole('button', { name: /blau-01/ }))
    fireEvent.click(within(schlangenbereich).getByRole('button', { name: 'Neue Schlange starten' }))

    expect(within(zugspur).getByText('Letzter Spielzug')).toHaveClass('waldtanz-zugspur__label')
    expect(within(zugspur).getByText('Neue Schlange starten mit Karte blau-01')).toBeVisible()
    expect(within(zugspur).getByText('Nächster Schritt: Ausspielphase beenden.')).toBeVisible()
    expect(within(zugspur).getByText('Ablage wartet auf Sonderkarten oder Abwürfe.')).toBeVisible()

    expect(cssBlock('waldtanz-zugspur')).toMatch(/grid-column:\s*1\s*\/\s*-1/)
    expect(cssBlock('waldtanz-zugspur')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-zugspur')).toMatch(/border-radius:\s*2rem/)
    expect(cssBlock('waldtanz-zugspur')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(appCss).toMatch(/\.waldtanz-zugspur__aktion[\s\S]*font-family:\s*var\(--st-font-headline\)/)
  })
})
