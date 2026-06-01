/*
Author: rahn
Datum: 01.06.2026
Version: 1.0
Beschreibung: R29-Regressions-Tests für sichtbares Pflicht-Nachziehen beim Zugwechsel.
*/

import { describe, expect, it } from 'vitest';
import { beendeZug, erstelleSpielzustand } from '../index';

function zustandInZugabschlussMitVierHandkartenBeimNaechstenSpieler() {
  const zustand = erstelleSpielzustand(2, () => 0.999999);
  zustand.zugphase = 'Zugabschluss';
  zustand.aktiverSpielerIndex = 0;
  zustand.spieler[1].hand = zustand.spieler[1].hand.slice(0, 4);
  return zustand;
}

describe('Turn State Machine — R29 Pflicht-Nachziehen beim Zugwechsel', () => {
  it('füllt die Hand des nächsten Spielers sichtbar beim Zugwechsel auf fünf Karten auf', () => {
    const zustand = zustandInZugabschlussMitVierHandkartenBeimNaechstenSpieler();
    const stapelVorher = zustand.nachziehstapel.map((karte) => karte.id);

    const aktualisiert = beendeZug(zustand, { pflichtenErfuellt: true });

    expect(aktualisiert.aktiverSpielerIndex).toBe(1);
    expect(aktualisiert.zugphase).toBe('Nachziehphase');
    expect(aktualisiert.spieler[1].hand).toHaveLength(5);
    expect(aktualisiert.spieler[1].hand.at(-1)?.id).toBe(stapelVorher[0]);
    expect(aktualisiert.nachziehstapel.map((karte) => karte.id)).toEqual(stapelVorher.slice(1));
    expect(zustand.spieler[1].hand).toHaveLength(4);
  });
});
