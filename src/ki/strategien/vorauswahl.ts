import type { Schlange, SpielAktion, Spielkarte } from '../../engine';
import type { Sicht } from '../sicht';
import { bewerte, eigenePunkte } from './bewertung';
import type { Wertungsmerker } from './bewertung';

/*
Die Vorauswahl der Zugsuche (Plan K2, Kriterium 8). Der Farbendieb allein bietet in
späten Stellungen über tausend Aktionen an, der Schlangenfrass Hunderte; jede
durchzurechnen kostet eine Simulation. Die Vorauswahl schätzt deshalb jede Aktion
ohne Simulation, aber mit derselben Bewertung wie die Zugsuche (`bewerte`): Sie baut
die Sicht danach selbst, so wie die Aktion es beschreibt (wohin eine Karte kommt,
welche wegkommt, die Karte ist von der Hand, eine Grube liegt aus, ein Verdoppler
gibt den zweiten Zug), und bewertet sie. Unveränderte Schlangen kosten dabei dank
des Merkers fast nichts. So fällt kein Zug, den die Bewertung höher stellt,
systematisch heraus (Prüfprotokoll K2, Mangel 1, und die Befunde des Codex-Reviews
dazu).

Die Vorauswahl entscheidet nichts. Ob eine Aktion erlaubt ist, sagt die Engine; was
sie wirklich bewirkt, die Simulation in `zugsuche.ts`. Damit jede Handkarte eine
Chance bekommt, kommt von jeder Karte ihre beste Aktion mit.

Eine Ausnahme nutzt die geschätzte Sicht für eine feste Regel (`punkteNach`, Plan K3,
Kriterium 3): Ob eine Farbkarte an eine eigene Schlange die eigenen Punkte hebt. Eine
Farbkarte an ein Ende oder als neue Schlange bildet die Schätzung genau so ab wie die
Engine; das prüft der Test zu K3.3 in Partien gegen die Endwertung der Engine.
*/

/** Je Besitzer seine Schlangen, wie sie nach der Aktion aussähen; nur wer sich ändert, steht darin. */
type Aenderung = Map<number, Schlange[]>;

function schlangenVon(sicht: Sicht, aenderung: Aenderung, besitzer: number): Schlange[] {
  return aenderung.get(besitzer) ?? sicht.spieler[besitzer].schlangen;
}

/** Ersetzt die Schlange `schlangenId`, gleich wem sie gehört; eine leer gewordene fällt weg. */
function aendereSchlange(sicht: Sicht, aenderung: Aenderung, schlangenId: string, neu: (schlange: Schlange) => Schlange): void {
  for (const besitzer of sicht.spieler.keys()) {
    const liste = schlangenVon(sicht, aenderung, besitzer);
    const stelle = liste.findIndex((schlange) => schlange.id === schlangenId);
    if (stelle < 0) continue;
    const ersatz = neu(liste[stelle]);
    aenderung.set(besitzer, ersatz.karten.length === 0 ? liste.filter((_, index) => index !== stelle) : liste.map((schlange, index) => (index === stelle ? ersatz : schlange)));
    return;
  }
}

function legeNeu(sicht: Sicht, aenderung: Aenderung, karte: Spielkarte): void {
  aenderung.set(sicht.ich, [...schlangenVon(sicht, aenderung, sicht.ich), { id: 'neu', karten: [karte], fusionen: [] }]);
}

/** Die Karte an die Lücke `position` (0 vor der ersten Karte). */
function einfuegen(karte: Spielkarte, position: number): (schlange: Schlange) => Schlange {
  return (schlange) => ({ ...schlange, karten: [...schlange.karten.slice(0, position), karte, ...schlange.karten.slice(position)] });
}

/** Nimmt die Karte heraus; unter einer Fusion liegen danach wieder die beiden Karten (A7.4). */
function entfernen(karteId: string): (schlange: Schlange) => Schlange {
  return (schlange) => {
    const fusion = schlange.fusionen.find((eintrag) => eintrag.karteId === karteId);
    return {
      ...schlange,
      karten: schlange.karten.flatMap((karte) => (karte.id !== karteId ? [karte] : (fusion?.unter ?? []))),
      fusionen: schlange.fusionen.filter((eintrag) => eintrag !== fusion),
    };
  };
}

