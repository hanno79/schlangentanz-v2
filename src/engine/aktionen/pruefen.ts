import { abweichendeFelder, istGanzeZahl, istObjekt, istText } from '../form';
import { KARTENREGISTER, definitionFuer, istKartenaktionstyp, kartenartFuer, kartenartVon } from '../karten/register';
import type { Kartenart, Spielkarte, Spielzustand } from '../types';
import { darfZugBeenden, kartengrenze, ueberzaehligeKarten } from '../zugablauf';
import { AKTIONSTYPEN } from './typen';
import type { Aktionstyp, KartenAktion, Pruefergebnis, SpielAktion } from './typen';

type Feld = (wert: unknown) => boolean;

const text: Feld = istText;
const position: Feld = istGanzeZahl;
const textOderNull: Feld = (wert) => wert === null || istText(wert);
const textliste = (minimum: number, maximum = Infinity): Feld => (wert) =>
  Array.isArray(wert) && wert.length >= minimum && wert.length <= maximum && wert.every(istText);

function genau(felder: Record<string, Feld>): Feld {
  return (wert) =>
    istObjekt(wert) &&
    abweichendeFelder(wert, Object.keys(felder)).length === 0 &&
    Object.entries(felder).every(([name, pruefe]) => pruefe(wert[name]));
}

const einerVon = (werte: readonly string[]): Feld => (wert) => typeof wert === 'string' && werte.includes(wert);
const kartenVerweis = genau({ schlangenId: text, karteId: text });
const neueSchlange = genau({ art: einerVon(['neueSchlange']) });
const anSchlangenende = genau({ art: einerVon(['schlange']), schlangenId: text, seite: einerVon(['anfang', 'ende']) });
const inSchlange = genau({ art: einerVon(['schlange']), schlangenId: text, position });

const MIT_KARTE = { spielerId: text, karteId: text };
const IN_SCHLANGE = { ...MIT_KARTE, schlangenId: text, position };

/** Die Felder jedes Aktionstyps (`typen.ts`); fehlende und fremde Felder sind ungültig. */
const FELDER: Record<Aktionstyp, Record<string, Feld>> = {
  FarbkarteLegen: {
    ...MIT_KARTE,
    ziel: (wert) => neueSchlange(wert) || anSchlangenende(wert),
  },
  RegenbogenschlangeLegen: IN_SCHLANGE,
  BlockadeLegen: IN_SCHLANGE,
  FusionLegen: { ...MIT_KARTE, schlangenId: text, kartenIds: textliste(2, 2) },
  FarbendiebSpielen: {
    ...MIT_KARTE,
    quelle: kartenVerweis,
    ziel: (wert) => neueSchlange(wert) || inSchlange(wert),
  },
  SchlangenfrassSpielen: {
    ...MIT_KARTE,
    option: einerVon(['eigeneKarte', 'eigeneBlockade', 'gegnerischeKarten']),
    ziele: (wert) => Array.isArray(wert) && wert.length >= 1 && wert.length <= 2 && wert.every(kartenVerweis),
  },
  SchlangengrubeSpielen: { ...MIT_KARTE, zielSpielerId: text },
  VerdopplerSpielen: MIT_KARTE,
  SchlangenhaeutungSpielen: { ...MIT_KARTE, schlangenId: text, neueReihenfolge: textliste(1) },
  SonderkarteWirkungslosAblegen: MIT_KARTE,
  ZugBeenden: { spielerId: text },
  UeberhandAbwerfen: { spielerId: text, karteIds: textliste(0) },
  Reagieren: { spielerId: text, farbenschutzId: textOderNull },
};

export function istKartenaktion(aktion: SpielAktion): aktion is KartenAktion {
  return istKartenaktionstyp(aktion.typ);
}

