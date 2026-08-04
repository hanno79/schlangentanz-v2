/*
Author: rahn
Datum: 03.06.2026
Version: 1.0
Beschreibung: Regressionstests für die R78-Farbenschutz-Reaktionskette bei Schlangenblockade und Farbendieb.
*/

import { describe, expect, it } from 'vitest';
import { anwendeAktion, erstelleSpielzustand } from '../index';
import { farbkarte, schlange } from './testHelpers';

function erstelleZustandMitReaktionskarte(angriffsname: 'Schlangenblockade' | 'Farbendieb') {
  const zustand = erstelleSpielzustand(2, () => 0.999999);
  const angriff = zustand.nachziehstapel.find(
    (karte): karte is Extract<typeof zustand.nachziehstapel[number], { typ: 'Sonderkarte' }> =>
      karte.typ === 'Sonderkarte' && karte.name === angriffsname,
  );
  const farbenschutz = zustand.nachziehstapel.find(
    (karte): karte is Extract<typeof zustand.nachziehstapel[number], { typ: 'Sonderkarte' }> =>
      karte.typ === 'Sonderkarte' && karte.name === 'Farbenschutz',
  );

  if (!angriff || !farbenschutz) {
    throw new Error(`Testsetup erwartet ${angriffsname} und Farbenschutz.`);
  }

  zustand.spieler[0].hand = [angriff];
  zustand.spieler[1].hand = [farbenschutz];
  zustand.zugphase = 'Ausspielphase';
  zustand.spieler[0].schlangen = [schlange([farbkarte('eigene-rot', 'Rot'), farbkarte('eigene-gelb', 'Gelb')], 'schlange-spieler-1-1')];
  zustand.spieler[1].schlangen = [schlange([farbkarte('ziel-blau', 'Blau')], 'schlange-spieler-2-1')];

  return { zustand, angriff, farbenschutz };
}

/* ÄNDERUNG [04.08.2026]: O-1. Die Schlangenblockade trägt jetzt eine
   Einfügeposition. Alle Aufrufe hier setzen `einfügeIndex: 1` — das Ende der
   einkartigen Zielschlange und damit genau das Verhalten von vor der Regel.
   Diese Tests prüfen die Reaktionskette, nicht die Position. */
