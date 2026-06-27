/*
 * Author: rahn
 * Datum: 27.06.2026
 * Version: 1.0
 * Beschreibung: M2d RED-Tests fuer den window.__schlangentanzFixture-Helper.
 *              Dieser Helper ermoeglicht Live-Smokes (M1dq, M2a, M2c, M2b+)
 *              deterministische Sonderkarten-Spielzustaende herzustellen,
 *              ohne die UI-Klick-Ketten manuell durchlaufen zu muessen.
 *              RED-1 bis RED-4 pruefen die Pure-Logic (baueFixtureZustand),
 *              RED-5/RED-6 pruefen, dass der Helper nach App-Mount als
 *              window-Funktion verfuegbar ist und den Zustand korrekt setzt.
 */

import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { baueFixtureZustand, type SchlangentanzFixtureEingabe } from './components/waldtanzFixtureLogik'

afterEach(() => {
  delete (window as unknown as { __schlangentanzFixture?: unknown }).__schlangentanzFixture
})

describe('M2d Schlangentanz-Fixture-Helper', () => {
  it('RED-1: baueFixtureZustand injiziert Schlangenfrass-Sonderkarte in hand[0]', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2))
    const eingabe: SchlangentanzFixtureEingabe = {
      sonderkarte: { name: 'Schlangenfrass', id: 'sf-test-1' },
      gegnerSchlange: { id: 'gs-test-1', farbe: 'Blau', punkte: 3 },
    }
    const zustandNeu = baueFixtureZustand(zustand, eingabe)
    const aktiverSpieler = zustandNeu.spieler.find((s) => s.steuerung === 'Mensch') ?? zustandNeu.spieler[0]
    const ersteKarte = aktiverSpieler.hand[0]
    expect(ersteKarte.typ).toBe('Sonderkarte')
    expect((ersteKarte as { name?: string }).name).toBe('Schlangenfrass')
    expect((ersteKarte as { id?: string }).id).toBe('sf-test-1')
  })

  it('RED-1b (Kimi B1): Schlangenfrass-Fixture erzeugt EIGENE Schlange mit Karte in passender Farbe', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2))
    const aktiverSpielerId = (zustand.spieler.find((s) => s.steuerung === 'Mensch') ?? zustand.spieler[0]).id
    const eingabe: SchlangentanzFixtureEingabe = {
      sonderkarte: { name: 'Schlangenfrass', id: 'sf-test-1b' },
      gegnerSchlange: { id: 'gs-test-1b', farbe: 'Blau', punkte: 3 },
    }
    const zustandNeu = baueFixtureZustand(zustand, eingabe)
    const aktiverSpieler = zustandNeu.spieler.find((s) => s.id === aktiverSpielerId)
    expect(aktiverSpieler?.schlangen.length).toBeGreaterThan(0)
    const eigeneSchlange = aktiverSpieler?.schlangen[0]
    expect(eigeneSchlange?.karten.length).toBeGreaterThan(0)
    expect((eigeneSchlange?.karten[0] as { farbe?: string }).farbe).toBe('Blau')
  })

  it('RED-2: Schlangenfrass-Fixture erzeugt gegnerische Schlange mit Karte in passender Farbe', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2))
    const aktiverSpielerId = (zustand.spieler.find((s) => s.steuerung === 'Mensch') ?? zustand.spieler[0]).id
    const eingabe: SchlangentanzFixtureEingabe = {
      sonderkarte: { name: 'Schlangenfrass', id: 'sf-test-2' },
      gegnerSchlange: { id: 'gs-test-2', farbe: 'Blau', punkte: 3 },
    }
    const zustandNeu = baueFixtureZustand(zustand, eingabe)
    const gegner = zustandNeu.spieler.find((s) => s.id !== aktiverSpielerId)
    expect(gegner).toBeDefined()
    expect(gegner?.schlangen.length).toBeGreaterThan(0)
    const gegnerSchlange = gegner?.schlangen[0]
    expect(gegnerSchlange?.karten.length).toBeGreaterThan(0)
    const ersteKarte = gegnerSchlange?.karten[0]
    expect((ersteKarte as { farbe?: string }).farbe).toBe('Blau')
  })

  it('RED-2b (Kimi B2): Farbendieb-Fixture erzeugt EIGENE aktive Schlange mit >=1 Karte', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2))
    const aktiverSpielerId = (zustand.spieler.find((s) => s.steuerung === 'Mensch') ?? zustand.spieler[0]).id
    const eingabe: SchlangentanzFixtureEingabe = {
      sonderkarte: { name: 'Farbendieb', id: 'fd-test-2b' },
    }
    const zustandNeu = baueFixtureZustand(zustand, eingabe)
    const aktiverSpieler = zustandNeu.spieler.find((s) => s.id === aktiverSpielerId)
    expect(aktiverSpieler?.schlangen.length).toBeGreaterThan(0)
    const eigeneSchlange = aktiverSpieler?.schlangen[0]
    expect(eigeneSchlange?.karten.length).toBeGreaterThan(0)
    expect(eigeneSchlange?.zustand).toBe('aktiv')
  })

  it('RED-3: Farbenschutz-Fixture erzeugt eigene aktive Schlange mit Karte', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2))
    const aktiverSpielerId = (zustand.spieler.find((s) => s.steuerung === 'Mensch') ?? zustand.spieler[0]).id
    const eingabe: SchlangentanzFixtureEingabe = {
      sonderkarte: { name: 'Farbenschutz', id: 'fs-test-3' },
    }
    const zustandNeu = baueFixtureZustand(zustand, eingabe)
    const aktiverSpieler = zustandNeu.spieler.find((s) => s.id === aktiverSpielerId)
    expect(aktiverSpieler?.schlangen.length).toBeGreaterThan(0)
    const eigeneSchlange = aktiverSpieler?.schlangen[0]
    expect(eigeneSchlange?.karten.length).toBeGreaterThan(0)
    expect(eigeneSchlange?.zustand).toBe('aktiv')
  })

  it('RED-4: Farbenfusion-Fixture erzeugt eigene Schlange mit 2 gleichfarbigen Karten', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2))
    const aktiverSpielerId = (zustand.spieler.find((s) => s.steuerung === 'Mensch') ?? zustand.spieler[0]).id
    const eingabe: SchlangentanzFixtureEingabe = {
      sonderkarte: { name: 'Farbenfusion', id: 'ff-test-4' },
    }
    const zustandNeu = baueFixtureZustand(zustand, eingabe)
    const aktiverSpieler = zustandNeu.spieler.find((s) => s.id === aktiverSpielerId)
    const eigeneSchlange = aktiverSpieler?.schlangen[0]
    expect(eigeneSchlange).toBeDefined()
    expect(eigeneSchlange?.karten.length).toBe(2)
    const farbe1 = (eigeneSchlange?.karten[0] as { farbe?: string }).farbe
    const farbe2 = (eigeneSchlange?.karten[1] as { farbe?: string }).farbe
    expect(farbe1).toBe(farbe2)
  })

  it('RED-5: window.__schlangentanzFixture ist nach App-Mount als Funktion verfuegbar', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2))
    render(<App initialZustand={zustand} />)
    const fixture = (window as unknown as { __schlangentanzFixture?: unknown }).__schlangentanzFixture
    expect(typeof fixture).toBe('function')
  })

  it('RED-6: __schlangentanzFixture setzt den Zustand via act() ohne Render-Fehler', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2))
    render(<App initialZustand={zustand} />)
    const fixture = (window as unknown as { __schlangentanzFixture?: (f: SchlangentanzFixtureEingabe) => void }).__schlangentanzFixture
    expect(typeof fixture).toBe('function')
    act(() => {
      fixture?.({
        sonderkarte: { name: 'Schlangenfrass', id: 'sf-live-test' },
        gegnerSchlange: { id: 'gs-live-test', farbe: 'Blau', punkte: 3 },
      })
    })
    // App rendert nach Fixture-Injection weiterhin fehlerfrei
    // Sonderkarte-Tokens erscheinen in der Hand (Stitch-Stil Blau/Gold)
    const alleRegions = screen.queryAllByRole('region')
    const hatHandOderSchlange = alleRegions.some(
      (r) => (r.getAttribute('aria-label') ?? '').match(/Hand|Schlange/i) !== null,
    )
    expect(hatHandOderSchlange).toBe(true)
  })
})
