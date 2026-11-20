import type { SpielAktion } from '../../engine';
import type { Sicht } from '../sicht';

/*
Die Schnittstelle einer Strategie (Plan K1, P0.3d). Eine Strategie sieht nur die
Sicht ihres Spielers und die Aktionen, die die Engine aufzählt; den vollen
Zustand hält allein der Rahmen (`sicht.ts`, `schritt.ts`, `turnier.ts`). Zufall
bekommt sie beim Erzeugen als Parameter (U4).
*/

export interface Ki {
  /** Für Meldungen und das Turnier. */
  name: string;
  /** Wählt genau eine der angebotenen Aktionen und gibt sie zurück; `aktionen` ist nie leer. */
  waehle(sicht: Sicht, aktionen: readonly SpielAktion[]): SpielAktion;
}
