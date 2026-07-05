/*
Author: rahn
Datum: 01.06.2026
Version: 1.3
Beschreibung: Legal-Action-Validator und -Enumerator für erlaubte Schlangentanz-Spielaktionen. Inkl. R20 Pflicht-Abwurf mangels spielbarer Aktion, R75 Farbenschutz.
*/

import type { Spielzustand } from './types';
import { MAX_SCHLANGEN_PRO_SPIELER, MAX_KARTEN_PRO_ZUG } from './constants';
import { starteNeueSchlange, legeKarteAnSchlangeAn, spieleSchlangengrube, spieleSchlangenblockade, spieleVerdoppler, spieleFarbenschutz, spieleFarbendieb, spieleFarbenfusion, spieleSchlangenfrass, spieleSchlangenhaeutung, werfeKarteMangelsSpielbarerAktionAb, istFarbenschutzkarte, loesePendingReaktionAbwehr, loesePendingReaktionDurchlassen } from './turnState';

export type AktionErgebnis = { erlaubt: true } | { erlaubt: false; grund: string };

export interface NichtEnumerierteAktionHinweis {
  typ: 'Schlangenhaeutung';
}

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

export interface SonderkarteSpielenAktion {
  typ: 'SonderkarteSpielen';
  spielerId: string;
  handkartenId: string;
  zielSpielerId: string;
}

export interface SchlangenblockadeSpielenAktion {
  typ: 'SchlangenblockadeSpielen';
  spielerId: string;
  handkartenId: string;
  zielSpielerId: string;
  zielSchlangenId: string;
}

export interface SchlangenblockadeAbwehrenAktion {
  typ: 'SchlangenblockadeAbwehren';
  spielerId: string;
  abwehrHandkartenId: string;
}

export interface SchlangenblockadeDurchlassenAktion {
  typ: 'SchlangenblockadeDurchlassen';
  spielerId: string;
}

export interface FarbendiebAbwehrenAktion {
  typ: 'FarbendiebAbwehren';
  spielerId: string;
  abwehrHandkartenId: string;
}

export interface FarbendiebDurchlassenAktion {
  typ: 'FarbendiebDurchlassen';
  spielerId: string;
}

export interface SchlangenfrassAbwehrenAktion {
  typ: 'SchlangenfrassAbwehren';
  spielerId: string;
  abwehrHandkartenId: string;
}

export interface SchlangenfrassDurchlassenAktion {
  typ: 'SchlangenfrassDurchlassen';
  spielerId: string;
}

export interface SchlangengrubeAbwehrenAktion {
  typ: 'SchlangengrubeAbwehren';
  spielerId: string;
  abwehrHandkartenId: string;
}

export interface SchlangengrubeDurchlassenAktion {
  typ: 'SchlangengrubeDurchlassen';
  spielerId: string;
}

export interface VerdopplerSpielenAktion {
  typ: 'VerdopplerSpielen';
  spielerId: string;
  handkartenId: string;
}

export interface VerdopplerAbwehrenAktion {
  typ: 'VerdopplerAbwehren';
  spielerId: string;
  abwehrHandkartenId: string;
}

export interface VerdopplerDurchlassenAktion {
  typ: 'VerdopplerDurchlassen';
  spielerId: string;
}

export interface FarbenschutzSpielenAktion {
  typ: 'FarbenschutzSpielen';
  spielerId: string;
  handkartenId: string;
  zielSchlangenId: string;
}

export interface FarbenfusionSpielenAktion {
  typ: 'FarbenfusionSpielen';
  spielerId: string;
  handkartenId: string;
  zielSchlangenId: string;
  zielKartenId: string;
}

export interface FarbendiebSpielenAktion {
  typ: 'FarbendiebSpielen';
  spielerId: string;
  handkartenId: string;
  zielSpielerId: string;
  zielSchlangenId: string;
  zielKartenId: string;
  eigeneSchlangenId: string;
  einfügeIndex: number;
}

export interface SchlangenfrassSpielenAktion {
  typ: 'SchlangenfrassSpielen';
  spielerId: string;
  handkartenId: string;
  ziele: { spielerId: string; schlangenId: string; kartenId: string }[];
}

export interface SchlangenhaeutungSpielenAktion {
  typ: 'SchlangenhaeutungSpielen';
  spielerId: string;
  handkartenId: string;
  schlangenId: string;
  kartenIdsInNeuerReihenfolge: string[];
}

export type SpielAktion =
  | NeueSchlangeStartenAktion
  | KarteAnlegenAktion
  | PflichtAbwurfAktion
  | SonderkarteSpielenAktion
  | FarbenschutzSpielenAktion
  | FarbenfusionSpielenAktion
  | FarbendiebSpielenAktion
  | SchlangenfrassSpielenAktion
  | SchlangenhaeutungSpielenAktion
  | SchlangenblockadeSpielenAktion
  | SchlangenblockadeAbwehrenAktion
  | SchlangenblockadeDurchlassenAktion
  | FarbendiebAbwehrenAktion
  | FarbendiebDurchlassenAktion
  | SchlangenfrassAbwehrenAktion
  | SchlangenfrassDurchlassenAktion
  | SchlangengrubeAbwehrenAktion
  | SchlangengrubeDurchlassenAktion
  | VerdopplerSpielenAktion
  | VerdopplerAbwehrenAktion
  | VerdopplerDurchlassenAktion;

const POSITIONEN = ['links', 'rechts'] as const;

function verboten(grund: string): AktionErgebnis {
  return { erlaubt: false, grund };
}

