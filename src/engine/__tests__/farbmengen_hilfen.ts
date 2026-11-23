import { expect, it } from 'vitest'
import type { Spielzustand } from '../index'
import type { AufgabenDefinition } from '../aufgaben/definition'
import { baukasten } from '../testing/szenario'
import type { Schlangenglied } from '../testing/szenario'

/*
Hilfen für die Entscheidungstabellen der Aufgaben aus Paket A von X2
(Farbenpracht, Farbharmonie, Farbkombination, Gelber Schatz, Lila Riese). Eine
Stellung sind die Schlangen von Spieler 1, gebaut aus echtem Material; die
Bedingung der Aufgabe wird direkt gefragt, ohne Zugablauf. Wann eine Aufgabe
geprüft und eingelöst wird, regelt der Rahmen (X1).
*/

/** Kurzschreibweise: `n` Karten derselben Wahl hintereinander. */
export function mal(anzahl: number, glied: Schlangenglied): Schlangenglied[] {
  return Array.from({ length: anzahl }, () => glied)
}

export const RS: Schlangenglied = 'Regenbogenschlange'
export const SPERRE: Schlangenglied = 'Schlangenblockade'

/** Eine Zeile der Entscheidungstabelle. */
export interface Stellung {
  fall: string
  /** Die Schlangen von Spieler 1, je von vorn nach hinten. */
  schlangen: Schlangenglied[][]
  /** Schlangen von KI-Gegner 1; sie zählen für Spieler 1 nie. */
  gegner?: Schlangenglied[][]
  erwartet: boolean
}

/** Zwei Spieler mit Erweiterung; Spieler 1 hat diese Schlangen, KI-Gegner 1 die aus `gegner`. */
export function stellung(schlangen: Schlangenglied[][], gegner: Schlangenglied[][] = []): Spielzustand {
  const bau = baukasten({ spielerzahl: 2, erweiterung: true })
  for (const glieder of schlangen) bau.schlange(0, glieder)
  for (const glieder of gegner) bau.schlange(1, glieder)
  return bau.zustand()
}

/** Prüft jede Zeile der Tabelle mit `istErfuellt` der Aufgabe für Spieler 1. */
export function pruefeTabelle(abschnitt: string, aufgabe: AufgabenDefinition, tabelle: readonly Stellung[]): void {
  it.each(tabelle)(`${abschnitt} ${aufgabe.name}: $fall`, ({ schlangen, gegner, erwartet }) => {
    const zustand = stellung(schlangen, gegner)
    expect(aufgabe.istErfuellt(zustand, 0), `${aufgabe.name}.istErfuellt für Spieler 1: erwartet ${erwartet}`).toBe(erwartet)
  })
}
