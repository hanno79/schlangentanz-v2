/*
Author: rahn
Datum: 31.05.2026
Version: 1.5
Beschreibung: Punktwertung gültiger Farbgruppen nach R4.2/R4.4 und R8.4.
              Gruppen < 3 Karten zählen 0. Sonderkarten unterbrechen Gruppen,
              außer Regenbogenschlangen, die als beste Farbe gewertet werden.
              R8.4c: Erfüllte Aufgabenpunkte eines Spielers summieren.
              R8.4d: Spieler-Gesamtpunkte aus Farbgruppen + erfüllten Aufgaben aggregieren.
              R8.4e: Spiel-Gesamtwertung über alle Spieler berechnen.
              R8.4f: Spiel-Gesamtwertung aus Spielzustand berechnen.
*/

import type { Farbe, Schlange, Spielzustand, Spielkarte, Spieler } from './types';
import { ermittleFarbgruppen, type Farbgruppe } from './colorGroups';

const FARBEN: Farbe[] = ['Blau', 'Rot', 'Gelb', 'Violett', 'Braun', 'Grün'];
const REGENBOGEN_NAME = 'Regenbogenschlange';
const FARBENFUSION_NAME = 'Farbenfusion';

type RegenbogenEntscheidung =
  | { art: 'weiter' }
  | { art: 'wechsel'; farbeIndex: number }
  | { art: 'reset' };

export type FarbgruppenWertung = Farbgruppe & { punkte: number };

export interface FarbgruppenPunkteErgebnis {
  gesamtPunkte: number;
  gruppen: FarbgruppenWertung[];
}

export type SchlangenFarbgruppenPunkteErgebnis = FarbgruppenPunkteErgebnis & { schlangenId: string };

export interface SpielerFarbgruppenPunkteErgebnis {
  gesamtPunkte: number;
  schlangen: SchlangenFarbgruppenPunkteErgebnis[];
}

function farbeZuIndex(farbe: Farbe): number {
  const index = FARBEN.indexOf(farbe);
  if (index < 0) {
    throw new Error(`Unbekannte Farbe: ${farbe}`);
  }
  return index;
}

function laufendeGruppePunkte(laenge: number, punkte: number): number {
  return laenge >= 3 ? punkte : 0;
}

function istRegenbogenschlange(karte: Spielkarte): boolean {
  return karte.typ === 'Sonderkarte' && karte.name === REGENBOGEN_NAME;
}

function istFarbenfusion(karte: Spielkarte): boolean {
  return karte.typ === 'Sonderkarte' && karte.name === FARBENFUSION_NAME;
}

function findeFarbenfusionPunkte(schlange: Schlange, karteId: string): number {
  const eintrag = schlange.farbenfusionen?.find((fusion) => fusion.kartenId === karteId);
  if (!eintrag) {
    throw new Error('Farbenfusion konnte nicht den fusionierten Punkten zugeordnet werden.');
  }
  return eintrag.punkte;
}

function transformiereRegenbogenschlangen(schlange: Schlange): Schlange {
  const regenbogenZuordnung = bestimmeRegenbogenZuordnung(schlange);
  const transformierteKarten = schlange.karten.map((karte, index) => {
    if (istRegenbogenschlange(karte)) {
      const farbe = regenbogenZuordnung.get(index);
      if (!farbe) {
        throw new Error('Regenbogenschlange konnte keiner Farbe zugeordnet werden.');
      }
      return { typ: 'Farbkarte', id: karte.id, farbe, punkte: 0 } as Spielkarte;
    }

    if (istFarbenfusion(karte)) {
      const farbe = regenbogenZuordnung.get(index);
      if (!farbe) {
        throw new Error('Farbenfusion konnte keiner Farbe zugeordnet werden.');
      }
      return { typ: 'Farbkarte', id: karte.id, farbe, punkte: findeFarbenfusionPunkte(schlange, karte.id) } as Spielkarte;
    }

    return karte;
  });

  return { ...schlange, karten: transformierteKarten };
}

