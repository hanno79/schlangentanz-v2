/*
Author: rahn
Datum: 31.05.2026
Version: 1.7
Beschreibung: Zugphasen-State-Machine für Schlangentanz – Übergänge zwischen Nachziehphase, Ausspielphase, Aufgabenprüfung und Zugabschluss. Inkl. Überhand-Abwurf, Pflichtprüfung im Zugabschluss (R2.5), Neue Schlange starten (R3.1), Farbkarte anlegen (R3.2).

ÄNDERUNG [04.08.2026]: Punkt 3 — die Datei ist wieder das, was ihre
Beschreibung sagt. Sie trug 1744 Zeilen und darin drei Themen; jetzt sind es
466 und eins. Was hier steht, beantwortet **eine** Frage: Wie geht der Zug
weiter? Die Sonderkartenwirkungen (darunter Farbenschutz/R75, deshalb aus der
Zeile oben gestrichen) stehen in `kartenwirkungen.ts`.
*/

import { HANDKARTENLIMIT, MINDESTHANDKARTEN, MAX_SCHLANGEN_PRO_SPIELER, MAX_KARTEN_PRO_ZUG } from './constants';
import type { Spielkarte, Spielzustand, Spielphase } from './types';
import { ermittleErfuellteOffeneAufgaben, erfuelleOffeneAufgaben, pruefeGeheimeAufgabe } from './aufgabenPruefung';
import { ueberhandAnzahl } from './ueberhand';
import {
  aktualisiereAktivenSpieler,
  berechneEndrundenSpieler,
  ermittleNaechsteFreieSchlangenNummer,
  ermittleNaechsteSpielerReihenfolge,
  erstelleLeereZugpflichten,
  erstelleSchlangenId,
  findeNaechstenAktivenSpieler,
  inkrementiereSpieleKarten,
  istGueltigeId,
  pruefeKartenartZaehler,
  pruefeKeineAusstehendeReaktion,
  pruefeSpielkartenLimit,
} from './zugHelfer';

/* ÄNDERUNG [04.08.2026]: Punkt 3 — `turnState.ts` trug 1744 Zeilen: diese
   Zugphasen-Maschine **plus** acht Kartenwirkungen **plus** die Auflösung der
   Reaktionskette. Geteilt entlang dieser Naht:

   | Datei | Frage, die sie beantwortet |
   |---|---|
   | `turnState.ts` | Wie geht der Zug weiter? |
   | `kartenwirkungen.ts` | Was tut diese Sonderkarte? |
   | `reaktionsaufloesung.ts` | Was wird aus einem Angriff in der Schwebe? |
   | `zugHelfer.ts` | Bausteine, die alle drei brauchen |

   Rein strukturell. Die Zusicherung war „unverändert grün": gleiche Testzahl,
   gleiche Punktzahlen, identisches Verhalten.

   **Die Re-Exporte unten bleiben Absicht.** `turnState.ts` ist der Name, den
   `legalActions.ts` und `index.ts` kennen; ihn zu behalten hält den Slice bei
   der Struktur, statt ihn in eine Umbenennung von Importen quer durchs Repo
   ausufern zu lassen. Wer eine Kartenwirkung ändert, öffnet trotzdem die Datei,
   die sie enthält.

   Sie sind **namentlich** aufgezählt und nicht `export *`. Nachgemessen: Mit
   `export *` traten `legeSchlangenblockadeAb` und `fuehreFarbendiebAus` neu nach
   außen — beide waren vorher modulprivat und mussten nur deshalb exportiert
   werden, weil die Auflösung der Reaktionskette sie jetzt aus einer anderen
   Datei ruft. Ein rein struktureller Slice, der nebenbei die öffentliche Fläche
   verbreitert, ist nicht mehr rein strukturell. Diese Liste ist Zeichen für
   Zeichen die von vor dem Schnitt. */
export {
  spieleFarbendieb,
  spieleFarbenfusion,
  spieleFarbenschutz,
  spieleSchlangenblockade,
  spieleSchlangenfrass,
  spieleSchlangengrube,
  spieleSchlangenhaeutung,
  spieleVerdoppler,
} from './kartenwirkungen';
export { loesePendingReaktionAbwehr, loesePendingReaktionDurchlassen } from './reaktionsaufloesung';
export { istFarbenschutzkarte } from './zugHelfer';


































