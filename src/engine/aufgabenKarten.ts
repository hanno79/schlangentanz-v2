import type { AufgabenkarteInfo } from './types';

/** A9, Tabelle „Verfügbare Aufgabenkarten“: Nummer, Name, Punkte und Kartentext wörtlich. */
const AUFGABEN: ReadonlyArray<[name: string, punkte: number, bedingung: string]> = [
  ['Farbenpracht', 8, 'Habe am Ende des Spiels oder Zugs von jeder Farbe mindestens zwei Karten in deinen beiden Schlangen.'],
  ['Farbharmonie', 10, 'Habe in deinen Schlangen mindestens eine Dreiergruppe jeder Farbe.'],
  ['Farbkombination', 5, 'Habe 5 oder mehr Karten der gleichen Farbe in einer Schlange.'],
  ['Farbvielfalt', 9, 'Bilde eine Kette aus je einer Karte aller 6 Farben.'],
  ['Vielfaltskönig', 9, 'Habe in jeder deiner Schlangen min. 4 versch. Farben.'],
  [
    'Farbwechsler',
    6,
    'Habe in einer Schlange mindestens 4 verschiedene Farben, die direkt aufeinander folgen. Es müssen nicht einzelne Farben aufeinander folgen. Es gelten auch Reihen.',
  ],
  ['Fusionsexperte', 6, 'Habe eine Schlange mit mindestens 2 Farbfusionen.'],
  ['Schlangenbeschwörer', 7, 'Habe min. 4 Sonderkarten in deinen Schlangen.'],
  ['Schlangenmeister', 4, 'Habe min. 2 versch. Sonderkarten in deinen Schlangen und spiele min. 4 aus.'],
  ['Schlangenrepertoire', 4, 'Spiele min. 5 versch. Arten von Sonderkarten aus.'],
  ['Schlangenbändiger', 7, 'Habe in einer Schlange ein sich wiederholendes Muster aus min. 3 versch. Farben.'],
  ['Schlangentanz', 7, 'Bilde durch Schlangenhäutung 2 neue Dreiergruppen.'],
  ['Symmetriemeister', 10, 'Habe eine Schlange mit min. 8 Karten, bei der die erste Hälfte das Spiegelbild der zweiten ist.'],
  ['Gelber Schatz', 5, 'Bilde eine Gruppe aus min. 6 gelben Karten.'],
  ['Lila Riese', 5, 'Bilde eine ununterbrochene Reihe aus min. 5 violetten Karten.'],
];

/** Die 15 Aufgabenkarten der Erweiterung; die Id trägt die Nummer aus A9. */
export function erstelleAufgabenStapel(): AufgabenkarteInfo[] {
  return AUFGABEN.map(([name, punkte, bedingung], index) => ({
    typ: 'Aufgabenkarte',
    id: `aufgabe-${String(index + 1).padStart(2, '0')}`,
    name,
    punkte,
    bedingung,
  }));
}