describe('Turn State Machine — R78 Reaktionen auf Farbenschutz', () => {
  it('setzt pendingReaktion wenn Schlangenblockade gegen Zielspieler mit Farbenschutz gespielt wird', () => {
    const { zustand, angriff, farbenschutz } = erstelleZustandMitReaktionskarte('Schlangenblockade');

    const nachAngriff = anwendeAktion(zustand, {
      typ: 'SchlangenblockadeSpielen',
      spielerId: 'spieler-1',
      handkartenId: angriff.id,
      zielSpielerId: 'spieler-2',
      zielSchlangenId: 'schlange-spieler-2-1',
      einfügeIndex: 1,
    });

    expect(nachAngriff.pendingReaktion).toEqual({
      typ: 'SchlangenblockadeAbwehr',
      angreifenderSpielerIndex: 0,
      zielSpielerIndex: 1,
      zielSchlangenId: 'schlange-spieler-2-1',
      blockadeKartenId: angriff.id,
      // O-1: Die Position wird bei der Ansage festgelegt und hier mitgeführt.
      einfügeIndex: 1,
    });
    expect(nachAngriff.ablagestapel.map((karte) => karte.id)).toContain(angriff.id);
    expect(nachAngriff.spieler[1].hand.map((karte) => karte.id)).toContain(farbenschutz.id);
  });

  it('blockiert normale Ausspielaktionen solange Schlangenblockade pendingReaktion offen ist', () => {
    const { zustand, angriff, farbenschutz } = erstelleZustandMitReaktionskarte('Schlangenblockade');

    const nachAngriff = anwendeAktion(zustand, {
      typ: 'SchlangenblockadeSpielen',
      spielerId: 'spieler-1',
      handkartenId: angriff.id,
      zielSpielerId: 'spieler-2',
      zielSchlangenId: 'schlange-spieler-2-1',
      einfügeIndex: 1,
    });

    expect(() =>
      anwendeAktion(nachAngriff, {
        typ: 'FarbenschutzSpielen',
        spielerId: 'spieler-2',
        handkartenId: farbenschutz.id,
        zielSchlangenId: 'schlange-spieler-2-1',
      }),
    ).toThrow(/ausstehende Reaktion/);
  });

  it('neutralisiert Schlangenblockade wenn Zielspieler explizit SchlangenblockadeAbwehren wählt', () => {
    const { zustand, angriff, farbenschutz } = erstelleZustandMitReaktionskarte('Schlangenblockade');

    const nachAngriff = anwendeAktion(zustand, {
      typ: 'SchlangenblockadeSpielen',
      spielerId: 'spieler-1',
      handkartenId: angriff.id,
      zielSpielerId: 'spieler-2',
      zielSchlangenId: 'schlange-spieler-2-1',
      einfügeIndex: 1,
    });
    const nachAbwehr = anwendeAktion(nachAngriff, {
      typ: 'SchlangenblockadeAbwehren',
      spielerId: 'spieler-2',
      abwehrHandkartenId: farbenschutz.id,
    });

    expect(nachAbwehr.pendingReaktion).toBeNull();
    expect(nachAbwehr.spieler[1].hand.map((karte) => karte.id)).not.toContain(farbenschutz.id);
    expect(nachAbwehr.ablagestapel.map((karte) => karte.id)).toContain(farbenschutz.id);
    const blockadeKarte = nachAbwehr.spieler[1].schlangen[0].karten.at(-1);
    expect(blockadeKarte).toMatchObject({ typ: 'Farbkarte', farbe: 'Blau' });
  });

  it('legt Schlangenblockade durch Durchlassen mit eigenem Marker auf der Zielschlange ab', () => {
    const { zustand, angriff } = erstelleZustandMitReaktionskarte('Schlangenblockade');

    const nachAngriff = anwendeAktion(zustand, {
      typ: 'SchlangenblockadeSpielen',
      spielerId: 'spieler-1',
      handkartenId: angriff.id,
      zielSpielerId: 'spieler-2',
      zielSchlangenId: 'schlange-spieler-2-1',
      einfügeIndex: 1,
    });
    const nachDurchlassen = anwendeAktion(nachAngriff, {
      typ: 'SchlangenblockadeDurchlassen',
      spielerId: 'spieler-2',
    });

    expect(nachDurchlassen.pendingReaktion).toBeNull();
    expect(nachDurchlassen.spieler[1].schlangen[0].karten).toHaveLength(2);
    expect(nachDurchlassen.spieler[1].schlangen[0].karten.at(-1)).toMatchObject({
      typ: 'Sonderkarte',
      name: 'Schlangenblockade',
      id: angriff.id,
    });
    expect(nachDurchlassen.ablagestapel.map((karte) => karte.id)).not.toContain(angriff.id);
  });

  it('setzt pendingReaktion wenn Farbendieb gegen Zielspieler mit Farbenschutz gespielt wird', () => {
    const { zustand, angriff, farbenschutz } = erstelleZustandMitReaktionskarte('Farbendieb');

    const nachAngriff = anwendeAktion(zustand, {
      typ: 'FarbendiebSpielen',
      spielerId: 'spieler-1',
      handkartenId: angriff.id,
      zielSpielerId: 'spieler-2',
      zielSchlangenId: 'schlange-spieler-2-1',
      zielKartenId: 'ziel-blau',
      eigeneSchlangenId: 'schlange-spieler-1-1',
      einfügeIndex: 1,
    });

    expect(nachAngriff.pendingReaktion).toEqual({
      typ: 'FarbendiebAbwehr',
      angreifenderSpielerIndex: 0,
      zielSpielerIndex: 1,
      zielSchlangenId: 'schlange-spieler-2-1',
      zielKartenId: 'ziel-blau',
      eigeneSchlangenId: 'schlange-spieler-1-1',
      einfügeIndex: 1,
    });
    expect(nachAngriff.ablagestapel.map((karte) => karte.id)).toContain(angriff.id);
    expect(nachAngriff.spieler[1].hand.map((karte) => karte.id)).toContain(farbenschutz.id);
    expect(nachAngriff.spieler[1].schlangen[0].karten.map((karte) => karte.id)).toEqual(['ziel-blau']);
  });

  it('neutralisiert Farbendieb wenn Zielspieler explizit FarbendiebAbwehren wählt', () => {
    const { zustand, angriff, farbenschutz } = erstelleZustandMitReaktionskarte('Farbendieb');

    const nachAngriff = anwendeAktion(zustand, {
      typ: 'FarbendiebSpielen',
      spielerId: 'spieler-1',
      handkartenId: angriff.id,
      zielSpielerId: 'spieler-2',
      zielSchlangenId: 'schlange-spieler-2-1',
      zielKartenId: 'ziel-blau',
      eigeneSchlangenId: 'schlange-spieler-1-1',
      einfügeIndex: 1,
    });
    const nachAbwehr = anwendeAktion(nachAngriff, {
      typ: 'FarbendiebAbwehren',
      spielerId: 'spieler-2',
      abwehrHandkartenId: farbenschutz.id,
    });

    expect(nachAbwehr.pendingReaktion).toBeNull();
    expect(nachAbwehr.spieler[1].hand.map((karte) => karte.id)).not.toContain(farbenschutz.id);
    expect(nachAbwehr.ablagestapel.map((karte) => karte.id)).toContain(farbenschutz.id);
    expect(nachAbwehr.spieler[1].schlangen[0].karten.map((karte) => karte.id)).toEqual(['ziel-blau']);
    expect(nachAbwehr.spieler[0].schlangen[0].karten.map((karte) => karte.id)).toEqual([
      'eigene-rot',
      'eigene-gelb',
    ]);
  });
});
