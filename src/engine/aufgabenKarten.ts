import type { AufgabenkarteInfo } from './types';

export const aufgabenPool: ReadonlyArray<AufgabenkarteInfo> = [
  {
    typ: 'Aufgabenkarte',
    id: 'aufgabe-01',
    name: 'Farbenpracht',
    punkte: 8,
    bedingung:
      'Habe am Ende des Spiels oder Zugs von jeder Farbe mindestens zwei Karten in deinen beiden Schlangen.',
  },
  {
    typ: 'Aufgabenkarte',
    id: 'aufgabe-02',
    name: 'Farbharmonie',
    punkte: 10,
    bedingung: 'Habe in deinen Schlangen mindestens eine Dreiergruppe jeder Farbe.',
  },
  {
    typ: 'Aufgabenkarte',
    id: 'aufgabe-03',
    name: 'Farbkombination',
    punkte: 5,
    bedingung: 'Habe 5 oder mehr Karten der gleichen Farbe in einer Schlange.',
  },
  {
    typ: 'Aufgabenkarte',
    id: 'aufgabe-04',
    name: 'Farbvielfalt',
    punkte: 9,
    bedingung: 'Bilde eine Kette aus je einer Karte aller 6 Farben.',
  },
  {
    typ: 'Aufgabenkarte',
    id: 'aufgabe-05',
    name: 'Farbwechsler',
    punkte: 6,
    bedingung:
      'Habe in einer Schlange mindestens 4 verschiedene Farben, die direkt aufeinander folgen.',
  },
  {
    typ: 'Aufgabenkarte',
    id: 'aufgabe-06',
    name: 'Fusionsexperte',
    punkte: 6,
    bedingung: 'Habe eine Schlange mit mindestens 2 Farbfusionen.',
  },
  {
    typ: 'Aufgabenkarte',
    id: 'aufgabe-07',
    name: 'Schlangenbeschwörer',
    punkte: 7,
    bedingung: 'Habe min. 4 Sonderkarten in deinen Schlangen.',
  },
  {
    typ: 'Aufgabenkarte',
    id: 'aufgabe-08',
    name: 'Schlangenmeister',
    punkte: 4,
    bedingung:
      'Habe min. 2 versch. Sonderkarten in deinen Schlangen und spiele min. 4 aus.',
  },
  {
    typ: 'Aufgabenkarte',
    id: 'aufgabe-09',
    name: 'Schlangenrepertoire',
    punkte: 4,
    bedingung: 'Spiele min. 5 versch. Arten von Sonderkarten aus.',
  },
  {
    typ: 'Aufgabenkarte',
    id: 'aufgabe-10',
    name: 'Schlangenbändiger',
    punkte: 7,
    bedingung:
      'Habe in einer Schlange ein sich wiederholendes Muster aus min. 3 versch. Farben.',
  },
  {
    typ: 'Aufgabenkarte',
    id: 'aufgabe-11',
    name: 'Schlangentanz',
    punkte: 7,
    bedingung: 'Bilde durch Schlangenhäutung 2 neue Dreiergruppen.',
  },
  {
    typ: 'Aufgabenkarte',
    id: 'aufgabe-12',
    name: 'Symmetriemeister',
    punkte: 10,
    bedingung:
      'Habe eine Schlange mit min. 8 Karten, bei der die erste Hälfte das Spiegelbild der zweiten ist.',
  },
  {
    typ: 'Aufgabenkarte',
    id: 'aufgabe-13',
    name: 'Gelber Schatz',
    punkte: 5,
    bedingung: 'Bilde eine Gruppe aus min. 6 gelben Karten.',
  },
  {
    typ: 'Aufgabenkarte',
    id: 'aufgabe-14',
    name: 'Lila Riese',
    punkte: 5,
    bedingung:
      'Bilde die längste ununterbrochene Kette violetter Karten (mindestens 3).',
  },
];

export function erstelleAufgabenStapel(): AufgabenkarteInfo[] {
  return [...aufgabenPool];
}
