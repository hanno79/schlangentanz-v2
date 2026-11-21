import type { SchlangenfrassSpielenAktion } from '../aktionen/typen';
import type { Schlange, Spielkarte, Spielzustand } from '../types';
import { legeAufEigenenAblagestapel, mitspielerImUhrzeigersinn, spielerIndexVon } from '../zugablauf';
import type { KartenDefinition } from './register';

/*
A7.4: Der Schlangenfrass hat drei Optionen. a) frisst eine beliebige Karte aus
einer eigenen Schlange, b) eine Schlangenblockade aus einer eigenen Schlange,
c) zwei Karten aus den Schlangen der Mitspieler, aus einer oder zwei Schlangen
und von beliebigen Stellen, nie eine Schlangenblockade; zwei, sofern möglich,
sonst die eine, die es gibt. a) und b) treffen keinen Mitspieler und wirken
sofort; bei einer eigenen Blockade passen beide, und beide werden angeboten.

c) trifft die Besitzer der Ziele; jeder entscheidet einmal, auch wenn beide
Karten von ihm sind (A6 Beispiel 2, D15), das regelt der Reaktionsablauf
(`reaktion.ts`). Wer abwehrt, behält seine Karten, die übrigen werden gefressen.
Der Schlangenfrass und die gefressenen Karten kommen auf den Ablagestapel des
Angreifers (A6 Beispiel 2), die gefressenen in der Reihenfolge, in der sie am
Tisch liegen, damit jede Schreibweise derselben Wahl dasselbe ergibt.

Wird eine Farbenfusion gefressen, geht nur sie weg; die beiden Karten darunter
liegen wieder einzeln an ihrer Stelle (A7.4, A7.7), links zuerst wie beim
Legen. Wird die letzte Karte einer Schlange gefressen, gibt es die Schlange
nicht mehr; Nachbarn schliessen auf.
*/

type Ziel = SchlangenfrassSpielenAktion['ziele'][number];

/** Eine Karte in einer Schlange, mit dem Besitzer der Schlange. */
interface Fundstelle {
  besitzer: number;
  schlange: Schlange;
  karte: Spielkarte;
}

function istBlockade(karte: Spielkarte): boolean {
  return karte.typ === 'Sonderkarte' && karte.name === 'Schlangenblockade';
}

function verweis({ schlange, karte }: Fundstelle): Ziel {
  return { schlangenId: schlange.id, karteId: karte.id };
}

/** Jede Karte in den Schlangen dieser Spieler, in ihrer Reihenfolge, je Spieler Schlange für Schlange von vorn. */
function kartenIn(zustand: Spielzustand, besitzer: readonly number[]): Fundstelle[] {
  return besitzer.flatMap((index) =>
    zustand.spieler[index].schlangen.flatMap((schlange) => schlange.karten.map((karte) => ({ besitzer: index, schlange, karte }))),
  );
}

/** A7.4 c): Was der Angreifer bei den Mitspielern fressen darf, im Uhrzeigersinn ab ihm; Schlangenblockaden nicht. */
function gegnerischeZiele(zustand: Spielzustand, angreifer: number): Fundstelle[] {
  return kartenIn(zustand, mitspielerImUhrzeigersinn(zustand, angreifer)).filter(({ karte }) => !istBlockade(karte));
}

function finde(zustand: Spielzustand, ziel: Ziel): Fundstelle | undefined {
  for (const [besitzer, spieler] of zustand.spieler.entries()) {
    const schlange = spieler.schlangen.find((eintrag) => eintrag.id === ziel.schlangenId);
    const karte = schlange?.karten.find((eintrag) => eintrag.id === ziel.karteId);
    if (schlange !== undefined) return karte === undefined ? undefined : { besitzer, schlange, karte };
  }
  return undefined;
}

/** A7.4 c): zwei Karten, sofern möglich; jedes Paar einmal, in der Reihenfolge am Tisch. */
function paare(ziele: Fundstelle[]): Ziel[][] {
  if (ziele.length === 1) return [[verweis(ziele[0])]];
  // Ohne Ziel bleibt die Liste leer.
  return ziele.flatMap((erste, index) => ziele.slice(index + 1).map((zweite) => [verweis(erste), verweis(zweite)]));
}

/**
 * Nimmt die Karte aus ihrer Schlange und legt sie auf den Ablagestapel. Eine
 * Farbenfusion lässt ihre beiden Karten an ihrer Stelle zurück (A7.4); eine
 * leer gefressene Schlange verschwindet.
 */
function friss(zustand: Spielzustand, { besitzer, schlange, karte }: Fundstelle, ablagestapel: Spielkarte[]): void {
  const stelle = schlange.karten.indexOf(karte);
  const fusion = schlange.fusionen.find((eintrag) => eintrag.karteId === karte.id);
  schlange.karten.splice(stelle, 1, ...(fusion?.unter ?? []));
  schlange.fusionen = schlange.fusionen.filter((eintrag) => eintrag !== fusion);
  ablagestapel.push(karte);
  const spieler = zustand.spieler[besitzer];
  if (schlange.karten.length === 0) spieler.schlangen = spieler.schlangen.filter((eintrag) => eintrag !== schlange);
}

