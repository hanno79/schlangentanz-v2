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
import type { SpielerWertungsEintrag, Spielzustand } from '../engine'

export interface SpielerLage {
  id: string
  name: string
  /**
   * Die **öffentlich bekannten** Punkte: Farbgruppen und beanspruchte offene
   * Aufgaben. Die geheime Aufgabe zählt hier nicht — sie zählt in der
   * Schlusswertung, und dort für alle.
   */
  punkte: number
  schlangen: number
  handkarten: number
  istAmZug: boolean
  /** Dieser Spieler wird beim nächsten Mal übersprungen (Schlangengrube). */
  setztAus: boolean
  istMensch: boolean
}

/**
 * Punkte ohne den geheimen Anteil.
 *
 * Die geheime Aufgabe zu verbergen genügt nicht, wenn ihre Punkte sie verraten:
 * Erfüllte ein KI-Gegner seine geheime Aufgabe, sprang seine angezeigte
 * Punktzahl um genau deren Wert — daraus ließ sich ablesen, welche es war.
 *
 * Abgezogen wird der Betrag, den die Engine selbst ausweist. Nachgerechnet
 * würde er hier zum zweiten Mal — mitsamt der Endspurt-Verdopplung, die genau
 * an einer Stelle stehen soll.
 *
 * Das gilt auch für den Menschen: Zwei Zahlen mit verschiedener Bedeutung
 * nebeneinander wären schlechter als eine ehrliche. Was seine geheime Aufgabe
 * wert ist, sagt ihm `geheimeAufgabeDesMenschen`.
 */
function oeffentlichePunkte(eintrag: SpielerWertungsEintrag | undefined): number {
  if (eintrag === undefined) return 0
  return eintrag.gesamtPunkte - eintrag.wertung.aufgabenPunkte.geheimePunkte
}

export function ermittleSpielerLagen(zustand: Spielzustand): SpielerLage[] {
  const wertung = berechneSpielzustandGesamtwertung(zustand)
  const aussetzend = new Set(zustand.aussetzenSpielerIndizes)

  return zustand.spieler.map((spieler, index) => ({
    id: spieler.id,
    name: spieler.name,
    punkte: oeffentlichePunkte(wertung.spielerwertungen.find((eintrag) => eintrag.spielerId === spieler.id)),
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
export function geheimeAufgabeDesMenschen(
  zustand: Spielzustand,
): { text: string; erfuellt: boolean; punkte: number } | null {
  const mensch = zustand.spieler.find((spieler) => spieler.steuerung === 'Mensch')
  if (!mensch) return null
  return {
    text: `${mensch.geheimeAufgabe.name}: ${mensch.geheimeAufgabe.bedingung}`,
    erfuellt: mensch.geheimeAufgabeErfuellt === true,
    /* Da die geheimen Punkte aus der laufenden Anzeige herausgenommen sind,
       muss wenigstens der Mensch wissen, was seine eigene wert ist. */
    punkte: mensch.geheimeAufgabe.punkte,
  }
}
