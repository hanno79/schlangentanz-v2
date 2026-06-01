/*
Author: rahn
Datum: 31.05.2026
Version: 1.1
Beschreibung: Legal-Action-Validator und -Enumerator für erlaubte Schlangentanz-Spielaktionen.
*/

import type { Spielzustand } from './types';
import { MAX_SCHLANGEN_PRO_SPIELER } from './constants';
import { starteNeueSchlange, legeKarteAnSchlangeAn } from './turnState';

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

const POSITIONEN = ['links', 'rechts'] as const;

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

  if (zustand.zugpflichten.gespielteKarten >= 2) {
    return verboten('Die Ausspielphase darf höchstens zwei gespielte Karten enthalten.');
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

export function ermittleLegaleAktionen(zustand: Spielzustand): SpielAktion[] {
  if (zustand.zugphase !== 'Ausspielphase') return [];

  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  const farbkarten = aktiverSpieler.hand.filter((k) => k.typ === 'Farbkarte');
  const aktionen: SpielAktion[] = [];

  for (const karte of farbkarten) {
    const kandidat: NeueSchlangeStartenAktion = {
      typ: 'NeueSchlangeStarten',
      spielerId: aktiverSpieler.id,
      handkartenId: karte.id,
    };
    if (pruefeAktion(zustand, kandidat).erlaubt) {
      aktionen.push(kandidat);
    }
  }

  for (const karte of farbkarten) {
    for (const schlange of aktiverSpieler.schlangen) {
      for (const position of POSITIONEN) {
        const kandidat: KarteAnlegenAktion = {
          typ: 'KarteAnlegen',
          spielerId: aktiverSpieler.id,
          handkartenId: karte.id,
          schlangenId: schlange.id,
          position,
        };
        if (pruefeAktion(zustand, kandidat).erlaubt) {
          aktionen.push(kandidat);
        }
      }
    }
  }

  return aktionen;
}

export function anwendeAktion(zustand: Spielzustand, aktion: SpielAktion): Spielzustand {
  const pruefung = pruefeAktion(zustand, aktion);
  if (!pruefung.erlaubt) {
    throw new Error(pruefung.grund);
  }

  switch (aktion.typ) {
    case 'NeueSchlangeStarten':
      return starteNeueSchlange(zustand, { kartenId: aktion.handkartenId });
    case 'KarteAnlegen':
      return legeKarteAnSchlangeAn(zustand, {
        kartenId: aktion.handkartenId,
        schlangenId: aktion.schlangenId,
        position: aktion.position,
      });
  }
}
