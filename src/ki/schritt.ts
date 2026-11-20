import { ermittleAktionen } from '../engine';
import type { SpielAktion, Spielzustand } from '../engine';
import { entscheiderVon, sichtFuer } from './sicht';
import type { Sicht } from './sicht';

/*
Die Schnittstelle zwischen Engine und KI (Plan K1): Zustand hinein, ein
Schritt heraus. Eine KI sieht nur die Sicht ihres Spielers (U5) und wählt aus
den Aktionen, die die Engine aufzählt (U3). Sie bekommt Abschriften; gespielt
wird immer die Aktion der Engine an der gewählten Stelle, damit eine KI weder
eine eigene Aktion noch eine veränderte durchbringt.
*/

export interface Ki {
  /** Für Meldungen und das Turnier. */
  name: string;
  /** Wählt genau eine der angebotenen Aktionen und gibt sie zurück; `aktionen` ist nie leer. */
  waehle(sicht: Sicht, aktionen: readonly SpielAktion[]): SpielAktion;
}

/**
 * Lässt `ki` für den Spieler wählen, der gerade entscheidet, gleich ob Mensch
 * oder KI (etwa im Turnier); `null` nach Spielende.
 */
export function kiWahl(zustand: Spielzustand, ki: Ki): SpielAktion | null {
  const entscheider = entscheiderVon(zustand);
  if (entscheider === null) return null;
  const aufgezaehlt = ermittleAktionen(zustand);
  if (aufgezaehlt.length === 0) {
    const sicht = sichtFuer(zustand, entscheider.index);
    throw new Error(`KI-Schritt: ${sicht.spieler[sicht.ich].name} entscheidet, aber die Engine zählt keine Aktion auf (Plan E2, Kriterium 12).`);
  }
  const angeboten = structuredClone(aufgezaehlt);
  const stelle = angeboten.indexOf(ki.waehle(sichtFuer(zustand, entscheider.index), angeboten));
  if (stelle < 0 || stelle >= aufgezaehlt.length) {
    throw new Error(`KI-Schritt: ${ki.name} hat eine Aktion gewählt, die die Engine nicht aufgezählt hat; eine KI wählt nur aus den aufgezählten Aktionen (U3).`);
  }
  return aufgezaehlt[stelle];
}

/** Ob gerade eine KI entscheidet; nach Spielende und bei einem Menschen nicht. */
export function entscheidetKi(zustand: Spielzustand): boolean {
  return entscheiderVon(zustand)?.steuerung === 'KI';
}

/** Der nächste Schritt der KI: genau eine Aktion, oder `null`, wenn ein Mensch entscheidet oder die Partie beendet ist. */
export function naechsterKiSchritt(zustand: Spielzustand, ki: Ki): SpielAktion | null {
  return entscheidetKi(zustand) ? kiWahl(zustand, ki) : null;
}