/* ÄNDERUNG [03.08.2026]: `ermittleFarbenFuerFarbvielfalt` und das Kartenfeld
   `vielfaltbonusIgnorieren` sind entfernt — der Vielfaltbonus gehört nicht zum
   digitalen Umfang (GAME_SPEC R1.2a), und die Funktion hatte keinen
   Produktionsaufrufer. */

export function ermittleRegenbogenWildfarben(schlange: Schlange): Map<string, Farbe> {
  const zuordnung = bestimmeRegenbogenZuordnung(schlange);
  const wildfarben = new Map<string, Farbe>();
  schlange.karten.forEach((karte, index) => {
    if (istRegenbogenschlange(karte)) {
      const farbe = zuordnung.get(index);
      if (farbe) wildfarben.set(karte.id, farbe);
    }
  });
  return wildfarben;
}

function bestimmeRegenbogenZuordnung(schlange: Schlange): Map<number, Farbe> {
  const memo = new Map<string, number>();
  const entscheidungen = new Map<string, RegenbogenEntscheidung>();
  const karten = schlange.karten;

  function schluessel(position: number, farbeIndex: number, laenge: number, punkte: number): string {
    return `${position}|${farbeIndex}|${laenge}|${punkte}`;
  }

  function maxPunkte(position: number, farbeIndex: number, laenge: number, punkte: number): number {
    const key = schluessel(position, farbeIndex, laenge, punkte);
    const zwischengespeichert = memo.get(key);
    if (zwischengespeichert !== undefined) return zwischengespeichert;

    if (position >= karten.length) {
      const ergebnis = laufendeGruppePunkte(laenge, punkte);
      memo.set(key, ergebnis);
      return ergebnis;
    }

    const karte: Spielkarte = karten[position] as Spielkarte;
    let bestePunkte = Number.NEGATIVE_INFINITY;
    let besteEntscheidung: RegenbogenEntscheidung | null = null;

    if (karte.typ === 'Farbkarte') {
      const karteFarbeIndex = farbeZuIndex(karte.farbe);
      if (farbeIndex === -1 || farbeIndex === karteFarbeIndex) {
        const naechsteLaenge = farbeIndex === -1 ? 1 : laenge + 1;
        const naechstePunkte = farbeIndex === -1 ? karte.punkte : punkte + karte.punkte;
        bestePunkte = maxPunkte(position + 1, karteFarbeIndex, naechsteLaenge, naechstePunkte);
        besteEntscheidung = { art: 'weiter' };
      } else {
        const ergebnis = laufendeGruppePunkte(laenge, punkte) + maxPunkte(position + 1, karteFarbeIndex, 1, karte.punkte);
        bestePunkte = ergebnis;
        besteEntscheidung = { art: 'wechsel', farbeIndex: karteFarbeIndex };
      }
    } else if (istRegenbogenschlange(karte) || istFarbenfusion(karte)) {
      const wildcardPunkte = istFarbenfusion(karte) ? findeFarbenfusionPunkte(schlange, karte.id) : 0;
      if (farbeIndex !== -1) {
        const weiterPunkte = maxPunkte(position + 1, farbeIndex, laenge + 1, punkte + wildcardPunkte);
        bestePunkte = weiterPunkte;
        besteEntscheidung = { art: 'weiter' };
      }

      const startFarben = farbeIndex === -1 ? FARBEN : FARBEN.filter((_, index) => index !== farbeIndex);
      for (const farbe of startFarben) {
        const karteFarbeIndex = farbeZuIndex(farbe);
        const ergebnis = laufendeGruppePunkte(laenge, punkte) + maxPunkte(position + 1, karteFarbeIndex, 1, wildcardPunkte);
        if (ergebnis > bestePunkte) {
          bestePunkte = ergebnis;
          besteEntscheidung = { art: 'wechsel', farbeIndex: karteFarbeIndex };
        }
      }
    } else {
      const ergebnis = laufendeGruppePunkte(laenge, punkte) + maxPunkte(position + 1, -1, 0, 0);
      bestePunkte = ergebnis;
      besteEntscheidung = { art: 'reset' };
    }

    memo.set(key, bestePunkte);
    if (besteEntscheidung) entscheidungen.set(key, besteEntscheidung);
    return bestePunkte;
  }

  function rekonstruiere(position: number, farbeIndex: number, laenge: number, punkte: number, zuordnung: Map<number, Farbe>): void {
    if (position >= karten.length) return;

    const key = schluessel(position, farbeIndex, laenge, punkte);
    const entscheidung = entscheidungen.get(key);
    if (!entscheidung) return;

    const karte: Spielkarte = karten[position] as Spielkarte;
    if (karte.typ === 'Farbkarte') {
      const karteFarbeIndex = farbeZuIndex(karte.farbe);
      if (farbeIndex === -1 || farbeIndex === karteFarbeIndex) {
        const naechsteLaenge = farbeIndex === -1 ? 1 : laenge + 1;
        const naechstePunkte = farbeIndex === -1 ? karte.punkte : punkte + karte.punkte;
        rekonstruiere(position + 1, karteFarbeIndex, naechsteLaenge, naechstePunkte, zuordnung);
      } else {
        rekonstruiere(position + 1, karteFarbeIndex, 1, karte.punkte, zuordnung);
      }
      return;
    }

    if (istRegenbogenschlange(karte) || istFarbenfusion(karte)) {
      if (entscheidung.art === 'weiter') {
        if (farbeIndex < 0) throw new Error('Regenbogenschlange kann nicht ohne aktive Farbe fortgesetzt werden.');
        zuordnung.set(position, FARBEN[farbeIndex]);
        rekonstruiere(position + 1, farbeIndex, laenge + 1, punkte + (istFarbenfusion(karte) ? findeFarbenfusionPunkte(schlange, karte.id) : 0), zuordnung);
        return;
      } else if (entscheidung.art === 'reset') {
        throw new Error('Unreachable: reset for Regenbogenschlange');
      } else {
        zuordnung.set(position, FARBEN[entscheidung.farbeIndex]);
        rekonstruiere(position + 1, entscheidung.farbeIndex, 1, istFarbenfusion(karte) ? findeFarbenfusionPunkte(schlange, karte.id) : 0, zuordnung);
        return;
      }
    }

    if (karte.typ === 'Sonderkarte') {
      rekonstruiere(position + 1, -1, 0, 0, zuordnung);
      return;
    }

    throw new Error('Unbekannte Kartenart in der Wertung.');
  }

  maxPunkte(0, -1, 0, 0);
  const zuordnung = new Map<number, Farbe>();
  rekonstruiere(0, -1, 0, 0, zuordnung);
  return zuordnung;
}

