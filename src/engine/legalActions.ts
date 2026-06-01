/*
Author: rahn
Datum: 01.06.2026
Version: 1.2
Beschreibung: Legal-Action-Validator und -Enumerator für erlaubte Schlangentanz-Spielaktionen. Inkl. R20 Pflicht-Abwurf mangels spielbarer Aktion.
*/

import type { Spielzustand } from './types';
import { MAX_SCHLANGEN_PRO_SPIELER, MAX_KARTEN_PRO_ZUG } from './constants';
import { starteNeueSchlange, legeKarteAnSchlangeAn, werfeKarteMangelsSpielbarerAktionAb } from './turnState';

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

export interface PflichtAbwurfAktion {
  typ: 'PflichtAbwurf';
  spielerId: string;
  handkartenId: string;
}

export type SpielAktion = NeueSchlangeStartenAktion | KarteAnlegenAktion | PflichtAbwurfAktion;

const POSITIONEN = ['links', 'rechts'] as const;

function verboten(grund: string): AktionErgebnis {
  return { erlaubt: false, grund };
}

function hatLegaleSchlangenbauAktionen(zustand: Spielzustand): boolean {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  const farbkarten = aktiverSpieler.hand.filter((k) => k.typ === 'Farbkarte');

  for (const karte of farbkarten) {
    if (pruefeAktion(zustand, { typ: 'NeueSchlangeStarten', spielerId: aktiverSpieler.id, handkartenId: karte.id }).erlaubt) {
      return true;
    }
    for (const schlange of aktiverSpieler.schlangen) {
      for (const position of POSITIONEN) {
        if (pruefeAktion(zustand, { typ: 'KarteAnlegen', spielerId: aktiverSpieler.id, handkartenId: karte.id, schlangenId: schlange.id, position }).erlaubt) {
          return true;
        }
      }
    }
  }
  return false;
}

const PHASE_FEHLER: Record<SpielAktion['typ'], string> = {
  NeueSchlangeStarten: 'Neue Schlangen können nur in der Ausspielphase gestartet werden.',
  KarteAnlegen: 'Karten können nur in der Ausspielphase angelegt werden.',
  PflichtAbwurf: 'Pflicht-Abwurf ist nur in der Ausspielphase erlaubt.',
};

export function pruefeAktion(zustand: Spielzustand, aktion: SpielAktion): AktionErgebnis {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];

  if (aktiverSpieler.id !== aktion.spielerId) {
    return verboten('Nur der aktive Spieler darf diese Aktion ausführen.');
  }

  if (zustand.zugphase !== 'Ausspielphase') {
    return verboten(PHASE_FEHLER[aktion.typ]);
  }

  if (zustand.zugpflichten.gespielteKarten >= MAX_KARTEN_PRO_ZUG) {
    return verboten('Die Ausspielphase darf höchstens zwei gespielte Karten enthalten.');
  }

  const karte = aktiverSpieler.hand.find((k) => k.id === aktion.handkartenId);
  if (!karte) {
    return verboten('Die Karte befindet sich nicht auf der Hand des aktiven Spielers.');
  }

  if (aktion.typ === 'PflichtAbwurf') {
    if (karte.typ === 'Farbkarte' && zustand.zugpflichten.gespielteFarbkarten >= 1) {
      return verboten('Pro Zug darf höchstens eine Farbkarte gespielt werden.');
    }
    if (karte.typ === 'Sonderkarte' && zustand.zugpflichten.gespielteSonderkarten >= 1) {
      return verboten('Pro Zug darf höchstens eine Sonderkarte gespielt werden.');
    }
    if (hatLegaleSchlangenbauAktionen(zustand)) {
      return verboten('Pflicht-Abwurf ist nur erlaubt, wenn keine spielbare Karte verfügbar ist.');
    }
    return { erlaubt: true };
  }

  if (karte.typ === 'Farbkarte' && zustand.zugpflichten.gespielteFarbkarten >= 1) {
    return verboten('Pro Zug darf höchstens eine Farbkarte gespielt werden.');
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

  if (aktionen.length === 0 && zustand.zugpflichten.gespielteKarten < MAX_KARTEN_PRO_ZUG) {
    // ÄNDERUNG 01.06.2026: Pflicht-Abwurf nur nach ausgeschlossenen Schlangenbau-Aktionen anbieten.
    // aktionen.length === 0 belegt hier bereits, dass keine Schlangenbau-Aktion legal ist.
    for (const karte of aktiverSpieler.hand) {
      if (karte.typ === 'Farbkarte' && zustand.zugpflichten.gespielteFarbkarten >= 1) continue;
      if (karte.typ === 'Sonderkarte' && zustand.zugpflichten.gespielteSonderkarten >= 1) continue;
      aktionen.push({ typ: 'PflichtAbwurf', spielerId: aktiverSpieler.id, handkartenId: karte.id });
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
    case 'PflichtAbwurf':
      return werfeKarteMangelsSpielbarerAktionAb(zustand, {
        kartenId: aktion.handkartenId,
        keineSpielbareKarte: true,
      });
  }
}
