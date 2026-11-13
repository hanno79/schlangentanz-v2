/*
Ein Zug in fünf Schritten (O9, Kriterium 2).

Jeder Satz steht wörtlich in der Spielanleitung (Teil A der Spec) oder in einer
Antwort des Autors (Teil D) und nennt seine Stelle; `zugschritte.test.ts`
prüft das gegen `docs/GAME_SPEC.md`. So behauptet die Zusammenfassung nichts,
was dort nicht steht (U2). Wo Teil D die Website ergänzt, folgt sie Teil D,
etwa bei der Zahl der Karten (D12) oder einer Sonderkarte ohne Ziel (D13), und
die Oberfläche kennzeichnet den Satz als Ergänzung des Autors.
*/

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

/** Ein Satz aus Teil D: vom Autor entschieden, noch nicht auf der Website. */
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
      {
        text: 'Mindestens eine, höchstens zwei Karten, davon höchstens eine Farbkarte und eine Sonderkarte; eine Karte genügt, egal welcher Art.',
        quelle: 'D12',
      },
      { text: 'Du darfst die Farbkarte und die Sonderkarte in beliebiger Reihenfolge spielen.', quelle: 'A5' },
      { text: 'Jede Karte in jede Schlange: Farbkarten an ein Ende, Sonderkarten an beliebiger Stelle.', quelle: 'D9' },
      { text: 'Nur eine Farbkarte beginnt eine Schlange.', quelle: 'D16' },
      { text: 'Eine neue Schlange beginnt jeder nur für sich selbst.', quelle: 'D19' },
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
      { text: 'Gegen Farbkarten gibt es keine Abwehr.', quelle: 'D10' },
      { text: 'Erst danach tritt der Effekt der Sonderkarte ein.', quelle: 'A6' },
      {
        text: 'Hat sie kein mögliches Ziel, kommt sie wirkungslos auf den eigenen Ablagestapel und zählt als Sonderkarte des Zuges.',
        quelle: 'D13',
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
    ],
  },
]
