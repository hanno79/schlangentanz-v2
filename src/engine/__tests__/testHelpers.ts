/*
Author: rahn
Datum: 31.05.2026
Version: 1.2
Beschreibung: Gemeinsame Test-Builder für Engine-Unit-Tests.
*/

import type { Farbe, Schlange, Spieler, Spielkarte, Steuerung } from '../types';

export function farbkarte(id: string, farbe: Farbe, punkte = 1): Spielkarte {
  return { typ: 'Farbkarte', id, farbe, punkte };
}

export function sonderkarte(id: string): Spielkarte {
  return { typ: 'Sonderkarte', id, name: 'Test-Sonderkarte' };
}

export function schlange(karten: Spielkarte[], id = 'test-schlange'): Schlange {
  return { id, zustand: 'aktiv', karten };
}

export function spielerMitSchlangen(schlangen: Spieler['schlangen'], steuerung: Steuerung = 'KI'): Spieler {
  return {
    id: 'spieler-wertung-1',
    name: 'Wertungsspieler',
    steuerung,
    hand: [],
    schlangen,
    erfuellteAufgaben: [],
    geheimeAufgabe: { typ: 'Aufgabenkarte', id: 'test-aufgabe-geheim', name: 'Testaufgabe', punkte: 1, bedingung: 'Testbedingung' },
  };
}

export function spielerMitId(id: string, name: string, schlangen: Spieler['schlangen']): Spieler {
  return { ...spielerMitSchlangen(schlangen), id, name };
}
