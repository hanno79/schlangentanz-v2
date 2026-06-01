/*
Author: rahn
Datum: 01.06.2026
Version: 1.0
Beschreibung: TDD-Tests für die Endrunde nach der letzten Nachziehkarte.
*/

import { describe, it, expect } from 'vitest';
import { beendeZug, erstelleSpielzustand, starteAusspielphase } from '../index';

function endrundenAusloeserZustand() {
  const zustand = erstelleSpielzustand(3, () => 0.999999);
  zustand.aktiverSpielerIndex = 1;
  zustand.spieler[1].hand = zustand.spieler[1].hand.slice(0, 3);
  zustand.nachziehstapel = zustand.nachziehstapel.slice(0, 1);
  return starteAusspielphase(zustand);
}

function imZugabschluss<T extends ReturnType<typeof endrundenAusloeserZustand>>(zustand: T): T {
  return { ...zustand, zugphase: 'Zugabschluss' as const };
}

describe('Turn State Machine — R14 Endrunde nach letzter Nachziehkarte', () => {
  it('plant nach dem Ziehen der letzten Nachziehkarte nur die anderen Spieler für die Endrunde ein', () => {
    const aktualisiert = endrundenAusloeserZustand();

    expect(aktualisiert.spielphase).toBe('Endspurt');
    expect(aktualisiert.endrunde).toEqual({
      ausloeserSpielerIndex: 1,
      verbleibendeSpielerIndizes: [2, 0],
    });
    expect(aktualisiert.aktiverSpielerIndex).toBe(1);
    expect(aktualisiert.zugphase).toBe('Ausspielphase');
  });

  it('lässt den Auslöser seinen Zug beenden und aktiviert danach den nächsten Endrunden-Spieler', () => {
    const nachAusloeser = beendeZug(imZugabschluss(endrundenAusloeserZustand()), { pflichtenErfuellt: true });

    expect(nachAusloeser.aktiverSpielerIndex).toBe(2);
    expect(nachAusloeser.spielphase).toBe('Endspurt');
    expect(nachAusloeser.zugphase).toBe('Nachziehphase');
    expect(nachAusloeser.endrunde).toEqual({
      ausloeserSpielerIndex: 1,
      verbleibendeSpielerIndizes: [2, 0],
    });
  });

  it('überspringt das Nachziehen für Endrunden-Spieler bei leerem Nachziehstapel', () => {
    const nachAusloeser = beendeZug(imZugabschluss(endrundenAusloeserZustand()), { pflichtenErfuellt: true });
    const handVorher = nachAusloeser.spieler[2].hand.map((karte) => karte.id);

    const aktualisiert = starteAusspielphase(nachAusloeser);

    expect(aktualisiert.spieler[2].hand.map((karte) => karte.id)).toEqual(handVorher);
    expect(aktualisiert.nachziehstapel).toHaveLength(0);
    expect(aktualisiert.spielphase).toBe('Endspurt');
    expect(aktualisiert.zugphase).toBe('Ausspielphase');
  });

  it('beendet das Spiel nach den genau einmaligen Zügen aller anderen Spieler, ohne den Auslöser erneut zu aktivieren', () => {
    const nachAusloeser = beendeZug(imZugabschluss(endrundenAusloeserZustand()), { pflichtenErfuellt: true });
    const nachSpieler2 = beendeZug(imZugabschluss(nachAusloeser), { pflichtenErfuellt: true });
    const nachSpieler0 = beendeZug(imZugabschluss(nachSpieler2), { pflichtenErfuellt: true });

    expect(nachSpieler2.aktiverSpielerIndex).toBe(0);
    expect(nachSpieler2.endrunde.verbleibendeSpielerIndizes).toEqual([0]);
    expect(nachSpieler0.spielphase).toBe('Beendet');
    expect(nachSpieler0.zugphase).toBe('Spielende');
    expect(nachSpieler0.aktiverSpielerIndex).toBe(0);
    expect(nachSpieler0.endrunde).toEqual({
      ausloeserSpielerIndex: 1,
      verbleibendeSpielerIndizes: [],
    });
  });

  it('gibt pro Zugabschluss einen eigenen Zugpflichten-Zustand zurück', () => {
    const nachAusloeser = beendeZug(imZugabschluss(endrundenAusloeserZustand()), { pflichtenErfuellt: true });
    const nachSpieler2 = beendeZug(imZugabschluss(nachAusloeser), { pflichtenErfuellt: true });

    nachAusloeser.zugpflichten.gespielteKarten = 99;

    expect(nachSpieler2.zugpflichten.gespielteKarten).toBe(0);
  });
});
