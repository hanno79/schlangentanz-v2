import type { Farbe, Schlange, SpielAktion, Spielkarte } from '../../engine';
import type { Sicht } from '../sicht';
import { istJoker } from './bewertung';

/*
Die Vorauswahl der Zugsuche (Plan K2, Kriterium 8). Der Farbendieb allein bietet in
späten Stellungen über tausend Aktionen an, der Schlangenfrass Hunderte; jede
durchzurechnen kostet eine Simulation. Die Vorauswahl schätzt deshalb aus der Sicht,
welche Aktionen sich lohnen: Sie liest nur, wohin eine Karte kommt und welche
Reihen gleicher Farbe dort liegen. Sie entscheidet nichts. Was die KI spielt, steht
erst nach der Simulation fest (`zugsuche.ts`), und erlaubt ist nur, was die Engine
aufzählt. Damit jede Handkarte eine Chance bekommt, kommt von jeder Karte ihre
beste Aktion mit.
*/

interface Fund {
  schlange: Schlange;
  besitzer: number;
}

function finde(sicht: Sicht, schlangenId: string): Fund | null {
  for (const [besitzer, spieler] of sicht.spieler.entries()) {
    const schlange = spieler.schlangen.find((eintrag) => eintrag.id === schlangenId);
    if (schlange !== undefined) return { schlange, besitzer };
  }
  return null;
}

/** Wie viele Karten ab `start` in Richtung `schritt` zu `farbe` passen; Joker passen immer, andere Sonderkarten beenden die Reihe. */
function reihe(karten: readonly Spielkarte[], start: number, schritt: 1 | -1, farbe: Farbe): number {
  let laenge = 0;
  for (let stelle = start; stelle >= 0 && stelle < karten.length; stelle += schritt) {
    const karte = karten[stelle];
    if (!(istJoker(karte) || (karte.typ === 'Farbkarte' && karte.farbe === farbe))) break;
    laenge += 1;
  }
  return laenge;
}

/** Die Farbe der ersten Farbkarte ab `start` in Richtung `schritt`, über Joker hinweg; `null`, wenn vorher etwas anderes kommt. */
function farbeAb(karten: readonly Spielkarte[], start: number, schritt: 1 | -1): Farbe | null {
  for (let stelle = start; stelle >= 0 && stelle < karten.length; stelle += schritt) {
    const karte = karten[stelle];
    if (karte.typ === 'Farbkarte') return karte.farbe;
    if (!istJoker(karte)) return null;
  }
  return null;
}

/** Die Farben, zu denen eine Reihe neben der Lücke `position` gehört, auch hinter Jokern. */
function nachbarfarben(karten: readonly Spielkarte[], position: number): Farbe[] {
  return [farbeAb(karten, position - 1, -1), farbeAb(karten, position, 1)].flatMap((farbe) => (farbe === null ? [] : [farbe]));
}

/**
 * Was eine Karte an einer Lücke verspricht, wenn dort `links` und `rechts` passende
 * Karten anschliessen. Die beiden Seiten liegen schon nebeneinander, die Reihe durch
 * die Lücke hat also schon `links + rechts` Karten: Wird sie mit der neuen Karte zur
 * Gruppe, ist das viel wert; eine Gruppe zu verlängern nur die Punkte der Karte; ein
 * Paar die Aussicht auf eine Gruppe.
 */
function gewinn(links: number, rechts: number, punkte: number): number {
  const vorher = links + rechts;
  if (vorher >= 3) return 0.5 + punkte;
  if (vorher === 2) return 3 + 3 * Math.max(punkte, 1);
  return vorher === 1 ? 1 + 0.5 * punkte : 0.2 * punkte;
}

