import type { FarbkarteInfo, RisikoKarteSpielenAktion, Schlange, SpielAktion, Spielkarte } from '../../engine';
import type { Sicht } from '../sicht';
import { GLEICH, haltewert } from './bewertung';
import { STICHPROBE, mitHand, mittel, schaetzwert, verteilt } from './schaetzung';
import type { Schaetzrechnung } from './schaetzung';
import { ersetze, folgeSicht } from './vorauswahl';

/*
Risiko-Belohnungs-Karten für die solide KI (A8.2, D51 bis D55, Plan K4 Kriterium 2).
Was die Risikoprüfung aufdeckt, weiss die KI vorher nicht (B2, K2.7): Sie rechnet mit
den offenen Wahrscheinlichkeiten, also mit dem Anteil der Farb- und Sonderkarten unter
den Karten, die sie nicht sieht. Den Wert jedes Ausgangs schätzt sie über mehrere
Karten dieses Ausgangs gemittelt (`schaetzung.ts`).

- Aktion 1, Erfolg: die Farbkarte und zwei weitere auf die Hand. Misserfolg: Die
  Sonderkarte bekommt der Gegner, dem sie am wenigsten nützt; die KI wählt ihn.
- Aktion 2 mit der Farbkarte der Hand, die am wenigsten wert ist: Erfolg legt die beste
  Farbkarte der Hand oder die aufgedeckte an ein Ende einer eigenen Schlange, die
  aufgedeckte bleibt sonst auf der Hand (D52). Misserfolg: Der Begünstigte nimmt die
  benannte Karte (D52, die erste Wahl wie in der Zugsuche).
- Aktion 3 mit den TAUSCH_KANDIDATEN Schlangenkarten, deren Tausch am meisten brächte:
  Erfolg (gleicher Punktewert) tauscht gegen die beste Farbkarte der Hand oder lässt es
  (D53, D75), die aufgedeckte kommt auf die Hand (D51). Eine Farbkarte mit anderem
  Punktewert kommt davor oder dahinter, eine Sonderkarte ändert nichts.
- Aktion 4, Erfolg: die aufgedeckte und eine weitere Karte vom Stapel oder eine Karte des
  eigenen Ablagestapels, ohne Schlangenkorb (D54, D69). Misserfolg: Der Begünstigte
  bekommt eine Karte.

Die KI spielt die Risiko-Karte mit dem höchsten Erwartungswert, wenn er die Bewertung
von jetzt übersteigt. Weil die Bewertung jede Risiko-Karte in der Auslage mitzählt
(`erweiterungswert.ts`), lohnt sie sich nur, wenn sie mehr bringt, als sie liegend wert
ist; ohne Nutzen spielt die KI sie nicht, auch nicht im ersten Zug.
*/

/** Wie viele Schlangenkarten für Aktion 3 ganz durchgerechnet werden. */
const TAUSCH_KANDIDATEN = 2;
/** Wie viele Karten des eigenen Ablagestapels für Aktion 4 in Frage kommen. */
const ABLAGE_KANDIDATEN = 2;

/** Ein Ausgang der Risikoprüfung: wie wahrscheinlich und was er im Mittel wert ist. */
type Ausgang = [anteil: number, werte: number[]];

/** Der Erwartungswert über die Ausgänge; ein Ausgang ohne Karte kommt nicht vor. */
function erwartung(ausgaenge: readonly Ausgang[]): number {
  return ausgaenge.reduce((summe, [anteil, werte]) => (anteil === 0 || werte.length === 0 ? summe : summe + anteil * mittel(werte)), 0);
}

/** Die eigene Schlange `schlangenId`, verändert mit `aendere`. */
function mitSchlange(sicht: Sicht, schlangenId: string, aendere: (schlange: Schlange) => Schlange): Sicht {
  const eigen = sicht.spieler[sicht.ich];
  const schlangen = eigen.schlangen.map((schlange) => (schlange.id === schlangenId ? aendere(schlange) : schlange));
  return { ...sicht, spieler: sicht.spieler.map((spieler, index) => (index === sicht.ich ? { ...spieler, schlangen } : spieler)) };
}

