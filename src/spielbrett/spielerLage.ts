/*
Author: Claude Code (G-5)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Was der Spieler über sich und seine Gegner wissen muss.

Sammelt pro Spieler zusammen, was sonst über mehrere Panels verstreut wäre —
und was teilweise gar nicht sichtbar war:

**`setztAus` kam vor diesem Paket in keiner einzigen `.tsx`-Datei vor.** Die
Schlangengrube lässt einen Spieler eine Runde aussetzen; die Engine führt das in
`aussetzenSpielerIndizes` (`types.ts:136`) und verbraucht den Eintrag beim
Zugende. Auf dem Brett war davon nichts zu sehen — weder wurde man gewarnt, dass
man selbst aussetzt, noch dass ein Gegner übersprungen wird.
*/

import { berechneSpielzustandGesamtwertung } from '../engine'
import type { Spielzustand } from '../engine'

export interface SpielerLage {
  id: string
  name: string
  punkte: number
  schlangen: number
  handkarten: number
  istAmZug: boolean
  /** Dieser Spieler wird beim nächsten Mal übersprungen (Schlangengrube). */
  setztAus: boolean
  istMensch: boolean
}

export function ermittleSpielerLagen(zustand: Spielzustand): SpielerLage[] {
  const wertung = berechneSpielzustandGesamtwertung(zustand)
  const aussetzend = new Set(zustand.aussetzenSpielerIndizes)

  return zustand.spieler.map((spieler, index) => ({
    id: spieler.id,
    name: spieler.name,
    punkte: wertung.spielerwertungen.find((eintrag) => eintrag.spielerId === spieler.id)?.gesamtPunkte ?? 0,
    schlangen: spieler.schlangen.length,
    handkarten: spieler.hand.length,
    istAmZug: index === zustand.aktiverSpielerIndex,
    setztAus: aussetzend.has(index),
    istMensch: spieler.steuerung === 'Mensch',
  }))
}

/**
 * Die geheime Aufgabe — aber nur die des Menschen.
 *
 * `GAME_SPEC` verlangt, dass verdeckte Information verdeckt bleibt. Die geheime
 * Aufgabe eines KI-Gegners darf nie auf dem Brett stehen, auch nicht, während
 * dieser am Zug ist.
 */
export function geheimeAufgabeDesMenschen(zustand: Spielzustand): { text: string; erfuellt: boolean } | null {
  const mensch = zustand.spieler.find((spieler) => spieler.steuerung === 'Mensch')
  if (!mensch) return null
  return {
    text: `${mensch.geheimeAufgabe.name}: ${mensch.geheimeAufgabe.bedingung}`,
    erfuellt: mensch.geheimeAufgabeErfuellt === true,
  }
}
