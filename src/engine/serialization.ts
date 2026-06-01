/*
Author: rahn
Datum: 31.05.2026
Version: 1.0
Beschreibung: Deterministische Serialisierung und Validierung von Spielzuständen.
*/

import type {
  AufgabenkarteInfo,
  Farbe,
  SchlangenZustand,
  Spielkarte,
  Spielphase,
  Spieler,
  Spielzustand,
  Steuerung,
  Zugphase,
} from './types';
import { SPIELER_MAX, SPIELER_MIN } from './constants';
import { erstelleHauptdeck } from './deck';
import { erstelleAufgabenStapel } from './aufgabenKarten';

const ZUGPHASEN: ReadonlySet<Zugphase> = new Set([
  'Nachziehphase',
  'Ausspielphase',
  'Aufgabenpruefung',
  'Zugabschluss',
  'Spielende',
]);

const SPIELPHASEN: ReadonlySet<Spielphase> = new Set(['Normal', 'Endspurt', 'Beendet']);
const FARBEN: ReadonlySet<Farbe> = new Set(['Blau', 'Rot', 'Gelb', 'Violett', 'Braun', 'Grün']);
const SCHLANGEN_ZUSTAENDE: ReadonlySet<SchlangenZustand> = new Set([
  'aktiv',
  'blockiert',
  'geschuetzt',
]);
const STEUERUNGEN: ReadonlySet<Steuerung> = new Set(['Mensch', 'KI']);

export function serialisiere(zustand: Spielzustand): string {
  return serialisiereMaterial(zustand);
}

export function deserialisiere(json: string): Spielzustand {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Ungültiger Spielzustand: JSON konnte nicht geparst werden.');
  }

  validiereSpielzustand(parsed);
  return parsed;
}

function sortiereStabil(wert: unknown): unknown {
  if (Array.isArray(wert)) {
    return wert.map(sortiereStabil);
  }
  if (istObjekt(wert)) {
    return Object.fromEntries(
      Object.keys(wert)
        .sort()
        .map((key) => [key, sortiereStabil(wert[key])]),
    );
  }
  return wert;
}

function validiereSpielzustand(wert: unknown): asserts wert is Spielzustand {
  const obj = erwarteObjekt(wert, 'Spielzustand');
  if (obj['version'] !== 1) {
    throw new Error('Ungültiger Spielzustand: Fehlende oder falsche Versionsnummer.');
  }

  const spieler = erwarteArray(obj['spieler'], 'spieler');
  if (spieler.length < SPIELER_MIN || spieler.length > SPIELER_MAX) {
    throw new Error(`Ungültiger Spielzustand: Spieleranzahl muss ${SPIELER_MIN}–${SPIELER_MAX} sein.`);
  }

  const aktiverSpielerIndex = obj['aktiverSpielerIndex'];
  if (!Number.isInteger(aktiverSpielerIndex)) {
    throw new Error('Ungültiger Spielzustand: Aktiver Spieler fehlt oder ist ungültig.');
  }
  const aktiverIndex = aktiverSpielerIndex as number;
  if (aktiverIndex < 0 || aktiverIndex >= spieler.length) {
    throw new Error('Ungültiger Spielzustand: Aktiver Spieler liegt außerhalb des Spielerbereichs.');
  }

  if (!ZUGPHASEN.has(obj['zugphase'] as Zugphase)) {
    throw new Error('Ungültiger Spielzustand: zugphase ist ungültig.');
  }
  if (!SPIELPHASEN.has(obj['spielphase'] as Spielphase)) {
    throw new Error('Ungültiger Spielzustand: spielphase ist ungültig.');
  }

  const zugphase = obj['zugphase'] as Zugphase;
  const spielphase = obj['spielphase'] as Spielphase;
  if (zugphase === 'Spielende' && spielphase !== 'Beendet') {
    throw new Error('Ungültiger Spielzustand: Spielende-Zugphase ist nur bei Beendet-Spielphase erlaubt.');
  }
  if (spielphase === 'Beendet' && zugphase !== 'Spielende') {
    throw new Error('Ungültiger Spielzustand: Beendet-Spielphase erfordert Spielende-Zugphase.');
  }

  validiereZugpflichten(obj['zugpflichten']);

  const verwendeteIds = new Set<string>();
  for (const einSpieler of spieler) {
    validiereSpieler(einSpieler, verwendeteIds);
  }
  validiereSpielsteuerungsVerteilung(spieler as Spieler[]);

  validiereSpielkartenArray(obj['nachziehstapel'], 'nachziehstapel', verwendeteIds);
  const nachziehstapel = erwarteArray(obj['nachziehstapel'], 'nachziehstapel');
  validiereSpielphaseNachziehstapel(spielphase, nachziehstapel.length);
  validiereSpielkartenArray(obj['ablagestapel'], 'ablagestapel', verwendeteIds);
  validiereAufgabenArray(obj['offeneAufgaben'], 'offeneAufgaben', verwendeteIds);
  validiereAufgabenArray(obj['aufgabenStapel'], 'aufgabenStapel', verwendeteIds);
  validiereEndrunde(obj['endrunde'], spielphase, spieler.length, aktiverIndex);
  validiereKanonischesMaterial(obj as unknown as Spielzustand);
}

