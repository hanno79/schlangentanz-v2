/*
Author: Claude Code (Punkt 3)
Datum: 04.08.2026
Version: 1.0
Beschreibung: Die acht Sonderkartenwirkungen (GAME_SPEC R7.1) plus die beiden
              Hilfen, die eine angesagte Wirkung später ausführen.

ÄNDERUNG [04.08.2026]: Aus `turnState.ts` herausgelöst (Punkt 3). Rein
strukturell, kein Verhaltensunterschied.

Jede `spiele*`-Funktion ist eine Kartenwirkung und sonst nichts: Sie prüft ihre
Vorbedingungen, nimmt die Karte aus der Hand und liefert entweder den fertigen
Zustand oder eine ausstehende Reaktion. Was mit einer ausstehenden Reaktion
weiter geschieht, steht in `reaktionsaufloesung.ts`.

`legeSchlangenblockadeAb` und `fuehreFarbendiebAus` stehen hier und nicht dort:
Sie führen die **Wirkung** aus. Dass sie zusätzlich vom Auflösen der Kette
gerufen werden, ändert nichts daran, wem sie gehören — und die Richtung
Auflösung → Wirkung ist die einzige, die keinen Zyklus erzeugt.
*/

import { istGueltigeEinfuegePosition } from './constants';
import type { Spielkarte, SonderkarteInfo, Spielzustand, PendingFarbendiebAbwehr } from './types';
import {
  aktualisiereAktivenSpieler,
  entferneSchlangenfrassAusSchlangen,
  ermittleNaechsteSpielerReihenfolge,
  fuegeKarteInSchlangeEin,
  inkrementiereSpieleKarten,
  istFarbenfusionkarte,
  istGueltigeId,
  istSchlangenhaeutungkarte,
  loestFarbenschutzReaktionAus,
  pruefeKeineAusstehendeReaktion,
  pruefeSpielkartenLimit,
  sortiereSchlangenfrassZiele,
  zaehleNeueDreiergruppen,
} from './zugHelfer';

export function spieleSchlangengrube(
  zustand: Spielzustand,
  optionen: { kartenId?: string; zielSpielerIndex?: number } | null = {},
): Spielzustand {
  if (zustand.zugphase !== 'Ausspielphase') {
    throw new Error('Schlangengrube kann nur in der Ausspielphase gespielt werden.');
  }
  pruefeKeineAusstehendeReaktion(zustand);

  const { kartenId, zielSpielerIndex } = optionen ?? {};
  if (!istGueltigeId(kartenId)) {
    throw new Error('Es muss genau eine Handkarte zum Spielen gewählt werden.');
  }
  if (typeof zielSpielerIndex !== 'number' || !Number.isInteger(zielSpielerIndex)) {
    throw new Error('Für Schlangengrube muss ein Zielspieler gewählt werden.');
  }

  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  const karte = aktiverSpieler.hand.find((k) => k.id === kartenId);
  if (!karte) {
    throw new Error('Die Karte befindet sich nicht auf der Hand des aktiven Spielers.');
  }
  if (karte.typ !== 'Sonderkarte' || karte.name !== 'Schlangengrube') {
    throw new Error('Schlangengrube kann nur mit der Schlangengrube-Sonderkarte gespielt werden.');
  }
  if (zielSpielerIndex < 0 || zielSpielerIndex >= zustand.spieler.length) {
    throw new Error('Der ausgewählte Zielspieler ist ungültig.');
  }
  if (zielSpielerIndex === zustand.aktiverSpielerIndex) {
    throw new Error('Der aktive Spieler kann sich nicht selbst aussetzen.');
  }
  if (zustand.spielphase === 'Endspurt' && !zustand.endrunde.verbleibendeSpielerIndizes.includes(zielSpielerIndex)) {
    throw new Error('Der gewählte Zielspieler hat in der Endrunde keinen verbleibenden Zug mehr.');
  }

  pruefeSpielkartenLimit(zustand, karte.typ);

  const neueHand = aktiverSpieler.hand.filter((k) => k.id !== kartenId);
  const neueSpieler = aktualisiereAktivenSpieler(zustand, { hand: neueHand });
  const zustandNachAngriff = inkrementiereSpieleKarten(
    {
      ...zustand,
      spieler: neueSpieler,
      ablagestapel: [...zustand.ablagestapel, karte],
    },
    neueSpieler,
    karte.typ,
    karte.name,
  );

  // R78: Wenn Zielspieler Farbenschutz hat, bekommt er eine explizite Reaktionsentscheidung.
  const hatFarbenschutz = loestFarbenschutzReaktionAus(zustand, zielSpielerIndex);
  if (hatFarbenschutz) {
    return {
      ...zustandNachAngriff,
      pendingReaktion: {
        typ: 'SchlangengrubeAbwehr',
        angreifenderSpielerIndex: zustand.aktiverSpielerIndex,
        zielSpielerIndex,
      },
    };
  }

  return {
    ...zustandNachAngriff,
    aussetzenSpielerIndizes: [...zustand.aussetzenSpielerIndizes, zielSpielerIndex],
  };
}

