import { abweichendeFelder, istGanzeZahl, istObjekt, istText } from '../form';
import { KARTENREGISTER, definitionFuer, istKartenaktionstyp, kartenartFuer, kartenartVon } from '../karten/register';
import { istRisikoaktion, pruefeRisikoKarte } from '../erweiterung/risiko';
import { istFarbenschutz, pruefeEntscheidung, pruefeReaktion } from '../reaktion';
import type { Kartenart, Spielkarte, Spielzustand } from '../types';
import { ueberzaehligeKarten } from '../zugablauf';
import { darfZugBeenden, kartengrenze, wirkungsgrenze } from '../zuggrenzen';
import { AKTIONSTYPEN } from './typen';
import type { Ablehnung, Aktionstyp, KartenAktion, Pruefergebnis, SpielAktion, Spielergrund } from './typen';

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
  Entscheiden: { spielerId: text, wahl: text },
  RisikoKarteSpielen: { ...MIT_KARTE, risikoAktion: istRisikoaktion, benannt: textOderNull },
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

/**
 * Wer als Nächster entscheidet (Plan E4, Kriterium 6; X3, Kriterium 3), oder
 * `null` nach Spielende: über eine schwebende Karte der nächste Betroffene, über
 * eine offene Entscheidung ihr Entscheider, sonst der Spieler am Zug.
 */
export function ermittleEntscheider(zustand: Spielzustand): number | null {
  if (zustand.partiephase === 'Beendet') return null;
  const { schwebend, entscheidung } = zustand;
  // Eine schwebende Karte hat immer einen Ausstehenden (Invariante, A6).
  if (schwebend !== null) return schwebend.ausstehend[0];
  return entscheidung === null ? zustand.zug.spielerIndex : entscheidung.entscheider;
}

/** Das grammatische Geschlecht jeder Kartenart, für die Artikel in den Gründen; vollständig, damit keine Art einen falschen bekommt. */
const GESCHLECHT: Record<Kartenart, 'männlich' | 'weiblich'> = {
  Farbkarte: 'weiblich',
  Farbenschutz: 'männlich',
  Regenbogenschlange: 'weiblich',
  Schlangenfrass: 'männlich',
  Schlangenblockade: 'weiblich',
  Farbendieb: 'männlich',
  Schlangengrube: 'weiblich',
  Farbenfusion: 'weiblich',
  Verdoppler: 'männlich',
  Schlangenhäutung: 'weiblich',
  'Schlangenkorb des Glücks': 'männlich',
};

/** „Der Farbendieb“, „Die Schlangengrube“: am Satzanfang, im Nominativ. */
function mitBestimmtemArtikel(art: Kartenart): string {
  return `${GESCHLECHT[art] === 'männlich' ? 'Der' : 'Die'} ${art}`;
}

/** „ein Farbendieb“ (Nominativ) oder „einen Farbendieb“ (Akkusativ); weiblich in beiden Fällen „eine“. */
function mitArtikel(art: Kartenart, fall: 'Nominativ' | 'Akkusativ'): string {
  if (GESCHLECHT[art] === 'weiblich') return `eine ${art}`;
  return `${fall === 'Nominativ' ? 'ein' : 'einen'} ${art}`;
}

function nein(grund: string, nennt?: Spielergrund): Ablehnung {
  return nennt === undefined ? { erlaubt: false, grund } : { erlaubt: false, grund, nennt };
}

