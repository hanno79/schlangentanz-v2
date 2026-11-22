import type { AufgabenDefinition } from './aufgaben/definition';
import { farbenpracht } from './aufgaben/farbenpracht';
import { farbharmonie } from './aufgaben/farbharmonie';
import { farbkombination } from './aufgaben/farbkombination';
import { farbvielfalt } from './aufgaben/farbvielfalt';
import { farbwechsler } from './aufgaben/farbwechsler';
import { fusionsexperte } from './aufgaben/fusionsexperte';
import { gelberSchatz } from './aufgaben/gelberSchatz';
import { lilaRiese } from './aufgaben/lilaRiese';
import { schlangenbaendiger } from './aufgaben/schlangenbaendiger';
import { schlangenbeschwoerer } from './aufgaben/schlangenbeschwoerer';
import { schlangenmeister } from './aufgaben/schlangenmeister';
import { schlangenrepertoire } from './aufgaben/schlangenrepertoire';
import { schlangentanz } from './aufgaben/schlangentanz';
import { symmetriemeister } from './aufgaben/symmetriemeister';
import { vielfaltskoenig } from './aufgaben/vielfaltskoenig';
import type { AufgabenkarteInfo } from './types';

/**
 * A9, Tabelle „Verfügbare Aufgabenkarten“: Nummer, Name, Punkte und Kartentext
 * wörtlich, dazu je Aufgabe ihre Bedingung aus `aufgaben/` (X1, X2).
 */
const AUFGABEN: ReadonlyArray<[name: string, punkte: number, bedingung: string, definition: AufgabenDefinition]> = [
  ['Farbenpracht', 8, 'Habe am Ende des Spiels oder Zugs von jeder Farbe mindestens zwei Karten in deinen beiden Schlangen.', farbenpracht],
  ['Farbharmonie', 10, 'Habe in deinen Schlangen mindestens eine Dreiergruppe jeder Farbe.', farbharmonie],
  ['Farbkombination', 5, 'Habe 5 oder mehr Karten der gleichen Farbe in einer Schlange.', farbkombination],
  ['Farbvielfalt', 9, 'Bilde eine Kette aus je einer Karte aller 6 Farben.', farbvielfalt],
  ['Vielfaltskönig', 9, 'Habe in jeder deiner Schlangen min. 4 versch. Farben.', vielfaltskoenig],
  [
    'Farbwechsler',
    6,
    'Habe in einer Schlange mindestens 4 verschiedene Farben, die direkt aufeinander folgen. Es müssen nicht einzelne Farben aufeinander folgen. Es gelten auch Reihen.',
    farbwechsler,
  ],
  ['Fusionsexperte', 6, 'Habe eine Schlange mit mindestens 2 Farbfusionen.', fusionsexperte],
  ['Schlangenbeschwörer', 7, 'Habe min. 4 Sonderkarten in deinen Schlangen.', schlangenbeschwoerer],
  ['Schlangenmeister', 4, 'Habe min. 2 versch. Sonderkarten in deinen Schlangen und spiele min. 4 aus.', schlangenmeister],
  ['Schlangenrepertoire', 4, 'Spiele min. 5 versch. Arten von Sonderkarten aus.', schlangenrepertoire],
  ['Schlangenbändiger', 7, 'Habe in einer Schlange ein sich wiederholendes Muster aus min. 3 versch. Farben.', schlangenbaendiger],
  ['Schlangentanz', 7, 'Bilde durch Schlangenhäutung 2 neue Dreiergruppen.', schlangentanz],
  ['Symmetriemeister', 10, 'Habe eine Schlange mit min. 8 Karten, bei der die erste Hälfte das Spiegelbild der zweiten ist.', symmetriemeister],
  ['Gelber Schatz', 5, 'Bilde eine Gruppe aus min. 6 gelben Karten.', gelberSchatz],
  ['Lila Riese', 5, 'Bilde eine ununterbrochene Reihe aus min. 5 violetten Karten.', lilaRiese],
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

/** Die Namen der Aufgaben nach ihrer Id; die Ids ändern sich nie (A9). */
export const AUFGABENNAMEN: ReadonlyMap<string, string> = new Map(erstelleAufgabenStapel().map((aufgabe) => [aufgabe.id, aufgabe.name]));

/** Das Register der Aufgaben: Name → Bedingung, in der Reihenfolge von A9. */
export const AUFGABENREGISTER: ReadonlyMap<string, AufgabenDefinition> = new Map(AUFGABEN.map(([name, , , definition]) => [name, definition]));

/** Die Bedingung zu einer Aufgabenkarte; eine Karte, die A9 nicht kennt, ist ein Fehler. */
export function definitionFuerAufgabe(aufgabe: AufgabenkarteInfo): AufgabenDefinition {
  const definition = AUFGABENREGISTER.get(aufgabe.name);
  if (definition === undefined) throw new Error(`Die Aufgabe „${aufgabe.name}“ (${aufgabe.id}) steht nicht in A9; zu ihr gibt es keine Bedingung.`);
  return definition;
}
