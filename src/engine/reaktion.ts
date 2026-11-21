import type { Ereignis, KartenAktion, ReagierenAktion } from './aktionen/typen';
import { definitionFuer } from './karten/register';
import { wirkeUndMeldeVersetzte } from './kartenorte';
import type { SonderkarteInfo, Spielkarte, Spielzustand } from './types';
import {
  entnehmeHandkarte,
  findeKartenort,
  legeAufEigenenAblagestapel,
  meldeGespielteKarte,
  mitspielerImUhrzeigersinn,
  spielerIndexVon,
  zaehleGespielteKarte,
} from './zugablauf';

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
dem Ablagestapel des Angreifers. Gegen Farbkarten gibt es keine Abwehr (A6).
Was eine Wirkung ausser der gespielten Karte bewegt, meldet `KartenVersetzt`
(`kartenorte.ts`), für jede Karte gleich.

Wer abwehrt, zieht nicht nach; er füllt zu Beginn seines nächsten Zuges auf
(A6, `zugablauf.ts`).
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

/** Der Grund, warum diese Reaktion nicht geht, oder `null`. Ob der Spieler gerade gefragt ist, prüft die Aktionsschicht. */
export function pruefeReaktion(zustand: Spielzustand, spielerIndex: number, farbenschutzId: string | null): string | null {
  if (farbenschutzId === null) return null;
  const spieler = zustand.spieler[spielerIndex];
  const karte = spieler.hand.find((handkarte) => handkarte.id === farbenschutzId);
  if (karte === undefined) return `Die Karte ${farbenschutzId} liegt nicht auf der Hand von ${spieler.name}.`;
  if (!istFarbenschutz(karte)) {
    return `Die Karte ${farbenschutzId} ist kein Farbenschutz: Als Reaktion ist nur Farbenschutz erlaubt, auch Schlangenfrass ist keine Reaktion (A6).`;
  }
  return null;
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
  if (ohneWirkung) zustand.spieler[angreifer].ablagestapel.push(karte);
  else {
    // Die Kartendateien nehmen sich die gespielte Karte aus der Hand (`entnehmeHandkarte`); bis hierher hat sie geschwebt.
    zustand.spieler[angreifer].hand.push(karte);
    nach = wirke(zustand, karte, aktion, abgewehrt, ereignisse);
  }
  ereignisse.push({ typ: 'AnsageEntschieden', spielerIndex: angreifer, karteId: karte.id, abgewehrt: [...abgewehrt], ohneWirkung, nach: findeKartenort(nach, karte.id) });
  return nach;
}
