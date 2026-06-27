/**
 * Author: rahn
 * Datum: 27.06.2026
 * Version: 1.0
 * Beschreibung: M1dt macht eigene Schlangen zu lebendigen Stitch-Würmern
 * (Schlangenkörper-Brücke, Kopf-Augen + Mund, Schwanz-Curl, Solo-Vergrößerung,
 * Wriggle-Animation in der eigenen Ausspielphase).
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

function schlangenwurmZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].schlangen = [schlange([
    farbkarte('kopf-m1dt-du', 'Grün', 5),
    farbkarte('mitte1-m1dt-du', 'Gelb', 4),
    farbkarte('mitte2-m1dt-du', 'Blau', 3),
    farbkarte('schwanz-m1dt-du', 'Rot', 2),
  ], 'wurm-du')]
  zustand.spieler[1].schlangen = [schlange([
    farbkarte('kopf-m1dt-gegner', 'Violett', 7),
    farbkarte('schwanz-m1dt-gegner', 'Braun', 1),
  ], 'wurm-gegner')]
  return zustand
}

describe('M1dt Waldtanz-Schlangenwurm', () => {
  it('RED-1: Eigene Schlange hat sichtbare Schlangenkörper-Brücke zwischen den Karten (wellenförmige Linie hinter der Kartenreihe)', () => {
    const zustand = schlangenwurmZustand()
    render(<App initialZustand={zustand} />)

    const schlangenbereich = screen.getByRole('region', { name: 'Schlangenbereich' })
    const eigeneReihe = within(schlangenbereich).getByRole('list', { name: 'Kartenreihe wurm-du' })

    // Brücke als CSS-Pseudo auf der Kartenreihe — wellenförmig, dashed, dark-forest-green
    expect(eigeneReihe).toHaveClass('schlangekarte__kartenreihe--pfad')
    const brueckenBlock = appCss.match(/\.schlangekarte__kartenreihe--pfad::after\s*\{([^}]*)\}/s)?.[1] ?? ''
    expect(brueckenBlock).toMatch(/content:\s*['"]['"]/)
    expect(brueckenBlock).toMatch(/position:\s*absolute/)
    expect(brueckenBlock).toMatch(/border-top:\s*2px\s+(dashed|dotted|ridge|outset|inset|groove|double)/)
  })

  it('RED-2: Kopf-Karte einer eigenen Schlange zeigt Augen (links + rechts) und Mund', () => {
    const zustand = schlangenwurmZustand()
    render(<App initialZustand={zustand} />)

    const schlangenbereich = screen.getByRole('region', { name: 'Schlangenbereich' })
    const eigeneReihe = within(schlangenbereich).getByRole('list', { name: 'Kartenreihe wurm-du' })
    const eigeneKarten = within(eigeneReihe).getAllByRole('listitem')
    const kopfKarte = eigeneKarten[0]

    expect(kopfKarte).toHaveClass('schlangekarte__karte--kopf')
    // Augen
    expect(within(kopfKarte).getByTestId('schlangekarte-auge-links')).toBeInTheDocument()
    expect(within(kopfKarte).getByTestId('schlangekarte-auge-rechts')).toBeInTheDocument()
    // Mund (Lächeln)
    expect(within(kopfKarte).getByTestId('schlangekarte-mund')).toBeInTheDocument()

    // CSS-Vertrag: Augen sind klein, rund, weiss; Mund hat unteren border
    expect(cssBlock('schlangekarte__auge')).toMatch(/width:\s*0\.3\d?rem/)
    expect(cssBlock('schlangekarte__auge')).toMatch(/height:\s*0\.3\d?rem/)
    expect(cssBlock('schlangekarte__auge')).toMatch(/border-radius:\s*50%/)
    expect(cssBlock('schlangekarte__mund')).toMatch(/border-bottom:\s*2px solid/)
  })

  it('RED-3: Schwanz-Karte einer eigenen Schlange bekommt curl-Klasse mit verändertem Border-Radius', () => {
    const zustand = schlangenwurmZustand()
    render(<App initialZustand={zustand} />)

    const schlangenbereich = screen.getByRole('region', { name: 'Schlangenbereich' })
    const eigeneReihe = within(schlangenbereich).getByRole('list', { name: 'Kartenreihe wurm-du' })
    const eigeneKarten = within(eigeneReihe).getAllByRole('listitem')
    const schwanzKarte = eigeneKarten[eigeneKarten.length - 1]

    expect(schwanzKarte).toHaveClass('schlangekarte__karte--schwanz')
    expect(schwanzKarte).toHaveClass('schlangekarte__karte--schwanz-curl')
    // CSS-Vertrag: Curl-Klasse hat asymmetrisches Border-Radius (4 Werte)
    const curlBlock = cssBlock('schlangekarte__karte--schwanz-curl')
    expect(curlBlock).toMatch(/border-radius:\s*\S+\s+\S+\s+\S+\s+\S+/)
    // Asymmetrisch: erste Zahl ungleich vierter Zahl (curl-Effekt)
    const m = curlBlock.match(/border-radius:\s*([\d.]+rem)\s+([\d.]+rem)\s+([\d.]+rem)\s+([\d.]+rem)/)
    expect(m).not.toBeNull()
    expect(m![1]).not.toBe(m![4])
  })

  it('RED-4: Solo-Karte (1-Karten-Schlange) bekommt eine vergrößerte Mindestbreite', () => {
    const zustand = schlangenwurmZustand()
    zustand.spieler[0].schlangen = [schlange([farbkarte('solo-m1dt-du', 'Grün', 5)], 'solo-wurm-du')]
    render(<App initialZustand={zustand} />)

    const schlangenbereich = screen.getByRole('region', { name: 'Schlangenbereich' })
    const reihe = within(schlangenbereich).getByRole('list', { name: 'Kartenreihe solo-wurm-du' })
    const soloKarte = within(reihe).getByRole('listitem')

    // Solo-Klasse am <li> Eltern-Element
    const soloLi = soloKarte.closest('li.schlangekarte')
    expect(soloLi).toHaveClass('schlangekarte--solo')

    // CSS-Vertrag: solo-Klasse setzt eine größere min-width auf den Karten (descendant rule).
    // Akzeptiert die hohe Spezifitaets-Form (0,3,0) mit doppelter solo-Klasse oder die
    // einfache Descendant-Form (0,2,0), falls Cascade-Sicherheit per Reihenfolge erfolgt.
    const soloBlock =
      appCss.match(/\.schlangekarte--solo\.schlangekarte--solo\s+\.schlangekarte__karte\s*\{([^}]*)\}/s)?.[1] ??
      appCss.match(/\.schlangekarte--solo\s+\.schlangekarte__karte\s*\{([^}]*)\}/s)?.[1] ??
      ''
    expect(soloBlock).toMatch(/min-width:\s*7\.5rem/)
  })

  it('RED-5: Wriggle-Keyframe + Klasse + reduced-motion-Override sind in der CSS-Datei definiert', () => {
    // @keyframes wriggle
    expect(appCss).toMatch(/@keyframes\s+wriggle\s*\{[\s\S]*transform:\s*translateY/)
    // Wriggle-Klasse
    expect(appCss).toMatch(/\.schlangekarte--wriggle[^{}]*\{[\s\S]*animation:\s*wriggle/)
    // reduced-motion override
    expect(appCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*\.schlangekarte--wriggle[\s\S]*animation:\s*none/)
  })

  // M1dt (Kimi-Review 2026-06-27): Cascade-Regression-Tests schuetzen gegen das
  // spaetere .schlangekarte__karte--spielkarte (border-radius 1.1rem, min-width 5.9rem),
  // das M1dt-curl und Solo-min-width ueberschreiben wuerde.
  it('RED-6 (Kimi-Fix): Schwanz-Curl hat Spezifitaet >= 2 Klassenkette, die spaetere Spielkarte-Regel schlaegt sie nicht', () => {
    // Suche die M1dt-Curl-Regel (4-Werte-asymmetrisch, erstes != viertes).
    // Erfasst Selektor + Body als Paar, damit der Selektor korrekt geprueft wird.
    const alleRegeln = appCss.match(/[^{}]*\{[^}]*border-radius:\s*[\d.]+rem\s+[\d.]+rem\s+[\d.]+rem\s+[\d.]+rem[^}]*\}/gs) ?? []
    const curlRegel = alleRegeln.find((rule) => {
      const m = rule.match(/border-radius:\s*([\d.]+rem)\s+([\d.]+rem)\s+([\d.]+rem)\s+([\d.]+rem)/)
      return m && m[1] !== m[4] && rule.includes('schwanz-curl')
    })
    expect(curlRegel, 'Schwanz-Curl-Regel mit asymmetrischem border-radius muss existieren').toBeDefined()
    // Cascade-Sicherheit: Selektor-Teil muss mindestens 2 Klassenkette enthalten
    // (doppelte Klasse), damit die spaetere .schlangekarte__karte--spielkarte (0,1,0) verliert.
    const selektor = curlRegel!.match(/^([^{]+)\{/)?.[1] ?? ''
    expect(selektor).toMatch(/\.schlangekarte__karte--schwanz-curl\.schlangekarte__karte--schwanz-curl/)
  })

  it('RED-7 (Kimi-Fix): Solo-Karte hat Spezifitaet >= 2 Klassen am Container, die spaetere Spielkarte-min-width schlaegt sie nicht', () => {
    const soloMatch = appCss.match(/\.schlangekarte--solo\.schlangekarte--solo\s+\.schlangekarte__karte\s*\{([^}]*)\}/s)
    expect(soloMatch, 'Solo-Cascade-Regression-Schutz: 0,3,0-Selektor mit doppelter solo-Klasse').not.toBeNull()
    expect(soloMatch![1]).toMatch(/min-width:\s*7\.5rem/)
  })

  it('RED-8 (Kimi-Fix): .schlangekarte__karte hat position: relative als containing block fuer Gesicht/Mund', () => {
    const karteBlock = cssBlock('schlangekarte__karte')
    expect(karteBlock).toMatch(/position:\s*relative/)
  })
})
