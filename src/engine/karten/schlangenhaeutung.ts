import type { SchlangenhaeutungSpielenAktion } from '../aktionen/typen';
import type { FarbkarteInfo, Schlange, Spielkarte, Spielzustand } from '../types';
import { alleSchlangen, findeSchlange, gepruefteSchlange } from '../schlangen';
import { merkeHaeutung } from '../aufgaben/sonderkartenZaehler';
import { legeAufEigenenAblagestapel, spielerIndexVon } from '../zugablauf';
import type { KartenDefinition } from './register';
import { betroffenerBesitzer, grundVerdeckt } from './schlangenstelle';

/*
A7.9: Die Schlangenhäutung ordnet einen Abschnitt von 3 bis 5
aufeinanderfolgenden Farbkarten einer Schlange neu; nur dieser Abschnitt ändert
sich, alles übrige bleibt, wie es liegt. Sonderkarten gehören nie dazu und
unterbrechen ihn, auch Regenbogenschlange und Farbenfusion; die Karten unter
einer Fusion liegen nicht offen in der Schlange (A7.7) und gehören ebenfalls
nicht dazu. Die Farbfolge im Abschnitt muss danach anders sein (D26); ein
Abschnitt aus lauter gleichen Farben ist deshalb kein Ziel.

Sie geht in jede Schlange am Tisch (D9); in der Schlange eines Mitspielers
trifft sie ihn, und er darf abwehren (A6, D10). Gespielt kommt sie auf den
Ablagestapel dessen, der sie gespielt hat (A6); abgewehrt legt sie der
Reaktionsablauf dorthin (`reaktion.ts`). Häutet der Spieler eine eigene
Schlange, hält die Engine fest, wie viele neue Dreiergruppen dabei entstehen
(A9 „Schlangentanz“, D37, `aufgaben/sonderkartenZaehler.ts`).

Aufgezählt wird je Abschnitt jede neue Farbfolge einmal. Gleichfarbige Karten
behalten dabei ihre Reihenfolge untereinander, weil sie gleich viel zählen
(A11); erlaubt ist auch jede andere Anordnung der Karten, die die Farbfolge
ändert. Die Neuordnung erfolgt einmalig: Die Aktion nennt nur die Folge danach.
*/

const KLEINSTER_ABSCHNITT = 3;
const GROESSTER_ABSCHNITT = 5;

/** Die Farben dieser Karten in ihrer Folge, zum Vergleichen (D26). */
function farbfolge(karten: readonly FarbkarteInfo[]): string {
  return karten.map((karte) => karte.farbe).join();
}

/** Die Läufe aufeinanderfolgender Farbkarten einer Schlange; jede Sonderkarte beendet einen Lauf (A7.9). */
function farbkartenLaeufe(schlange: Schlange): FarbkarteInfo[][] {
  const laeufe: FarbkarteInfo[][] = [[]];
  for (const karte of schlange.karten) {
    if (karte.typ === 'Farbkarte') laeufe[laeufe.length - 1].push(karte);
    else laeufe.push([]);
  }
  return laeufe.filter((lauf) => lauf.length >= KLEINSTER_ABSCHNITT);
}

/** Jeder Abschnitt von 3 bis 5 Karten eines Laufs, nach erster Stelle und dann nach Länge. */
function abschnitte(lauf: readonly FarbkarteInfo[]): FarbkarteInfo[][] {
  const ergebnis: FarbkarteInfo[][] = [];
  for (let von = 0; von + KLEINSTER_ABSCHNITT <= lauf.length; von += 1) {
    for (let laenge = KLEINSTER_ABSCHNITT; laenge <= GROESSTER_ABSCHNITT && von + laenge <= lauf.length; laenge += 1) {
      ergebnis.push(lauf.slice(von, von + laenge));
    }
  }
  return ergebnis;
}

/**
 * Jede Farbfolge des Abschnitts ausser der bisherigen (D26), je eine Anordnung:
 * An jeder Stelle kommt jede noch freie Farbe einmal dran, und zwar mit ihrer
 * vordersten noch freien Karte.
 */
function neueFarbfolgen(abschnitt: readonly FarbkarteInfo[]): FarbkarteInfo[][] {
  const folgen: FarbkarteInfo[][] = [];
  const lege = (gelegt: FarbkarteInfo[], frei: FarbkarteInfo[]): void => {
    if (frei.length === 0) {
      folgen.push(gelegt);
      return;
    }
    const versucht = new Set<string>();
    frei.forEach((karte, index) => {
      if (versucht.has(karte.farbe)) return;
      versucht.add(karte.farbe);
      lege([...gelegt, karte], frei.filter((_, andere) => andere !== index));
    });
  };
  lege([], [...abschnitt]);
  const bisher = farbfolge(abschnitt);
  return folgen.filter((folge) => farbfolge(folge) !== bisher);
}

