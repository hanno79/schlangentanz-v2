/*
Author: rahn
Datum: 03.06.2026
Version: 1.2
Beschreibung: Regressionstest für die Schlangenblockade-Sonderkarte im Engine-Flow.
# ÄNDERUNG 03.06.2026: Neuer Test für das Anlegen der Schlangenblockade als neutrale Karte auf einer Zielschlange.
# ÄNDERUNG 03.06.2026: Zusätzlicher Regressionstest stellt sicher, dass Schlangenblockade nicht auf der eigenen Schlange gespielt werden darf.
*/

import { describe, expect, it } from 'vitest';
import { deserialisiere, erstelleSpielzustand, serialisiere, spieleSchlangenblockade } from '../index';
import { schlange } from './testHelpers';

function zustandMitSchlangenblockade(): ReturnType<typeof erstelleSpielzustand> {
  const zustand = erstelleSpielzustand(2, () => 0.999999);
  const schlangenblockade = zustand.nachziehstapel.find(
    (karte): karte is Extract<(typeof zustand.nachziehstapel)[number], { typ: 'Sonderkarte' }> =>
      karte.typ === 'Sonderkarte' && karte.name === 'Schlangenblockade',
  );

  if (!schlangenblockade) {
    throw new Error('Testsetup erwartet eine Schlangenblockade auf dem Nachziehstapel.');
  }

  const urspruenglicheHand = [...zustand.spieler[0].hand];
  zustand.spielphase = 'Normal';
  zustand.zugphase = 'Ausspielphase';
  zustand.spieler[0].hand = [schlangenblockade, ...urspruenglicheHand];
  zustand.nachziehstapel = zustand.nachziehstapel.filter((karte) => karte.id !== schlangenblockade.id);
  zustand.spieler[1].schlangen = [schlange([], 'schlange-spieler-2-1')];

  return zustand;
}

describe('Schlangenblockade', () => {
  it('legt ohne Farbenschutz eine neutrale Schlangenblockade auf der Zielschlange ab', () => {
    const zustand = zustandMitSchlangenblockade();
    const schlangenblockade = zustand.spieler[0].hand[0];

    const aktualisiert = spieleSchlangenblockade(zustand, {
      kartenId: schlangenblockade.id,
      zielSpielerIndex: 1,
      zielSchlangenId: 'schlange-spieler-2-1',
    });

    expect(aktualisiert.pendingReaktion).toBeNull();
    expect(aktualisiert.ablagestapel.map((karte) => karte.id)).not.toContain(schlangenblockade.id);
    expect(aktualisiert.spieler[1].schlangen[0].karten).toHaveLength(1);
    expect(aktualisiert.spieler[1].schlangen[0].karten[0]).toMatchObject({
      typ: 'Sonderkarte',
      name: 'Schlangenblockade',
    });
  });

  it('bleibt nach Serialisierung und Deserialisierung materialkonsistent', () => {
    const zustand = zustandMitSchlangenblockade();
    const schlangenblockade = zustand.spieler[0].hand[0];

    const aktualisiert = spieleSchlangenblockade(zustand, {
      kartenId: schlangenblockade.id,
      zielSpielerIndex: 1,
      zielSchlangenId: 'schlange-spieler-2-1',
    });

    const roundtrip = deserialisiere(serialisiere(aktualisiert));
    expect(roundtrip.spieler[1].schlangen[0].karten.map((karte) => karte.id)).toEqual([
      schlangenblockade.id,
    ]);
    expect(roundtrip.ablagestapel.map((karte) => karte.id)).not.toContain(schlangenblockade.id);
  });

  it('verbietet Schlangenblockade auf der eigenen Schlange', () => {
    const zustand = zustandMitSchlangenblockade();
    const schlangenblockade = zustand.spieler[0].hand[0];
    zustand.spieler[0].schlangen = [{ id: 'schlange-spieler-1-1', zustand: 'aktiv', karten: [] }];

    expect(() =>
      spieleSchlangenblockade(zustand, {
        kartenId: schlangenblockade.id,
        zielSpielerIndex: 0,
        zielSchlangenId: 'schlange-spieler-1-1',
      }),
    ).toThrow('Schlangenblockade kann nur auf die Schlange eines anderen Spielers gelegt werden.');
  });
});
