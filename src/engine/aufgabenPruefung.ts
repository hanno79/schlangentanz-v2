/*
Author: rahn
Datum: 06.06.2026
Version: 1.6
Beschreibung: Aufgabenprüfungsregeln für Schlangentanz – Erkennung und Erfüllung offener Aufgaben im Zug.
Änderung v1.1: pruefeFarbharmonie (aufgabe-02) hinzugefügt.
Änderung v1.2: pruefeFarbenpracht (aufgabe-01) hinzugefügt.
Änderung v1.3: pruefeSymmetriemeister (aufgabe-12) hinzugefügt.
Änderung v1.4: pruefeSchlangenbaendiger (aufgabe-10) hinzugefügt.
Änderung v1.5: pruefeSchlangenrepertoire (aufgabe-09) hinzugefügt.
Änderung v1.6: pruefeSchlangenmeister (aufgabe-08) hinzugefügt.
Änderung v1.7: pruefeSchlangentanz (aufgabe-11) über Schlangenhäutung-Dreiergruppen-Historie hinzugefügt.
*/

import type { AufgabenkarteInfo, Farbe, Schlange, Spielkarte, SonderkarteInfo, Spielzustand } from './types';
import { ermittleFarbgruppen } from './colorGroups';

const ALLE_FARBEN = ['Rot', 'Blau', 'Gelb', 'Grün', 'Violett', 'Braun'] as const;

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

function pruefeSchlangenrepertoire(zustand: Spielzustand): boolean {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  return new Set(aktiverSpieler.ausgespielteSonderkartenNamen).size >= 5;
}

export interface FarbkombinationFortschritt {
  farbe: Farbe | null;
  anzahl: number;
  fehlendeKarten: number;
  bereit: boolean;
}

export function ermittleFarbkombinationFortschritt(schlange: Schlange): FarbkombinationFortschritt {
  const farbzaehler = new Map<Farbe, number>();
  for (const karte of schlange.karten) {
    if (karte.typ !== 'Farbkarte') continue;
    farbzaehler.set(karte.farbe, (farbzaehler.get(karte.farbe) ?? 0) + 1);
  }

  const [farbe, anzahl] = Array.from(farbzaehler.entries()).sort((a, b) => b[1] - a[1])[0] ?? [null, 0];
  const fehlendeKarten = Math.max(0, 5 - anzahl);
  return { farbe, anzahl, fehlendeKarten, bereit: fehlendeKarten === 0 };
}

function pruefeFarbkombination(zustand: Spielzustand): boolean {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  return aktiverSpieler.schlangen.some((schlange) => ermittleFarbkombinationFortschritt(schlange).bereit);
}

function pruefeGelberSchatz(zustand: Spielzustand): boolean {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  return aktiverSpieler.schlangen.some((schlange) =>
    ermittleFarbgruppen(schlange).some((gruppe) => gruppe.farbe === 'Gelb' && gruppe.laenge >= 6),
  );
}

function pruefeLilaRiese(zustand: Spielzustand): boolean {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  return aktiverSpieler.schlangen.some((schlange) =>
    ermittleFarbgruppen(schlange).some((gruppe) => gruppe.farbe === 'Violett'),
  );
}

function pruefeFensterVielfalt(zustand: Spielzustand, fenster: number): boolean {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  return aktiverSpieler.schlangen.some((schlange) => {
    const laufend: string[] = [];
    for (const karte of schlange.karten) {
      if (karte.typ === 'Farbkarte') {
        laufend.push(karte.farbe);
        if (laufend.length >= fenster && new Set(laufend.slice(-fenster)).size === fenster) return true;
      } else {
        laufend.length = 0;
      }
    }
    return false;
  });
}

function pruefeFarbvielfalt(zustand: Spielzustand): boolean {
  return pruefeFensterVielfalt(zustand, 6);
}

function pruefeFarbwechsler(zustand: Spielzustand): boolean {
  return pruefeFensterVielfalt(zustand, 4);
}

function pruefeFarbenpracht(zustand: Spielzustand): boolean {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  const farbzaehler: Record<string, number> = {};
  for (const schlange of aktiverSpieler.schlangen) {
    for (const karte of schlange.karten) {
      if (karte.typ !== 'Farbkarte') continue;
      farbzaehler[karte.farbe] = (farbzaehler[karte.farbe] ?? 0) + 1;
    }
  }
  return ALLE_FARBEN.every((farbe) => (farbzaehler[farbe] ?? 0) >= 2);
}

function pruefeSymmetriemeister(zustand: Spielzustand): boolean {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  return aktiverSpieler.schlangen.some((schlange) => {
    const n = schlange.karten.length;
    if (n < 8 || n % 2 !== 0) return false;
    return schlange.karten.slice(0, n / 2).every((karte, i) => {
      const spiegelkarte = schlange.karten[n - 1 - i];
      return (
        karte.typ === 'Farbkarte' &&
        spiegelkarte.typ === 'Farbkarte' &&
        karte.farbe === spiegelkarte.farbe
      );
    });
  });
}

