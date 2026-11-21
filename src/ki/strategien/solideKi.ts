import type { Ki } from './strategie';
import { planeZug } from './zugsuche';

/**
 * Die solide KI (Plan K2, Produktentscheidung 2.3): Sie bewertet Züge, nutzt beide
 * Karten eines Zuges und erkennt, welche Karte ihr nützt und welche nichts bringt.
 * Jeder Schritt ist eine eigene Suche auf der Sicht (`zugsuche.ts`); Zufall
 * braucht sie nur, um das Verdeckte für die Simulation zu erraten (U4). Gleiche
 * Sicht und gleiche Zufallsquelle, gleiche Wahl.
 */
export function erstelleSolideKi(zufall: () => number): Ki {
  return {
    name: 'Solide KI',
    waehle(sicht, aktionen) {
      return planeZug(sicht, aktionen, zufall).aktion;
    },
  };
}
