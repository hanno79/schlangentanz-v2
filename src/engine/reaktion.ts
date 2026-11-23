import type { EntscheidenAktion, Ereignis, KartenAktion, ReagierenAktion } from './aktionen/typen';
import { befundeDerEntscheidung, definitionDerEntscheidung } from './entscheidungsregister';
import { merkeAusgespielteSonderkarte } from './aufgaben/sonderkartenZaehler';
import { definitionFuer } from './karten/register';
import { wirkeUndMeldeVersetzte } from './kartenorte';
import type { OffeneEntscheidung, SonderkarteInfo, Spielkarte, Spielzustand } from './types';
import {
  entnehmeHandkarte,
  findeKartenort,
  legeAufEigenenAblagestapel,
  legeOhneWirkungAb,
  meldeGespielteKarte,
  mitspielerImUhrzeigersinn,
  spielerIndexVon,
} from './zugablauf';
import { zaehleGespielteKarte } from './zuggrenzen';

/*
Der Reaktionsablauf (A6, A7.2, D10, Plan E4), für jede Sonderkarte gleich: Wer
eine Sonderkarte gegen Mitspieler oder in ihre Schlange spielt, sagt sie mit
Ziel an (B2), und sie schwebt. Betroffen sind die Besitzer der Ziele ohne den
Angreifer, im Uhrzeigersinn ab ihm, jeder einmal, auch wenn mehrere seiner
Karten getroffen sind (A6 Beispiel 2, D15). Gefragt wird jeder Betroffene, der
Reihe nach; abwehren kann nur, wer Farbenschutz hält, wer keinen hält, kann nur
durchlassen (D33). So verrät die Frage keine Handkarte (B2). Erst wenn alle entschieden haben,
wirkt die Karte nach ihrem Eintrag im Kartenregister, und für die Abwehrenden
hat sie keine Wirkung (A7.2). Haben alle abgewehrt, liegt sie wirkungslos auf
dem Ablagestapel des Angreifers, der Schlangenkorb aus dem Spiel (D54). Gegen
Farbkarten gibt es keine Abwehr (A6).
Was eine Wirkung ausser der gespielten Karte bewegt, meldet `KartenVersetzt`
(`kartenorte.ts`), für jede Karte gleich.

Wer abwehrt, zieht nicht nach; er füllt zu Beginn seines nächsten Zuges auf
(A6, `zugablauf.ts`).

Daneben steht der allgemeine Entscheidungsablauf (X3): Eine Wirkung verlangt
eine Entscheidung von einem bestimmten Spieler, auch von einem Gegner, etwa
„der begünstigte Gegner wählt“ (D52) oder „Freie Wahl bei Misserfolg“ (A8.2).
Bis er gewählt hat, geht nur seine Wahl; dann wirkt sie nach ihrem Eintrag im
Entscheidungsregister und darf die nächste Entscheidung verlangen. Die Abwehr
bleibt, wie sie ist; beides ist nie zugleich offen.
*/

export function istFarbenschutz(karte: Spielkarte): boolean {
  return karte.typ === 'Sonderkarte' && karte.name === 'Farbenschutz';
}

/** Wen die Karte trifft und wer deshalb abwehren darf, ohne den Angreifer, im Uhrzeigersinn ab ihm, jeder einmal. */
function betroffeneVon(zustand: Spielzustand, karte: SonderkarteInfo, aktion: KartenAktion): number[] {
  const genannt = new Set(definitionFuer(karte).betroffene(zustand, aktion));
  return mitspielerImUhrzeigersinn(zustand, spielerIndexVon(zustand, aktion.spielerId)).filter((index) => genannt.has(index));
}

/** Die Wirkung nach dem Kartenregister; was sie ausser der gespielten Karte bewegt, meldet die Engine selbst (Plan E4b). */
function wirke(zustand: Spielzustand, karte: Spielkarte, aktion: KartenAktion, abgewehrt: readonly number[], ereignisse: Ereignis[]): Spielzustand {
  const spielerIndex = spielerIndexVon(zustand, aktion.spielerId);
  return wirkeUndMeldeVersetzte(zustand, spielerIndex, karte.id, (jetzt) => definitionFuer(karte).wirke(jetzt, aktion, abgewehrt), ereignisse);
}

/**
 * Eine Handkarte mit Wirkung spielen: Sie zählt zum Zug (A5, D12). Trifft sie
 * keinen Mitspieler, wirkt sie sofort. Sonst wird sie angesagt und schwebt, bis
 * jeder Betroffene entschieden hat (D33).
 */
