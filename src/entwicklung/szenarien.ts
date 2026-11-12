import { starteAusspielphase } from '../engine'
import type { Spielzustand } from '../engine'
import { spieleZufaelligBis, starteEntwicklerPartie } from './partie'
import { erzeugeZufall } from './zufall'

export interface Szenario {
  /** Steht in der Adresse: `/dev?szenario=<name>`. */
  name: string
  beschreibung: string
  /** Was der Prüfer am Tisch sehen soll. */
  erwartet: string
  erzeuge: () => Spielzustand
}

/** Spielt die Partie aus `saat` zufällig, aber reproduzierbar, bis `ziel` gilt. */
function gespieltBis(saat: number, spieler: number, ziel: (zustand: Spielzustand) => boolean): Spielzustand {
  return spieleZufaelligBis(starteEntwicklerPartie(saat, spieler), erzeugeZufall(saat), ziel)
}

/*
Die Szenarien entstehen aus der Engine: eine Partie aus fester Saat, danach nur
aufgezählte Aktionen und Phasenschritte. Damit ist jeder Zustand einer, den das
Spiel wirklich erreicht. Einzige Ausnahme ist das absichtlich kaputte Szenario,
an dem man sieht, wie eine verletzte Invariante aussieht.

Die Regeln sind die der heutigen Engine (P0.4 ändert kein Verhalten). E1 und E2
ziehen die Szenarien auf die neue Aktionsschicht um.
*/
export const SZENARIEN: readonly Szenario[] = [
  {
    name: 'partiebeginn',
    beschreibung: 'Neue Partie aus Saat 1 mit zwei Spielern, vor dem ersten Zug.',
    erwartet:
      'Zugphase Nachziehphase, je Spieler fünf offene Handkarten, keine Aktionsknöpfe, nur der Phasenknopf „Ausspielphase starten“.',
    erzeuge: () => starteEntwicklerPartie(1, 2),
  },
  {
    name: 'ausspielphase',
    beschreibung: 'Saat 1, zwei Spieler, Spieler 1 hat die Ausspielphase begonnen.',
    erwartet:
      'Je aufgezählte Aktion ein Knopf. „Ausspielphase beenden“ lehnt die Engine ab, solange keine Karte gespielt ist; der Grund steht rot da.',
    erzeuge: () => starteAusspielphase(starteEntwicklerPartie(1, 2)),
  },
  {
    name: 'vier-spieler',
    beschreibung: 'Saat 4, vier Spieler, Ausspielphase des ersten Spielers.',
    erwartet: 'Vier Spieler mit offenen Händen, Aktionsknöpfe für Spieler 1, keine verletzte Invariante.',
    erzeuge: () => starteAusspielphase(starteEntwicklerPartie(4, 4)),
  },
  {
    name: 'reaktionsfenster',
    beschreibung: 'Saat 3, drei Spieler, gespielt bis zur ersten Sonderkarte, auf die ein Gegner reagieren muss.',
    erwartet:
      'Das offene Reaktionsfenster steht im Kopf. Die Knöpfe sind nur die Reaktionen des angegriffenen Spielers (Abwehren, falls er einen Farbenschutz hat, und Durchlassen).',
    erzeuge: () => gespieltBis(3, 3, (zustand) => zustand.pendingReaktion !== null),
  },
  {
    name: 'zugabschluss',
    beschreibung: 'Saat 1, zwei Spieler, gespielt bis zum ersten Zugabschluss.',
    erwartet:
      'Zugphase Zugabschluss mit den Knöpfen „Überzählige Handkarten abwerfen“ und „Zug beenden“; Abwerfen lehnt die Engine ab, wenn die Hand nicht über dem Limit ist.',
    erzeuge: () => gespieltBis(1, 2, (zustand) => zustand.zugphase === 'Zugabschluss'),
  },
  {
    name: 'endspurt',
    beschreibung: 'Saat 1, drei Spieler, gespielt bis der Nachziehstapel leer ist und der Endspurt beginnt.',
    erwartet: 'Spielphase Endspurt, leerer oder fast leerer Nachziehstapel, die Endrunde nennt die verbleibenden Spieler.',
    erzeuge: () => gespieltBis(1, 3, (zustand) => zustand.spielphase === 'Endspurt'),
  },
  {
    name: 'spielende',
    beschreibung: 'Saat 1, drei Spieler, zufällig zu Ende gespielt.',
    erwartet: 'Zugphase Spielende, keine Knöpfe, die Wertung nennt Punkte je Spieler und den Gewinner.',
    erzeuge: () => gespieltBis(1, 3, (zustand) => zustand.zugphase === 'Spielende'),
  },
  {
    name: 'kaputt-doppelte-karte',
    beschreibung: 'Absichtlich kaputt: Die erste Handkarte von Spieler 1 liegt zusätzlich in der Hand von Spieler 2.',
    erwartet:
      'Zwei Invarianten sind verletzt und rot: „Jede Spielkarte liegt genau einmal im Spiel“ nennt die doppelte Karte, und beim Laden lehnt die Engine die doppelte Id ab.',
    erzeuge: () => {
      const zustand = starteEntwicklerPartie(1, 2)
      zustand.spieler[1].hand.push(zustand.spieler[0].hand[0])
      return zustand
    },
  },
]

export function findeSzenario(name: string): Szenario | undefined {
  return SZENARIEN.find((szenario) => szenario.name === name)
}
