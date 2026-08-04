/*
Author: Claude Code (Punkt 3)
Datum: 04.08.2026
Version: 1.0
Beschreibung: Auflösung der Farbenschutz-Reaktionskette (GAME_SPEC R7.1, R78).

ÄNDERUNG [04.08.2026]: Aus `turnState.ts` herausgelöst (Punkt 3). Rein
strukturell, kein Verhaltensunterschied.

Genau zwei Wege führen aus einer ausstehenden Reaktion heraus: abwehren oder
durchlassen. Beide standen bisher zwischen den Kartenwirkungen, obwohl sie eine
eigene Frage beantworten — nicht „was tut diese Karte", sondern „was wird aus
einem Angriff, der noch in der Schwebe hängt".
*/

import type { PendingSchlangenfrassAbwehr, SonderkarteInfo, Spielkarte, Spielzustand } from './types';
import {
  bereinigeFarbenfusionen,
  entferneFarbenschutzAusHand,
  holeReaktionsSpieler,
  istFarbenschutzkarte,
  loeseFarbenschutzAbwehr,
} from './zugHelfer';
import { fuehreFarbendiebAus, legeSchlangenblockadeAb } from './kartenwirkungen';

/* ÄNDERUNG [04.08.2026]: `aktualisiereSchlangenfrassPending` und ihr Helfer
   `entferneKarteAusSchlange` sind aus `zugHelfer.ts` hierher gewandert — aus dem
   Codex-Review (Gate 7) zum Split. Die Funktion beantwortet keine allgemeine
   Zug-Frage, sondern *die* dieser Datei: was aus einem Angriff wird, der noch in
   der Schwebe hängt. Sie hatte genau einen Aufrufer, und der stand hier.

   Beide sind dadurch modul-lokal: zwei Exporte weniger in `zugHelfer.ts`, keine
   neuen dazu. `bereinigeFarbenfusionen` bleibt dort exportiert — es wird jetzt von
   zwei Modulen gebraucht (hier und in `kartenwirkungen.ts`), also ist der Export
   belegt und nicht bloß geduldet. */
function entferneKarteAusSchlange(schlangeKarten: Spielkarte[], kartenId: string): Spielkarte[] {
  return schlangeKarten.filter((karte) => karte.id !== kartenId);
}

function aktualisiereSchlangenfrassPending(
  zustand: Spielzustand,
  pending: PendingSchlangenfrassAbwehr,
  ziel: { spielerIndex: number; schlangenId: string; kartenId: string },
  abwehrt: boolean,
  abwehrkarte?: SonderkarteInfo,
): Spielzustand {
  const verbleibendeZiele = pending.verbleibendeZiele.slice(1);
  const angegriffeneSchlange = zustand.spieler[ziel.spielerIndex].schlangen.find((schlange) => schlange.id === ziel.schlangenId);
  if (!angegriffeneSchlange) {
    throw new Error('Die ausgewählte Zielschlange ist ungültig.');
  }
  const angegriffeneKarte = angegriffeneSchlange.karten.find((karte) => karte.id === ziel.kartenId);
  if (!angegriffeneKarte) {
    throw new Error('Die ausgewählte Zielkarte ist ungültig.');
  }
  const neueSpieler = zustand.spieler.map((spieler, index) => {
    if (index !== ziel.spielerIndex) return spieler;
    const neueHand = abwehrt && abwehrkarte
      ? spieler.hand.filter((karte) => karte.id !== abwehrkarte.id)
      : spieler.hand;
    const neueSchlangen = abwehrt
      ? spieler.schlangen
      : spieler.schlangen.map((schlange) =>
          schlange.id === ziel.schlangenId
            ? bereinigeFarbenfusionen({ ...schlange, karten: entferneKarteAusSchlange(schlange.karten, ziel.kartenId) })
            : schlange,
        );
    return {
      ...spieler,
      hand: neueHand,
      schlangen: neueSchlangen,
      ausgespielteSonderkartenNamen:
        abwehrt && abwehrkarte
          ? [...spieler.ausgespielteSonderkartenNamen, abwehrkarte.name]
          : spieler.ausgespielteSonderkartenNamen,
    };
  });

  return {
    ...zustand,
    spieler: neueSpieler,
    ablagestapel: [
      ...zustand.ablagestapel,
      ...(abwehrt && abwehrkarte ? [abwehrkarte] : []),
      ...(!abwehrt && angegriffeneKarte ? [angegriffeneKarte] : []),
    ],
    pendingReaktion:
      verbleibendeZiele.length > 0
        ? {
            typ: 'SchlangenfrassAbwehr',
            angreifenderSpielerIndex: pending.angreifenderSpielerIndex,
            verbleibendeZiele,
          }
        : null,
  };
}

