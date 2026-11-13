import type { Spielzustand } from '../types';
import { pruefeAktion } from './pruefen';
import type { AktionsErgebnis, SpielAktion } from './typen';

/**
 * Führt eine erlaubte Aktion aus; eine unerlaubte wird mit ihrem Grund abgelehnt
 * (B2, U12). Der übergebene Zustand bleibt unverändert.
 *
 * Nach E1 lehnt `pruefeAktion` jede Aktion ab. Den Ablauf danach (Karte aus der
 * Hand, schwebend bis zur Reaktion, Wirkung, Auffüllen) bringen E2 und E4.
 */
export function anwendeAktion(zustand: Spielzustand, aktion: SpielAktion): AktionsErgebnis {
  const pruefung = pruefeAktion(zustand, aktion);
  if (!pruefung.erlaubt) throw new Error(pruefung.grund);
  throw new Error(`${aktion.typ} ist erlaubt, aber der Zugablauf fehlt noch (kommt mit E2).`);
}
