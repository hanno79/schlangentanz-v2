/*
Author: rahn
Datum: 03.06.2026
Version: 1.2
Beschreibung: TDD-Tests für die Schlangenfrass-Sonderkarte (R79): entfernt 1–2 Karten aus beliebigen Schlangen und löst die Farbenschutz-Reaktionskette aus.
*/

import { describe, expect, it } from 'vitest';
import { anwendeAktion, ermittleLegaleAktionen, ermittleReaktionsAktionen, pruefeAktion, erstelleSpielzustand } from '../index';
import { farbkarte, schlange, sonderkarte } from './testHelpers';

function zustandMitSchlangenfrass() {
  const zustand = erstelleSpielzustand(2, () => 0.999999);
  const schlangenfrass = zustand.nachziehstapel.find(
    (karte): karte is Extract<typeof zustand.nachziehstapel[number], { typ: 'Sonderkarte' }> =>
      karte.typ === 'Sonderkarte' && karte.name === 'Schlangenfrass',
  );
  if (!schlangenfrass) throw new Error('Testsetup erwartet eine Schlangenfrass auf dem Nachziehstapel.');

  zustand.zugphase = 'Ausspielphase';
  zustand.spieler[0].hand = [schlangenfrass];
  zustand.spieler[0].schlangen = [schlange([farbkarte('eigene-rot', 'Rot')], 'schlange-spieler-1-1')];
  zustand.spieler[1].schlangen = [
    schlange([farbkarte('ziel-blau', 'Blau'), farbkarte('ziel-gelb', 'Gelb')], 'schlange-spieler-2-1'),
  ];

  return { zustand, schlangenfrass };
}

function zustandMitSchlangenfrassMitDreiSpielern() {
  const zustand = erstelleSpielzustand(3, () => 0.999999);
  const schlangenfrass = zustand.nachziehstapel.find(
    (karte): karte is Extract<typeof zustand.nachziehstapel[number], { typ: 'Sonderkarte' }> =>
      karte.typ === 'Sonderkarte' && karte.name === 'Schlangenfrass',
  );
  if (!schlangenfrass) throw new Error('Testsetup erwartet eine Schlangenfrass auf dem Nachziehstapel.');

  zustand.zugphase = 'Ausspielphase';
  zustand.spieler[0].hand = [schlangenfrass];
  zustand.spieler[0].schlangen = [schlange([farbkarte('eigene-rot', 'Rot')], 'schlange-spieler-1-1')];
  zustand.spieler[1].schlangen = [
    schlange([farbkarte('ziel-blau', 'Blau'), farbkarte('ziel-gelb', 'Gelb')], 'schlange-spieler-2-1'),
  ];
  zustand.spieler[2].schlangen = [
    schlange([farbkarte('ziel-gruen', 'Grün'), farbkarte('ziel-violett', 'Violett')], 'schlange-spieler-3-1'),
  ];

  return { zustand, schlangenfrass };
}