/** Die Rechnung eines Schritts: Bewertung mit den noch freien Aufgaben, die ungesehenen Karten und die Sicht ohne die gespielte Risiko-Karte. */
function rechner(sicht: Sicht, rechnung: Schaetzrechnung) {
  const wert = schaetzwert(rechnung);
  const eigen = sicht.spieler[sicht.ich];
  const ohne: Sicht = { ...sicht, spieler: sicht.spieler.map((spieler, index) => (index === sicht.ich ? { ...spieler, risikoKarten: eigen.risikoKarten.slice(1) } : spieler)) };
  const ungesehen = rechnung.stellung.ungesehen();
  const farbkarten = ungesehen.flatMap((karte) => (karte.typ === 'Farbkarte' ? [karte] : []));
  const anteil = (zahl: number) => zahl / ungesehen.length;
  const stichprobe = <T>(karten: readonly T[], werte: (karte: T, nummer: number) => number) => verteilt(karten, STICHPROBE).map(werte);
  /** Weitere `anzahl` Karten vom Stapel nach `karte`, je Stichprobe an anderen Stellen. */
  const weitere = (karte: Spielkarte, nummer: number, anzahl: number) => verteilt(ungesehen.filter((eintrag) => eintrag !== karte), anzahl, (nummer + 1) / (STICHPROBE + 1));
  /** Ein Gegner bekommt `anzahl` Karten auf die Hand; die KI wählt den, dem es am wenigsten nützt. */
  const beguenstigt = (stand: Sicht, anzahl = 1) =>
    Math.max(
      ...stand.spieler.flatMap((_, index) =>
        index === stand.ich ? [] : [wert({ ...stand, spieler: stand.spieler.map((spieler, platz) => (platz === index ? { ...spieler, handgroesse: spieler.handgroesse + anzahl } : spieler)) })],
      ),
    );
  return { wert, ohne, eigen, farbkarten, anteil, stichprobe, weitere, beguenstigt };
}

type Rechner = ReturnType<typeof rechner>;

/** A8.2 Aktion 1. */
function zusaetzlicheKarten(r: Rechner): number {
  const erfolg = r.stichprobe(r.farbkarten, (farbkarte, nummer) => r.wert(mitHand(r.ohne, [farbkarte, ...r.weitere(farbkarte, nummer, 2)])));
  return erwartung([
    [r.anteil(r.farbkarten.length), erfolg],
    [1 - r.anteil(r.farbkarten.length), [r.beguenstigt(r.ohne)]],
  ]);
}

/** Die beste Stelle für eine Farbkarte der Hand an einem Ende einer eigenen Schlange (A8.2 Aktion 2, D52). */
function besteAnlage(r: Rechner, stand: Sicht): number {
  const spielerId = r.eigen.id;
  const werte = stand.hand.flatMap((karte) =>
    karte.typ !== 'Farbkarte'
      ? []
      : r.eigen.schlangen.flatMap((schlange) =>
          (['anfang', 'ende'] as const).map((seite) => r.wert(folgeSicht(stand, { typ: 'FarbkarteLegen', spielerId, karteId: karte.id, ziel: { art: 'schlange', schlangenId: schlange.id, seite } }))),
        ),
  );
  return Math.max(...werte);
}

/** A8.2 Aktion 2 mit der benannten Farbkarte. */
function zusaetzlicheFarbkarte(r: Rechner, benannt: FarbkarteInfo): number {
  const erfolg = r.stichprobe(r.farbkarten, (farbkarte) => besteAnlage(r, mitHand(r.ohne, [farbkarte])));
  return erwartung([
    [r.anteil(r.farbkarten.length), erfolg],
    [1 - r.anteil(r.farbkarten.length), [r.beguenstigt(mitHand(r.ohne, [], new Set([benannt.id])))]],
  ]);
}

/** Der Tausch der Schlangenkarte gegen die beste Farbkarte der Hand, oder kein Tausch (D53, D75); `dazu` kommt auf die Hand. */
function besterTausch(r: Rechner, schlangenId: string, karte: FarbkarteInfo, dazu: readonly Spielkarte[]): number {
  const getauscht = r.ohne.hand.flatMap((handkarte) =>
    handkarte.typ !== 'Farbkarte' ? [] : [r.wert(mitHand(mitSchlange(r.ohne, schlangenId, ersetze(karte.id, handkarte)), [...dazu, karte], new Set([handkarte.id])))],
  );
  return Math.max(r.wert(mitHand(r.ohne, dazu)), ...getauscht);
}

/** A8.2 Aktion 3 mit der benannten Schlangenkarte. */
function kartenTauschen(r: Rechner, schlangenId: string, karte: FarbkarteInfo): number {
  const gleich = r.farbkarten.filter((farbkarte) => farbkarte.punkte === karte.punkte);
  const andere = r.farbkarten.filter((farbkarte) => farbkarte.punkte !== karte.punkte);
  const daneben = (farbkarte: FarbkarteInfo) =>
    Math.max(
      ...[0, 1].map((versatz) =>
        r.wert(
          mitSchlange(r.ohne, schlangenId, (schlange) => {
            const stelle = schlange.karten.findIndex((eintrag) => eintrag.id === karte.id) + versatz;
            return { ...schlange, karten: [...schlange.karten.slice(0, stelle), farbkarte, ...schlange.karten.slice(stelle)] };
          }),
        ),
      ),
    );
  return erwartung([
    [r.anteil(gleich.length), r.stichprobe(gleich, (farbkarte) => besterTausch(r, schlangenId, karte, [farbkarte]))],
    [r.anteil(andere.length), r.stichprobe(andere, daneben)],
    [1 - r.anteil(r.farbkarten.length), [r.wert(r.ohne)]],
  ]);
}

