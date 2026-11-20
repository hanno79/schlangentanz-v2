import type { Spielzustand } from '../engine'
import { baukasten } from '../engine/testing/szenario'
import type { Baukasten } from '../engine/testing/szenario'
import { erzeugeZufall } from '../engine/testing/zufall'
import { starteEntwicklerPartie } from './partie'
import { WERTUNGS_SZENARIEN } from './szenarienWertung'

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

Seit E2 lässt sich jedes Szenario mit Klicks weiterspielen. Die Szenarien des
Zugablaufs mischen mit fester Saat und geben die Karten von oben aus; nur die
Karten, auf die es ankommt, sind fest gewählt.
*/

/** Ein Tisch ohne Erweiterung, gemischt mit dieser Saat. */
function gemischt(spielerzahl: number, saat: number): Baukasten {
  return baukasten({ spielerzahl, erweiterung: false, zufall: erzeugeZufall(saat) })
}

/** Gibt dem Spieler die obersten `anzahl` Karten des gemischten Nachziehstapels auf die Hand. */
function oberste(bau: Baukasten, spieler: number, anzahl: number): Baukasten {
  return bau.hand(spieler, bau.frei().slice(0, anzahl).map((karte) => ({ id: karte.id })))
}

/** Gibt jedem Spieler der Reihe nach so viele Karten von oben, wie `anzahlen` nennt. */
function verteile(bau: Baukasten, anzahlen: number[]): Baukasten {
  anzahlen.forEach((anzahl, spieler) => oberste(bau, spieler, anzahl))
  return bau
}

function zugablaufSzenarien(): Szenario[] {
  return [
    {
      name: 'stapel-fast-leer',
      beschreibung:
        'A10: Zwei Spieler, im Nachziehstapel liegen noch 2 Karten. Spieler 1 ist am Zug und hält 5 Karten, KI-Gegner 1 hält nur 2 (Rot und Farbenschutz).',
      erwartet:
        'Spieler 1 spielt eine Karte und beendet den Zug: Er zieht 1 Karte, KI-Gegner 1 ist dran und füllt zu Zugbeginn auf, bekommt aber nur noch die letzte Karte (3 Handkarten). Ereignisse: KartenGezogen, ZugBegonnen, KartenGezogen, SchlussrundeBegonnen (ausgelöst von KI-Gegner 1). KI-Gegner 1 spielt seinen Zug normal zu Ende und zieht beim Beenden nichts. Danach hat Spieler 1 einen letzten Zug ohne Nachziehen; nach dessen „Zug beenden“ ist die Partie beendet.',
      erzeuge: () => oberste(gemischt(2, 11).hand(1, ['Rot', 'Farbenschutz']), 0, 5).stapelBehalten(2).zustand(),
    },
    {
      name: 'schlussrunde-2',
      beschreibung: 'A10: Zwei Spieler in der Schlussrunde. Spieler 1 hat die letzte Karte gezogen und spielt seinen Zug zu Ende.',
      erwartet:
        'Partiephase Schlussrunde, ausgelöst von Spieler 1, Nachziehstapel leer. Spieler 1 spielt eine oder zwei Karten und beendet den Zug, ohne nachzuziehen. Dann hat KI-Gegner 1 genau einen letzten Zug, ebenfalls ohne Nachziehen. Nach dessen „Zug beenden“: Ereignis PartieBeendet, Partiephase Beendet, kein Aktionsknopf mehr, die Wertung nennt den Gewinner.',
      erzeuge: () => gemischt(2, 12).haendeAuffuellen().schlussrunde(0).amZug(0).zustand(),
    },
    {
      name: 'schlussrunde-4',
      beschreibung: 'A10: Vier Spieler in der Schlussrunde. KI-Gegner 2 hat die letzte Karte gezogen und ist am Zug.',
      erwartet:
        'Nach dem Zug von KI-Gegner 2 hat jeder andere genau einen letzten Zug, im Uhrzeigersinn: KI-Gegner 3, Spieler 1, KI-Gegner 1. Niemand zieht nach. KI-Gegner 2 kommt nicht mehr dran: Nach dem „Zug beenden“ von KI-Gegner 1 ist die Partie beendet.',
      erzeuge: () => gemischt(4, 13).haendeAuffuellen().schlussrunde(2).amZug(2).zustand(),
    },
    {
      name: 'aussetzen',
      beschreibung:
        'A7.6: Drei Spieler. Vor KI-Gegner 1 liegt eine Schlangengrube, die Spieler 1 gespielt hat; KI-Gegner 1 hält 3 Karten. Spieler 1 ist am Zug.',
      erwartet:
        'Spieler 1 spielt eine Karte und beendet den Zug. Ereignisse: KartenGezogen (Spieler 1), Ausgesetzt (KI-Gegner 1), ZugBegonnen (KI-Gegner 2). KI-Gegner 1 zieht nicht und behält seine 3 Karten (D18); die Grube liegt nun auf dem Ablagestapel von Spieler 1, keine Grube mehr aus. Spielt man weiter, füllt KI-Gegner 1 zu Beginn seines nächsten Zuges auf 5 auf.',
      erzeuge: () => verteile(gemischt(3, 14).grube(0, 1), [5, 3, 5]).zustand(),
    },
    {
      name: 'nur-farbenschutz',
      beschreibung: 'A5: Spieler 1 hält nur drei Farbenschutz und ist am Zug.',
      erwartet:
        'Drei Knöpfe SonderkarteWirkungslosAblegen (je ein Farbenschutz), kein „Zug beenden“. Nach einem bleibt nur ZugBeenden (höchstens eine Sonderkarte je Zug); der Farbenschutz liegt auf dem Ablagestapel von Spieler 1. „Zug beenden“ füllt auf 5 auf (KartenGezogen: Spieler 1 zieht 3), dann ist KI-Gegner 1 dran.',
      erzeuge: () => oberste(gemischt(2, 15).hand(0, ['Farbenschutz', 'Farbenschutz', 'Farbenschutz']), 1, 5).zustand(),
    },
    {
      name: 'nur-sonderkarten',
      beschreibung:
        'A5, D13: Spieler 1 hält nur Sonderkarten (Regenbogenschlange, Schlangenblockade, Farbendieb, Schlangenfrass, Farbenfusion); niemand hat eine Schlange.',
      erwartet:
        'Ohne Schlange am Tisch hat keine der fünf Karten ein Ziel: fünf Knöpfe SonderkarteWirkungslosAblegen, kein „Zug beenden“ (mindestens eine Karte). Nach einem bleibt nur ZugBeenden (D12); die Karte liegt auf dem Ablagestapel von Spieler 1.',
      erzeuge: () =>
        oberste(gemischt(2, 16).hand(0, ['Regenbogenschlange', 'Schlangenblockade', 'Farbendieb', 'Schlangenfrass', 'Farbenfusion']), 1, 5).zustand(),
    },
  ]
}