/** Der beste `gewinn`, wenn an die Lücke `position` eine Karte der Farbe `farbe` kommt; `null` ist ein Joker, der zu jedem Nachbarn passt. */
function gewinnAnLuecke(karten: readonly Spielkarte[], position: number, farbe: Farbe | null, punkte: number): number {
  const farben = farbe === null ? nachbarfarben(karten, position) : [farbe];
  return Math.max(gewinn(0, 0, punkte), ...farben.map((wahl) => gewinn(reihe(karten, position - 1, -1, wahl), reihe(karten, position, 1, wahl), punkte)));
}

/** Wie viele Karten eine Reihe hätte, die durch die Lücke `position` hindurchgeht, ohne eine Karte dort. */
function reiheDurch(karten: readonly Spielkarte[], position: number): number {
  return Math.max(0, ...nachbarfarben(karten, position).map((wahl) => reihe(karten, position - 1, -1, wahl) + reihe(karten, position, 1, wahl)));
}

/** Die Reihe, in der die Karte an `stelle` liegt, sie selbst eingeschlossen. */
function reiheUm(karten: readonly Spielkarte[], stelle: number): number {
  const karte = karten[stelle];
  if (karte === undefined || karte.typ !== 'Farbkarte') return 1;
  return reihe(karten, stelle - 1, -1, karte.farbe) + 1 + reihe(karten, stelle + 1, 1, karte.farbe);
}

/** Was es einem Gegner nimmt, eine Reihe dieser Länge zu zerstören. */
function schaden(laenge: number): number {
  return laenge >= 3 ? 2 + laenge : 0.3 * laenge;
}

function handkarte(sicht: Sicht, karteId: string): Spielkarte | undefined {
  return sicht.hand.find((karte) => karte.id === karteId);
}

/** Wo eine Farbkarte hinkommt: eigene Reihe verlängern ist gut, die eines Gegners schlecht, ausser sie bricht dort eine Reihe ab. */
function farbkartenwert(sicht: Sicht, karte: Spielkarte, ziel: { schlangenId: string; seite: 'anfang' | 'ende' } | null): number {
  if (karte.typ !== 'Farbkarte') return 0;
  if (ziel === null) return 0.3 * karte.punkte;
  const fund = finde(sicht, ziel.schlangenId);
  if (fund === null) return 0;
  const karten = fund.schlange.karten;
  const position = ziel.seite === 'anfang' ? 0 : karten.length;
  const passend = reihe(karten, position - 1, -1, karte.farbe) + reihe(karten, position, 1, karte.farbe);
  if (fund.besitzer !== sicht.ich) return passend > 0 ? -gewinnAnLuecke(karten, position, karte.farbe, karte.punkte) : 0.5 * Math.max(0, reiheDurch(karten, position) - 1);
  return passend === 0 && nachbarfarben(karten, position).length > 0 ? -0.5 : gewinnAnLuecke(karten, position, karte.farbe, karte.punkte);
}

