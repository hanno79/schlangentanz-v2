/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: TDD-Tests für Schlangenbau-State-Machine-Aktionen nach R3.1.
*/

import { describe, it, expect } from 'vitest';
import { beendeAusspielphase, erstelleSpielzustand, legeKarteAnSchlangeAn, starteNeueSchlange } from '../index';
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

function zustandMitAktiverSchlange(): { zustand: Spielzustand; schlangenId: string; anlegeKartenId: string } {
  const startzustand = zustandInAusspielphase();
  const [startkarte, anlegekarte] = startzustand.spieler[0].hand;
  const schlangenId = 'schlange-spieler-1-1';
  const zustand = {
    ...startzustand,
    spieler: startzustand.spieler.map((spieler, index) =>
      index === 0
        ? {
            ...spieler,
            hand: spieler.hand.filter((karte) => karte.id !== startkarte.id),
            schlangen: [{ id: schlangenId, zustand: 'aktiv' as const, karten: [startkarte] }],
          }
        : spieler,
    ),
  };
  return {
    zustand,
    schlangenId,
    anlegeKartenId: anlegekarte.id,
  };
}

function zustandMitBestehendenSchlangen(
  schlangen: Spielzustand['spieler'][number]['schlangen'],
  entfernteKartenIds: string[],
): Spielzustand {
  const zustand = zustandInAusspielphase();
  return {
    ...zustand,
    spieler: zustand.spieler.map((spieler, index) =>
      index === 0
        ? {
            ...spieler,
            hand: spieler.hand.filter((karte) => !entfernteKartenIds.includes(karte.id)),
            schlangen,
          }
        : spieler,
    ),
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
    const basis = zustandInAusspielphase();
    const [ersteKarte, zweiteKarte] = basis.spieler[0].hand;
    const zustand = zustandMitBestehendenSchlangen(
      [{ id: 'schlange-spieler-1-1', zustand: 'aktiv', karten: [ersteKarte] }],
      [ersteKarte.id],
    );

    const aktualisiert = starteNeueSchlange(zustand, { kartenId: zweiteKarte.id });

    expect(aktualisiert.spieler[0].schlangen.map((schlange) => schlange.id)).toEqual([
      'schlange-spieler-1-1',
      'schlange-spieler-1-2',
    ]);
  });

  it('vermeidet ID-Kollisionen bei bestehenden Schlangennummern', () => {
    const basis = zustandInAusspielphase();
    const [ersteKarte, zweiteKarte] = basis.spieler[0].hand;
    const zustand = zustandMitBestehendenSchlangen(
      [{ id: 'schlange-spieler-1-2', zustand: 'aktiv', karten: [ersteKarte] }],
      [ersteKarte.id],
    );

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
    const basis = zustandInAusspielphase();
    const [karte1, karte2, karte3] = basis.spieler[0].hand;
    const zustand = zustandMitBestehendenSchlangen(
      [
        { id: 'schlange-spieler-1-1', zustand: 'aktiv', karten: [karte1] },
        { id: 'schlange-spieler-1-2', zustand: 'aktiv', karten: [karte2] },
      ],
      [karte1.id, karte2.id],
    );

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
    const zustand = {
      ...zustandInAusspielphase(),
      zugpflichten: { gespielteKarten: 2, gespielteFarbkarten: 1, gespielteSonderkarten: 1 },
    };
    const kartenId = zustand.spieler[0].hand[0].id;

    expect(() => starteNeueSchlange(zustand, { kartenId })).toThrow(
      'Die Ausspielphase darf höchstens zwei gespielte Karten enthalten.',
    );
  });
});