function hatWiederholendesMuster(farben: string[]): boolean {
  const n = farben.length;
  for (let L = 3; L <= Math.floor(n / 2); L++) {
    for (let i = 0; i + 2 * L <= n; i++) {
      const muster = farben.slice(i, i + L);
      if (muster.every((f, j) => f === farben[i + L + j]) && new Set(muster).size >= 3) return true;
    }
  }
  return false;
}

function pruefeSchlangenbaendiger(zustand: Spielzustand): boolean {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  return aktiverSpieler.schlangen.some((schlange) => {
    let laufend: string[] = [];
    for (const karte of schlange.karten) {
      if (karte.typ === 'Farbkarte') {
        laufend.push(karte.farbe);
      } else {
        if (hatWiederholendesMuster(laufend)) return true;
        laufend = [];
      }
    }
    return hatWiederholendesMuster(laufend);
  });
}

function pruefeSchlangenmeister(zustand: Spielzustand): boolean {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  // length zählt alle Plays inklusive Duplikate – bewusst kein Set.size wie bei der ersten Bedingung
  if (aktiverSpieler.ausgespielteSonderkartenNamen.length < 4) return false;
  const verschiedeneSonderkarten = new Set(
    aktiverSpieler.schlangen.flatMap((s) => s.karten).filter(istSonderkarte).map((k) => k.name),
  );
  return verschiedeneSonderkarten.size >= 2;
}

function pruefeSchlangentanz(zustand: Spielzustand): boolean {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  // ÄNDERUNG [07.06.2026]: R97 prüft die neue Historie statt aktuelle Farbreihenfolge zu interpretieren.
  return aktiverSpieler.schlangenhaeutungDreiergruppen >= 2;
}

function pruefeFarbharmonie(zustand: Spielzustand): boolean {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  const farbenMitDreiergruppe = new Set(
    aktiverSpieler.schlangen
      .flatMap((schlange) => ermittleFarbgruppen(schlange))
      .map((gruppe) => gruppe.farbe),
  );
  return ALLE_FARBEN.every((farbe) => farbenMitDreiergruppe.has(farbe));
}

const aufgabePruefungen: Record<string, (zustand: Spielzustand) => boolean> = {
  'aufgabe-01': pruefeFarbenpracht,
  'aufgabe-02': pruefeFarbharmonie,
  'aufgabe-08': pruefeSchlangenmeister,
  'aufgabe-10': pruefeSchlangenbaendiger,
  'aufgabe-12': pruefeSymmetriemeister,
  'aufgabe-03': pruefeFarbkombination,
  'aufgabe-04': pruefeFarbvielfalt,
  'aufgabe-05': pruefeFarbwechsler,
  'aufgabe-06': pruefeFusionsexperte,
  'aufgabe-07': pruefeSchlangenbeschwörer,
  'aufgabe-09': pruefeSchlangenrepertoire,
  'aufgabe-11': pruefeSchlangentanz,
  'aufgabe-13': pruefeGelberSchatz,
  'aufgabe-14': pruefeLilaRiese,
};

export function ermittleErfuellteOffeneAufgaben(zustand: Spielzustand): AufgabenkarteInfo[] {
  return zustand.offeneAufgaben.filter((aufgabe) => aufgabePruefungen[aufgabe.id]?.(zustand) ?? false);
}

// ÄNDERUNG [05.07.2026]: K4 — prüft die geheime Aufgabe des aktiven Spielers gegen seine Schlangen.
export function pruefeGeheimeAufgabe(zustand: Spielzustand): boolean {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  return aufgabePruefungen[aktiverSpieler.geheimeAufgabe.id]?.(zustand) ?? false;
}

export function erfuelleOffeneAufgaben(zustand: Spielzustand, erfuellteAufgaben: AufgabenkarteInfo[]): Spielzustand {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  const erfuellteIds = new Set(erfuellteAufgaben.map((aufgabe) => aufgabe.id));
  const offeneAufgaben = zustand.offeneAufgaben.filter((aufgabe) => !erfuellteIds.has(aufgabe.id));
  const nachgezogeneAufgaben = zustand.aufgabenStapel.slice(0, erfuellteAufgaben.length);

  // ÄNDERUNG [05.07.2026]: K5 — im Endspurt erfüllte offene Aufgaben für die Verdopplung merken.
  const patch: Partial<Spielzustand['spieler'][number]> = {
    erfuellteAufgaben: [...aktiverSpieler.erfuellteAufgaben, ...erfuellteAufgaben],
  };
  if (zustand.spielphase === 'Endspurt') {
    patch.endspurtVerdoppelteAufgabenIds = [
      ...(aktiverSpieler.endspurtVerdoppelteAufgabenIds ?? []),
      ...erfuellteAufgaben.map((aufgabe) => aufgabe.id),
    ];
  }

  return {
    ...zustand,
    offeneAufgaben: [...offeneAufgaben, ...nachgezogeneAufgaben],
    aufgabenStapel: zustand.aufgabenStapel.slice(erfuellteAufgaben.length),
    spieler: aktualisiereAktivenSpieler(zustand, patch),
  };
}
