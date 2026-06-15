/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1ad beweist ein zweispaltiges Waldtanz-Spielfeld: Schlangen werden zur Hauptlichtung, Ablage/Zugspur/Aufgaben zu kompakten Waldobjekten.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function spielbahnenZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.42))
}

describe('M1ad Waldtanz-Spielbahnen', () => {
  it('macht die Schlangenlichtung zur primären Arena und bündelt Brettobjekte als kompakte Waldobjekte', () => {
    render(<App initialZustand={spielbahnenZustand()} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const arenastein = within(spieltisch).getByRole('region', { name: 'Waldtanz-Arenastein' })
    const spielfeld = arenastein.querySelector('.waldtanz-arenastein__spielfeld')
    const schlangenlichtung = within(arenastein).getByRole('region', { name: 'Schlangenlichtung' })
    const waldobjekte = within(arenastein).getByRole('complementary', { name: 'Waldobjekte' })
    const schlangenbereich = within(schlangenlichtung).getByRole('region', { name: 'Schlangenbereich' })
    const ablage = within(waldobjekte).getByRole('region', { name: 'Waldtanz-Ablage' })
    const zugspur = within(waldobjekte).getByRole('region', { name: 'Waldtanz-Zugspur' })
    const aufgabentafel = within(waldobjekte).getByRole('region', { name: 'Waldtanz-Aufgabentafel' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })

    expect(spielfeld).toContainElement(schlangenlichtung)
    expect(spielfeld).toContainElement(waldobjekte)
    expect(schlangenlichtung).toHaveClass('waldtanz-arenastein__schlangenlichtung')
    expect(waldobjekte).toHaveClass('waldtanz-arenastein__waldobjekte')
    expect(schlangenbereich).toBeInTheDocument()
    expect(ablage.compareDocumentPosition(zugspur) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(zugspur.compareDocumentPosition(aufgabentafel) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(schlangenlichtung.compareDocumentPosition(waldobjekte) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(arenastein.compareDocumentPosition(handkarten) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('liefert den Stitch-CSS-Vertrag für breite Lichtung und kompakte Nebenobjekte', () => {
    expect(cssBlock('waldtanz-arenastein__spielfeld')).toMatch(/grid-template-columns:\s*minmax\(0,\s*1\.7fr\)\s*minmax\(12rem,\s*0\.6fr\)/)
    expect(cssBlock('waldtanz-arenastein__schlangenlichtung')).toMatch(/min-height:\s*clamp\(26rem,\s*48vh,\s*38rem\)/)
    expect(cssBlock('waldtanz-arenastein__schlangenlichtung')).toMatch(/radial-gradient/)
    expect(cssBlock('waldtanz-arenastein__waldobjekte')).toMatch(/align-content:\s*start/)
    expect(cssBlock('waldtanz-arenastein__waldobjekte')).toMatch(/max-height:\s*clamp\(26rem,\s*48vh,\s*38rem\)/)
    expect(appCss).toMatch(/@media\s*\(max-width:\s*900px\)[\s\S]*\.waldtanz-arenastein__spielfeld\s*\{[\s\S]*grid-template-columns:\s*1fr/)
  })
})
