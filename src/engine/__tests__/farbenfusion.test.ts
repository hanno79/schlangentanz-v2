/*
Author: rahn
Datum: 03.06.2026
Version: 1.0
Beschreibung: TDD-Tests für die Farbenfusion-Sonderkarte (R80): fusioniert zwei nebeneinanderliegende Karten gleicher Farbe zu einer Punkteeinheit.
*/

import { describe, expect, it } from 'vitest';
import { deserialisiere, anwendeAktion, pruefeAktion, erstelleSpielzustand, serialisiere } from '../index';
import { schlange } from './testHelpers';

function zustandMitFarbenfusion() {
  const zustand = erstelleSpielzustand(2, () => 0.999999);
  const farbenfusionIndex = zustand.nachziehstapel.findIndex(
    (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Farbenfusion',
  );
  if (farbenfusionIndex < 0) throw new Error('Testsetup erwartet eine Farbenfusion auf dem Nachziehstapel.');
  const [farbenfusion] = zustand.nachziehstapel.splice(farbenfusionIndex, 1) as [
    Extract<typeof zustand.nachziehstapel[number], { typ: 'Sonderkarte' }>,
  ];

  const hand = zustand.spieler[0].hand;
  const [ersteZielkarte, zweiteZielkarte, restkarte] = hand;
  if (
    ersteZielkarte?.typ !== 'Farbkarte' ||
    zweiteZielkarte?.typ !== 'Farbkarte' ||
    restkarte === undefined ||
    ersteZielkarte.farbe !== zweiteZielkarte.farbe
  ) {
    throw new Error('Testsetup erwartet zwei benachbarte Zielkarten gleicher Farbe plus eine Restkarte.');
  }

  zustand.zugphase = 'Ausspielphase';
  zustand.spieler[0].schlangen = [schlange(hand.slice(0, 3), 'schlange-spieler-1-1')];
  zustand.spieler[0].hand = [farbenfusion, ...hand.slice(3)];

  return {
    zustand,
    farbenfusion,
    zielKartenId: ersteZielkarte.id,
    zweiteZielKartenId: zweiteZielkarte.id,
    erwarteteRestkarteId: restkarte.id,
    erwarteteFusionPunkte: ersteZielkarte.punkte + zweiteZielkarte.punkte,
  };
}

describe('Farbenfusion', () => {
  it('fusioniert zwei nebeneinanderliegende Karten gleicher Farbe und speichert die Punktesumme', () => {
    const { zustand, farbenfusion, zielKartenId, erwarteteRestkarteId, erwarteteFusionPunkte } = zustandMitFarbenfusion();

    const aktualisiert = anwendeAktion(zustand, {
      typ: 'FarbenfusionSpielen',
      spielerId: 'spieler-1',
      handkartenId: farbenfusion.id,
      zielSchlangenId: 'schlange-spieler-1-1',
      zielKartenId,
    });

    /* ÄNDERUNG [03.08.2026]: R2.3a. Nach einer Sonderkarte wird sofort eine
       Karte nachgezogen — die Hand ist deshalb um eins voller als zuvor. */
    expect(aktualisiert.spieler[0].hand).toHaveLength(3);
    expect(aktualisiert.spieler[0].schlangen[0].karten.map((k) => k.id)).toEqual([farbenfusion.id, erwarteteRestkarteId]);
    expect(aktualisiert.spieler[0].schlangen[0].farbenfusionen).toEqual([
      { kartenId: farbenfusion.id, punkte: erwarteteFusionPunkte },
    ]);
    expect(aktualisiert.zugpflichten.farbenfusionGespielt).toBe(true);
    expect(aktualisiert.zugpflichten.gespielteSonderkarten).toBe(1);
  });

  it('bleibt nach Serialisierung und Deserialisierung materialkonsistent', () => {
    const { zustand, farbenfusion, zielKartenId, zweiteZielKartenId, erwarteteRestkarteId, erwarteteFusionPunkte } = zustandMitFarbenfusion();
    expect(() => deserialisiere(serialisiere(zustand))).not.toThrow();

    const aktualisiert = anwendeAktion(zustand, {
      typ: 'FarbenfusionSpielen',
      spielerId: 'spieler-1',
      handkartenId: farbenfusion.id,
      zielSchlangenId: 'schlange-spieler-1-1',
      zielKartenId,
    });

    const roundtrip = deserialisiere(serialisiere(aktualisiert));
    expect(roundtrip.spieler[0].schlangen[0].karten.map((karte) => karte.id)).toEqual([
      farbenfusion.id,
      erwarteteRestkarteId,
    ]);
    expect(roundtrip.spieler[0].schlangen[0].farbenfusionen).toEqual([
      { kartenId: farbenfusion.id, punkte: erwarteteFusionPunkte },
    ]);
    expect(roundtrip.ablagestapel.map((karte) => karte.id)).toEqual(expect.arrayContaining([zielKartenId, zweiteZielKartenId]));
    expect(roundtrip.ablagestapel.map((karte) => karte.id)).not.toContain(farbenfusion.id);
  });

  it('verbietet Farbenfusion auf nicht benachbarten oder ungleichen Karten', () => {
    const { zustand, farbenfusion, erwarteteRestkarteId } = zustandMitFarbenfusion();

    const ergebnis = pruefeAktion(zustand, {
      typ: 'FarbenfusionSpielen',
      spielerId: 'spieler-1',
      handkartenId: farbenfusion.id,
      zielSchlangenId: 'schlange-spieler-1-1',
      zielKartenId: erwarteteRestkarteId,
    });

    expect(ergebnis.erlaubt).toBe(false);
  });
});