export const SZENARIEN: readonly Szenario[] = [
  {
    name: 'start-2',
    beschreibung: 'Neue Partie aus Saat 1 mit zwei Spielern, ohne Erweiterung (A4).',
    erwartet:
      'Partiephase Laufend, Spieler 1 am Zug im Teilzug 1. Je Spieler 5 offene Handkarten und ein leerer eigener Ablagestapel, 98 Karten im Nachziehstapel, keine Aufgaben, keine Comeback- oder Risiko-Karten. Aktionsknöpfe nur für Spieler 1 (Karten, noch kein „Zug beenden“), alle Invarianten erfüllt.',
    erzeuge: () => starteEntwicklerPartie(1, 2, false),
  },
  {
    name: 'start-4',
    beschreibung: 'Neue Partie aus Saat 4 mit vier Spielern, ohne Erweiterung (A4).',
    erwartet:
      'Vier Spieler mit je 5 Handkarten und eigenem leeren Ablagestapel, 88 Karten im Nachziehstapel, Spieler 1 (Mensch) entscheidet. Aktionsknöpfe nur für Spieler 1 (Karten, noch kein „Zug beenden“), alle Invarianten erfüllt.',
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
      'Spieler 1 hat eine Schlange mit einer Farbenfusion über zwei gelben Karten, KI-Gegner 1 eine mit Blockade und Regenbogenschlange. Vor KI-Gegner 2 liegt eine Schlangengrube von Spieler 1. KI-Gegner 1 ist am Zug; seine Schlangengrube auf KI-Gegner 2 schwebt, deshalb entscheidet KI-Gegner 2. Der Schlangenkorb liegt aus dem Spiel. Alle Invarianten erfüllt.',
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
  ...WERTUNGS_SZENARIEN,
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
  ...zugablaufSzenarien(),
]

export function findeSzenario(name: string): Szenario | undefined {
  return SZENARIEN.find((szenario) => szenario.name === name)
}
