/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: Legal-Action-Validator für erlaubte Schlangentanz-Spielaktionen.
*/

import type { Spielzustand } from './types';
import { MAX_SCHLANGEN_PRO_SPIELER } from './constants';

export type AktionErgebnis = { erlaubt: true } | { erlaubt: false; grund: string };

export interface NeueSchlangeStartenAktion {
  typ: 'NeueSchlangeStarten';
  spielerId: string;
  handkartenId: string;
}

export interface KarteAnlegenAktion {
  typ: 'KarteAnlegen';
  spielerId: string;
  handkartenId: string;
  schlangenId: string;
  position: 'links' | 'rechts';
}

export type SpielAktion = NeueSchlangeStartenAktion | KarteAnlegenAktion;

function verboten(grund: string): AktionErgebnis {
  return { erlaubt: false, grund };
}

export function pruefeAktion(zustand: Spielzustand, aktion: SpielAktion): AktionErgebnis {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];

  if (aktiverSpieler.id !== aktion.spielerId) {
    return verboten('Nur der aktive Spieler darf diese Aktion ausführen.');
  }

  if (zustand.zugphase !== 'Ausspielphase') {
    return verboten(
      aktion.typ === 'NeueSchlangeStarten'
        ? 'Neue Schlangen können nur in der Ausspielphase gestartet werden.'
        : 'Karten können nur in der Ausspielphase angelegt werden.',
    );
  }

  const karte = aktiverSpieler.hand.find((k) => k.id === aktion.handkartenId);
  if (!karte) {
    return verboten('Die Karte befindet sich nicht auf der Hand des aktiven Spielers.');
  }

  if (aktion.typ === 'NeueSchlangeStarten') {
    if (karte.typ !== 'Farbkarte') {
      return verboten('Eine neue Schlange kann nur mit einer Farbkarte gestartet werden.');
    }
    if (aktiverSpieler.schlangen.length >= MAX_SCHLANGEN_PRO_SPIELER) {
      return verboten(`Ein Spieler darf maximal ${MAX_SCHLANGEN_PRO_SPIELER} Schlangen haben.`);
    }
    return { erlaubt: true };
  }

  // KarteAnlegen
  if (karte.typ !== 'Farbkarte') {
    return verboten('An eine Schlange kann nur eine Farbkarte angelegt werden.');
  }

  if (aktion.position !== 'links' && aktion.position !== 'rechts') {
    return verboten('Karten können nur links oder rechts angelegt werden.');
  }

  const schlange = aktiverSpieler.schlangen.find((s) => s.id === aktion.schlangenId);
  if (!schlange) {
    return verboten('Schlange nicht gefunden.');
  }

  if (schlange.zustand === 'blockiert') {
    return verboten('Eine blockierte Schlange kann nicht erweitert werden.');
  }

  return { erlaubt: true };
}
