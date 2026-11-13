import type { Spielzustand } from '../engine'
import { baukasten } from '../engine/testing/szenario'
import { starteEntwicklerPartie } from './partie'

export interface Szenario {
  /** Steht in der Adresse: `/dev?szenario=<name>`. */
  name: string
  beschreibung: string
  /** Was der Prüfer am Tisch sehen soll. */
  erwartet: string
  erzeuge: () => Spielzustand
}

/*
Die Startszenarien kommen aus `erstellePartie` mit fester Saat, die übrigen aus
dem Szenario-Baukasten der Engine, also aus echtem Material. Einzige Ausnahme ist
das absichtlich kaputte Szenario, an dem man sieht, wie eine verletzte Invariante
aussieht.

Nach E1 lässt sich eine Partie aufbauen, aber noch nicht spielen: Die Engine
zählt keine Aktion auf. Szenarien zum Spielen bringen E2 und die Kartentasks.
*/
export const SZENARIEN: readonly Szenario[] = [
  {
    name: 'start-2',
    beschreibung: 'Neue Partie aus Saat 1 mit zwei Spielern, ohne Erweiterung (A4).',
    erwartet:
      'Partiephase Laufend, Spieler 1 am Zug im Teilzug 1. Je Spieler 5 offene Handkarten und ein leerer eigener Ablagestapel, 98 Karten im Nachziehstapel, keine Aufgaben, keine Comeback- oder Risiko-Karten. Keine Aktionsknöpfe, alle Invarianten erfüllt.',
    erzeuge: () => starteEntwicklerPartie(1, 2, false),
  },
  {
    name: 'start-4',
    beschreibung: 'Neue Partie aus Saat 4 mit vier Spielern, ohne Erweiterung (A4).',
    erwartet:
      'Vier Spieler mit je 5 Handkarten und eigenem leeren Ablagestapel, 88 Karten im Nachziehstapel, Spieler 1 (Mensch) entscheidet. Keine Aktionsknöpfe, alle Invarianten erfüllt.',
    erzeuge: () => starteEntwicklerPartie(4, 4, false),
  },
  {
    name: 'start-erweiterung',
    beschreibung: 'Neue Partie aus Saat 3 mit drei Spielern und Erweiterung (A1, A4).',
    erwartet:
      'Erweiterung: mit. 112 Karten im Spiel (97 im Nachziehstapel), 3 offene Aufgaben, je Spieler eine geheime Aufgabe, 1 Comeback- und 2 Risiko-Belohnungs-Karten offen vor jedem Spieler, 9 Aufgaben im Stapel. Alle Invarianten erfüllt.',
    erzeuge: () => starteEntwicklerPartie(3, 3, true),
  },
  {
    name: 'alle-orte',
    beschreibung:
      'Aus dem Baukasten: drei Spieler mit Erweiterung, Karten an jedem Ort, den der Zustand kennt (Schlange, unter einer Fusion, Ablagestapel, ausliegende Grube, schwebende Karte, aus dem Spiel).',
    erwartet:
      'Spieler 1 hat eine Schlange mit einer Farbenfusion über zwei gelben Karten, Spieler 2 eine mit Blockade. Vor Spieler 3 liegt eine Schlangengrube von Spieler 1. Eine Schlangengrube von Spieler 2 auf Spieler 3 schwebt, Spieler 3 entscheidet. Der Schlangenkorb liegt aus dem Spiel. Alle Invarianten erfüllt.',
    erzeuge: () =>
      baukasten({ spielerzahl: 3, erweiterung: true })
        .schlange(0, ['Blau', 'Blau', { fusion: ['Gelb', 'Gelb'] }, 'Rot'])
        .schlange(1, ['Rot', 'Schlangenblockade', 'Rot', 'Regenbogenschlange'])
        .ablage(0, ['Farbendieb', 'Grün'])
        .ablage(2, ['Farbenschutz'])
        .grube(0, 2)
        .ausDemSpiel(['Schlangenkorb des Glücks'])
        .schwebend(
          1,
          'Schlangengrube',
          (karteId, spielerId) => ({ typ: 'SchlangengrubeSpielen', spielerId, karteId, zielSpielerId: 'spieler-3' }),
          [2],
        )
        .haendeAuffuellen()
        .amZug(1)
        .zustand(),
  },
  {
    name: 'kaputt-doppelte-karte',
    beschreibung: 'Absichtlich kaputt: Die erste Handkarte von Spieler 1 liegt zusätzlich in der Hand von Spieler 2.',
    erwartet:
      'Drei Invarianten sind verletzt und rot: „Jede Spielkarte liegt genau einmal an genau einem Ort“ nennt die doppelte Karte, „Alle Ids sind eindeutig“ ebenso, und beim Laden lehnt die Engine den Stand ab.',
    erzeuge: () => {
      const zustand = starteEntwicklerPartie(1, 2, false)
      zustand.spieler[1].hand.push(zustand.spieler[0].hand[0])
      return zustand
    },
  },
]

export function findeSzenario(name: string): Szenario | undefined {
  return SZENARIEN.find((szenario) => szenario.name === name)
}
