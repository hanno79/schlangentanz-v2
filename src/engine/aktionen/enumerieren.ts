import { risikoAktionen } from '../erweiterung/risiko';
import { entscheidungsAktionen, reaktionsAktionen } from '../reaktion';
import type { Spielkarte, Spielzustand } from '../types';
import { ueberzaehligeKarten } from '../zugablauf';
import { darfZugBeenden, kartengrenze } from '../zuggrenzen';
import { ermittleEntscheider, moeglicheZiele, ohneZielAblegbar } from './pruefen';
import type { SpielAktion, UeberhandAbwerfenAktion } from './typen';

/**
 * Alle Aktionen, die der Spieler, der gerade entscheidet, jetzt wählen darf.
 * Oberfläche und KI wählen nur hieraus (U3).
 *
 * Reihenfolge: Karten mit Wirkung in der Reihenfolge der Hand, dann das
 * wirkungslose Ablegen (D13, D25), mit Erweiterung die Risiko-Aktionen (A8.2),
 * zuletzt „Zug beenden“. Am Zugende mit mehr
 * als 5 Karten nur das Abwerfen (A5). Schwebt eine angesagte Karte, nur die
 * Reaktionen des Gefragten: jeder seiner Farbenschutz, dann durchlassen (A6).
 * Ist eine Entscheidung offen, nur die Wahl ihres Entscheiders (X3).
 */
export function ermittleAktionen(zustand: Spielzustand): SpielAktion[] {
  const entscheider = ermittleEntscheider(zustand);
  if (entscheider === null) return [];
  if (zustand.schwebend !== null) return reaktionsAktionen(zustand, entscheider);
  if (zustand.entscheidung !== null) return entscheidungsAktionen(zustand, entscheider);
  const spieler = zustand.spieler[entscheider];
  if (zustand.zug.abschnitt === 'Abwerfen') return abwurfAktionen(spieler.id, spieler.hand, ueberzaehligeKarten(spieler));

  const mitWirkung: SpielAktion[] = [];
  const wirkungslos: SpielAktion[] = [];
  for (const karte of spieler.hand) {
    if (kartengrenze(zustand.zug, karte) !== null) continue;
    const ziele = moeglicheZiele(zustand, entscheider, karte);
    mitWirkung.push(...ziele);
    if (ohneZielAblegbar(karte, () => ziele)) wirkungslos.push({ typ: 'SonderkarteWirkungslosAblegen', spielerId: spieler.id, karteId: karte.id });
  }
  const beenden: SpielAktion[] = darfZugBeenden(zustand.zug, spieler) ? [{ typ: 'ZugBeenden', spielerId: spieler.id }] : [];
  return [...mitWirkung, ...wirkungslos, ...risikoAktionen(zustand, entscheider), ...beenden];
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