export function spieleKarte(zustand: Spielzustand, aktion: KartenAktion, ereignisse: Ereignis[]): Spielzustand {
  const karte = zaehleGespielteKarte(zustand, aktion);
  // Gegen Farbkarten gibt es keine Abwehr (A6).
  const betroffene = karte.typ === 'Sonderkarte' ? betroffeneVon(zustand, karte, aktion) : [];
  if (betroffene.length === 0 || karte.typ !== 'Sonderkarte') {
    // Die Karte nimmt sich die Wirkung selbst aus der Hand.
    const nach = wirke(zustand, karte, aktion, [], ereignisse);
    meldeGespielteKarte(nach, aktion, ereignisse);
    return nach;
  }
  entnehmeHandkarte(zustand, aktion.spielerId, aktion.karteId);
  zustand.schwebend = { karte, aktion: structuredClone(aktion), ausstehend: [...betroffene], abgewehrt: [] };
  ereignisse.push({ typ: 'KarteAngesagt', spielerIndex: spielerIndexVon(zustand, aktion.spielerId), karteId: karte.id, ansage: structuredClone(aktion), betroffene });
  ereignisse.push({ typ: 'AbwehrGefragt', spielerIndex: betroffene[0], karteId: karte.id });
  return zustand;
}

/**
 * Warum diese Handkarte keine Reaktion sein kann, oder `null`. Ob der Spieler
 * gerade gefragt ist und die Karte auf seiner Hand liegt, prüft die Aktionsschicht.
 */
export function pruefeReaktion(karte: Spielkarte): string | null {
  if (istFarbenschutz(karte)) return null;
  return `Die Karte ${karte.id} ist kein Farbenschutz: Als Reaktion ist nur Farbenschutz erlaubt, auch Schlangenfrass ist keine Reaktion (A6).`;
}

/** Was der Gefragte wählen darf: mit jedem seiner Farbenschutz abwehren oder durchlassen (A6, A7.2); ohne Farbenschutz nur durchlassen (D33). */
export function reaktionsAktionen(zustand: Spielzustand, spielerIndex: number): ReagierenAktion[] {
  const { id, hand } = zustand.spieler[spielerIndex];
  const abwehren = hand.filter(istFarbenschutz).map((karte): ReagierenAktion => ({ typ: 'Reagieren', spielerId: id, farbenschutzId: karte.id }));
  return [...abwehren, { typ: 'Reagieren', spielerId: id, farbenschutzId: null }];
}

/**
 * Der Gefragte entscheidet: Mit Farbenschutz wehrt er ab, und der Farbenschutz
 * kommt auf seinen eigenen Ablagestapel (A7.2). Danach ist der Nächste gefragt;
 * hat jeder entschieden, wirkt die Karte.
 */
export function reagiere(zustand: Spielzustand, aktion: ReagierenAktion, ereignisse: Ereignis[]): Spielzustand {
  const { schwebend } = zustand;
  if (schwebend === null || schwebend.ausstehend.length === 0) throw new Error('Es gibt nichts abzuwehren: Keine Sonderkarte schwebt (A6).');
  const spielerIndex = schwebend.ausstehend.shift()!;
  if (aktion.farbenschutzId !== null) {
    legeAufEigenenAblagestapel(zustand, aktion.spielerId, aktion.farbenschutzId);
    merkeAusgespielteSonderkarte(zustand, zustand.spieler[spielerIndex], 'Farbenschutz');
    schwebend.abgewehrt.push(spielerIndex);
    ereignisse.push({ typ: 'Abgewehrt', spielerIndex, karteId: aktion.farbenschutzId, gegen: schwebend.karte.id });
  }
  const naechster = schwebend.ausstehend[0];
  if (naechster === undefined) return loeseAuf(zustand, ereignisse);
  ereignisse.push({ typ: 'AbwehrGefragt', spielerIndex: naechster, karteId: schwebend.karte.id });
  return zustand;
}

