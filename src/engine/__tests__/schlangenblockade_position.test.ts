/*
Author: Claude Code (O-1)
Datum: 04.08.2026
Version: 1.0
Beschreibung: Akzeptanztests für O-1 — die Schlangenblockade darf an jeder
              beliebigen Stelle liegen, auch in der eigenen Schlange.

Grundlage ist der Signoff vom 03.08.2026 (wörtlich in `docs/GAME_SPEC.md` R7.1a).
Bis dahin hängte die Engine die Karte ans **Ende** der Zielschlange, und R3.5a
hielt ausdrücklich fest, dass sie deshalb keine Farbgruppe zerreißt. Genau das
gilt ab jetzt nicht mehr.

Die Gegenprobe zu dieser Regeländerung ist der erste Test: Eine Blockade
zwischen zwei Karten einer Dreiergruppe zerreißt sie, und die Punkte fallen. Die
erwarteten Punktzahlen sind **einzeln nachgerechnet**, nicht aus dem Istwert
übernommen — bei drei roten Karten (1 Punkt je Karte) zählt die Gruppe nach R3.3
drei Punkte; zerteilt in 1 + 2 Karten zählt sie null, weil Einzelkarten und
Zweierkombinationen nach R8 nichts wert sind.
*/

import { describe, expect, it } from 'vitest';
import {
  anwendeAktion,
  pruefeAktion,
  berechneFarbgruppenPunkte,
  deserialisiere,
  ermittleLegaleAktionen,
  erstelleSpielzustand,
  serialisiere,
  spieleSchlangenblockade,
} from '../index';
import type { SchlangenblockadeSpielenAktion, Spielzustand } from '../index';
import { nimmSonderkarte, nimmVomStapel, schlange, schlangeMitFarben } from './testHelpers';

function zustandMitSchlangenblockade(): Spielzustand {
  const zustand = erstelleSpielzustand(2, () => 0.999999);
  zustand.spielphase = 'Normal';
  zustand.zugphase = 'Ausspielphase';
  zustand.spieler[0].hand = [nimmSonderkarte(zustand, 'Schlangenblockade'), ...zustand.spieler[0].hand];
  return zustand;
}

/** Nimmt dem Zielspieler jeden Farbenschutz — sonst geht der Angriff in die Reaktionskette. */
function ohneFarbenschutz(zustand: Spielzustand, spielerIndex: number): void {
  zustand.spieler[spielerIndex].hand = zustand.spieler[spielerIndex].hand.filter(
    (karte) => !(karte.typ === 'Sonderkarte' && karte.name === 'Farbenschutz'),
  );
}

/**
 * Gibt dem Zielspieler genau eine Farbenschutzkarte — und nimmt sie dabei vom
 * Nachziehstapel.
 *
 * Das Wegnehmen ist nicht Kosmetik: Ein erster Entwurf ließ die Karte auf dem
 * Stapel liegen, und `serialisiere` lehnte den Zustand mit „Doppelte ID
 * farbenschutz-01" ab. Dieselbe Falle wie am 03.08.2026 bei R2.3a — die
 * Materialprüfung der Persistenz ist strenger als die Spiellogik und findet
 * Vorrichtungen, die die Engine klaglos verarbeitet.
 */
function mitFarbenschutz(zustand: Spielzustand, spielerIndex: number): void {
  /* Voranstellen, nicht ersetzen: Die ausgeteilten Handkarten wegzuwerfen macht
     das Kartenmaterial unvollständig. Siehe den Block über `nimmVomStapel`. */
  zustand.spieler[spielerIndex].hand = [
    nimmSonderkarte(zustand, 'Farbenschutz'),
    ...zustand.spieler[spielerIndex].hand,
  ];
}

/** Zielschlange aus **echten** Deckkarten — `schlangeMitFarben` erfindet IDs. */
function schlangeAusDeck(zustand: Spielzustand, id: string, anzahl: number): void {
  zustand.spieler[1].schlangen = [
    schlange(nimmVomStapel(zustand, (karte) => karte.typ === 'Farbkarte', anzahl), id),
  ];
}

