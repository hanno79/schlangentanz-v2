/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1ak legt das Pop-/Sternenfeedback nach Kartenaktionen direkt in die Waldtanz-Schlangenlichtung.
 */

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import type { Spielzustand } from './engine'
import { ermittleSpielbereiche } from './testUtils'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function startZustand(): Spielzustand {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('M1ak Waldtanz-Kartenpop in der Lichtung', () => {
  it('zeigt das erfolgreiche Schnapp-Feedback nach einer Magiekreis-Aktion in der Schlangenlichtung statt in den Waldobjekten', () => {
    render(<App initialZustand={startZustand()} />)

    const { handBereich } = ermittleSpielbereiche()
    const handkarte = within(handBereich).getAllByRole('button', { name: /Spielbar jetzt/ })[0]
    const handkartenId = handkarte.textContent?.match(/(?:blau|rot|gelb|violett|braun|gruen)-\d+/)?.[0]
    expect(handkartenId).toBeTruthy()

    fireEvent.click(handkarte)
    const magiekreiseVorher = screen.getByRole('region', { name: 'Waldtanz-Magiekreise' })
    const startButton = within(magiekreiseVorher).getByRole('button', {
      name: `Magiekreis: Karte ${handkartenId} als neue Schlange starten`,
    })
    fireEvent.click(startButton)

    const schlangenlichtung = screen.getByRole('region', { name: 'Schlangenlichtung' })
    const tischkarte = within(schlangenlichtung).getByRole('region', { name: 'Waldtanz-Tischkarte' })
    const kartenpop = within(schlangenlichtung).getByRole('status', { name: 'Waldtanz-Kartenpop' })
    const magiekreiseNachher = within(schlangenlichtung).getByRole('region', { name: 'Waldtanz-Magiekreise' })
    const waldobjekte = screen.getByRole('complementary', { name: 'Waldobjekte' })

    expect(kartenpop).toHaveClass('waldtanz-kartenpop')
    expect(within(kartenpop).getByText('Pop!')).toBeVisible()
    expect(within(kartenpop).getByText('Karte geschnappt')).toBeVisible()
    expect(within(kartenpop).getByText(handkartenId as string)).toHaveClass('waldtanz-kartenpop__karte')
    expect(within(kartenpop).getAllByText('✦')).toHaveLength(3)
    expect(within(waldobjekte).queryByRole('status', { name: 'Waldtanz-Kartenpop' })).toBeNull()
    expect(tischkarte.compareDocumentPosition(kartenpop) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(kartenpop.compareDocumentPosition(magiekreiseNachher) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('legt den Lichtungs-Snap als eigene Stitch-Spielobjekt-Zeile mit Sternanimation und Reduced-Motion-Schutz ab', () => {
    expect(cssBlock('waldtanz-arenastein__schlangenlichtung')).toMatch(/grid-template-rows:\s*auto auto minmax\(0,\s*1fr\)/)
    expect(appCss).toMatch(/\.waldtanz-arenastein__schlangenlichtung:has\(\.waldtanz-kartenpop\)\s*\{[\s\S]*grid-template-rows:\s*auto auto auto minmax\(0,\s*1fr\)/)
    expect(appCss).toMatch(/\.waldtanz-arenastein__schlangenlichtung \.waldtanz-kartenpop\s*\{[\s\S]*width:\s*min\(100%,\s*24rem\)/)
    expect(appCss).toMatch(/\.waldtanz-arenastein__schlangenlichtung \.waldtanz-kartenpop\s*\{[\s\S]*box-shadow:\s*0 6px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-kartenpop')).toMatch(/animation:\s*waldtanz-kartenpop-springt/)
    expect(cssBlock('waldtanz-kartenpop__stern')).toMatch(/animation:\s*waldtanz-stern-funkelt/)
    expect(appCss).toMatch(/@media \(prefers-reduced-motion:\s*reduce\) \{[\s\S]*\.waldtanz-kartenpop,[\s\S]*\.waldtanz-kartenpop__stern \{[\s\S]*animation:\s*none/)
  })

  it('bewahrt auf /game die Kartenpop-Reihenfolge zwischen Tischkarte und Magiekreisen auch im kompakten Erstbild', () => {
    expect(appCss).toMatch(/\.spielbereich--game-route \[class~="waldtanz-kartenpop"\]\s*\{[\s\S]*grid-column:\s*1\s*\/\s*-1[\s\S]*grid-row:\s*2/)
    expect(appCss).toMatch(/\.spielbereich--game-route \[class~="waldtanz-arenastein__schlangenlichtung"\]:has\(\.waldtanz-kartenpop\) \[class~="waldtanz-magiekreise"\]\s*\{[\s\S]*grid-row:\s*3/)
    expect(appCss).toMatch(/\.spielbereich--game-route \[class~="waldtanz-arenastein__schlangenlichtung"\]:has\(\.waldtanz-kartenpop\) \[class~="schlangenbereich--waldlichtung"\]\s*\{[\s\S]*grid-row:\s*1\s*\/\s*span 3/)
  })
})
