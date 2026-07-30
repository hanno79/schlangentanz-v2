/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M2j macht Farbenschutz als körperliches Waldtanz-Schutzschild auf der Zielschlange spielbar.
 */

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import type { FarbkarteInfo, SonderkarteInfo } from './engine'
import { ermittleSpielbereiche } from './testUtils'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

const farbkarte = (id: string, farbe: FarbkarteInfo['farbe'], punkte: number): FarbkarteInfo => ({ typ: 'Farbkarte', id, farbe, punkte })
const sonderkarte = (id: string, name: string): SonderkarteInfo => ({ typ: 'Sonderkarte', id, name })

function farbenschutzZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [sonderkarte('farbenschutz-m2j', 'Farbenschutz')]
  zustand.spieler[0].schlangen = [{
    id: 'schutzpfad-m2j',
    zustand: 'aktiv',
    karten: [farbkarte('gruen-m2j-a', 'Grün', 3), farbkarte('gruen-m2j-b', 'Grün', 4)],
  }]
  return zustand
}

describe('M2j Farbenschutz-Schutzschild', () => {
  it('zeigt eine ausgewählte Farbenschutzkarte als Schutzschild direkt auf der Zielschlange und führt sie aus', () => {
    render(<App initialZustand={farbenschutzZustand()} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const handkarte = within(handBereich).getByRole('button', { name: /farbenschutz-m2j/ })
    const zielSchlange = within(schlangenbereich).getByRole('button', { name: /Schlange schutzpfad-m2j/ })

    expect(within(zielSchlange).queryByRole('button', { name: /Farbenschutz im Schlangenbereich/ })).toBeNull()
    fireEvent.click(handkarte)

    const schutzschild = within(zielSchlange).getByRole('button', {
      name: 'Farbenschutz im Schlangenbereich mit Karte farbenschutz-m2j auf Schlange schutzpfad-m2j',
    })
    expect(schutzschild).toHaveClass('schlangekarte__schutzschild')
    expect(within(schutzschild).getByText('Schutzschild')).toBeVisible()
    expect(within(schutzschild).getByText('farbenschutz-m2j')).toBeVisible()
    expect(within(schutzschild).getByText('schutzpfad-m2j')).toBeVisible()
    expect(within(schutzschild).getByText('Klick legt den Schild auf diese Schlange.')).toBeVisible()
    expect(within(zielSchlange).queryByText('Farbenschutz hier spielen')).toBeNull()

    fireEvent.click(schutzschild)

    expect(screen.getByText(/Zuletzt ausgeführt: Farbenschutz/)).toBeVisible()
    expect(within(schlangenbereich).getByText('Status: geschützt')).toBeVisible()
  })

  it('nutzt den Google-Stitch-Schutzschildstil statt eines Textbuttons', () => {
    expect(cssBlock('schlangekarte__schutzschild')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(appCss).toMatch(/--st-radius-xl:\s*3rem/)
    expect(cssBlock('schlangekarte__schutzschild')).toMatch(/border-radius:\s*var\(--st-radius-xl\)/)
    expect(cssBlock('schlangekarte__schutzschild')).toMatch(/box-shadow:\s*0 5px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('schlangekarte__schutzschild')).toMatch(/background:\s*radial-gradient/)
    expect(cssBlock('schlangekarte__schutzschild-card')).toMatch(/border:\s*2px solid var\(--st-color-border-strong\)/)
    expect(cssBlock('schlangekarte__schutzschild-label')).toMatch(/font-family:\s*var\(--st-font-headline\)/)
    expect(appCss).not.toContain('--st-font-heading')
    expect(cssBlock('schlangekarte__schutzschild-chip')).toMatch(/border-radius:\s*999px/)
  })
})
