import { afterEach } from 'vitest'
import type { AufgabenkarteInfo, Ereignis, Farbe, SpielAktion, Spielzustand } from '../index'
import { AUFGABENNAMEN } from '../aufgabenKarten'
import { GRUNDAUSLAGE, legeAufgabenAus } from '../testing/aufgaben'
import type { Aufgabenauslage } from '../testing/aufgaben'
import type { Baukasten, Kartenwahl } from '../testing/szenario'
import { entferneTestbedingungen } from '../testing/testaufgaben'
import { handkarte } from './legen_hilfen'
import { aktionen, fuehreAus, FUENF, tischMitHaenden } from './zugablauf_hilfen'
import type { Schritt } from './zugablauf_hilfen'

/*
Hilfen für die Tests des Aufgabenrahmens (X1). Die 15 Aufgaben aus A9 prüft
erst X2; bis dahin sind sie Platzhalter, die nie erfüllt sind. Die Tests geben
einzelnen Aufgaben deshalb eine Testbedingung (`setzeTestbedingungen`, Bausteine
in `testing/testaufgaben.ts`), die mit der Bedingung auf der Karte nichts zu tun
hat. Nach jedem Test gelten wieder
die Platzhalter.
*/

afterEach(() => {
  entferneTestbedingungen()
})

export { FUENF }

/**
 * Zwei Spieler mit Erweiterung. Spieler 1 ist am Zug, hat die Schlange
 * Blau-Blau (`schlange-1`) und hält `hand0`; KI-Gegner 1 hält `hand1`.
 */
export function aufgabenTisch(hand0: Kartenwahl[] = FUENF, hand1: Kartenwahl[] = FUENF, auslage: Aufgabenauslage = GRUNDAUSLAGE): Baukasten {
  return tischMitHaenden([hand0, hand1], true)
    .schlange(0, ['Blau', 'Blau'])
    .aendere((zustand) => legeAufgabenAus(zustand, auslage))
}

/** Der Spieler am Zug legt eine Karte dieser Farbe ans Ende der Schlange `schlangenId` (A5, D9). */
export function legeAn(zustand: Spielzustand, farbe: Farbe, schlangenId = 'schlange-1'): Schritt {
  const karteId = handkarte(zustand, zustand.zug.spielerIndex, farbe)
  const aktion = aktionen(zustand, 'FarbkarteLegen').find(
    (eintrag) => eintrag.typ === 'FarbkarteLegen' && eintrag.karteId === karteId && eintrag.ziel.art === 'schlange' && eintrag.ziel.schlangenId === schlangenId && eintrag.ziel.seite === 'ende',
  )
  if (aktion === undefined) throw new Error(`Testaufbau: ${farbe} ans Ende von ${schlangenId} ist nicht aufgezählt`)
  return fuehreAus(zustand, aktion)
}

/** Die erste aufgezählte Aktion, die zur Wahl passt. */
export function erste(zustand: Spielzustand, passt: (aktion: SpielAktion) => boolean): SpielAktion {
  const aktion = aktionen(zustand).find(passt)
  if (aktion === undefined) throw new Error(`Testaufbau: keine passende Aktion unter ${JSON.stringify(aktionen(zustand))}`)
  return aktion
}

const AUFGABEN_EREIGNISSE: ReadonlySet<string> = new Set(['AufgabeErfuellt', 'AufgabeAufgedeckt', 'AufgabenstapelLeer'])

/** Nur die Ereignisse zu Aufgaben, in ihrer Reihenfolge. */
export function aufgabenEreignisse(ereignisse: Ereignis[]): Ereignis[] {
  return ereignisse.filter((ereignis) => AUFGABEN_EREIGNISSE.has(ereignis.typ))
}

export function namen(aufgaben: readonly AufgabenkarteInfo[]): string[] {
  return aufgaben.map((aufgabe) => aufgabe.name)
}

/** Die Id der Aufgabe mit diesem Namen (A9: `aufgabe-<Nummer>`). */
export function aufgabeId(name: string): string {
  const id = [...AUFGABENNAMEN].find(([, eintrag]) => eintrag === name)?.[0]
  if (id === undefined) throw new Error(`Testaufbau: Eine Aufgabe ${name} gibt es nicht`)
  return id
}