/**
 * Zieht je eine Karte für die Spieler, die eine Sonderkarte gespielt haben
 * (R2.3a) — im Uhrzeigersinn ab dem aktiven Spieler.
 *
 * ÄNDERUNG [03.08.2026]: Neu. Die Normquelle sagt „Nach Abhandlung aller
 * Effekte werden neue Karten nachgezogen. Das Nachziehen erfolgt ebenfalls im
 * Uhrzeigersinn." Bis dahin zog die Engine ausschließlich beim Zugwechsel.
 *
 * **Im Endspurt wird nicht gezogen** („Nach Spielende wird noch eine Runde
 * gespielt, ohne neue Karten zu ziehen"), und ein leerer Stapel ist kein
 * Fehler, sondern schlicht keine Karte. Läuft der Stapel dabei leer, löst das
 * den Endspurt aus — dieselbe Zusicherung wie beim Nachziehen zu Zugbeginn.
 */
export function zieheOffeneNachziehungen(zustand: Spielzustand): Spielzustand {
  const offen = zustand.nachziehBerechtigteIndizes ?? [];
  if (offen.length === 0) return zustand;
  if (zustand.pendingReaktion !== null) return zustand;
  if (zustand.spielphase !== 'Normal') {
    return { ...zustand, nachziehBerechtigteIndizes: [] };
  }

  const anzahl = zustand.spieler.length;
  const abstand = (index: number) => (index - zustand.aktiverSpielerIndex + anzahl) % anzahl;
  /* ÄNDERUNG [03.08.2026]: **Keine** Deduplizierung mehr (Codex-Review). Wer in
     derselben Abhandlung zwei Karten gespielt hat, zieht zwei — R2.3a sagt „genau
     eine Karte je gespielter Sonderkarte". Erreichbar ist das: Ein Schlangenfrass
     darf zwei Karten desselben Gegners fressen, und der darf beide Male mit
     Farbenschutz abwehren. `sort` ist stabil, Mehrfachnennungen behalten also
     ihre Reihenfolge. */
  const reihenfolge = [...offen].sort((a, b) => abstand(a) - abstand(b));

  const stapel = [...zustand.nachziehstapel];
  const haende = new Map<number, Spielkarte[]>();
  let letzterZieher: number | null = null;
  for (const index of reihenfolge) {
    const karte = stapel.shift();
    if (!karte) break;
    haende.set(index, [...(haende.get(index) ?? zustand.spieler[index].hand), karte]);
    letzterZieher = index;
  }

  /* ÄNDERUNG [03.08.2026]: Auslöser ist, wer die **letzte** Karte gezogen hat
     (Codex-Review) — nicht pauschal der aktive Spieler. `zieheAufMindesthand`
     hält es genauso. Nimmt ein Verteidiger die letzte Karte, gehört ihm die
     Endrunden-Auslösung, sonst bekäme der falsche Spieler den Schlusszug. */
  const wirdEndspurt = zustand.nachziehstapel.length > 0 && stapel.length === 0;
  const ausloeser = letzterZieher ?? zustand.aktiverSpielerIndex;

  return {
    ...zustand,
    spieler: zustand.spieler.map((spieler, index) =>
      haende.has(index) ? { ...spieler, hand: haende.get(index)! } : spieler,
    ),
    nachziehstapel: stapel,
    nachziehBerechtigteIndizes: [],
    spielphase: wirdEndspurt ? 'Endspurt' : zustand.spielphase,
    endrunde: wirdEndspurt
      ? {
          ausloeserSpielerIndex: ausloeser,
          verbleibendeSpielerIndizes: berechneEndrundenSpieler(ausloeser, anzahl),
        }
      : zustand.endrunde,
  };
}

/** Merkt vor, dass dieser Spieler nach Abhandlung aller Effekte nachziehen darf. */
export function merkeNachziehBerechtigt(zustand: Spielzustand, spielerIndex: number): Spielzustand {
  return {
    ...zustand,
    nachziehBerechtigteIndizes: [...(zustand.nachziehBerechtigteIndizes ?? []), spielerIndex],
  };
}