/** A6: Alle haben entschieden; jetzt wirkt die Karte, ausser für die Abwehrenden (A7.2). */
function loeseAuf(zustand: Spielzustand, ereignisse: Ereignis[]): Spielzustand {
  const { karte, aktion, abgewehrt } = zustand.schwebend!;
  zustand.schwebend = null;
  const angreifer = spielerIndexVon(zustand, aktion.spielerId);
  const ohneWirkung = betroffeneVon(zustand, karte, aktion).every((index) => abgewehrt.includes(index));
  let nach = zustand;
  if (ohneWirkung) legeOhneWirkungAb(zustand, angreifer, karte);
  else {
    // Die Kartendateien nehmen sich die gespielte Karte aus der Hand (`entnehmeHandkarte`); bis hierher hat sie geschwebt.
    zustand.spieler[angreifer].hand.push(karte);
    nach = wirke(zustand, karte, aktion, abgewehrt, ereignisse);
  }
  ereignisse.push({ typ: 'AnsageEntschieden', spielerIndex: angreifer, karteId: karte.id, abgewehrt: [...abgewehrt], ohneWirkung, nach: findeKartenort(nach, karte.id) });
  return nach;
}

/**
 * X3: Eine Wirkung verlangt eine Entscheidung. Die Engine meldet sie am Ende der
 * Aktion (`meldeOffeneEntscheidung`). Fail-Fast: neben einer schwebenden Karte,
 * neben einer offenen Entscheidung, ohne Wahl oder mit unbekannter Art geht das
 * nicht.
 */
export function verlangeEntscheidung(zustand: Spielzustand, entscheidung: OffeneEntscheidung): void {
  if (zustand.schwebend !== null) {
    throw new Error(`Solange die ${zustand.schwebend.karte.name} schwebt, lässt sich keine Entscheidung verlangen; erst entscheiden die Betroffenen (A6).`);
  }
  if (zustand.entscheidung !== null) throw new Error(`Die Entscheidung „${zustand.entscheidung.art}“ ist schon offen; eine zweite lässt sich nicht daneben verlangen.`);
  const [befund] = befundeDerEntscheidung(entscheidung, zustand.spieler.length);
  if (befund !== undefined) throw new Error(befund);
  zustand.entscheidung = structuredClone(entscheidung);
}

/** X3: Was der Entscheider wählen darf: jede Option, in ihrer Reihenfolge. */
export function entscheidungsAktionen(zustand: Spielzustand, spielerIndex: number): EntscheidenAktion[] {
  const spielerId = zustand.spieler[spielerIndex].id;
  return (zustand.entscheidung?.optionen ?? []).map((wahl) => ({ typ: 'Entscheiden', spielerId, wahl }));
}

/** Der Grund, warum diese Wahl nicht geht, oder `null`. Ob eine Entscheidung offen ist und der Spieler sie trifft, prüft die Aktionsschicht. */
export function pruefeEntscheidung(entscheidung: OffeneEntscheidung, wahl: string, spielerzahl: number): string | null {
  const [befund] = befundeDerEntscheidung(entscheidung, spielerzahl);
  if (befund !== undefined) return befund;
  if (!entscheidung.optionen.includes(wahl)) return `„${wahl}“ steht bei „${entscheidung.art}“ nicht zur Wahl; möglich sind: ${entscheidung.optionen.join(', ')}.`;
  return null;
}

/**
 * X3: Der Entscheider wählt. Die Wahl wirkt nach ihrem Eintrag im
 * Entscheidungsregister; was sie bewegt, meldet die Engine als `KartenVersetzt`
 * zur Karte der Entscheidung (Plan E4b), ohne eine Karte auszunehmen.
 */
export function entscheide(zustand: Spielzustand, aktion: EntscheidenAktion, ereignisse: Ereignis[]): Spielzustand {
  const { entscheidung } = zustand;
  if (entscheidung === null) throw new Error('Es ist keine Entscheidung offen.');
  zustand.entscheidung = null;
  const { art, karteId, entscheider, ausgeloestVon } = entscheidung;
  ereignisse.push({ typ: 'Entschieden', spielerIndex: entscheider, art, karteId, wahl: aktion.wahl });
  const definition = definitionDerEntscheidung(art);
  return wirkeUndMeldeVersetzte(zustand, ausgeloestVon, karteId, (jetzt) => definition.loese(jetzt, entscheidung, aktion.wahl), ereignisse, null);
}

/** X3: Ist nach einer Aktion eine Entscheidung offen, ist sie neu; die Engine nennt den Entscheider und die Wahl. */
export function meldeOffeneEntscheidung(zustand: Spielzustand, ereignisse: Ereignis[]): void {
  const { entscheidung } = zustand;
  if (entscheidung === null) return;
  const { entscheider, art, karteId, optionen } = entscheidung;
  ereignisse.push({ typ: 'EntscheidungVerlangt', spielerIndex: entscheider, art, karteId, optionen: [...optionen] });
}