export function spieleSchlangenblockade(
  zustand: Spielzustand,
  optionen: {
    kartenId?: string;
    zielSpielerIndex?: number;
    zielSchlangenId?: string;
    einfügeIndex?: number;
  } | null = {},
): Spielzustand {
  if (zustand.zugphase !== 'Ausspielphase') {
    throw new Error('Schlangenblockade kann nur in der Ausspielphase gespielt werden.');
  }
  pruefeKeineAusstehendeReaktion(zustand);

  const { kartenId, zielSpielerIndex, zielSchlangenId, einfügeIndex } = optionen ?? {};
  if (!istGueltigeId(kartenId)) {
    throw new Error('Es muss genau eine Handkarte zum Spielen gewählt werden.');
  }
  if (typeof zielSpielerIndex !== 'number' || !Number.isInteger(zielSpielerIndex)) {
    throw new Error('Für Schlangenblockade muss ein Zielspieler gewählt werden.');
  }
  if (!istGueltigeId(zielSchlangenId)) {
    throw new Error('Für Schlangenblockade muss eine Zielschlange gewählt werden.');
  }
  if (typeof einfügeIndex !== 'number' || !Number.isInteger(einfügeIndex)) {
    throw new Error('Für Schlangenblockade muss eine Einfügeposition gewählt werden.');
  }

  /* ÄNDERUNG [04.08.2026]: O-1 — die eigene Schlange ist zulässig.
     Hier stand bis 03.08.2026 ein Wurf („nur auf die Schlange eines anderen
     Spielers"). Der Signoff hebt ihn auf; die Begründung steht in GAME_SPEC
     R7.1a. */

  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  const karte = aktiverSpieler.hand.find((k) => k.id === kartenId);
  if (!karte) {
    throw new Error('Die Karte befindet sich nicht auf der Hand des aktiven Spielers.');
  }
  if (karte.typ !== 'Sonderkarte' || karte.name !== 'Schlangenblockade') {
    throw new Error('Schlangenblockade kann nur mit der Schlangenblockade-Sonderkarte gespielt werden.');
  }
  if (zielSpielerIndex < 0 || zielSpielerIndex >= zustand.spieler.length) {
    throw new Error('Der ausgewählte Zielspieler ist ungültig.');
  }
  const zielSpieler = zustand.spieler[zielSpielerIndex];
  const zielSchlange = zielSpieler.schlangen.find((s) => s.id === zielSchlangenId);
  if (!zielSchlange) {
    throw new Error('Die ausgewählte Zielschlange ist ungültig.');
  }
  /* Als Lücke gezählt, wie beim Farbendieb: `0` ganz vorn, `karten.length` ganz
     hinten — letzteres ist das Verhalten von vor O-1. */
  if (!istGueltigeEinfuegePosition(einfügeIndex, zielSchlange.karten.length)) {
    throw new Error('Die gewählte Einfügeposition ist ungültig.');
  }

  pruefeSpielkartenLimit(zustand, karte.typ);

  const neueHand = aktiverSpieler.hand.filter((k) => k.id !== kartenId);
  const neueSpieler = aktualisiereAktivenSpieler(zustand, { hand: neueHand });
  const zustandNachAngriff = inkrementiereSpieleKarten(
    {
      ...zustand,
      spieler: neueSpieler,
      ablagestapel: [...zustand.ablagestapel, karte],
    },
    neueSpieler,
    karte.typ,
    karte.name,
  );

  /* ÄNDERUNG [04.08.2026]: O-1 — gegen sich selbst wehrt man sich nicht.
     Die eigene Schlange ist seit dem Signoff ein zulässiges Ziel, und der
     Angreifer hält womöglich selbst eine Farbenschutzkarte. Ohne diese
     Einschränkung eröffnete er eine Reaktionskette gegen sich und müsste seine
     eigene Blockade abwehren. Beide Bedingungen stehen in
     `loestFarbenschutzReaktionAus`. */
  const hatFarbenschutz = loestFarbenschutzReaktionAus(zustand, zielSpielerIndex);
  if (hatFarbenschutz) {
    return {
      ...zustandNachAngriff,
      pendingReaktion: {
        typ: 'SchlangenblockadeAbwehr',
        angreifenderSpielerIndex: zustand.aktiverSpielerIndex,
        zielSpielerIndex,
        zielSchlangenId,
        blockadeKartenId: karte.id,
        einfügeIndex,
      },
    };
  }

  return legeSchlangenblockadeAb(zustandNachAngriff, {
    kartenId: karte.id,
    zielSpielerIndex,
    zielSchlangenId,
    einfügeIndex,
  });
}

