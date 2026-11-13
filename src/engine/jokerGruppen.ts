import { ermittleFarbgruppen } from './colorGroups';
import type { Farbgruppe } from './colorGroups';
import { MINDEST_FARBGRUPPEN_LAENGE } from './constants';
import { FARBEN } from './deck';
import type { Farbe, FarbkarteInfo, Schlange, Spielkarte } from './types';

/*
Farbgruppen mit Jokern (A11 Abschnitte 1 und 2, A7.3, A7.7).

Regenbogenschlange und Farbenfusion zählen als Karte einer beliebigen Farbe, und
zwar als die, die dem Spieler insgesamt die meisten Punkte bringt (A11). Mit
Erweiterung gehört der Vielfaltbonus dazu: Gruppenpunkte und Bonus werden
gemeinsam am höchsten. Weil nur der höchste Bonus einer Schlange zählt, hängen die
Jokerfarben beider Schlangen eines Spielers voneinander ab; die Suche läuft
deshalb über alle Schlangen des Spielers zugleich.

Die Suche ist eine dynamische Programmierung über die Karten: Der Zustand ist die
laufende Gruppe (Farbe, Länge bis 3, Punkte, solange sie noch keine 3 Karten hat),
die Farben mit Gruppe in der laufenden Schlange und der höchste Bonus der schon
fertigen Schlangen. Gleiche Zustände werden nur einmal gerechnet; die Laufzeit
wächst mit der Kartenzahl, nicht mit 6^Joker.

Bei gleich guten Möglichkeiten gilt eine feste Wahl (Plan E10, Kriterium 8):
Zuerst liegen möglichst viele Joker in einer Gruppe; eine Regenbogenschlange am
Ende einer Gruppe verlängert sie also, auch wenn das keinen Punkt bringt (A11:
„vervollständigen oder verlängern“). Danach werden die Joker von vorn nach hinten
festgelegt, Schlange für Schlange, und jeder bekommt die erste Farbe in der
Reihenfolge Blau, Rot, Gelb, Violett, Braun, Grün, mit der das Beste noch
erreichbar ist. Die Summe ist in jedem Fall dieselbe; die Wahl legt nur fest, wie
die Aufschlüsselung aussieht.

Offen (Teil D noch ohne Antwort, Regelfrage G9): Drei Joker nebeneinander gelten
hier wörtlich nach A11 als drei Karten derselben Farbe und damit als Gruppe.
*/

export type Jokerart = 'Regenbogenschlange' | 'Farbenfusion';

export type GewerteteGruppe = Farbgruppe & { punkte: number };

export interface JokerFarbe {
  karteId: string;
  art: Jokerart;
  /** Die Farbe, als die der Joker zählt; `null`, wenn er in keiner Gruppe liegt und deshalb nichts bewirkt. */
  farbe: Farbe | null;
}

export interface SchlangenWertung {
  schlangenId: string;
  gruppen: GewerteteGruppe[];
  gruppenPunkte: number;
  joker: JokerFarbe[];
  /** Die Farben mit mindestens einer Gruppe in dieser Schlange, in der Reihenfolge von `FARBEN`. */
  vielfaltFarben: Farbe[];
  /** Der Vielfaltbonus dieser Schlange; `null` ohne Erweiterung. */
  vielfaltBonus: number | null;
}

export interface FarbgruppenErgebnis {
  schlangen: SchlangenWertung[];
  gruppenPunkte: number;
  /** Der höchste Vielfaltbonus einer Schlange; `null` ohne Erweiterung. */
  vielfaltBonus: number | null;
}

/** A11: Höchster Vielfaltbonus, ab 5 Farben. */
const HOECHSTER_VIELFALTBONUS = 4;

