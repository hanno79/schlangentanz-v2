/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: Zugphasen-State-Machine für Schlangentanz – Übergänge zwischen Nachziehphase und Ausspielphase.
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