/** A8.2 Aktion 4. */
function ablageOderStapel(r: Rechner): number {
  const ablage = r.eigen.ablagestapel.filter((karte) => karte.typ === 'Farbkarte' || karte.name !== 'Schlangenkorb des Glücks');
  const beste = [...ablage].sort((a, b) => haltewert(b, r.ohne) - haltewert(a, r.ohne)).slice(0, ABLAGE_KANDIDATEN);
  const erfolg = r.stichprobe(r.farbkarten, (farbkarte, nummer) =>
    Math.max(...[...beste.map((karte) => [karte]), r.weitere(farbkarte, nummer, 1)].map((dazu) => r.wert(mitHand(r.ohne, [farbkarte, ...dazu])))),
  );
  return erwartung([
    [r.anteil(r.farbkarten.length), erfolg],
    [1 - r.anteil(r.farbkarten.length), [r.beguenstigt(r.ohne)]],
  ]);
}

/** Die Farbkarte einer eigenen Schlange mit ihrer Schlange. */
function schlangenkarte(sicht: Sicht, karteId: string | null): { schlangenId: string; karte: FarbkarteInfo } | null {
  for (const schlange of sicht.spieler[sicht.ich].schlangen) {
    const karte = schlange.karten.find((eintrag) => eintrag.id === karteId);
    if (karte?.typ === 'Farbkarte') return { schlangenId: schlange.id, karte };
  }
  return null;
}

/**
 * Die Risiko-Karte, die die KI jetzt spielt, oder `null`, wenn keine im Erwartungswert
 * mehr bringt, als die Bewertung jetzt zeigt. Gewählt wird eine aus `aktionen`.
 */
export function waehleRisiko(sicht: Sicht, aktionen: readonly SpielAktion[], rechnung: Schaetzrechnung): RisikoKarteSpielenAktion | null {
  const angeboten = aktionen.flatMap((aktion) => (aktion.typ === 'RisikoKarteSpielen' ? [aktion] : []));
  if (angeboten.length === 0 || rechnung.stellung.ungesehen().length === 0) return null;
  const r = rechner(sicht, rechnung);
  const handkarte = (aktion: RisikoKarteSpielenAktion) => sicht.hand.find((karte) => karte.id === aktion.benannt);
  const zweite = angeboten
    .flatMap((aktion) => {
      const karte = handkarte(aktion);
      return aktion.risikoAktion === 2 && karte?.typ === 'Farbkarte' ? [{ aktion, karte }] : [];
    })
    .sort((a, b) => haltewert(a.karte, sicht) - haltewert(b.karte, sicht))
    .slice(0, 1);
  const dritte = angeboten
    .flatMap((aktion) => {
      const ort = aktion.risikoAktion === 3 ? schlangenkarte(sicht, aktion.benannt) : null;
      return ort === null ? [] : [{ aktion, ...ort, vorwert: besterTausch(r, ort.schlangenId, ort.karte, []) }];
    })
    .sort((a, b) => b.vorwert - a.vorwert)
    .slice(0, TAUSCH_KANDIDATEN);
  const werte: Array<{ aktion: RisikoKarteSpielenAktion; wert: number }> = [
    ...angeboten.flatMap((aktion) => (aktion.risikoAktion === 1 ? [{ aktion, wert: zusaetzlicheKarten(r) }] : [])),
    ...zweite.map(({ aktion, karte }) => ({ aktion, wert: zusaetzlicheFarbkarte(r, karte) })),
    ...dritte.map(({ aktion, schlangenId, karte }) => ({ aktion, wert: kartenTauschen(r, schlangenId, karte) })),
    ...angeboten.flatMap((aktion) => (aktion.risikoAktion === 4 ? [{ aktion, wert: ablageOderStapel(r) }] : [])),
  ];
  const jetzt = r.wert(sicht);
  const beste = werte.reduce<{ aktion: RisikoKarteSpielenAktion; wert: number } | null>((bisher, eintrag) => (bisher === null || eintrag.wert > bisher.wert ? eintrag : bisher), null);
  return beste !== null && beste.wert > jetzt + GLEICH ? beste.aktion : null;
}