describe('Schlangenfrass', () => {
  it('entfernt zwei Zielkarten aus gegnerischen Schlangen und legt sie auf den Ablagestapel', () => {
    const { zustand, schlangenfrass } = zustandMitSchlangenfrassMitDreiSpielern();

    const aktualisiert = anwendeAktion(zustand, {
      typ: 'SchlangenfrassSpielen',
      spielerId: 'spieler-1',
      handkartenId: schlangenfrass.id,
      ziele: [
        { spielerId: 'spieler-2', schlangenId: 'schlange-spieler-2-1', kartenId: 'ziel-blau' },
        { spielerId: 'spieler-3', schlangenId: 'schlange-spieler-3-1', kartenId: 'ziel-gruen' },
      ],
    });

    expect(aktualisiert.spieler[1].schlangen[0].karten.map((k) => k.id)).toEqual(['ziel-gelb']);
    expect(aktualisiert.spieler[2].schlangen[0].karten.map((k) => k.id)).toEqual(['ziel-violett']);
    expect(aktualisiert.ablagestapel.map((k) => k.id)).toContain('ziel-blau');
    expect(aktualisiert.ablagestapel.map((k) => k.id)).toContain('ziel-gruen');
    expect(aktualisiert.spieler[0].hand).toHaveLength(0);
    expect(aktualisiert.zugpflichten.gespielteSonderkarten).toBe(1);
  });

  it('entfernt zwei Zielkarten aus beliebigen Schlangen in einem Zug', () => {
    const { zustand, schlangenfrass } = zustandMitSchlangenfrass();

    const aktualisiert = anwendeAktion(zustand, {
      typ: 'SchlangenfrassSpielen',
      spielerId: 'spieler-1',
      handkartenId: schlangenfrass.id,
      ziele: [
        { spielerId: 'spieler-2', schlangenId: 'schlange-spieler-2-1', kartenId: 'ziel-blau' },
        { spielerId: 'spieler-2', schlangenId: 'schlange-spieler-2-1', kartenId: 'ziel-gelb' },
      ],
    });

    expect(aktualisiert.spieler[1].schlangen[0].karten).toHaveLength(0);
    expect(aktualisiert.ablagestapel.map((k) => k.id)).toContain('ziel-blau');
    expect(aktualisiert.ablagestapel.map((k) => k.id)).toContain('ziel-gelb');
  });

  it('startet eine Pending-Reaktion für geschützte Ziele und entfernt ungeschützte Ziele sofort', () => {
    const { zustand, schlangenfrass } = zustandMitSchlangenfrassMitDreiSpielern();
    zustand.spieler[1].hand.unshift(sonderkarte('schutz-spieler-2', 'Farbenschutz'));

    const aktualisiert = anwendeAktion(zustand, {
      typ: 'SchlangenfrassSpielen',
      spielerId: 'spieler-1',
      handkartenId: schlangenfrass.id,
      ziele: [
        { spielerId: 'spieler-2', schlangenId: 'schlange-spieler-2-1', kartenId: 'ziel-blau' },
        { spielerId: 'spieler-3', schlangenId: 'schlange-spieler-3-1', kartenId: 'ziel-gruen' },
      ],
    });

    expect(aktualisiert.spieler[1].schlangen[0].karten.map((k) => k.id)).toEqual(['ziel-blau', 'ziel-gelb']);
    expect(aktualisiert.spieler[2].schlangen[0].karten.map((k) => k.id)).toEqual(['ziel-violett']);
    expect(aktualisiert.pendingReaktion).toEqual({
      typ: 'SchlangenfrassAbwehr',
      angreifenderSpielerIndex: 0,
      verbleibendeZiele: [{ spielerIndex: 1, schlangenId: 'schlange-spieler-2-1', kartenId: 'ziel-blau' }],
    });

    const reaktionen = ermittleReaktionsAktionen(aktualisiert);
    expect(reaktionen).toEqual([
      { typ: 'SchlangenfrassAbwehren', spielerId: 'spieler-2', abwehrHandkartenId: 'schutz-spieler-2' },
      { typ: 'SchlangenfrassDurchlassen', spielerId: 'spieler-2' },
    ]);
  });

  it('löst Schlangenfrass per Abwehr auf und lässt die Zielkarte liegen', () => {
    const { zustand, schlangenfrass } = zustandMitSchlangenfrassMitDreiSpielern();
    zustand.spieler[1].hand.unshift(sonderkarte('schutz-spieler-2', 'Farbenschutz'));

    const nachAngriff = anwendeAktion(zustand, {
      typ: 'SchlangenfrassSpielen',
      spielerId: 'spieler-1',
      handkartenId: schlangenfrass.id,
      ziele: [
        { spielerId: 'spieler-2', schlangenId: 'schlange-spieler-2-1', kartenId: 'ziel-blau' },
        { spielerId: 'spieler-3', schlangenId: 'schlange-spieler-3-1', kartenId: 'ziel-gruen' },
      ],
    });

    const aufgeloest = anwendeAktion(nachAngriff, {
      typ: 'SchlangenfrassAbwehren',
      spielerId: 'spieler-2',
      abwehrHandkartenId: 'schutz-spieler-2',
    });

    expect(aufgeloest.spieler[1].schlangen[0].karten.map((k) => k.id)).toEqual(['ziel-blau', 'ziel-gelb']);
    expect(aufgeloest.spieler[2].schlangen[0].karten.map((k) => k.id)).toEqual(['ziel-violett']);
    expect(aufgeloest.ablagestapel.map((k) => k.id)).toContain('schutz-spieler-2');
    expect(aufgeloest.ablagestapel.map((k) => k.id)).toContain('ziel-gruen');
    expect(aufgeloest.pendingReaktion).toBeNull();
  });

  it('löst Schlangenfrass per Durchlassen auf und entfernt die Zielkarte', () => {
    const { zustand, schlangenfrass } = zustandMitSchlangenfrassMitDreiSpielern();
    zustand.spieler[1].hand.unshift(sonderkarte('schutz-spieler-2', 'Farbenschutz'));

    const nachAngriff = anwendeAktion(zustand, {
      typ: 'SchlangenfrassSpielen',
      spielerId: 'spieler-1',
      handkartenId: schlangenfrass.id,
      ziele: [
        { spielerId: 'spieler-2', schlangenId: 'schlange-spieler-2-1', kartenId: 'ziel-blau' },
        { spielerId: 'spieler-3', schlangenId: 'schlange-spieler-3-1', kartenId: 'ziel-gruen' },
      ],
    });

    const aufgeloest = anwendeAktion(nachAngriff, {
      typ: 'SchlangenfrassDurchlassen',
      spielerId: 'spieler-2',
    });

    expect(aufgeloest.spieler[1].schlangen[0].karten.map((k) => k.id)).toEqual(['ziel-gelb']);
    expect(aufgeloest.spieler[2].schlangen[0].karten.map((k) => k.id)).toEqual(['ziel-violett']);
    expect(aufgeloest.ablagestapel.map((k) => k.id)).toContain('ziel-blau');
    expect(aufgeloest.ablagestapel.map((k) => k.id)).toContain('ziel-gruen');
    expect(aufgeloest.pendingReaktion).toBeNull();
  });

  it('kann eine Karte aus der eigenen Schlange entfernen', () => {
    const { zustand, schlangenfrass } = zustandMitSchlangenfrass();

    const aktualisiert = anwendeAktion(zustand, {
      typ: 'SchlangenfrassSpielen',
      spielerId: 'spieler-1',
      handkartenId: schlangenfrass.id,
      ziele: [{ spielerId: 'spieler-1', schlangenId: 'schlange-spieler-1-1', kartenId: 'eigene-rot' }],
    });

    expect(aktualisiert.spieler[0].schlangen[0].karten).toHaveLength(0);
    expect(aktualisiert.ablagestapel.map((k) => k.id)).toContain('eigene-rot');
  });

  it('verbietet leere Zielliste', () => {
    const { zustand, schlangenfrass } = zustandMitSchlangenfrass();

    const ergebnis = pruefeAktion(zustand, {
      typ: 'SchlangenfrassSpielen',
      spielerId: 'spieler-1',
      handkartenId: schlangenfrass.id,
      ziele: [],
    });

    expect(ergebnis.erlaubt).toBe(false);
  });

  it('verbietet Schlangenfrass mit nur einem gegnerischen Ziel', () => {
    const { zustand, schlangenfrass } = zustandMitSchlangenfrass();

    const ergebnis = pruefeAktion(zustand, {
      typ: 'SchlangenfrassSpielen',
      spielerId: 'spieler-1',
      handkartenId: schlangenfrass.id,
      ziele: [{ spielerId: 'spieler-2', schlangenId: 'schlange-spieler-2-1', kartenId: 'ziel-blau' }],
    });

    expect(ergebnis.erlaubt).toBe(false);
  });

  it('verbietet mehr als zwei Ziele', () => {
    const { zustand, schlangenfrass } = zustandMitSchlangenfrass();

    const ergebnis = pruefeAktion(zustand, {
      typ: 'SchlangenfrassSpielen',
      spielerId: 'spieler-1',
      handkartenId: schlangenfrass.id,
      ziele: [
        { spielerId: 'spieler-2', schlangenId: 'schlange-spieler-2-1', kartenId: 'ziel-blau' },
        { spielerId: 'spieler-2', schlangenId: 'schlange-spieler-2-1', kartenId: 'ziel-gelb' },
        { spielerId: 'spieler-1', schlangenId: 'schlange-spieler-1-1', kartenId: 'eigene-rot' },
      ],
    });

    expect(ergebnis.erlaubt).toBe(false);
  });

  it('verbietet doppelte Zielkarten', () => {
    const { zustand, schlangenfrass } = zustandMitSchlangenfrass();

    const ergebnis = pruefeAktion(zustand, {
      typ: 'SchlangenfrassSpielen',
      spielerId: 'spieler-1',
      handkartenId: schlangenfrass.id,
      ziele: [
        { spielerId: 'spieler-2', schlangenId: 'schlange-spieler-2-1', kartenId: 'ziel-blau' },
        { spielerId: 'spieler-2', schlangenId: 'schlange-spieler-2-1', kartenId: 'ziel-blau' },
      ],
    });

    expect(ergebnis.erlaubt).toBe(false);
  });

  it('verbietet ungültigen Zielspieler', () => {
    const { zustand, schlangenfrass } = zustandMitSchlangenfrass();

    const ergebnis = pruefeAktion(zustand, {
      typ: 'SchlangenfrassSpielen',
      spielerId: 'spieler-1',
      handkartenId: schlangenfrass.id,
      ziele: [{ spielerId: 'nicht-vorhanden', schlangenId: 'schlange-spieler-2-1', kartenId: 'ziel-blau' }],
    });

    expect(ergebnis.erlaubt).toBe(false);
  });

  it('verbietet ungültige Zielschlange', () => {
    const { zustand, schlangenfrass } = zustandMitSchlangenfrass();

    const ergebnis = pruefeAktion(zustand, {
      typ: 'SchlangenfrassSpielen',
      spielerId: 'spieler-1',
      handkartenId: schlangenfrass.id,
      ziele: [{ spielerId: 'spieler-2', schlangenId: 'nicht-vorhanden', kartenId: 'ziel-blau' }],
    });

    expect(ergebnis.erlaubt).toBe(false);
  });

  it('verbietet ungültige Zielkarte', () => {
    const { zustand, schlangenfrass } = zustandMitSchlangenfrass();

    const ergebnis = pruefeAktion(zustand, {
      typ: 'SchlangenfrassSpielen',
      spielerId: 'spieler-1',
      handkartenId: schlangenfrass.id,
      ziele: [{ spielerId: 'spieler-2', schlangenId: 'schlange-spieler-2-1', kartenId: 'nicht-vorhanden' }],
    });

    expect(ergebnis.erlaubt).toBe(false);
  });

  it('blockiert PflichtAbwurf wenn Schlangenfrass legal spielbar ist', () => {
    const { zustand, schlangenfrass } = zustandMitSchlangenfrass();

    const ergebnis = pruefeAktion(zustand, {
      typ: 'PflichtAbwurf',
      spielerId: 'spieler-1',
      handkartenId: schlangenfrass.id,
    });

    expect(ergebnis.erlaubt).toBe(false);
  });

  it('ermittleLegaleAktionen enthält SchlangenfrassSpielen wenn Zielkarten vorhanden', () => {
    const { zustand } = zustandMitSchlangenfrass();
    const aktionen = ermittleLegaleAktionen(zustand);
    expect(aktionen.some((a) => a.typ === 'SchlangenfrassSpielen')).toBe(true);
  });
});
