/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: Zentrale Exporte für die Schlangentanz-Engine.
*/

export * from './types';
export * from './constants';
export { aufgabenPool, erstelleAufgabenStapel } from './aufgabenKarten';
export { erstelleFarbkarten, erstelleSonderkarten, erstelleHauptdeck, erstelleErweiterungsSonderkarten, mischeDeck } from './deck';
export { erstelleSpielzustand, erstelleEinzelspielerSpielzustand } from './state';
export { serialisiere, deserialisiere } from './serialization';
export { pruefeAktion, ermittleLegaleAktionen, ermittleReaktionsAktionen, anwendeAktion } from './legalActions';
export type { AktionErgebnis, SpielAktion, NeueSchlangeStartenAktion, KarteAnlegenAktion, PflichtAbwurfAktion, SonderkarteSpielenAktion, SchlangenblockadeSpielenAktion, SchlangenblockadeAbwehrenAktion, SchlangenblockadeDurchlassenAktion, VerdopplerSpielenAktion, VerdopplerAbwehrenAktion, VerdopplerDurchlassenAktion, FarbenschutzSpielenAktion, SchlangengrubeAbwehrenAktion, SchlangengrubeDurchlassenAktion, FarbendiebSpielenAktion, FarbendiebAbwehrenAktion, FarbendiebDurchlassenAktion, SchlangenfrassAbwehrenAktion, SchlangenfrassDurchlassenAktion, FarbenfusionSpielenAktion, SchlangenfrassSpielenAktion } from './legalActions';
export { starteAusspielphase, beendeAusspielphase, beendeAufgabenpruefung, beendeZug, werfeUeberzaehligeHandkartenAb, werfeKarteMangelsSpielbarerAktionAb, starteNeueSchlange, legeKarteAnSchlangeAn, spieleSchlangengrube, spieleSchlangenblockade, spieleVerdoppler, spieleFarbenschutz, spieleFarbendieb, spieleFarbenfusion, spieleSchlangenfrass } from './turnState';
export { ermittleFarbgruppen } from './colorGroups';
export type { Farbgruppe } from './colorGroups';
export { berechneFarbgruppenPunkte, berechneSpielerFarbgruppenPunkte, berechneSpielerAufgabenPunkte, berechneSpielerGesamtPunkte, berechneSpielGesamtwertung, berechneSpielzustandGesamtwertung, berechneGewinner, ermittleFarbenFuerFarbvielfalt } from './scoring';
export type { FarbgruppenWertung, FarbgruppenPunkteErgebnis, SchlangenFarbgruppenPunkteErgebnis, SpielerFarbgruppenPunkteErgebnis, AufgabenPunkteEintrag, SpielerAufgabenPunkteErgebnis, SpielerGesamtPunkteErgebnis, SpielerWertungsEintrag, SpielGesamtwertungErgebnis, GewinnerEintrag, GewinnerErgebnis } from './scoring';
