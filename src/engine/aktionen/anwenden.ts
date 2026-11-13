import { definitionFuer } from '../karten/register';
import type { Spielzustand } from '../types';
import { beendeZug, legeWirkungslosAb, vermerkeGespielteKarte, werfeUeberhandAb } from '../zugablauf';
import { pruefeAktion } from './pruefen';
import type { AktionsErgebnis, Ereignis, KartenAktion, SpielAktion } from './typen';

/**
 * Führt eine erlaubte Aktion aus; eine unerlaubte wird mit ihrem Grund abgelehnt
 * (B2, U12). Der übergebene Zustand bleibt unverändert. Danach rückt die Engine
 * selbst bis zur nächsten Entscheidung vor (Zugwechsel, Auffüllen, Aussetzen,
 * Spielende) und meldet in `ereignisse`, was dabei geschah.
 */
export function anwendeAktion(zustand: Spielzustand, aktion: SpielAktion): AktionsErgebnis {
  const pruefung = pruefeAktion(zustand, aktion);
  if (!pruefung.erlaubt) throw new Error(pruefung.grund);
  const neu = structuredClone(zustand);
  const ereignisse: Ereignis[] = [];
  let ergebnis = neu;
  switch (aktion.typ) {
    case 'ZugBeenden':
      beendeZug(neu, ereignisse);
      break;
    case 'UeberhandAbwerfen':
      werfeUeberhandAb(neu, aktion.karteIds, ereignisse);
      break;
    case 'SonderkarteWirkungslosAblegen':
      legeWirkungslosAb(neu, aktion, ereignisse);
      break;
    case 'Reagieren':
      throw new Error('Reagieren ist noch nicht umgesetzt (kommt mit E4).');
    default:
      ergebnis = spieleKarte(neu, aktion, ereignisse);
  }
  return { zustand: ergebnis, ereignisse };
}

/**
 * Eine Handkarte mit Wirkung spielen: Sie zählt zum Zug (A5, D12), dann wirkt
 * sie nach ihrem Eintrag im Kartenregister; die Karte nimmt sich die Wirkung
 * selbst aus der Hand. Abwehr gibt es noch keine (E4).
 */
function spieleKarte(zustand: Spielzustand, aktion: KartenAktion, ereignisse: Ereignis[]): Spielzustand {
  const karte = vermerkeGespielteKarte(zustand, aktion, ereignisse);
  return definitionFuer(karte).wirke(zustand, aktion, []);
}