export function loesePendingReaktionAbwehr(zustand: Spielzustand, spielerId: string, abwehrKartenId: string): Spielzustand {
  if (zustand.pendingReaktion === null) {
    throw new Error('Keine ausstehende Reaktion zum Auflösen.');
  }

  const pending = zustand.pendingReaktion;
  if (pending.typ === 'SchlangengrubeAbwehr') {
    return loeseFarbenschutzAbwehr(
      zustand,
      spielerId,
      pending.zielSpielerIndex,
      abwehrKartenId,
      'Nur der Zielspieler darf die Reaktion auflösen.',
    );
  }

  if (pending.typ === 'SchlangenblockadeAbwehr') {
    return loeseFarbenschutzAbwehr(
      zustand,
      spielerId,
      pending.zielSpielerIndex,
      abwehrKartenId,
      'Nur der Zielspieler darf die Reaktion auflösen.',
    );
  }

  if (pending.typ === 'FarbendiebAbwehr') {
    return loeseFarbenschutzAbwehr(
      zustand,
      spielerId,
      pending.zielSpielerIndex,
      abwehrKartenId,
      'Nur der Zielspieler darf die Reaktion auflösen.',
    );
  }

  if (pending.typ === 'SchlangenfrassAbwehr') {
    const ziel = pending.verbleibendeZiele[0];
    if (!ziel) {
      throw new Error('Keine ausstehende Reaktion zum Auflösen.');
    }
    holeReaktionsSpieler(zustand, ziel.spielerIndex, spielerId, 'Nur der aktuelle Reaktionsspieler darf die Reaktion auflösen.');
    const abwehrkarte = zustand.spieler[ziel.spielerIndex].hand.find((k) => k.id === abwehrKartenId);
    if (!istFarbenschutzkarte(abwehrkarte)) {
      throw new Error('Farbenschutz-Abwehr ist nur mit einer Farbenschutzkarte des Zielspielers erlaubt.');
    }

    return aktualisiereSchlangenfrassPending(zustand, pending, ziel, true, abwehrkarte);
  }

  if (pending.typ !== 'VerdopplerAbwehr') {
    throw new Error('Keine ausstehende Reaktion zum Auflösen.');
  }

  const reaktionsSpielerIndex = pending.verbleibendeSpielerIndizes[0];
  if (reaktionsSpielerIndex === undefined) {
    throw new Error('Keine ausstehende Reaktion zum Auflösen.');
  }
  holeReaktionsSpieler(zustand, reaktionsSpielerIndex, spielerId, 'Nur der aktuelle Reaktionsspieler darf die Reaktion auflösen.');
  const { neueSpieler, abwehrkarte } = entferneFarbenschutzAusHand(zustand, reaktionsSpielerIndex, abwehrKartenId);

  return {
    ...zustand,
    spieler: neueSpieler,
    ablagestapel: [...zustand.ablagestapel, abwehrkarte],
    zugpflichten: { ...zustand.zugpflichten, verdopplerBonusAktiv: false },
    pendingReaktion: null,
  };
}