describe('O-1 Schlangenblockade an freier Position', () => {
  /* Der Kern des Signoffs. Vor O-1 war diese Zusicherung das genaue Gegenteil:
     „hängt hinten an und zerreißt damit keine bestehende Farbgruppe". */
  it('zerreißt eine Dreiergruppe, wenn sie mittendrin landet — und die Punkte fallen', () => {
    const zustand = zustandMitSchlangenblockade();
    ohneFarbenschutz(zustand, 1);
    zustand.spieler[1].schlangen = [schlangeMitFarben('schlange-spieler-2-1', ['Rot', 'Rot', 'Rot'])];
    const blockade = zustand.spieler[0].hand[0];

    // Nachgerechnet: drei rote Karten à 1 Punkt sind nach R3.3 eine Dreiergruppe.
    expect(berechneFarbgruppenPunkte(zustand.spieler[1].schlangen[0]).gesamtPunkte).toBe(3);

    const aktualisiert = spieleSchlangenblockade(zustand, {
      kartenId: blockade.id,
      zielSpielerIndex: 1,
      zielSchlangenId: 'schlange-spieler-2-1',
      einfügeIndex: 1,
    });

    const ziel = aktualisiert.spieler[1].schlangen[0];
    expect(ziel.karten).toHaveLength(4);
    expect(ziel.karten[1].id).toBe(blockade.id);
    // Nachgerechnet: 1 Karte links, 2 rechts — beides unter der Dreiergrenze, also null.
    expect(berechneFarbgruppenPunkte(ziel).gesamtPunkte).toBe(0);
  });

  /* Der Signoff nennt die eigene Schlange ausdrücklich als zulässiges Ziel
     („was aber natürlich nicht so viel Sinn macht"). Keine Abwehr: Man wehrt
     sich nicht gegen sich selbst — dieselbe Auslegung wie beim Schlangenfrass
     in R7.1 („eigene Ziele werden immer sofort entfernt, keine Selbst-Reaktion"). */
  it('darf in die eigene Schlange gelegt werden und löst dort keine Abwehr aus', () => {
    const zustand = zustandMitSchlangenblockade();
    zustand.spieler[0].schlangen = [schlangeMitFarben('schlange-spieler-1-1', ['Blau', 'Blau', 'Blau'])];
    const blockade = zustand.spieler[0].hand[0];

    const aktualisiert = spieleSchlangenblockade(zustand, {
      kartenId: blockade.id,
      zielSpielerIndex: 0,
      zielSchlangenId: 'schlange-spieler-1-1',
      einfügeIndex: 2,
    });

    expect(aktualisiert.pendingReaktion).toBeNull();
    expect(aktualisiert.spieler[0].schlangen[0].karten[2].id).toBe(blockade.id);
  });

  it('weist eine Position außerhalb der Schlange zurück', () => {
    const zustand = zustandMitSchlangenblockade();
    ohneFarbenschutz(zustand, 1);
    zustand.spieler[1].schlangen = [schlangeMitFarben('schlange-spieler-2-1', ['Rot', 'Rot'])];
    const blockade = zustand.spieler[0].hand[0];

    for (const index of [-1, 3]) {
      expect(() =>
        spieleSchlangenblockade(zustand, {
          kartenId: blockade.id,
          zielSpielerIndex: 1,
          zielSchlangenId: 'schlange-spieler-2-1',
          einfügeIndex: index,
        }),
      ).toThrow('Einfügeposition');
    }
  });
});

/**
 * Eine angesagte Blockade auf Position 1 einer dreikartigen Zielschlange, die in
 * der Reaktionskette hängt.
 *
 * Fünf Tests bauten diesen Vorlauf zeichengleich nach. Echte Deckkarten, weil
 * mehrere davon serialisieren.
 */