/** Der Grund, warum diese Karten der Schlange kein Abschnitt sind, den die Häutung neu ordnen darf, oder `null`. */
function pruefeAbschnitt(schlange: Schlange, neueReihenfolge: readonly string[]): string | null {
  const anzahl = neueReihenfolge.length;
  if (anzahl < KLEINSTER_ABSCHNITT || anzahl > GROESSTER_ABSCHNITT) {
    return `Die Schlangenhäutung ordnet einen Abschnitt von 3 bis 5 Farbkarten neu; genannt sind ${anzahl} (A7.9).`;
  }
  const doppelt = neueReihenfolge.find((id, index) => neueReihenfolge.indexOf(id) !== index);
  if (doppelt !== undefined) return `Die Karte ${doppelt} ist doppelt genannt; jede Karte des Abschnitts kommt genau einmal vor (A7.9).`;
  const stellen: number[] = [];
  const danach: FarbkarteInfo[] = [];
  for (const id of neueReihenfolge) {
    const stelle = schlange.karten.findIndex((karte) => karte.id === id);
    if (stelle < 0) {
      return grundVerdeckt(
        schlange,
        id,
        (fusionId) => `Die Karte ${id} liegt unter der Farbenfusion ${fusionId}; neu ordnen lassen sich nur Farbkarten, die offen in der Schlange liegen (A7.9, A7.7).`,
      );
    }
    const karte = schlange.karten[stelle];
    if (karte.typ !== 'Farbkarte') {
      return `Die Karte ${id} ist eine Sonderkarte (${karte.name}); es dürfen nur Farbkarten neu angeordnet werden, Sonderkarten bleiben liegen (A7.9).`;
    }
    stellen.push(stelle);
    danach.push(karte);
  }
  const erste = Math.min(...stellen);
  if (Math.max(...stellen) - erste !== anzahl - 1) {
    return `Die Karten ${neueReihenfolge.join(', ')} liegen nicht aufeinanderfolgend; gewählt werden nur zusammenhängende Farbkarten (A7.9).`;
  }
  // Lückenlos und nur Farbkarten: Der Abschnitt vorher ist der Ausschnitt ab der ersten Stelle.
  const bisher = schlange.karten.slice(erste, erste + anzahl) as FarbkarteInfo[];
  if (farbfolge(bisher) === farbfolge(danach)) {
    return `Die Farbfolge im Abschnitt bliebe ${bisher.map((karte) => karte.farbe).join(', ')}; die Schlangenhäutung muss sie ändern (D26).`;
  }
  return null;
}

export const schlangenhaeutung: KartenDefinition<SchlangenhaeutungSpielenAktion> = {
  art: 'Schlangenhäutung',
  aktionstyp: 'SchlangenhaeutungSpielen',

  ziele(zustand: Spielzustand, spielerIndex: number, karte: Spielkarte): SchlangenhaeutungSpielenAktion[] {
    const spielerId = zustand.spieler[spielerIndex].id;
    return alleSchlangen(zustand).flatMap(({ schlange }) =>
      farbkartenLaeufe(schlange)
        .flatMap(abschnitte)
        .flatMap(neueFarbfolgen)
        .map((folge): SchlangenhaeutungSpielenAktion => ({
          typ: 'SchlangenhaeutungSpielen',
          spielerId,
          karteId: karte.id,
          schlangenId: schlange.id,
          neueReihenfolge: folge.map((eintrag) => eintrag.id),
        })),
    );
  },

  pruefe(zustand: Spielzustand, aktion: SchlangenhaeutungSpielenAktion): string | null {
    const gefunden = findeSchlange(zustand, aktion.schlangenId);
    if (gefunden === null) return `Die Schlange ${aktion.schlangenId} gibt es nicht.`;
    return pruefeAbschnitt(gefunden.schlange, aktion.neueReihenfolge);
  },

  betroffene: betroffenerBesitzer,

  wirke(zustand: Spielzustand, aktion: SchlangenhaeutungSpielenAktion): Spielzustand {
    legeAufEigenenAblagestapel(zustand, aktion.spielerId, aktion.karteId);
    const { schlange, besitzer } = gepruefteSchlange(zustand, aktion.schlangenId);
    const vorher = [...schlange.karten];
    const abschnitt = new Set(aktion.neueReihenfolge);
    const erste = schlange.karten.findIndex((karte) => abschnitt.has(karte.id));
    const neu = aktion.neueReihenfolge.map((id) => schlange.karten.find((karte) => karte.id === id)!);
    schlange.karten.splice(erste, neu.length, ...neu);
    merkeHaeutung(zustand, spielerIndexVon(zustand, aktion.spielerId), besitzer, vorher, schlange.karten);
    return zustand;
  },
};
