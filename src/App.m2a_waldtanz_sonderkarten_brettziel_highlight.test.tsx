/*
 * Author: rahn
 * Datum: 27.06.2026
 * Version: 1.0
 * Beschreibung: M2a RED-Tests fuer das automatische Sonderkarten-Brettziel-Highlight
 *              auf /game. Wenn der Spieler eine Sonderkarte auswaehlt und ein legales
 *              Ziel existiert, soll das Brett-Ziel automatisch leuchten — OHNE dass
 *              der Spieler den "Zum Brett-Ziel"-Link in der Handbuehne anklicken muss.
 *              - Sonderkarte auswaehlen -> passender zielspurKey wird auto-aktiv
 *              - Sonderkarte abwaehlen -> Highlight wird zurueckgesetzt
 *              - Sonderkarte ohne legales Ziel -> kein Highlight
 *              - Farbenschutz/Schlangenfrass-Detail-Schluessel korrekt
 *              - package.json smoke:production chain enthaelt M2a
 */
import { beforeEach, describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render } from '@testing-library/react'
import App from './App'
import { ermittleAutoHighlightZielspurKey } from './components/waldtanzZielspurLogik'
import {
  erstelleSpielzustand,
  starteAusspielphase,
  type FarbkarteInfo,
  type FarbenschutzSpielenAktion,
  type SchlangenfrassSpielenAktion,
  type SonderkarteInfo,
  type Spielzustand,
} from './engine'

const packageJsonRaw = readFileSync(resolve(__dirname, '../package.json'), 'utf8')
const packageJson = JSON.parse(packageJsonRaw) as { scripts: Record<string, string> }

function bauZustandMitSchlangenfrassInHand(): Spielzustand {
  // Schlangenfrass braucht mindestens eine gegnerische Schlange
  // mit passender Farbe ODER eine eigene Schlange mit mindestens 1 Karte.
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.42))
  const schlangenfrass: SonderkarteInfo = {
    typ: 'Sonderkarte',
    id: 'schlangenfrass-m2a-1',
    name: 'Schlangenfrass',
  }
  zustand.spieler[0].hand = [schlangenfrass, ...zustand.spieler[0].hand.slice(1)]
  const eigeneKarte: FarbkarteInfo = {
    typ: 'Farbkarte',
    id: 'gruen-m2a-1',
    farbe: 'Grün',
    punkte: 3,
  }
  zustand.spieler[0].schlangen = [
    {
      id: 'eigene-schlange-m2a-1',
      zustand: 'aktiv',
      karten: [eigeneKarte],
    },
  ]
  return zustand
}

function bauZustandMitFarbenschutzInHand(): Spielzustand {
  // Farbenschutz braucht eine eigene aktive Schlange.
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.42))
  const farbenschutz: SonderkarteInfo = {
    typ: 'Sonderkarte',
    id: 'farbenschutz-m2a-1',
    name: 'Farbenschutz',
  }
  zustand.spieler[0].hand = [farbenschutz, ...zustand.spieler[0].hand.slice(1)]
  const eigeneKarte: FarbkarteInfo = {
    typ: 'Farbkarte',
    id: 'rot-m2a-1',
    farbe: 'Rot',
    punkte: 2,
  }
  zustand.spieler[0].schlangen = [
    {
      id: 'eigene-schlange-m2a-2',
      zustand: 'aktiv',
      karten: [eigeneKarte],
    },
  ]
  return zustand
}

function bauZustandMitSonderkarteOhneLegalesZiel(): Spielzustand {
  // Sonderkarte in Hand, aber Gegner hat keine Schlangen und eigene ist leer.
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.42))
  zustand.spieler[0].schlangen = []
  zustand.spieler[1].schlangen = []
  const schlangenfrass: SonderkarteInfo = {
    typ: 'Sonderkarte',
    id: 'schlangenfrass-m2a-3',
    name: 'Schlangenfrass',
  }
  zustand.spieler[0].hand = [schlangenfrass, ...zustand.spieler[0].hand.slice(1)]
  return zustand
}