function angesagteBlockade(): { zustand: Spielzustand; blockadeId: string } {
  const zustand = zustandMitSchlangenblockade();
  mitFarbenschutz(zustand, 1);
  schlangeAusDeck(zustand, 'schlange-spieler-2-1', 3);
  const blockade = zustand.spieler[0].hand[0];
  return {
    zustand: spieleSchlangenblockade(zustand, {
      kartenId: blockade.id,
      zielSpielerIndex: 1,
      zielSchlangenId: 'schlange-spieler-2-1',
      einfügeIndex: 1,
    }),
    blockadeId: blockade.id,
  };
}

describe('O-1 Die Position wird bei der Ansage festgelegt', () => {
  /* Der letzte Satz des Signoffs: Wird abgewehrt, sind beide Karten ausgespielt,
     und der Angreifer darf sich nicht mehr umentscheiden. Das gilt für das Ziel
     (R7.1, bereits umgesetzt) — und damit auch für die Position. Läge sie erst
     nach der Abwehr fest, könnte der Angreifer sie in Kenntnis der gegnerischen
     Entscheidung noch verschieben. */
  it('führt die Position in der ausstehenden Abwehr mit', () => {
    const { zustand } = angesagteBlockade();

    expect(zustand.pendingReaktion).toMatchObject({
      typ: 'SchlangenblockadeAbwehr',
      zielSpielerIndex: 1,
      zielSchlangenId: 'schlange-spieler-2-1',
      einfügeIndex: 1,
    });
  });

  it('legt die Karte nach dem Durchlassen an genau diese Position', () => {
    const { zustand: angesagt, blockadeId } = angesagteBlockade();

    const durchgelassen = anwendeAktion(angesagt, {
      typ: 'SchlangenblockadeDurchlassen',
      spielerId: angesagt.spieler[1].id,
    });

    expect(durchgelassen.spieler[1].schlangen[0].karten[1].id).toBe(blockadeId);
  });

  it('überlebt Serialisierung mitten in der Reaktionskette', () => {
    const { zustand: angesagt } = angesagteBlockade();

    const roundtrip = deserialisiere(serialisiere(angesagt));
    expect(roundtrip.pendingReaktion).toMatchObject({ einfügeIndex: 1 });
  });
});

describe('O-1 Aufzählung der legalen Aktionen', () => {
  it('bietet jede Position in jeder Schlange an, auch in der eigenen', () => {
    const zustand = zustandMitSchlangenblockade();
    ohneFarbenschutz(zustand, 1);
    zustand.spieler[0].schlangen = [schlangeMitFarben('eigen-1', ['Blau', 'Blau'])];
    zustand.spieler[1].schlangen = [schlangeMitFarben('fremd-1', ['Rot', 'Rot', 'Rot'])];

    const blockaden = ermittleLegaleAktionen(zustand).filter(
      (aktion): aktion is SchlangenblockadeSpielenAktion => aktion.typ === 'SchlangenblockadeSpielen',
    );

    // Nachgerechnet: eigene Schlange 2 Karten → 3 Positionen, fremde 3 Karten → 4.
    expect(blockaden.filter((a) => a.zielSchlangenId === 'eigen-1').map((a) => a.einfügeIndex).sort()).toEqual([
      0, 1, 2,
    ]);
    expect(blockaden.filter((a) => a.zielSchlangenId === 'fremd-1').map((a) => a.einfügeIndex).sort()).toEqual([
      0, 1, 2, 3,
    ]);
  });
});

