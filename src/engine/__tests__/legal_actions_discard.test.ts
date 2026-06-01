/*
Author: rahn
Datum: 01.06.2026
Version: 1.0
Beschreibung: TDD-Tests für Pflicht-Abwurf als Legal-Action im Schlangentanz-Engine-Slice R20.
*/

import { describe, expect, it } from 'vitest';
import { anwendeAktion, ermittleLegaleAktionen, erstelleSpielzustand, pruefeAktion } from '../index';
import type { Spielzustand } from '../types';

function zustandInAusspielphase(): Spielzustand {
  return { ...erstelleSpielzustand(2, () => 0.999999), zugphase: 'Ausspielphase' };
}

describe('Legal Action Validator — R20 Pflicht-Abwurf mangels spielbarer Aktion', () => {
  it('liefert Pflicht-Abwurf-Aktionen, wenn der aktive Spieler keine Schlangenbau-Aktion ausführen kann', () => {
    const zustand = zustandInAusspielphase();
    const sonderkarte = zustand.nachziehstapel.find((karte) => karte.typ === 'Sonderkarte');
    if (!sonderkarte) throw new Error('Testsetup erwartet Sonderkarte.');
    zustand.spieler[0].hand = [sonderkarte];

    expect(ermittleLegaleAktionen(zustand)).toEqual([
      {
        typ: 'PflichtAbwurf',
        spielerId: 'spieler-1',
        handkartenId: sonderkarte.id,
      },
    ]);
  });

  it('verbietet Pflicht-Abwurf, solange eine Schlangenbau-Aktion legal ist', () => {
    const zustand = zustandInAusspielphase();
    const karte = zustand.spieler[0].hand[0];

    expect(
      pruefeAktion(zustand, {
        typ: 'PflichtAbwurf',
        spielerId: 'spieler-1',
        handkartenId: karte.id,
      }),
    ).toEqual({
      erlaubt: false,
      grund: 'Pflicht-Abwurf ist nur erlaubt, wenn keine spielbare Karte verfügbar ist.',
    });
  });

  it('wendet Pflicht-Abwurf über den zentralen Engine-Dispatch an', () => {
    const zustand = zustandInAusspielphase();
    const sonderkarte = zustand.nachziehstapel.find((karte) => karte.typ === 'Sonderkarte');
    if (!sonderkarte) throw new Error('Testsetup erwartet Sonderkarte.');
    zustand.spieler[0].hand = [sonderkarte];

    const aktualisiert = anwendeAktion(zustand, {
      typ: 'PflichtAbwurf',
      spielerId: 'spieler-1',
      handkartenId: sonderkarte.id,
    });

    expect(aktualisiert.spieler[0].hand).toEqual([]);
    expect(aktualisiert.ablagestapel.at(-1)?.id).toBe(sonderkarte.id);
    expect(aktualisiert.zugpflichten).toEqual({
      gespielteKarten: 1,
      gespielteFarbkarten: 0,
      gespielteSonderkarten: 1,
    });
    expect(zustand.spieler[0].hand).toEqual([sonderkarte]);
  });

  it('filtert Pflicht-Abwurf-Aktionen, wenn das Kartenarten-Limit bereits erreicht ist', () => {
    const zustand = {
      ...zustandInAusspielphase(),
      zugpflichten: { gespielteKarten: 1, gespielteFarbkarten: 1, gespielteSonderkarten: 0 },
    };
    const farbkarte = zustand.spieler[0].hand[0];
    const sonderkarte = zustand.nachziehstapel.find((karte) => karte.typ === 'Sonderkarte');
    if (!sonderkarte) throw new Error('Testsetup erwartet Sonderkarte.');
    zustand.spieler[0].hand = [farbkarte, sonderkarte];

    expect(
      pruefeAktion(zustand, {
        typ: 'PflichtAbwurf',
        spielerId: 'spieler-1',
        handkartenId: farbkarte.id,
      }),
    ).toEqual({
      erlaubt: false,
      grund: 'Pro Zug darf höchstens eine Farbkarte gespielt werden.',
    });
    expect(ermittleLegaleAktionen(zustand)).toEqual([
      {
        typ: 'PflichtAbwurf',
        spielerId: 'spieler-1',
        handkartenId: sonderkarte.id,
      },
    ]);
  });

  it('verbietet Pflicht-Abwurf einer zweiten Sonderkarte im selben Zug', () => {
    const zustand = {
      ...zustandInAusspielphase(),
      zugpflichten: { gespielteKarten: 1, gespielteFarbkarten: 0, gespielteSonderkarten: 1 },
    };
    const sonderkarte = zustand.nachziehstapel.find((karte) => karte.typ === 'Sonderkarte');
    if (!sonderkarte) throw new Error('Testsetup erwartet Sonderkarte.');
    zustand.spieler[0].hand = [sonderkarte];

    expect(
      pruefeAktion(zustand, {
        typ: 'PflichtAbwurf',
        spielerId: 'spieler-1',
        handkartenId: sonderkarte.id,
      }),
    ).toEqual({
      erlaubt: false,
      grund: 'Pro Zug darf höchstens eine Sonderkarte gespielt werden.',
    });
    expect(ermittleLegaleAktionen(zustand)).toEqual([]);
  });
});
