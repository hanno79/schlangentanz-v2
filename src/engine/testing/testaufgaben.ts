import type { AufgabenDefinition } from '../aufgaben/definition';
import { AUFGABENREGISTER } from '../aufgabenKarten';

/*
Testbedingungen für Aufgaben (X1). Solange X2 die 15 Bedingungen aus A9 nicht
umgesetzt hat, ist jede Aufgabe ein Platzhalter, der nie erfüllt ist. Tests und
die Szenarien des Entwicklertischs geben einzelnen Aufgaben deshalb eine eigene
Bedingung, um den Rahmen zu prüfen. Sie ersetzt die Bedingung im Register, bis
`entferneTestbedingungen` sie zurücksetzt; Tests tun das nach jedem Test.
Nur für Tests und den Entwicklertisch, nie im Spiel.
*/

export type Testbedingung = AufgabenDefinition['istErfuellt'];

/** Die Bedingungen, die eine Testbedingung gerade ersetzt. */
const ERSETZT = new Map<AufgabenDefinition, Testbedingung>();

/** Setzt genau diese Testbedingungen (Name aus A9 → Bedingung); frühere gelten nicht mehr. */
export function setzeTestbedingungen(bedingungen: Readonly<Record<string, Testbedingung>>): void {
  const unbekannt = Object.keys(bedingungen).filter((name) => !AUFGABENREGISTER.has(name));
  if (unbekannt.length > 0) throw new Error(`Testbedingung: Eine Aufgabe ${unbekannt.map((name) => `„${name}“`).join(', ')} gibt es in A9 nicht.`);
  entferneTestbedingungen();
  for (const [name, bedingung] of Object.entries(bedingungen)) {
    const definition = AUFGABENREGISTER.get(name)!;
    ERSETZT.set(definition, definition.istErfuellt);
    definition.istErfuellt = bedingung;
  }
}

/** Jede Aufgabe hat wieder die Bedingung aus ihrer Datei. */
export function entferneTestbedingungen(): void {
  for (const [definition, bedingung] of ERSETZT) definition.istErfuellt = bedingung;
  ERSETZT.clear();
}
