/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: Gemeinsame Typen für den Schlangentanz-Spielzustand.
*/

export type Farbe = 'Blau' | 'Rot' | 'Gelb' | 'Violett' | 'Braun' | 'Grün';

export type Steuerung = 'Mensch' | 'KI';

export type Zugphase =
  | 'Nachziehphase'
  | 'Ausspielphase'
  | 'Aufgabenpruefung'
  | 'Zugabschluss'
  | 'Spielende';

export type Spielphase = 'Normal' | 'Endspurt' | 'Beendet';

export type SchlangenZustand = 'aktiv' | 'blockiert' | 'geschuetzt';

export interface FarbkarteInfo {
  typ: 'Farbkarte';
  id: string;
  farbe: Farbe;
  punkte: number;
  vielfaltbonusIgnorieren?: boolean;
}

export interface SonderkarteInfo {
  typ: 'Sonderkarte';
  id: string;
  name: string;
}

export interface AufgabenkarteInfo {
  typ: 'Aufgabenkarte';
  id: string;
  name: string;
  punkte: number;
  bedingung: string;
}

export type Spielkarte = FarbkarteInfo | SonderkarteInfo;

export interface Schlange {
  id: string;
  karten: Spielkarte[];
  zustand: SchlangenZustand;
  farbenfusionen?: { kartenId: string; punkte: number }[];
}

export interface Spieler {
  id: string;
  name: string;
  steuerung: Steuerung;
  hand: Spielkarte[];
  schlangen: Schlange[];
  erfuellteAufgaben: AufgabenkarteInfo[];
  geheimeAufgabe: AufgabenkarteInfo | null;
}

export interface PendingSchlangengrubeAbwehr {
  typ: 'SchlangengrubeAbwehr';
  angreifenderSpielerIndex: number;
  zielSpielerIndex: number;
}

export interface PendingVerdopplerAbwehr {
  typ: 'VerdopplerAbwehr';
  angreifenderSpielerIndex: number;
  verbleibendeSpielerIndizes: number[];
}

export interface PendingSchlangenblockadeAbwehr {
  typ: 'SchlangenblockadeAbwehr';
  angreifenderSpielerIndex: number;
  zielSpielerIndex: number;
  zielSchlangenId: string;
  blockadeKartenId: string;
}

export interface PendingFarbendiebAbwehr {
  typ: 'FarbendiebAbwehr';
  angreifenderSpielerIndex: number;
  zielSpielerIndex: number;
  zielSchlangenId: string;
  zielKartenId: string;
  eigeneSchlangenId: string;
  einfügeIndex: number;
}

export interface PendingSchlangenfrassAbwehr {
  typ: 'SchlangenfrassAbwehr';
  angreifenderSpielerIndex: number;
  verbleibendeZiele: { spielerIndex: number; schlangenId: string; kartenId: string }[];
}

export type PendingReaktion =
  | PendingSchlangengrubeAbwehr
  | PendingSchlangenblockadeAbwehr
  | PendingFarbendiebAbwehr
  | PendingSchlangenfrassAbwehr
  | PendingVerdopplerAbwehr;

export interface Spielzustand {
  version: 1;
  spieler: Spieler[];
  aktiverSpielerIndex: number;
  zugphase: Zugphase;
  zugpflichten: {
    gespielteKarten: number;
    gespielteFarbkarten: number;
    gespielteSonderkarten: number;
    verdopplerBonusAktiv?: boolean;
    farbenfusionGespielt?: boolean;
  };
  spielphase: Spielphase;
  nachziehstapel: Spielkarte[];
  ablagestapel: Spielkarte[];
  aussetzenSpielerIndizes: number[];
  offeneAufgaben: AufgabenkarteInfo[];
  aufgabenStapel: AufgabenkarteInfo[];
  endrunde: {
    ausloeserSpielerIndex: number | null;
    verbleibendeSpielerIndizes: number[];
  };
  pendingReaktion: PendingReaktion | null;
}