/**
 * Legt die Blockadekarte an ihre Position und nimmt sie vom Ablagestapel.
 *
 * ÄNDERUNG [04.08.2026]: O-1 — herausgezogen, weil es diese Stelle jetzt
 * zweimal gibt: einmal beim sofortigen Ausspielen (kein Farbenschutz oder
 * eigenes Ziel) und einmal beim Auflösen einer durchgelassenen Abwehr. Vor O-1
 * hängten beide nur hinten an; mit einer freien Position wäre eine der beiden
 * Kopien früher oder später an der anderen vorbeigelaufen.
 */
export function legeSchlangenblockadeAb(
  zustand: Spielzustand,
  ziel: { kartenId: string; zielSpielerIndex: number; zielSchlangenId: string; einfügeIndex: number },
): Spielzustand {
  const blockadeKarte: SonderkarteInfo = {
    typ: 'Sonderkarte',
    id: ziel.kartenId,
    name: 'Schlangenblockade',
  };
  return {
    ...zustand,
    ablagestapel: zustand.ablagestapel.filter((abwerfKarte) => abwerfKarte.id !== ziel.kartenId),
    spieler: zustand.spieler.map((spieler, index) =>
      index === ziel.zielSpielerIndex
        ? {
            ...spieler,
            schlangen: spieler.schlangen.map((schlange) =>
              schlange.id === ziel.zielSchlangenId
                ? { ...schlange, karten: fuegeKarteInSchlangeEin(schlange.karten, blockadeKarte, ziel.einfügeIndex) }
                : schlange,
            ),
          }
        : spieler,
    ),
  };
}

