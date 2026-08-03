/*
Author: Claude Code
Datum: 03.08.2026
Version: 1.1
Beschreibung: Der Bonus für die längste ununterbrochene Farbkette.

Regel, Wortlaut der Normquelle, Gleichstand und Nullfall stehen in
`docs/GAME_SPEC.md` **R8.4a** — hier wird geprüft, nicht wiederholt.

**Warum diese Tests auf der Spielebene ansetzen.** Die Regel vergleicht Spieler
miteinander und kann in `berechneSpielerGrundpunkte` gar nicht entstehen.

**ÄNDERUNG [03.08.2026]:** Die erste Fassung prüfte interne Felder
(`kettenbonus.laenge`, `.farbe`), die kein Produktionsaufrufer liest — genau das
tote Muster, das derselbe Slice bei `ermittleFarbenFuerFarbvielfalt` entfernt
hat. Jetzt wird nur noch geprüft, was am Brett ankommt: **wer den Bonus bekommt.**
Der Regenbogen-Fall braucht dafür einen Gegner mit echter Dreierkette — und ist
damit der bessere Test, weil er die Regel und nicht die Datenstruktur festhält.
*/

import { describe, expect, it } from 'vitest';
import { berechneGewinner, berechneSpielerGrundpunkte, berechneSpielGesamtwertung } from '../index';
import type { Schlange, Spieler } from '../types';
import { farbkarte, schlange, sonderkarte, spielerMitId } from './testHelpers';

/** Wer hat den Kettenbonus bekommen? Genau das, was die Regel zusagt. */
function bonusEmpfaenger(spieler: Spieler[]): string[] {
  return berechneSpielGesamtwertung(spieler)
    .spielerwertungen.filter((eintrag) => eintrag.kettenbonus > 0)
    .map((eintrag) => eintrag.spielerId);
}

/** Drei Karten einer Farbe — die Vergleichskette der Länge 3. */
function dreierkette(id: string, farbe: 'Rot' | 'Grün'): Schlange {
  return schlange(
    [farbkarte(`${id}-1`, farbe), farbkarte(`${id}-2`, farbe), farbkarte(`${id}-3`, farbe)],
    id,
  );
}

