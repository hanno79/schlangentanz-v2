import { definitionFuer } from '../karten/register';
import type { Spielzustand } from '../types';
import { ermittleEntscheider } from './pruefen';
import type { SpielAktion } from './typen';

/**
 * Alle Aktionen, die der Spieler, der gerade entscheidet, jetzt wählen darf.
 * Oberfläche und KI wählen nur hieraus (U3).
 *
 * Nach E1 sind alle Karten Platzhalter ohne Ziele; Zugende, Überhand und
 * wirkungsloses Ablegen bringt E2, die Reaktionen E4.
 */
export function ermittleAktionen(zustand: Spielzustand): SpielAktion[] {
  const entscheider = ermittleEntscheider(zustand);
  if (entscheider === null || zustand.schwebend !== null || zustand.zug.abschnitt === 'Abwerfen') return [];
  const spieler = zustand.spieler[entscheider];
  return spieler.hand.flatMap((karte) => definitionFuer(karte).ziele(zustand, entscheider, karte));
}