function validiereSpielphaseNachziehstapel(spielphase: Spielphase, nachziehstapelLaenge: number): void {
  if (spielphase === 'Normal' && nachziehstapelLaenge === 0) {
    throw new Error('Ungültiger Spielzustand: Normal-Phase erfordert einen nicht leeren Nachziehstapel.');
  }
  if ((spielphase === 'Endspurt' || spielphase === 'Beendet') && nachziehstapelLaenge !== 0) {
    throw new Error('Ungültiger Spielzustand: Endspurt und Spielende erfordern einen leeren Nachziehstapel.');
  }
}

function berechneEndrundenSpieler(ausloeserIndex: number, spielerAnzahl: number): number[] {
  const indizes: number[] = [];
  for (let i = 1; i < spielerAnzahl; i++) {
    indizes.push((ausloeserIndex + i) % spielerAnzahl);
  }
  return indizes;
}

function istSuffix(vollstaendig: number[], verbleibende: unknown[]): boolean {
  const start = vollstaendig.length - verbleibende.length;
  return start >= 0 && verbleibende.every((idx, position) => idx === vollstaendig[start + position]);
}

function validiereEndrunde(wert: unknown, spielphase: Spielphase, spielerAnzahl: number, aktiverIndex: number): void {
  const obj = erwarteObjekt(wert, 'endrunde');
  const ausloeser = obj['ausloeserSpielerIndex'];
  const verbleibende = erwarteArray(obj['verbleibendeSpielerIndizes'], 'endrunde.verbleibendeSpielerIndizes');

  if (ausloeser !== null) {
    if (!Number.isInteger(ausloeser) || (ausloeser as number) < 0 || (ausloeser as number) >= spielerAnzahl) {
      throw new Error('Ungültiger Spielzustand: endrunde.ausloeserSpielerIndex ist kein gültiger Spielerindex.');
    }
  }

  const indizenSet = new Set<number>();
  for (const idx of verbleibende) {
    if (!Number.isInteger(idx) || (idx as number) < 0 || (idx as number) >= spielerAnzahl) {
      throw new Error('Ungültiger Spielzustand: endrunde.verbleibendeSpielerIndizes enthält ungültigen Spielerindex.');
    }
    if (indizenSet.has(idx as number)) {
      throw new Error('Ungültiger Spielzustand: endrunde.verbleibendeSpielerIndizes enthält doppelten Index.');
    }
    indizenSet.add(idx as number);
  }

  if (spielphase === 'Normal') {
    if (ausloeser !== null || verbleibende.length !== 0) {
      throw new Error('Ungültiger Spielzustand: endrunde muss in Normal-Phase leer sein.');
    }
  } else if (spielphase === 'Endspurt') {
    if (ausloeser === null) {
      throw new Error('Ungültiger Spielzustand: endrunde.ausloeserSpielerIndex muss in Endspurt gesetzt sein.');
    }
    const erwarteteEndrunde = berechneEndrundenSpieler(ausloeser as number, spielerAnzahl);
    if (!istSuffix(erwarteteEndrunde, verbleibende)) {
      throw new Error('Ungültiger Spielzustand: endrunde.verbleibendeSpielerIndizes entspricht nicht der Zugreihenfolge.');
    }
    if (verbleibende.length === 0) {
      throw new Error('Ungültiger Spielzustand: endrunde darf im Endspurt nicht leer sein.');
    }
    if (verbleibende.length === erwarteteEndrunde.length) {
      const ersterEndrundenSpieler = verbleibende[0] as number;
      if (aktiverIndex !== ausloeser && aktiverIndex !== ersterEndrundenSpieler) {
        throw new Error('Ungültiger Spielzustand: aktiver Spieler passt nicht zur Endrunde.');
      }
    } else if (aktiverIndex !== verbleibende[0]) {
      throw new Error('Ungültiger Spielzustand: aktiver Spieler passt nicht zur Endrunde.');
    }
  } else if (spielphase === 'Beendet') {
    if (ausloeser === null || verbleibende.length !== 0) {
      throw new Error('Ungültiger Spielzustand: endrunde ist im Beendet-Zustand ungültig.');
    }
  }
}