export function spieleFarbendieb(
  zustand: Spielzustand,
  optionen: {
    kartenId?: string;
    zielSpielerIndex?: number;
    zielSchlangenId?: string;
    zielKartenId?: string;
    eigeneSchlangenId?: string;
    einfügeIndex?: number;
  } | null = {},
): Spielzustand {
  if (zustand.zugphase !== 'Ausspielphase') {
    throw new Error('Farbendieb kann nur in der Ausspielphase gespielt werden.');
  }
  pruefeKeineAusstehendeReaktion(zustand);

  const { kartenId, zielSpielerIndex, zielSchlangenId, zielKartenId, eigeneSchlangenId, einfügeIndex } =
    optionen ?? {};
  if (!istGueltigeId(kartenId)) {
    throw new Error('Es muss genau eine Handkarte zum Spielen gewählt werden.');
  }
  if (typeof zielSpielerIndex !== 'number' || !Number.isInteger(zielSpielerIndex)) {
    throw new Error('Für Farbendieb muss ein Zielspieler gewählt werden.');
  }
  if (!istGueltigeId(zielSchlangenId)) {
    throw new Error('Für Farbendieb muss eine Zielschlange gewählt werden.');
  }
  if (!istGueltigeId(zielKartenId)) {
    throw new Error('Für Farbendieb muss eine Zielkarte gewählt werden.');
  }
  if (!istGueltigeId(eigeneSchlangenId)) {
    throw new Error('Für Farbendieb muss eine eigene Schlange gewählt werden.');
  }
  if (typeof einfügeIndex !== 'number' || !Number.isInteger(einfügeIndex)) {
    throw new Error('Für Farbendieb muss eine Einfügeposition gewählt werden.');
  }

  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  const karte = aktiverSpieler.hand.find((k) => k.id === kartenId);
  if (!karte) {
    throw new Error('Die Karte befindet sich nicht auf der Hand des aktiven Spielers.');
  }
  if (karte.typ !== 'Sonderkarte' || karte.name !== 'Farbendieb') {
    throw new Error('Farbendieb kann nur mit der Farbendieb-Sonderkarte gespielt werden.');
  }
  if (zielSpielerIndex < 0 || zielSpielerIndex >= zustand.spieler.length) {
    throw new Error('Der ausgewählte Zielspieler ist ungültig.');
  }
  if (zielSpielerIndex === zustand.aktiverSpielerIndex) {
    throw new Error('Farbendieb kann nur gegen eine Schlange eines anderen Spielers gespielt werden.');
  }

  const zielSpieler = zustand.spieler[zielSpielerIndex];
  const zielSchlange = zielSpieler.schlangen.find((s) => s.id === zielSchlangenId);
  if (!zielSchlange) {
    throw new Error('Die ausgewählte Zielschlange ist ungültig.');
  }
  const zielKarte = zielSchlange.karten.find((eintrag) => eintrag.id === zielKartenId);
  if (!zielKarte) {
    throw new Error('Die ausgewählte Zielkarte ist ungültig.');
  }
  // ÄNDERUNG [05.07.2026]: K1 — Farbendieb darf nur Farbkarten stehlen. Gestohlene Sonderkarten
  // (insb. fusionierte Farbenfusion-Karten) erzeugten sonst einen Wertungs-Crash.
  if (zielKarte.typ !== 'Farbkarte') {
    throw new Error('Farbendieb kann nur eine Farbkarte stehlen.');
  }
  const eigeneSchlange = aktiverSpieler.schlangen.find((s) => s.id === eigeneSchlangenId);
  if (!eigeneSchlange) {
    throw new Error('Die ausgewählte eigene Schlange ist ungültig.');
  }
  if (einfügeIndex < 0 || einfügeIndex > eigeneSchlange.karten.length) {
    throw new Error('Die gewählte Einfügeposition ist ungültig.');
  }

  pruefeSpielkartenLimit(zustand, karte.typ);

  const neueHand = aktiverSpieler.hand.filter((k) => k.id !== kartenId);
  const neueSpieler = zustand.spieler.map((spieler, index) => {
    if (index === zustand.aktiverSpielerIndex) {
      return {
        ...spieler,
        hand: neueHand,
      };
    }
    return spieler;
  });

  const zustandNachAngriff = inkrementiereSpieleKarten(
    {
      ...zustand,
      spieler: neueSpieler,
      ablagestapel: [...zustand.ablagestapel, karte],
    },
    neueSpieler,
    karte.typ,
    karte.name,
  );

  const hatFarbenschutz = loestFarbenschutzReaktionAus(zustand, zielSpielerIndex);
  if (hatFarbenschutz) {
    return {
      ...zustandNachAngriff,
      pendingReaktion: {
        typ: 'FarbendiebAbwehr',
        angreifenderSpielerIndex: zustand.aktiverSpielerIndex,
        zielSpielerIndex,
        zielSchlangenId,
        zielKartenId,
        eigeneSchlangenId,
        einfügeIndex,
      },
    };
  }

  return fuehreFarbendiebAus(zustandNachAngriff, {
    typ: 'FarbendiebAbwehr',
    angreifenderSpielerIndex: zustand.aktiverSpielerIndex,
    zielSpielerIndex,
    zielSchlangenId,
    zielKartenId,
    eigeneSchlangenId,
    einfügeIndex,
  });
}

export function fuehreFarbendiebAus(zustand: Spielzustand, pending: PendingFarbendiebAbwehr): Spielzustand {
  const zielSpieler = zustand.spieler[pending.zielSpielerIndex];
  const zielSchlange = zielSpieler.schlangen.find((schlange) => schlange.id === pending.zielSchlangenId);
  if (!zielSchlange) {
    throw new Error('Die ausgewählte Zielschlange ist ungültig.');
  }
  const zielKarte = zielSchlange.karten.find((karte) => karte.id === pending.zielKartenId);
  if (!zielKarte) {
    throw new Error('Die ausgewählte Zielkarte ist ungültig.');
  }
  const eigeneSpieler = zustand.spieler[pending.angreifenderSpielerIndex];
  if (!eigeneSpieler.schlangen.some((schlange) => schlange.id === pending.eigeneSchlangenId)) {
    throw new Error('Die ausgewählte eigene Schlange ist ungültig.');
  }

  return {
    ...zustand,
    spieler: zustand.spieler.map((spieler, index) => {
      if (index === pending.zielSpielerIndex) {
        return {
          ...spieler,
          schlangen: spieler.schlangen.map((schlange) =>
            schlange.id === pending.zielSchlangenId
              ? { ...schlange, karten: schlange.karten.filter((karte) => karte.id !== pending.zielKartenId) }
              : schlange,
          ),
        };
      }
      if (index === pending.angreifenderSpielerIndex) {
        return {
          ...spieler,
          schlangen: spieler.schlangen.map((schlange) =>
            schlange.id === pending.eigeneSchlangenId
              ? { ...schlange, karten: fuegeKarteInSchlangeEin(schlange.karten, zielKarte, pending.einfügeIndex) }
              : schlange,
          ),
        };
      }
      return spieler;
    }),
    pendingReaktion: null,
  };
}

