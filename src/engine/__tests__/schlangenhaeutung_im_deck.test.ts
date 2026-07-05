/*
Author: rahn
Datum: 05.07.2026
Version: 1.0
Beschreibung: Audit-Fix H1 — Die 4 Schlangenhäutung-Karten sind Teil des tatsächlich
              gemischten Spieldecks (114 = 110 Basis + 4 Häutung). Sonst wären die
              gesamte Häutungs-Mechanik und die Aufgabe "Schlangentanz" unerreichbar.
*/

import { describe, expect, it } from 'vitest';
import { erstelleSpieldeck, erstelleSpielzustand, serialisiere, deserialisiere } from '../index';

describe('Schlangenhäutung im Spieldeck (H1)', () => {
  it('erstelleSpieldeck enthält 114 Karten mit genau 4 Schlangenhäutung', () => {
    const deck = erstelleSpieldeck();
    expect(deck).toHaveLength(114);
    const haeutung = deck.filter((k) => k.typ === 'Sonderkarte' && k.name === 'Schlangenhäutung');
    expect(haeutung).toHaveLength(4);
  });

  it('ein frischer Spielzustand enthält die Häutungskarten im Material und ist serialisierbar', () => {
    const zustand = erstelleSpielzustand(2, () => 0.5);
    const alleKarten = [
      ...zustand.nachziehstapel,
      ...zustand.spieler.flatMap((s) => s.hand),
    ];
    const haeutung = alleKarten.filter((k) => k.typ === 'Sonderkarte' && k.name === 'Schlangenhäutung');
    expect(haeutung).toHaveLength(4);
    expect(() => deserialisiere(serialisiere(zustand))).not.toThrow();
  });
});
