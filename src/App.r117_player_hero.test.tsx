/**
 * Author: rahn
 * Datum: 07.06.2026
 * Version: 1.0
 * Beschreibung: R117 UI-Test für einen spielerorientierten Hero ohne interne Projekt-/Toolchain-Texte.
 */

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerAppZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('R117 spielerorientierter Hero', () => {
  it('begrüßt Spielende mit Spielziel statt interner Projekt- und Toolchain-Texte', () => {
    render(<App initialZustand={deterministischerAppZustand()} />)

    const heroTitel = screen.getByRole('heading', { level: 1, name: /^schlangentanz$/i })
    const hero = heroTitel.closest('section')

    expect(hero).not.toBeNull()
    const withinHero = within(hero as HTMLElement)
    expect(withinHero.getByText(/baue farbige schlangen/i)).toBeInTheDocument()
    expect(withinHero.getByText(/erfülle aufgaben/i)).toBeInTheDocument()
    expect(withinHero.getByText(/nutze sonderkarten/i)).toBeInTheDocument()
    expect(withinHero.getByText(/bereit für deine nächste schlange/i)).toBeInTheDocument()
    expect(withinHero.queryByText(/greenfield|github|vercel|claude|codex|freigabe/i)).not.toBeInTheDocument()
  })
})
