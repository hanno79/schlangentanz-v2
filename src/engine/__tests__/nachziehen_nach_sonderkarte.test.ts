/*
Author: Claude Code
Datum: 03.08.2026
Version: 1.0
Beschreibung: Sofortiges Nachziehen nach einer Sonderkarte (GAME_SPEC R2.3a).

Normquelle, Abschnitt „Spielablauf und Timing von Sonderkarten":

  „Nach dem Ausspielen einer Sonderkarte darf sofort eine neue Karte nachgezogen
  werden, damit zu Beginn des eigenen Zuges wieder 5 Handkarten vorhanden sind."
  „Beide Spieler dürfen sofort eine neue Karte nachziehen." (nach einer Abwehr)
  „Nach Abhandlung aller Effekte werden neue Karten nachgezogen. Das Nachziehen
  erfolgt ebenfalls im Uhrzeigersinn."

Der letzte Satz ist der Grund, warum nicht beim Ablegen der Karte gezogen wird,
sondern erst am **Ende der Reaktionskette**: Sonst könnte ein Verteidiger, der
in derselben Kette ein zweites Mal gefragt wird (Schlangenfrass auf zwei Karten
desselben Gegners), einen frisch gezogenen Farbenschutz einsetzen, den er am
Tisch noch gar nicht in der Hand hätte.

Bis zum 03.08.2026 zog die Engine ausschließlich beim Zugwechsel.
*/

import { describe, expect, it } from 'vitest';
import { anwendeAktion, deserialisiere, erstelleSpielzustand, serialisiere } from '../index';
import type { Spielkarte, Spielzustand } from '../types';
import { schlange } from './testHelpers';

function sonderkarteAusStapel(zustand: Spielzustand, name: string): Extract<Spielkarte, { typ: 'Sonderkarte' }> {
  const karte = zustand.nachziehstapel.find(
    (k): k is Extract<Spielkarte, { typ: 'Sonderkarte' }> => k.typ === 'Sonderkarte' && k.name === name,
  );
  if (!karte) throw new Error(`Testsetup erwartet ${name} im Stapel.`);
  return karte;
}

/**
 * Angreifer mit Schlangenblockade, Zielspieler wahlweise mit Farbenschutz.
 *
 * Beide Hände enthalten **genau** ihre eine Karte — dadurch ist die Handgröße
 * nach dem Zug die Aussage des Tests, ohne dass man rechnen muss.
 */
function angriffsZustand({ zielHatSchutz }: { zielHatSchutz: boolean }) {
  const zustand = erstelleSpielzustand(2, () => 0.999999);
  const angriff = sonderkarteAusStapel(zustand, 'Schlangenblockade');
  const farbenschutz = sonderkarteAusStapel(zustand, 'Farbenschutz');

  /* Die ausgeteilten Hände wandern zurück in den Stapel, statt zu verschwinden —
     sonst ist das Kartenmaterial unvollständig und `serialisiere`/`deserialisiere`
     lehnt den Zustand zu Recht ab. */
  zustand.nachziehstapel = [
    ...zustand.nachziehstapel.filter((k) => k.id !== angriff.id && k.id !== farbenschutz.id),
    ...zustand.spieler[0].hand,
    ...zustand.spieler[1].hand,
  ];
  zustand.spieler[0].hand = [angriff];
  zustand.spieler[1].hand = zielHatSchutz ? [farbenschutz] : [];
  zustand.zugphase = 'Ausspielphase';
  /* Auch die Schlangen bekommen **echte** Deckkarten: Erfundene IDs lässt die
     Materialprüfung beim Serialisieren nicht durch. */
  const [eigene, fremde] = zustand.nachziehstapel.filter((k) => k.typ === 'Farbkarte').slice(0, 2);
  zustand.nachziehstapel = zustand.nachziehstapel.filter((k) => k.id !== eigene.id && k.id !== fremde.id);
  zustand.spieler[0].schlangen = [schlange([eigene], 'schlange-spieler-1-1')];
  zustand.spieler[1].schlangen = [schlange([fremde], 'schlange-spieler-2-1')];

  return { zustand, angriff, farbenschutz };
}

function spieleBlockade(zustand: Spielzustand, angriffId: string): Spielzustand {
  return anwendeAktion(zustand, {
    typ: 'SchlangenblockadeSpielen',
    spielerId: 'spieler-1',
    handkartenId: angriffId,
    zielSpielerId: 'spieler-2',
    zielSchlangenId: 'schlange-spieler-2-1',
  });
}

