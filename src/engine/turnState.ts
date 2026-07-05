/*
Author: rahn
Datum: 31.05.2026
Version: 1.7
Beschreibung: Zugphasen-State-Machine für Schlangentanz – Übergänge zwischen Nachziehphase, Ausspielphase, Aufgabenprüfung und Zugabschluss. Inkl. Überhand-Abwurf, Pflichtprüfung im Zugabschluss (R2.5), Neue Schlange starten (R3.1), Farbkarte anlegen (R3.2), Farbenschutz (R75).
*/

import { HANDKARTENLIMIT, MINDESTHANDKARTEN, MAX_SCHLANGEN_PRO_SPIELER, MAX_KARTEN_PRO_ZUG } from './constants';
import type { Spielkarte, SonderkarteInfo, Spielzustand, Spielphase, PendingFarbendiebAbwehr, PendingSchlangenfrassAbwehr } from './types';
import { ermittleErfuellteOffeneAufgaben, erfuelleOffeneAufgaben, pruefeGeheimeAufgabe } from './aufgabenPruefung';
import { ermittleFarbgruppen } from './colorGroups';

export function istFarbenschutzkarte(karte: Spielkarte | undefined): karte is SonderkarteInfo {
  return karte?.typ === 'Sonderkarte' && karte.name === 'Farbenschutz';
}

function istFarbenfusionkarte(karte: Spielkarte | undefined): karte is SonderkarteInfo {
  return karte?.typ === 'Sonderkarte' && karte.name === 'Farbenfusion';
}

function istSchlangenhaeutungkarte(karte: Spielkarte | undefined): karte is SonderkarteInfo {
  return karte?.typ === 'Sonderkarte' && karte.name === 'Schlangenhäutung';
}

function aktualisiereAktivenSpieler(
  zustand: Spielzustand,
  patch: Partial<Spielzustand['spieler'][number]>,
): Spielzustand['spieler'] {
  return zustand.spieler.map((spieler, index) =>
    index === zustand.aktiverSpielerIndex ? { ...spieler, ...patch } : spieler,
  );
}

function erstelleSchlangenId(spielerId: string, nummer: number): string {
  return `schlange-${spielerId}-${nummer}`;
}

function istGueltigeId(wert: unknown): wert is string {
  return typeof wert === 'string' && wert.trim() !== '';
}

