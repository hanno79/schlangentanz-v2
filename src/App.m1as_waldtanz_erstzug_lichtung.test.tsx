/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1as hält Tischkarte, Magiekreise, Startkreis/Schlangenbereich und Hand im ersten Waldtanz-Spielbild sichtbar.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selector: string) => appCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

describe('M1as Waldtanz-Erstzug-Lichtung', () => {
  it('ordnet das erste Spielbild als kompakte Lichtung mit sichtbarem Schlangenbereich vor der Hand', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const lichtung = within(spieltisch).getByRole('region', { name: 'Schlangenlichtung' })
    const tischkarte = within(lichtung).getByRole('region', { name: 'Waldtanz-Tischkarte' })
    const magiekreise = within(lichtung).getByRole('region', { name: 'Waldtanz-Magiekreise' })
    const schlangenbereich = within(lichtung).getByRole('region', { name: 'Schlangenbereich' })
    const handkarten = within(spieltisch).getByRole('region', { name: 'Handkarten' })

    expect(within(schlangenbereich).getByText('Neue Schlange starten')).toBeVisible()
    expect(tischkarte.compareDocumentPosition(magiekreise) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(magiekreise.compareDocumentPosition(schlangenbereich) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(schlangenbereich.compareDocumentPosition(handkarten) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('kompaktiert die /game-Lichtung, damit Startkreis und Hand ohne innere Scrollsuche im Erstbild liegen', () => {
    expect(cssBlock('.spielbereich--game-route [class~="waldtanz-arenastein__spielfeld"]')).toMatch(/grid-template-columns:\s*minmax\(0,\s*2\.55fr\) minmax\(9\.5rem,\s*0\.65fr\)/)
    // AENDERUNG 25.06.2026 (M1dj): Schlangenlichtung ist jetzt eine Brettlandschaft
    // mit EIGENER Spalten-Aufteilung. Die uebergeordnete Section
    // .waldtanz-lichtungsbrett ist single-column (1fr) und traegt nur
    // grid-template-rows. Die innere Brett-Aufteilung
    // (Tischkarte | Magiekreise | Schlangen) lebt jetzt in
    // .waldtanz-schlangenlichtung__schlangen als 3-Column-Grid mit benannten
    // Areas (tischkarte/magiekreise/schlangen).
    const lichtungBlock = cssBlock('.spielbereich--game-route [class~="waldtanz-lichtungsbrett"]')
    expect(lichtungBlock).toMatch(/grid-template-columns:\s*minmax\(0,\s*1fr\)/)
    expect(lichtungBlock).not.toMatch(/grid-template-areas:\s*"tisch\s+magiekreise/)
    expect(lichtungBlock).not.toMatch(/grid-template-areas:\s*"schlangen\s+schlangen"/)
    // Innere Brett-Aufteilung ist eine 3-Column-Area mit tischkarte/magiekreise/schlangen.
    // Der cssBlock-Helper im M1as-Test ist eine Single-Selector-Regex; wir
    // lesen die innere __schlangen-Regel-Bloecke direkt mit einem Descendant-Helper.
    const schlangenInner = (() => {
      const match = appCss.match(/\.waldtanz-schlangenlichtung__schlangen\s*\{([^}]*)\}/)
      return match?.[1] ?? ''
    })()
    expect(schlangenInner).toMatch(/grid-template-columns:\s*minmax\(7rem,\s*1fr\)\s+minmax\(14rem,\s*2fr\)\s+minmax\(7rem,\s*1fr\)/)
    expect(schlangenInner).toMatch(/grid-template-areas:\s*"tischkarte magiekreise magiekreise"/)
    expect(schlangenInner).toMatch(/"tischkarte schlangen schlangen"/)
    // Die Schlangen-Element-Areas sitzen in der inneren __schlangen-Klasse,
    // nicht mehr in der uebergeordneten Section-Lichtungsbrett-Regel.
    expect(cssBlock('.spielbereich--game-route [class~="waldtanz-magiekreise__liste"]')).toMatch(/grid-template-columns:\s*repeat\(3,\s*minmax\(4\.8rem,\s*1fr\)\)/)
    expect(cssBlock('.spielbereich--game-route [class~="waldtanz-magiekreise__kreis"]')).toMatch(/min-height:\s*clamp\(4\.9rem,\s*9vw,\s*6\.75rem\)/)
    expect(cssBlock('.spielbereich--game-route [class~="waldtanz-tischkarte"]')).toMatch(/width:\s*min\(100%,\s*16rem\)/)
    // Descendant-Asserts: wir suchen die letzte top-level Regel mit dem vollen
    // Selector-Pfad via Direkt-Regex, weil der Single-Selector cssBlock-Helper
    // Descendants nicht unterstuetzt.
    const tischkarteInSchlangen = appCss.match(/\.waldtanz-schlangenlichtung__schlangen\s+\.waldtanz-tischkarte\s*\{([^}]*)\}/)
    expect(tischkarteInSchlangen, 'Regel .__schlangen .waldtanz-tischkarte muss existieren').toBeTruthy()
    expect(tischkarteInSchlangen![1]).toMatch(/grid-area:\s*tischkarte/)
    const magiekreiseInSchlangen = appCss.match(/\.waldtanz-schlangenlichtung__schlangen\s+\.waldtanz-magiekreise\s*\{([^}]*)\}/)
    expect(magiekreiseInSchlangen, 'Regel .__schlangen .waldtanz-magiekreise muss existieren').toBeTruthy()
    expect(magiekreiseInSchlangen![1]).toMatch(/grid-area:\s*magiekreise/)
    expect(cssBlock('.spielbereich--game-route [class~="schlangenbereich--waldlichtung"]')).toMatch(/min-height:\s*7\.5rem/)
    const schlangenInSchlangen = appCss.match(/\.waldtanz-schlangenlichtung__schlangen\s+\.schlangenbereich\s*\{([^}]*)\}/)
    expect(schlangenInSchlangen, 'Regel .__schlangen .schlangenbereich muss existieren').toBeTruthy()
    expect(schlangenInSchlangen![1]).toMatch(/grid-area:\s*schlangen/)
    expect(cssBlock('.spielbereich--game-route [class~="schlangenbereich--waldlichtung"]')).toMatch(/overflow:\s*visible/)
  })
})