function zieheAufMindesthand(
  zustand: Spielzustand,
  spielerIndex: number,
): { neueHand: Spielkarte[]; neuerNachziehstapel: Spielkarte[]; spielphase: Spielphase; endrunde: Spielzustand['endrunde'] } {
  const neuerNachziehstapel = [...zustand.nachziehstapel];
  const neueHand = [...zustand.spieler[spielerIndex].hand];
  while (neueHand.length < MINDESTHANDKARTEN && neuerNachziehstapel.length > 0) {
    neueHand.push(neuerNachziehstapel.shift()!);
  }
  const wirdEndspurt = zustand.nachziehstapel.length > 0 && neuerNachziehstapel.length === 0;
  const spielphase: Spielphase = wirdEndspurt ? 'Endspurt' : zustand.spielphase;
  const endrunde = wirdEndspurt
    ? {
        ausloeserSpielerIndex: spielerIndex,
        verbleibendeSpielerIndizes: berechneEndrundenSpieler(spielerIndex, zustand.spieler.length),
      }
    : zustand.endrunde;
  return { neueHand, neuerNachziehstapel, spielphase, endrunde };
}

export function starteAusspielphase(zustand: Spielzustand): Spielzustand {
  if (zustand.zugphase !== 'Nachziehphase') {
    throw new Error('Ausspielphase kann nur aus der Nachziehphase gestartet werden.');
  }

  if (zustand.spieler[zustand.aktiverSpielerIndex].hand.length >= MINDESTHANDKARTEN) {
    return { ...zustand, zugphase: 'Ausspielphase' };
  }

  const { neueHand, neuerNachziehstapel, spielphase, endrunde } = zieheAufMindesthand(zustand, zustand.aktiverSpielerIndex);
  const neueSpieler = aktualisiereAktivenSpieler(zustand, { hand: neueHand });

  return {
    ...zustand,
    spieler: neueSpieler,
    nachziehstapel: neuerNachziehstapel,
    spielphase,
    endrunde,
    zugphase: 'Ausspielphase',
  };
}

export function beendeAusspielphase(
  zustand: Spielzustand,
): Spielzustand {
  if (zustand.zugphase !== 'Ausspielphase') {
    throw new Error('Ausspielphase kann nur aus der Ausspielphase beendet werden.');
  }
  if (zustand.pendingReaktion !== null) {
    throw new Error('Ausspielphase kann nicht beendet werden, solange eine Reaktion aussteht.');
  }
  const ausgespielteKarten = zustand.zugpflichten.gespielteKarten;
  if (!Number.isInteger(ausgespielteKarten)) {
    throw new Error('Die Anzahl ausgespielter Karten muss eine ganze Zahl sein.');
  }
  // ÄNDERUNG [05.07.2026]: H2 — ohne Handkarten (etwa nach Farbenschutz-Reaktionen im Endspurt,
  // wo nicht mehr nachgezogen wird) besteht keine Zugpflicht; der Zug ist regulär beendbar.
  const handLeer = zustand.spieler[zustand.aktiverSpielerIndex].hand.length === 0;
  if (ausgespielteKarten < 1 && !handLeer) {
    throw new Error('Die Ausspielphase darf erst nach mindestens einer gespielten Karte beendet werden.');
  }
  const erlaubtesLimit = MAX_KARTEN_PRO_ZUG + (zustand.zugpflichten.verdopplerBonusAktiv === true ? 1 : 0);
  const limitText = erlaubtesLimit === 2 ? 'zwei' : 'drei';
  if (ausgespielteKarten > erlaubtesLimit) {
    throw new Error(`Die Ausspielphase darf höchstens ${limitText} gespielte Karten enthalten.`);
  }
  pruefeKartenartZaehler(zustand);
  return { ...zustand, zugphase: 'Aufgabenpruefung' };
}