export function spieleFarbenfusion(
  zustand: Spielzustand,
  optionen: { kartenId?: string; zielSchlangenId?: string; zielKartenId?: string } | null = {},
): Spielzustand {
  if (zustand.zugphase !== 'Ausspielphase') {
    throw new Error('Farbenfusion kann nur in der Ausspielphase gespielt werden.');
  }
  pruefeKeineAusstehendeReaktion(zustand);

  const { kartenId, zielSchlangenId, zielKartenId } = optionen ?? {};
  if (!istGueltigeId(kartenId)) {
    throw new Error('Es muss genau eine Handkarte zum Spielen gewählt werden.');
  }
  if (!istGueltigeId(zielSchlangenId)) {
    throw new Error('Für Farbenfusion muss eine Zielschlange gewählt werden.');
  }
  if (!istGueltigeId(zielKartenId)) {
    throw new Error('Für Farbenfusion muss eine Zielkarte gewählt werden.');
  }

  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  const karte = aktiverSpieler.hand.find((k) => k.id === kartenId);
  if (!karte) {
    throw new Error('Die Karte befindet sich nicht auf der Hand des aktiven Spielers.');
  }
  if (!istFarbenfusionkarte(karte)) {
    throw new Error('Farbenfusion kann nur mit der Farbenfusion-Sonderkarte gespielt werden.');
  }
  if (zustand.zugpflichten.farbenfusionGespielt === true) {
    throw new Error('Pro Zug darf nur eine Farbenfusion durchgeführt werden.');
  }

  const zielSchlange = aktiverSpieler.schlangen.find((s) => s.id === zielSchlangenId);
  if (!zielSchlange) {
    throw new Error('Die ausgewählte Zielschlange ist ungültig.');
  }
  const zielIndex = zielSchlange.karten.findIndex((eintrag) => eintrag.id === zielKartenId);
  if (zielIndex < 0 || zielIndex >= zielSchlange.karten.length - 1) {
    throw new Error('Die ausgewählte Zielkarte ist ungültig.');
  }
  const ersteKarte = zielSchlange.karten[zielIndex];
  const zweiteKarte = zielSchlange.karten[zielIndex + 1];
  if (ersteKarte.typ !== 'Farbkarte' || zweiteKarte.typ !== 'Farbkarte' || ersteKarte.farbe !== zweiteKarte.farbe) {
    throw new Error('Farbenfusion kann nur auf zwei nebeneinanderliegenden Karten gleicher Farbe gespielt werden.');
  }

  pruefeSpielkartenLimit(zustand, karte.typ);

  const neueHand = aktiverSpieler.hand.filter((eintrag) => eintrag.id !== kartenId);
  const neueSpieler = zustand.spieler.map((spieler, index) =>
    index === zustand.aktiverSpielerIndex ? { ...spieler, hand: neueHand } : spieler,
  );

  const zustandNachAngriff = inkrementiereSpieleKarten(
    {
      ...zustand,
      spieler: neueSpieler,
    },
    neueSpieler,
    karte.typ,
    karte.name,
  );

  const fusionPunkte = ersteKarte.punkte + zweiteKarte.punkte;
  const abgelegteKarten = [ersteKarte, zweiteKarte];
  return {
    ...zustandNachAngriff,
    ablagestapel: [
      ...zustandNachAngriff.ablagestapel.filter((abwerfKarte) => abwerfKarte.id !== karte.id),
      ...abgelegteKarten,
    ],
    spieler: zustandNachAngriff.spieler.map((spieler, index) => {
      if (index !== zustand.aktiverSpielerIndex) {
        return spieler;
      }
      return {
        ...spieler,
        schlangen: spieler.schlangen.map((schlange) =>
          schlange.id === zielSchlangenId
            ? {
                ...schlange,
                karten: [...schlange.karten.slice(0, zielIndex), karte, ...schlange.karten.slice(zielIndex + 2)],
                farbenfusionen: [...(schlange.farbenfusionen ?? []), { kartenId: karte.id, punkte: fusionPunkte }],
              }
            : schlange,
        ),
      };
    }),
    zugpflichten: {
      ...zustandNachAngriff.zugpflichten,
      farbenfusionGespielt: true,
    },
  };
}

