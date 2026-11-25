import { MAX_SCHLANGEN_PRO_SPIELER } from '../../engine';
import type { Farbkartenziel, SpielAktion, Spielkarte } from '../../engine';
import type { Sicht } from '../sicht';
import { haltewert } from './bewertung';
import { kartensaetze, mitHand, mittel, schaetzwert } from './schaetzung';
import type { Schaetzrechnung } from './schaetzung';
import { folgeSicht } from './vorauswahl';

/*
Verdeckt ziehen (Plan K4, Kriterium 2): der Schlangenkorb mit „ziehen“ (A7.10, D43)
und „Zwei Karten abwerfen, drei ziehen“ als Zusatzaktion (A8.1, D49). Welche Karten
kommen, weiss die KI nicht (B2). Auf dem erratenen Zustand der Suche wären es drei
zufällige Karten, und die besten davon sähe die Suche als sicher an; eine Aktion, die
nur zufällig gut geraten ist, gewönne so gegen sichere. Die KI schätzt das Ziehen
deshalb über mehrere Kartensätze gemittelt (`schaetzung.ts`):

- Korb „ziehen“: der Korb ist aus dem Spiel, drei Karten kommen auf die Hand; davon legt
  die KI nacheinander bis zu zwei dorthin, wo sie am meisten bringen, an ein Ende einer
  eigenen Schlange oder als neue Schlange (D43, die zwei Zusatzaktionen gelten nur für sie).
- „Zwei abwerfen, drei ziehen“: die zwei Handkarten, die am wenigsten wert sind, gehen
  auf den Ablagestapel, drei Karten kommen auf die Hand.

Die Zugsuche nimmt die Schätzung, wenn sie höher liegt als ihr bester Plan.
*/

/** Wie viele Karten der Korb und die Zusatzaktion ziehen (A7.10, A8.1). */
const ZIEHEN = 3;
/** Wie viele der gezogenen Karten der Korb zusätzlich spielen lässt (A7.10). */
const KORB_SPIELEN = 2;

/** Ob die Aktion verdeckt vom Nachziehstapel zieht: Korb „ziehen“ oder „Zwei Karten abwerfen, drei ziehen“. */
export function ziehtVerdeckt(aktion: SpielAktion): boolean {
  return aktion.typ === 'ZweiAbwerfenDreiZiehen' || (aktion.typ === 'SchlangenkorbSpielen' && aktion.bonus.art === 'ziehen');
}

/** Die geschätzte Sicht, nachdem die Farbkarte `karte` der Hand an ihrer besten Stelle liegt: an einem Ende einer eigenen Schlange oder als neue Schlange. */
function besteAnlage(wert: (stand: Sicht) => number, stand: Sicht, karte: Spielkarte): { stand: Sicht; wert: number } | null {
  if (karte.typ !== 'Farbkarte') return null;
  const eigen = stand.spieler[stand.ich];
  const ziele: Farbkartenziel[] = [
    ...eigen.schlangen.flatMap((schlange) => (['anfang', 'ende'] as const).map((seite): Farbkartenziel => ({ art: 'schlange', schlangenId: schlange.id, seite }))),
    ...(eigen.schlangen.length < MAX_SCHLANGEN_PRO_SPIELER ? [{ art: 'neueSchlange' } as const] : []),
  ];
  return ziele
    .map((ziel) => folgeSicht(stand, { typ: 'FarbkarteLegen', spielerId: eigen.id, karteId: karte.id, ziel }))
    .reduce<{ stand: Sicht; wert: number } | null>((beste, nachher) => {
      const geschaetzt = wert(nachher);
      return beste === null || geschaetzt > beste.wert ? { stand: nachher, wert: geschaetzt } : beste;
    }, null);
}

/** Legt nacheinander bis zu `anzahl` der `karten` dorthin, wo es am meisten bringt, solange es etwas bringt; der Wert der geschätzten Sicht danach. */
function legeBeste(wert: (stand: Sicht) => number, stand: Sicht, karten: readonly Spielkarte[], anzahl: number): number {
  const jetzt = wert(stand);
  if (anzahl === 0) return jetzt;
  const beste = karten
    .map((karte) => ({ karte, anlage: besteAnlage(wert, stand, karte) }))
    .reduce<{ karte: Spielkarte; stand: Sicht; wert: number } | null>((bisher, { karte, anlage }) => (anlage !== null && (bisher === null || anlage.wert > bisher.wert) ? { karte, ...anlage } : bisher), null);
  if (beste === null || beste.wert <= jetzt) return jetzt;
  return legeBeste(wert, beste.stand, karten.filter((karte) => karte !== beste.karte), anzahl - 1);
}

/** Die Aktion, die verdeckt zieht, mit ihrem geschätzten Wert; `null`, wenn keine angeboten ist. */
export function schaetzeZiehen(sicht: Sicht, aktionen: readonly SpielAktion[], rechnung: Schaetzrechnung): { aktion: SpielAktion; wert: number } | null {
  if (!aktionen.some(ziehtVerdeckt)) return null;
  const wert = schaetzwert(rechnung);
  // D43: Liegen weniger Karten im Stapel, zieht man, was da ist.
  const saetze = kartensaetze(rechnung.stellung.ungesehen(), Math.min(ZIEHEN, sicht.nachziehstapelGroesse));
  const korb = aktionen.find((aktion) => aktion.typ === 'SchlangenkorbSpielen' && aktion.bonus.art === 'ziehen');
  const geschaetzt: Array<{ aktion: SpielAktion; wert: number }> = [];
  if (korb?.typ === 'SchlangenkorbSpielen') {
    const ohneKorb = mitHand(sicht, [], new Set([korb.karteId]));
    const werte = saetze.map((karten) => legeBeste(wert, mitHand(ohneKorb, karten), karten, KORB_SPIELEN));
    geschaetzt.push({ aktion: korb, wert: mittel(werte) });
  }
  const verlust = (aktion: SpielAktion) => (aktion.typ !== 'ZweiAbwerfenDreiZiehen' ? Infinity : sicht.hand.filter((karte) => aktion.karteIds.includes(karte.id)).reduce((summe, karte) => summe + haltewert(karte, sicht), 0));
  const abwerfen = aktionen.filter((aktion) => aktion.typ === 'ZweiAbwerfenDreiZiehen').reduce<SpielAktion | undefined>((beste, aktion) => (beste === undefined || verlust(aktion) < verlust(beste) ? aktion : beste), undefined);
  if (abwerfen?.typ === 'ZweiAbwerfenDreiZiehen') {
    geschaetzt.push({ aktion: abwerfen, wert: mittel(saetze.map((karten) => wert(mitHand(sicht, karten, new Set(abwerfen.karteIds))))) });
  }
  return geschaetzt.reduce<{ aktion: SpielAktion; wert: number } | null>((beste, eintrag) => (beste === null || eintrag.wert > beste.wert ? eintrag : beste), null);
}
