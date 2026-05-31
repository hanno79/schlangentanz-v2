/*
Author: rahn
Datum: 31.05.2026
Version: 1.5
Beschreibung: Zugphasen-State-Machine für Schlangentanz – Übergänge zwischen Nachziehphase, Ausspielphase, Aufgabenprüfung und Zugabschluss. Inkl. Überhand-Abwurf und Pflichtprüfung im Zugabschluss (R2.5).
*/

import { HANDKARTENLIMIT, MINDESTHANDKARTEN, MAX_SCHLANGEN_PRO_SPIELER } from './constants';
import type { Spielzustand, Spielphase } from './types';

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

function ermittleNaechsteFreieSchlangenNummer(spieler: Spielzustand['spieler'][number]): number {
  const belegteIds = new Set(spieler.schlangen.map((schlange) => schlange.id));

  for (let nummer = 1; nummer <= MAX_SCHLANGEN_PRO_SPIELER; nummer += 1) {
    if (!belegteIds.has(erstelleSchlangenId(spieler.id, nummer))) {
      return nummer;
    }
  }

  throw new Error('Alle Schlangennummern sind belegt.');
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

  // Endspurt wird ausgelöst, wenn der Stapel während des Nachziehens leer wird
  const finaleSpielphase: Spielphase =
    zustand.nachziehstapel.length > 0 && neuerNachziehstapel.length === 0
      ? 'Endspurt'
      : zustand.spielphase;

  const neueSpieler = aktualisiereAktivenSpieler(zustand, { hand: neueHand });

  return {
    ...zustand,
    spieler: neueSpieler,
    nachziehstapel: neuerNachziehstapel,
    spielphase: finaleSpielphase,
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

  const neueHand = aktiverSpieler.hand.filter((karte) => karte.id !== kartenId);
  const neueSpieler = aktualisiereAktivenSpieler(zustand, { hand: neueHand });

  return {
    ...zustand,
    spieler: neueSpieler,
    ablagestapel: [...zustand.ablagestapel, abzuwerfendeKarte],
    zugpflichten: { ...zustand.zugpflichten, gespielteKarten: zustand.zugpflichten.gespielteKarten + 1 },
  };
}

export function starteNeueSchlange(
  zustand: Spielzustand,
  optionen: { kartenId?: string } | null = {},
): Spielzustand {
  if (zustand.zugphase !== 'Ausspielphase') {
    throw new Error('Neue Schlangen können nur in der Ausspielphase gestartet werden.');
  }

  const kartenId = optionen?.kartenId;
  if (typeof kartenId !== 'string' || kartenId.trim() === '') {
    throw new Error('Es muss genau eine Handkarte zum Starten gewählt werden.');
  }
  if (zustand.zugpflichten.gespielteKarten >= 2) {
    throw new Error('Die Ausspielphase darf höchstens zwei gespielte Karten enthalten.');
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

  return {
    ...zustand,
    spieler: neueSpieler,
    zugpflichten: { ...zustand.zugpflichten, gespielteKarten: zustand.zugpflichten.gespielteKarten + 1 },
  };
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
  const naechsterSpielerIndex = (zustand.aktiverSpielerIndex + 1) % zustand.spieler.length;
  return {
    ...zustand,
    aktiverSpielerIndex: naechsterSpielerIndex,
    zugpflichten: { gespielteKarten: 0 },
    zugphase: 'Nachziehphase',
  };
}
