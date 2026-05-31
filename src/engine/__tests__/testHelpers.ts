/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: Gemeinsame Test-Builder für Engine-Unit-Tests.
*/

import type { Farbe, Schlange, Spielkarte } from '../types';

export function farbkarte(id: string, farbe: Farbe, punkte = 1): Spielkarte {
  return { typ: 'Farbkarte', id, farbe, punkte };
}

export function sonderkarte(id: string): Spielkarte {
  return { typ: 'Sonderkarte', id, name: 'Test-Sonderkarte' };
}

export function schlange(karten: Spielkarte[]): Schlange {
  return { id: 'test-schlange', zustand: 'aktiv', karten };
}
