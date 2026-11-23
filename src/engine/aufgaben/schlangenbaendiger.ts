import { irgendeineStrecke } from '../jokerGruppen';
import type { ReihenGlied } from '../jokerGruppen';
import type { Farbe } from '../types';
import type { AufgabenDefinition } from './definition';

/*
A9 Nr. 11 „Schlangenbändiger“: „Habe in einer Schlange ein sich wiederholendes
Muster aus min. 3 versch. Farben.“ Das Muster liegt mindestens zweimal direkt
hintereinander und ist eine beliebige Kartenfolge mit mindestens drei
verschiedenen Farben, also ABCABC, aber auch AABCAABC (D40). Eine andere
Sonderkarte unterbricht es (A9).

Joker (A9): Die Prüfung vergleicht jede Karte des ersten Musters mit der Karte
an derselben Stelle des zweiten. Zwei Farbkarten müssen gleich sein; ist eine
der beiden ein Joker, zählt er als die Farbe der anderen; sind beide Joker,
zählen sie als eine frei wählbare Farbe, am besten eine, die im Muster noch
fehlt. Jeder Joker liegt in genau einem Paar und bekommt so genau eine Farbe.
Durchprobiert werden nur Anfang und Länge des Musters, keine Jokerbelegungen.
*/

const MINDEST_FARBEN = 3;

/** Liegt ab `start` ein Muster der Länge `laenge` zweimal direkt hintereinander? */
function wiederholtSich(strecke: readonly ReihenGlied[], start: number, laenge: number): boolean {
  const farben = new Set<Farbe>();
  let freie = 0;
  for (let stelle = start; stelle < start + laenge; stelle++) {
    const erste = strecke[stelle];
    const zweite = strecke[stelle + laenge];
    const farbe = erste === 'Joker' ? zweite : erste;
    if (farbe === 'Joker') freie += 1;
    else if (zweite === 'Joker' || zweite === farbe) farben.add(farbe);
    else return false;
  }
  return farben.size + freie >= MINDEST_FARBEN;
}

function hatMuster(strecke: readonly ReihenGlied[]): boolean {
  for (let laenge = MINDEST_FARBEN; 2 * laenge <= strecke.length; laenge++) {
    for (let start = 0; start + 2 * laenge <= strecke.length; start++) {
      if (wiederholtSich(strecke, start, laenge)) return true;
    }
  }
  return false;
}

export const schlangenbaendiger: AufgabenDefinition = {
  name: 'Schlangenbändiger',
  istErfuellt: (zustand, spielerIndex) => irgendeineStrecke(zustand.spieler[spielerIndex].schlangen, hatMuster),
};