/** Prüft nur die Form einer Aktion unbekannter Herkunft. `null` heisst: wohlgeformt. */
export function pruefeAktionsform(wert: unknown): string | null {
  if (!istObjekt(wert)) return 'Ungültige Aktion: Sie ist kein Objekt.';
  const typ = wert.typ;
  if (typeof typ !== 'string' || !(AKTIONSTYPEN as readonly string[]).includes(typ)) {
    return `Ungültige Aktion: Unbekannter Aktionstyp „${String(typ)}“.`;
  }
  const felder = FELDER[typ as Aktionstyp];
  const abweichend = abweichendeFelder(wert, ['typ', ...Object.keys(felder)]);
  if (abweichend.length > 0) return `Ungültige Aktion ${typ}: ${abweichend.join(', ')}.`;
  const ungueltig = Object.keys(felder).filter((name) => !felder[name](wert[name]));
  if (ungueltig.length > 0) return `Ungültige Aktion ${typ}: Feld ${ungueltig.join(', ')} ist ungültig.`;
  return null;
}

/** Wer als Nächster entscheidet (Plan E4, Kriterium 6), oder `null` nach Spielende. */
export function ermittleEntscheider(zustand: Spielzustand): number | null {
  if (zustand.partiephase === 'Beendet') return null;
  const { schwebend } = zustand;
  if (schwebend === null) return zustand.zug.spielerIndex;
  return schwebend.ausstehend[0] ?? zustand.spieler.findIndex((spieler) => spieler.id === schwebend.aktion.spielerId);
}

const MAENNLICH = new Set<Kartenart>(['Farbenschutz', 'Farbendieb', 'Schlangenfrass', 'Verdoppler', 'Schlangenkorb des Glücks']);

function mitArtikel(art: Kartenart): string {
  return `${MAENNLICH.has(art) ? 'einen' : 'eine'} ${art}`;
}

function nein(grund: string): Pruefergebnis {
  return { erlaubt: false, grund };
}

const JA: Pruefergebnis = { erlaubt: true };

/**
 * Ist die Aktion jetzt erlaubt? Die allgemeinen Prüfungen stehen hier, die
 * Regeln der einzelnen Karte im Kartenregister. Jeder Grund ist deutsch (U12).
 */
export function pruefeAktion(zustand: Spielzustand, aktion: SpielAktion): Pruefergebnis {
  const formfehler = pruefeAktionsform(aktion);
  if (formfehler !== null) return nein(formfehler);

  const spielerIndex = zustand.spieler.findIndex((spieler) => spieler.id === aktion.spielerId);
  if (spielerIndex < 0) return nein(`Unbekannter Spieler „${aktion.spielerId}“.`);
  const spieler = zustand.spieler[spielerIndex];
  if (zustand.partiephase === 'Beendet') return nein('Die Partie ist beendet; es gibt keine Aktion mehr (A10).');

  const { schwebend } = zustand;
  if (aktion.typ === 'Reagieren') {
    if (schwebend === null) return nein('Es gibt nichts abzuwehren: Keine Sonderkarte schwebt (A6).');
    const entscheider = ermittleEntscheider(zustand);
    if (entscheider !== spielerIndex) {
      return nein(`${spieler.name} entscheidet gerade nicht; dran ist ${zustand.spieler[entscheider!].name} (A6).`);
    }
    return nein('Reagieren ist noch nicht umgesetzt (kommt mit E4).');
  }
  if (schwebend !== null) {
    return nein(`Die ${schwebend.karte.name} schwebt noch: Erst entscheiden die Betroffenen, ob sie abwehren (A6).`);
  }
  if (zustand.zug.spielerIndex !== spielerIndex) {
    return nein(`${spieler.name} ist nicht am Zug; am Zug ist ${zustand.spieler[zustand.zug.spielerIndex]?.name ?? 'niemand'} (A5).`);
  }

  const { zug } = zustand;
  switch (aktion.typ) {
    case 'ZugBeenden':
      if (zug.abschnitt === 'Abwerfen') return nein('Der Zug ist beendet: Erst überzählige Karten abwerfen (A5).');
      if (!darfZugBeenden(zug, spieler)) {
        return nein(`${spieler.name} muss erst mindestens eine Karte spielen; beenden ohne Karte geht nur mit leerer Hand (A5, D12).`);
      }
      return JA;
    case 'UeberhandAbwerfen':
      return pruefeUeberhand(zustand, spielerIndex, aktion.karteIds);
    default:
      break;
  }

  const karte = spieler.hand.find((handkarte) => handkarte.id === aktion.karteId);
  if (karte === undefined) return nein(`Die Karte ${aktion.karteId} liegt nicht auf der Hand von ${spieler.name}.`);
  if (zug.abschnitt === 'Abwerfen') {
    return nein('Der Zug ist beendet: Jetzt werden nur überzählige Handkarten abgeworfen (A5).');
  }
  if (aktion.typ === 'SonderkarteWirkungslosAblegen') {
    if (karte.typ !== 'Sonderkarte') return nein(`Die Karte ${karte.id} ist eine Farbkarte: Wirkungslos ablegen lassen sich nur Sonderkarten (D13).`);
    const grenze = kartengrenze(zug, karte);
    if (grenze !== null) return nein(grenze);
    if (!istWirkungslosAblegbar(zustand, spielerIndex, karte)) {
      return nein(`${karte.name} hat ein mögliches Ziel; wirkungslos ablegen geht nur ohne Ziel, Farbenschutz immer (D25).`);
    }
    return JA;
  }
  return pruefeKartenaktion(zustand, aktion, karte);
}

