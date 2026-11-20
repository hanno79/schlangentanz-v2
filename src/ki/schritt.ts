import { ermittleAktionen } from '../engine';
import type { SpielAktion, Spielzustand } from '../engine';
import { entscheiderVon, sichtFuer } from './sicht';
import type { Entscheider } from './sicht';
import type { Ki } from './strategien/strategie';

export type { Ki };

/*
Die Schnittstelle zwischen Engine und KI (Plan K1): Zustand hinein, ein
Schritt heraus. Eine KI (eine Strategie unter `strategien/`) sieht nur die
Sicht ihres Spielers (U5) und wählt aus den Aktionen, die die Engine aufzählt
(U3). Sie bekommt Abschriften; gespielt
wird immer die Aktion der Engine an der gewählten Stelle, damit eine KI weder
eine eigene Aktion noch eine veränderte durchbringt.
*/

/** Lässt `ki` für `entscheider` wählen, den Spieler, der gerade entscheidet (`entscheiderVon`). */
export function waehleFuer(zustand: Spielzustand, entscheider: Entscheider, ki: Ki): SpielAktion {
  const aufgezaehlt = ermittleAktionen(zustand);
  if (aufgezaehlt.length === 0) {
    throw new Error(`KI-Schritt: ${entscheider.name} entscheidet, aber die Engine zählt keine Aktion auf (Plan E2, Kriterium 12).`);
  }
  // Die KI bekommt Abschriften in einer eigenen Liste; wiedererkannt wird ihre Wahl in einer zweiten, die sie nicht erreicht.
  const abschriften = structuredClone(aufgezaehlt);
  const stelle = abschriften.indexOf(ki.waehle(sichtFuer(zustand, entscheider.index), [...abschriften]));
  if (stelle < 0) {
    throw new Error(`KI-Schritt: ${ki.name} hat eine Aktion gewählt, die die Engine nicht aufgezählt hat; eine KI wählt nur aus den aufgezählten Aktionen (U3).`);
  }
  return aufgezaehlt[stelle];
}

/**
 * Lässt `ki` für den Spieler wählen, der gerade entscheidet, gleich ob Mensch
 * oder KI (etwa im Turnier); `null` nach Spielende.
 */
export function kiWahl(zustand: Spielzustand, ki: Ki): SpielAktion | null {
  const entscheider = entscheiderVon(zustand);
  return entscheider === null ? null : waehleFuer(zustand, entscheider, ki);
}

/** Ob gerade eine KI entscheidet; nach Spielende und bei einem Menschen nicht. */
export function entscheidetKi(zustand: Spielzustand): boolean {
  return entscheiderVon(zustand)?.steuerung === 'KI';
}

/** Der nächste Schritt der KI: genau eine Aktion, oder `null`, wenn ein Mensch entscheidet oder die Partie beendet ist. */
export function naechsterKiSchritt(zustand: Spielzustand, ki: Ki): SpielAktion | null {
  const entscheider = entscheiderVon(zustand);
  return entscheider?.steuerung === 'KI' ? waehleFuer(zustand, entscheider, ki) : null;
}