export function berechneSpielerFarbgruppenPunkte(spieler: Spieler): SpielerFarbgruppenPunkteErgebnis {
  const schlangen = spieler.schlangen.map((s) => {
    const ergebnis = berechneFarbgruppenPunkte(s);
    return { schlangenId: s.id, ...ergebnis };
  });
  const gesamtPunkte = schlangen.reduce((sum, s) => sum + s.gesamtPunkte, 0);
  return { gesamtPunkte, schlangen };
}

export interface AufgabenPunkteEintrag {
  aufgabenId: string;
  name: string;
  punkte: number;
}

export interface SpielerAufgabenPunkteErgebnis {
  gesamtPunkte: number;
  aufgaben: AufgabenPunkteEintrag[];
  // ÄNDERUNG [01.08.2026]: Der Anteil, der aus der GEHEIMEN Aufgabe stammt.
  // In der Schlusswertung zählt er mit; während des Spiels darf ihn niemand
  // sehen, sonst verrät die Punktzahl eines Gegners seine geheime Aufgabe.
  // Getrennt ausgewiesen statt von der Anzeige nachgerechnet — die
  // Endspurt-Verdopplung gehört an genau eine Stelle.
  geheimePunkte: number;
}

export function berechneSpielerAufgabenPunkte(spieler: Spieler): SpielerAufgabenPunkteErgebnis {
  // ÄNDERUNG [05.07.2026]: K5 — im Endspurt erfüllte offene Aufgaben zählen doppelt (R6.4).
  const verdoppelt = new Set(spieler.endspurtVerdoppelteAufgabenIds ?? []);
  const aufgaben = spieler.erfuellteAufgaben.map((a) => ({
    aufgabenId: a.id,
    name: a.name,
    punkte: verdoppelt.has(a.id) ? a.punkte * 2 : a.punkte,
  }));
  // ÄNDERUNG [05.07.2026]: K4 — erfüllte geheime Aufgabe zählt einfach (nie verdoppelt).
  const geheimPunkte = spieler.geheimeAufgabeErfuellt === true ? spieler.geheimeAufgabe.punkte : 0;
  if (spieler.geheimeAufgabeErfuellt === true) {
    aufgaben.push({
      aufgabenId: spieler.geheimeAufgabe.id,
      name: spieler.geheimeAufgabe.name,
      punkte: spieler.geheimeAufgabe.punkte,
    });
  }
  const gesamtPunkte = aufgaben.reduce((sum, a) => sum + a.punkte, 0);
  return { gesamtPunkte, aufgaben, geheimePunkte: geheimPunkte };
}