describe('Schlangenbau State Machine — R3.2 Schlange erweitern', () => {
  it('legt eine Farbkarte links an eine aktive Schlange an und erfüllt eine weitere Zugpflicht', () => {
    const { zustand, schlangenId, anlegeKartenId } = zustandMitAktiverSchlange();
    const handVorher = zustand.spieler[0].hand.map((karte) => karte.id);
    const startkarte = zustand.spieler[0].schlangen[0].karten[0];
    const anlegekarte = zustand.spieler[0].hand.find((karte) => karte.id === anlegeKartenId);
    if (!anlegekarte) throw new Error('Testsetup erwartet anlegbare Handkarte.');

    const aktualisiert = legeKarteAnSchlangeAn(zustand, { kartenId: anlegeKartenId, schlangenId, position: 'links' });
    const schlange = aktualisiert.spieler[0].schlangen[0];
    const nachAusspielphase = beendeAusspielphase(aktualisiert);

    expect(schlange.karten).toEqual([anlegekarte, startkarte]);
    expect(aktualisiert.spieler[0].hand.map((karte) => karte.id)).toEqual(
      handVorher.filter((id) => id !== anlegeKartenId),
    );
    expect(aktualisiert.zugpflichten.gespielteKarten).toBe(1);
    expect(aktualisiert.zugpflichten.gespielteFarbkarten).toBe(1);
    expect(nachAusspielphase.zugphase).toBe('Aufgabenpruefung');
  });

  it('legt eine Farbkarte rechts an eine aktive Schlange an, ohne Eingabezustand oder inaktive Spieler zu mutieren', () => {
    const { zustand, schlangenId, anlegeKartenId } = zustandMitAktiverSchlange();
    const handVorher = zustand.spieler[0].hand.map((karte) => karte.id);
    const schlangenKartenVorher = zustand.spieler[0].schlangen[0].karten.map((karte) => karte.id);
    const inaktiveHandVorher = zustand.spieler[1].hand.map((karte) => karte.id);
    const anlegekarte = zustand.spieler[0].hand.find((karte) => karte.id === anlegeKartenId);
    if (!anlegekarte) throw new Error('Testsetup erwartet anlegbare Handkarte.');

    const aktualisiert = legeKarteAnSchlangeAn(zustand, { kartenId: anlegeKartenId, schlangenId, position: 'rechts' });

    expect(zustand.spieler[0].hand.map((karte) => karte.id)).toEqual(handVorher);
    expect(zustand.spieler[0].schlangen[0].karten.map((karte) => karte.id)).toEqual(schlangenKartenVorher);
    expect(aktualisiert.spieler[1].hand.map((karte) => karte.id)).toEqual(inaktiveHandVorher);
    expect(aktualisiert.spieler[0].schlangen[0].karten.map((karte) => karte.id)).toEqual([
      ...schlangenKartenVorher,
      anlegekarte.id,
    ]);
  });

  it('verbietet Anlegen außerhalb der Ausspielphase', () => {
    const { zustand, schlangenId, anlegeKartenId } = zustandMitAktiverSchlange();
    const falschePhase = { ...zustand, zugphase: 'Aufgabenpruefung' as const };

    expect(() => legeKarteAnSchlangeAn(falschePhase, { kartenId: anlegeKartenId, schlangenId, position: 'links' })).toThrow(
      'Karten können nur in der Ausspielphase angelegt werden.',
    );
  });

  it('verbietet fehlende oder ungültige Runtime-Parameter mit deutschem Domain-Fehler', () => {
    const { zustand, schlangenId, anlegeKartenId } = zustandMitAktiverSchlange();
    const legeMitRuntimeOptionen = legeKarteAnSchlangeAn as unknown as (
      zustand: Spielzustand,
      optionen?: unknown,
    ) => void;

    expect(() => legeMitRuntimeOptionen(zustand)).toThrow('Es müssen Handkarte, Schlange und Anlegeposition gewählt werden.');
    expect(() => legeMitRuntimeOptionen(zustand, null)).toThrow(
      'Es müssen Handkarte, Schlange und Anlegeposition gewählt werden.',
    );
    expect(() => legeMitRuntimeOptionen(zustand, 'ungueltig')).toThrow(
      'Es müssen Handkarte, Schlange und Anlegeposition gewählt werden.',
    );
    expect(() => legeMitRuntimeOptionen(zustand, { kartenId: 7, schlangenId, position: 'links' })).toThrow(
      'Es müssen Handkarte, Schlange und Anlegeposition gewählt werden.',
    );
    expect(() => legeMitRuntimeOptionen(zustand, { kartenId: anlegeKartenId, position: 'links' })).toThrow(
      'Es müssen Handkarte, Schlange und Anlegeposition gewählt werden.',
    );
    expect(() => legeMitRuntimeOptionen(zustand, { kartenId: anlegeKartenId, schlangenId: 7, position: 'links' })).toThrow(
      'Es müssen Handkarte, Schlange und Anlegeposition gewählt werden.',
    );
    expect(() => legeMitRuntimeOptionen(zustand, { kartenId: anlegeKartenId, schlangenId, position: 7 })).toThrow(
      'Es müssen Handkarte, Schlange und Anlegeposition gewählt werden.',
    );
    expect(() => legeMitRuntimeOptionen(zustand, { kartenId: anlegeKartenId, schlangenId, position: 'oben' })).toThrow(
      'Karten können nur links oder rechts angelegt werden.',
    );
    expect(() => legeKarteAnSchlangeAn(zustand, { kartenId: ' ', schlangenId, position: 'links' })).toThrow(
      'Es müssen Handkarte, Schlange und Anlegeposition gewählt werden.',
    );
    expect(() => legeKarteAnSchlangeAn(zustand, { kartenId: anlegeKartenId, schlangenId: ' ', position: 'links' })).toThrow(
      'Es müssen Handkarte, Schlange und Anlegeposition gewählt werden.',
    );
    expect(() => legeKarteAnSchlangeAn(zustand, { kartenId: anlegeKartenId, schlangenId, position: undefined })).toThrow(
      'Es müssen Handkarte, Schlange und Anlegeposition gewählt werden.',
    );
    expect(() => legeKarteAnSchlangeAn(zustand, { kartenId: anlegeKartenId, schlangenId, position: ' ' })).toThrow(
      'Es müssen Handkarte, Schlange und Anlegeposition gewählt werden.',
    );
  });

  it('verbietet Sonderkarten, fremde Handkarten, unbekannte Schlangen und blockierte Schlangen', () => {
    const basis = zustandMitAktiverSchlange();
    const fremdeKarte = basis.zustand.spieler[1].hand[0];
    const { zustand: mitSonderkarte, id: sonderkartenId } = verschiebeSonderkarteAufAktiveHand(basis.zustand);
    const blockiert = {
      ...basis.zustand,
      spieler: basis.zustand.spieler.map((spieler, index) =>
        index === 0
          ? { ...spieler, schlangen: [{ ...spieler.schlangen[0], zustand: 'blockiert' as const }] }
          : spieler,
      ),
    };

    expect(() => legeKarteAnSchlangeAn(mitSonderkarte, { kartenId: sonderkartenId, schlangenId: basis.schlangenId, position: 'links' })).toThrow(
      'An eine Schlange kann nur eine Farbkarte angelegt werden.',
    );
    expect(() => legeKarteAnSchlangeAn(basis.zustand, { kartenId: fremdeKarte.id, schlangenId: basis.schlangenId, position: 'links' })).toThrow(
      'Die Karte befindet sich nicht auf der Hand des aktiven Spielers.',
    );
    expect(() => legeKarteAnSchlangeAn(basis.zustand, { kartenId: basis.anlegeKartenId, schlangenId: 'schlange-fehlt', position: 'links' })).toThrow(
      'Schlange nicht gefunden.',
    );
    expect(() => legeKarteAnSchlangeAn(blockiert, { kartenId: basis.anlegeKartenId, schlangenId: basis.schlangenId, position: 'links' })).toThrow(
      'Eine blockierte Schlange kann nicht erweitert werden.',
    );
  });

  it('verbietet Anlegen nach erfülltem Zwei-Karten-Limit', () => {
    const { zustand, schlangenId, anlegeKartenId } = zustandMitAktiverSchlange();
    const limitErreicht = {
      ...zustand,
      zugpflichten: { gespielteKarten: 2, gespielteFarbkarten: 1, gespielteSonderkarten: 1 },
    };

    expect(() => legeKarteAnSchlangeAn(limitErreicht, { kartenId: anlegeKartenId, schlangenId, position: 'links' })).toThrow(
      'Die Ausspielphase darf höchstens zwei gespielte Karten enthalten.',
    );
  });
});