describe('Längste Farbkette — R8.4a', () => {
  /*
   * Der wichtigste Test dieses Slices. Für die Farbgruppenwertung zählt die
   * Regenbogenschlange als Blau — dort ist die Gruppe fünf Karten lang. Für die
   * Kette unterbricht sie („ohne Sonderkarten!"), es bleiben zwei. Annas Kette
   * ist damit kürzer als Bens Dreierkette, und der Bonus geht an Ben.
   *
   * Wer die Wildcard-Transformation versehentlich in die Kettenrechnung zieht,
   * gibt Anna eine Fünferkette — und dieser Test fällt.
   */
  it('lässt die Regenbogenschlange die Kette unterbrechen, anders als die Farbgruppe', () => {
    const anna = spielerMitId('anna', 'Anna', [
      schlange([
        farbkarte('a1', 'Blau'),
        farbkarte('a2', 'Blau'),
        sonderkarte('a3', 'Regenbogenschlange'),
        farbkarte('a4', 'Blau'),
        farbkarte('a5', 'Blau'),
      ], 'anna-1'),
    ]);
    const ben = spielerMitId('ben', 'Ben', [dreierkette('ben-1', 'Rot')]);

    expect(bonusEmpfaenger([anna, ben])).toEqual(['ben']);

    // Gegenbeleg: Die Farbgruppenwertung sieht sehr wohl fünf blaue Karten.
    expect(berechneSpielerGrundpunkte(anna).farbgruppenPunkte.gesamtPunkte).toBe(4);
  });

  it('lässt auch die Farbenfusion die Kette unterbrechen', () => {
    const mitFusion: Schlange = {
      id: 'anna-1',
      zustand: 'aktiv',
      karten: [
        farbkarte('a1', 'Blau'),
        farbkarte('a2', 'Blau'),
        sonderkarte('a3', 'Farbenfusion'),
        farbkarte('a4', 'Blau'),
        farbkarte('a5', 'Blau'),
      ],
      farbenfusionen: [{ kartenId: 'a3', punkte: 2 }],
    };
    const anna = spielerMitId('anna', 'Anna', [mitFusion]);
    const ben = spielerMitId('ben', 'Ben', [dreierkette('ben-1', 'Rot')]);

    expect(bonusEmpfaenger([anna, ben])).toEqual(['ben']);
  });

  /*
   * ÄNDERUNG [03.08.2026]: Dazugekommen beim Umbau auf `ermittleFarbgruppen`.
   * Zwei gleichfarbige Läufe, getrennt durch eine Sonderkarte, dürfen **nicht**
   * zu einer Kette verschmelzen — sonst hätte Anna vier statt zwei.
   */
  it('verschmilzt zwei gleichfarbige Läufe nicht über eine Sonderkarte hinweg', () => {
    const anna = spielerMitId('anna', 'Anna', [
      schlange([
        farbkarte('a1', 'Blau'),
        farbkarte('a2', 'Blau'),
        sonderkarte('a3', 'Verdoppler'),
        farbkarte('a4', 'Blau'),
        farbkarte('a5', 'Blau'),
      ], 'anna-1'),
    ]);
    const ben = spielerMitId('ben', 'Ben', [dreierkette('ben-1', 'Rot')]);

    expect(bonusEmpfaenger([anna, ben])).toEqual(['ben']);
  });

  it('nimmt das Maximum über beide Schlangen eines Spielers', () => {
    const anna = spielerMitId('anna', 'Anna', [
      schlange([farbkarte('a1', 'Blau'), farbkarte('a2', 'Blau')], 'anna-1'),
      dreierkette('anna-2', 'Grün'),
    ]);
    const ben = spielerMitId('ben', 'Ben', [
      schlange([farbkarte('b1', 'Rot'), farbkarte('b2', 'Rot')], 'ben-1'),
    ]);

    // Annas zweite Schlange zählt, also gewinnt sie 3 zu 2.
    expect(bonusEmpfaenger([anna, ben])).toEqual(['anna']);
  });

  it('gibt bei Gleichstand allen beteiligten Spielern die vollen 5 Punkte', () => {
    const anna = spielerMitId('anna', 'Anna', [dreierkette('anna-1', 'Rot')]);
    const ben = spielerMitId('ben', 'Ben', [dreierkette('ben-1', 'Grün')]);
    const caro = spielerMitId('caro', 'Caro', [schlange([farbkarte('c1', 'Blau')], 'caro-1')]);

    expect(bonusEmpfaenger([anna, ben, caro])).toEqual(['anna', 'ben']);
  });

  it('gibt niemandem etwas, wenn keine Kette existiert', () => {
    const anna = spielerMitId('anna', 'Anna', []);
    const ben = spielerMitId('ben', 'Ben', [schlange([sonderkarte('b1', 'Verdoppler')], 'ben-1')]);

    expect(bonusEmpfaenger([anna, ben])).toEqual([]);
  });

  it('zählt den Bonus in die Gesamtpunkte des Spielers', () => {
    const anna = spielerMitId('anna', 'Anna', [dreierkette('anna-1', 'Rot')]);

    // 3 Farbgruppenpunkte + 5 Kettenbonus.
    expect(berechneSpielGesamtwertung([anna]).spielerwertungen[0].gesamtPunkte).toBe(8);
  });

  /*
   * Die Stolperstelle des Entwurfs: `wertung` sind die Grundpunkte und enthalten
   * den spielerübergreifenden Bonus absichtlich nicht. Seit der Umbenennung sagt
   * der Name das auch — der Test hält fest, dass es dabei bleibt.
   */
  it('lässt die Grundpunkte frei vom spielerübergreifenden Bonus', () => {
    const anna = spielerMitId('anna', 'Anna', [dreierkette('anna-1', 'Rot')]);

    expect(berechneSpielerGrundpunkte(anna).grundPunkte).toBe(3);
    expect(berechneSpielGesamtwertung([anna]).spielerwertungen[0].wertung.grundPunkte).toBe(3);
  });

  it('entscheidet die Gewinnerermittlung mit — ein Spieler gewinnt durch den Bonus', () => {
    // Ben führt nach Farbgruppen mit 6 zu 4 …
    const anna = spielerMitId('anna', 'Anna', [
      schlange([
        farbkarte('a1', 'Rot'),
        farbkarte('a2', 'Rot'),
        farbkarte('a3', 'Rot'),
        farbkarte('a4', 'Rot'),
      ], 'anna-1'),
    ]);
    const ben = spielerMitId('ben', 'Ben', [
      schlange([
        farbkarte('b1', 'Violett', 2),
        farbkarte('b2', 'Violett', 2),
        farbkarte('b3', 'Violett', 2),
      ], 'ben-1'),
    ]);

    // … aber Anna hat die längere Kette (4 gegen 3) und damit 4 + 5 = 9 zu 6.
    expect(berechneGewinner([anna, ben])).toEqual({
      hoechstePunktzahl: 9,
      gewinner: [{ spielerId: 'anna', name: 'Anna', gesamtPunkte: 9 }],
    });
  });
});
