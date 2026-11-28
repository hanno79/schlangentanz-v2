import type { SpielAktion } from '../../engine';
import type { Sicht, SpielerSicht } from '../sicht';

/**
 * Welche Karte wohin in die eigenen Schlangen kommt, als Text aus Schlange, Stelle und Art der Handkarte (Farbe oder Name);
 * `null` ausser für einen Korb-Tausch. Tausche mit demselben Text ergeben dieselben eigenen Schlangen bis auf die Ids der Karten (D44).
 */
function tauscharten(sicht: Sicht): (aktion: SpielAktion) => string | null {
  const eigene = sicht.spieler[sicht.ich].schlangen;
  const eigeneIds = new Set(eigene.map((schlange) => schlange.id));
  let stellen: Map<string, string> | undefined;
  const arten = new Map(sicht.hand.map((karte) => [karte.id, karte.typ === 'Farbkarte' ? karte.farbe : karte.name]));
  return (aktion) => {
    if (aktion.typ !== 'SchlangenkorbSpielen' || aktion.bonus.art !== 'tauschen') return null;
    stellen ??= new Map(eigene.flatMap((schlange) => schlange.karten.map((karte, stelle) => [karte.id, `${schlange.id}@${stelle}`] as const)));
    const teile: string[] = [];
    for (const { schlangenId, karteId, handkarteId } of aktion.bonus.tausch) {
      // Ein Tausch in einer fremden Schlange ändert an den eigenen Aufgaben nichts (A9).
      if (!eigeneIds.has(schlangenId)) continue;
      const stelle = stellen.get(karteId);
      const art = arten.get(handkarteId);
      // Eine Karte, die nicht offen in der Schlange liegt (etwa unter einer Farbenfusion), bekommt keinen gemeinsamen Text.
      if (stelle === undefined || art === undefined) return null;
      teile.push(`${stelle}=${art}`);
    }
    return teile.sort().join(',');
  };
}

/**
 * Ob ein Korb-Tausch eine Aufgabe erfüllt (Kriterium 1), mit `aufgaben` wie in der Vorauswahl und `nachTausch`, dem
 * Beitrag der Aufgaben nach dem Tausch. Gemessen gegen den gespielten Korb: Erfüllt schon er eine Aufgabe (A9, D36),
 * zeigen das die einzelnen Tausche. Tausche derselben Art (`tauscharten`) erfüllen dasselbe; jede Art wird einmal geprüft.
 */
export function tauschpruefung(sicht: Sicht, aufgaben: (eigen: SpielerSicht) => number, nachTausch: (aktion: SpielAktion) => number): (aktion: SpielAktion) => boolean {
  const eigen = sicht.spieler[sicht.ich];
  const tauschart = tauscharten(sicht);
  const gemerkt = new Map<string, boolean>();
  let mitKorb: number | undefined;
  return (aktion) => {
    const art = tauschart(aktion);
    let ergebnis = art === null ? undefined : gemerkt.get(art);
    if (ergebnis === undefined) {
      mitKorb ??= aufgaben({ ...eigen, ausgespielteSonderkarten: [...eigen.ausgespielteSonderkarten, 'Schlangenkorb des Glücks'] });
      ergebnis = nachTausch(aktion) > mitKorb;
      if (art !== null) gemerkt.set(art, ergebnis);
    }
    return ergebnis;
  };
}
