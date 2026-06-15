/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1ah macht die Google-Stitch-Magiekreise als board-nahe Zieloberfläche in der Schlangenlichtung sichtbar.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { ermittleLegaleAktionen } from './engine'
import { ermittleSpielbereiche, erstelleSpieltischMitEineSchlange } from './testUtils'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

describe('M1ah Waldtanz-Magiekreise', () => {
  it('legt nach Handkartenauswahl konkrete Start- und Anlegekreise zwischen Tischkarte und Schlangenbereich in die Lichtung', () => {
    const { zustand, anlegekarteId } = erstelleSpieltischMitEineSchlange('magiekreis-pfad')
    const zielAktionen = ermittleLegaleAktionen(zustand).filter(
      (aktion) => 'handkartenId' in aktion && aktion.handkartenId === anlegekarteId && (aktion.typ === 'NeueSchlangeStarten' || aktion.typ === 'KarteAnlegen'),
    )

    render(<App initialZustand={zustand} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: new RegExp(anlegekarteId) }))

    const schlangenlichtung = within(screen.getByRole('region', { name: 'Waldtanz-Arenastein' })).getByRole('region', { name: 'Schlangenlichtung' })
    const tischkarte = within(schlangenlichtung).getByRole('region', { name: 'Waldtanz-Tischkarte' })
    const magiekreise = within(schlangenlichtung).getByRole('region', { name: 'Waldtanz-Magiekreise' })

    expect(magiekreise).toHaveClass('waldtanz-magiekreise')
    expect(within(magiekreise).getByText('Magiekreise aktiv')).toBeVisible()
    expect(within(magiekreise).getByText(`Zielkarte: ${anlegekarteId}`)).toBeVisible()
    expect(within(magiekreise).getByText(`${zielAktionen.length} Brettwege leuchten`)).toBeVisible()
    expect(within(magiekreise).getByRole('listitem', { name: /Startkreis/ })).toBeVisible()
    expect(within(magiekreise).getByRole('listitem', { name: /Schlangenende/ })).toBeVisible()
    expect(tischkarte.compareDocumentPosition(magiekreise) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(magiekreise.compareDocumentPosition(schlangenbereich) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('liefert den Stitch-CSS-Vertrag für pulsierende Zielkreise statt einer weiteren Textliste', () => {
    expect(cssBlock('waldtanz-magiekreise')).toMatch(/border:\s*3px dashed var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-magiekreise')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-magiekreise__liste')).toMatch(/display:\s*grid/)
    expect(cssBlock('waldtanz-magiekreise__kreis')).toMatch(/aspect-ratio:\s*1/)
    expect(cssBlock('waldtanz-magiekreise__kreis')).toMatch(/border-radius:\s*999px/)
    expect(appCss).toMatch(/\.waldtanz-magiekreise__kreis--aktiv\s*\{[\s\S]*animation:\s*waldtanz-zielkreis-puls/)
    expect(appCss).toMatch(/@keyframes\s+waldtanz-zielkreis-puls/)
  })
})