/** A11: 2, 3, 4, 5 und mehr Farben mit gültigen Gruppen bringen 1, 2, 3, 4 Bonuspunkte. */
export function vielfaltBonusFuer(anzahlFarben: number): number {
  return anzahlFarben < 2 ? 0 : Math.min(anzahlFarben - 1, HOECHSTER_VIELFALTBONUS);
}

/** Ein Glied der Suche. `farbe` ist ein Index in `FARBEN`. */
type Glied =
  | { art: 'farbe'; farbe: number; punkte: number }
  | { art: 'joker'; karteId: string; punkte: number }
  | { art: 'sperre' }
  | { art: 'schlangenende' };

interface Lage {
  /** Farbe der laufenden Gruppe, `-1` ohne. */
  farbe: number;
  /** Länge der laufenden Gruppe, ab `MINDEST_FARBGRUPPEN_LAENGE` nicht weiter gezählt. */
  laenge: number;
  /** Punkte der laufenden Gruppe, solange sie noch zu kurz ist. */
  offen: number;
  /** Joker in der laufenden Gruppe, solange sie noch zu kurz ist. */
  offeneJoker: number;
  /** Farben mit Gruppe in der laufenden Schlange, als Bitmaske. */
  farben: number;
  /** Der höchste Vielfaltbonus der schon fertigen Schlangen. */
  bonus: number;
}

const START: Lage = { farbe: -1, laenge: 0, offen: 0, offeneJoker: 0, farben: 0, bonus: 0 };

function istJoker(karte: Spielkarte): karte is Spielkarte & { typ: 'Sonderkarte'; name: Jokerart } {
  return karte.typ === 'Sonderkarte' && (karte.name === 'Regenbogenschlange' || karte.name === 'Farbenfusion');
}

/** A7.3: Die Regenbogenschlange bringt keine Punkte. A7.7: Die Farbenfusion bringt die Punkte der beiden Karten darunter. */
function jokerPunkte(schlange: Schlange, karte: Spielkarte & { name: Jokerart }): number {
  if (karte.name === 'Regenbogenschlange') return 0;
  const fusion = schlange.fusionen.find((eintrag) => eintrag.karteId === karte.id);
  if (fusion === undefined) {
    throw new Error(`Unter der Farbenfusion ${karte.id} liegen keine Karten; ihre Punkte sind unbekannt.`);
  }
  return fusion.unter[0].punkte + fusion.unter[1].punkte;
}

function farbIndex(farbe: Farbe): number {
  const index = FARBEN.indexOf(farbe);
  if (index < 0) throw new Error(`Unbekannte Farbe in der Wertung: ${farbe}`);
  return index;
}

function zuGliedern(schlangen: readonly Schlange[]): Glied[] {
  return schlangen.flatMap((schlange): Glied[] => [
    ...schlange.karten.map((karte): Glied => {
      if (karte.typ === 'Farbkarte') return { art: 'farbe', farbe: farbIndex(karte.farbe), punkte: karte.punkte };
      if (istJoker(karte)) return { art: 'joker', karteId: karte.id, punkte: jokerPunkte(schlange, karte) };
      return { art: 'sperre' };
    }),
    { art: 'schlangenende' },
  ]);
}

function anzahlBits(maske: number): number {
  let anzahl = 0;
  for (let rest = maske; rest > 0; rest &= rest - 1) anzahl += 1;
  return anzahl;
}

/** Was eine Karte sicher einbringt: Punkte und, nur für die feste Wahl, Joker in einer Gruppe. */
interface Ertrag {
  punkte: number;
  joker: number;
}

const NICHTS: Ertrag = { punkte: 0, joker: 0 };