/** Die grobe Schätzung einer Aktion; höher heisst: zuerst durchrechnen. */
export function vorwert(sicht: Sicht, aktion: SpielAktion): number {
  switch (aktion.typ) {
    case 'FarbkarteLegen': {
      const karte = handkarte(sicht, aktion.karteId);
      return karte === undefined ? 0 : farbkartenwert(sicht, karte, aktion.ziel.art === 'neueSchlange' ? null : aktion.ziel);
    }
    case 'RegenbogenschlangeLegen': {
      const fund = finde(sicht, aktion.schlangenId);
      if (fund === null) return 0;
      const wert = gewinnAnLuecke(fund.schlange.karten, aktion.position, null, 0);
      return fund.besitzer === sicht.ich ? wert : -wert;
    }
    case 'BlockadeLegen': {
      const fund = finde(sicht, aktion.schlangenId);
      if (fund === null) return 0;
      const zerstoert = reiheDurch(fund.schlange.karten, aktion.position);
      return fund.besitzer === sicht.ich ? -1 - zerstoert : schaden(zerstoert);
    }
    case 'FusionLegen': {
      const fund = finde(sicht, aktion.schlangenId);
      if (fund === null) return 0;
      const stelle = fund.schlange.karten.findIndex((karte) => karte.id === aktion.kartenIds[0]);
      return fund.besitzer === sicht.ich ? 0.1 : schaden(reiheUm(fund.schlange.karten, stelle));
    }
    case 'FarbendiebSpielen': {
      const quelle = finde(sicht, aktion.quelle.schlangenId);
      const karte = quelle?.schlange.karten.find((eintrag) => eintrag.id === aktion.quelle.karteId);
      if (quelle === null || karte === undefined || karte.typ !== 'Farbkarte') return 0;
      const genommen = schaden(reiheUm(quelle.schlange.karten, quelle.schlange.karten.indexOf(karte)));
      const ziel = aktion.ziel.art === 'neueSchlange' ? null : finde(sicht, aktion.ziel.schlangenId);
      const gelegt =
        aktion.ziel.art === 'neueSchlange' || ziel === null ? 0.3 * karte.punkte : gewinnAnLuecke(ziel.schlange.karten, aktion.ziel.position, karte.farbe, karte.punkte);
      return genommen + gelegt;
    }
    case 'SchlangenfrassSpielen':
      return aktion.ziele.reduce((summe, ziel) => {
        const fund = finde(sicht, ziel.schlangenId);
        const stelle = fund === null ? -1 : fund.schlange.karten.findIndex((karte) => karte.id === ziel.karteId);
        if (fund === null || stelle < 0) return summe;
        if (fund.besitzer !== sicht.ich) return summe + schaden(reiheUm(fund.schlange.karten, stelle));
        const ohne = fund.schlange.karten.filter((_, index) => index !== stelle);
        return summe + (fund.schlange.karten[stelle].typ === 'Farbkarte' ? -1 : reiheDurch(ohne, stelle) >= 3 ? 3 : 0);
      }, 0);
    case 'SchlangengrubeSpielen':
      return 1.5;
    case 'VerdopplerSpielen':
      return 4;
    case 'SchlangenhaeutungSpielen':
      return 1;
    case 'SonderkarteWirkungslosAblegen':
      return -3;
    case 'ZugBeenden':
    case 'UeberhandAbwerfen':
    case 'Reagieren':
      return 0;
  }
}

/** Die Karte, die eine Aktion spielt; `null`, wenn sie keine spielt. */
function gespielteKarte(aktion: SpielAktion): string | null {
  switch (aktion.typ) {
    case 'ZugBeenden':
    case 'UeberhandAbwerfen':
    case 'Reagieren':
      return null;
    default:
      return aktion.karteId;
  }
}

/**
 * Höchstens `anzahl` Aktionen zum Durchrechnen, die mit dem höchsten Vorwert; von
 * jeder Handkarte mindestens ihre beste. Bei gleichem Vorwert gilt die Reihenfolge
 * der Engine, damit die Wahl nur von der Sicht abhängt.
 */
export function vorauswahl(sicht: Sicht, aktionen: readonly SpielAktion[], anzahl: number): SpielAktion[] {
  if (aktionen.length <= anzahl) return [...aktionen];
  const geordnet = aktionen.map((aktion, stelle) => ({ aktion, stelle, wert: vorwert(sicht, aktion) })).sort((a, b) => b.wert - a.wert || a.stelle - b.stelle);
  const gewaehlt = new Set<number>();
  const karten = new Set<string | null>();
  for (const eintrag of geordnet) {
    const karte = gespielteKarte(eintrag.aktion);
    if (!karten.has(karte)) gewaehlt.add(eintrag.stelle);
    karten.add(karte);
  }
  for (const eintrag of geordnet) if (gewaehlt.size < anzahl) gewaehlt.add(eintrag.stelle);
  return geordnet.filter((eintrag) => gewaehlt.has(eintrag.stelle)).map((eintrag) => eintrag.aktion);
}