export function beendeAufgabenpruefung(
  zustand: Spielzustand,
  { aufgabenGeprueft }: { aufgabenGeprueft: boolean } = { aufgabenGeprueft: false },
): Spielzustand {
  if (zustand.zugphase !== 'Aufgabenpruefung') {
    throw new Error('Aufgabenprüfung kann nur aus der Aufgabenprüfung beendet werden.');
  }
  if (aufgabenGeprueft !== true) {
    throw new Error('Die Aufgabenprüfung darf erst nach geprüften Aufgaben beendet werden.');
  }

  const erfuellteAufgaben = ermittleErfuellteOffeneAufgaben(zustand);
  const nachOffenen = erfuellteAufgaben.length > 0 ? erfuelleOffeneAufgaben(zustand, erfuellteAufgaben) : zustand;

  // ÄNDERUNG [05.07.2026]: K4 — geheime Aufgabe prüfen und sticky markieren.
  const bereitsErfuellt = nachOffenen.spieler[nachOffenen.aktiverSpielerIndex].geheimeAufgabeErfuellt === true;
  const geheimErfuellt = bereitsErfuellt || pruefeGeheimeAufgabe(nachOffenen);
  const mitGeheim = geheimErfuellt && !bereitsErfuellt
    ? { ...nachOffenen, spieler: aktualisiereAktivenSpieler(nachOffenen, { geheimeAufgabeErfuellt: true }) }
    : nachOffenen;

  return { ...mitGeheim, zugphase: 'Zugabschluss' };
}

export function werfeUeberzaehligeHandkartenAb(
  zustand: Spielzustand,
  { kartenIds }: { kartenIds?: string[] } = {},
): Spielzustand {
  if (zustand.zugphase !== 'Zugabschluss') {
    throw new Error('Überzählige Handkarten können nur im Zugabschluss abgeworfen werden.');
  }

  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  const ueberzaehlig = ueberhandAnzahl(zustand);

  if (ueberzaehlig <= 0) {
    throw new Error('Überzählige Handkarten können nur abgeworfen werden, wenn die Hand das Handkartenlimit überschreitet.');
  }

  if (!Array.isArray(kartenIds) || kartenIds.length !== ueberzaehlig) {
    throw new Error(`Es müssen exakt so viele Handkarten abgeworfen werden, bis höchstens ${HANDKARTENLIMIT} Handkarten übrig sind.`);
  }

  const abzuwerfenSet = new Set(kartenIds);
  const abgeworfeneKarten = aktiverSpieler.hand.filter((karte) => abzuwerfenSet.has(karte.id));
  if (abgeworfeneKarten.length !== kartenIds.length) {
    throw new Error('Es können nur Handkarten des aktiven Spielers abgeworfen werden.');
  }
  const neueHand = aktiverSpieler.hand.filter((karte) => !abzuwerfenSet.has(karte.id));

  const neueSpieler = aktualisiereAktivenSpieler(zustand, { hand: neueHand });

  return {
    ...zustand,
    spieler: neueSpieler,
    ablagestapel: [...zustand.ablagestapel, ...abgeworfeneKarten],
  };
}

export function werfeKarteMangelsSpielbarerAktionAb(
  zustand: Spielzustand,
  { kartenId, keineSpielbareKarte }: { kartenId?: string; keineSpielbareKarte?: boolean } = {},
): Spielzustand {
  if (zustand.zugphase !== 'Ausspielphase') {
    throw new Error('Pflicht-Abwurf ohne spielbare Karte ist nur in der Ausspielphase erlaubt.');
  }
  if (typeof kartenId !== 'string' || kartenId === '') {
    throw new Error('Es muss genau eine abzuwerfende Handkarte gewählt werden.');
  }
  if (keineSpielbareKarte !== true) {
    throw new Error('Pflicht-Abwurf ist nur erlaubt, wenn keine spielbare Karte verfügbar ist.');
  }
  pruefeKeineAusstehendeReaktion(zustand);

  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  const abzuwerfendeKarte = aktiverSpieler.hand.find((karte) => karte.id === kartenId);
  if (!abzuwerfendeKarte) {
    throw new Error('Es kann nur eine Handkarte des aktiven Spielers abgeworfen werden.');
  }
  pruefeSpielkartenLimit(zustand, abzuwerfendeKarte.typ);

  const neueHand = aktiverSpieler.hand.filter((karte) => karte.id !== kartenId);
  const neueSpieler = aktualisiereAktivenSpieler(zustand, { hand: neueHand });

  return inkrementiereSpieleKarten(
    { ...zustand, ablagestapel: [...zustand.ablagestapel, abzuwerfendeKarte] },
    neueSpieler,
    abzuwerfendeKarte.typ,
  );
}