/** Legt eine Karte der Farbe `farbe` an die laufende Gruppe. */
function lege(lage: Lage, farbe: number, punkte: number, joker: number, mitVielfalt: boolean): [Lage, Ertrag] {
  if (farbe !== lage.farbe) return [{ ...lage, farbe, laenge: 1, offen: punkte, offeneJoker: joker }, NICHTS];
  if (lage.laenge >= MINDEST_FARBGRUPPEN_LAENGE) return [lage, { punkte, joker }];
  const offen = lage.offen + punkte;
  const offeneJoker = lage.offeneJoker + joker;
  if (lage.laenge + 1 < MINDEST_FARBGRUPPEN_LAENGE) return [{ ...lage, laenge: lage.laenge + 1, offen, offeneJoker }, NICHTS];
  const farben = mitVielfalt ? lage.farben | (1 << farbe) : 0;
  return [{ ...lage, laenge: MINDEST_FARBGRUPPEN_LAENGE, offen: 0, offeneJoker: 0, farben }, { punkte: offen, joker: offeneJoker }];
}

function unterbreche(lage: Lage): Lage {
  return { ...lage, farbe: -1, laenge: 0, offen: 0, offeneJoker: 0 };
}

function beendeSchlange(lage: Lage, mitVielfalt: boolean): Lage {
  const bonus = mitVielfalt ? Math.max(lage.bonus, vielfaltBonusFuer(anzahlBits(lage.farben))) : 0;
  return { ...START, bonus };
}

/** Schranke für `Lage.offen`: höchstens zwei Karten zu je 6 Punkten (Farbenfusion aus zwei grünen Karten). */
const OFFEN_SCHRANKE = 32;

/** Wählt für jeden Joker (nach Karten-Id) eine Farbe, sodass Gruppenpunkte plus Vielfaltbonus am höchsten sind. */
function waehleJokerfarben(glieder: readonly Glied[], mitVielfalt: boolean): Map<string, Farbe> {
  const merker = new Map<number, number>();
  // Ein Wert ist Summe × GEWICHT + Joker in Gruppen; so entscheidet die Jokerzahl nur bei gleicher Summe.
  const GEWICHT = glieder.filter((glied) => glied.art === 'joker').length + 1;

  /** Packt die Lage eindeutig in eine Zahl; jeder Faktor ist die Zahl möglicher Werte des folgenden Feldes. */
  function schluessel(stelle: number, lage: Lage): number {
    const lauf = ((stelle * (FARBEN.length + 1) + lage.farbe + 1) * (MINDEST_FARBGRUPPEN_LAENGE + 1) + lage.laenge) * MINDEST_FARBGRUPPEN_LAENGE;
    const offen = (lauf + lage.offeneJoker) * OFFEN_SCHRANKE + lage.offen;
    return (offen * (1 << FARBEN.length) + lage.farben) * (HOECHSTER_VIELFALTBONUS + 1) + lage.bonus;
  }

  function wert(ertrag: Ertrag): number {
    return ertrag.punkte * GEWICHT + ertrag.joker;
  }

  function nachfolger(stelle: number, lage: Lage): Array<{ farbe: number; lage: Lage; gewinn: number }> {
    const glied = glieder[stelle];
    switch (glied.art) {
      case 'farbe': {
        const [neu, ertrag] = lege(lage, glied.farbe, glied.punkte, 0, mitVielfalt);
        return [{ farbe: glied.farbe, lage: neu, gewinn: wert(ertrag) }];
      }
      case 'joker':
        return FARBEN.map((_, farbe) => {
          const [neu, ertrag] = lege(lage, farbe, glied.punkte, 1, mitVielfalt);
          return { farbe, lage: neu, gewinn: wert(ertrag) };
        });
      case 'sperre':
        return [{ farbe: -1, lage: unterbreche(lage), gewinn: 0 }];
      case 'schlangenende':
        return [{ farbe: -1, lage: beendeSchlange(lage, mitVielfalt), gewinn: 0 }];
    }
  }

  function bester(stelle: number, lage: Lage): number {
    if (stelle === glieder.length) return lage.bonus * GEWICHT;
    const key = schluessel(stelle, lage);
    const bekannt = merker.get(key);
    if (bekannt !== undefined) return bekannt;
    let wert = Number.NEGATIVE_INFINITY;
    for (const schritt of nachfolger(stelle, lage)) wert = Math.max(wert, schritt.gewinn + bester(stelle + 1, schritt.lage));
    merker.set(key, wert);
    return wert;
  }

  const farben = new Map<string, Farbe>();
  let lage = START;
  for (let stelle = 0; stelle < glieder.length; stelle++) {
    const ziel = bester(stelle, lage);
    const gewaehlt = nachfolger(stelle, lage).find((schritt) => schritt.gewinn + bester(stelle + 1, schritt.lage) === ziel);
    if (gewaehlt === undefined) throw new Error('Wertung: Die beste Jokerbelegung liess sich nicht nachvollziehen.');
    const glied = glieder[stelle];
    if (glied.art === 'joker') farben.set(glied.karteId, FARBEN[gewaehlt.farbe]);
    lage = gewaehlt.lage;
  }
  return farben;
}

