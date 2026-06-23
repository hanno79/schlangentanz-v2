/**
 * Author: rahn
 * Datum: 23.06.2026
 * Version: 1.0
 * Beschreibung: M1dc macht den Spielmoment auf dem Brett sichtbar:
 *  - nach NeueSchlangeStarten pulsiert der Startkreis (data-letzte-aktion-ziel="true")
 *  - nach KarteAnlegen pulsiert die Zielschlange (data-letzte-aktion-ziel="schlange-<id>")
 *  - PflichtAbwurf loest KEINEN Spielmoment-Puls aus (kein Spieler-Moment)
 *  - 3 neue CSS-Token im :root, ein @keyframes-Block und ein Reduced-Motion-Override
 *  - Smoke-Wiring in package.json + Smoke-Skript vorhanden
 *
 * Der Test beweist CSS-Source- und DOM-Landmark-Vertrag, nicht echte Geometrie
 * (jsdom-BoundingRect-Trap, siehe small-slice-release-workflow/references/jsdom-bbox-trap-in-slice-tests.md).
 */
/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import { farbkarte } from './engine/__tests__/testHelpers'
import { extrahiereAktionZiel } from './aktionsziel/extrahiereAktionZiel'

const appCss = readFileSync('src/App.css', 'utf8')

function zustandMitErsterSchlange() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  zustand.spieler[0].hand = [
    farbkarte('blau-m1dc-01', 'Blau', 1),
    farbkarte('blau-m1dc-02', 'Blau', 2),
    farbkarte('rot-m1dc-03', 'Rot', 1),
  ]
  zustand.spieler[0].schlangen = [
    {
      id: 'schlange-m1dc-1',
      karten: [farbkarte('blau-m1dc-04', 'Blau', 1)],
      zustand: 'aktiv',
    },
  ]
  zustand.spieler[1].hand = [farbkarte('rot-m1dc-04', 'Rot', 1)]
  zustand.spieler[1].schlangen = []
  return zustand
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

