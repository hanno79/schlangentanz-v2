/*
Ein Zug in fünf Schritten (O9, Kriterium 2).

Jeder Satz steht wörtlich in der Spielanleitung (Teil A der Spec) oder in einer
Antwort des Autors (Teil D) und nennt seine Stelle; `zugschritte.test.ts`
prüft das gegen `docs/GAME_SPEC.md`. So behauptet die Zusammenfassung nichts,
was dort nicht steht (U2). Wo Teil D die Website ergänzt, folgt sie Teil D,
etwa bei der neuen Schlange (D16) oder dem Verdoppler im zweiten Zug (D11,
D23), und die Oberfläche kennzeichnet den Satz als Ergänzung des Autors. Was
die Website inzwischen selbst sagt (D9, D10, D12, D13, D19), steht im Wortlaut
von Teil A da, ohne Etikett.
*/

import { ANLEGEN } from '../karten/hilfe/farbkarten'

export interface Satz {
  text: string
  /** Abschnitt von Teil A („A5“) oder Antwort aus Teil D („D12“). */
  quelle: string
}

export interface Zugschritt {
  titel: string
  /** Gilt nur, wenn mit Erweiterung gespielt wird. */
  nurErweiterung?: boolean
  saetze: readonly Satz[]
}

/** Ein Satz aus Teil D: vom Autor entschieden; die Website sagt es noch nicht so ausdrücklich. */
export const istErgaenzungDesAutors = (satz: Satz): boolean => satz.quelle.startsWith('D')

export const ZUGSCHRITTE: readonly Zugschritt[] = [
  {
    titel: 'Kartenhand prüfen',
    saetze: [
      {
        text: 'Hast du ausserhalb deines Zuges Karten gespielt, zum Beispiel einen Farbenschutz zur Abwehr, ziehst du jetzt vom Nachziehstapel, bis du wieder 5 Handkarten hast.',
        quelle: 'A5',
      },
    ],
  },
  {
    titel: 'Karten ausspielen',
    saetze: [
      { text: 'Du musst mindestens 1 Karte und darfst maximal 2 Karten ausspielen:', quelle: 'A5' },
      { text: ANLEGEN, quelle: 'A5' },
      {
        text: 'Optional eine Sonderkarte, um deren Effekt auszulösen (kann an beliebiger Stelle jeder Schlange eingefügt werden, auch bei einem Mitspieler)',
        quelle: 'A5',
      },
      { text: 'Welche, ist dir überlassen: Eine Sonderkarte allein genügt, auch wenn du eine Farbkarte hättest.', quelle: 'A5' },
      { text: 'Du darfst die Farbkarte und die Sonderkarte in beliebiger Reihenfolge spielen.', quelle: 'A5' },
      { text: 'Nur eine Farbkarte beginnt eine Schlange.', quelle: 'D16' },
      { text: 'Ein Spieler darf maximal 2 Schlangen haben.', quelle: 'A5' },
    ],
  },
  {
    titel: 'Sonderkarte ansagen',
    saetze: [
      {
        text: 'Sonderkarten werden immer mit klarer Ansage gespielt: Der Spieler benennt das Ziel seiner Aktion.',
        quelle: 'A6',
      },
      { text: 'Dann können die betroffenen Spieler im Uhrzeigersinn mit einem Farbenschutz reagieren.', quelle: 'A6' },
      { text: 'Gegen Farbkarten gibt es keine Abwehr.', quelle: 'A6' },
      { text: 'Erst danach tritt der Effekt der Sonderkarte ein.', quelle: 'A6' },
      { text: 'Du darfst auch eine Sonderkarte spielen, die dir gerade nichts bringt.', quelle: 'A5' },
      {
        text: 'Hat sie kein mögliches Ziel, legst du sie ohne Wirkung auf deinen Ablagestapel; sie zählt dann als die Sonderkarte deines Zuges.',
        quelle: 'A5',
      },
    ],
  },
  {
    titel: 'Aufgabe erfüllen',
    nurErweiterung: true,
    saetze: [
      { text: 'Eine Aufgabe kann erfüllt werden, sobald ein Spieler die Bedingungen erfüllt und am Zug ist.', quelle: 'A9' },
      { text: 'Die erfüllte offene Aufgabe wandert zum Spieler und wird durch eine neue vom Stapel ersetzt.', quelle: 'A9' },
      { text: 'Deine geheime Aufgabe deckst du erst bei der Wertung auf.', quelle: 'A5' },
    ],
  },
  {
    titel: 'Zug beenden',
    saetze: [
      { text: 'Ziehe Karten vom Nachziehstapel, bis du wieder 5 Handkarten hast.', quelle: 'A5' },
      {
        text: 'Hast du am Ende deines Zuges mehr als 5 Karten auf der Hand, lege die überzähligen Karten auf deinen Ablagestapel.',
        quelle: 'A5',
      },
      { text: 'Danach ist der nächste Spieler an der Reihe.', quelle: 'A5' },
      {
        text: 'Ist deine Sonderkarte der Verdoppler, füllst du nach diesem Zug deine Handkarten auf und spielst sofort einen zweiten Zug.',
        quelle: 'A5',
      },
      { text: 'Nur ein Verdoppler pro Runde.', quelle: 'D11' },
      {
        text: 'Im zweiten Zug darf er wirkungslos auf den eigenen Ablagestapel; er zählt als Sonderkarte dieses Zuges, ein weiterer Zug folgt nicht.',
        quelle: 'D23',
      },
    ],
  },
]