export interface SpielerGrundpunkteErgebnis {
  /** Farbgruppen + Aufgaben. **Ohne** den Kettenbonus — der entsteht erst im Spielervergleich. */
  grundPunkte: number;
  farbgruppenPunkte: SpielerFarbgruppenPunkteErgebnis;
  aufgabenPunkte: SpielerAufgabenPunkteErgebnis;
}

/**
 * Die Grundpunkte **eines** Spielers: Farbgruppen plus Aufgaben.
 *
 * ÄNDERUNG [03.08.2026]: Hieß bis dahin „berechneSpielerGesamtPunkte" mit dem
 * Feld „gesamtPunkte". Seit der Kettenbonus (R8.4a) dazugekommen ist, war das
 * eine Lüge im Namen — der Bonus vergleicht Spieler miteinander und kann hier
 * nicht entstehen. Es gab damit zwei exportierte „gesamtPunkte" mit
 * verschiedener Bedeutung, getrennt nur durch einen Kommentar, den man lesen
 * muss. Jetzt trennt sie der Name: Die vollständige Zahl gibt es ausschließlich
 * bei `berechneSpielGesamtwertung`.
 *
 * (Die alten Namen stehen hier bewusst in Anführungszeichen statt in Backticks:
 * Ein globales `sed` über die Umbenennung hatte diesen Satz schon einmal
 * mitgeändert und damit in Unsinn verwandelt — gefunden im Codex-Review.)
 */
export function berechneSpielerGrundpunkte(spieler: Spieler): SpielerGrundpunkteErgebnis {
  const farbgruppenPunkte = berechneSpielerFarbgruppenPunkte(spieler);
  const aufgabenPunkte = berechneSpielerAufgabenPunkte(spieler);
  return {
    grundPunkte: farbgruppenPunkte.gesamtPunkte + aufgabenPunkte.gesamtPunkte,
    farbgruppenPunkte,
    aufgabenPunkte,
  };
}

const KETTENBONUS_PUNKTE = 5;

/**
 * Die längste ununterbrochene Kette einer Farbe eines Spielers (R8.4a).
 *
 * ÄNDERUNG [03.08.2026]: Die erste Fassung hatte hier einen eigenen Scanner mit
 * der Begründung, `ermittleFarbgruppen` sei nicht wiederverwendbar, weil dort
 * die Regenbogenschlange als Wildcard zähle. **Das stimmt nicht.** Die Primitive
 * arbeitet auf der rohen Schlange und bricht bei jeder Sonderkarte; die
 * Wildcard-Semantik steckt allein in `transformiereRegenbogenschlangen`, das
 * `berechneFarbgruppenPunkte` davorschaltet. `pruefeLilaRiese` in
 * `aufgabenPruefung.ts` fragt dieselbe Kettenfrage seit jeher in einer Zeile.
 *
 * `mindestLaenge: 1`, weil R8.4a — anders als R3.3 — keine Mindestlänge kennt.
 */