export function loesePendingReaktionDurchlassen(zustand: Spielzustand, spielerId: string): Spielzustand {
  if (zustand.pendingReaktion === null) {
    throw new Error('Keine ausstehende Reaktion zum Auflösen.');
  }

  const pending = zustand.pendingReaktion;
  if (pending.typ === 'SchlangengrubeAbwehr') {
    holeReaktionsSpieler(zustand, pending.zielSpielerIndex, spielerId, 'Nur der Zielspieler darf die Reaktion auflösen.');

    return {
      ...zustand,
      aussetzenSpielerIndizes: [...zustand.aussetzenSpielerIndizes, pending.zielSpielerIndex],
      pendingReaktion: null,
    };
  }

  if (pending.typ === 'SchlangenblockadeAbwehr') {
    holeReaktionsSpieler(zustand, pending.zielSpielerIndex, spielerId, 'Nur der Zielspieler darf die Reaktion auflösen.');

    /* Nur eine Existenzprobe: `legeSchlangenblockadeAb` baut die Karte aus der
       ID neu auf, statt die gefundene zu übernehmen. `find` hätte ausgesehen,
       als würde die gefundene Karte gelegt. */
    if (!zustand.ablagestapel.some((karte) => karte.id === pending.blockadeKartenId)) {
      throw new Error('Die ausgewählte Zielkarte ist ungültig.');
    }

    /* ÄNDERUNG [04.08.2026]: O-1 — an die **angesagte** Position, nicht ans Ende.
       Die Position stammt aus der ausstehenden Reaktion und wurde beim Ausspielen
       festgelegt; siehe `PendingSchlangenblockadeAbwehr`. */
    return {
      ...legeSchlangenblockadeAb(zustand, {
        kartenId: pending.blockadeKartenId,
        zielSpielerIndex: pending.zielSpielerIndex,
        zielSchlangenId: pending.zielSchlangenId,
        einfügeIndex: pending.einfügeIndex,
      }),
      pendingReaktion: null,
    };
  }

  if (pending.typ === 'FarbendiebAbwehr') {
    holeReaktionsSpieler(zustand, pending.zielSpielerIndex, spielerId, 'Nur der Zielspieler darf die Reaktion auflösen.');

    return fuehreFarbendiebAus(zustand, pending);
  }

  if (pending.typ === 'SchlangenfrassAbwehr') {
    const ziel = pending.verbleibendeZiele[0];
    if (!ziel) {
      throw new Error('Keine ausstehende Reaktion zum Auflösen.');
    }
    holeReaktionsSpieler(zustand, ziel.spielerIndex, spielerId, 'Nur der aktuelle Reaktionsspieler darf die Reaktion auflösen.');

    return aktualisiereSchlangenfrassPending(zustand, pending, ziel, false);
  }

  if (pending.typ !== 'VerdopplerAbwehr') {
    throw new Error('Keine ausstehende Reaktion zum Auflösen.');
  }

  const reaktionsSpielerIndex = pending.verbleibendeSpielerIndizes[0];
  if (reaktionsSpielerIndex === undefined) {
    throw new Error('Keine ausstehende Reaktion zum Auflösen.');
  }
  holeReaktionsSpieler(zustand, reaktionsSpielerIndex, spielerId, 'Nur der aktuelle Reaktionsspieler darf die Reaktion auflösen.');

  const verbleibendeSpielerIndizes = pending.verbleibendeSpielerIndizes.slice(1);
  if (verbleibendeSpielerIndizes.length === 0) {
    return {
      ...zustand,
      zugpflichten: { ...zustand.zugpflichten, verdopplerBonusAktiv: true },
      pendingReaktion: null,
    };
  }

  return {
    ...zustand,
    pendingReaktion: {
      typ: 'VerdopplerAbwehr',
      angreifenderSpielerIndex: pending.angreifenderSpielerIndex,
      verbleibendeSpielerIndizes,
    },
  };
}