/** A5: Die Karte liegt nicht auf der Hand dieses Spielers. */
function nichtAufHand(name: string, spielerIndex: number, karteId: string): Ablehnung {
  return nein(`Die Karte ${karteId} liegt nicht auf der Hand von ${name}.`, { art: 'nichtAufHand', spielerIndex, karteId });
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
      return nein(`${spieler.name} entscheidet gerade nicht; dran ist ${zustand.spieler[entscheider!].name} (A6).`, {
        art: 'entscheidetNicht',
        spielerIndex,
        entscheider: entscheider!,
      });
    }
    if (aktion.farbenschutzId === null) return JA;
    const farbenschutz = spieler.hand.find((handkarte) => handkarte.id === aktion.farbenschutzId);
    if (farbenschutz === undefined) return nichtAufHand(spieler.name, spielerIndex, aktion.farbenschutzId);
    const grund = pruefeReaktion(farbenschutz);
    return grund === null ? JA : nein(grund);
  }
  if (aktion.typ === 'Entscheiden') {
    if (zustand.entscheidung === null) return nein('Es ist keine Entscheidung offen; „Entscheiden“ geht nur, wenn eine Wirkung eine Wahl verlangt (X3).');
    const entscheider = ermittleEntscheider(zustand)!;
    if (entscheider !== spielerIndex) return nein(`${spieler.name} entscheidet gerade nicht; dran ist ${zustand.spieler[entscheider].name} (X3).`);
    const grund = pruefeEntscheidung(zustand, zustand.entscheidung, aktion.wahl);
    return grund === null ? JA : nein(grund);
  }
  if (schwebend !== null) {
    return nein(`${mitBestimmtemArtikel(schwebend.karte.name)} schwebt noch: Erst entscheiden die Betroffenen, ob sie abwehren (A6).`);
  }
  const { entscheidung } = zustand;
  if (entscheidung !== null) {
    return nein(`Erst entscheidet ${zustand.spieler[entscheidung.entscheider].name} über „${entscheidung.art}“; vorher geht keine andere Aktion (X3).`);
  }
  if (zustand.zug.spielerIndex !== spielerIndex) {
    const amZug = zustand.spieler[zustand.zug.spielerIndex];
    return nein(`${spieler.name} ist nicht am Zug; am Zug ist ${amZug?.name ?? 'niemand'} (A5).`, {
      art: 'nichtAmZug',
      spielerIndex,
      amZug: amZug === undefined ? null : zustand.zug.spielerIndex,
    });
  }

  const { zug } = zustand;
  if (zug.abschnitt === 'Abwerfen' && aktion.typ !== 'UeberhandAbwerfen') {
    return nein('Der Zug ist beendet: Jetzt werden nur überzählige Handkarten abgeworfen (A5).');
  }
  switch (aktion.typ) {
    case 'ZugBeenden':
      if (!darfZugBeenden(zug, spieler)) {
        return nein(`${spieler.name} muss erst mindestens eine Karte spielen; beenden ohne Karte geht nur mit leerer Hand (A5, D12).`, {
          art: 'kartenpflicht',
          spielerIndex,
        });
      }
      return JA;
    case 'UeberhandAbwerfen':
      return pruefeUeberhand(zustand, spielerIndex, aktion.karteIds);
    case 'RisikoKarteSpielen': {
      const grund = pruefeRisikoKarte(zustand, spielerIndex, aktion);
      return grund === null ? JA : nein(grund);
    }
    default:
      break;
  }

  const karte = spieler.hand.find((handkarte) => handkarte.id === aktion.karteId);
  if (karte === undefined) return nichtAufHand(spieler.name, spielerIndex, aktion.karteId);
  if (aktion.typ === 'SonderkarteWirkungslosAblegen' && karte.typ !== 'Sonderkarte') {
    return nein(`Die Karte ${karte.id} ist eine Farbkarte: Wirkungslos ablegen lassen sich nur Sonderkarten (D13).`);
  }
  const grenze = kartengrenze(zug, karte);
  if (grenze !== null) return nein(grenze);
  if (aktion.typ === 'SonderkarteWirkungslosAblegen') {
    if (!istWirkungslosAblegbar(zustand, spielerIndex, karte)) {
      return nein(`${kartenartVon(karte)} hat ein mögliches Ziel; wirkungslos ablegen geht nur ohne Ziel, Farbenschutz immer (D25).`);
    }
    return JA;
  }
  return pruefeKartenaktion(zustand, aktion, karte);
}

/**
 * Warum der Spieler am Zug seinen Zug jetzt nicht beenden darf: die Ablehnung,
 * mit der `pruefeAktion` das Beenden ablehnt, oder `null`, wenn es erlaubt ist.
 * Für die Oberfläche, die neben einem gesperrten „Zug beenden“ den Grund zeigt,
 * aber selbst keine Aktion baut (U3).
 */