export function spieleSchlangenhaeutung(
  zustand: Spielzustand,
  optionen: { kartenId?: string; schlangenId?: string; kartenIdsInNeuerReihenfolge?: string[] } | null = {},
): Spielzustand {
  if (zustand.zugphase !== 'Ausspielphase') {
    throw new Error('Schlangenhäutung kann nur in der Ausspielphase gespielt werden.');
  }
  pruefeKeineAusstehendeReaktion(zustand);

  const { kartenId, schlangenId, kartenIdsInNeuerReihenfolge } = optionen ?? {};
  if (!istGueltigeId(kartenId)) {
    throw new Error('Es muss genau eine Handkarte zum Spielen gewählt werden.');
  }
  if (!istGueltigeId(schlangenId)) {
    throw new Error('Für Schlangenhäutung muss eine eigene Schlange gewählt werden.');
  }
  if (!Array.isArray(kartenIdsInNeuerReihenfolge)) {
    throw new Error('Für Schlangenhäutung muss eine neue Kartenreihenfolge gewählt werden.');
  }

  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  const karte = aktiverSpieler.hand.find((eintrag) => eintrag.id === kartenId);
  if (!karte) {
    throw new Error('Die Karte befindet sich nicht auf der Hand des aktiven Spielers.');
  }
  if (!istSchlangenhaeutungkarte(karte)) {
    throw new Error('Schlangenhäutung kann nur mit der Schlangenhäutung-Sonderkarte gespielt werden.');
  }

  const zielSchlange = aktiverSpieler.schlangen.find((schlange) => schlange.id === schlangenId);
  if (!zielSchlange) {
    throw new Error('Die ausgewählte Zielschlange ist ungültig.');
  }
  if (zielSchlange.zustand !== 'aktiv') {
    throw new Error('Schlangenhäutung kann nur auf aktive eigene Schlangen angewendet werden.');
  }

  const alteReihenfolge = zielSchlange.karten.map((eintrag) => eintrag.id);
  if (kartenIdsInNeuerReihenfolge.length !== alteReihenfolge.length) {
    throw new Error('Die neue Reihenfolge muss exakt alle Karten der ausgewählten Schlange enthalten.');
  }
  const neueIds = new Set(kartenIdsInNeuerReihenfolge);
  if (neueIds.size !== kartenIdsInNeuerReihenfolge.length) {
    throw new Error('Die neue Reihenfolge darf keine doppelten Karten enthalten.');
  }
  const alteIds = new Set(alteReihenfolge);
  if (kartenIdsInNeuerReihenfolge.some((id) => !alteIds.has(id))) {
    throw new Error('Die neue Reihenfolge darf nur Karten der ausgewählten Schlange enthalten.');
  }
  if (alteReihenfolge.every((id, index) => id === kartenIdsInNeuerReihenfolge[index])) {
    throw new Error('Schlangenhäutung muss die Reihenfolge der Schlange verändern.');
  }

  pruefeSpielkartenLimit(zustand, karte.typ);

  const kartenNachId = new Map(zielSchlange.karten.map((eintrag) => [eintrag.id, eintrag]));
  const neuGeordneteKarten = kartenIdsInNeuerReihenfolge.map((id) => kartenNachId.get(id)!);
  const neuGeordneteSchlange = { ...zielSchlange, karten: neuGeordneteKarten };
  const neueDreiergruppen = zaehleNeueDreiergruppen(zielSchlange, neuGeordneteSchlange);
  const neueHand = aktiverSpieler.hand.filter((eintrag) => eintrag.id !== kartenId);
  const neueSpieler = aktualisiereAktivenSpieler(zustand, {
    hand: neueHand,
    schlangen: aktiverSpieler.schlangen.map((schlange) =>
      schlange.id === schlangenId ? neuGeordneteSchlange : schlange,
    ),
    schlangenhaeutungDreiergruppen: aktiverSpieler.schlangenhaeutungDreiergruppen + neueDreiergruppen,
  });

  // ÄNDERUNG [07.06.2026]: R98 spielt Schlangenhäutung regelkonform als Neuordnung statt als Zieh-Effekt.
  return inkrementiereSpieleKarten(
    {
      ...zustand,
      spieler: neueSpieler,
      ablagestapel: [...zustand.ablagestapel, karte],
    },
    neueSpieler,
    karte.typ,
    karte.name,
  );
}

