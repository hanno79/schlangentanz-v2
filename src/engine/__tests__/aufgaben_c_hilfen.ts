import type { SpielAktion, Sonderkartenname, Spielzustand } from '../index'
import { AUFGABENREGISTER } from '../aufgabenKarten'
import { istAufgabenPlatzhalter } from '../aufgaben/definition'
import { baukasten } from '../testing/szenario'
import type { Baukasten, Schlangenglied } from '../testing/szenario'
import { aktionen } from './zugablauf_hilfen'

/*
Hilfen für die Aufgaben aus Paket C von X2 (A9 Nr. 7 bis 10 und 12):
Fusionsexperte, Schlangenbeschwörer, Schlangenmeister, Schlangenrepertoire und
Schlangentanz. Die Entscheidungstabellen fragen die Bedingung einer Aufgabe
direkt ab; ob sie dann auch eingelöst wird, zeigen eigene Tests über den Rahmen
(X1), mit echten Zügen und ohne Testbedingung.
*/

/** Erfüllt Spieler `spieler` jetzt die Bedingung der Aufgabe `name` aus A9? Ein Platzhalter ist ein Testfehler, kein „nein“. */
export function erfuellt(name: string, zustand: Spielzustand, spieler = 0): boolean {
  const definition = AUFGABENREGISTER.get(name)
  if (definition === undefined) throw new Error(`Testaufbau: Eine Aufgabe ${name} gibt es in A9 nicht`)
  if (istAufgabenPlatzhalter(definition)) throw new Error(`erfuellt: Die Aufgabe ${name} ist noch ein Platzhalter; ihre Bedingung fehlt (X2)`)
  return definition.istErfuellt(zustand, spieler)
}

export interface Stellung {
  /** Die Schlangen von Spieler 1, höchstens zwei. */
  eigene?: Schlangenglied[][]
  /** Die Schlangen von KI-Gegner 1. */
  gegner?: Schlangenglied[][]
  /** Was Spieler 1 bisher an Sonderkarten ausgespielt hat (D36). */
  ausgespielt?: Sonderkartenname[]
  /** Was KI-Gegner 1 bisher an Sonderkarten ausgespielt hat (D36). */
  gegnerAusgespielt?: Sonderkartenname[]
}

/** Zwei Spieler mit Erweiterung, aus echtem Material; Spieler 1 ist am Zug. */
export function stellung({ eigene = [], gegner = [], ausgespielt = [], gegnerAusgespielt = [] }: Stellung): Baukasten {
  const bau = baukasten({ spielerzahl: 2, erweiterung: true })
  for (const glieder of eigene) bau.schlange(0, glieder)
  for (const glieder of gegner) bau.schlange(1, glieder)
  return bau.aendere((zustand) => {
    zustand.spieler[0].ausgespielteSonderkarten = [...ausgespielt]
    zustand.spieler[1].ausgespielteSonderkarten = [...gegnerAusgespielt]
  })
}

/** Eine Zeile einer Entscheidungstabelle: Stellung, Erwartung für Spieler 1 und warum. */
export interface Zeile {
  fall: string
  stellung: Stellung
  erwartet: boolean
}

/** Die erste aufgezählte Farbkarte, die eine neue eigene Schlange beginnt (A5). */
export function neueSchlange(zustand: Spielzustand): SpielAktion {
  const aktion = aktionen(zustand, 'FarbkarteLegen').find((eintrag) => eintrag.typ === 'FarbkarteLegen' && eintrag.ziel.art === 'neueSchlange')
  if (aktion === undefined) throw new Error('Testaufbau: Eine neue Schlange ist nicht aufgezählt')
  return aktion
}