function findeSpielerIndex(zustand: Spielzustand, spielerId: string): number {
  return zustand.spieler.findIndex((spieler) => spieler.id === spielerId);
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

function hatLegaleFarbenschutzAktionen(zustand: Spielzustand): boolean {
  const erlaubteSonderkarten = maxSonderkartenProZug(zustand);
  if (zustand.zugpflichten.gespielteSonderkarten >= erlaubteSonderkarten) {
    return false;
  }
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  if (!aktiverSpieler.hand.some((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Farbenschutz')) {
    return false;
  }
  return aktiverSpieler.schlangen.some((schlange) => schlange.zustand === 'aktiv');
}

function hatLegaleFarbenfusionAktionen(zustand: Spielzustand): boolean {
  const erlaubteSonderkarten = maxSonderkartenProZug(zustand);
  if (zustand.zugpflichten.farbenfusionGespielt === true || zustand.zugpflichten.gespielteSonderkarten >= erlaubteSonderkarten) {
    return false;
  }
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  if (!aktiverSpieler.hand.some((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Farbenfusion')) {
    return false;
  }
  return aktiverSpieler.schlangen.some((schlange) =>
    schlange.karten.some((karte, index) => {
      const naechsteKarte = schlange.karten[index + 1];
      return karte.typ === 'Farbkarte' && naechsteKarte?.typ === 'Farbkarte' && karte.farbe === naechsteKarte.farbe;
    }),
  );
}

function hatLegaleSchlangenhaeutungAktionen(zustand: Spielzustand): boolean {
  const erlaubteSonderkarten = maxSonderkartenProZug(zustand);
  if (zustand.zugpflichten.gespielteSonderkarten >= erlaubteSonderkarten) {
    return false;
  }
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  if (!aktiverSpieler.hand.some((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangenhäutung')) {
    return false;
  }
  return aktiverSpieler.schlangen.some((schlange) => schlange.zustand === 'aktiv' && schlange.karten.length > 1);
}

function istAusspielaktionAllgemeinMoeglich(zustand: Spielzustand): boolean {
  if (zustand.zugphase !== 'Ausspielphase') {
    return false;
  }
  if (zustand.pendingReaktion !== null) {
    return false;
  }
  const erlaubteKarten = MAX_KARTEN_PRO_ZUG + (zustand.zugpflichten.verdopplerBonusAktiv === true ? 1 : 0);
  return zustand.zugpflichten.gespielteKarten < erlaubteKarten;
}

export function ermittleNichtEnumerierteAktionenHinweise(zustand: Spielzustand): NichtEnumerierteAktionHinweis[] {
  if (!istAusspielaktionAllgemeinMoeglich(zustand) || !hatLegaleSchlangenhaeutungAktionen(zustand)) {
    return [];
  }
  return [{ typ: 'Schlangenhaeutung' }];
}

function hatLegaleSchlangenblockadeAktionen(zustand: Spielzustand): boolean {
  const erlaubteSonderkarten = maxSonderkartenProZug(zustand);
  if (zustand.zugpflichten.gespielteSonderkarten >= erlaubteSonderkarten) {
    return false;
  }

  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  if (!aktiverSpieler.hand.some((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangenblockade')) {
    return false;
  }

  return zustand.spieler.some((spieler, index) => {
    if (index === zustand.aktiverSpielerIndex) return false;
    return spieler.schlangen.length > 0;
  });
}

function hatLegaleSchlangengrubeAktionen(zustand: Spielzustand): boolean {
  const erlaubteSonderkarten = maxSonderkartenProZug(zustand);
  if (zustand.zugpflichten.gespielteSonderkarten >= erlaubteSonderkarten) {
    return false;
  }

  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  if (!aktiverSpieler.hand.some((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangengrube')) {
    return false;
  }

  return zustand.spieler.some((_, index) => {
    if (index === zustand.aktiverSpielerIndex) return false;
    if (zustand.spielphase === 'Endspurt') {
      return zustand.endrunde.verbleibendeSpielerIndizes.includes(index);
    }
    return true;
  });
}

function hatLegaleVerdopplerAktionen(zustand: Spielzustand): boolean {
  if (zustand.zugpflichten.gespielteKarten !== 0) {
    return false;
  }
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  return aktiverSpieler.hand.some((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Verdoppler');
}

function hatLegaleSchlangenfrassAktionen(zustand: Spielzustand): boolean {
  const erlaubteSonderkarten = maxSonderkartenProZug(zustand);
  if (zustand.zugpflichten.gespielteSonderkarten >= erlaubteSonderkarten) {
    return false;
  }
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  if (!aktiverSpieler.hand.some((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangenfrass')) {
    return false;
  }
  // ÄNDERUNG [05.07.2026]: K3 — exakt statt überapproximiert: 1-Ziel-Frass braucht eine
  // eigene Kartenposition, 2-Ziel-Frass mind. zwei gegnerische Kartenpositionen.
  const eigeneKarten = aktiverSpieler.schlangen.reduce((summe, schlange) => summe + schlange.karten.length, 0);
  const gegnerKarten = zustand.spieler.reduce(
    (summe, spieler, index) =>
      index === zustand.aktiverSpielerIndex
        ? summe
        : summe + spieler.schlangen.reduce((s, schlange) => s + schlange.karten.length, 0),
    0,
  );
  return eigeneKarten >= 1 || gegnerKarten >= 2;
}

function hatLegaleFarbendiebAktionen(zustand: Spielzustand): boolean {
  const erlaubteSonderkarten = maxSonderkartenProZug(zustand);
  if (zustand.zugpflichten.gespielteSonderkarten >= erlaubteSonderkarten) {
    return false;
  }
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  if (!aktiverSpieler.hand.some((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Farbendieb')) {
    return false;
  }
  // Farbendieb braucht eine eigene Schlange (Einfügeziel) und mind. eine stehlbare
  // gegnerische Farbkarte (K1: nur Farbkarten sind stehlbar).
  if (aktiverSpieler.schlangen.length === 0) {
    return false;
  }
  return zustand.spieler.some(
    (spieler, index) =>
      index !== zustand.aktiverSpielerIndex &&
      spieler.schlangen.some((schlange) => schlange.karten.some((karte) => karte.typ === 'Farbkarte')),
  );
}

function maxFarbkartenProZug(zustand: Spielzustand): number {
  return zustand.zugpflichten.verdopplerBonusAktiv === true ? 2 : 1;
}

function maxSonderkartenProZug(zustand: Spielzustand): number {
  return zustand.zugpflichten.verdopplerBonusAktiv === true ? 2 : 1;
}

const SONDERKARTE_PHASE_FEHLER = 'Sonderkarten können nur in der Ausspielphase gespielt werden.';

type AusspielphasenAktionTyp = Exclude<SpielAktion['typ'], 'SchlangengrubeAbwehren' | 'SchlangengrubeDurchlassen' | 'SchlangenblockadeAbwehren' | 'SchlangenblockadeDurchlassen' | 'FarbendiebAbwehren' | 'FarbendiebDurchlassen' | 'SchlangenfrassAbwehren' | 'SchlangenfrassDurchlassen' | 'VerdopplerAbwehren' | 'VerdopplerDurchlassen'>;
const PHASE_FEHLER: Record<AusspielphasenAktionTyp, string> = {
  NeueSchlangeStarten: 'Neue Schlangen können nur in der Ausspielphase gestartet werden.',
  KarteAnlegen: 'Karten können nur in der Ausspielphase angelegt werden.',
  PflichtAbwurf: 'Pflicht-Abwurf ist nur in der Ausspielphase erlaubt.',
  SonderkarteSpielen: SONDERKARTE_PHASE_FEHLER,
  SchlangenblockadeSpielen: SONDERKARTE_PHASE_FEHLER,
  VerdopplerSpielen: SONDERKARTE_PHASE_FEHLER,
  FarbenschutzSpielen: SONDERKARTE_PHASE_FEHLER,
  FarbenfusionSpielen: SONDERKARTE_PHASE_FEHLER,
  SchlangenhaeutungSpielen: SONDERKARTE_PHASE_FEHLER,
  FarbendiebSpielen: SONDERKARTE_PHASE_FEHLER,
  SchlangenfrassSpielen: SONDERKARTE_PHASE_FEHLER,
};

function pruefeReaktionsAktion(
  zustand: Spielzustand,
  aktion:
    | SchlangenblockadeAbwehrenAktion
    | SchlangenblockadeDurchlassenAktion
    | FarbendiebAbwehrenAktion
    | FarbendiebDurchlassenAktion
    | SchlangenfrassAbwehrenAktion
    | SchlangenfrassDurchlassenAktion
    | SchlangengrubeAbwehrenAktion
    | SchlangengrubeDurchlassenAktion
    | VerdopplerAbwehrenAktion
    | VerdopplerDurchlassenAktion,
): AktionErgebnis {
  if (zustand.pendingReaktion === null) {
    return verboten('Es gibt keine ausstehende Reaktion.');
  }

  const pending = zustand.pendingReaktion;
  if (pending.typ === 'SchlangengrubeAbwehr') {
    const reaktionsSpieler = zustand.spieler[pending.zielSpielerIndex];
    if (reaktionsSpieler.id !== aktion.spielerId) {
      return verboten('Nur der Zielspieler darf diese Reaktion ausführen.');
    }
    if (aktion.typ !== 'SchlangengrubeAbwehren' && aktion.typ !== 'SchlangengrubeDurchlassen') {
      return verboten('Diese Reaktion gehört zu einer anderen Pending-Reaktion.');
    }
    if (aktion.typ === 'SchlangengrubeAbwehren') {
      const abwehrkarte = reaktionsSpieler.hand.find((k) => k.id === aktion.abwehrHandkartenId);
      if (!istFarbenschutzkarte(abwehrkarte)) {
        return verboten('Farbenschutz-Abwehr ist nur mit einer Farbenschutzkarte des Zielspielers erlaubt.');
      }
    }
    return { erlaubt: true };
  }

  if (pending.typ === 'SchlangenblockadeAbwehr') {
    const reaktionsSpieler = zustand.spieler[pending.zielSpielerIndex];
    if (reaktionsSpieler.id !== aktion.spielerId) {
      return verboten('Nur der Zielspieler darf diese Reaktion ausführen.');
    }
    if (aktion.typ !== 'SchlangenblockadeAbwehren' && aktion.typ !== 'SchlangenblockadeDurchlassen') {
      return verboten('Diese Reaktion gehört zu einer anderen Pending-Reaktion.');
    }
    if (aktion.typ === 'SchlangenblockadeAbwehren') {
      const abwehrkarte = reaktionsSpieler.hand.find((k) => k.id === aktion.abwehrHandkartenId);
      if (!istFarbenschutzkarte(abwehrkarte)) {
        return verboten('Farbenschutz-Abwehr ist nur mit einer Farbenschutzkarte des Zielspielers erlaubt.');
      }
    }
    return { erlaubt: true };
  }

  if (pending.typ === 'FarbendiebAbwehr') {
    const reaktionsSpieler = zustand.spieler[pending.zielSpielerIndex];
    if (reaktionsSpieler.id !== aktion.spielerId) {
      return verboten('Nur der Zielspieler darf diese Reaktion ausführen.');
    }
    if (aktion.typ !== 'FarbendiebAbwehren' && aktion.typ !== 'FarbendiebDurchlassen') {
      return verboten('Diese Reaktion gehört zu einer anderen Pending-Reaktion.');
    }
    if (aktion.typ === 'FarbendiebAbwehren') {
      const abwehrkarte = reaktionsSpieler.hand.find((k) => k.id === aktion.abwehrHandkartenId);
      if (!istFarbenschutzkarte(abwehrkarte)) {
        return verboten('Farbenschutz-Abwehr ist nur mit einer Farbenschutzkarte des Zielspielers erlaubt.');
      }
    }
    return { erlaubt: true };
  }

  if (pending.typ === 'SchlangenfrassAbwehr') {
    const reaktionsSpieler = zustand.spieler[pending.verbleibendeZiele[0]?.spielerIndex ?? -1];
    if (reaktionsSpieler === undefined || reaktionsSpieler.id !== aktion.spielerId) {
      return verboten('Nur der aktuelle Reaktionsspieler darf diese Reaktion ausführen.');
    }
    if (aktion.typ !== 'SchlangenfrassAbwehren' && aktion.typ !== 'SchlangenfrassDurchlassen') {
      return verboten('Diese Reaktion gehört zu einer anderen Pending-Reaktion.');
    }
    if (aktion.typ === 'SchlangenfrassAbwehren') {
      const abwehrkarte = reaktionsSpieler.hand.find((k) => k.id === aktion.abwehrHandkartenId);
      if (!istFarbenschutzkarte(abwehrkarte)) {
        return verboten('Farbenschutz-Abwehr ist nur mit einer Farbenschutzkarte des Zielspielers erlaubt.');
      }
    }
    return { erlaubt: true };
  }

  if (pending.typ !== 'VerdopplerAbwehr') {
    return verboten('Diese Reaktion gehört zu einer anderen Pending-Reaktion.');
  }

  const reaktionsSpielerIndex = pending.verbleibendeSpielerIndizes[0];
  if (reaktionsSpielerIndex === undefined) {
    return verboten('Es gibt keine ausstehende Reaktion.');
  }
  const reaktionsSpieler = zustand.spieler[reaktionsSpielerIndex];
  if (reaktionsSpieler.id !== aktion.spielerId) {
    return verboten('Nur der aktuelle Reaktionsspieler darf diese Reaktion ausführen.');
  }
  if (aktion.typ !== 'VerdopplerAbwehren' && aktion.typ !== 'VerdopplerDurchlassen') {
    return verboten('Diese Reaktion gehört zu einer anderen Pending-Reaktion.');
  }
  if (aktion.typ === 'VerdopplerAbwehren') {
    const abwehrkarte = reaktionsSpieler.hand.find((k) => k.id === aktion.abwehrHandkartenId);
    if (!istFarbenschutzkarte(abwehrkarte)) {
      return verboten('Farbenschutz-Abwehr ist nur mit einer Farbenschutzkarte des Reaktionsspielers erlaubt.');
    }
  }
  return { erlaubt: true };
}

export function pruefeAktion(zustand: Spielzustand, aktion: SpielAktion): AktionErgebnis {
  // Reaktionsaktionen umgehen die normale Aktiver-Spieler-Prüfung
  if (aktion.typ === 'SchlangengrubeAbwehren' || aktion.typ === 'SchlangengrubeDurchlassen' || aktion.typ === 'SchlangenblockadeAbwehren' || aktion.typ === 'SchlangenblockadeDurchlassen' || aktion.typ === 'FarbendiebAbwehren' || aktion.typ === 'FarbendiebDurchlassen' || aktion.typ === 'SchlangenfrassAbwehren' || aktion.typ === 'SchlangenfrassDurchlassen' || aktion.typ === 'VerdopplerAbwehren' || aktion.typ === 'VerdopplerDurchlassen') {
    return pruefeReaktionsAktion(zustand, aktion);
  }

  if (zustand.pendingReaktion !== null) {
    return verboten('Es muss zuerst die ausstehende Reaktion des Zielspielers aufgelöst werden.');
  }

  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];

  if (aktiverSpieler.id !== aktion.spielerId) {
    return verboten('Nur der aktive Spieler darf diese Aktion ausführen.');
  }

  if (zustand.zugphase !== 'Ausspielphase') {
    return verboten(PHASE_FEHLER[aktion.typ as AusspielphasenAktionTyp]);
  }

  const erlaubteKarten = MAX_KARTEN_PRO_ZUG + (zustand.zugpflichten.verdopplerBonusAktiv === true ? 1 : 0);
  const erlaubteKartenText = erlaubteKarten === 2 ? 'zwei' : 'drei';
  if (zustand.zugpflichten.gespielteKarten >= erlaubteKarten) {
    return verboten(`Die Ausspielphase darf höchstens ${erlaubteKartenText} gespielte Karten enthalten.`);
  }

  const karte = aktiverSpieler.hand.find((k) => k.id === aktion.handkartenId);
  if (!karte) {
    return verboten('Die Karte befindet sich nicht auf der Hand des aktiven Spielers.');
  }

  if (aktion.typ === 'PflichtAbwurf') {
    const erlaubteFarbkarten = maxFarbkartenProZug(zustand);
    const erlaubteSonderkarten = maxSonderkartenProZug(zustand);
    if (karte.typ === 'Farbkarte' && zustand.zugpflichten.gespielteFarbkarten >= erlaubteFarbkarten) {
      return verboten(`Pro Zug darf höchstens ${erlaubteFarbkarten} Farbkarte${erlaubteFarbkarten === 1 ? '' : 'n'} gespielt werden.`);
    }
    if (karte.typ === 'Sonderkarte' && zustand.zugpflichten.gespielteSonderkarten >= erlaubteSonderkarten) {
      return verboten('Pro Zug darf höchstens eine Sonderkarte gespielt werden.');
    }
    if (hatLegaleSchlangenbauAktionen(zustand) || hatLegaleSchlangenblockadeAktionen(zustand) || hatLegaleSchlangengrubeAktionen(zustand) || hatLegaleFarbenschutzAktionen(zustand) || hatLegaleFarbenfusionAktionen(zustand) || hatLegaleSchlangenhaeutungAktionen(zustand) || hatLegaleSchlangenfrassAktionen(zustand) || hatLegaleFarbendiebAktionen(zustand) || hatLegaleVerdopplerAktionen(zustand)) {
      return verboten('Pflicht-Abwurf ist nur erlaubt, wenn keine spielbare Karte verfügbar ist.');
    }
    return { erlaubt: true };
  }

  if (aktion.typ === 'VerdopplerSpielen') {
    if (karte.typ !== 'Sonderkarte' || karte.name !== 'Verdoppler') {
      return verboten('Verdoppler kann nur mit der Verdoppler-Sonderkarte gespielt werden.');
    }
    if (zustand.zugpflichten.gespielteKarten !== 0) {
      return verboten('Verdoppler kann nur zu Beginn des Zuges gespielt werden.');
    }
    return { erlaubt: true };
  }

  if (aktion.typ === 'SchlangenblockadeSpielen') {
    if (karte.typ !== 'Sonderkarte' || karte.name !== 'Schlangenblockade') {
      return verboten('Schlangenblockade kann nur mit der Schlangenblockade-Sonderkarte gespielt werden.');
    }
    if (zustand.zugpflichten.gespielteSonderkarten >= maxSonderkartenProZug(zustand)) {
      return verboten('Pro Zug darf höchstens eine Sonderkarte gespielt werden.');
    }
    const zielSpielerIndex = findeSpielerIndex(zustand, aktion.zielSpielerId);
    if (zielSpielerIndex < 0) {
      return verboten('Der ausgewählte Zielspieler ist ungültig.');
    }

    // ÄNDERUNG 03.06.2026: Schlangenblockade darf nur auf fremde Schlangen gelegt werden.
    if (zielSpielerIndex === zustand.aktiverSpielerIndex) {
      return verboten('Schlangenblockade kann nur auf eine Schlange eines anderen Spielers gelegt werden.');
    }
    const zielSpieler = zustand.spieler[zielSpielerIndex];
    const zielSchlange = zielSpieler.schlangen.find((s) => s.id === aktion.zielSchlangenId);
    if (!zielSchlange) {
      return verboten('Die ausgewählte Zielschlange ist ungültig.');
    }
    return { erlaubt: true };
  }

  if (aktion.typ === 'SchlangenfrassSpielen') {
    if (karte.typ !== 'Sonderkarte' || karte.name !== 'Schlangenfrass') {
      return verboten('Schlangenfrass kann nur mit der Schlangenfrass-Sonderkarte gespielt werden.');
    }
    if (zustand.zugpflichten.gespielteSonderkarten >= maxSonderkartenProZug(zustand)) {
      return verboten('Pro Zug darf höchstens eine Sonderkarte gespielt werden.');
    }
    if (!Array.isArray(aktion.ziele) || aktion.ziele.length < 1 || aktion.ziele.length > 2) {
      return verboten('Schlangenfrass muss genau eine eigene Karte oder zwei gegnerische Karten haben.');
    }

    const zielkartenIds = new Set(aktion.ziele.map((ziel) => ziel.kartenId));
    if (zielkartenIds.size !== aktion.ziele.length) {
      return verboten('Schlangenfrass darf keine doppelten Zielkarten haben.');
    }

    const zielSpielerIndizes: number[] = [];
    for (const ziel of aktion.ziele) {
      const zielSpielerIndex = findeSpielerIndex(zustand, ziel.spielerId);
      if (zielSpielerIndex < 0) {
        return verboten('Ein Zielspieler ist ungültig.');
      }
      const zielSpieler = zustand.spieler[zielSpielerIndex];
      const zielSchlange = zielSpieler.schlangen.find((s) => s.id === ziel.schlangenId);
      if (!zielSchlange) {
        return verboten('Eine Zielschlange ist ungültig.');
      }
      if (!zielSchlange.karten.some((eintrag) => eintrag.id === ziel.kartenId)) {
        return verboten('Eine Zielkarte ist ungültig.');
      }
      zielSpielerIndizes.push(zielSpielerIndex);
    }

    const alleGleich = zielSpielerIndizes.every((index) => index === zielSpielerIndizes[0]);
    const eigenerSpielerIndex = zustand.aktiverSpielerIndex;
    const alleEigeneSchlange = zielSpielerIndizes.every((index) => index === eigenerSpielerIndex);
    const alleGegner = zielSpielerIndizes.every((index) => index !== eigenerSpielerIndex);

    if (aktion.ziele.length === 1) {
      if (!alleEigeneSchlange) {
        return verboten('Schlangenfrass mit einem Ziel ist nur auf die eigene Schlange erlaubt.');
      }
      return { erlaubt: true };
    }

    if (aktion.ziele.length === 2) {
      if (!alleGegner) {
        return verboten('Schlangenfrass mit zwei Zielen ist nur gegen gegnerische Schlangen erlaubt.');
      }
      return { erlaubt: true };
    }

    if (!alleGleich) {
      return verboten('Schlangenfrass-Ziele müssen zur eigenen Schlange oder zu gegnerischen Schlangen passen.');
    }
    return { erlaubt: true };
  }

  if (aktion.typ === 'SonderkarteSpielen') {
    if (karte.typ !== 'Sonderkarte' || karte.name !== 'Schlangengrube') {
      return verboten('Schlangengrube kann nur mit der Schlangengrube-Sonderkarte gespielt werden.');
    }
    if (zustand.zugpflichten.gespielteSonderkarten >= maxSonderkartenProZug(zustand)) {
      return verboten('Pro Zug darf höchstens eine Sonderkarte gespielt werden.');
    }
    const zielSpielerIndex = findeSpielerIndex(zustand, aktion.zielSpielerId);
    if (zielSpielerIndex < 0) {
      return verboten('Der ausgewählte Zielspieler ist ungültig.');
    }
    if (zielSpielerIndex === zustand.aktiverSpielerIndex) {
      return verboten('Der aktive Spieler kann sich nicht selbst aussetzen.');
    }
    if (zustand.spielphase === 'Endspurt' && !zustand.endrunde.verbleibendeSpielerIndizes.includes(zielSpielerIndex)) {
      return verboten('Der gewählte Zielspieler hat in der Endrunde keinen verbleibenden Zug mehr.');
    }
    return { erlaubt: true };
  }

  if (aktion.typ === 'FarbenfusionSpielen') {
    if (karte.typ !== 'Sonderkarte' || karte.name !== 'Farbenfusion') {
      return verboten('Farbenfusion kann nur mit der Farbenfusion-Sonderkarte gespielt werden.');
    }
    if (zustand.zugpflichten.farbenfusionGespielt === true) {
      return verboten('Pro Zug darf nur eine Farbenfusion durchgeführt werden.');
    }
    if (zustand.zugpflichten.gespielteSonderkarten >= maxSonderkartenProZug(zustand)) {
      return verboten('Pro Zug darf höchstens eine Sonderkarte gespielt werden.');
    }
    const zielSchlange = aktiverSpieler.schlangen.find((s) => s.id === aktion.zielSchlangenId);
    if (!zielSchlange) {
      return verboten('Die ausgewählte Zielschlange ist ungültig.');
    }
    const zielIndex = zielSchlange.karten.findIndex((eintrag) => eintrag.id === aktion.zielKartenId);
    if (zielIndex < 0 || zielIndex >= zielSchlange.karten.length - 1) {
      return verboten('Die ausgewählte Zielkarte ist ungültig.');
    }
    const ersteKarte = zielSchlange.karten[zielIndex];
    const zweiteKarte = zielSchlange.karten[zielIndex + 1];
    if (ersteKarte.typ !== 'Farbkarte' || zweiteKarte.typ !== 'Farbkarte' || ersteKarte.farbe !== zweiteKarte.farbe) {
      return verboten('Farbenfusion kann nur auf zwei nebeneinanderliegenden Karten gleicher Farbe gespielt werden.');
    }
    return { erlaubt: true };
  }

  if (aktion.typ === 'SchlangenhaeutungSpielen') {
    try {
      spieleSchlangenhaeutung(zustand, {
        kartenId: aktion.handkartenId,
        schlangenId: aktion.schlangenId,
        kartenIdsInNeuerReihenfolge: aktion.kartenIdsInNeuerReihenfolge,
      });
      return { erlaubt: true };
    } catch (fehler) {
      return verboten(fehler instanceof Error ? fehler.message : 'Schlangenhäutung ist ungültig.');
    }
  }

  if (aktion.typ === 'FarbenschutzSpielen') {
    if (karte.typ !== 'Sonderkarte' || karte.name !== 'Farbenschutz') {
      return verboten('Farbenschutz kann nur mit der Farbenschutz-Sonderkarte gespielt werden.');
    }
    if (zustand.zugpflichten.gespielteSonderkarten >= maxSonderkartenProZug(zustand)) {
      return verboten('Pro Zug darf höchstens eine Sonderkarte gespielt werden.');
    }
    const zielSchlange = aktiverSpieler.schlangen.find((s) => s.id === aktion.zielSchlangenId);
    if (!zielSchlange) {
      return verboten('Zielschlange nicht gefunden oder gehört nicht dem aktiven Spieler.');
    }
    if (zielSchlange.zustand === 'geschuetzt') {
      return verboten('Eine bereits geschützte Schlange kann nicht erneut geschützt werden.');
    }
    if (zielSchlange.zustand !== 'aktiv') {
      return verboten('Farbenschutz kann nur auf aktive Schlangen angewendet werden.');
    }
    return { erlaubt: true };
  }

  if (aktion.typ === 'FarbendiebSpielen') {
    if (karte.typ !== 'Sonderkarte' || karte.name !== 'Farbendieb') {
      return verboten('Farbendieb kann nur mit der Farbendieb-Sonderkarte gespielt werden.');
    }
    if (zustand.zugpflichten.gespielteSonderkarten >= maxSonderkartenProZug(zustand)) {
      return verboten('Pro Zug darf höchstens eine Sonderkarte gespielt werden.');
    }
    const zielSpielerIndex = findeSpielerIndex(zustand, aktion.zielSpielerId);
    if (zielSpielerIndex < 0) {
      return verboten('Der ausgewählte Zielspieler ist ungültig.');
    }
    if (zielSpielerIndex === zustand.aktiverSpielerIndex) {
      return verboten('Farbendieb kann nur gegen eine Schlange eines anderen Spielers gespielt werden.');
    }
    const zielSpieler = zustand.spieler[zielSpielerIndex];
    const zielSchlange = zielSpieler.schlangen.find((s) => s.id === aktion.zielSchlangenId);
    if (!zielSchlange) {
      return verboten('Die ausgewählte Zielschlange ist ungültig.');
    }
    const zielKarte = zielSchlange.karten.find((eintrag) => eintrag.id === aktion.zielKartenId);
    if (!zielKarte) {
      return verboten('Die ausgewählte Zielkarte ist ungültig.');
    }
    // ÄNDERUNG [05.07.2026]: K1 — nur Farbkarten sind stehlbar.
    if (zielKarte.typ !== 'Farbkarte') {
      return verboten('Farbendieb kann nur eine Farbkarte stehlen.');
    }
    const eigeneSchlange = aktiverSpieler.schlangen.find((s) => s.id === aktion.eigeneSchlangenId);
    if (!eigeneSchlange) {
      return verboten('Die ausgewählte eigene Schlange ist ungültig.');
    }
    if (aktion.einfügeIndex < 0 || aktion.einfügeIndex > eigeneSchlange.karten.length) {
      return verboten('Die gewählte Einfügeposition ist ungültig.');
    }
    return { erlaubt: true };
  }

  if (karte.typ === 'Farbkarte' && zustand.zugpflichten.gespielteFarbkarten >= maxFarbkartenProZug(zustand)) {
    return verboten(`Pro Zug darf höchstens ${maxFarbkartenProZug(zustand)} Farbkarte${maxFarbkartenProZug(zustand) === 1 ? '' : 'n'} gespielt werden.`);
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

  if (aktion.typ !== 'KarteAnlegen') {
    return verboten('Karten können nur an Schlangen angelegt werden.');
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

export function ermittleReaktionsAktionen(zustand: Spielzustand): SpielAktion[] {
  if (zustand.pendingReaktion === null) return [];

  const pending = zustand.pendingReaktion;
  if (pending.typ === 'SchlangengrubeAbwehr' || pending.typ === 'SchlangenblockadeAbwehr') {
    const zielSpieler = zustand.spieler[pending.zielSpielerIndex];
    const farbenschutzkarte = zielSpieler.hand.find(istFarbenschutzkarte);
    if (pending.typ === 'SchlangengrubeAbwehr') {
      const reaktionen: SpielAktion[] = [];
      if (farbenschutzkarte) {
        reaktionen.push({ typ: 'SchlangengrubeAbwehren', spielerId: zielSpieler.id, abwehrHandkartenId: farbenschutzkarte.id } as SchlangengrubeAbwehrenAktion);
      }
      reaktionen.push({ typ: 'SchlangengrubeDurchlassen', spielerId: zielSpieler.id } as SchlangengrubeDurchlassenAktion);
      return reaktionen;
    }
    const reaktionen: SpielAktion[] = [];
    if (farbenschutzkarte) {
      reaktionen.push({ typ: 'SchlangenblockadeAbwehren', spielerId: zielSpieler.id, abwehrHandkartenId: farbenschutzkarte.id } as SchlangenblockadeAbwehrenAktion);
    }
    reaktionen.push({ typ: 'SchlangenblockadeDurchlassen', spielerId: zielSpieler.id } as SchlangenblockadeDurchlassenAktion);
    return reaktionen;
  }

  if (pending.typ === 'FarbendiebAbwehr') {
    const zielSpieler = zustand.spieler[pending.zielSpielerIndex];
    const farbenschutzkarte = zielSpieler.hand.find(istFarbenschutzkarte);
    const reaktionen: SpielAktion[] = [];
    if (farbenschutzkarte) {
      reaktionen.push({ typ: 'FarbendiebAbwehren', spielerId: zielSpieler.id, abwehrHandkartenId: farbenschutzkarte.id } as FarbendiebAbwehrenAktion);
    }
    reaktionen.push({ typ: 'FarbendiebDurchlassen', spielerId: zielSpieler.id } as FarbendiebDurchlassenAktion);
    return reaktionen;
  }

  if (pending.typ === 'SchlangenfrassAbwehr') {
    const ziel = pending.verbleibendeZiele[0];
    if (!ziel) return [];
    const zielSpieler = zustand.spieler[ziel.spielerIndex];
    const farbenschutzkarte = zielSpieler.hand.find(istFarbenschutzkarte);
    const reaktionen: SpielAktion[] = [];
    if (farbenschutzkarte) {
      reaktionen.push({ typ: 'SchlangenfrassAbwehren', spielerId: zielSpieler.id, abwehrHandkartenId: farbenschutzkarte.id } as SchlangenfrassAbwehrenAktion);
    }
    reaktionen.push({ typ: 'SchlangenfrassDurchlassen', spielerId: zielSpieler.id } as SchlangenfrassDurchlassenAktion);
    return reaktionen;
  }

  const verdopplerPending = pending as { typ: 'VerdopplerAbwehr'; angreifenderSpielerIndex: number; verbleibendeSpielerIndizes: number[] };
  const reaktionsSpielerIndex = verdopplerPending.verbleibendeSpielerIndizes[0];
  if (reaktionsSpielerIndex === undefined) return [];
  const reaktionsSpieler = zustand.spieler[reaktionsSpielerIndex];
  const farbenschutzkarte = reaktionsSpieler.hand.find(istFarbenschutzkarte);
  return [
    ...(farbenschutzkarte
      ? [{ typ: 'VerdopplerAbwehren' as const, spielerId: reaktionsSpieler.id, abwehrHandkartenId: farbenschutzkarte.id }]
      : []),
    { typ: 'VerdopplerDurchlassen', spielerId: reaktionsSpieler.id },
  ];
}

export function ermittleLegaleAktionen(zustand: Spielzustand): SpielAktion[] {
  if (zustand.zugphase !== 'Ausspielphase') return [];
  if (zustand.pendingReaktion !== null) return [];

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

  const verdopplerkarten = aktiverSpieler.hand.filter(
    (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Verdoppler',
  );
  for (const karte of verdopplerkarten) {
    const kandidat: VerdopplerSpielenAktion = {
      typ: 'VerdopplerSpielen',
      spielerId: aktiverSpieler.id,
      handkartenId: karte.id,
    };
    if (pruefeAktion(zustand, kandidat).erlaubt) {
      aktionen.push(kandidat);
    }
  }

  const schlangenblockaden = aktiverSpieler.hand.filter(
    (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangenblockade',
  );
  for (const karte of schlangenblockaden) {
    for (const spieler of zustand.spieler) {
      for (const schlange of spieler.schlangen) {
        const kandidat: SchlangenblockadeSpielenAktion = {
          typ: 'SchlangenblockadeSpielen',
          spielerId: aktiverSpieler.id,
          handkartenId: karte.id,
          zielSpielerId: spieler.id,
          zielSchlangenId: schlange.id,
        };
        if (pruefeAktion(zustand, kandidat).erlaubt) {
          aktionen.push(kandidat);
        }
      }
    }
  }

  const schlangengruben = aktiverSpieler.hand.filter(
    (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangengrube',
  );
  for (const karte of schlangengruben) {
    for (const spieler of zustand.spieler) {
      if (spieler.id === aktiverSpieler.id) continue;
      const kandidat: SonderkarteSpielenAktion = {
        typ: 'SonderkarteSpielen',
        spielerId: aktiverSpieler.id,
        handkartenId: karte.id,
        zielSpielerId: spieler.id,
      };
      if (pruefeAktion(zustand, kandidat).erlaubt) {
        aktionen.push(kandidat);
      }
    }
  }

  const farbenschutzkarten = aktiverSpieler.hand.filter(
    (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Farbenschutz',
  );
  for (const karte of farbenschutzkarten) {
    for (const schlange of aktiverSpieler.schlangen) {
      const kandidat: FarbenschutzSpielenAktion = {
        typ: 'FarbenschutzSpielen',
        spielerId: aktiverSpieler.id,
        handkartenId: karte.id,
        zielSchlangenId: schlange.id,
      };
      if (pruefeAktion(zustand, kandidat).erlaubt) {
        aktionen.push(kandidat);
      }
    }
  }

  const farbenfusionkarten = aktiverSpieler.hand.filter(
    (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Farbenfusion',
  );
  for (const karte of farbenfusionkarten) {
    for (const schlange of aktiverSpieler.schlangen) {
      for (let zielIndex = 0; zielIndex < schlange.karten.length - 1; zielIndex += 1) {
        const ersteKarte = schlange.karten[zielIndex];
        const zweiteKarte = schlange.karten[zielIndex + 1];
        if (ersteKarte.typ !== 'Farbkarte' || zweiteKarte.typ !== 'Farbkarte' || ersteKarte.farbe !== zweiteKarte.farbe) {
          continue;
        }
        const kandidat: FarbenfusionSpielenAktion = {
          typ: 'FarbenfusionSpielen',
          spielerId: aktiverSpieler.id,
          handkartenId: karte.id,
          zielSchlangenId: schlange.id,
          zielKartenId: ersteKarte.id,
        };
        if (pruefeAktion(zustand, kandidat).erlaubt) {
          aktionen.push(kandidat);
        }
      }
    }
  }

  const schlangenfrasskarten = aktiverSpieler.hand.filter(
    (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangenfrass',
  );
  for (const karte of schlangenfrasskarten) {
    const moeglicheZiele: { spielerId: string; schlangenId: string; kartenId: string }[] = [];
    for (const spieler of zustand.spieler) {
      for (const schlange of spieler.schlangen) {
        for (const zielKarte of schlange.karten) {
          moeglicheZiele.push({ spielerId: spieler.id, schlangenId: schlange.id, kartenId: zielKarte.id });
        }
      }
    }

    for (const ziel of moeglicheZiele) {
      const kandidat: SchlangenfrassSpielenAktion = {
        typ: 'SchlangenfrassSpielen',
        spielerId: aktiverSpieler.id,
        handkartenId: karte.id,
        ziele: [ziel],
      };
      if (pruefeAktion(zustand, kandidat).erlaubt) {
        aktionen.push(kandidat);
      }
    }

    for (let ersterIndex = 0; ersterIndex < moeglicheZiele.length; ersterIndex += 1) {
      for (let zweiterIndex = ersterIndex + 1; zweiterIndex < moeglicheZiele.length; zweiterIndex += 1) {
        const kandidat: SchlangenfrassSpielenAktion = {
          typ: 'SchlangenfrassSpielen',
          spielerId: aktiverSpieler.id,
          handkartenId: karte.id,
          ziele: [moeglicheZiele[ersterIndex], moeglicheZiele[zweiterIndex]],
        };
        if (pruefeAktion(zustand, kandidat).erlaubt) {
          aktionen.push(kandidat);
        }
      }
    }
  }

  const farbendiebkarten = aktiverSpieler.hand.filter(
    (karte) => karte.typ === 'Sonderkarte' && karte.name === 'Farbendieb',
  );
  for (const karte of farbendiebkarten) {
    for (const zielSpieler of zustand.spieler) {
      if (zielSpieler.id === aktiverSpieler.id) continue;
      for (const zielSchlange of zielSpieler.schlangen) {
        for (const zielKarte of zielSchlange.karten) {
          // ÄNDERUNG [05.07.2026]: K1 — nur Farbkarten sind stehlbar.
          if (zielKarte.typ !== 'Farbkarte') continue;
          for (const eigeneSchlange of aktiverSpieler.schlangen) {
            for (let einfügeIndex = 0; einfügeIndex <= eigeneSchlange.karten.length; einfügeIndex += 1) {
              const kandidat: FarbendiebSpielenAktion = {
                typ: 'FarbendiebSpielen',
                spielerId: aktiverSpieler.id,
                handkartenId: karte.id,
                zielSpielerId: zielSpieler.id,
                zielSchlangenId: zielSchlange.id,
                zielKartenId: zielKarte.id,
                eigeneSchlangenId: eigeneSchlange.id,
                einfügeIndex,
              };
              if (pruefeAktion(zustand, kandidat).erlaubt) {
                aktionen.push(kandidat);
              }
            }
          }
        }
      }
    }
  }

  const erlaubteKarten = MAX_KARTEN_PRO_ZUG + (zustand.zugpflichten.verdopplerBonusAktiv === true ? 1 : 0);
  const hatNichtEnumerierteSonderkartenAktion = hatLegaleSchlangenhaeutungAktionen(zustand);
  if (aktionen.length === 0 && !hatNichtEnumerierteSonderkartenAktion && zustand.zugpflichten.gespielteKarten < erlaubteKarten) {
    // ÄNDERUNG [07.06.2026]: Pflicht-Abwurf bleibt auch bei nicht enumerierter Schlangenhäutung gesperrt.
    // ÄNDERUNG 02.06.2026: Pflicht-Abwurf nur anbieten, wenn keine reguläre Spielaktion legal ist.
    // aktionen.length === 0 belegt hier bereits, dass weder Schlangenbau- noch Sonderkarten-Aktionen legal sind.
    const erlaubteFarbkarten = maxFarbkartenProZug(zustand);
    const erlaubteSonderkarten = maxSonderkartenProZug(zustand);
    for (const karte of aktiverSpieler.hand) {
      if (karte.typ === 'Farbkarte' && zustand.zugpflichten.gespielteFarbkarten >= erlaubteFarbkarten) continue;
      if (karte.typ === 'Sonderkarte' && zustand.zugpflichten.gespielteSonderkarten >= erlaubteSonderkarten) continue;
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
    case 'SonderkarteSpielen':
      return spieleSchlangengrube(zustand, {
        kartenId: aktion.handkartenId,
        zielSpielerIndex: findeSpielerIndex(zustand, aktion.zielSpielerId),
      });
    case 'SchlangenblockadeSpielen':
      return spieleSchlangenblockade(zustand, {
        kartenId: aktion.handkartenId,
        zielSpielerIndex: findeSpielerIndex(zustand, aktion.zielSpielerId),
        zielSchlangenId: aktion.zielSchlangenId,
      });
    case 'VerdopplerSpielen':
      return spieleVerdoppler(zustand, { kartenId: aktion.handkartenId });
    case 'FarbenschutzSpielen':
      return spieleFarbenschutz(zustand, {
        kartenId: aktion.handkartenId,
        zielSchlangenId: aktion.zielSchlangenId,
      });
    case 'FarbenfusionSpielen':
      return spieleFarbenfusion(zustand, {
        kartenId: aktion.handkartenId,
        zielSchlangenId: aktion.zielSchlangenId,
        zielKartenId: aktion.zielKartenId,
      });
    case 'SchlangenhaeutungSpielen':
      return spieleSchlangenhaeutung(zustand, {
        kartenId: aktion.handkartenId,
        schlangenId: aktion.schlangenId,
        kartenIdsInNeuerReihenfolge: aktion.kartenIdsInNeuerReihenfolge,
      });
    case 'SchlangenfrassSpielen':
      return spieleSchlangenfrass(zustand, {
        kartenId: aktion.handkartenId,
        ziele: aktion.ziele,
      });
    case 'FarbendiebSpielen':
      return spieleFarbendieb(zustand, {
        kartenId: aktion.handkartenId,
        zielSpielerIndex: findeSpielerIndex(zustand, aktion.zielSpielerId),
        zielSchlangenId: aktion.zielSchlangenId,
        zielKartenId: aktion.zielKartenId,
        eigeneSchlangenId: aktion.eigeneSchlangenId,
        einfügeIndex: aktion.einfügeIndex,
      });
    case 'PflichtAbwurf':
      return werfeKarteMangelsSpielbarerAktionAb(zustand, {
        kartenId: aktion.handkartenId,
        keineSpielbareKarte: true,
      });
    case 'SchlangengrubeAbwehren':
      return loesePendingReaktionAbwehr(zustand, aktion.spielerId, aktion.abwehrHandkartenId);
    case 'SchlangengrubeDurchlassen':
      return loesePendingReaktionDurchlassen(zustand, aktion.spielerId);
    case 'SchlangenblockadeAbwehren':
      return loesePendingReaktionAbwehr(zustand, aktion.spielerId, aktion.abwehrHandkartenId);
    case 'SchlangenblockadeDurchlassen':
      return loesePendingReaktionDurchlassen(zustand, aktion.spielerId);
    case 'FarbendiebAbwehren':
      return loesePendingReaktionAbwehr(zustand, aktion.spielerId, aktion.abwehrHandkartenId);
    case 'FarbendiebDurchlassen':
      return loesePendingReaktionDurchlassen(zustand, aktion.spielerId);
    case 'SchlangenfrassAbwehren':
      return loesePendingReaktionAbwehr(zustand, aktion.spielerId, aktion.abwehrHandkartenId);
    case 'SchlangenfrassDurchlassen':
      return loesePendingReaktionDurchlassen(zustand, aktion.spielerId);
    case 'VerdopplerAbwehren':
      return loesePendingReaktionAbwehr(zustand, aktion.spielerId, aktion.abwehrHandkartenId);
    case 'VerdopplerDurchlassen':
      return loesePendingReaktionDurchlassen(zustand, aktion.spielerId);
    default:
      throw new Error('Unbekannte Aktion.');
  }
}
