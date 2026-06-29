/*
Author: rahn
Datum: 29.06.2026
Version: 1.0
Beschreibung: R181 — geheimeAufgabe Typ-Inkonsistenz beheben. Spec: Jeder Spieler
              hat genau eine geheime Aufgabenkarte. Aktueller Stand: Type erlaubt
              `null`, Factory fängt mit `?? null` ab, Validation wirft Error.
              Ziel: non-nullable Type, defensive Factory-Exception statt stille
              Inkonsistenz, saubere Serialization-Validation.
*/

import { describe, expect, it } from 'vitest';
import { erstelleSpielzustand } from '../index';

describe('R181 geheimeAufgabe Typ-Korrektheit', () => {
  it('jeder Spieler hat eine geheime Aufgabenkarte (non-nullable)', () => {
    const zustand = erstelleSpielzustand(2);
    for (const spieler of zustand.spieler) {
      expect(spieler.geheimeAufgabe).not.toBeNull();
      expect(spieler.geheimeAufgabe.typ).toBe('Aufgabenkarte');
    }
  });

  it('jeder Spieler hat eine geheime Aufgabenkarte auch bei 3 Spielern', () => {
    const zustand = erstelleSpielzustand(3);
    expect(zustand.spieler).toHaveLength(3);
    for (const spieler of zustand.spieler) {
      expect(spieler.geheimeAufgabe).not.toBeNull();
      expect(spieler.geheimeAufgabe.typ).toBe('Aufgabenkarte');
    }
  });

  it('jeder Spieler hat eine geheime Aufgabenkarte auch bei 4 Spielern', () => {
    const zustand = erstelleSpielzustand(4);
    expect(zustand.spieler).toHaveLength(4);
    for (const spieler of zustand.spieler) {
      expect(spieler.geheimeAufgabe).not.toBeNull();
      expect(spieler.geheimeAufgabe.typ).toBe('Aufgabenkarte');
    }
  });

  it('alle geheimen Aufgaben sind paarweise verschieden', () => {
    const zustand = erstelleSpielzustand(4, () => 0.5);
    const ids = zustand.spieler.map((s) => s.geheimeAufgabe.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('offene Aufgaben und geheime Aufgaben überschneiden sich nicht (Grundregel)', () => {
    const zustand = erstelleSpielzustand(4, () => 0.5);
    const offeneIds = new Set(zustand.offeneAufgaben.map((a) => a.id));
    const geheimeIds = new Set(zustand.spieler.map((s) => s.geheimeAufgabe.id));
    for (const id of geheimeIds) {
      expect(offeneIds.has(id)).toBe(false);
    }
  });
});
