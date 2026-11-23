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
laufende Gruppe (Farbe, Länge bis 3, Punkte und ob eine Karte darin ihre Farbe für
den Vielfaltbonus trägt, beides solange sie noch keine 3 Karten hat), die Farben
für den Vielfaltbonus in der laufenden Schlange und der höchste Bonus der schon
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

Drei Joker nebeneinander gelten als drei Karten derselben Farbe und damit als
Gruppe (G9 → D31); Regenbogenschlangen bringen darin keine Punkte, eine
Farbenfusion die Summe der Karten darunter (D30). Eine Gruppe nur aus
Regenbogenschlangen bringt aber keine Farbe für den Vielfaltbonus (D32). Ob eine
Gruppe aus Regenbogenschlangen und Farbenfusionen als Farbe zählt, ist offen; bis
zur Antwort trägt die Farbenfusion ihre Farbe wie eine Farbkarte (D31).
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
  /** Die Farben, die in dieser Schlange für den Vielfaltbonus zählen (D32), in der Reihenfolge von `FARBEN`. */
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
  | { art: 'joker'; karteId: string; punkte: number; traegtFarbe: boolean }
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
  /** Ob eine Karte der laufenden Gruppe ihre Farbe für den Vielfaltbonus trägt (D32), solange sie noch zu kurz ist. */
  offenBelegt: boolean;
  /** Farben für den Vielfaltbonus in der laufenden Schlange, als Bitmaske. */
  farben: number;
  /** Der höchste Vielfaltbonus der schon fertigen Schlangen. */
  bonus: number;
}

const START: Lage = { farbe: -1, laenge: 0, offen: 0, offeneJoker: 0, offenBelegt: false, farben: 0, bonus: 0 };

export function istJoker(karte: Spielkarte): karte is Spielkarte & { typ: 'Sonderkarte'; name: Jokerart } {
  return karte.typ === 'Sonderkarte' && (karte.name === 'Regenbogenschlange' || karte.name === 'Farbenfusion');
}

