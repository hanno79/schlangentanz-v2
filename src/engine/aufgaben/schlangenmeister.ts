import type { AufgabenDefinition } from './definition';
import { sonderkartenInSchlangen } from './sonderkartenZaehler';

const MINDEST_ARTEN_IN_SCHLANGEN = 2;
const MINDEST_AUSGESPIELT = 4;

/**
 * A9 Nr. 9 „Schlangenmeister“: Habe min. 2 versch. Sonderkarten in deinen
 * Schlangen und spiele min. 4 aus. Verschieden heisst: zwei Arten, nicht zwei
 * gleiche Karten. Die vier ausgespielten dürfen gleich sein (D36).
 */
export const schlangenmeister: AufgabenDefinition = {
  name: 'Schlangenmeister',
  istErfuellt: (zustand, spielerIndex) => {
    const spieler = zustand.spieler[spielerIndex];
    if (spieler.ausgespielteSonderkarten.length < MINDEST_AUSGESPIELT) return false;
    return new Set(sonderkartenInSchlangen(spieler).map((karte) => karte.name)).size >= MINDEST_ARTEN_IN_SCHLANGEN;
  },
};
