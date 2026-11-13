import { definitionFuer } from '../karten/register';
import type { Spielzustand } from '../types';
import { beendeZug, legeWirkungslosAb, werfeUeberhandAb, zaehleKarte } from '../zugablauf';
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
  switch (aktion.typ) {
    case 'ZugBeenden':
      beendeZug(neu, ereignisse);
      return { zustand: neu, ereignisse };
    case 'UeberhandAbwerfen':
      werfeUeberhandAb(neu, aktion.karteIds, ereignisse);
      return { zustand: neu, ereignisse };
    case 'SonderkarteWirkungslosAblegen':
      legeWirkungslosAb(neu, aktion, ereignisse);
      return { zustand: neu, ereignisse };
    case 'Reagieren':
      throw new Error('Reagieren ist noch nicht umgesetzt (kommt mit E4).');
    default:
      return spieleKarte(neu, aktion, ereignisse);
  }
}

/**
 * Eine Handkarte mit Wirkung spielen: Sie zählt zum Zug (A5, D12), dann wirkt
 * sie nach ihrem Eintrag im Kartenregister; die Karte nimmt sich die Wirkung
 * selbst aus der Hand. Abwehr gibt es noch keine (E4).
 */
function spieleKarte(zustand: Spielzustand, aktion: KartenAktion, ereignisse: Ereignis[]): AktionsErgebnis {
  const spielerIndex = zustand.spieler.findIndex((spieler) => spieler.id === aktion.spielerId);
  const karte = zustand.spieler[spielerIndex].hand.find((handkarte) => handkarte.id === aktion.karteId)!;
  zaehleKarte(zustand.zug, karte);
  const nach = definitionFuer(karte).wirke(zustand, aktion, []);
  ereignisse.push({ typ: 'KarteGespielt', spielerIndex, karteId: karte.id, aktion: aktion.typ });
  return { zustand: nach, ereignisse };
}