/*
ÄNDERUNG [04.08.2026]: O-1 — Altstände mitten in einer Blockade-Reaktionskette.

`PendingSchlangenblockadeAbwehr` führt die Position seit heute mit. Ein
Spielstand aus der Zeit davor kennt das Feld nicht. Warum sich die Position exakt
rekonstruieren lässt, steht bei `migriereSchlangenblockadePositionVorO1` in
`src/engine/serialization.ts`.
*/
describe('O-1 Gespeicherte Spielstände', () => {
  it('setzt die Position eines Altstands auf das Ende der Zielschlange', () => {
    const { zustand: angesagt } = angesagteBlockade();

    // Ein Stand aus der Zeit vor O-1 kennt das Feld nicht.
    const alt = JSON.parse(serialisiere(angesagt));
    delete alt.pendingReaktion.einfügeIndex;

    const geladen = deserialisiere(JSON.stringify(alt));

    /* Nachgerechnet: Die Zielschlange hat drei Karten, die Blockade liegt noch
       im Ablagestapel. Das Ende ist damit Index 3 — und genau dort hätte die
       Engine vor O-1 eingefügt. Nicht 1: Die ursprüngliche Ansage ist in einem
       Altstand nicht überliefert und wird auch nicht erfunden. */
    expect(geladen.pendingReaktion).toMatchObject({ einfügeIndex: 3 });
  });

  it('lehnt eine Position außerhalb der Zielschlange ab', () => {
    const { zustand: angesagt } = angesagteBlockade();

    const roh = JSON.parse(serialisiere(angesagt));
    roh.pendingReaktion.einfügeIndex = 99;

    /* Ohne diese Prüfung fügte `Array.prototype.slice` still am Ende ein, statt
       zu werfen — ein manipulierter Stand landete dann einfach woanders. */
    expect(() => deserialisiere(JSON.stringify(roh))).toThrow('pendingReaktion.einfügeIndex ist ungültig');
  });
});

/*
ÄNDERUNG [04.08.2026]: O-1 — die dritte Stelle, die dieselbe Regel kennt.

`hatLegaleSchlangenblockadeAktionen` in `legalActions.ts` ist eine zweite,
handgepflegte Fassung der Legalitätsprüfung. O-1 musste dieselbe Regeländerung an
**drei** Stellen tragen: `pruefeAktion`, den Enumerator und diese Vorprüfung.

**Wo sie wirkt, ist nicht offensichtlich** — der erste Entwurf dieses Tests hat
daneben gegriffen: Er prüfte, ob `ermittleLegaleAktionen` einen Pflichtabwurf
anbietet, und blieb auch mit der alten Vorprüfung grün. Der Enumerator kommt dort
nämlich gar nicht hin: Er bietet den Abwurf nur an, wenn die Aktionsliste **leer**
ist (`legalActions.ts`, `aktionen.length === 0`), und die Blockade-Aktionen stehen
längst darin.

Die Vorprüfung wirkt allein in `pruefeAktion`: Sie entscheidet, ob ein
*vorgelegter* Pflichtabwurf zulässig ist. Mit der alten Fassung („nur fremde
Schlangen zählen") hätte sie einen Abwurf durchgewinkt, obwohl der Spieler noch
legal auf die eigene Schlange blockieren kann — R20 verlangt das Gegenteil.
Gefunden im Altitude-Review (Gate 7); vor O-1 gab es den Fall nicht.
*/
describe('O-1 Pflichtabwurf', () => {
  it('lehnt einen Abwurf ab, solange die eigene Schlange noch ein Ziel ist', () => {
    const zustand = zustandMitSchlangenblockade();
    // Nur die Blockade auf der Hand, und nur der aktive Spieler hat eine Schlange.
    const blockade = zustand.spieler[0].hand[0];
    zustand.spieler[0].hand = [blockade];
    zustand.spieler[0].schlangen = [schlangeMitFarben('schlange-spieler-1-1', ['Blau', 'Blau'])];
    zustand.spieler[1].schlangen = [];

    // Drei Lücken in der eigenen Zweierschlange sind spielbar …
    expect(
      ermittleLegaleAktionen(zustand).filter((a) => a.typ === 'SchlangenblockadeSpielen'),
    ).toHaveLength(3);

    // … deshalb darf der Pflichtabwurf nicht durchgehen.
    expect(
      pruefeAktion(zustand, {
        typ: 'PflichtAbwurf',
        spielerId: zustand.spieler[0].id,
        handkartenId: blockade.id,
      }),
    ).toEqual({
      erlaubt: false,
      grund: 'Pflicht-Abwurf ist nur erlaubt, wenn keine spielbare Karte verfügbar ist.',
    });
  });
});
