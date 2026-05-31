/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: TDD-Tests für Schlangenbau-State-Machine-Aktionen nach R3.1.
*/

import { describe, it, expect } from 'vitest';
import { beendeAusspielphase, erstelleSpielzustand, starteNeueSchlange } from '../index';
import type { Spielzustand } from '../types';

function zustandInAusspielphase(): Spielzustand {
  return { ...erstelleSpielzustand(2, () => 0.999999), zugphase: 'Ausspielphase' };
}

function verschiebeSonderkarteAufAktiveHand(zustand: Spielzustand): { zustand: Spielzustand; id: string } {
  const sonderkartenIndex = zustand.nachziehstapel.findIndex((karte) => karte.typ === 'Sonderkarte');
  if (sonderkartenIndex < 0) throw new Error('Testsetup erwartet Sonderkarte.');
  const sonderkarte = zustand.nachziehstapel[sonderkartenIndex];
  const neueHand = [sonderkarte, ...zustand.spieler[0].hand.slice(1)];
  return {
    zustand: {
      ...zustand,
      spieler: zustand.spieler.map((s, i) => (i === 0 ? { ...s, hand: neueHand } : s)),
      nachziehstapel: zustand.nachziehstapel.filter((_, i) => i !== sonderkartenIndex),
    },
    id: sonderkarte.id,
  };
}

