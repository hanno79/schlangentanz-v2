/*
Author: rahn
Datum: 31.05.2026
Version: 1.2
Beschreibung: Zugphasen-State-Machine für Schlangentanz – Übergänge zwischen Nachziehphase, Ausspielphase, Aufgabenprüfung und Zugabschluss.
*/

import { MINDESTHANDKARTEN } from './constants';
import type { Spielzustand, Spielphase } from './types';

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

  const neueSpieler = zustand.spieler.map((spieler, index) =>
    index === zustand.aktiverSpielerIndex ? { ...spieler, hand: neueHand } : spieler,
  );

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
  { ausgespielteKarten }: { ausgespielteKarten: number },
): Spielzustand {
  if (zustand.zugphase !== 'Ausspielphase') {
    throw new Error('Ausspielphase kann nur aus der Ausspielphase beendet werden.');
  }
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
  { aufgabenGeprueft }: { aufgabenGeprueft: boolean },
): Spielzustand {
  if (zustand.zugphase !== 'Aufgabenpruefung') {
    throw new Error('Aufgabenprüfung kann nur aus der Aufgabenprüfung beendet werden.');
  }
  if (aufgabenGeprueft !== true) {
    throw new Error('Die Aufgabenprüfung darf erst nach geprüften Aufgaben beendet werden.');
  }
  return { ...zustand, zugphase: 'Zugabschluss' };
}
