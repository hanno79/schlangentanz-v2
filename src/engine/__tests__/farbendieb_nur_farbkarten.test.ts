/*
Author: rahn
Datum: 05.07.2026
Version: 1.0
Beschreibung: Audit-Fix K1 — Farbendieb darf ausschließlich Farbkarten stehlen.
              Gestohlene Sonderkarten (insb. fusionierte Farbenfusion-Karten)
              führten sonst zu einem Wertungs-Crash bzw. kaputter Serialisierung.
*/

import { describe, expect, it } from 'vitest';
import {
  anwendeAktion,
  ermittleLegaleAktionen,
  pruefeAktion,
  erstelleSpielzustand,
  berechneSpielerGrundpunkte,
} from '../index';
import { farbkarte, schlange, sonderkarte } from './testHelpers';
import type { FarbendiebSpielenAktion } from '../legalActions';

function zustandMitFarbendieb() {
  const zustand = erstelleSpielzustand(2, () => 0.999999);
  const farbendieb = zustand.nachziehstapel.find(
    (karte): karte is Extract<typeof zustand.nachziehstapel[number], { typ: 'Sonderkarte' }> =>
      karte.typ === 'Sonderkarte' && karte.name === 'Farbendieb',
  );
  if (!farbendieb) throw new Error('Testsetup erwartet einen Farbendieb auf dem Nachziehstapel.');

  zustand.zugphase = 'Ausspielphase';
  zustand.spieler[0].hand = [farbendieb];
  zustand.spieler[0].schlangen = [schlange([farbkarte('eigene-rot', 'Rot')], 'schlange-spieler-1-1')];
  // Zielspieler hat KEINEN Farbenschutz in der Hand (keine Reaktionskette).
  zustand.spieler[1].hand = [];
  return { zustand, farbendieb };
}

describe('Farbendieb — nur Farbkarten stehlbar (K1)', () => {
  it('lehnt das Stehlen einer Sonderkarte (Regenbogenschlange) ab', () => {
    const { zustand, farbendieb } = zustandMitFarbendieb();
    zustand.spieler[1].schlangen = [
      schlange([sonderkarte('regenbogen-ziel', 'Regenbogenschlange')], 'schlange-spieler-2-1'),
    ];

    const aktion: FarbendiebSpielenAktion = {
      typ: 'FarbendiebSpielen',
      spielerId: 'spieler-1',
      handkartenId: farbendieb.id,
      zielSpielerId: 'spieler-2',
      zielSchlangenId: 'schlange-spieler-2-1',
      zielKartenId: 'regenbogen-ziel',
      eigeneSchlangenId: 'schlange-spieler-1-1',
      einfügeIndex: 0,
    };

    expect(pruefeAktion(zustand, aktion).erlaubt).toBe(false);
    expect(() => anwendeAktion(zustand, aktion)).toThrow();
  });

  it('enumeriert keine Sonderkarten-Ziele', () => {
    const { zustand } = zustandMitFarbendieb();
    zustand.spieler[1].schlangen = [
      schlange(
        [farbkarte('ziel-blau', 'Blau'), sonderkarte('regenbogen-ziel', 'Regenbogenschlange')],
        'schlange-spieler-2-1',
      ),
    ];

    const diebAktionen = ermittleLegaleAktionen(zustand).filter(
      (a): a is FarbendiebSpielenAktion => a.typ === 'FarbendiebSpielen',
    );
    expect(diebAktionen.length).toBeGreaterThan(0);
    expect(diebAktionen.every((a) => a.zielKartenId !== 'regenbogen-ziel')).toBe(true);
    expect(diebAktionen.some((a) => a.zielKartenId === 'ziel-blau')).toBe(true);
  });

  it('erlaubt weiterhin das Stehlen einer Farbkarte und die Wertung bleibt stabil', () => {
    const { zustand, farbendieb } = zustandMitFarbendieb();
    zustand.spieler[1].schlangen = [
      schlange([farbkarte('ziel-blau', 'Blau'), farbkarte('ziel-gelb', 'Gelb')], 'schlange-spieler-2-1'),
    ];

    const aktualisiert = anwendeAktion(zustand, {
      typ: 'FarbendiebSpielen',
      spielerId: 'spieler-1',
      handkartenId: farbendieb.id,
      zielSpielerId: 'spieler-2',
      zielSchlangenId: 'schlange-spieler-2-1',
      zielKartenId: 'ziel-blau',
      eigeneSchlangenId: 'schlange-spieler-1-1',
      einfügeIndex: 0,
    });

    expect(aktualisiert.spieler[0].schlangen[0].karten.map((k) => k.id)).toContain('ziel-blau');
    expect(() => berechneSpielerGrundpunkte(aktualisiert.spieler[0])).not.toThrow();
  });
});