function validiereZugpflichten(wert: unknown): void {
  const zugpflichten = erwarteObjekt(wert, 'zugpflichten');
  const gespielteKarten = zugpflichten['gespielteKarten'] as number;
  if (!Number.isInteger(gespielteKarten) || gespielteKarten < 0 || gespielteKarten > 2) {
    throw new Error('Ungültiger Spielzustand: gespielte Karten in Zugpflichten sind ungültig.');
  }
}

function validiereSpielsteuerung(wert: unknown): void {
  if (!STEUERUNGEN.has(wert as Steuerung)) {
    throw new Error(
      `Ungültiger Spielzustand: spieler.steuerung fehlt oder ist ungültig (erlaubt: 'Mensch' oder 'KI').`,
    );
  }
}

function validiereSpielsteuerungsVerteilung(spieler: Spieler[]): void {
  const menschen = spieler.filter((einSpieler) => einSpieler.steuerung === 'Mensch');
  if (menschen.length !== 1) {
    throw new Error('Ungültiger Spielzustand: Es muss genau ein menschlicher Spieler vorhanden sein.');
  }
}

function validiereSpieler(wert: unknown, verwendeteIds: Set<string>): asserts wert is Spieler {
  const spieler = erwarteObjekt(wert, 'spieler-Eintrag');
  registriereId(erwarteString(spieler['id'], 'spieler.id'), verwendeteIds);
  erwarteString(spieler['name'], 'spieler.name');
  validiereSpielsteuerung(spieler['steuerung']);
  validiereSpielkartenArray(spieler['hand'], 'spieler.hand', verwendeteIds);
  validiereAufgabenArray(spieler['erfuellteAufgaben'], 'spieler.erfuellteAufgaben', verwendeteIds);

  if (spieler['geheimeAufgabe'] === null) {
    throw new Error('Ungültiger Spielzustand: spieler.geheimeAufgabe darf nicht null sein.');
  }
  validiereAufgabenkarte(spieler['geheimeAufgabe'], 'spieler.geheimeAufgabe', verwendeteIds);

  const schlangen = erwarteArray(spieler['schlangen'], 'spieler.schlangen');
  for (const schlangeWert of schlangen) {
    const schlange = erwarteObjekt(schlangeWert, 'schlange');
    registriereId(erwarteString(schlange['id'], 'schlange.id'), verwendeteIds);
    if (!SCHLANGEN_ZUSTAENDE.has(schlange['zustand'] as SchlangenZustand)) {
      throw new Error('Ungültiger Spielzustand: Schlangenzustand ist ungültig.');
    }
    validiereSpielkartenArray(schlange['karten'], 'schlange.karten', verwendeteIds);
  }
}

function validiereSpielkartenArray(
  wert: unknown,
  feldname: string,
  verwendeteIds: Set<string>,
): asserts wert is Spielkarte[] {
  for (const karte of erwarteArray(wert, feldname)) {
    validiereSpielkarte(karte, feldname, verwendeteIds);
  }
}

function validiereAufgabenArray(
  wert: unknown,
  feldname: string,
  verwendeteIds: Set<string>,
): asserts wert is AufgabenkarteInfo[] {
  for (const aufgabe of erwarteArray(wert, feldname)) {
    validiereAufgabenkarte(aufgabe, feldname, verwendeteIds);
  }
}

function validiereSpielkarte(
  wert: unknown,
  feldname: string,
  verwendeteIds: Set<string>,
): asserts wert is Spielkarte {
  const karte = erwarteObjekt(wert, feldname);

  if (karte['typ'] === 'Farbkarte') {
    if (!FARBEN.has(karte['farbe'] as Farbe) || typeof karte['punkte'] !== 'number') {
      throw new Error(`Ungültiger Spielzustand: ${feldname} enthält ungültige Farbkarte.`);
    }
  } else if (karte['typ'] === 'Sonderkarte') {
    erwarteString(karte['name'], `${feldname}.name`);
  } else if (karte['typ'] === 'Aufgabenkarte') {
    throw new Error(`Ungültiger Spielzustand: ${feldname} enthält Aufgabenkarte statt Spielkarte.`);
  } else {
    throw new Error(`Ungültiger Spielzustand: ${feldname} enthält ungültige Spielkarte.`);
  }

  registriereId(erwarteString(karte['id'], `${feldname}.id`), verwendeteIds);
}

