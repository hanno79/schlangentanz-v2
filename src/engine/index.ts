/*
Die Schnittstelle der Engine für Oberfläche und KI (Plan, Abschnitt 10). Wer
ausserhalb von `src/engine/` etwas aus der Engine braucht, holt es hier (U3).
*/

// Zustand und Aktionen
export * from './types';
export * from './constants';
export { AKTIONSTYPEN } from './aktionen/typen';
export type {
  Aktionstyp,
  AktionsErgebnis,
  BlockadeLegenAktion,
  Ereignis,
  FarbendiebSpielenAktion,
  FarbkarteLegenAktion,
  Farbkartenziel,
  FusionLegenAktion,
  KartenAktion,
  Pruefergebnis,
  ReagierenAktion,
  RegenbogenschlangeLegenAktion,
  SchlangenfrassSpielenAktion,
  SchlangengrubeSpielenAktion,
  SchlangenhaeutungSpielenAktion,
  SonderkarteWirkungslosAblegenAktion,
  SpielAktion,
  UeberhandAbwerfenAktion,
  VerdopplerSpielenAktion,
  ZugBeendenAktion,
} from './aktionen/typen';

// Partie beginnen, Aktionen aufzählen, prüfen und anwenden
export { erstellePartie } from './state';
export type { PartieOptionen } from './state';
export { ermittleAktionen } from './aktionen/enumerieren';
export { ermittleEntscheider, pruefeAktion } from './aktionen/pruefen';
export { anwendeAktion } from './aktionen/anwenden';

// Invarianten, Speichern und Laden
export { istAuslagekarte, pruefeInvarianten } from './invarianten';
export type { InvariantenBefund } from './invarianten';
export { deserialisiere, serialisiere } from './serialization';

// Wertung
export { ermittleFarbgruppen } from './colorGroups';
export type { Farbgruppe } from './colorGroups';
export {
  berechneFarbgruppenPunkte,
  berechneGewinner,
  berechneSpielerAufgabenPunkte,
  berechneSpielerFarbgruppenPunkte,
  berechneSpielerGrundpunkte,
  berechneSpielGesamtwertung,
  berechneSpielzustandGesamtwertung,
  ermittleRegenbogenWildfarben,
} from './scoring';
export type {
  AufgabenPunkteEintrag,
  FarbgruppenPunkteErgebnis,
  FarbgruppenWertung,
  GewinnerEintrag,
  GewinnerErgebnis,
  SchlangenFarbgruppenPunkteErgebnis,
  SpielerAufgabenPunkteErgebnis,
  SpielerFarbgruppenPunkteErgebnis,
  SpielerGrundpunkteErgebnis,
  SpielerWertungsEintrag,
  SpielGesamtwertungErgebnis,
} from './scoring';
