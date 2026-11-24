/*
Die Schnittstelle der Engine für Oberfläche und KI (Plan, Abschnitt 10). Wer
ausserhalb von `src/engine/` etwas aus der Engine braucht, holt es hier (U3).
*/

// Zustand und Aktionen
export * from './types';
export * from './constants';
export { AKTIONSTYPEN } from './aktionen/typen';
export type {
  Ablehnung,
  Aktionstyp,
  AktionsErgebnis,
  BlockadeLegenAktion,
  ComebackEinsetzenAktion,
  EntscheidenAktion,
  Ereignis,
  FarbendiebSpielenAktion,
  FarbkarteLegenAktion,
  Farbkartenziel,
  FusionLegenAktion,
  KartenAktion,
  Kartenort,
  Korbbonus,
  Korbtausch,
  Korbziel,
  Pruefergebnis,
  ReagierenAktion,
  RegenbogenschlangeLegenAktion,
  SchlangenfrassSpielenAktion,
  SchlangengrubeSpielenAktion,
  SchlangenhaeutungSpielenAktion,
  SchlangenkorbSpielenAktion,
  SonderkarteWirkungslosAblegenAktion,
  SpielAktion,
  Spielergrund,
  UeberhandAbwerfenAktion,
  VerdopplerSpielenAktion,
  Versetzung,
  ZugBeendenAktion,
  ZweiAbwerfenDreiZiehenAktion,
} from './aktionen/typen';

// Partie beginnen, Aktionen aufzählen, prüfen und anwenden
export { erstellePartie } from './state';
export type { PartieOptionen } from './state';
export { ermittleAktionen } from './aktionen/enumerieren';
/** A10, D21: Kommt der letzte Zug eines Spielers in der Schlussrunde noch? Für die Sicht der KI (Plan K2). */
export { hatNochLetztenZug } from './zugablauf';
/** B2: der Zug, wie ihn ein Spieler sehen darf, für die Sicht der KI (Plan K1, X3). */
export { zugInSicht, zugOhneIds } from './zuggrenzen';
export { ermittleEntscheider, pruefeAktion, zugBeendenGesperrt } from './aktionen/pruefen';
export { anwendeAktion } from './aktionen/anwenden';
/** Reproduzierbarer Zufall aus einer Saat, für Partie und KI (U4: Zufall kommt als Parameter). */
export { erzeugeZufall } from './testing/zufall';

// Invarianten, Speichern und Laden
export { istAuslagekarte, pruefeInvarianten } from './invarianten';
export type { InvariantenBefund } from './invarianten';
export { deserialisiere, serialisiere } from './serialization';
export { fehlertext } from './form';

// Wertung
export { ermittleFarbgruppen } from './colorGroups';
export type { Farbgruppe } from './colorGroups';
export { istJoker, vielfaltBonusFuer, werteSchlangen } from './jokerGruppen';
export type { FarbgruppenErgebnis, GewerteteGruppe, JokerFarbe, Jokerart, SchlangenWertung } from './jokerGruppen';
export { berechneEndwertung, berechneZwischenstand, KETTENBONUS, laengsteFarbkette } from './scoring';
export type { AufgabenEintrag, Endwertung, KettenWertung, SpielerWertung, Zwischenstand } from './scoring';
