import type { KartenAktion } from '../aktionen/typen';
import type { KartenDefinition } from './register';

/*
A7.2, A6, D10: Farbenschutz spielt man nur als Reaktion auf eine Sonderkarte,
die ein Mitspieler gegen einen selbst oder in die eigene Schlange spielt; das
regelt der Reaktionsablauf (`reaktion.ts`, Aktion „Reagieren“). Im eigenen Zug
hat er deshalb kein Ziel und lässt sich nur wirkungslos ablegen (A5, D25).
*/

const NUR_ALS_REAKTION =
  'Farbenschutz spielt man nur als Reaktion auf eine Sonderkarte eines Mitspielers (A6, A7.2); im eigenen Zug lässt er sich nur wirkungslos ablegen (A5, D25).';

export const farbenschutz: KartenDefinition<KartenAktion> = {
  art: 'Farbenschutz',
  aktionstyp: null,
  ziele: () => [],
  pruefe: () => NUR_ALS_REAKTION,
  betroffene: () => [],
  wirke: () => {
    throw new Error(NUR_ALS_REAKTION);
  },
};
