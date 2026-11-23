import type { Spielzustand } from '../types';

/*
Je Aufgabe aus A9 eine Datei unter `aufgaben/`, je Datei ein Eintrag im Register
(`aufgabenKarten.ts`). Wann geprüft wird und was beim Einlösen geschieht, regelt
der Rahmen (`rahmen.ts`, X1); die Datei sagt nur, ob die Bedingung jetzt gilt.
Eine Aufgabe umsetzen heisst, ihre Datei zu füllen (X2).
*/

export interface AufgabenDefinition {
  /** Der Name aus A9, Tabelle „Verfügbare Aufgabenkarten“. */
  readonly name: string;
  /**
   * Erfüllt der Spieler an Stelle `spielerIndex` die Bedingung jetzt? Nur lesen.
   * Ob er am Zug ist und ob die Aufgabe noch frei ist, prüft der Rahmen (A9).
   */
  istErfuellt(zustand: Readonly<Spielzustand>, spielerIndex: number): boolean;
}

const PLATZHALTER = new WeakSet<AufgabenDefinition>();

/** Ist dieser Registereintrag noch ein Platzhalter? So erkennen Tests, welche Aufgaben umgesetzt sind, ohne Liste von Hand. */
export function istAufgabenPlatzhalter(definition: AufgabenDefinition): boolean {
  return PLATZHALTER.has(definition);
}

/** Eine Aufgabe, deren Bedingung ein späterer Task umsetzt (X2): Bis dahin ist sie nie erfüllt und wird nie eingelöst. */
export function platzhalterAufgabe(name: string): AufgabenDefinition {
  const definition: AufgabenDefinition = { name, istErfuellt: () => false };
  PLATZHALTER.add(definition);
  return definition;
}
