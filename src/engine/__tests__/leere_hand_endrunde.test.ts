/*
Author: rahn
Datum: 05.07.2026
Version: 1.0
Beschreibung: Audit-Fix H2 — Ein Spieler, der seinen (Endrunden-)Zug mit leerer Hand
              beginnt (etwa weil Farbenschutz-Reaktionen außerhalb seines Zuges seine
              Karten verbraucht haben), muss den Zug regulär beenden können. Zuvor
              verlangte beendeAusspielphase mindestens eine gespielte Karte, was ohne
              Nachziehen im Endspurt zu einem Deadlock führte.
*/

import { describe, expect, it } from 'vitest';
import { erstelleSpielzustand } from '../index';
import { beendeAusspielphase, beendeAufgabenpruefung, beendeZug } from '../turnState';
import type { Spielzustand } from '../types';

function endrundeMitLeererHand(): Spielzustand {
  const zustand = erstelleSpielzustand(2, () => 0.5);
  zustand.nachziehstapel = [];
  zustand.spielphase = 'Endspurt';
  zustand.endrunde = { ausloeserSpielerIndex: 1, verbleibendeSpielerIndizes: [0] };
  zustand.aktiverSpielerIndex = 0;
  zustand.zugphase = 'Ausspielphase';
  zustand.zugpflichten = { gespielteKarten: 0, gespielteFarbkarten: 0, gespielteSonderkarten: 0, verdopplerBonusAktiv: false, farbenfusionGespielt: false };
  zustand.spieler[0].hand = [];
  return zustand;
}

describe('Leere Hand in der Endrunde (H2)', () => {
  it('beendeAusspielphase erlaubt 0 gespielte Karten bei leerer Hand', () => {
    const zustand = endrundeMitLeererHand();
    expect(() => beendeAusspielphase(zustand)).not.toThrow();
    expect(beendeAusspielphase(zustand).zugphase).toBe('Aufgabenpruefung');
  });

  it('beendeAusspielphase wirft weiterhin bei 0 Karten und nicht-leerer Hand', () => {
    const zustand = endrundeMitLeererHand();
    zustand.spieler[0].hand = zustand.nachziehstapel.length ? [] : [{ typ: 'Farbkarte', id: 'rest-1', farbe: 'Rot', punkte: 1 }];
    expect(() => beendeAusspielphase(zustand)).toThrow();
  });

  it('der komplette leere Endrunden-Zug führt zum Spielende', () => {
    let zustand = endrundeMitLeererHand();
    zustand = beendeAusspielphase(zustand);
    zustand = beendeAufgabenpruefung(zustand, { aufgabenGeprueft: true });
    zustand = beendeZug(zustand, { pflichtenErfuellt: true });
    expect(zustand.zugphase).toBe('Spielende');
    expect(zustand.spielphase).toBe('Beendet');
  });
});