export function spieleVerdoppler(
  zustand: Spielzustand,
  optionen: { kartenId?: string } | null = {},
): Spielzustand {
  if (zustand.zugphase !== 'Ausspielphase') {
    throw new Error('Verdoppler kann nur in der Ausspielphase gespielt werden.');
  }
  pruefeKeineAusstehendeReaktion(zustand);

  const { kartenId } = optionen ?? {};
  if (!istGueltigeId(kartenId)) {
    throw new Error('Es muss genau eine Handkarte zum Spielen gewählt werden.');
  }

  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  const karte = aktiverSpieler.hand.find((k) => k.id === kartenId);
  if (!karte) {
    throw new Error('Die Karte befindet sich nicht auf der Hand des aktiven Spielers.');
  }
  if (karte.typ !== 'Sonderkarte' || karte.name !== 'Verdoppler') {
    throw new Error('Verdoppler kann nur mit der Verdoppler-Sonderkarte gespielt werden.');
  }
  if (zustand.zugpflichten.gespielteKarten !== 0) {
    throw new Error('Verdoppler kann nur zu Beginn des Zuges gespielt werden.');
  }

  pruefeSpielkartenLimit(zustand, karte.typ);

  const neueHand = aktiverSpieler.hand.filter((k) => k.id !== kartenId);
  const neueSpieler = aktualisiereAktivenSpieler(zustand, { hand: neueHand });
  const zustandNachSpiel = inkrementiereSpieleKarten(
    {
      ...zustand,
      spieler: neueSpieler,
      ablagestapel: [...zustand.ablagestapel, karte],
    },
    neueSpieler,
    karte.typ,
    karte.name,
  );

  return {
    ...zustandNachSpiel,
    pendingReaktion: {
      typ: 'VerdopplerAbwehr',
      angreifenderSpielerIndex: zustand.aktiverSpielerIndex,
      verbleibendeSpielerIndizes: ermittleNaechsteSpielerReihenfolge(
        zustand.aktiverSpielerIndex,
        zustand.spieler.length,
      ).filter((index) => index !== zustand.aktiverSpielerIndex),
    },
  };
}

export function spieleSchlangenfrass(
  zustand: Spielzustand,
  optionen: { kartenId?: string; ziele?: { spielerId: string; schlangenId: string; kartenId: string }[] } | null = {},
): Spielzustand {
  if (zustand.zugphase !== 'Ausspielphase') {
    throw new Error('Schlangenfrass kann nur in der Ausspielphase gespielt werden.');
  }
  pruefeKeineAusstehendeReaktion(zustand);

  const { kartenId, ziele } = optionen ?? {};
  if (!istGueltigeId(kartenId)) {
    throw new Error('Es muss genau eine Handkarte zum Spielen gewählt werden.');
  }
  if (!Array.isArray(ziele) || ziele.length < 1 || ziele.length > 2) {
    throw new Error('Schlangenfrass muss genau eine eigene Karte oder zwei gegnerische Karten haben.');
  }

  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  const karte = aktiverSpieler.hand.find((k) => k.id === kartenId);
  if (!karte) {
    throw new Error('Die Karte befindet sich nicht auf der Hand des aktiven Spielers.');
  }
  if (karte.typ !== 'Sonderkarte' || karte.name !== 'Schlangenfrass') {
    throw new Error('Schlangenfrass kann nur mit der Schlangenfrass-Sonderkarte gespielt werden.');
  }

  const zielkartenIds = new Set(ziele.map((z) => z.kartenId));
  if (zielkartenIds.size !== ziele.length) {
    throw new Error('Schlangenfrass darf keine doppelten Zielkarten haben.');
  }

  const validierteZiele: {
    spielerIndex: number;
    schlangenId: string;
    kartenId: string;
    hatFarbenschutz: boolean;
  }[] = [];
  for (const ziel of ziele) {
    const zielSpielerIndex = zustand.spieler.findIndex((sp) => sp.id === ziel.spielerId);
    if (zielSpielerIndex < 0) throw new Error('Ein Zielspieler ist ungültig.');
    const zielSpieler = zustand.spieler[zielSpielerIndex];
    const zielSchlange = zielSpieler.schlangen.find((s) => s.id === ziel.schlangenId);
    if (!zielSchlange) throw new Error('Eine Zielschlange ist ungültig.');
    const zielKarte = zielSchlange.karten.find((k) => k.id === ziel.kartenId);
    if (!zielKarte) throw new Error('Eine Zielkarte ist ungültig.');
    validierteZiele.push({
      spielerIndex: zielSpielerIndex,
      schlangenId: ziel.schlangenId,
      kartenId: ziel.kartenId,
      // ÄNDERUNG [05.07.2026]: A4 — die Farbenschutz-Reaktionskette gilt nur für gegnerische
      // Ziele; eigene Ziele werden nie in eine Selbst-Reaktion überführt.
      hatFarbenschutz:
        loestFarbenschutzReaktionAus(zustand, zielSpielerIndex),
    });
  }

  const alleZieleEigeneSchlange = validierteZiele.every(({ spielerIndex }) => spielerIndex === zustand.aktiverSpielerIndex);
  const alleZieleGegner = validierteZiele.every(({ spielerIndex }) => spielerIndex !== zustand.aktiverSpielerIndex);
  if (validierteZiele.length === 1) {
    if (!alleZieleEigeneSchlange) {
      throw new Error('Schlangenfrass mit einem Ziel ist nur auf die eigene Schlange erlaubt.');
    }
  } else if (!alleZieleGegner) {
    throw new Error('Schlangenfrass mit zwei Zielen ist nur gegen gegnerische Schlangen erlaubt.');
  }

  pruefeSpielkartenLimit(zustand, karte.typ);

  const neueHand = aktiverSpieler.hand.filter((k) => k.id !== kartenId);
  const sofortEntfernteZiele = validierteZiele.filter((ziel) => !ziel.hatFarbenschutz);
  const pendingZiele = sortiereSchlangenfrassZiele(
    zustand,
    validierteZiele
      .filter((ziel) => ziel.hatFarbenschutz)
      .map(({ spielerIndex, schlangenId, kartenId }) => ({ spielerIndex, schlangenId, kartenId })),
  );
  const sofortEntfernteKarten: Spielkarte[] = [];

  const neueSpieler = zustand.spieler.map((spieler, index) => {
    const zielFuerSpieler = sofortEntfernteZiele.filter((ziel) => ziel.spielerIndex === index);
    if (zielFuerSpieler.length === 0) {
      if (index === zustand.aktiverSpielerIndex) {
        return {
          ...spieler,
          hand: neueHand,
        };
      }
      return spieler;
    }

    const neueSchlangen = entferneSchlangenfrassAusSchlangen(spieler.schlangen, zielFuerSpieler, sofortEntfernteKarten);
    if (index === zustand.aktiverSpielerIndex) {
      return {
        ...spieler,
        hand: neueHand,
        schlangen: neueSchlangen,
      };
    }

    return {
      ...spieler,
      schlangen: neueSchlangen,
    };
  });

  return inkrementiereSpieleKarten(
    {
      ...zustand,
      spieler: neueSpieler,
      ablagestapel: [...zustand.ablagestapel, karte, ...sofortEntfernteKarten],
      pendingReaktion:
        pendingZiele.length > 0
          ? {
              typ: 'SchlangenfrassAbwehr',
              angreifenderSpielerIndex: zustand.aktiverSpielerIndex,
              verbleibendeZiele: pendingZiele,
            }
          : null,
    },
    neueSpieler,
    karte.typ,
    karte.name,
  );
}

