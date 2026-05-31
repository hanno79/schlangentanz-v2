/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: Zentrale Exporte für die Schlangentanz-Engine.
*/

export * from './types';
export * from './constants';
export { aufgabenPool, erstelleAufgabenStapel } from './aufgabenKarten';
export { erstelleFarbkarten, erstelleSonderkarten, erstelleHauptdeck, mischeDeck } from './deck';
export { erstelleSpielzustand } from './state';
export { serialisiere, deserialisiere } from './serialization';
export { pruefeAktion } from './legalActions';
export type { AktionErgebnis, SpielAktion, NeueSchlangeStartenAktion, KarteAnlegenAktion } from './legalActions';
export { starteAusspielphase } from './turnState';
