/**
 * Author: rahn
 * Datum: 22.06.2026
 * Version: 1.0
 * Beschreibung: M1db macht den Moment des Spielens auf /game sichtbar:
 *  - die ausgewaehlte Handkarte hebt sich sichtbar aus dem Faecher (CSS-Token + data-Attribut)
 *  - die Magiekreise bekommen data-ist-ziel-aktiv korrekt nach legaler Aktion
 *  - die Spielbahn bekommt dekorative Pseudo-Elemente mit klicksicherem pointer-events: none
 *  - der Slice-Smoke ist in der kanonischen smoke:production-Chain verdrahtet
 *
 * Der Test beweist CSS-Source- und DOM-Landmark-Vertrag, nicht echte Geometrie
 * (jsdom-BoundingRect-Trap).
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte } from './engine/__tests__/testHelpers'

const appCss = readFileSync('src/App.css', 'utf8')

function zustandMitSpielbarerKarte() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [farbkarte('blau-m1db-01', 'Blau', 1)]
  zustand.spieler[0].schlangen = []
  // Eine leere eigene Schlange ist nicht noetig, weil die Karte als
  // neue Schlange gestartet werden kann.
  zustand.spieler[1].hand = [farbkarte('rot-m1db-01', 'Rot', 1)]
  zustand.spieler[1].schlangen = []
  return zustand
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1db Waldtanz-Spielmoment', () => {
  it('rendert auf /game die Handkarten-UL mit data-hat-ausgewaehlt="false" initial', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitSpielbarerKarte()} />)

    const handkartenLeiste = screen.getByRole('list', { name: 'Waldtanz-Spielkartenfächer' })
    expect(handkartenLeiste).toBeInTheDocument()
    expect(handkartenLeiste.getAttribute('data-hat-ausgewaehlt')).toBe('false')
  })

  it('setzt data-hat-ausgewaehlt="true" sobald eine Handkarte ausgewaehlt wird', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitSpielbarerKarte()} />)

    const handkartenLeiste = screen.getByRole('list', { name: 'Waldtanz-Spielkartenfächer' })
    const ersteKarte = within(handkartenLeiste).getAllByRole('button')[0]
    fireEvent.click(ersteKarte)

    expect(handkartenLeiste.getAttribute('data-hat-ausgewaehlt')).toBe('true')
  })

  it('markiert Magiekreise mit data-ist-ziel-aktiv sobald eine spielbare Karte gewaehlt ist', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitSpielbarerKarte()} />)

    const magiekreise = screen.getByRole('region', { name: 'Waldtanz-Magiekreise' })
    expect(magiekreise.getAttribute('data-ist-ziel-aktiv')).toBe('false')

    const handkartenLeiste = screen.getByRole('list', { name: 'Waldtanz-Spielkartenfächer' })
    const ersteKarte = within(handkartenLeiste).getAllByRole('button')[0]
    fireEvent.click(ersteKarte)

    expect(magiekreise.getAttribute('data-ist-ziel-aktiv')).toBe('true')
  })

  it('deklariert CSS-Token --handkarte-lift-y und --handkarte-selected-glow im :root', () => {
    const rootMatch = appCss.match(/:root\s*\{([\s\S]*?)\}/)
    expect(rootMatch).not.toBeNull()
    const rootBody = rootMatch?.[1] ?? ''
    expect(rootBody).toMatch(/--handkarte-lift-y\s*:/)
    expect(rootBody).toMatch(/--handkarte-selected-glow\s*:/)
  })

  it('nutzt einen Attribut-Selektor auf data-hat-ausgewaehlt fuer Dim + Glow', () => {
    // CSS-Source-Vertrag: die Handkartenleiste belohnt eine ausgewaehlte
    // Handkarte sichtbar (Lift + Glow + nicht-ausgewaehlte Karten dimmen),
    // gesteuert ueber das data-hat-ausgewaehlt-Attribut der UL. Eine
    // fruehere :has()-Variante wurde verworfen, weil React keine kontrollierte
    // Schreibweise fuer aria-Attribute auf der UL garantiert; das explizite
    // Attribut ist robuster.
    expect(appCss).toMatch(/\.handkartenleiste[^{]*\[data-hat-ausgewaehlt=["']?true["']?\]/)
  })

  it('konsumiert --handkarte-lift-y in der ausgewaehlten Handkarten-Regel', () => {
    // Kimi-Review-NB1: Token wurde im :root deklariert, aber nirgendwo
    // konsumiert. Der Lift-Wert muss tatsaechlich in der transform-Regel
    // der ausgewaehlten Handkarte landen, damit das Token seine Wirkung
    // im reduced-motion-Modus entfaltet.
    expect(appCss).toMatch(/translateY\(var\(--handkarte-lift-y\)\)/)
  })

  it('hebt die wartet-Opacity auf, sobald die Karte ausgewaehlt ist', () => {
    // Kimi-Review-NB4: .handkarte--wartet .handkarte__button--karte setzt
    // opacity: 0.72 auf den Button. Ohne Override wirkt eine ausgewaehlte
    // nicht-spielbare Karte weiterhin gedimmt — visuelle Inkonsistenz.
    // Die Override-Regel setzt opacity: 1 fuer .handkarte--ausgewaehlt.
    expect(appCss).toMatch(/\.handkarte--ausgewaehlt\.handkarte--wartet[^{]*\{[^}]*opacity\s*:\s*1/)
  })

  it('schuetzt Pseudo-Elemente auf der Spielbahn mit pointer-events: none', () => {
    // Die Wald-Atmosphaere darf Handkarten und Brettziele nicht abdecken.
    // Wir akzeptieren sowohl den literalen Klassenselektor
    //   .waldtanz-lichtungsbrett::before/after
    // als auch das im Projekt etablierte Attribut-Selektor-Pendant
    //   [class~="waldtanz-lichtungsbrett"]::before/after
    // (siehe .spielbereich--game-route [class~="waldtanz-lichtungsbrett"] ...).
    const lichtungsRegeln = appCss.match(/(?:\.waldtanz-lichtungsbrett|\[class~="waldtanz-lichtungsbrett"\])\s*[^{}]*::?(?:before|after)\s*\{[^}]*\}/g) ?? []
    expect(lichtungsRegeln.length).toBeGreaterThanOrEqual(1)
    for (const regel of lichtungsRegeln) {
      expect(regel).toMatch(/pointer-events\s*:\s*none/)
    }
  })
})


