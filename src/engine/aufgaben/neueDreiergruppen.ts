import { ermittleFarbgruppen } from '../colorGroups';
import { istJoker } from '../jokerGruppen';
import type { Farbe, Spielkarte } from '../types';

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