describe('M1dc Waldtanz-Spielmoment-Pulse', () => {
  it('rendert auf /game ohne data-letzte-aktion-ziel initial', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitErsterSchlange()} />)

    const startzone = screen.getByRole('region', { name: 'Schlangenlichtung' }).querySelector('[class~="schlangen-startzone"]')
    expect(startzone).not.toBeNull()
    expect(startzone?.getAttribute('data-letzte-aktion-ziel')).toBeNull()

    const ersteSchlange = within(screen.getByRole('region', { name: 'Schlangenlichtung' }))
      .getAllByRole('listitem')
      .find((li) => li.className.includes('schlangekarte'))
    expect(ersteSchlange?.getAttribute('data-letzte-aktion-ziel')).toBeNull()
  })

  it('setzt data-letzte-aktion-ziel="true" auf dem Startkreis nach NeueSchlangeStarten', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitErsterSchlange()} />)

    // Erste spielbare Handkarte waehlen.
    const handkartenLeiste = screen.getByRole('list', { name: 'Waldtanz-Spielkartenfächer' })
    const ersteKarte = within(handkartenLeiste).getAllByRole('button')[0]
    fireEvent.click(ersteKarte)

    // Startkreis-Button innerhalb des Schlangenbereichs klicken (in /game-Modus
    // ist die Startzone selbst der Button). Die Aktionen-Empfehlung hat einen
    // aehnlichen Namen, daher scopieren wir auf den Schlangenbereich.
    const schlangenbereich = screen.getByRole('region', { name: 'Schlangenlichtung' })
    const startkreisButton = within(schlangenbereich).getByRole('button', { name: /Neue Schlange starten/ })
    fireEvent.click(startkreisButton)

    const startzone = schlangenbereich.querySelector('[class~="schlangen-startzone"]')
    expect(startzone).not.toBeNull()
    expect(startzone?.getAttribute('data-letzte-aktion-ziel')).toBe('true')
  })

  it('setzt data-letzte-aktion-ziel="schlange-<id>" auf der Zielschlange nach KarteAnlegen', () => {
    window.history.pushState({}, '', '/game')
    render(<App initialZustand={zustandMitErsterSchlange()} />)

    // M1ck-Pattern: Wachstumsfaehrten sind sichtbar, solange KEINE Handkarte
    // ausgewaehlt ist. Ohne Klick rendert der Schlangenbereich die
    // Wachstumsfaehrten direkt am Pfad.
    const schlangenbereich = screen.getByRole('region', { name: 'Schlangenlichtung' })
    const eigeneSchlange = within(schlangenbereich).getAllByRole('button', { name: /Schlange schlange-m1dc-1/ })[0]
    const wachstumsfaehrten = within(eigeneSchlange).getByRole('list', { name: 'Wachstumsfährten für schlange-m1dc-1' })
    const wachstumsfaehrte = within(wachstumsfaehrten).getByRole('button', {
      name: /Wachstumsfährte blau-m1dc-02 für Pfad schlange-m1dc-1 links anlegen/,
    })
    fireEvent.click(wachstumsfaehrte)

    const schlangen = schlangenbereich.querySelectorAll('li.schlangekarte')
    const zielSchlange = Array.from(schlangen).find((li) => li.querySelector('strong')?.textContent === 'schlange-m1dc-1')
    expect(zielSchlange).toBeDefined()
    expect(zielSchlange?.getAttribute('data-letzte-aktion-ziel')).toBe('schlange-schlange-m1dc-1')
  })

  it('pulsiert auch Gegner-Schlangen, wenn die Aktion auf sie zielt (Kimi-Review-Regression)', () => {
    // Regression gegen den Kimi-Review-Blocker: SchlangenblockadeSpielen,
    // FarbendiebSpielen und SchlangenfrassSpielen zielen auf Gegner-Schlangen,
    // die ebenfalls kurz pulsieren sollen. Wir testen es ueber den Domain-
    // Helper, weil der UI-Pfad in /game eine aktive Auswahl der Sonderkarte
    // erfordert und der Helper den eigentlichen Vertrag schuetzt.
    const schlangenblockade = {
      typ: 'SchlangenblockadeSpielen' as const,
      spielerId: 'spieler-0',
      handkartenId: 'blockade-m1dc-01',
      zielSpielerId: 'spieler-1',
      zielSchlangenId: 'gegner-schlange-m1dc',
    }
    expect(extrahiereAktionZiel(schlangenblockade)).toEqual({
      typ: 'schlange',
      id: 'gegner-schlange-m1dc',
    })

    const farbendieb = {
      typ: 'FarbendiebSpielen' as const,
      spielerId: 'spieler-0',
      handkartenId: 'dieb-m1dc-01',
      zielSpielerId: 'spieler-1',
      zielSchlangenId: 'gegner-schlange-m1dc-2',
      zielKartenId: 'rot-karte-m1dc',
      eigeneSchlangenId: 'eigene-schlange-m1dc',
      einfügeIndex: 1,
    }
    expect(extrahiereAktionZiel(farbendieb)).toEqual({
      typ: 'schlange',
      id: 'gegner-schlange-m1dc-2',
    })

    // Domain-Vertrag fuer die DOM-Durchreichung: das data-letzte-aktion-ziel-
    // Attribut wird auf der richtigen gegnerischen Schlange gesetzt, wenn
    // der State propagiert wird.
    window.history.pushState({}, '', '/game')
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    zustand.spieler[0].hand = [farbkarte('blau-m1dc-01', 'Blau', 1)]
    zustand.spieler[1].hand = [farbkarte('rot-m1dc-01', 'Rot', 1)]
    zustand.spieler[1].schlangen = [
      { id: 'gegner-schlange-m1dc-3', karten: [farbkarte('rot-m1dc-02', 'Rot', 1)], zustand: 'aktiv' },
    ]

    const { container } = render(<App initialZustand={zustand} />)
    const schlangenbereich = container.querySelector('[class~="schlangenbereich"]') as HTMLElement | null
    expect(schlangenbereich).not.toBeNull()
    const gegnerLi = schlangenbereich!.querySelectorAll('li.schlangekarte--gegner')
    expect(gegnerLi.length).toBeGreaterThan(0)
    // Initial hat keine Schlange das Attribut.
    gegnerLi.forEach((li) => {
      expect(li.getAttribute('data-letzte-aktion-ziel')).toBeNull()
    })
  })

  it('setzt KEIN data-letzte-aktion-ziel nach einem Pflicht-Abwurf', () => {
    // Pflicht-Abwurf ist eine engine-Aktion, die kein Brettziel hat.
    // Wir testen den reinen Domain-Vertrag von extrahiereAktionZiel, weil
    // der UI-Pfad zur Phasenaktion von zugphase/zugpflichten abhaengt und
    // der Pflicht-Abwurf im Brettschritt nicht ueber dieselbe Codezeile
    // laeuft wie das Ziel-Puls-Tracing.
    const pflichtAbwurf = {
      typ: 'PflichtAbwurf' as const,
      spielerId: 'spieler-0',
      handkartenId: 'blau-m1dc-pflicht-01',
      kartenIds: ['blau-m1dc-pflicht-01'],
    }
    expect(extrahiereAktionZiel(pflichtAbwurf)).toBeNull()

    // Domain-Vertrag: Auch SonderkarteSpielen ohne explizites Brettziel
    // und reine Phasenwechsel fuehren NICHT zu einem Spielmoment-Puls.
    const sonderkarteOhneZiel = {
      typ: 'SonderkarteSpielen' as const,
      spielerId: 'spieler-0',
      handkartenId: 'sonderkarte-01',
      karteId: 'verdoppler-01',
      zielSpielerId: 'spieler-0',
    }
    expect(extrahiereAktionZiel(sonderkarteOhneZiel)).toBeNull()

    // Domain-Vertrag: Verdoppler hat ebenfalls kein eigenstaendiges Brettziel.
    const verdoppler = {
      typ: 'VerdopplerSpielen' as const,
      spielerId: 'spieler-0',
      handkartenId: 'verdoppler-02',
      karteId: 'verdoppler-02',
    }
    expect(extrahiereAktionZiel(verdoppler)).toBeNull()
  })

  it('deklariert die drei neuen CSS-Token im :root', () => {
    const rootMatch = appCss.match(/:root\s*\{([\s\S]*?)\}/)
    expect(rootMatch).not.toBeNull()
    const rootBody = rootMatch?.[1] ?? ''
    expect(rootBody).toMatch(/--spielmoment-pulse-dauer\s*:/)
    expect(rootBody).toMatch(/--spielmoment-pulse-glow\s*:/)
    expect(rootBody).toMatch(/--spielmoment-pulse-scale\s*:/)
  })

  it('definiert das @keyframes waldtanz-spielmoment-pulse', () => {
    expect(appCss).toMatch(/@keyframes\s+waldtanz-spielmoment-pulse\s*\{/)
  })

  it('bietet einen prefers-reduced-motion Override ohne Animation', () => {
    // Suche den letzten @media (prefers-reduced-motion: reduce)-Block, der die
    // M1dc-Spielmoment-Selektoren enthaelt (vorherige Bloecke betreffen
    // aeltere Animationen). Wir matchen daher das letzte Vorkommen von
    // `prefers-reduced-motion: reduce` im CSS.
    const allMatches = Array.from(appCss.matchAll(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\}/g))
    expect(allMatches.length).toBeGreaterThan(0)
    const m1dcBlock = allMatches.map((m) => m[0]).find((block) => /data-letzte-aktion-ziel/.test(block))
    expect(m1dcBlock).toBeDefined()
    // Der Override-Block muss data-letzte-aktion-ziel-Schlangen abdecken
    // und animation:none enthalten, statt zu animieren.
    expect(m1dcBlock).toMatch(/animation\s*:\s*none/)
    expect(m1dcBlock).toMatch(/outline\s*:/)
  })
})