/*
Author: rahn
Datum: 24.06.2026
Version: 1.0
Beschreibung: testPhaseHook liefert den /game?phase=... Test-Hook, der die App
              in einer festen Phase (spielende / endspurt) startet. Wird
              ausschliesslich von Browser-Smoke-Tests aufgerufen
              (scripts/m1e_waldtanz_spieluhr_smoke.mjs). Normalen Usern ist
              die URL unbekannt, der Hook hat keinen sichtbaren Effekt.
              Aus App.tsx extrahiert, damit App.tsx unter dem 500-Zeilen-Budget
              bleibt.
*/

import type { Spielzustand } from './engine'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

export function leseTestPhaseAusUrl(): Spielzustand | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const phase = params.get('phase')
  if (phase === 'spielende') {
    const z = starteAusspielphase(erstelleSpielzustand(2))
    z.zugphase = 'Spielende'
    z.spielphase = 'Beendet'
    z.nachziehstapel = []
    z.endrunde = { ausloeserSpielerIndex: 0, verbleibendeSpielerIndizes: [] }
    return z
  }
  if (phase === 'endspurt') {
    const z = starteAusspielphase(erstelleSpielzustand(2))
    z.spielphase = 'Endspurt'
    z.nachziehstapel = []
    z.endrunde = { ausloeserSpielerIndex: 0, verbleibendeSpielerIndizes: [1] }
    return z
  }
  if (phase === 'zugabschluss') {
    // M1dh: Test-Hook fuer die End-Turn-Pille am Brettrand. Setzt den aktiven
    // menschlichen Spieler (Index 0) in die Zugabschluss-Phase, ohne Ueberhand
    // (Handlaenge unter HANDKARTENLIMIT). Die App rendert dann die
    // End-Turn-Spielpille in der Handbuehne.
    const z = starteAusspielphase(erstelleSpielzustand(2))
    z.zugphase = 'Zugabschluss'
    return z
  }
  return null
}