/** Legt die Fusion auf die beiden Karten ab der linken (A7.7). */
function fusioniere(karte: Spielkarte, linksId: string): (schlange: Schlange) => Schlange {
  return (schlange) => {
    const links = schlange.karten.findIndex((eintrag) => eintrag.id === linksId);
    const [erste, zweite] = [schlange.karten[links], schlange.karten[links + 1]];
    if (erste?.typ !== 'Farbkarte' || zweite?.typ !== 'Farbkarte') return schlange;
    return {
      ...schlange,
      karten: [...schlange.karten.slice(0, links), karte, ...schlange.karten.slice(links + 2)],
      fusionen: [...schlange.fusionen, { karteId: karte.id, unter: [erste, zweite] }],
    };
  };
}

/** Ordnet die genannten Karten an ihren Stellen neu (A7.9). */
function haeute(reihenfolge: readonly string[]): (schlange: Schlange) => Schlange {
  return (schlange) => {
    const neu = reihenfolge.flatMap((id) => schlange.karten.filter((karte) => karte.id === id));
    const stellen = new Set(reihenfolge);
    let naechste = 0;
    return { ...schlange, karten: schlange.karten.map((karte) => (stellen.has(karte.id) ? (neu[naechste++] ?? karte) : karte)) };
  };
}

function karteInSchlange(sicht: Sicht, schlangenId: string, karteId: string): Spielkarte | undefined {
  return sicht.spieler.flatMap((spieler) => spieler.schlangen).find((schlange) => schlange.id === schlangenId)?.karten.find((karte) => karte.id === karteId);
}

/** Die Schlangen, die sich durch die Aktion ändern; leer für Aktionen, die keine Schlange ändern. */
function folgeSchlangen(sicht: Sicht, aktion: SpielAktion, karte: Spielkarte | undefined): Aenderung {
  const aenderung: Aenderung = new Map();
  if (karte === undefined) return aenderung;
  switch (aktion.typ) {
    case 'FarbkarteLegen':
      if (aktion.ziel.art === 'neueSchlange') legeNeu(sicht, aenderung, karte);
      else {
        const anfang = aktion.ziel.seite === 'anfang';
        aendereSchlange(sicht, aenderung, aktion.ziel.schlangenId, (schlange) => einfuegen(karte, anfang ? 0 : schlange.karten.length)(schlange));
      }
      break;
    case 'RegenbogenschlangeLegen':
    case 'BlockadeLegen':
      aendereSchlange(sicht, aenderung, aktion.schlangenId, einfuegen(karte, aktion.position));
      break;
    case 'FusionLegen':
      aendereSchlange(sicht, aenderung, aktion.schlangenId, fusioniere(karte, aktion.kartenIds[0]));
      break;
    case 'FarbendiebSpielen': {
      const beute = karteInSchlange(sicht, aktion.quelle.schlangenId, aktion.quelle.karteId);
      if (beute === undefined) break;
      aendereSchlange(sicht, aenderung, aktion.quelle.schlangenId, entfernen(beute.id));
      if (aktion.ziel.art === 'neueSchlange') legeNeu(sicht, aenderung, beute);
      else aendereSchlange(sicht, aenderung, aktion.ziel.schlangenId, einfuegen(beute, aktion.ziel.position));
      break;
    }
    case 'SchlangenfrassSpielen':
      for (const ziel of aktion.ziele) aendereSchlange(sicht, aenderung, ziel.schlangenId, entfernen(ziel.karteId));
      break;
    case 'SchlangenhaeutungSpielen':
      aendereSchlange(sicht, aenderung, aktion.schlangenId, haeute(aktion.neueReihenfolge));
      break;
    default:
      break;
  }
  return aenderung;
}