/**
 * D13, D25: Eine Sonderkarte ohne mögliches Ziel und jeder Farbenschutz dürfen
 * ohne Wirkung auf den eigenen Ablagestapel. Ob die Karte ein Ziel hat, sagt ihr
 * Eintrag im Kartenregister; die Grenze je Zug prüft der Aufrufer.
 */
export function istWirkungslosAblegbar(zustand: Spielzustand, spielerIndex: number, karte: Spielkarte): boolean {
  if (karte.typ !== 'Sonderkarte') return false;
  return karte.name === 'Farbenschutz' || definitionFuer(karte).ziele(zustand, spielerIndex, karte).length === 0;
}

/** A5: Am Zugende kommen genau die überzähligen Karten auf den eigenen Ablagestapel, jede einmal. */
function pruefeUeberhand(zustand: Spielzustand, spielerIndex: number, karteIds: readonly string[]): Pruefergebnis {
  const spieler = zustand.spieler[spielerIndex];
  const anzahl = ueberzaehligeKarten(spieler);
  if (zustand.zug.abschnitt !== 'Abwerfen') return nein('Überzählige Karten wirft man erst am Zugende ab, nach dem Auffüllen (A5).');
  if (new Set(karteIds).size !== karteIds.length) return nein('Beim Abwerfen ist eine Karte doppelt genannt.');
  const fremd = karteIds.find((id) => !spieler.hand.some((karte) => karte.id === id));
  if (fremd !== undefined) return nein(`Die Karte ${fremd} liegt nicht auf der Hand von ${spieler.name}.`);
  if (karteIds.length !== anzahl) {
    return nein(`${spieler.name} hält ${spieler.hand.length} Karten und legt genau ${anzahl} Karten ab, nicht ${karteIds.length} (A5).`);
  }
  return JA;
}

function pruefeKartenaktion(zustand: Spielzustand, aktion: KartenAktion, karte: Spielkarte): Pruefergebnis {
  const erwartet = kartenartFuer(aktion.typ);
  const art = kartenartVon(karte);
  if (art !== erwartet) return nein(`Die Karte ${karte.id} ist ${mitArtikel(art)}; ${aktion.typ} braucht ${mitArtikel(erwartet)}.`);
  const grenze = kartengrenze(zustand.zug, karte);
  if (grenze !== null) return nein(grenze);
  const grund = KARTENREGISTER[art].pruefe(zustand, aktion);
  return grund === null ? JA : nein(grund);
}