/** Der Grund, warum die Ziele für diese Option nicht passen, oder `null`. */
function pruefeOption(zustand: Spielzustand, aktion: SchlangenfrassSpielenAktion, angreifer: number, fundstellen: Fundstelle[]): string | null {
  const eigene = fundstellen.every(({ besitzer }) => besitzer === angreifer);
  switch (aktion.option) {
    case 'eigeneKarte':
      if (fundstellen.length !== 1) return 'Mit Option a) frisst der Schlangenfrass genau eine Karte (A7.4).';
      return eigene ? null : 'Option a) frisst eine Karte aus einer eigenen Schlange, nicht aus der eines Mitspielers (A7.4).';
    case 'eigeneBlockade':
      if (fundstellen.length !== 1) return 'Mit Option b) frisst der Schlangenfrass genau eine Schlangenblockade (A7.4).';
      if (!eigene) return 'Option b) frisst eine Schlangenblockade aus einer eigenen Schlange, nicht aus der eines Mitspielers (A7.4).';
      return istBlockade(fundstellen[0].karte) ? null : `Option b) frisst nur eine Schlangenblockade; ${fundstellen[0].karte.id} ist keine (A7.4).`;
    case 'gegnerischeKarten': {
      if (fundstellen.some(({ besitzer }) => besitzer === angreifer)) return 'Option c) frisst nur aus den Schlangen der Mitspieler, nicht aus der eigenen (A7.4).';
      const blockade = fundstellen.find(({ karte }) => istBlockade(karte));
      if (blockade !== undefined) return `Schlangenblockaden in gegnerischen Schlangen kann Option c) nicht entfernen, auch ${blockade.karte.id} nicht (A7.4).`;
      // Zwei verschiedene erlaubte Ziele sind immer genug; nur bei einem zählt, ob es ein zweites gäbe.
      if (fundstellen.length === 1 && gegnerischeZiele(zustand, angreifer).length > 1) {
        return 'Bei Option c) müssen zwei Karten entfernt werden, sofern möglich: Am Tisch liegen mindestens zwei erlaubte Ziele, genannt ist eines (A7.4).';
      }
      return null;
    }
  }
}

export const schlangenfrass: KartenDefinition<SchlangenfrassSpielenAktion> = {
  art: 'Schlangenfrass',
  aktionstyp: 'SchlangenfrassSpielen',

  ziele(zustand: Spielzustand, spielerIndex: number, karte: Spielkarte): SchlangenfrassSpielenAktion[] {
    const basis = { typ: 'SchlangenfrassSpielen', spielerId: zustand.spieler[spielerIndex].id, karteId: karte.id } as const;
    const eigene = kartenIn(zustand, [spielerIndex]);
    const gegner = gegnerischeZiele(zustand, spielerIndex);
    return [
      ...eigene.map((fund): SchlangenfrassSpielenAktion => ({ ...basis, option: 'eigeneKarte', ziele: [verweis(fund)] })),
      ...eigene.filter(({ karte: eigeneKarte }) => istBlockade(eigeneKarte)).map((fund): SchlangenfrassSpielenAktion => ({ ...basis, option: 'eigeneBlockade', ziele: [verweis(fund)] })),
      ...paare(gegner).map((ziele): SchlangenfrassSpielenAktion => ({ ...basis, option: 'gegnerischeKarten', ziele })),
    ];
  },

  pruefe(zustand: Spielzustand, aktion: SchlangenfrassSpielenAktion): string | null {
    const fundstellen: Fundstelle[] = [];
    for (const ziel of aktion.ziele) {
      const fund = finde(zustand, ziel);
      if (fund === undefined) return `Die Karte ${ziel.karteId} liegt nicht in der Schlange ${ziel.schlangenId}; der Schlangenfrass frisst nur Karten aus Schlangen (A7.4).`;
      fundstellen.push(fund);
    }
    if (new Set(aktion.ziele.map((ziel) => ziel.karteId)).size !== aktion.ziele.length) return 'Der Schlangenfrass frisst jede Karte höchstens einmal (A7.4).';
    return pruefeOption(zustand, aktion, spielerIndexVon(zustand, aktion.spielerId), fundstellen);
  },

  betroffene(zustand: Spielzustand, aktion: SchlangenfrassSpielenAktion): number[] {
    if (aktion.option !== 'gegnerischeKarten') return [];
    // Jeder entscheidet einmal (D15); das macht der Reaktionsablauf aus dieser Liste.
    return aktion.ziele.map((ziel) => finde(zustand, ziel)!.besitzer);
  },

  wirke(zustand: Spielzustand, aktion: SchlangenfrassSpielenAktion, abgewehrt: readonly number[]): Spielzustand {
    const angreifer = spielerIndexVon(zustand, aktion.spielerId);
    legeAufEigenenAblagestapel(zustand, aktion.spielerId, aktion.karteId);
    const ziele = new Set(aktion.ziele.map((ziel) => ziel.karteId));
    // In Tischreihenfolge ab dem Angreifer, gleich wie die Aktion die Ziele ordnet.
    const gefressen = kartenIn(zustand, [angreifer, ...mitspielerImUhrzeigersinn(zustand, angreifer)]).filter(
      ({ besitzer, karte }) => ziele.has(karte.id) && !abgewehrt.includes(besitzer),
    );
    for (const fund of gefressen) friss(zustand, fund, zustand.spieler[angreifer].ablagestapel);
    return zustand;
  },
};
