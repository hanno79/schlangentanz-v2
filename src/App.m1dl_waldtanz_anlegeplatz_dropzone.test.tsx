/**
 * Author: rahn
 * Datum: 26.06.2026
 * Version: 1.0
 * Beschreibung: M1dl macht den Waldtanz-Anlegeplatz auf /game zum pulsierenden
 * Drop-Ziel mit Richtungspfeil (← / →) und Hover-Lift, damit das Anlegen
 * einer Farbkarte sich wie ein Brettobjekt-Klick und nicht wie ein
 * Debug-Button-Klick anfuehlt.
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte, schlange } from './engine/__tests__/testHelpers'
import { ermittleSpielbereiche } from './testUtils'
import { istVerdrahtet } from './test/smokeKetten'

const appCss = readFileSync('src/App.css', 'utf8')

function anlegeplaetzeZustand() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [farbkarte('blau-m1dl', 'Blau', 4)]
  zustand.spieler[0].schlangen = [schlange([farbkarte('start-m1dl', 'Blau', 2)], 'pfad-m1dl')]
  return zustand
}

describe('M1dl Waldtanz-Anlegeplatz-Dropzone', () => {
  it('zeigt pro Anlegeplatz einen sichtbaren Richtungspfeil als Brettobjekt-Icon', () => {
    render(<App initialZustand={anlegeplaetzeZustand()} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /blau-m1dl/ }))

    const eigeneSchlange = within(schlangenbereich).getByRole('button', { name: /Schlange pfad-m1dl/ })
    const anlegeplaetze = within(eigeneSchlange).getByLabelText('Waldtanz-Anlegeplätze für pfad-m1dl')
    const links = within(anlegeplaetze).getByRole('button', { name: 'Schlangenbereich: Karte blau-m1dl links anlegen' })
    const rechts = within(anlegeplaetze).getByRole('button', { name: 'Schlangenbereich: Karte blau-m1dl rechts anlegen' })

    // Pfeil-Icon in der Kopfzeile beider Anlegeplaetze.
    const pfeilLinks = within(links).getAllByText('←')[0]
    const pfeilRechts = within(rechts).getAllByText('→')[0]
    expect(pfeilLinks).toHaveClass('schlangekarte__anlegeplatz-pfeil')
    expect(pfeilRechts).toHaveClass('schlangekarte__anlegeplatz-pfeil')
    expect(pfeilLinks.getAttribute('aria-hidden')).toBe('true')
    expect(pfeilRechts.getAttribute('aria-hidden')).toBe('true')
  })

  it('deklariert Puls-Animation und Hover-Lift als CSS-Vertrag', () => {
    // Puls-Animation muss vorhanden sein.
    expect(appCss).toMatch(/\.schlangekarte__anlegeplatz--ziel-puls[\s\S]*?animation:\s*anlegeplatz-puls/)
    expect(appCss).toMatch(/@keyframes\s+anlegeplatz-puls[\s\S]*?scale\(/)

    // Hover- und Focus-Visible-Lift.
    expect(appCss).toMatch(/\.schlangekarte__anlegeplatz:hover[\s\S]*?transform:[\s\S]*?translateY\(-3px\)[\s\S]*?scale\(1\.04\)/)
    expect(appCss).toMatch(/\.schlangekarte__anlegeplatz:focus-visible[\s\S]*?transform:[\s\S]*?translateY\(-3px\)[\s\S]*?scale\(1\.04\)/)

    // Rotations-Custom-Property pro Position (sonst kollidiert das
    // bestehende rotate(-2deg/2deg) mit dem Hover-Lift).
    expect(appCss).toMatch(/\.schlangekarte__anlegeplatz--links[\s\S]*?--anlegeplatz-rotate:\s*-2deg/)
    expect(appCss).toMatch(/\.schlangekarte__anlegeplatz--rechts[\s\S]*?--anlegeplatz-rotate:\s*2deg/)

    // Reduced-Motion-Schutz fuer die neue Animation.
    expect(appCss).toMatch(/@media\s+\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.schlangekarte__anlegeplatz--ziel-puls[\s\S]*?animation:\s*none/)
  })

  it('verdrahtet das M1dl-Smoke-Skript in der smoke:production-Kette', () => {
    expect(istVerdrahtet('m1dl_waldtanz_anlegeplatz_dropzone_smoke.mjs')).toBe(true)
  })
})