function validiereAufgabenkarte(
  wert: unknown,
  feldname: string,
  verwendeteIds: Set<string>,
): asserts wert is AufgabenkarteInfo {
  const aufgabe = erwarteObjekt(wert, feldname);
  if (aufgabe['typ'] !== 'Aufgabenkarte') {
    throw new Error(`Ungültiger Spielzustand: ${feldname} enthält keine Aufgabenkarte.`);
  }
  registriereId(erwarteString(aufgabe['id'], `${feldname}.id`), verwendeteIds);
  erwarteString(aufgabe['name'], `${feldname}.name`);
  erwarteString(aufgabe['bedingung'], `${feldname}.bedingung`);
  if (typeof aufgabe['punkte'] !== 'number' || aufgabe['punkte'] <= 0) {
    throw new Error(`Ungültiger Spielzustand: ${feldname}.punkte ist ungültig.`);
  }
}

function validiereKanonischesSet<T extends { id: string }>(
  erstellen: () => T[],
  sammeln: (z: Spielzustand) => T[],
  bezeichnung: string,
  zustand: Spielzustand,
): void {
  const erwartet = new Map(erstellen().map((x) => [x.id, serialisiereMaterial(x)]));
  const vorhanden = sammeln(zustand);
  if (vorhanden.length !== erwartet.size) {
    throw new Error(`Ungültiger Spielzustand: ${bezeichnung}material ist nicht vollständig.`);
  }
  for (const item of vorhanden) {
    if (erwartet.get(item.id) !== serialisiereMaterial(item)) {
      throw new Error(`Ungültiger Spielzustand: ${bezeichnung}material enthält nicht-kanonischen Eintrag.`);
    }
  }
}

function validiereKanonischesMaterial(zustand: Spielzustand): void {
  validiereKanonischesSet(erstelleHauptdeck, sammleSpielkarten, 'Karten', zustand);
  validiereKanonischesSet(erstelleAufgabenStapel, sammleAufgaben, 'Aufgaben', zustand);
}

function sammleSpielkarten(zustand: Spielzustand): Spielkarte[] {
  return [
    ...zustand.spieler.flatMap((spieler) => [
      ...spieler.hand,
      ...spieler.schlangen.flatMap((schlange) => schlange.karten),
    ]),
    ...zustand.nachziehstapel,
    ...zustand.ablagestapel,
  ];
}

function sammleAufgaben(zustand: Spielzustand): AufgabenkarteInfo[] {
  return [
    ...zustand.spieler.flatMap((spieler) => [
      spieler.geheimeAufgabe as AufgabenkarteInfo,
      ...spieler.erfuellteAufgaben,
    ]),
    ...zustand.offeneAufgaben,
    ...zustand.aufgabenStapel,
  ];
}

function serialisiereMaterial(wert: unknown): string {
  return JSON.stringify(sortiereStabil(wert));
}

function registriereId(id: string, verwendeteIds: Set<string>): void {
  if (verwendeteIds.has(id)) {
    throw new Error(`Ungültiger Spielzustand: Doppelte ID ${id}.`);
  }
  verwendeteIds.add(id);
}

function erwarteObjekt(wert: unknown, feldname: string): Record<string, unknown> {
  if (!istObjekt(wert)) {
    throw new Error(`Ungültiger Spielzustand: ${feldname} ist kein gültiges Objekt.`);
  }
  return wert;
}

function erwarteArray(wert: unknown, feldname: string): unknown[] {
  if (!Array.isArray(wert)) {
    throw new Error(`Ungültiger Spielzustand: ${feldname} fehlt oder ist kein Array.`);
  }
  return wert;
}

function erwarteString(wert: unknown, feldname: string): string {
  if (typeof wert !== 'string' || wert.length === 0) {
    throw new Error(`Ungültiger Spielzustand: ${feldname} fehlt oder ist ungültig.`);
  }
  return wert;
}

function istObjekt(wert: unknown): wert is Record<string, unknown> {
  return wert !== null && typeof wert === 'object' && !Array.isArray(wert);
}