/** Die Karte, die eine Aktion von der Hand spielt; `null`, wenn sie keine spielt. */
function gespielteKarte(aktion: SpielAktion): string | null {
  switch (aktion.typ) {
    case 'ZugBeenden':
    case 'UeberhandAbwerfen':
    case 'Reagieren':
    case 'Entscheiden':
    case 'AbwerfenUndZiehen':
      return null;
    default:
      return aktion.karteId;
  }
}

/**
 * Die Sicht nach der Aktion, wie die Vorauswahl sie schätzt: die gespielte Karte ist
 * von der Hand, die Schlangen sind wie in `folgeSchlangen`, eine Grube liegt vor ihrem
 * Ziel (A7.6), nach einem Verdoppler folgt der zweite Zug (A7.8). Gegner lassen eine
 * angesagte Karte durch, wie in der Zugsuche.
 */
function folgeSicht(sicht: Sicht, aktion: SpielAktion): Sicht {
  const id = gespielteKarte(aktion);
  const karte = id === null ? undefined : sicht.hand.find((eintrag) => eintrag.id === id);
  const aenderung = folgeSchlangen(sicht, aktion, karte);
  const ziel = aktion.typ === 'SchlangengrubeSpielen' ? sicht.spieler.findIndex((spieler) => spieler.id === aktion.zielSpielerId) : -1;
  return {
    ...sicht,
    hand: karte === undefined ? sicht.hand : sicht.hand.filter((eintrag) => eintrag !== karte),
    spieler: aenderung.size === 0 ? sicht.spieler : sicht.spieler.map((spieler, index) => ({ ...spieler, schlangen: aenderung.get(index) ?? spieler.schlangen })),
    ausliegendeGruben: karte?.typ === 'Sonderkarte' && ziel >= 0 ? [...sicht.ausliegendeGruben, { karte, gespieltVon: sicht.ich, vor: ziel }] : sicht.ausliegendeGruben,
    zug: aktion.typ === 'VerdopplerSpielen' ? { ...sicht.zug, verdopplerGespielt: true } : sicht.zug,
  };
}

/** Die eigenen Punkte nach der Aktion (A11), geschätzt wie oben, ohne Simulation und ohne `bewerte` (Plan K3, Kriterium 3). */
export function punkteNach(sicht: Sicht, aktion: SpielAktion, merker: Wertungsmerker): number {
  return eigenePunkte(folgeSicht(sicht, aktion), merker);
}

/**
 * Die Aktionen in der Reihenfolge, in der sie durchgerechnet werden: vorn höchstens
 * `anzahl`, die mit dem höchsten Vorwert, von jeder Handkarte mindestens ihre beste;
 * dahinter die übrigen nach Vorwert, für eine Nachlese. Bei gleichem Vorwert gilt die
 * Reihenfolge der Engine, damit die Wahl nur von der Sicht abhängt. `bewertet` sagt,
 * wie oft dafür `bewerte` lief: einmal je Aktion, oder gar nicht, wenn alle in die
 * Auswahl passen (Kriterium 8).
 */
export function vorauswahl(sicht: Sicht, aktionen: readonly SpielAktion[], anzahl: number, merker: Wertungsmerker): { geordnet: SpielAktion[]; bewertet: number } {
  if (aktionen.length <= anzahl) return { geordnet: [...aktionen], bewertet: 0 };
  const geordnet = aktionen.map((aktion, stelle) => ({ aktion, stelle, wert: bewerte(folgeSicht(sicht, aktion), merker) })).sort((a, b) => b.wert - a.wert || a.stelle - b.stelle);
  const gewaehlt = new Set<number>();
  const karten = new Set<string | null>();
  for (const eintrag of geordnet) {
    const karte = gespielteKarte(eintrag.aktion);
    if (!karten.has(karte)) gewaehlt.add(eintrag.stelle);
    karten.add(karte);
  }
  for (const eintrag of geordnet) if (gewaehlt.size < anzahl) gewaehlt.add(eintrag.stelle);
  const reihenfolge = [...geordnet.filter((eintrag) => gewaehlt.has(eintrag.stelle)), ...geordnet.filter((eintrag) => !gewaehlt.has(eintrag.stelle))];
  return { geordnet: reihenfolge.map((eintrag) => eintrag.aktion), bewertet: geordnet.length };
}
