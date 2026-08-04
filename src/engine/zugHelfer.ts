/*
Author: Claude Code (Punkt 3)
Datum: 04.08.2026
Version: 1.0
Beschreibung: Bausteine der Zugmaschine — Kartenprädikate, Schlangen-Umbau,
              Spielerrotation, Zuglimits, Zähler.

ÄNDERUNG [04.08.2026]: Aus `turnState.ts` herausgelöst (Punkt 3). Die Datei trug
1744 Zeilen: die Zugphasen-Maschine **plus** acht Kartenwirkungen **plus** die
Auflösung der Reaktionskette. Drei Themen, die nichts voneinander wissen müssen.

Rein strukturell — die Zusicherung dieses Slices ist „unverändert grün": gleiche
Testzahl, gleiche Punktzahlen, identisches Verhalten. Kein Zeilenbudget für
Produktionscode; der Schnitt folgt der Naht, nicht einer Zahl.

Hier steht, was **alle drei** Teile brauchen. Deshalb hängt diese Datei an
nichts außer Typen und Konstanten — sie ist das Blatt im Abhängigkeitsbaum.
*/

import { MAX_SCHLANGEN_PRO_SPIELER, MAX_KARTEN_PRO_ZUG } from './constants';
import type { Spielkarte, SonderkarteInfo, Spielzustand, PendingSchlangenfrassAbwehr } from './types';
import { ermittleFarbgruppen } from './colorGroups';

export function istFarbenschutzkarte(karte: Spielkarte | undefined): karte is SonderkarteInfo {
  return karte?.typ === 'Sonderkarte' && karte.name === 'Farbenschutz';
}

export function istFarbenfusionkarte(karte: Spielkarte | undefined): karte is SonderkarteInfo {
  return karte?.typ === 'Sonderkarte' && karte.name === 'Farbenfusion';
}

export function istSchlangenhaeutungkarte(karte: Spielkarte | undefined): karte is SonderkarteInfo {
  return karte?.typ === 'Sonderkarte' && karte.name === 'Schlangenhäutung';
}

export function aktualisiereAktivenSpieler(
  zustand: Spielzustand,
  patch: Partial<Spielzustand['spieler'][number]>,
): Spielzustand['spieler'] {
  return zustand.spieler.map((spieler, index) =>
    index === zustand.aktiverSpielerIndex ? { ...spieler, ...patch } : spieler,
  );
}

export function erstelleSchlangenId(spielerId: string, nummer: number): string {
  return `schlange-${spielerId}-${nummer}`;
}

export function istGueltigeId(wert: unknown): wert is string {
  return typeof wert === 'string' && wert.trim() !== '';
}

export function fuegeKarteInSchlangeEin(schlangeKarten: Spielkarte[], karte: Spielkarte, position: number): Spielkarte[] {
  const neueKarten = [...schlangeKarten];
  neueKarten.splice(position, 0, karte);
  return neueKarten;
}

function entferneKarteAusSchlange(schlangeKarten: Spielkarte[], kartenId: string): Spielkarte[] {
  return schlangeKarten.filter((karte) => karte.id !== kartenId);
}

// ÄNDERUNG [05.07.2026]: K2 — nach dem Entfernen von Karten dürfen keine farbenfusionen-Einträge
// zurückbleiben, deren Farbenfusion-Karte nicht mehr in der Schlange liegt (sonst wirft die
// Serialisierungs-Validierung und die Wertung).
export function bereinigeFarbenfusionen<S extends { karten: Spielkarte[]; farbenfusionen?: { kartenId: string; punkte: number }[] }>(schlange: S): S {
  if (schlange.farbenfusionen === undefined) return schlange;
  const vorhandeneIds = new Set(schlange.karten.map((karte) => karte.id));
  const bereinigt = schlange.farbenfusionen.filter((eintrag) => vorhandeneIds.has(eintrag.kartenId));
  if (bereinigt.length === schlange.farbenfusionen.length) return schlange;
  return { ...schlange, farbenfusionen: bereinigt.length > 0 ? bereinigt : undefined };
}

