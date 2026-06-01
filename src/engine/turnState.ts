/*
Author: rahn
Datum: 31.05.2026
Version: 1.6
Beschreibung: Zugphasen-State-Machine für Schlangentanz – Übergänge zwischen Nachziehphase, Ausspielphase, Aufgabenprüfung und Zugabschluss. Inkl. Überhand-Abwurf, Pflichtprüfung im Zugabschluss (R2.5), Neue Schlange starten (R3.1) und Farbkarte anlegen (R3.2).
*/

import { HANDKARTENLIMIT, MINDESTHANDKARTEN, MAX_SCHLANGEN_PRO_SPIELER } from './constants';
import type { Spielkarte, Spielzustand, Spielphase } from './types';

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

function pruefeSpielkartenLimit(zustand: Spielzustand, kartentyp: Spielkarte['typ']): void {
  if (zustand.zugpflichten.gespielteKarten >= 2) {
    throw new Error('Die Ausspielphase darf höchstens zwei gespielte Karten enthalten.');
  }
  if (kartentyp === 'Farbkarte' && zustand.zugpflichten.gespielteFarbkarten >= 1) {
    throw new Error('Pro Zug darf höchstens eine Farbkarte gespielt werden.');
  }
  if (kartentyp === 'Sonderkarte' && zustand.zugpflichten.gespielteSonderkarten >= 1) {
    throw new Error('Pro Zug darf höchstens eine Sonderkarte gespielt werden.');
  }
}

function inkrementiereSpieleKarten(
  zustand: Spielzustand,
  neueSpieler: Spielzustand['spieler'],
  kartentyp: Spielkarte['typ'],
): Spielzustand {
  return {
    ...zustand,
    spieler: neueSpieler,
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
  return { gespielteKarten: 0, gespielteFarbkarten: 0, gespielteSonderkarten: 0 } as const;
}

function pruefeKartenartZaehler(zustand: Spielzustand): void {
  const { gespielteKarten, gespielteFarbkarten, gespielteSonderkarten } = zustand.zugpflichten;
  if (gespielteFarbkarten > 1) {
    throw new Error('Pro Zug darf höchstens eine Farbkarte gespielt werden.');
  }
  if (gespielteSonderkarten > 1) {
    throw new Error('Pro Zug darf höchstens eine Sonderkarte gespielt werden.');
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

export function starteAusspielphase(zustand: Spielzustand): Spielzustand {
  if (zustand.zugphase !== 'Nachziehphase') {
    throw new Error('Ausspielphase kann nur aus der Nachziehphase gestartet werden.');
  }

  if (zustand.spieler[zustand.aktiverSpielerIndex].hand.length >= MINDESTHANDKARTEN) {
    return { ...zustand, zugphase: 'Ausspielphase' };
  }

  const neuerNachziehstapel = [...zustand.nachziehstapel];
  const neueHand = [...zustand.spieler[zustand.aktiverSpielerIndex].hand];

  while (neueHand.length < MINDESTHANDKARTEN && neuerNachziehstapel.length > 0) {
    neueHand.push(neuerNachziehstapel.shift()!);
  }

  const wirdEndspurt = zustand.nachziehstapel.length > 0 && neuerNachziehstapel.length === 0;
  const finaleSpielphase: Spielphase = wirdEndspurt ? 'Endspurt' : zustand.spielphase;
  const finaleEndrunde = wirdEndspurt
    ? {
        ausloeserSpielerIndex: zustand.aktiverSpielerIndex,
        verbleibendeSpielerIndizes: berechneEndrundenSpieler(zustand.aktiverSpielerIndex, zustand.spieler.length),
      }
    : zustand.endrunde;

  const neueSpieler = aktualisiereAktivenSpieler(zustand, { hand: neueHand });

  return {
    ...zustand,
    spieler: neueSpieler,
    nachziehstapel: neuerNachziehstapel,
    spielphase: finaleSpielphase,
    endrunde: finaleEndrunde,
    zugphase: 'Ausspielphase',
  };
}

export function beendeAusspielphase(
  zustand: Spielzustand,
): Spielzustand {
  if (zustand.zugphase !== 'Ausspielphase') {
    throw new Error('Ausspielphase kann nur aus der Ausspielphase beendet werden.');
  }
  const ausgespielteKarten = zustand.zugpflichten.gespielteKarten;
  if (!Number.isInteger(ausgespielteKarten)) {
    throw new Error('Die Anzahl ausgespielter Karten muss eine ganze Zahl sein.');
  }
  if (ausgespielteKarten < 1) {
    throw new Error('Die Ausspielphase darf erst nach mindestens einer gespielten Karte beendet werden.');
  }
  if (ausgespielteKarten > 2) {
    throw new Error('Die Ausspielphase darf höchstens zwei gespielte Karten enthalten.');
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
  return { ...zustand, zugphase: 'Zugabschluss' };
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

  const naechsterSpielerIndex = (zustand.aktiverSpielerIndex + 1) % zustand.spieler.length;
  return {
    ...zustand,
    aktiverSpielerIndex: naechsterSpielerIndex,
    zugpflichten: erstelleLeereZugpflichten(),
    zugphase: 'Nachziehphase',
  };
}

function beendeZugInEndspurt(zustand: Spielzustand): Spielzustand {
  const neueVerbleibende = zustand.endrunde.verbleibendeSpielerIndizes.filter(
    (idx) => idx !== zustand.aktiverSpielerIndex,
  );

  if (neueVerbleibende.length === 0) {
    return {
      ...zustand,
      spielphase: 'Beendet',
      zugphase: 'Spielende',
      zugpflichten: erstelleLeereZugpflichten(),
      endrunde: { ...zustand.endrunde, verbleibendeSpielerIndizes: [] },
    };
  }

  return {
    ...zustand,
    aktiverSpielerIndex: neueVerbleibende[0],
    zugpflichten: erstelleLeereZugpflichten(),
    zugphase: 'Nachziehphase',
    endrunde: { ...zustand.endrunde, verbleibendeSpielerIndizes: neueVerbleibende },
  };
}