export function spieleFarbenschutz(
  zustand: Spielzustand,
  optionen: { kartenId?: string; zielSchlangenId?: string } | null = {},
): Spielzustand {
  if (zustand.zugphase !== 'Ausspielphase') {
    throw new Error('Farbenschutz kann nur in der Ausspielphase gespielt werden.');
  }
  pruefeKeineAusstehendeReaktion(zustand);

  const { kartenId, zielSchlangenId } = optionen ?? {};
  if (!istGueltigeId(kartenId)) {
    throw new Error('Es muss genau eine Handkarte zum Spielen gewählt werden.');
  }
  if (!istGueltigeId(zielSchlangenId)) {
    throw new Error('Für Farbenschutz muss eine eigene Schlange gewählt werden.');
  }

  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  const karte = aktiverSpieler.hand.find((k) => k.id === kartenId);
  if (!karte) {
    throw new Error('Die Karte befindet sich nicht auf der Hand des aktiven Spielers.');
  }
  if (karte.typ !== 'Sonderkarte' || karte.name !== 'Farbenschutz') {
    throw new Error('Farbenschutz kann nur mit der Farbenschutz-Sonderkarte gespielt werden.');
  }

  const zielSchlange = aktiverSpieler.schlangen.find((s) => s.id === zielSchlangenId);
  if (!zielSchlange) {
    throw new Error('Zielschlange nicht gefunden oder gehört nicht dem aktiven Spieler.');
  }
  if (zielSchlange.zustand === 'geschuetzt') {
    throw new Error('Eine bereits geschützte Schlange kann nicht erneut geschützt werden.');
  }
  if (zielSchlange.zustand !== 'aktiv') {
    throw new Error('Farbenschutz kann nur auf aktive Schlangen angewendet werden.');
  }

  pruefeSpielkartenLimit(zustand, karte.typ);

  const neueHand = aktiverSpieler.hand.filter((k) => k.id !== kartenId);
  const neueSchlangen = aktiverSpieler.schlangen.map((s) =>
    s.id === zielSchlangenId ? { ...s, zustand: 'geschuetzt' as const } : s,
  );
  const neueSpieler = aktualisiereAktivenSpieler(zustand, { hand: neueHand, schlangen: neueSchlangen });

  return inkrementiereSpieleKarten(
    {
      ...zustand,
      spieler: neueSpieler,
      ablagestapel: [...zustand.ablagestapel, karte],
    },
    neueSpieler,
    karte.typ,
    karte.name,
  );
}