/**
 * Die Gruppen einer Schlange, wenn jeder Joker die gewählte Farbe hat: Joker werden dafür zu Farbkarten
 * ihrer Farbe mit ihren Punkten, andere Sonderkarten bleiben und unterbrechen (A11).
 */
function werteSchlange(schlange: Schlange, jokerfarben: ReadonlyMap<string, Farbe>, mitVielfalt: boolean): SchlangenWertung {
  const gewertet = schlange.karten.map((karte): Spielkarte => {
    if (!istJoker(karte)) return karte;
    const farbe = jokerfarben.get(karte.id);
    if (farbe === undefined) throw new Error(`Wertung: Der Joker ${karte.id} hat keine Farbe bekommen.`);
    return { typ: 'Farbkarte', id: karte.id, farbe, punkte: jokerPunkte(schlange, karte) };
  });
  const gruppen = ermittleFarbgruppen({ ...schlange, karten: gewertet }).map((gruppe) => ({
    ...gruppe,
    punkte: gewertet.slice(gruppe.startIndex, gruppe.endIndex + 1).reduce((summe, karte) => summe + (karte as FarbkarteInfo).punkte, 0),
  }));
  const inGruppe = new Set(gruppen.flatMap((gruppe) => gruppe.kartenIds));
  const joker = schlange.karten.filter(istJoker).map((karte) => ({
    karteId: karte.id,
    art: karte.name,
    farbe: inGruppe.has(karte.id) ? (jokerfarben.get(karte.id) ?? null) : null,
  }));
  const vielfaltFarben = FARBEN.filter((farbe) => gruppen.some((gruppe) => gruppe.farbe === farbe));
  return {
    schlangenId: schlange.id,
    gruppen,
    gruppenPunkte: gruppen.reduce((summe, gruppe) => summe + gruppe.punkte, 0),
    joker,
    vielfaltFarben,
    vielfaltBonus: mitVielfalt ? vielfaltBonusFuer(vielfaltFarben.length) : null,
  };
}

/**
 * Wertet die Farbgruppen aller Schlangen eines Spielers (A11 Abschnitte 1 und 2).
 * `mitVielfalt` ist die Erweiterung: dann zählt der Vielfaltbonus mit, auch bei der Wahl der Jokerfarben.
 */
export function werteSchlangen(schlangen: readonly Schlange[], mitVielfalt: boolean): FarbgruppenErgebnis {
  const jokerfarben = waehleJokerfarben(zuGliedern(schlangen), mitVielfalt);
  const gewertet = schlangen.map((schlange) => werteSchlange(schlange, jokerfarben, mitVielfalt));
  return {
    schlangen: gewertet,
    gruppenPunkte: gewertet.reduce((summe, schlange) => summe + schlange.gruppenPunkte, 0),
    vielfaltBonus: mitVielfalt ? Math.max(0, ...gewertet.map((schlange) => schlange.vielfaltBonus ?? 0)) : null,
  };
}
