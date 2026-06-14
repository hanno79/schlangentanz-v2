/**
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M1l macht Schlangenreihen als zusammenhängenden Waldtanz-Pfad mit Kopf-/Schwanzkarten sichtbar.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, schlange } from './engine/__tests__/testHelpers'

const appCss = readFileSync('src/App.css', 'utf8')
const cssBlock = (selektor: string) =>
  appCss.match(new RegExp(`\\.${selektor}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''

function schlangenpfadZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].schlangen = [schlange([
    farbkarte('kopf-m1l-du', 'Grün', 5),
    farbkarte('mitte-m1l-du', 'Gelb', 4),
    farbkarte('schwanz-m1l-du', 'Blau', 3),
  ], 'waldpfad-du')]
  zustand.spieler[1].schlangen = [schlange([
    farbkarte('kopf-m1l-gegner', 'Rot', 6),
    farbkarte('schwanz-m1l-gegner', 'Violett', 2),
  ], 'waldpfad-gegner')]
  return zustand
}

describe('M1l Waldtanz-Schlangenpfad', () => {
  it('markiert Kopf, Körper und Schwanz in eigenen und gegnerischen Schlangenreihen als sichtbaren Pfad', () => {
    render(<App initialZustand={schlangenpfadZustand()} />)

    const schlangenbereich = screen.getByRole('region', { name: 'Schlangenbereich' })
    const eigeneReihe = within(schlangenbereich).getByRole('list', { name: 'Kartenreihe waldpfad-du' })
    const gegnerReihe = within(schlangenbereich).getByRole('list', { name: 'Kartenreihe waldpfad-gegner' })
    const eigeneKarten = within(eigeneReihe).getAllByRole('listitem')
    const gegnerKarten = within(gegnerReihe).getAllByRole('listitem')

    expect(eigeneReihe).toHaveClass('schlangekarte__kartenreihe--pfad')
    expect(gegnerReihe).toHaveClass('schlangekarte__kartenreihe--pfad')
    expect(eigeneKarten[0]).toHaveClass('schlangekarte__karte--kopf')
    expect(eigeneKarten[1]).toHaveClass('schlangekarte__karte--koerper')
    expect(eigeneKarten[2]).toHaveClass('schlangekarte__karte--schwanz')
    expect(gegnerKarten[0]).toHaveClass('schlangekarte__karte--kopf')
    expect(gegnerKarten[1]).toHaveClass('schlangekarte__karte--schwanz')

    expect(within(eigeneKarten[0]).getByText('Kopf')).toHaveClass('schlangekarte__pfadmarke')
    expect(within(eigeneKarten[2]).getByText('Schwanz')).toHaveClass('schlangekarte__pfadmarke')
    expect(within(gegnerKarten[0]).getByText('Kopf')).toHaveClass('schlangekarte__pfadmarke')
    expect(within(gegnerKarten[1]).getByText('Schwanz')).toHaveClass('schlangekarte__pfadmarke')
  })

  it('verdichtet eine Ein-Karten-Schlange zu einer einzigen Kopf-und-Schwanz-Pfadmarke', () => {
    const zustand = schlangenpfadZustand()
    zustand.spieler[0].schlangen = [schlange([farbkarte('solo-m1l-du', 'Grün', 5)], 'solo-waldpfad-du')]

    render(<App initialZustand={zustand} />)

    const reihe = screen.getByRole('list', { name: 'Kartenreihe solo-waldpfad-du' })
    const soloKarte = within(reihe).getByRole('listitem')

    expect(soloKarte).toHaveClass('schlangekarte__karte--kopf')
    expect(soloKarte).toHaveClass('schlangekarte__karte--schwanz')
    expect(within(soloKarte).getByText('Kopf & Schwanz')).toHaveClass('schlangekarte__pfadmarke')
    expect(within(soloKarte).queryByText('Kopf')).toBeNull()
    expect(within(soloKarte).queryByText('Schwanz')).toBeNull()
  })

  it('legt den Stitch-Waldpfad-Stil mit Verbindungslinie, Kopfplakette und Schwanzplakette ab', () => {
    expect(cssBlock('schlangekarte__kartenreihe--pfad')).toMatch(/position:\s*relative/)
    expect(cssBlock('schlangekarte__kartenreihe--pfad')).toMatch(/isolation:\s*isolate/)
    expect(appCss).toMatch(/\.schlangekarte__kartenreihe--pfad::before[\s\S]*height:\s*0\.55rem/)
    expect(appCss).toMatch(/\.schlangekarte__kartenreihe--pfad::before[\s\S]*background:\s*linear-gradient/)
    expect(cssBlock('schlangekarte__pfadmarke')).toMatch(/border:\s*2px solid var\(--st-color-border-strong\)/)
    expect(cssBlock('schlangekarte__pfadmarke')).toMatch(/border-radius:\s*999px/)
    expect(appCss).toMatch(/\.schlangekarte__karte\.schlangekarte__karte--kopf\s*\{[\s\S]*transform:\s*translateY\(-0\.25rem\) rotate\(-2deg\)/)
    expect(appCss).toMatch(/\.schlangekarte__karte\.schlangekarte__karte--schwanz\s*\{[\s\S]*transform:\s*translateY\(0\.25rem\) rotate\(2deg\)/)
  })
})
