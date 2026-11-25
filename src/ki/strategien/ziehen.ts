import type { SpielAktion, Spielkarte } from '../../engine';
import type { Sicht } from '../sicht';
import { haltewert } from './bewertung';
import { besteAnlage, hoechster, kartensaetze, mitHand, mittel, schaetzwert } from './schaetzung';
import type { Schaetzrechnung } from './schaetzung';

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

/** Legt nacheinander bis zu `anzahl` der `karten` dorthin, wo es am meisten bringt, solange es etwas bringt; der Wert `jetzt` der geschätzten Sicht danach. */
function legeBeste(wert: (stand: Sicht) => number, stand: Sicht, jetzt: number, karten: readonly Spielkarte[], anzahl: number): number {
  if (anzahl === 0) return jetzt;
  const anlagen = karten.flatMap((karte) => {
    const anlage = besteAnlage(wert, stand, karte, true);
    return anlage === undefined ? [] : [{ karte, ...anlage }];
  });
  const beste = hoechster(anlagen, (anlage) => anlage.wert);
  if (beste === undefined || beste.wert <= jetzt) return jetzt;
  return legeBeste(wert, beste.stand, beste.wert, karten.filter((karte) => karte !== beste.karte), anzahl - 1);
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
    const werte = saetze.map((karten) => {
      const stand = mitHand(ohneKorb, karten);
      return legeBeste(wert, stand, wert(stand), karten, KORB_SPIELEN);
    });
    geschaetzt.push({ aktion: korb, wert: mittel(werte) });
  }
  const haltewerte = new Map(sicht.hand.map((karte) => [karte.id, haltewert(karte, sicht)]));
  const abwerfen = hoechster(
    aktionen.flatMap((aktion) => (aktion.typ === 'ZweiAbwerfenDreiZiehen' ? [aktion] : [])),
    (aktion) => -aktion.karteIds.reduce((summe, id) => summe + (haltewerte.get(id) ?? 0), 0),
  );
  if (abwerfen !== undefined) {
    geschaetzt.push({ aktion: abwerfen, wert: mittel(saetze.map((karten) => wert(mitHand(sicht, karten, new Set(abwerfen.karteIds))))) });
  }
  return hoechster(geschaetzt, (eintrag) => eintrag.wert) ?? null;
}
