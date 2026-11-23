import { pruefeAufgabenAmZug } from '../aufgaben/rahmen';
import { spieleRisikoKarte } from '../erweiterung/risiko';
import { entscheide, meldeOffeneEntscheidung, reagiere, spieleKarte } from '../reaktion';
import { beginneSchlussrundeBeiLeeremStapel } from '../stapel';
import type { Spielzustand } from '../types';
import { beendeZug, legeGrubenOhneZugAb, legeWirkungslosAb, werfeUeberhandAb } from '../zugablauf';
import { pruefeAktion } from './pruefen';
import type { AktionsErgebnis, Ereignis, SpielAktion } from './typen';

/**
 * Führt eine erlaubte Aktion aus; eine unerlaubte wird mit ihrem Grund abgelehnt
 * (B2, U12). Der übergebene Zustand bleibt unverändert. Danach rückt die Engine
 * selbst bis zur nächsten Entscheidung vor (Zugwechsel, Auffüllen, Aussetzen,
 * Spielende, Schlangengruben ohne Zug, D29), löst mit Erweiterung die Aufgaben
 * ein, die der Spieler am Zug jetzt erfüllt (A9), und meldet in `ereignisse`,
 * was dabei geschah. Hat eine Wirkung die letzte Karte vom Nachziehstapel
 * genommen, beginnt vorher die Schlussrunde, ausgelöst vom Spieler am Zug (A10,
 * D55); ist eine Entscheidung offen, kommt sie zuletzt (X3), und die Aufgaben
 * warten, bis sie entschieden ist.
 *
 * Eine Handkarte mit Wirkung zählt zum Zug und wirkt nach ihrem Eintrag im
 * Kartenregister; trifft sie Mitspieler, wird sie erst angesagt, und die
 * Betroffenen entscheiden, ob sie abwehren (`reaktion.ts`, A6).
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
      ergebnis = reagiere(neu, aktion, ereignisse);
      break;
    case 'Entscheiden':
      ergebnis = entscheide(neu, aktion, ereignisse);
      break;
    case 'RisikoKarteSpielen':
      ergebnis = spieleRisikoKarte(neu, aktion, ereignisse);
      break;
    default:
      ergebnis = spieleKarte(neu, aktion, ereignisse);
  }
  beginneSchlussrundeBeiLeeremStapel(ergebnis, ereignisse);
  legeGrubenOhneZugAb(ergebnis, ereignisse);
  pruefeAufgabenAmZug(ergebnis, ereignisse);
  meldeOffeneEntscheidung(ergebnis, ereignisse);
  return { zustand: ergebnis, ereignisse };
}