describe('Schlangenbau State Machine — R3.1 Neue Schlange starten', () => {
  it('startet mit einer aktiven Farbkarte eine neue aktive Schlange und erfüllt die Zugpflicht', () => {
    const zustand = zustandInAusspielphase();
    const startkarte = zustand.spieler[0].hand[0];
    if (startkarte.typ !== 'Farbkarte') throw new Error('Testsetup erwartet Farbkarte.');
    const aktiveHandVorher = zustand.spieler[0].hand.map((karte) => karte.id);

    const aktualisiert = starteNeueSchlange(zustand, { kartenId: startkarte.id });
    const neueSchlange = aktualisiert.spieler[0].schlangen[0];
    const nachAusspielphase = beendeAusspielphase(aktualisiert);

    expect(aktualisiert.spieler[0].hand.map((karte) => karte.id)).toEqual(aktiveHandVorher.slice(1));
    expect(neueSchlange).toMatchObject({ zustand: 'aktiv', karten: [startkarte] });
    expect(neueSchlange.id).toMatch(/^schlange-spieler-1-1$/);
    expect(aktualisiert.zugpflichten.gespielteKarten).toBe(1);
    expect(nachAusspielphase.zugphase).toBe('Aufgabenpruefung');
  });

  it('mutiert den Eingabezustand und inaktive Spieler nicht', () => {
    const zustand = zustandInAusspielphase();
    const aktiveHandVorher = zustand.spieler[0].hand.map((karte) => karte.id);
    const inaktiveHandVorher = zustand.spieler[1].hand.map((karte) => karte.id);

    const aktualisiert = starteNeueSchlange(zustand, { kartenId: aktiveHandVorher[0] });

    expect(zustand.spieler[0].hand.map((karte) => karte.id)).toEqual(aktiveHandVorher);
    expect(zustand.spieler[0].schlangen).toHaveLength(0);
    expect(zustand.zugpflichten.gespielteKarten).toBe(0);
    expect(aktualisiert.spieler[1].hand.map((karte) => karte.id)).toEqual(inaktiveHandVorher);
  });

  it('vergibt für eine zweite Schlange eine eindeutige ID', () => {
    const zustand = zustandInAusspielphase();
    const [ersteKarte, zweiteKarte] = zustand.spieler[0].hand;
    zustand.spieler[0].schlangen = [{ id: 'schlange-spieler-1-1', zustand: 'aktiv', karten: [ersteKarte] }];

    const aktualisiert = starteNeueSchlange(zustand, { kartenId: zweiteKarte.id });

    expect(aktualisiert.spieler[0].schlangen.map((schlange) => schlange.id)).toEqual([
      'schlange-spieler-1-1',
      'schlange-spieler-1-2',
    ]);
  });

  it('vermeidet ID-Kollisionen bei bestehenden Schlangennummern', () => {
    const zustand = zustandInAusspielphase();
    const [ersteKarte, zweiteKarte] = zustand.spieler[0].hand;
    zustand.spieler[0].schlangen = [{ id: 'schlange-spieler-1-2', zustand: 'aktiv', karten: [ersteKarte] }];

    const aktualisiert = starteNeueSchlange(zustand, { kartenId: zweiteKarte.id });

    expect(aktualisiert.spieler[0].schlangen.map((schlange) => schlange.id)).toEqual([
      'schlange-spieler-1-2',
      'schlange-spieler-1-1',
    ]);
  });

  it('verbietet neue Schlange außerhalb der Ausspielphase', () => {
    const zustand = erstelleSpielzustand(2, () => 0.999999);
    const kartenId = zustand.spieler[0].hand[0].id;

    expect(() => starteNeueSchlange(zustand, { kartenId })).toThrow(
      'Neue Schlangen können nur in der Ausspielphase gestartet werden.',
    );
  });

  it('verbietet neue Schlange mit Sonderkarte', () => {
    const { zustand, id: sonderkartenId } = verschiebeSonderkarteAufAktiveHand(zustandInAusspielphase());

    expect(() => starteNeueSchlange(zustand, { kartenId: sonderkartenId })).toThrow(
      'Eine neue Schlange kann nur mit einer Farbkarte gestartet werden.',
    );
  });

  it('verbietet neue Schlange mit fremder oder unbekannter Handkarte', () => {
    const zustand = zustandInAusspielphase();
    const fremdeKarte = zustand.spieler[1].hand[0];

    expect(() => starteNeueSchlange(zustand, { kartenId: fremdeKarte.id })).toThrow(
      'Die Karte befindet sich nicht auf der Hand des aktiven Spielers.',
    );
  });

  it('verbietet eine dritte Schlange', () => {
    const zustand = zustandInAusspielphase();
    const [karte1, karte2, karte3] = zustand.spieler[0].hand;
    zustand.spieler[0].schlangen = [
      { id: 'schlange-spieler-1-1', zustand: 'aktiv', karten: [karte1] },
      { id: 'schlange-spieler-1-2', zustand: 'aktiv', karten: [karte2] },
    ];

    expect(() => starteNeueSchlange(zustand, { kartenId: karte3.id })).toThrow(
      'Ein Spieler darf maximal 2 Schlangen haben.',
    );
  });

  it('verbietet fehlenden oder ungültigen Kartenparameter mit Domain-Fehler', () => {
    const zustand = zustandInAusspielphase();
    const starteMitRuntimeOptionen = starteNeueSchlange as unknown as (
      zustand: Spielzustand,
      optionen?: unknown,
    ) => void;

    expect(() => starteMitRuntimeOptionen(zustand)).toThrow('Es muss genau eine Handkarte zum Starten gewählt werden.');
    expect(() => starteMitRuntimeOptionen(zustand, null)).toThrow(
      'Es muss genau eine Handkarte zum Starten gewählt werden.',
    );
    expect(() => starteMitRuntimeOptionen(zustand, { kartenId: 7 })).toThrow(
      'Es muss genau eine Handkarte zum Starten gewählt werden.',
    );
    expect(() => starteNeueSchlange(zustand, { kartenId: '' })).toThrow(
      'Es muss genau eine Handkarte zum Starten gewählt werden.',
    );
    expect(() => starteNeueSchlange(zustand, { kartenId: '   ' })).toThrow(
      'Es muss genau eine Handkarte zum Starten gewählt werden.',
    );
  });

  it('verbietet eine weitere gespielte Karte nach erfülltem Zwei-Karten-Limit', () => {
    const zustand = { ...zustandInAusspielphase(), zugpflichten: { gespielteKarten: 2 } };
    const kartenId = zustand.spieler[0].hand[0].id;

    expect(() => starteNeueSchlange(zustand, { kartenId })).toThrow(
      'Die Ausspielphase darf höchstens zwei gespielte Karten enthalten.',
    );
  });
});