/** D32: Eine Regenbogenschlange gibt ihrer Gruppe keine Farbe für den Vielfaltbonus, Farbkarte und Farbenfusion schon. */
function traegtFarbe(karte: Spielkarte): boolean {
  return karte.typ === 'Farbkarte' || (istJoker(karte) && karte.name === 'Farbenfusion');
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
      if (istJoker(karte)) return { art: 'joker', karteId: karte.id, punkte: jokerPunkte(schlange, karte), traegtFarbe: traegtFarbe(karte) };
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

/**
 * Legt eine Karte der Farbe `farbe` an die laufende Gruppe. Die Farbe zählt für den Vielfaltbonus, sobald die Gruppe
 * 3 Karten hat und eine davon ihre Farbe trägt (D32), auch wenn diese erst nach dem dritten Joker kommt.
 */
function lege(lage: Lage, farbe: number, punkte: number, joker: number, traegt: boolean, mitVielfalt: boolean): [Lage, Ertrag] {
  if (farbe !== lage.farbe) return [{ ...lage, farbe, laenge: 1, offen: punkte, offeneJoker: joker, offenBelegt: traegt }, NICHTS];
  const mitFarbe = (belegt: boolean): number => (mitVielfalt && belegt ? lage.farben | (1 << farbe) : lage.farben);
  if (lage.laenge >= MINDEST_FARBGRUPPEN_LAENGE) {
    const farben = mitFarbe(traegt);
    return [farben === lage.farben ? lage : { ...lage, farben }, { punkte, joker }];
  }
  const offen = lage.offen + punkte;
  const offeneJoker = lage.offeneJoker + joker;
  const offenBelegt = lage.offenBelegt || traegt;
  if (lage.laenge + 1 < MINDEST_FARBGRUPPEN_LAENGE) return [{ ...lage, laenge: lage.laenge + 1, offen, offeneJoker, offenBelegt }, NICHTS];
  const fertig = { ...lage, laenge: MINDEST_FARBGRUPPEN_LAENGE, offen: 0, offeneJoker: 0, offenBelegt: false, farben: mitFarbe(offenBelegt) };
  return [fertig, { punkte: offen, joker: offeneJoker }];
}

function unterbreche(lage: Lage): Lage {
  return { ...lage, farbe: -1, laenge: 0, offen: 0, offeneJoker: 0, offenBelegt: false };
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
    const offen = ((lauf + lage.offeneJoker) * OFFEN_SCHRANKE + lage.offen) * 2 + Number(lage.offenBelegt);
    return (offen * (1 << FARBEN.length) + lage.farben) * (HOECHSTER_VIELFALTBONUS + 1) + lage.bonus;
  }

  function wert(ertrag: Ertrag): number {
    return ertrag.punkte * GEWICHT + ertrag.joker;
  }

  function nachfolger(stelle: number, lage: Lage): Array<{ farbe: number; lage: Lage; gewinn: number }> {
    const glied = glieder[stelle];
    switch (glied.art) {
      case 'farbe': {
        const [neu, ertrag] = lege(lage, glied.farbe, glied.punkte, 0, true, mitVielfalt);
        return [{ farbe: glied.farbe, lage: neu, gewinn: wert(ertrag) }];
      }
      case 'joker':
        return FARBEN.map((_, farbe) => {
          const [neu, ertrag] = lege(lage, farbe, glied.punkte, 1, glied.traegtFarbe, mitVielfalt);
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
  const farbtraeger = new Set(schlange.karten.filter(traegtFarbe).map((karte) => karte.id));
  const vielfaltFarben = FARBEN.filter((farbe) =>
    gruppen.some((gruppe) => gruppe.farbe === farbe && gruppe.kartenIds.some((id) => farbtraeger.has(id))),
  );
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

/*
Neue Dreiergruppen durch eine Schlangenhäutung (A9 Nr. 12 „Schlangentanz“, D37).

Eine Dreiergruppe ist eine Farbgruppe aus mindestens drei Karten (A11). Jede
Gruppe von vorher lebt nachher höchstens in einer Gruppe derselben Farbe fort,
in der mit den meisten ihrer Karten; neu ist jede Gruppe, in der keine alte
fortlebt. Eine verlängerte oder stehengebliebene Gruppe ist also nicht neu,
eine Gruppe, die nur eine Karte einer alten Gruppe übernimmt, dagegen schon.
Joker zählen als die Farbe, mit der die Aufgabe erfüllt ist (A9, A7.3, A7.7):
Gesucht wird die Belegung mit den meisten neuen Gruppen, und jeder Joker hat
vor und nach der Häutung dieselbe Farbe, denn bei einer Aufgabe zählt er als
eine Farbe.

Die Suche bleibt klein, weil nur wenige Belegungen Verschiedenes ergeben:
- Eine neue Gruppe enthält eine versetzte Karte. Eine Gruppe ohne solche Karte
  lag schon vorher so da, höchstens länger, und in ihr lebt die alte fort.
- Eine Gruppe mit versetzter Karte reicht vom Abschnitt aus über Joker und
  Farbkarten einer Farbe, aber nie über eine zweite Farbe oder eine Sperre
  hinweg. Joker jenseits davon bleiben ohne Farbe.
- In einem Block nebeneinanderliegender Joker zählt nur, wie viele vorn die
  Farbe des linken Nachbarn und wie viele hinten die des rechten tragen; eine
  andere Farbe verbindet nichts und wirkt wie keine. Der Nachbar am Abschnitt
  hat vorher und nachher verschiedene Farben, beide kommen in Frage.
Die Gruppen selbst erkennt `ermittleFarbgruppen` wie in der Wertung.
*/

/** Die Farbe der Karte an `stelle`, wenn dort eine Farbkarte liegt, sonst `null`. */
function farbeAn(karten: readonly Spielkarte[], stelle: number): Farbe | null {
  const karte = karten[stelle];
  return karte?.typ === 'Farbkarte' ? karte.farbe : null;
}

function istSperre(karte: Spielkarte): boolean {
  return karte.typ === 'Sonderkarte' && !istJoker(karte);
}

/** Die letzte Stelle ab `start` in Richtung `schritt`, bis zu der eine Gruppe mit der Karte an `start` reichen kann. */
function reichweite(karten: readonly Spielkarte[], start: number, schritt: 1 | -1): number {
  let farbe: Farbe | null = null;
  let stelle = start + schritt;
  for (; stelle >= 0 && stelle < karten.length && !istSperre(karten[stelle]); stelle += schritt) {
    const hier = farbeAn(karten, stelle);
    if (hier === null) continue;
    if (farbe !== null && hier !== farbe) break;
    farbe = hier;
  }
  return stelle - schritt;
}

/** Die Belegungen eines Jokerblocks der Länge `laenge`: vorn eine Farbe von links, hinten eine von rechts, dazwischen keine; oder alle gleich. */
function blockBelegungen(laenge: number, links: ReadonlyArray<Farbe | null>, rechts: ReadonlyArray<Farbe | null>): Array<Array<Farbe | null>> {
  const belegungen = new Map<string, Array<Farbe | null>>();
  const nimm = (folge: Array<Farbe | null>) => belegungen.set(folge.join(), folge);
  for (const farbe of new Set([...links, ...rechts])) nimm(Array<Farbe | null>(laenge).fill(farbe));
  for (const links1 of new Set(links)) {
    for (const rechts1 of new Set(rechts)) {
      for (let vorn = 0; vorn <= laenge; vorn += 1) {
        for (let hinten = 0; vorn + hinten <= laenge; hinten += 1) {
          nimm([...Array<Farbe | null>(vorn).fill(links1), ...Array<Farbe | null>(laenge - vorn - hinten).fill(null), ...Array<Farbe | null>(hinten).fill(rechts1)]);
        }
      }
    }
  }
  return [...belegungen.values()];
}

/**
 * Wie viele Dreiergruppen sind neu, wenn die Karten einer Schlange vorher wie
 * `vorher` und nachher wie `nachher` liegen? Beide Listen enthalten dieselben
 * Karten; nur Farbkarten haben ihre Stelle gewechselt (A7.9).
 */
export function neueDreiergruppen(vorher: readonly Spielkarte[], nachher: readonly Spielkarte[]): number {
  const stellen = nachher.flatMap((karte, stelle) => (karte.id === vorher[stelle]?.id ? [] : [stelle]));
  if (stellen.length === 0) return 0;
  for (const stelle of stellen) {
    const karte = nachher[stelle];
    if (karte.typ !== 'Farbkarte') throw new Error(`Neue Dreiergruppen: ${karte.id} ist keine Farbkarte; die Schlangenhäutung versetzt nur Farbkarten (A7.9).`);
  }
  const erste = stellen[0];
  const letzte = stellen[stellen.length - 1];
  // Ausserhalb der Strecke bis zur nächsten Sperre liegen beide Listen gleich; Gruppen enden an der Sperre.
  let von = erste;
  let bis = letzte;
  while (von > 0 && !istSperre(nachher[von - 1])) von -= 1;
  while (bis < nachher.length - 1 && !istSperre(nachher[bis + 1])) bis += 1;
  const strecke = { vorher: vorher.slice(von, bis + 1), nachher: nachher.slice(von, bis + 1) };

  const bloecke: Array<{ ids: string[]; belegungen: Array<Array<Farbe | null>> }> = [];
  for (let stelle = reichweite(nachher, erste, -1); stelle <= reichweite(nachher, letzte, 1); stelle += 1) {
    if (!istJoker(nachher[stelle])) continue;
    let ende = stelle;
    while (ende + 1 < nachher.length && istJoker(nachher[ende + 1])) ende += 1;
    const links = [farbeAn(vorher, stelle - 1), farbeAn(nachher, stelle - 1)];
    const rechts = [farbeAn(vorher, ende + 1), farbeAn(nachher, ende + 1)];
    bloecke.push({ ids: nachher.slice(stelle, ende + 1).map((karte) => karte.id), belegungen: blockBelegungen(ende - stelle + 1, links, rechts) });
    stelle = ende;
  }

  // Ein Joker ohne Farbe (`null`) unterbricht wie eine Sperre.
  const belegung = new Map<string, Farbe | null>();
  const gruppen = (karten: readonly Spielkarte[]) => {
    const belegt = karten.map((karte): Spielkarte => {
      const farbe = istJoker(karte) ? belegung.get(karte.id) : undefined;
      return farbe == null ? karte : { typ: 'Farbkarte', id: karte.id, farbe, punkte: 0 };
    });
    return ermittleFarbgruppen({ id: 'häutung', karten: belegt, fusionen: [] });
  };
  const zaehle = (): number => {
    const neu = gruppen(strecke.nachher);
    const fortgesetzt = new Set<number>();
    for (const alt of gruppen(strecke.vorher)) {
      const alteIds = new Set(alt.kartenIds);
      let beste = -1;
      let meiste = 0;
      neu.forEach((gruppe, index) => {
        const geteilt = gruppe.farbe === alt.farbe ? gruppe.kartenIds.filter((id) => alteIds.has(id)).length : 0;
        if (geteilt > meiste) [beste, meiste] = [index, geteilt];
      });
      if (beste >= 0) fortgesetzt.add(beste);
    }
    return neu.length - fortgesetzt.size;
  };
  const besteAb = (index: number): number => {
    if (index === bloecke.length) return zaehle();
    let bestes = 0;
    for (const folge of bloecke[index].belegungen) {
      bloecke[index].ids.forEach((id, stelle) => belegung.set(id, folge[stelle]));
      bestes = Math.max(bestes, besteAb(index + 1));
    }
    return bestes;
  };
  return besteAb(0);
}
