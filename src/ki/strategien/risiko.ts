import type { FarbkarteInfo, RisikoKarteSpielenAktion, Schlange, SpielAktion, Spielkarte } from '../../engine';
import type { Sicht } from '../sicht';
import { GLEICH, haltewert } from './bewertung';
import { STICHPROBE, besteAnlage, hoechster, mitGezogenen, mitHand, mittel, nachZiehen, schaetzwert, verteilt } from './schaetzung';
import type { Schaetzrechnung } from './schaetzung';
import { ERSTZUG_HALTEN, imErstenZug } from './eroeffnung';
import { einfuegen, ersetze } from './vorauswahl';

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
ist. Im ersten Zug muss sie die Bewertung zusätzlich um ERSTZUG_HALTEN heben (`eroeffnung.ts`).
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
  // A8.2: Die Risiko-Karte ist aus dem Spiel, die oberste Karte aufgedeckt, gleich wie es ausgeht.
  const ohne = nachZiehen({ ...sicht, spieler: sicht.spieler.map((spieler, index) => (index === sicht.ich ? { ...spieler, risikoKarten: eigen.risikoKarten.slice(1) } : spieler)) }, 1);
  const ungesehen = rechnung.stellung.ungesehen();
  const farbkarten = ungesehen.flatMap((karte) => (karte.typ === 'Farbkarte' ? [karte] : []));
  const anteil = (zahl: number) => zahl / ungesehen.length;
  const stichprobe = <T>(karten: readonly T[], werte: (karte: T, nummer: number) => number) => verteilt(karten, STICHPROBE).map(werte);
  /** Weitere `anzahl` Karten vom Stapel nach `karte`, je Stichprobe an anderen Stellen; nur so viele, wie der Stapel nach dem Aufdecken noch hat (D54). */
  const weitere = (karte: Spielkarte, nummer: number, anzahl: number) =>
    verteilt(
      ungesehen.filter((eintrag) => eintrag !== karte),
      Math.min(anzahl, ohne.nachziehstapelGroesse),
      (nummer + 1) / (STICHPROBE + 1),
    );
  /** Ein Gegner bekommt eine Karte auf die Hand; die KI wählt den, dem es am wenigsten nützt. */
  const beguenstigt = (stand: Sicht) =>
    Math.max(
      ...stand.spieler.flatMap((_, index) =>
        index === stand.ich ? [] : [wert({ ...stand, spieler: stand.spieler.map((spieler, platz) => (platz === index ? { ...spieler, handgroesse: spieler.handgroesse + 1 } : spieler)) })],
      ),
    );
  let ohneWert: number | null = null;
  let ohneBeguenstigt: number | null = null;
  return {
    wert,
    ohne,
    eigen,
    stichprobe,
    weitere,
    farbkarten,
    anteil,
    /** Der Wert ohne die Risiko-Karte, wenn sonst nichts geschieht; einmal je Schritt gerechnet. */
    ohneWert: () => (ohneWert ??= wert(ohne)),
    /**
     * Erwartungswert, wenn eine Farbkarte gelingt (`erfolg` über die Stichprobe) und eine
     * Sonderkarte einem Gegner nützt, ausgehend von `misserfolg` (ohne Angabe die Sicht ohne die Risiko-Karte).
     */
    farbeOderGegner: (erfolg: number[], misserfolg?: Sicht) =>
      erwartung([
        [anteil(farbkarten.length), erfolg],
        [1 - anteil(farbkarten.length), [misserfolg === undefined ? (ohneBeguenstigt ??= beguenstigt(ohne)) : beguenstigt(misserfolg)]],
      ]),
  };
}

type Rechner = ReturnType<typeof rechner>;

/** A8.2 Aktion 1. */
function zusaetzlicheKarten(r: Rechner): number {
  return r.farbeOderGegner(r.stichprobe(r.farbkarten, (farbkarte, nummer) => r.wert(mitGezogenen(mitHand(r.ohne, [farbkarte]), r.weitere(farbkarte, nummer, 2)))));
}

