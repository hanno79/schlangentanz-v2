/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1ai macht die Waldtanz-Magiekreise zu direkt klickbaren Brettwegen statt nur Anzeige.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { ermittleSpielbereiche, erstelleSpieltischMitEineSchlange, erstelleSpieltischOhneEigeneSchlangen } from './testUtils'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

describe('M1ai Magiekreis-Brettwege', () => {
  it('startet eine ausgewählte Handkarte direkt über den Startkreis im Waldtanz-Magiekreis', () => {
    const { zustand, legaleStartaktion } = erstelleSpieltischOhneEigeneSchlangen()
    render(<App initialZustand={zustand} />)

    const { handBereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: new RegExp(legaleStartaktion.handkartenId) }))

    const magiekreise = screen.getByRole('region', { name: 'Waldtanz-Magiekreise' })
    const startkreis = within(magiekreise).getByRole('listitem', { name: /Startkreis/ })
    const startButton = within(startkreis).getByRole('button', {
      name: `Magiekreis: Karte ${legaleStartaktion.handkartenId} als neue Schlange starten`,
    })

    expect(startButton).toHaveClass('waldtanz-magiekreise__aktion')
    expect(within(startButton).getByText('In den Kreis legen')).toBeVisible()
    expect(within(startButton).getByText(legaleStartaktion.handkartenId)).toBeVisible()

    fireEvent.click(startButton)

    expect(screen.getByText(`Zuletzt ausgeführt: Neue Schlange starten mit Karte ${legaleStartaktion.handkartenId}`)).toBeVisible()
    expect(within(screen.getByRole('region', { name: 'Schlangenbereich' })).getByRole('list', { name: /Kartenreihe/ })).toBeVisible()
  })

  it('legt eine ausgewählte Handkarte direkt über den Schlangenende-Magiekreis an die bestehende Schlange', () => {
    const { zustand, anlegekarteId, legaleKarteAnlegen } = erstelleSpieltischMitEineSchlange('magiekreis-aktionspfad')
    render(<App initialZustand={zustand} />)

    const { handBereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: new RegExp(anlegekarteId) }))

    const magiekreise = screen.getByRole('region', { name: 'Waldtanz-Magiekreise' })
    const schlangenende = within(magiekreise).getByRole('listitem', { name: /Schlangenende/ })
    const anlegeButton = within(schlangenende).getByRole('button', {
      name: `Magiekreis: Karte ${anlegekarteId} an Schlange magiekreis-aktionspfad ${legaleKarteAnlegen.position} anlegen`,
    })

    expect(anlegeButton).toHaveClass('waldtanz-magiekreise__aktion')
    expect(within(anlegeButton).getByText(legaleKarteAnlegen.position === 'links' ? 'Linkes Ende' : 'Rechtes Ende')).toBeVisible()

    fireEvent.click(anlegeButton)

    expect(screen.getByText(`Zuletzt ausgeführt: Karte ${anlegekarteId} an Schlange magiekreis-aktionspfad ${legaleKarteAnlegen.position} anlegen`)).toBeVisible()
    expect(within(screen.getByRole('list', { name: 'Kartenreihe magiekreis-aktionspfad' })).getByLabelText(new RegExp(`Farbkarte ${anlegekarteId}`))).toBeVisible()
  })

  it('macht aktive Magiekreis-Brettwege sichtbar als drückbare Stitch-Spielobjekte', () => {
    expect(cssBlock('waldtanz-magiekreise__kreis')).toMatch(/position:\s*relative/)
    expect(cssBlock('waldtanz-magiekreise__aktion')).toMatch(/box-sizing:\s*border-box/)
    expect(cssBlock('waldtanz-magiekreise__aktion')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-magiekreise__aktion')).toMatch(/border-radius:\s*999px/)
    expect(cssBlock('waldtanz-magiekreise__aktion')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(cssBlock('waldtanz-magiekreise__aktion')).toMatch(/cursor:\s*pointer/)
    expect(appCss).toMatch(/\.waldtanz-magiekreise__aktion:active\s*\{[\s\S]*transform:\s*translateY\(4px\)/)
  })
})
