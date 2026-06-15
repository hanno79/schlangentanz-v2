/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1u macht das Starten einer neuen Schlange als Magic-Circle-Startkreis im Waldtanz-Brett greifbar.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { ermittleSpielbereiche, erstelleSpieltischOhneEigeneSchlangen } from './testUtils'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

describe('M1u Waldtanz-Startkreis', () => {
  it('macht die leere Startzone als board-nahen Magic-Circle mit direkter Startkarte spielbar', () => {
    const { zustand, legaleStartaktion } = erstelleSpieltischOhneEigeneSchlangen()
    render(<App initialZustand={zustand} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: new RegExp(legaleStartaktion.handkartenId) }))

    const startzone = within(schlangenbereich).getByRole('button', { name: 'Neue Schlange starten' })
    expect(startzone).toHaveClass('schlangen-startzone--magiekreis', 'schlangen-startzone--leer', 'schlangen-startzone--zielbereit')
    expect(within(startzone).getByText('Startkreis')).toHaveClass('schlangen-startzone__badge')
    expect(within(startzone).getByText('Leuchtender Startplatz')).toHaveClass('schlangen-startzone__titel')
    expect(within(startzone).getByText(`Bereit: ${legaleStartaktion.handkartenId}`)).toHaveClass('schlangen-startzone__karte')
    expect(within(startzone).getByText('Karte loslassen oder klicken, um die erste Schlange zu legen.')).toBeVisible()

    const startaktionen = within(schlangenbereich).getByLabelText('Waldtanz-Startkreise')
    const startbutton = within(startaktionen).getByRole('button', { name: `Startkreis mit Karte ${legaleStartaktion.handkartenId}` })
    expect(startbutton).toHaveClass('schlangen-startkreis-button')
    expect(within(startbutton).getByText('In den Startkreis')).toBeVisible()

    fireEvent.click(startbutton)

    expect(screen.getByText(`Zuletzt ausgeführt: Neue Schlange starten mit Karte ${legaleStartaktion.handkartenId}`)).toBeVisible()
    expect(within(screen.getByRole('region', { name: 'Schlangenbereich' })).getByRole('list', { name: new RegExp(`Kartenreihe .*`) })).toBeVisible()
  })

  it('legt die Stitch-Startkreis-Optik mit Magic-Circle, 3px-Rand und Hard Shadow ab', () => {
    expect(cssBlock('schlangen-startzone--magiekreis')).toMatch(/border:\s*var\(--st-border-width-chunky\) dashed var\(--st-color-border-strong\)/)
    expect(cssBlock('schlangen-startzone--magiekreis')).toMatch(/border-radius:\s*999px/)
    expect(cssBlock('schlangen-startzone--magiekreis')).toMatch(/box-shadow:\s*inset 0 0 0 6px rgba\(164, 222, 2, 0\.24\), var\(--st-shadow-hard\)/)
    expect(cssBlock('schlangen-startzone__badge')).toMatch(/font-family:\s*var\(--st-font-headline\)/)
    expect(cssBlock('schlangen-startkreis-button')).toMatch(/border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(cssBlock('schlangen-startkreis-button')).toMatch(/box-shadow:\s*0 4px 0 var\(--st-color-border-strong\)/)
    expect(appCss).toMatch(/\.schlangen-startzone--magiekreis\.schlangen-startzone--zielbereit\s*\{[^}]*background:\s*radial-gradient/s)
    expect(appCss).toMatch(/\.schlangen-startzone--magiekreis\.schlangen-startzone--zielbereit\s*\{[^}]*box-shadow:\s*inset 0 0 0 6px rgba\(164, 222, 2, 0\.24\), 0 0 0 6px rgba\(254, 203, 0, 0\.42\), var\(--st-shadow-hard\)/s)
    expect(appCss).not.toMatch(/--st-color-startkreis/)
  })
})
