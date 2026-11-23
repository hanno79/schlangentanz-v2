import type { AufgabenDefinition } from './definition';

const MINDEST_NEUE_GRUPPEN = 2;

/**
 * A9 Nr. 12 „Schlangentanz“: Bilde durch Schlangenhäutung 2 neue Dreiergruppen,
 * beide mit derselben eigenen Häutung in einer eigenen Schlange (D37). Gezählt
 * hat die Häutung selbst (`sonderkartenZaehler.ts`).
 */
export const schlangentanz: AufgabenDefinition = {
  name: 'Schlangentanz',
  istErfuellt: (zustand, spielerIndex) => zustand.spieler[spielerIndex].schlangenhaeutungDreiergruppen >= MINDEST_NEUE_GRUPPEN,
};
