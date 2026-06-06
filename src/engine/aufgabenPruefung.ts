/*
Author: rahn
Datum: 06.06.2026
Version: 1.0
Beschreibung: Aufgabenprüfungsregeln für Schlangentanz – Erkennung und Erfüllung offener Aufgaben im Zug.
*/

import type { AufgabenkarteInfo, Spielkarte, SonderkarteInfo, Spielzustand } from './types';

function istFarbenfusionkarte(karte: Spielkarte | undefined): karte is SonderkarteInfo {
  return karte?.typ === 'Sonderkarte' && karte.name === 'Farbenfusion';
}

function istSonderkarte(karte: Spielkarte | undefined): karte is SonderkarteInfo {
  return karte?.typ === 'Sonderkarte';
}

function aktualisiereAktivenSpieler(
  zustand: Spielzustand,
  patch: Partial<Spielzustand['spieler'][number]>,
): Spielzustand['spieler'] {
  return zustand.spieler.map((spieler, index) =>
    index === zustand.aktiverSpielerIndex ? { ...spieler, ...patch } : spieler,
  );
}

function pruefeFusionsexperte(zustand: Spielzustand): boolean {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  return aktiverSpieler.schlangen.some(
    (schlange) => schlange.karten.filter(istFarbenfusionkarte).length >= 2,
  );
}

function pruefeSchlangenbeschwörer(zustand: Spielzustand): boolean {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  return aktiverSpieler.schlangen.flatMap((s) => s.karten).filter(istSonderkarte).length >= 4;
}

const aufgabePruefungen: Record<string, (zustand: Spielzustand) => boolean> = {
  'aufgabe-06': pruefeFusionsexperte,
  'aufgabe-07': pruefeSchlangenbeschwörer,
};

export function ermittleErfuellteOffeneAufgaben(zustand: Spielzustand): AufgabenkarteInfo[] {
  return zustand.offeneAufgaben.filter((aufgabe) => aufgabePruefungen[aufgabe.id]?.(zustand) ?? false);
}

export function erfuelleOffeneAufgaben(zustand: Spielzustand, erfuellteAufgaben: AufgabenkarteInfo[]): Spielzustand {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  const erfuellteIds = new Set(erfuellteAufgaben.map((aufgabe) => aufgabe.id));
  const offeneAufgaben = zustand.offeneAufgaben.filter((aufgabe) => !erfuellteIds.has(aufgabe.id));
  const nachgezogeneAufgaben = zustand.aufgabenStapel.slice(0, erfuellteAufgaben.length);

  return {
    ...zustand,
    offeneAufgaben: [...offeneAufgaben, ...nachgezogeneAufgaben],
    aufgabenStapel: zustand.aufgabenStapel.slice(erfuellteAufgaben.length),
    spieler: aktualisiereAktivenSpieler(zustand, {
      erfuellteAufgaben: [...aktiverSpieler.erfuellteAufgaben, ...erfuellteAufgaben],
    }),
  };
}
