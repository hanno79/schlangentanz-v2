/*
Author: rahn
Datum: 03.06.2026
Version: 1.2
Beschreibung: Regressionstest für die Schlangenblockade-Sonderkarte im Engine-Flow.
# ÄNDERUNG 03.06.2026: Neuer Test für das Anlegen der Schlangenblockade als neutrale Karte auf einer Zielschlange.
# ÄNDERUNG 03.06.2026: Zusätzlicher Regressionstest stellte sicher, dass Schlangenblockade nicht auf der eigenen Schlange gespielt werden darf — **aufgehoben durch O-1**, siehe unten.

ÄNDERUNG [04.08.2026]: O-1. Alle Aufrufe hier setzen `einfügeIndex` auf die
Länge der Zielschlange — das Ende, und damit genau das Verhalten von vor der
Regel. Die Blockade darf seit dem Signoff vom 03.08.2026 an
jeder beliebigen Stelle liegen, auch in der eigenen Schlange. Zwei Zusicherungen
dieser Datei sagten das Gegenteil und sind nach `schlangenblockade_position.test.ts`
gewandert, wo sie umgedreht stehen. Was hier bleibt, ist das Verhalten, das O-1
**nicht** ändert: Ein Index am Ende hängt hinten an wie eh und je.
*/

import { describe, expect, it } from 'vitest';
import {
  berechneFarbgruppenPunkte,
  deserialisiere,
  erstelleSpielzustand,
  serialisiere,
  spieleSchlangenblockade,
} from '../index';
import { schlange, schlangeMitFarben } from './testHelpers';

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
      einfügeIndex: zustand.spieler[1].schlangen[0].karten.length,
    });

    expect(aktualisiert.pendingReaktion).toBeNull();
    expect(aktualisiert.ablagestapel.map((karte) => karte.id)).not.toContain(schlangenblockade.id);
    expect(aktualisiert.spieler[1].schlangen[0].karten).toHaveLength(1);
    expect(aktualisiert.spieler[1].schlangen[0].karten[0]).toMatchObject({
      typ: 'Sonderkarte',
      name: 'Schlangenblockade',
    });
  });

  /*
   * ÄNDERUNG [02.08.2026]: Die Einfügeposition war nirgends festgehalten.
   *
   * Die Tests darüber legen auf eine *leere* Zielschlange — dort ist „ans Ende"
   * dasselbe wie „irgendwohin". Damit stand nirgends geschrieben, was die Karte
   * mit einer bestehenden Farbgruppe macht, und GAME_SPEC R3.5a behauptete
   * zwischenzeitlich, sie zerreiße eine.
   *
   * ÄNDERUNG [04.08.2026]: O-1 hat genau das getan, was hier als Bedingung
   * stand („wer das ändern will, bricht hier"). Die Karte kennt jetzt eine
   * wählbare Position. Dieser Test prüft seither den **Sonderfall Ende**: Dort
   * liegt rechts nichts, die Dreiergruppe bleibt vollständig und zählt weiter.
   * Der neue Regelfall — mittendrin, Gruppe zerrissen — steht in
   * `schlangenblockade_position.test.ts`.
   */
  it('zerreißt bei einem Index am Ende keine bestehende Farbgruppe', () => {
    const zustand = zustandMitSchlangenblockade();
    const schlangenblockade = zustand.spieler[0].hand[0];
    zustand.spieler[1].schlangen = [
      schlangeMitFarben('schlange-spieler-2-1', ['Rot', 'Rot', 'Rot']),
    ];
    const punkteVorher = berechneFarbgruppenPunkte(zustand.spieler[1].schlangen[0]).gesamtPunkte;

    const aktualisiert = spieleSchlangenblockade(zustand, {
      kartenId: schlangenblockade.id,
      zielSpielerIndex: 1,
      zielSchlangenId: 'schlange-spieler-2-1',
      einfügeIndex: zustand.spieler[1].schlangen[0].karten.length,
    });

    const zielschlange = aktualisiert.spieler[1].schlangen[0];
    expect(zielschlange.karten).toHaveLength(4);
    // Letzte Position, nicht irgendeine.
    expect(zielschlange.karten[3].id).toBe(schlangenblockade.id);
    expect(zielschlange.karten.slice(0, 3).map((karte) => karte.id)).toEqual(
      zustand.spieler[1].schlangen[0].karten.slice(0, 3).map((karte) => karte.id),
    );
    // Und deshalb kostet die Blockade im Moment des Ausspielens keinen Punkt.
    expect(berechneFarbgruppenPunkte(zielschlange).gesamtPunkte).toBe(punkteVorher);
  });

  it('bleibt nach Serialisierung und Deserialisierung materialkonsistent', () => {
    const zustand = zustandMitSchlangenblockade();
    const schlangenblockade = zustand.spieler[0].hand[0];

    const aktualisiert = spieleSchlangenblockade(zustand, {
      kartenId: schlangenblockade.id,
      zielSpielerIndex: 1,
      zielSchlangenId: 'schlange-spieler-2-1',
      einfügeIndex: zustand.spieler[1].schlangen[0].karten.length,
    });

    const roundtrip = deserialisiere(serialisiere(aktualisiert));
    expect(roundtrip.spieler[1].schlangen[0].karten.map((karte) => karte.id)).toEqual([
      schlangenblockade.id,
    ]);
    expect(roundtrip.ablagestapel.map((karte) => karte.id)).not.toContain(schlangenblockade.id);
  });

  /* ÄNDERUNG [04.08.2026]: O-1 hebt diese Sperre auf. Hier stand „verbietet
     Schlangenblockade auf der eigenen Schlange"; die umgedrehte Zusicherung
     steht jetzt in `schlangenblockade_position.test.ts`. Was bleibt, ist die
     Prüfung, dass die Karte ohne Ziel nicht gespielt werden kann — die hat mit
     O-1 nichts zu tun und war vorher nirgends festgehalten. */
  it('verlangt eine Zielschlange', () => {
    const zustand = zustandMitSchlangenblockade();
    const schlangenblockade = zustand.spieler[0].hand[0];

    expect(() =>
      spieleSchlangenblockade(zustand, {
        kartenId: schlangenblockade.id,
        zielSpielerIndex: 1,
        zielSchlangenId: 'gibt-es-nicht',
        einfügeIndex: 0,
      }),
    ).toThrow('Die ausgewählte Zielschlange ist ungültig.');
  });
});