export function sortiereSchlangenfrassZiele(
  zustand: Spielzustand,
  ziele: { spielerIndex: number; schlangenId: string; kartenId: string }[],
): { spielerIndex: number; schlangenId: string; kartenId: string }[] {
  const reihenfolge = ermittleNaechsteSpielerReihenfolge(zustand.aktiverSpielerIndex, zustand.spieler.length);
  return [...ziele].sort((a, b) => {
    const aPosition = reihenfolge.indexOf(a.spielerIndex);
    const bPosition = reihenfolge.indexOf(b.spielerIndex);
    if (aPosition !== bPosition) return aPosition - bPosition;
    return 0;
  });
}

export function aktualisiereSchlangenfrassPending(
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

function pruefeFarbenschutzImHaufen(schlangeKarten: Spielkarte[]): SonderkarteInfo | null {
  return schlangeKarten.find(istFarbenschutzkarte) ?? null;
}

/**
 * Bekommt der Angegriffene ein Abwehrfenster?
 *
 * ÄNDERUNG [04.08.2026]: O-1 — eine Frage, ein Ort. Zwei Bedingungen gehören
 * zusammen und standen bis heute in vier Fassungen da:
 *
 * 1. **Das Ziel ist ein anderer Spieler.** Gegen sich selbst wehrt man sich
 *    nicht (GAME_SPEC R7.1a Punkt 4; beim Schlangenfrass seit jeher so).
 * 2. **Der Zielspieler hält einen Farbenschutz.**
 *
 * Vor O-1 kamen Schlangengrube und Farbendieb ohne Punkt 1 aus: Ein eigenes Ziel
 * war dort per Wurf verboten, also konnte der Fall nicht eintreten. Die
 * Schlangenblockade hat diese Sperre mit dem Signoff verloren — und damit wurde
 * aus einer stillschweigenden Voraussetzung eine Bedingung, die dastehen muss.
 * Sie hier zu benennen ist billiger, als sie an jeder Angriffskarte einzeln
 * mitzudenken (Altitude-Review, Gate 7).
 */
export function loestFarbenschutzReaktionAus(zustand: Spielzustand, zielSpielerIndex: number): boolean {
  if (zielSpielerIndex === zustand.aktiverSpielerIndex) return false;
  return pruefeFarbenschutzImHaufen(zustand.spieler[zielSpielerIndex].hand) !== null;
}

export function pruefeKeineAusstehendeReaktion(zustand: Spielzustand): void {
  if (zustand.pendingReaktion !== null) {
    throw new Error('Eine ausstehende Reaktion muss zuerst aufgelöst werden.');
  }
}

export function holeReaktionsSpieler(
  zustand: Spielzustand,
  spielerIndex: number,
  spielerId: string,
  fehlertext: string,
): Spielzustand['spieler'][number] {
  const reaktionsSpieler = zustand.spieler[spielerIndex];
  if (reaktionsSpieler.id !== spielerId) {
    throw new Error(fehlertext);
  }
  return reaktionsSpieler;
}

export function entferneFarbenschutzAusHand(
  zustand: Spielzustand,
  spielerIndex: number,
  abwehrKartenId: string,
): { neueSpieler: Spielzustand['spieler']; abwehrkarte: SonderkarteInfo } {
  const spieler = zustand.spieler[spielerIndex];
  const abwehrkarte = spieler.hand.find((k) => k.id === abwehrKartenId);
  if (!istFarbenschutzkarte(abwehrkarte)) {
    throw new Error('Farbenschutz-Abwehr ist nur mit einer Farbenschutzkarte erlaubt.');
  }

  return {
    neueSpieler: zustand.spieler.map((sp, i) =>
      i === spielerIndex
        ? {
            ...sp,
            hand: sp.hand.filter((k) => k.id !== abwehrKartenId),
            ausgespielteSonderkartenNamen: [...sp.ausgespielteSonderkartenNamen, abwehrkarte.name],
          }
        : sp,
    ),
    abwehrkarte,
  };
}

export function loeseFarbenschutzAbwehr(
  zustand: Spielzustand,
  spielerId: string,
  spielerIndex: number,
  abwehrKartenId: string,
  fehlertext: string,
): Spielzustand {
  holeReaktionsSpieler(zustand, spielerIndex, spielerId, fehlertext);
  const { neueSpieler, abwehrkarte } = entferneFarbenschutzAusHand(zustand, spielerIndex, abwehrKartenId);
  return {
    ...zustand,
    spieler: neueSpieler,
    ablagestapel: [...zustand.ablagestapel, abwehrkarte],
    pendingReaktion: null,
  };
}

export function entferneSchlangenfrassAusSchlangen(
  schlangen: Spielzustand['spieler'][number]['schlangen'],
  zielKarten: { schlangenId: string; kartenId: string }[],
  sofortEntfernteKarten: Spielkarte[],
): Spielzustand['spieler'][number]['schlangen'] {
  return schlangen.map((schlange) => {
    const zielKartenFuerSchlange = zielKarten.filter((ziel) => ziel.schlangenId === schlange.id);
    if (zielKartenFuerSchlange.length === 0) {
      return schlange;
    }

    const verbliebeneKarten: Spielkarte[] = [];
    for (const karteEintrag of schlange.karten) {
      const ziel = zielKartenFuerSchlange.find((eintrag) => eintrag.kartenId === karteEintrag.id);
      if (ziel) {
        sofortEntfernteKarten.push(karteEintrag);
      } else {
        verbliebeneKarten.push(karteEintrag);
      }
    }

    return bereinigeFarbenfusionen({ ...schlange, karten: verbliebeneKarten });
  });
}

function ermittleMaxKartenartenProZug(zustand: Spielzustand): number {
  return zustand.zugpflichten.verdopplerBonusAktiv === true ? 2 : 1;
}

function ermittleMaxFarbkartenProZug(zustand: Spielzustand): number {
  return ermittleMaxKartenartenProZug(zustand);
}

function ermittleMaxSonderkartenProZug(zustand: Spielzustand): number {
  return ermittleMaxKartenartenProZug(zustand);
}

export function pruefeSpielkartenLimit(zustand: Spielzustand, kartentyp: Spielkarte['typ']): void {
  const erlaubtesLimit = MAX_KARTEN_PRO_ZUG + (zustand.zugpflichten.verdopplerBonusAktiv === true ? 1 : 0);
  const limitText = erlaubtesLimit === 2 ? 'zwei' : 'drei';
  const maxFarbkartenProZug = ermittleMaxFarbkartenProZug(zustand);
  const maxSonderkartenProZug = ermittleMaxSonderkartenProZug(zustand);
  if (zustand.zugpflichten.gespielteKarten >= erlaubtesLimit) {
    throw new Error(`Die Ausspielphase darf höchstens ${limitText} gespielte Karten enthalten.`);
  }
  if (kartentyp === 'Farbkarte' && zustand.zugpflichten.gespielteFarbkarten >= maxFarbkartenProZug) {
    throw new Error(`Pro Zug darf höchstens ${maxFarbkartenProZug} Farbkarte${maxFarbkartenProZug === 1 ? '' : 'n'} gespielt werden.`);
  }
  if (kartentyp === 'Sonderkarte' && zustand.zugpflichten.gespielteSonderkarten >= maxSonderkartenProZug) {
    throw new Error(`Pro Zug darf höchstens ${maxSonderkartenProZug} Sonderkarte${maxSonderkartenProZug === 1 ? '' : 'n'} gespielt werden.`);
  }
}

export function ermittleNaechsteSpielerReihenfolge(aktiverSpielerIndex: number, spielerAnzahl: number): number[] {
  const reihenfolge: number[] = [];
  for (let verschiebung = 1; verschiebung <= spielerAnzahl; verschiebung += 1) {
    reihenfolge.push((aktiverSpielerIndex + verschiebung) % spielerAnzahl);
  }
  return reihenfolge;
}

export function findeNaechstenAktivenSpieler(
  kandidaten: number[],
  aussetzenSpielerIndizes: number[],
): { aktiverSpielerIndex: number; aussetzenSpielerIndizes: number[]; verbleibendeSpielerIndizes: number[] } | null {
  const neueAussetzenSpielerIndizes = [...aussetzenSpielerIndizes];

  for (let index = 0; index < kandidaten.length; index += 1) {
    const kandidat = kandidaten[index];
    const gesperrterIndex = neueAussetzenSpielerIndizes.indexOf(kandidat);
    if (gesperrterIndex >= 0) {
      neueAussetzenSpielerIndizes.splice(gesperrterIndex, 1);
      continue;
    }

    return {
      aktiverSpielerIndex: kandidat,
      aussetzenSpielerIndizes: neueAussetzenSpielerIndizes,
      verbleibendeSpielerIndizes: kandidaten.slice(index),
    };
  }

  return null;
}

export function inkrementiereSpieleKarten(
  zustand: Spielzustand,
  neueSpieler: Spielzustand['spieler'],
  kartentyp: Spielkarte['typ'],
  sonderkartenName?: string,
): Spielzustand {
  const spielerMitHistorie =
    kartentyp === 'Sonderkarte' && sonderkartenName
      ? aktualisiereAktivenSpieler({ ...zustand, spieler: neueSpieler }, {
          ausgespielteSonderkartenNamen: [
            ...neueSpieler[zustand.aktiverSpielerIndex].ausgespielteSonderkartenNamen,
            sonderkartenName,
          ],
        })
      : neueSpieler;

  return {
    ...zustand,
    spieler: spielerMitHistorie,
    zugpflichten: {
      ...zustand.zugpflichten,
      gespielteKarten: zustand.zugpflichten.gespielteKarten + 1,
      gespielteFarbkarten: zustand.zugpflichten.gespielteFarbkarten + (kartentyp === 'Farbkarte' ? 1 : 0),
      gespielteSonderkarten:
        zustand.zugpflichten.gespielteSonderkarten + (kartentyp === 'Sonderkarte' ? 1 : 0),
    },
  };
}

export function ermittleNaechsteFreieSchlangenNummer(spieler: Spielzustand['spieler'][number]): number {
  const belegteIds = new Set(spieler.schlangen.map((schlange) => schlange.id));

  for (let nummer = 1; nummer <= MAX_SCHLANGEN_PRO_SPIELER; nummer += 1) {
    if (!belegteIds.has(erstelleSchlangenId(spieler.id, nummer))) {
      return nummer;
    }
  }

  throw new Error('Alle Schlangennummern sind belegt.');
}

export function erstelleLeereZugpflichten() {
  return { gespielteKarten: 0, gespielteFarbkarten: 0, gespielteSonderkarten: 0, verdopplerBonusAktiv: false, farbenfusionGespielt: false } as const;
}

function erstelleFarbgruppenSignatur(gruppe: ReturnType<typeof ermittleFarbgruppen>[number]): string {
  // ÄNDERUNG [07.06.2026]: Dreiergruppen anhand ihrer Kartenidentität statt Position vergleichen.
  const kartenIdentitaet = [...gruppe.kartenIds].sort().join(',');
  return `${gruppe.farbe}:${kartenIdentitaet}`;
}

function erstelleFarbgruppenSignaturen(schlange: Spielzustand['spieler'][number]['schlangen'][number]): Set<string> {
  return new Set(ermittleFarbgruppen(schlange).map(erstelleFarbgruppenSignatur));
}

export function zaehleNeueDreiergruppen(
  vorher: Spielzustand['spieler'][number]['schlangen'][number],
  nachher: Spielzustand['spieler'][number]['schlangen'][number],
): number {
  const vorherSignaturen = erstelleFarbgruppenSignaturen(vorher);
  return ermittleFarbgruppen(nachher).filter((gruppe) =>
    !vorherSignaturen.has(erstelleFarbgruppenSignatur(gruppe)),
  ).length;
}

export function pruefeKartenartZaehler(zustand: Spielzustand): void {
  const { gespielteKarten, gespielteFarbkarten, gespielteSonderkarten } = zustand.zugpflichten;
  const maxFarbkartenProZug = ermittleMaxFarbkartenProZug(zustand);
  const maxSonderkartenProZug = ermittleMaxSonderkartenProZug(zustand);
  const limitWort = maxSonderkartenProZug === 1 ? 'eine' : 'zwei';
  if (gespielteFarbkarten > maxFarbkartenProZug) {
    throw new Error(`Pro Zug darf höchstens ${maxFarbkartenProZug} Farbkarte${maxFarbkartenProZug === 1 ? '' : 'n'} gespielt werden.`);
  }
  if (gespielteSonderkarten > maxSonderkartenProZug) {
    throw new Error(`Pro Zug darf höchstens ${limitWort} Sonderkarte${maxSonderkartenProZug === 1 ? '' : 'n'} gespielt werden.`);
  }
  if (gespielteFarbkarten + gespielteSonderkarten !== gespielteKarten) {
    throw new Error('Die gespielten Kartenarten müssen zur Anzahl gespielter Karten passen.');
  }
}

export function berechneEndrundenSpieler(ausloeserIndex: number, spielerAnzahl: number): number[] {
  const indizes: number[] = [];
  for (let i = 1; i < spielerAnzahl; i++) {
    indizes.push((ausloeserIndex + i) % spielerAnzahl);
  }
  return indizes;
}