function laengsteFarbkette(spieler: Spieler): number {
  return Math.max(
    0,
    ...spieler.schlangen.flatMap((schlange) =>
      ermittleFarbgruppen(schlange, 1).map((gruppe) => gruppe.laenge),
    ),
  );
}

export type SpielerWertungsEintrag = {
  spielerId: string;
  name: string;
  /** Die eine vollständige Punktzahl: Grundpunkte + Kettenbonus. */
  gesamtPunkte: number;
  /** Die Einzelspieler-Wertung, ohne spielerübergreifende Anteile. */
  wertung: SpielerGrundpunkteErgebnis;
  /** 5 für jeden Spieler mit der längsten Farbkette (R8.4a), sonst 0. */
  kettenbonus: number;
};

export interface SpielGesamtwertungErgebnis {
  spielerwertungen: SpielerWertungsEintrag[];
}

/**
 * Die Wertung aller Spieler — die einzige vollständige Punktzahl.
 *
 * ÄNDERUNG [03.08.2026]: Hier kommt der Kettenbonus nach R8.4a dazu. Er gehört
 * auf diese Ebene, weil er Spieler miteinander vergleicht und in
 * `berechneSpielerGrundpunkte` gar nicht entstehen kann. Wortlaut der Regel,
 * Gleichstand und der Nullfall stehen in `docs/GAME_SPEC.md` R8.4a.
 */
export function berechneSpielGesamtwertung(spieler: Spieler[]): SpielGesamtwertungErgebnis {
  const eintraege = spieler.map((s) => ({
    spieler: s,
    wertung: berechneSpielerGrundpunkte(s),
    kette: laengsteFarbkette(s),
  }));
  const laengsteKette = Math.max(0, ...eintraege.map((eintrag) => eintrag.kette));

  return {
    spielerwertungen: eintraege.map(({ spieler: s, wertung, kette }) => {
      const kettenbonus = laengsteKette > 0 && kette === laengsteKette ? KETTENBONUS_PUNKTE : 0;
      return {
        spielerId: s.id,
        name: s.name,
        gesamtPunkte: wertung.grundPunkte + kettenbonus,
        wertung,
        kettenbonus,
      };
    }),
  };
}

export function berechneSpielzustandGesamtwertung(zustand: Pick<Spielzustand, 'spieler'>): SpielGesamtwertungErgebnis {
  return berechneSpielGesamtwertung(zustand.spieler);
}

export interface GewinnerEintrag {
  spielerId: string;
  name: string;
  gesamtPunkte: number;
}

export interface GewinnerErgebnis {
  hoechstePunktzahl: number | null;
  gewinner: GewinnerEintrag[];
}

export function berechneGewinner(spieler: Spieler[]): GewinnerErgebnis {
  if (spieler.length === 0) return { hoechstePunktzahl: null, gewinner: [] };

  const wertungen = berechneSpielGesamtwertung(spieler).spielerwertungen;
  const hoechstePunktzahl = Math.max(...wertungen.map((w) => w.gesamtPunkte));
  const gewinner = wertungen
    .filter((w) => w.gesamtPunkte === hoechstePunktzahl)
    .map(({ spielerId, name, gesamtPunkte }) => ({ spielerId, name, gesamtPunkte }));

  return { hoechstePunktzahl, gewinner };
}

export function berechneFarbgruppenPunkte(schlange: Schlange): FarbgruppenPunkteErgebnis {
  const transformierteSchlange = transformiereRegenbogenschlangen(schlange);
  const gruppen: FarbgruppenWertung[] = ermittleFarbgruppen(transformierteSchlange).map((gruppe) => {
    const punkte = transformierteSchlange.karten
      .slice(gruppe.startIndex, gruppe.endIndex + 1)
      .reduce((sum, karte) => sum + (karte.typ === 'Farbkarte' ? karte.punkte : 0), 0);

    return { ...gruppe, punkte };
  });

  const gesamtPunkte = gruppen.reduce((sum, g) => sum + g.punkte, 0);

  return { gesamtPunkte, gruppen };
}