export function starteNeueSchlange(
  zustand: Spielzustand,
  optionen: { kartenId?: string } | null = {},
): Spielzustand {
  if (zustand.zugphase !== 'Ausspielphase') {
    throw new Error('Neue Schlangen können nur in der Ausspielphase gestartet werden.');
  }
  pruefeKeineAusstehendeReaktion(zustand);

  const kartenId = optionen?.kartenId;
  if (!istGueltigeId(kartenId)) {
    throw new Error('Es muss genau eine Handkarte zum Starten gewählt werden.');
  }

  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];
  if (aktiverSpieler.schlangen.length >= MAX_SCHLANGEN_PRO_SPIELER) {
    throw new Error(`Ein Spieler darf maximal ${MAX_SCHLANGEN_PRO_SPIELER} Schlangen haben.`);
  }

  const karte = aktiverSpieler.hand.find((k) => k.id === kartenId);
  if (!karte) {
    throw new Error('Die Karte befindet sich nicht auf der Hand des aktiven Spielers.');
  }
  if (karte.typ !== 'Farbkarte') {
    throw new Error('Eine neue Schlange kann nur mit einer Farbkarte gestartet werden.');
  }
  pruefeSpielkartenLimit(zustand, karte.typ);

  const neueSchlange = {
    id: erstelleSchlangenId(aktiverSpieler.id, ermittleNaechsteFreieSchlangenNummer(aktiverSpieler)),
    zustand: 'aktiv' as const,
    karten: [karte],
  };
  const neueHand = aktiverSpieler.hand.filter((k) => k.id !== kartenId);
  const neueSpieler = aktualisiereAktivenSpieler(zustand, {
    hand: neueHand,
    schlangen: [...aktiverSpieler.schlangen, neueSchlange],
  });

  return inkrementiereSpieleKarten(zustand, neueSpieler, karte.typ);
}

export function legeKarteAnSchlangeAn(
  zustand: Spielzustand,
  optionen: { kartenId?: string; schlangenId?: string; position?: string } | null = {},
): Spielzustand {
  if (zustand.zugphase !== 'Ausspielphase') {
    throw new Error('Karten können nur in der Ausspielphase angelegt werden.');
  }
  pruefeKeineAusstehendeReaktion(zustand);

  const { kartenId, schlangenId, position } = optionen ?? {};

  if (!istGueltigeId(kartenId) || !istGueltigeId(schlangenId) || !istGueltigeId(position)) {
    throw new Error('Es müssen Handkarte, Schlange und Anlegeposition gewählt werden.');
  }

  if (position !== 'links' && position !== 'rechts') {
    throw new Error('Karten können nur links oder rechts angelegt werden.');
  }

  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex];

  const karte = aktiverSpieler.hand.find((k) => k.id === kartenId);
  if (!karte) {
    throw new Error('Die Karte befindet sich nicht auf der Hand des aktiven Spielers.');
  }
  if (karte.typ !== 'Farbkarte') {
    throw new Error('An eine Schlange kann nur eine Farbkarte angelegt werden.');
  }
  pruefeSpielkartenLimit(zustand, karte.typ);

  const schlange = aktiverSpieler.schlangen.find((s) => s.id === schlangenId);
  if (!schlange) {
    throw new Error('Schlange nicht gefunden.');
  }
  // ÄNDERUNG [02.08.2026]: Gegenstück zur Prüfung in `legalActions.ts` — siehe
  // dort. Kein aktuell umgesetzter Karteneffekt erzeugt `blockiert`
  // (GAME_SPEC.md R3.5a); die Zusicherung bleibt trotzdem stehen.
  if (schlange.zustand === 'blockiert') {
    throw new Error('Eine blockierte Schlange kann nicht erweitert werden.');
  }

  const neueKarten = position === 'links' ? [karte, ...schlange.karten] : [...schlange.karten, karte];
  const neueHand = aktiverSpieler.hand.filter((k) => k.id !== kartenId);
  const neueSpieler = aktualisiereAktivenSpieler(zustand, {
    hand: neueHand,
    schlangen: aktiverSpieler.schlangen.map((s) => (s.id === schlangenId ? { ...s, karten: neueKarten } : s)),
  });

  return inkrementiereSpieleKarten(zustand, neueSpieler, karte.typ);
}