function fuegeKarteInSchlangeEin(schlangeKarten: Spielkarte[], karte: Spielkarte, position: number): Spielkarte[] {
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
function bereinigeFarbenfusionen<S extends { karten: Spielkarte[]; farbenfusionen?: { kartenId: string; punkte: number }[] }>(schlange: S): S {
  if (schlange.farbenfusionen === undefined) return schlange;
  const vorhandeneIds = new Set(schlange.karten.map((karte) => karte.id));
  const bereinigt = schlange.farbenfusionen.filter((eintrag) => vorhandeneIds.has(eintrag.kartenId));
  if (bereinigt.length === schlange.farbenfusionen.length) return schlange;
  return { ...schlange, farbenfusionen: bereinigt.length > 0 ? bereinigt : undefined };
}

function sortiereSchlangenfrassZiele(
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

function pruefeFarbenschutzImHaufen(schlangeKarten: Spielkarte[]): SonderkarteInfo | null {
  return schlangeKarten.find(istFarbenschutzkarte) ?? null;
}

function pruefeKeineAusstehendeReaktion(zustand: Spielzustand): void {
  if (zustand.pendingReaktion !== null) {
    throw new Error('Eine ausstehende Reaktion muss zuerst aufgelöst werden.');
  }
}

function holeReaktionsSpieler(
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

function entferneFarbenschutzAusHand(
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

function loeseFarbenschutzAbwehr(
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

function entferneSchlangenfrassAusSchlangen(
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

function pruefeSpielkartenLimit(zustand: Spielzustand, kartentyp: Spielkarte['typ']): void {
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


function ermittleNaechsteSpielerReihenfolge(aktiverSpielerIndex: number, spielerAnzahl: number): number[] {
  const reihenfolge: number[] = [];
  for (let verschiebung = 1; verschiebung <= spielerAnzahl; verschiebung += 1) {
    reihenfolge.push((aktiverSpielerIndex + verschiebung) % spielerAnzahl);
  }
  return reihenfolge;
}

function findeNaechstenAktivenSpieler(
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

function inkrementiereSpieleKarten(
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

function ermittleNaechsteFreieSchlangenNummer(spieler: Spielzustand['spieler'][number]): number {
  const belegteIds = new Set(spieler.schlangen.map((schlange) => schlange.id));

  for (let nummer = 1; nummer <= MAX_SCHLANGEN_PRO_SPIELER; nummer += 1) {
    if (!belegteIds.has(erstelleSchlangenId(spieler.id, nummer))) {
      return nummer;
    }
  }

  throw new Error('Alle Schlangennummern sind belegt.');
}

function erstelleLeereZugpflichten() {
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

function zaehleNeueDreiergruppen(
  vorher: Spielzustand['spieler'][number]['schlangen'][number],
  nachher: Spielzustand['spieler'][number]['schlangen'][number],
): number {
  const vorherSignaturen = erstelleFarbgruppenSignaturen(vorher);
  return ermittleFarbgruppen(nachher).filter((gruppe) =>
    !vorherSignaturen.has(erstelleFarbgruppenSignatur(gruppe)),
  ).length;
}

function pruefeKartenartZaehler(zustand: Spielzustand): void {
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

function berechneEndrundenSpieler(ausloeserIndex: number, spielerAnzahl: number): number[] {
  const indizes: number[] = [];
  for (let i = 1; i < spielerAnzahl; i++) {
    indizes.push((ausloeserIndex + i) % spielerAnzahl);
  }
  return indizes;
}

function zieheAufMindesthand(
  zustand: Spielzustand,
  spielerIndex: number,
): { neueHand: Spielkarte[]; neuerNachziehstapel: Spielkarte[]; spielphase: Spielphase; endrunde: Spielzustand['endrunde'] } {
  const neuerNachziehstapel = [...zustand.nachziehstapel];
  const neueHand = [...zustand.spieler[spielerIndex].hand];
  while (neueHand.length < MINDESTHANDKARTEN && neuerNachziehstapel.length > 0) {
    neueHand.push(neuerNachziehstapel.shift()!);
  }
  const wirdEndspurt = zustand.nachziehstapel.length > 0 && neuerNachziehstapel.length === 0;
  const spielphase: Spielphase = wirdEndspurt ? 'Endspurt' : zustand.spielphase;
  const endrunde = wirdEndspurt
    ? {
        ausloeserSpielerIndex: spielerIndex,
        verbleibendeSpielerIndizes: berechneEndrundenSpieler(spielerIndex, zustand.spieler.length),
      }
    : zustand.endrunde;
  return { neueHand, neuerNachziehstapel, spielphase, endrunde };
}

export function starteAusspielphase(zustand: Spielzustand): Spielzustand {
  if (zustand.zugphase !== 'Nachziehphase') {
    throw new Error('Ausspielphase kann nur aus der Nachziehphase gestartet werden.');
  }

  if (zustand.spieler[zustand.aktiverSpielerIndex].hand.length >= MINDESTHANDKARTEN) {
    return { ...zustand, zugphase: 'Ausspielphase' };
  }

  const { neueHand, neuerNachziehstapel, spielphase, endrunde } = zieheAufMindesthand(zustand, zustand.aktiverSpielerIndex);
  const neueSpieler = aktualisiereAktivenSpieler(zustand, { hand: neueHand });

  return {
    ...zustand,
    spieler: neueSpieler,
    nachziehstapel: neuerNachziehstapel,
    spielphase,
    endrunde,
    zugphase: 'Ausspielphase',
  };
}

export function beendeAusspielphase(
  zustand: Spielzustand,
): Spielzustand {
  if (zustand.zugphase !== 'Ausspielphase') {
    throw new Error('Ausspielphase kann nur aus der Ausspielphase beendet werden.');
  }
  if (zustand.pendingReaktion !== null) {
    throw new Error('Ausspielphase kann nicht beendet werden, solange eine Reaktion aussteht.');
  }
  const ausgespielteKarten = zustand.zugpflichten.gespielteKarten;
  if (!Number.isInteger(ausgespielteKarten)) {
    throw new Error('Die Anzahl ausgespielter Karten muss eine ganze Zahl sein.');
  }
  // ÄNDERUNG [05.07.2026]: H2 — ohne Handkarten (etwa nach Farbenschutz-Reaktionen im Endspurt,
  // wo nicht mehr nachgezogen wird) besteht keine Zugpflicht; der Zug ist regulär beendbar.
  const handLeer = zustand.spieler[zustand.aktiverSpielerIndex].hand.length === 0;
  if (ausgespielteKarten < 1 && !handLeer) {
    throw new Error('Die Ausspielphase darf erst nach mindestens einer gespielten Karte beendet werden.');
  }
  const erlaubtesLimit = MAX_KARTEN_PRO_ZUG + (zustand.zugpflichten.verdopplerBonusAktiv === true ? 1 : 0);
  const limitText = erlaubtesLimit === 2 ? 'zwei' : 'drei';
  if (ausgespielteKarten > erlaubtesLimit) {
    throw new Error(`Die Ausspielphase darf höchstens ${limitText} gespielte Karten enthalten.`);
  }
  pruefeKartenartZaehler(zustand);
  return { ...zustand, zugphase: 'Aufgabenpruefung' };
}

export function beendeAufgabenpruefung(
  zustand: Spielzustand,
  { aufgabenGeprueft }: { aufgabenGeprueft: boolean } = { aufgabenGeprueft: false },
): Spielzustand {
  if (zustand.zugphase !== 'Aufgabenpruefung') {
    throw new Error('Aufgabenprüfung kann nur aus der Aufgabenprüfung beendet werden.');
  }
  if (aufgabenGeprueft !== true) {
    throw new Error('Die Aufgabenprüfung darf erst nach geprüften Aufgaben beendet werden.');
  }

  const erfuellteAufgaben = ermittleErfuellteOffeneAufgaben(zustand);
  const nachOffenen = erfuellteAufgaben.length > 0 ? erfuelleOffeneAufgaben(zustand, erfuellteAufgaben) : zustand;

  // ÄNDERUNG [05.07.2026]: K4 — geheime Aufgabe prüfen und sticky markieren.
  const bereitsErfuellt = nachOffenen.spieler[nachOffenen.aktiverSpielerIndex].geheimeAufgabeErfuellt === true;
  const geheimErfuellt = bereitsErfuellt || pruefeGeheimeAufgabe(nachOffenen);
  const mitGeheim = geheimErfuellt && !bereitsErfuellt
    ? { ...nachOffenen, spieler: aktualisiereAktivenSpieler(nachOffenen, { geheimeAufgabeErfuellt: true }) }
    : nachOffenen;

  return { ...mitGeheim, zugphase: 'Zugabschluss' };
}

export function werfeUeberzaehligeHandkartenAb(
  zustand: Spielzustand,
  { kartenIds }: { kartenIds?: string[] } = {},
): Spielzustand {
  if (zustand.zugphase !== 'Zugabschluss') {
    throw new Error('Überzählige Handkarten können nur im Zugabschluss abgeworfen werden.');
  }

  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  const ueberzaehlig = aktiverSpieler.hand.length - HANDKARTENLIMIT;

  if (ueberzaehlig <= 0) {
    throw new Error('Überzählige Handkarten können nur abgeworfen werden, wenn die Hand das Handkartenlimit überschreitet.');
  }

  if (!Array.isArray(kartenIds) || kartenIds.length !== ueberzaehlig) {
    throw new Error('Es müssen exakt so viele Handkarten abgeworfen werden, bis höchstens zehn Handkarten übrig sind.');
  }

  const abzuwerfenSet = new Set(kartenIds);
  const abgeworfeneKarten = aktiverSpieler.hand.filter((karte) => abzuwerfenSet.has(karte.id));
  if (abgeworfeneKarten.length !== kartenIds.length) {
    throw new Error('Es können nur Handkarten des aktiven Spielers abgeworfen werden.');
  }
  const neueHand = aktiverSpieler.hand.filter((karte) => !abzuwerfenSet.has(karte.id));

  const neueSpieler = aktualisiereAktivenSpieler(zustand, { hand: neueHand });

  return {
    ...zustand,
    spieler: neueSpieler,
    ablagestapel: [...zustand.ablagestapel, ...abgeworfeneKarten],
  };
}

export function werfeKarteMangelsSpielbarerAktionAb(
  zustand: Spielzustand,
  { kartenId, keineSpielbareKarte }: { kartenId?: string; keineSpielbareKarte?: boolean } = {},
): Spielzustand {
  if (zustand.zugphase !== 'Ausspielphase') {
    throw new Error('Pflicht-Abwurf ohne spielbare Karte ist nur in der Ausspielphase erlaubt.');
  }
  if (typeof kartenId !== 'string' || kartenId === '') {
    throw new Error('Es muss genau eine abzuwerfende Handkarte gewählt werden.');
  }
  if (keineSpielbareKarte !== true) {
    throw new Error('Pflicht-Abwurf ist nur erlaubt, wenn keine spielbare Karte verfügbar ist.');
  }
  pruefeKeineAusstehendeReaktion(zustand);

  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  const abzuwerfendeKarte = aktiverSpieler.hand.find((karte) => karte.id === kartenId);
  if (!abzuwerfendeKarte) {
    throw new Error('Es kann nur eine Handkarte des aktiven Spielers abgeworfen werden.');
  }
  pruefeSpielkartenLimit(zustand, abzuwerfendeKarte.typ);

  const neueHand = aktiverSpieler.hand.filter((karte) => karte.id !== kartenId);
  const neueSpieler = aktualisiereAktivenSpieler(zustand, { hand: neueHand });

  return inkrementiereSpieleKarten(
    { ...zustand, ablagestapel: [...zustand.ablagestapel, abzuwerfendeKarte] },
    neueSpieler,
    abzuwerfendeKarte.typ,
  );
}

export function starteNeueSchlange(
  zustand: Spielzustand,
  optionen: { kartenId?: string } | null = {},
): Spielzustand {
  if (zustand.zugphase !== 'Ausspielphase') {
    throw new Error('Neue Schlangen können nur in der Ausspielphase gestartet werden.');
  }
  pruefeKeineAusstehendeReaktion(zustand);

  const kartenId = optionen?.kartenId;
  if (!istGueltigeId(kartenId)) {
    throw new Error('Es muss genau eine Handkarte zum Starten gewählt werden.');
  }

  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  if (aktiverSpieler.schlangen.length >= MAX_SCHLANGEN_PRO_SPIELER) {
    throw new Error(`Ein Spieler darf maximal ${MAX_SCHLANGEN_PRO_SPIELER} Schlangen haben.`);
  }

  const karte = aktiverSpieler.hand.find((k) => k.id === kartenId);
  if (!karte) {
    throw new Error('Die Karte befindet sich nicht auf der Hand des aktiven Spielers.');
  }
  if (karte.typ !== 'Farbkarte') {
    throw new Error('Eine neue Schlange kann nur mit einer Farbkarte gestartet werden.');
  }
  pruefeSpielkartenLimit(zustand, karte.typ);

  const neueSchlange = {
    id: erstelleSchlangenId(aktiverSpieler.id, ermittleNaechsteFreieSchlangenNummer(aktiverSpieler)),
    zustand: 'aktiv' as const,
    karten: [karte],
  };
  const neueHand = aktiverSpieler.hand.filter((k) => k.id !== kartenId);
  const neueSpieler = aktualisiereAktivenSpieler(zustand, {
    hand: neueHand,
    schlangen: [...aktiverSpieler.schlangen, neueSchlange],
  });

  return inkrementiereSpieleKarten(zustand, neueSpieler, karte.typ);
}

export function legeKarteAnSchlangeAn(
  zustand: Spielzustand,
  optionen: { kartenId?: string; schlangenId?: string; position?: string } | null = {},
): Spielzustand {
  if (zustand.zugphase !== 'Ausspielphase') {
    throw new Error('Karten können nur in der Ausspielphase angelegt werden.');
  }
  pruefeKeineAusstehendeReaktion(zustand);

  const { kartenId, schlangenId, position } = optionen ?? {};

  if (!istGueltigeId(kartenId) || !istGueltigeId(schlangenId) || !istGueltigeId(position)) {
    throw new Error('Es müssen Handkarte, Schlange und Anlegeposition gewählt werden.');
  }

  if (position !== 'links' && position !== 'rechts') {
    throw new Error('Karten können nur links oder rechts angelegt werden.');
  }

  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];

  const karte = aktiverSpieler.hand.find((k) => k.id === kartenId);
  if (!karte) {
    throw new Error('Die Karte befindet sich nicht auf der Hand des aktiven Spielers.');
  }
  if (karte.typ !== 'Farbkarte') {
    throw new Error('An eine Schlange kann nur eine Farbkarte angelegt werden.');
  }
  pruefeSpielkartenLimit(zustand, karte.typ);

  const schlange = aktiverSpieler.schlangen.find((s) => s.id === schlangenId);
  if (!schlange) {
    throw new Error('Schlange nicht gefunden.');
  }
  if (schlange.zustand === 'blockiert') {
    throw new Error('Eine blockierte Schlange kann nicht erweitert werden.');
  }

  const neueKarten = position === 'links' ? [karte, ...schlange.karten] : [...schlange.karten, karte];
  const neueHand = aktiverSpieler.hand.filter((k) => k.id !== kartenId);
  const neueSpieler = aktualisiereAktivenSpieler(zustand, {
    hand: neueHand,
    schlangen: aktiverSpieler.schlangen.map((s) => (s.id === schlangenId ? { ...s, karten: neueKarten } : s)),
  });

  return inkrementiereSpieleKarten(zustand, neueSpieler, karte.typ);
}

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
  const zielSpieler = zustand.spieler[zielSpielerIndex];
  const hatFarbenschutz = zielSpieler.hand.some((k) => istFarbenschutzkarte(k));
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
  optionen: { kartenId?: string; zielSpielerIndex?: number; zielSchlangenId?: string } | null = {},
): Spielzustand {
  if (zustand.zugphase !== 'Ausspielphase') {
    throw new Error('Schlangenblockade kann nur in der Ausspielphase gespielt werden.');
  }
  pruefeKeineAusstehendeReaktion(zustand);

  const { kartenId, zielSpielerIndex, zielSchlangenId } = optionen ?? {};
  if (!istGueltigeId(kartenId)) {
    throw new Error('Es muss genau eine Handkarte zum Spielen gewählt werden.');
  }
  if (typeof zielSpielerIndex !== 'number' || !Number.isInteger(zielSpielerIndex)) {
    throw new Error('Für Schlangenblockade muss ein Zielspieler gewählt werden.');
  }
  if (!istGueltigeId(zielSchlangenId)) {
    throw new Error('Für Schlangenblockade muss eine Zielschlange gewählt werden.');
  }

  // ÄNDERUNG 03.06.2026: Schlangenblockade darf nur auf fremde Schlangen gelegt werden.
  if (zielSpielerIndex === zustand.aktiverSpielerIndex) {
    throw new Error('Schlangenblockade kann nur auf die Schlange eines anderen Spielers gelegt werden.');
  }

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

  const hatFarbenschutz = zielSpieler.hand.some((k) => istFarbenschutzkarte(k));
  if (hatFarbenschutz) {
    return {
      ...zustandNachAngriff,
      pendingReaktion: {
        typ: 'SchlangenblockadeAbwehr',
        angreifenderSpielerIndex: zustand.aktiverSpielerIndex,
        zielSpielerIndex,
        zielSchlangenId,
        blockadeKartenId: karte.id,
      },
    };
  }

  const blockadeKarte: SonderkarteInfo = {
    typ: 'Sonderkarte',
    id: karte.id,
    name: 'Schlangenblockade',
  };
  return {
    ...zustandNachAngriff,
    ablagestapel: zustandNachAngriff.ablagestapel.filter((abwerfKarte) => abwerfKarte.id !== karte.id),
    spieler: zustandNachAngriff.spieler.map((spieler, index) =>
      index === zielSpielerIndex
        ? {
            ...spieler,
            schlangen: spieler.schlangen.map((schlange) =>
              schlange.id === zielSchlangenId ? { ...schlange, karten: [...schlange.karten, blockadeKarte] } : schlange,
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

  const hatFarbenschutz = zielSpieler.hand.some((k) => istFarbenschutzkarte(k));
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

function fuehreFarbendiebAus(zustand: Spielzustand, pending: PendingFarbendiebAbwehr): Spielzustand {
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

    const blockadeKarte = zustand.ablagestapel.find((karte) => karte.id === pending.blockadeKartenId);
    if (!blockadeKarte) {
      throw new Error('Die ausgewählte Zielkarte ist ungültig.');
    }

    return {
      ...zustand,
      spieler: zustand.spieler.map((spieler, index) =>
        index === pending.zielSpielerIndex
          ? {
              ...spieler,
              schlangen: spieler.schlangen.map((schlange) =>
                schlange.id === pending.zielSchlangenId ? { ...schlange, karten: [...schlange.karten, blockadeKarte] } : schlange,
              ),
            }
          : spieler,
      ),
      ablagestapel: zustand.ablagestapel.filter((karte) => karte.id !== pending.blockadeKartenId),
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
        zielSpielerIndex !== zustand.aktiverSpielerIndex && pruefeFarbenschutzImHaufen(zielSpieler.hand) !== null,
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

export function beendeZug(
  zustand: Spielzustand,
  { pflichtenErfuellt }: { pflichtenErfuellt: boolean } = { pflichtenErfuellt: false },
): Spielzustand {
  if (zustand.zugphase !== 'Zugabschluss') {
    throw new Error('Zug kann nur aus dem Zugabschluss beendet werden.');
  }
  if (pflichtenErfuellt !== true) {
    throw new Error('Zug kann erst beendet werden, wenn alle Zugpflichten erfüllt sind.');
  }
  if (zustand.spieler[zustand.aktiverSpielerIndex].hand.length > HANDKARTENLIMIT) {
    throw new Error('Zug kann erst beendet werden, wenn der aktive Spieler höchstens zehn Handkarten hat.');
  }

  if (zustand.spielphase === 'Endspurt') {
    return beendeZugInEndspurt(zustand);
  }

  const kandidaten = ermittleNaechsteSpielerReihenfolge(zustand.aktiverSpielerIndex, zustand.spieler.length);
  const naechster = findeNaechstenAktivenSpieler(kandidaten, zustand.aussetzenSpielerIndizes);
  if (!naechster) {
    throw new Error('Ungültiger Spielzustand: Kein aktiver Spieler für den nächsten Zug gefunden.');
  }

  const { neueHand, neuerNachziehstapel, spielphase, endrunde } = zieheAufMindesthand(
    { ...zustand, aussetzenSpielerIndizes: naechster.aussetzenSpielerIndizes },
    naechster.aktiverSpielerIndex,
  );
  const neueSpieler = zustand.spieler.map((spieler, index) =>
    index === naechster.aktiverSpielerIndex ? { ...spieler, hand: neueHand } : spieler,
  );

  return {
    ...zustand,
    spieler: neueSpieler,
    nachziehstapel: neuerNachziehstapel,
    spielphase,
    endrunde,
    aussetzenSpielerIndizes: naechster.aussetzenSpielerIndizes,
    aktiverSpielerIndex: naechster.aktiverSpielerIndex,
    zugpflichten: erstelleLeereZugpflichten(),
    zugphase: 'Nachziehphase',
  };
}

function beendeZugInEndspurt(zustand: Spielzustand): Spielzustand {
  const restlicheSpieler = zustand.endrunde.verbleibendeSpielerIndizes.filter(
    (idx) => idx !== zustand.aktiverSpielerIndex,
  );
  const naechster = findeNaechstenAktivenSpieler(restlicheSpieler, zustand.aussetzenSpielerIndizes);

  if (!naechster) {
    return {
      ...zustand,
      spielphase: 'Beendet',
      zugphase: 'Spielende',
      zugpflichten: erstelleLeereZugpflichten(),
      endrunde: { ...zustand.endrunde, verbleibendeSpielerIndizes: [] },
      aussetzenSpielerIndizes: [],
    };
  }

  const { neueHand, neuerNachziehstapel, spielphase } = zieheAufMindesthand(
    { ...zustand, aussetzenSpielerIndizes: naechster.aussetzenSpielerIndizes },
    naechster.aktiverSpielerIndex,
  );

  return {
    ...zustand,
    aktiverSpielerIndex: naechster.aktiverSpielerIndex,
    spieler: zustand.spieler.map((spieler, index) =>
      index === naechster.aktiverSpielerIndex ? { ...spieler, hand: neueHand } : spieler,
    ),
    nachziehstapel: neuerNachziehstapel,
    spielphase,
    zugpflichten: erstelleLeereZugpflichten(),
    zugphase: 'Nachziehphase',
    endrunde: { ...zustand.endrunde, verbleibendeSpielerIndizes: naechster.verbleibendeSpielerIndizes },
    aussetzenSpielerIndizes: naechster.aussetzenSpielerIndizes,
  };
}