export function zugBeendenGesperrt(zustand: Spielzustand): Ablehnung | null {
  const ergebnis = pruefeAktion(zustand, { typ: 'ZugBeenden', spielerId: zustand.spieler[zustand.zug.spielerIndex].id });
  return ergebnis.erlaubt ? null : ergebnis;
}

/**
 * D13, D25: Eine Sonderkarte ohne mögliches Ziel und jeder Farbenschutz dürfen
 * ohne Wirkung auf den eigenen Ablagestapel. Ob die Karte ein Ziel hat, sagt ihr
 * Eintrag im Kartenregister und der Rahmen des Zuges (`moeglicheZiele`); den
 * freien Platz im Zug prüft der Aufrufer (`kartengrenze`).
 */
export function istWirkungslosAblegbar(zustand: Spielzustand, spielerIndex: number, karte: Spielkarte): boolean {
  return ohneZielAblegbar(karte, () => moeglicheZiele(zustand, spielerIndex, karte));
}

/**
 * Die Aktionen, mit denen diese Handkarte jetzt Wirkung haben kann: die Ziele aus
 * ihrem Eintrag im Kartenregister, keine, wenn der Rahmen ihr in diesem Zug die
 * Wirkung nimmt (zweite Farbenfusion, Verdoppler neben einer anderen
 * Zugerweiterung; `wirkungsgrenze`, X3).
 */
export function moeglicheZiele(zustand: Spielzustand, spielerIndex: number, karte: Spielkarte): KartenAktion[] {
  return wirkungsgrenze(zustand.zug, karte) === null ? definitionFuer(karte).ziele(zustand, spielerIndex, karte) : [];
}

/** Dieselbe Regel, wenn die Ziele der Karte schon ermittelt sind (`ermittleAktionen`); `ziele` wird nur bei Bedarf gerufen. */
export function ohneZielAblegbar(karte: Spielkarte, ziele: () => readonly unknown[]): boolean {
  if (karte.typ !== 'Sonderkarte') return false;
  return istFarbenschutz(karte) || ziele().length === 0;
}

/** A5: Am Zugende kommen genau die überzähligen Karten auf den eigenen Ablagestapel, jede einmal. */
function pruefeUeberhand(zustand: Spielzustand, spielerIndex: number, karteIds: readonly string[]): Pruefergebnis {
  const spieler = zustand.spieler[spielerIndex];
  const anzahl = ueberzaehligeKarten(spieler);
  if (zustand.zug.abschnitt !== 'Abwerfen') return nein('Überzählige Karten wirft man erst am Zugende ab, nach dem Auffüllen (A5).');
  if (new Set(karteIds).size !== karteIds.length) return nein('Beim Abwerfen ist eine Karte doppelt genannt.');
  const fremd = karteIds.find((id) => !spieler.hand.some((karte) => karte.id === id));
  if (fremd !== undefined) return nichtAufHand(spieler.name, spielerIndex, fremd);
  if (karteIds.length !== anzahl) {
    return nein(`${spieler.name} hält ${spieler.hand.length} Karten und legt genau ${anzahl} Karten ab, nicht ${karteIds.length} (A5).`, {
      art: 'abwerfenAnzahl',
      spielerIndex,
      haelt: spieler.hand.length,
      abwerfen: anzahl,
      genannt: karteIds.length,
    });
  }
  return JA;
}

function pruefeKartenaktion(zustand: Spielzustand, aktion: KartenAktion, karte: Spielkarte): Pruefergebnis {
  const erwartet = kartenartFuer(aktion.typ);
  const art = kartenartVon(karte);
  if (art !== erwartet) return nein(`Die Karte ${karte.id} ist ${mitArtikel(art, 'Nominativ')}; ${aktion.typ} braucht ${mitArtikel(erwartet, 'Akkusativ')}.`);
  const sperre = wirkungsgrenze(zustand.zug, karte);
  if (sperre !== null) return nein(sperre);
  const grund = KARTENREGISTER[art].pruefe(zustand, aktion);
  return grund === null ? JA : nein(grund);
}