export function beendeZug(
  zustand: Spielzustand,
  { pflichtenErfuellt }: { pflichtenErfuellt: boolean } = { pflichtenErfuellt: false },
): Spielzustand {
  if (zustand.zugphase !== 'Zugabschluss') {
    throw new Error('Zug kann nur aus dem Zugabschluss beendet werden.');
  }
  if (pflichtenErfuellt !== true) {
    throw new Error('Zug kann erst beendet werden, wenn alle Zugpflichten erfüllt sind.');
  }
  if (zustand.spieler[zustand.aktiverSpielerIndex].hand.length > HANDKARTENLIMIT) {
    throw new Error(`Zug kann erst beendet werden, wenn der aktive Spieler höchstens ${HANDKARTENLIMIT} Handkarten hat.`);
  }

  if (zustand.spielphase === 'Endspurt') {
    return beendeZugInEndspurt(zustand);
  }

  const kandidaten = ermittleNaechsteSpielerReihenfolge(zustand.aktiverSpielerIndex, zustand.spieler.length);
  const naechster = findeNaechstenAktivenSpieler(kandidaten, zustand.aussetzenSpielerIndizes);
  if (!naechster) {
    throw new Error('Ungültiger Spielzustand: Kein aktiver Spieler für den nächsten Zug gefunden.');
  }

  const { neueHand, neuerNachziehstapel, spielphase, endrunde } = zieheAufMindesthand(
    { ...zustand, aussetzenSpielerIndizes: naechster.aussetzenSpielerIndizes },
    naechster.aktiverSpielerIndex,
  );
  const neueSpieler = zustand.spieler.map((spieler, index) =>
    index === naechster.aktiverSpielerIndex ? { ...spieler, hand: neueHand } : spieler,
  );

  return {
    ...zustand,
    spieler: neueSpieler,
    nachziehstapel: neuerNachziehstapel,
    spielphase,
    endrunde,
    aussetzenSpielerIndizes: naechster.aussetzenSpielerIndizes,
    aktiverSpielerIndex: naechster.aktiverSpielerIndex,
    zugpflichten: erstelleLeereZugpflichten(),
    zugphase: 'Nachziehphase',
  };
}

function beendeZugInEndspurt(zustand: Spielzustand): Spielzustand {
  const restlicheSpieler = zustand.endrunde.verbleibendeSpielerIndizes.filter(
    (idx) => idx !== zustand.aktiverSpielerIndex,
  );
  const naechster = findeNaechstenAktivenSpieler(restlicheSpieler, zustand.aussetzenSpielerIndizes);

  if (!naechster) {
    return {
      ...zustand,
      spielphase: 'Beendet',
      zugphase: 'Spielende',
      zugpflichten: erstelleLeereZugpflichten(),
      endrunde: { ...zustand.endrunde, verbleibendeSpielerIndizes: [] },
      aussetzenSpielerIndizes: [],
    };
  }

  const { neueHand, neuerNachziehstapel, spielphase } = zieheAufMindesthand(
    { ...zustand, aussetzenSpielerIndizes: naechster.aussetzenSpielerIndizes },
    naechster.aktiverSpielerIndex,
  );

  return {
    ...zustand,
    aktiverSpielerIndex: naechster.aktiverSpielerIndex,
    spieler: zustand.spieler.map((spieler, index) =>
      index === naechster.aktiverSpielerIndex ? { ...spieler, hand: neueHand } : spieler,
    ),
    nachziehstapel: neuerNachziehstapel,
    spielphase,
    zugpflichten: erstelleLeereZugpflichten(),
    zugphase: 'Nachziehphase',
    endrunde: { ...zustand.endrunde, verbleibendeSpielerIndizes: naechster.verbleibendeSpielerIndizes },
    aussetzenSpielerIndizes: naechster.aussetzenSpielerIndizes,
  };
}
