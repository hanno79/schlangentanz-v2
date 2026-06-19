/**
 * Author: rahn
 * Datum: 15.06.2026
 * Version: 1.0
 * Beschreibung: M1z zeigt nach Handkartenauswahl eine board-nahe Zielspur und dimmt nicht passende Schlangen.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { ermittleLegaleAktionen, erstelleSpielzustand, starteAusspielphase } from './engine'
import type { SpielAktion } from './engine'
import { farbkarte, sonderkarte } from './engine/__tests__/testHelpers'
import { erstelleSpieltischMitEineSchlange, ermittleSpielbereiche } from './testUtils'

const appCss = readFileSync('src/App.css', 'utf8')

function boardZieleFuerKarte(kartenId: string) {
  return (aktion: ReturnType<typeof ermittleLegaleAktionen>[number]) =>
    'handkartenId' in aktion && aktion.handkartenId === kartenId && aktion.typ !== 'PflichtAbwurf'
}

describe('M1z Waldtanz-Zielspur', () => {
  it('führt die ausgewählte Handkarte mit einer Zielspur zu leuchtenden Brettzielen', () => {
    const { zustand, anlegekarteId } = erstelleSpieltischMitEineSchlange('schlange-m1z-ziel')
    zustand.spieler[0].schlangen.push({
      id: 'schlange-m1z-blockiert',
      zustand: 'blockiert',
      karten: [farbkarte('blockiert-m1z-01', 'Rot', 3)],
    })
    const zielAnzahl = ermittleLegaleAktionen(zustand).filter(boardZieleFuerKarte(anlegekarteId)).length

    render(<App initialZustand={zustand} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: new RegExp(anlegekarteId) }))

    expect(schlangenbereich).toHaveClass('schlangenbereich--karte-ausgewaehlt')
    const zielspur = within(schlangenbereich).getByRole('note', { name: 'Waldtanz-Zielspur' })
    expect(within(zielspur).getByText('Rankenpfad aktiv')).toBeVisible()
    expect(within(zielspur).getByRole('list', { name: 'Waldtanz-Zielranken' })).toBeVisible()
    expect(within(zielspur).getByText(`Zielkarte: ${anlegekarteId}`)).toBeVisible()
    expect(within(zielspur).getByText(`${zielAnzahl} Brettziele leuchten`)).toBeVisible()

    const zielSchlange = within(schlangenbereich).getByText('schlange-m1z-ziel').closest('li')
    const blockierteSchlange = within(schlangenbereich).getByText('schlange-m1z-blockiert').closest('li')
    expect(zielSchlange).toHaveClass('schlangekarte--zielbereit')
    expect(zielSchlange).not.toHaveClass('schlangekarte--nichtziel')
    expect(blockierteSchlange).toHaveClass('schlangekarte--nichtziel')
  })

  it('liefert den Stitch-CSS-Vertrag für Zielspur, Leuchtbrett und gedimmte Nichtziele', () => {
    expect(appCss).toMatch(/\.waldtanz-zielspur\s*\{[\s\S]*border:\s*var\(--st-border-width-chunky\) solid var\(--st-color-border-strong\)/)
    expect(appCss).toMatch(/\.waldtanz-zielspur\s*\{[\s\S]*box-shadow:\s*0 5px 0 var\(--st-color-border-strong\)/)
    expect(appCss).toMatch(/\.schlangenbereich--karte-ausgewaehlt[\s\S]*radial-gradient\(circle at 50% 52%/)
    expect(appCss).toMatch(/\.schlangekarte--nichtziel\s*\{[\s\S]*opacity:\s*0\.58/)
  })

  it('dimmt eigene Schlangen mit sichtbarem Farbenfusion-Paarziel nicht als Nichtziel', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    zustand.spieler[0].hand = [sonderkarte('farbenfusion-m1z', 'Farbenfusion')]
    zustand.spieler[0].schlangen = [{ id: 'fusion-pfad-m1z', zustand: 'aktiv', karten: [farbkarte('blau-m1z-a', 'Blau', 2), farbkarte('blau-m1z-b', 'Blau', 3)] }]

    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /farbenfusion-m1z/ }))

    const fusionSchlange = within(schlangenbereich).getByText('fusion-pfad-m1z').closest('li')
    expect(fusionSchlange).not.toHaveClass('schlangekarte--nichtziel')
    expect(within(schlangenbereich).getByText('blau-m1z-a').closest('.schlangekarte__karte')).toHaveClass('schlangekarte__karte--farbenfusion-paar')
  })

  it('zählt bei Schlangenfrass sichtbare Zielkarten statt kombinatorischer Folgeaktionen', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(3, () => 0.999999))
    zustand.spieler[0].hand = [sonderkarte('schlangenfrass-m1z', 'Schlangenfrass')]
    zustand.spieler[0].schlangen = [{ id: 'eigene-frass-m1z', zustand: 'aktiv', karten: [farbkarte('eigene-m1z', 'Grün', 2)] }]
    zustand.spieler[1].schlangen = [{ id: 'gegner-a-frass-m1z', zustand: 'aktiv', karten: [farbkarte('rot-gegner-m1z', 'Rot', 1), farbkarte('gelb-gegner-m1z', 'Gelb', 1)] }]
    zustand.spieler[2].schlangen = [{ id: 'gegner-b-frass-m1z', zustand: 'aktiv', karten: [farbkarte('blau-gegner-m1z', 'Blau', 1)] }]
    const schlangenfrassAktionen = ermittleLegaleAktionen(zustand).filter(
      (aktion): aktion is Extract<SpielAktion, { typ: 'SchlangenfrassSpielen' }> =>
        aktion.typ === 'SchlangenfrassSpielen' && aktion.handkartenId === 'schlangenfrass-m1z',
    )
    const sichtbareZielkarten = new Set(schlangenfrassAktionen.flatMap((aktion) => aktion.ziele.map((ziel) => ziel.kartenId))).size

    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /schlangenfrass-m1z/ }))

    const zielspur = within(schlangenbereich).getByRole('note', { name: 'Waldtanz-Zielspur' })
    expect(within(zielspur).getByText(`${sichtbareZielkarten} Brettziele leuchten`)).toBeVisible()
  })
})
