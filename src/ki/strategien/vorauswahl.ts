import type { Schlange, SpielAktion, Spielkarte } from '../../engine';
import type { Sicht, SpielerSicht } from '../sicht';
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
    case 'SchlangenkorbSpielen':
      if (aktion.bonus.art === 'entfernen') aendereSchlange(sicht, aenderung, aktion.bonus.ziel.schlangenId, entfernen(aktion.bonus.ziel.karteId));
      if (aktion.bonus.art === 'tauschen') {
        for (const { schlangenId, karteId, handkarteId } of aktion.bonus.tausch) {
          const handkarte = sicht.hand.find((eintrag) => eintrag.id === handkarteId);
          if (handkarte !== undefined) aendereSchlange(sicht, aenderung, schlangenId, ersetze(karteId, handkarte));
        }
      }
      break;
    default:
      break;
  }
  return aenderung;
}

/** Legt `karte` an den Platz der Karte `karteId` (D44, A8.2 Aktion 3). */
export function ersetze(karteId: string, karte: Spielkarte): (schlange: Schlange) => Schlange {
  return (schlange) => ({ ...schlange, karten: schlange.karten.map((eintrag) => (eintrag.id === karteId ? karte : eintrag)) });
}

/** Was der Korb beim Tauschen von der Hand nimmt und dafür auf die Hand legt (D44); sonst nichts. */
function handNachTausch(sicht: Sicht, aktion: SpielAktion): { weg: Set<string>; dazu: Spielkarte[] } {
  if (aktion.typ !== 'SchlangenkorbSpielen' || aktion.bonus.art !== 'tauschen') return { weg: new Set(), dazu: [] };
  const tausch = aktion.bonus.tausch;
  const dazu = tausch.flatMap(({ schlangenId, karteId }) => karteInSchlange(sicht, schlangenId, karteId) ?? []);
  return { weg: new Set(tausch.map((eintrag) => eintrag.handkarteId)), dazu };
}

/** Die Karte, die eine Aktion von der Hand spielt; `null`, wenn sie keine spielt. */
function gespielteKarte(aktion: SpielAktion): string | null {
  return 'karteId' in aktion ? aktion.karteId : null;
}

/**
 * Die Sicht nach der Aktion, wie die Vorauswahl sie schätzt: die gespielte Karte ist
 * von der Hand, die Schlangen sind wie in `folgeSchlangen`, eine Grube liegt vor ihrem
 * Ziel (A7.6), nach einem Verdoppler folgt der zweite Zug (A7.8). Gegner lassen eine
 * angesagte Karte durch, wie in der Zugsuche.
 */
export function folgeSicht(sicht: Sicht, aktion: SpielAktion): Sicht {
  const id = gespielteKarte(aktion);
  const karte = id === null ? undefined : sicht.hand.find((eintrag) => eintrag.id === id);
  const aenderung = folgeSchlangen(sicht, aktion, karte);
  const ziel = aktion.typ === 'SchlangengrubeSpielen' ? sicht.spieler.findIndex((spieler) => spieler.id === aktion.zielSpielerId) : -1;
  const getauscht = handNachTausch(sicht, aktion);
  // D36: Jede Sonderkarte aus der Hand zählt als ausgespielt, für „Schlangenmeister“ und „Schlangenrepertoire“ (A9).
  const sonderkarte = karte?.typ === 'Sonderkarte' && sicht.erweiterung ? karte.name : null;
  const spieler = sicht.spieler.map((eintrag, index) => {
    const schlangen = aenderung.get(index) ?? eintrag.schlangen;
    if (index !== sicht.ich || sonderkarte === null) return schlangen === eintrag.schlangen ? eintrag : { ...eintrag, schlangen };
    return { ...eintrag, schlangen, ausgespielteSonderkarten: [...eintrag.ausgespielteSonderkarten, sonderkarte] };
  });
  return {
    ...sicht,
    hand: karte === undefined ? sicht.hand : [...sicht.hand.filter((eintrag) => eintrag !== karte && !getauscht.weg.has(eintrag.id)), ...getauscht.dazu],
    spieler: aenderung.size === 0 && sonderkarte === null ? sicht.spieler : spieler,
    ausliegendeGruben: karte?.typ === 'Sonderkarte' && ziel >= 0 ? [...sicht.ausliegendeGruben, { karte, gespieltVon: sicht.ich, vor: ziel }] : sicht.ausliegendeGruben,
    zug: aktion.typ === 'VerdopplerSpielen' ? { ...sicht.zug, verdopplerGespielt: true } : sicht.zug,
  };
}

/** Die eigenen Punkte nach der Aktion (A11), geschätzt wie oben, ohne Simulation und ohne `bewerte` (Plan K3, Kriterium 3). */
export function punkteNach(sicht: Sicht, aktion: SpielAktion, merker: Wertungsmerker): number {
  return eigenePunkte(folgeSicht(sicht, aktion), merker);
}

/** Was die Aufgaben einer geschätzten Sicht zur Bewertung beitragen (`aufgabenkorrektur`, Plan K4). */
export type Aufgabenpruefung = (eigen: SpielerSicht) => number;