describe('Nachziehen nach einer Sonderkarte — R2.3a', () => {
  it('lässt den Angreifer nachziehen, wenn niemand reagieren kann', () => {
    const { zustand, angriff } = angriffsZustand({ zielHatSchutz: false });

    const nachher = spieleBlockade(zustand, angriff.id);

    expect(nachher.pendingReaktion).toBeNull();
    // Karte gespielt (1 → 0), sofort nachgezogen (0 → 1).
    expect(nachher.spieler[0].hand).toHaveLength(1);
    expect(nachher.spieler[0].hand[0].id).not.toBe(angriff.id);
  });

  it('zieht nicht mitten in der Kette, sondern erst nach Abhandlung aller Effekte', () => {
    const { zustand, angriff } = angriffsZustand({ zielHatSchutz: true });

    const nachAngriff = spieleBlockade(zustand, angriff.id);

    // Die Reaktion steht noch aus — hier darf noch niemand gezogen haben.
    expect(nachAngriff.pendingReaktion).not.toBeNull();
    expect(nachAngriff.spieler[0].hand).toHaveLength(0);
  });

  it('lässt nach einer Abwehr beide Beteiligten nachziehen', () => {
    const { zustand, angriff, farbenschutz } = angriffsZustand({ zielHatSchutz: true });

    const nachAngriff = spieleBlockade(zustand, angriff.id);
    const nachAbwehr = anwendeAktion(nachAngriff, {
      typ: 'SchlangenblockadeAbwehren',
      spielerId: 'spieler-2',
      abwehrHandkartenId: farbenschutz.id,
    });

    expect(nachAbwehr.pendingReaktion).toBeNull();
    expect(nachAbwehr.spieler[0].hand).toHaveLength(1);
    expect(nachAbwehr.spieler[1].hand).toHaveLength(1);
    expect(nachAbwehr.spieler[1].hand[0].id).not.toBe(farbenschutz.id);
  });

  /*
   * Wer durchlässt, hat keine Karte gespielt — die Quelle sagt „Alle Spieler,
   * die eine Karte gespielt haben, dürfen sofort eine neue Karte nachziehen".
   */
  it('lässt beim Durchlassen nur den Angreifer nachziehen', () => {
    const { zustand, angriff } = angriffsZustand({ zielHatSchutz: true });

    const nachAngriff = spieleBlockade(zustand, angriff.id);
    const nachDurchlassen = anwendeAktion(nachAngriff, {
      typ: 'SchlangenblockadeDurchlassen',
      spielerId: 'spieler-2',
    });

    expect(nachDurchlassen.pendingReaktion).toBeNull();
    expect(nachDurchlassen.spieler[0].hand).toHaveLength(1);
    // Der Verteidiger hat seinen Farbenschutz behalten, aber nichts gezogen.
    expect(nachDurchlassen.spieler[1].hand).toHaveLength(1);
  });

  /* „Nach Spielende wird noch eine Runde gespielt, ohne neue Karten zu ziehen." */
  it('zieht im Endspurt nicht nach', () => {
    const { zustand, angriff } = angriffsZustand({ zielHatSchutz: false });
    zustand.spielphase = 'Endspurt';
    zustand.endrunde = { ausloeserSpielerIndex: 0, verbleibendeSpielerIndizes: [1] };

    const nachher = spieleBlockade(zustand, angriff.id);

    expect(nachher.spieler[0].hand).toHaveLength(0);
  });

  it('kommt mit leerem Nachziehstapel ohne Fehler aus', () => {
    const { zustand, angriff } = angriffsZustand({ zielHatSchutz: false });
    zustand.nachziehstapel = [];

    const nachher = spieleBlockade(zustand, angriff.id);

    expect(nachher.spieler[0].hand).toHaveLength(0);
  });
});

/*
ÄNDERUNG [03.08.2026]: Nachgereicht nach dem Codex-Review. Beide Fälle betreffen
gespeicherte Spielstände und wären ohne den Review still falsch geblieben.
*/
describe('Gespeicherte Spielstände und R2.3a', () => {
  it('rettet den Nachzug des Angreifers aus einem Altstand mitten in der Kette', () => {
    const { zustand, angriff } = angriffsZustand({ zielHatSchutz: true });
    const nachAngriff = spieleBlockade(zustand, angriff.id);

    // Ein Stand aus der Zeit vor R2.3a kennt das Feld nicht.
    const alt = JSON.parse(serialisiere(nachAngriff));
    delete alt.nachziehBerechtigteIndizes;

    const geladen = deserialisiere(JSON.stringify(alt));

    // Aus `pendingReaktion` lässt sich der Angreifer rekonstruieren.
    expect(geladen.nachziehBerechtigteIndizes).toEqual([0]);
  });

  it('lehnt eine offene Nachziehliste ohne ausstehende Reaktion ab', () => {
    const { zustand } = angriffsZustand({ zielHatSchutz: false });
    const roh = JSON.parse(serialisiere(zustand));
    roh.nachziehBerechtigteIndizes = [0];

    expect(() => deserialisiere(JSON.stringify(roh))).toThrow(
      'nachziehBerechtigteIndizes ohne ausstehende Reaktion',
    );
  });
});