/** Die beste Farbkarte der Hand an einem Ende einer eigenen Schlange (A8.2 Aktion 2, D52: nicht als neue Schlange). */
function besteFarbkarteAnlegen(r: Rechner, stand: Sicht): number {
  return Math.max(...stand.hand.map((karte) => besteAnlage(r.wert, stand, karte, { neueSchlange: false, regenbogen: false })?.wert ?? -Infinity));
}

/** A8.2 Aktion 2 mit der benannten Farbkarte. */
function zusaetzlicheFarbkarte(r: Rechner, benannt: FarbkarteInfo): number {
  const erfolg = r.stichprobe(r.farbkarten, (farbkarte) => besteFarbkarteAnlegen(r, mitHand(r.ohne, [farbkarte])));
  return r.farbeOderGegner(erfolg, mitHand(r.ohne, [], new Set([benannt.id])));
}

/** Der Tausch der Schlangenkarte gegen die beste Farbkarte der Hand, auch die eben aufgedeckte `dazu`, oder kein Tausch (D51, D53, D75). */
function besterTausch(r: Rechner, schlangenId: string, karte: FarbkarteInfo, dazu: readonly Spielkarte[]): number {
  const getauscht = [...r.ohne.hand, ...dazu].flatMap((handkarte) =>
    handkarte.typ !== 'Farbkarte' ? [] : [r.wert(mitHand(mitSchlange(r.ohne, schlangenId, ersetze(karte.id, handkarte)), [...dazu.filter((eintrag) => eintrag !== handkarte), karte], new Set([handkarte.id])))],
  );
  return Math.max(dazu.length === 0 ? r.ohneWert() : r.wert(mitHand(r.ohne, dazu)), ...getauscht);
}

/** A8.2 Aktion 3 mit der benannten Schlangenkarte. */
function kartenTauschen(r: Rechner, schlangenId: string, karte: FarbkarteInfo): number {
  const gleich = r.farbkarten.filter((farbkarte) => farbkarte.punkte === karte.punkte);
  const andere = r.farbkarten.filter((farbkarte) => farbkarte.punkte !== karte.punkte);
  // D53: davor oder dahinter, je nachdem, was mehr bringt.
  const daneben = (farbkarte: FarbkarteInfo) =>
    Math.max(...[0, 1].map((versatz) => r.wert(mitSchlange(r.ohne, schlangenId, (schlange) => einfuegen(farbkarte, schlange.karten.findIndex((eintrag) => eintrag.id === karte.id) + versatz)(schlange)))));
  return erwartung([
    [r.anteil(gleich.length), r.stichprobe(gleich, (farbkarte) => besterTausch(r, schlangenId, karte, [farbkarte]))],
    [r.anteil(andere.length), r.stichprobe(andere, daneben)],
    [1 - r.anteil(r.farbkarten.length), [r.ohneWert()]],
  ]);
}

/** A8.2 Aktion 4. */
function ablageOderStapel(r: Rechner): number {
  const ablage = r.eigen.ablagestapel.flatMap((karte) => (karte.typ === 'Sonderkarte' && karte.name === 'Schlangenkorb des Glücks' ? [] : [{ karte, wert: haltewert(karte, r.ohne) }]));
  const beste = ablage
    .sort((a, b) => b.wert - a.wert)
    .slice(0, ABLAGE_KANDIDATEN)
    .map(({ karte }) => karte);
  const erfolg = r.stichprobe(r.farbkarten, (farbkarte, nummer) =>
    Math.max(r.wert(mitGezogenen(mitHand(r.ohne, [farbkarte]), r.weitere(farbkarte, nummer, 1))), ...beste.map((karte) => r.wert(mitHand(r.ohne, [farbkarte, karte])))),
  );
  return r.farbeOderGegner(erfolg);
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
  const beste = hoechster(werte, (eintrag) => eintrag.wert);
  // Kriterium 2: im ersten Zug nur, wenn die Bewertung um mehr als ERSTZUG_HALTEN steigt (`eroeffnung.ts`).
  const schwelle = imErstenZug(sicht) ? ERSTZUG_HALTEN : GLEICH;
  return beste !== undefined && beste.wert > jetzt + schwelle ? beste.aktion : null;
}