/** Aktionen, die nur den Zug um bekannte Karten erweitern und selbst nichts legen: Comeback-Karte und Korb „aktionen“ (A8.1, A7.10, D46). */
export function erweitertZug(aktion: SpielAktion): boolean {
  return aktion.typ === 'ComebackEinsetzen' || (aktion.typ === 'SchlangenkorbSpielen' && aktion.bonus.art === 'aktionen');
}

/** Die Tausche eines Korbs als Text, je Tausch Schlangenkarte und Handkarte (D44); leer für jede andere Aktion. */
function tauschschluessel(aktion: SpielAktion): string[] {
  return aktion.typ === 'SchlangenkorbSpielen' && aktion.bonus.art === 'tauschen' ? aktion.bonus.tausch.map((eintrag) => `${eintrag.karteId}>${eintrag.handkarteId}`) : [];
}

/** Bis zu so vielen Korb-Tauschen zweier Karten schätzt die Vorauswahl jeden (K2, Kriterium 8, mit Korb). */
const TAUSCHPAARE_ALLE = 400;
/** Sind es mehr, bildet sie Paare nur aus so vielen der besten einzelnen Tausche. */
const BESTE_TAUSCHE = 6;

interface Geschaetzt {
  aktion: SpielAktion;
  stelle: number;
  wert: number;
}

/** Höherer Vorwert zuerst, bei Gleichstand die Reihenfolge der Engine. */
function nachWert(a: Geschaetzt, b: Geschaetzt): number {
  return b.wert - a.wert || a.stelle - b.stelle;
}

/**
 * Die Aktionen in der Reihenfolge, in der sie durchgerechnet werden: vorn höchstens
 * `anzahl`, die mit dem höchsten Vorwert, von jeder Handkarte mindestens ihre beste und
 * jede Aktion, die nur den Zug erweitert (`erweitertZug`); dahinter die übrigen nach
 * Vorwert, für eine Nachlese. Bei gleichem Vorwert gilt die Reihenfolge der Engine,
 * damit die Wahl nur von der Sicht abhängt. Zum Vorwert zählen die Aufgaben, die die
 * geschätzte Sicht erfüllte (`aufgaben`). Korb-Tausche zweier Karten schätzt sie alle,
 * solange es höchstens TAUSCHPAARE_ALLE sind; mit langen Schlangen sind es Tausende,
 * dann nur Paare aus den BESTE_TAUSCHE besten einzelnen, und die übrigen fallen weg. `bewertet` sagt, wie oft dafür `bewerte` lief: einmal je
 * geschätzter Aktion, oder gar nicht, wenn alle in die Auswahl passen (Kriterium 8).
 */
export function vorauswahl(
  sicht: Sicht,
  aktionen: readonly SpielAktion[],
  anzahl: number,
  merker: Wertungsmerker,
  aufgaben: Aufgabenpruefung,
): { geordnet: SpielAktion[]; bewertet: number } {
  if (aktionen.length <= anzahl) return { geordnet: [...aktionen], bewertet: 0 };
  const schaetze = (aktion: SpielAktion, stelle: number): Geschaetzt => {
    const danach = folgeSicht(sicht, aktion);
    return { aktion, stelle, wert: bewerte(danach, merker) + aufgaben(danach.spieler[sicht.ich]) };
  };
  const paar = (aktion: SpielAktion) => tauschschluessel(aktion).length > 1;
  const einzeln = aktionen.flatMap((aktion, stelle) => (paar(aktion) ? [] : [schaetze(aktion, stelle)]));
  const besteTausche = einzeln.filter(({ aktion }) => tauschschluessel(aktion).length === 1).sort(nachWert).slice(0, BESTE_TAUSCHE);
  const beste = new Set(besteTausche.flatMap(({ aktion }) => tauschschluessel(aktion)));
  const allePaare = aktionen.filter(paar).length <= TAUSCHPAARE_ALLE;
  const paare = aktionen.flatMap((aktion, stelle) => (paar(aktion) && (allePaare || tauschschluessel(aktion).every((schluessel) => beste.has(schluessel))) ? [schaetze(aktion, stelle)] : []));
  const geordnet = [...einzeln, ...paare].sort(nachWert);
  const gewaehlt = new Set<number>();
  const karten = new Set<string | null>();
  for (const eintrag of geordnet) {
    const karte = gespielteKarte(eintrag.aktion);
    if (!karten.has(karte) || erweitertZug(eintrag.aktion)) gewaehlt.add(eintrag.stelle);
    karten.add(karte);
  }
  for (const eintrag of geordnet) if (gewaehlt.size < anzahl) gewaehlt.add(eintrag.stelle);
  const reihenfolge = [...geordnet.filter((eintrag) => gewaehlt.has(eintrag.stelle)), ...geordnet.filter((eintrag) => !gewaehlt.has(eintrag.stelle))];
  return { geordnet: reihenfolge.map((eintrag) => eintrag.aktion), bewertet: geordnet.length };
}