describe('M2a Waldtanz-Sonderkarten-Brettziel-Auto-Highlight', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/game')
  })

  it('RED-1: App rendert /game ohne Sonderkarten-Auto-Highlight (kein auto-aktives Brett-Ziel)', () => {
    const { container } = render(<App />)
    // Initial ist KEINE Sonderkarte ausgewaehlt → KEIN auto-aktives Brett-Ziel.
    const zielspurAktiv = container.querySelectorAll('[data-zielspur-key].waldtanz-zielspur-ziel--aktiv')
    expect(zielspurAktiv.length).toBe(0)
  })

  it('RED-2: Schlangenfrass-Logik liefert `frass:<aktiverSpielerId>:<schlangeId>:<kartenId>` als Auto-Key', () => {
    const zustand = bauZustandMitSchlangenfrassInHand()
    const schlangenfrassAktion: SchlangenfrassSpielenAktion = {
      typ: 'SchlangenfrassSpielen',
      spielerId: zustand.spieler[0].id,
      handkartenId: 'schlangenfrass-m2a-1',
      ziele: [{ spielerId: zustand.spieler[0].id, schlangenId: 'eigene-schlange-m2a-1', kartenId: 'gruen-m2a-1' }],
    }
    const result = ermittleAutoHighlightZielspurKey({
      ausgewaehlteHandkarteId: 'schlangenfrass-m2a-1',
      aktiverSpielerId: zustand.spieler[0].id,
      aktiverSpielerSchlangen: zustand.spieler[0].schlangen,
      farbenschutzAktionen: [],
      farbenfusionAktionen: [],
      schlangenfrassAktionen: [schlangenfrassAktion],
    })
    expect(result).toBe(`frass:${zustand.spieler[0].id}:eigene-schlange-m2a-1:gruen-m2a-1`)
  })

  it('RED-3: Farbenschutz-Logik liefert `schutz:<schlangenId>` als Auto-Key', () => {
    const zustand = bauZustandMitFarbenschutzInHand()
    const farbenschutzAktion: FarbenschutzSpielenAktion = {
      typ: 'FarbenschutzSpielen',
      spielerId: zustand.spieler[0].id,
      handkartenId: 'farbenschutz-m2a-1',
      zielSchlangenId: 'eigene-schlange-m2a-2',
    }
    const result = ermittleAutoHighlightZielspurKey({
      ausgewaehlteHandkarteId: 'farbenschutz-m2a-1',
      aktiverSpielerId: zustand.spieler[0].id,
      aktiverSpielerSchlangen: zustand.spieler[0].schlangen,
      farbenschutzAktionen: [farbenschutzAktion],
      farbenfusionAktionen: [],
      schlangenfrassAktionen: [],
    })
    expect(result).toBe('schutz:eigene-schlange-m2a-2')
  })

  it('RED-4: Sonderkarte ohne legales Ziel liefert `null` (kein Highlight)', () => {
    const zustand = bauZustandMitSonderkarteOhneLegalesZiel()
    const result = ermittleAutoHighlightZielspurKey({
      ausgewaehlteHandkarteId: 'schlangenfrass-m2a-3',
      aktiverSpielerId: zustand.spieler[0].id,
      aktiverSpielerSchlangen: zustand.spieler[0].schlangen,
      farbenschutzAktionen: [],
      farbenfusionAktionen: [],
      schlangenfrassAktionen: [],
    })
    expect(result).toBeNull()
  })

  it('RED-5: Keine Handkarte ausgewaehlt liefert `null` (kein Highlight)', () => {
    const result = ermittleAutoHighlightZielspurKey({
      ausgewaehlteHandkarteId: null,
      aktiverSpielerId: 'spieler-1',
      aktiverSpielerSchlangen: [],
      farbenschutzAktionen: [],
      farbenfusionAktionen: [],
      schlangenfrassAktionen: [],
    })
    expect(result).toBeNull()
  })

  it('RED-6: package.json smoke:production enthaelt M2a-Smoke-Skript', () => {
    const chain = packageJson.scripts['smoke:production'] ?? ''
    expect(chain).toMatch(/m2a_waldtanz_sonderkarten_brettziel_highlight/)
  })
})
