import { definitionFuer } from '../karten/register';
import type { Spielkarte, Spielzustand } from '../types';
import { darfZugBeenden, kartengrenze, ueberzaehligeKarten } from '../zugablauf';
import { ermittleEntscheider, istWirkungslosAblegbar } from './pruefen';
import type { SpielAktion, UeberhandAbwerfenAktion } from './typen';

/**
 * Alle Aktionen, die der Spieler, der gerade entscheidet, jetzt wählen darf.
 * Oberfläche und KI wählen nur hieraus (U3).
 *
 * Reihenfolge: Karten mit Wirkung in der Reihenfolge der Hand, dann das
 * wirkungslose Ablegen (D13, D25), zuletzt „Zug beenden“. Am Zugende mit mehr
 * als 5 Karten nur das Abwerfen (A5). Die Reaktionen bringt E4.
 */
export function ermittleAktionen(zustand: Spielzustand): SpielAktion[] {
  const entscheider = ermittleEntscheider(zustand);
  if (entscheider === null || zustand.schwebend !== null) return [];
  const spieler = zustand.spieler[entscheider];
  if (zustand.zug.abschnitt === 'Abwerfen') return abwurfAktionen(spieler.id, spieler.hand, ueberzaehligeKarten(spieler));

  const spielbar = spieler.hand.filter((karte) => kartengrenze(zustand.zug, karte) === null);
  const mitWirkung = spielbar.flatMap((karte) => definitionFuer(karte).ziele(zustand, entscheider, karte));
  const wirkungslos: SpielAktion[] = spielbar
    .filter((karte) => istWirkungslosAblegbar(zustand, entscheider, karte))
    .map((karte) => ({ typ: 'SonderkarteWirkungslosAblegen', spielerId: spieler.id, karteId: karte.id }));
  const beenden: SpielAktion[] = darfZugBeenden(zustand.zug, spieler) ? [{ typ: 'ZugBeenden', spielerId: spieler.id }] : [];
  return [...mitWirkung, ...wirkungslos, ...beenden];
}

/** A5: jede Wahl von genau `anzahl` Handkarten, in der Reihenfolge der Hand. */
function abwurfAktionen(spielerId: string, hand: readonly Spielkarte[], anzahl: number): UeberhandAbwerfenAktion[] {
  const auswahlen: string[][] = [];
  const waehle = (ab: number, gewaehlt: string[]): void => {
    if (gewaehlt.length === anzahl) {
      auswahlen.push(gewaehlt);
      return;
    }
    for (let index = ab; index <= hand.length - (anzahl - gewaehlt.length); index += 1) waehle(index + 1, [...gewaehlt, hand[index].id]);
  };
  waehle(0, []);
  return auswahlen.map((karteIds) => ({ typ: 'UeberhandAbwerfen', spielerId, karteIds }));
}
