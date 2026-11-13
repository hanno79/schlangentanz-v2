import { MAX_SCHLANGEN_PRO_SPIELER, OFFENE_AUFGABEN } from './constants';
import { erstelleAuslagekarten, erstelleSpielkarten } from './deck';
import { erstelleAufgabenStapel } from './aufgabenKarten';
import { kartenartFuer, kartenartVon } from './karten/register';
import type { AufgabenkarteInfo, Auslagekarte, Spielkarte, Spielzustand } from './types';

/*
Strukturelle Zusicherungen, die in jedem Zustand gelten, gleich welche Regel
gerade umgesetzt ist (Plan E1, Kriterium 7). `deserialisiere`, der
Szenario-Baukasten, der Dauerlauf und der Entwicklertisch prüfen damit.
*/

export interface InvariantenBefund {
  name: string;
  verletzt: boolean;
  /** Was verletzt ist, mit Ids; leer, wenn alles stimmt. */
  detail: string;
}

/** `karten` sind alle Spielkarten des Zustands, einmal gesammelt (`alleSpielkarten`). */
type Pruefung = (zustand: Spielzustand, karten: Spielkarte[]) => string[];

const INVARIANTEN: ReadonlyArray<[name: string, pruefe: Pruefung]> = [
  ['Jede Spielkarte liegt genau einmal an genau einem Ort', jedeSpielkarteGenauEinmal],
  ['Jede Aufgabenkarte liegt genau einmal im Spiel', jedeAufgabeGenauEinmal],
  ['Jede Comeback- und Risiko-Karte liegt genau einmal im Spiel', jedeAuslagekarteGenauEinmal],
  ['Kein Spieler hat mehr als 2 Schlangen', hoechstensZweiSchlangen],
  ['Keine Schlange ist leer', keineLeereSchlange],
  ['Alle Ids sind eindeutig', idsEindeutig],
  ['Jede Farbenfusion deckt zwei Farbkarten gleicher Farbe', fusionenVollstaendig],
  ['Alle Verweise auf Spieler und Karten sind gültig', verweiseGueltig],
  ['Partiephase und Schlussrunde passen zusammen', partiephasePasst],
];

export function pruefeInvarianten(zustand: Spielzustand): InvariantenBefund[] {
  const karten = alleSpielkarten(zustand);
  return INVARIANTEN.map(([name, pruefe]) => {
    const probleme = pruefe(zustand, karten);
    return { name, verletzt: probleme.length > 0, detail: probleme.join(' ') };
  });
}

/** Jede Spielkarte, wo sie liegt (A4, A6, A7.6, A7.7, A7.10). */
export function alleSpielkarten(zustand: Spielzustand): Spielkarte[] {
  const karten: Spielkarte[] = [...zustand.nachziehstapel];
  for (const spieler of zustand.spieler) {
    karten.push(...spieler.hand, ...spieler.ablagestapel);
    for (const schlange of spieler.schlangen) {
      karten.push(...schlange.karten);
      for (const fusion of schlange.fusionen) karten.push(...fusion.unter);
    }
  }
  for (const grube of zustand.ausliegendeGruben) karten.push(grube.karte);
  if (zustand.schwebend !== null) karten.push(zustand.schwebend.karte);
  for (const karte of zustand.ausDemSpiel) if (!istAuslagekarte(karte)) karten.push(karte);
  return karten;
}

/** Jede Aufgabenkarte, wo sie liegt (A4, A9). */
function alleAufgaben(zustand: Spielzustand): AufgabenkarteInfo[] {
  return [
    ...zustand.offeneAufgaben,
    ...zustand.aufgabenStapel,
    ...zustand.spieler.flatMap((spieler) => [...(spieler.geheimeAufgabe === null ? [] : [spieler.geheimeAufgabe]), ...spieler.erfuellteAufgaben]),
  ];
}

/** Jede Comeback- und Risiko-Karte, wo sie liegt (A4, A8). */
function alleAuslagekarten(zustand: Spielzustand): Auslagekarte[] {
  return [
    ...zustand.spieler.flatMap((spieler) => [...(spieler.comeback === null ? [] : [spieler.comeback.karte]), ...spieler.risikoKarten]),
    ...zustand.ausDemSpiel.filter(istAuslagekarte),
  ];
}

export function istAuslagekarte(karte: Spielkarte | Auslagekarte): karte is Auslagekarte {
  return karte.typ === 'Comeback' || karte.typ === 'Risiko-Belohnung';
}

/** Das erwartete Material als Id → kanonische Form; das Material ändert sich nie, deshalb einmal gebaut. */
type Vorlage = ReadonlyMap<string, string>;

const kanonisch = (wert: object): string => JSON.stringify(wert, Object.keys(wert).sort());
const vorlage = (stuecke: readonly { id: string }[]): Vorlage => new Map(stuecke.map((stueck) => [stueck.id, kanonisch(stueck)]));
const zwischengespeichert = <S, W>(baue: (schluessel: S) => W) => {
  const ablage = new Map<S, W>();
  return (schluessel: S): W => {
    if (!ablage.has(schluessel)) ablage.set(schluessel, baue(schluessel));
    return ablage.get(schluessel)!;
  };
};

const spielkartenVorlage = zwischengespeichert((erweiterung: boolean) => vorlage(erstelleSpielkarten(erweiterung)));
const aufgabenVorlage = vorlage(erstelleAufgabenStapel());
const auslageVorlage = zwischengespeichert((spielerzahl: number) =>
  vorlage(Array.from({ length: spielerzahl }, (_, index) => erstelleAuslagekarten(index)).flatMap(({ comeback, risiko }) => [comeback, ...risiko])),
);
/** Ohne Erweiterung gibt es weder Aufgaben noch Comeback- und Risiko-Karten (A4). */
const OHNE_ERWEITERUNG: Vorlage = new Map();

/** Vergleicht die vorhandenen Stücke mit dem erwarteten Material: fehlend, doppelt, unbekannt, verändert. */
function vergleicheMitMaterial(erwartet: Vorlage, vorhanden: readonly { id: string }[]): string[] {
  const anzahl = new Map<string, number>();
  const veraendert = new Set<string>();
  for (const stueck of vorhanden) {
    anzahl.set(stueck.id, (anzahl.get(stueck.id) ?? 0) + 1);
    const soll = erwartet.get(stueck.id);
    if (soll !== undefined && soll !== kanonisch(stueck)) veraendert.add(stueck.id);
  }
  const liste = (titel: string, ids: string[]) => (ids.length > 0 ? [`${titel}: ${ids.join(', ')}.`] : []);
  return [
    ...liste('Fehlt', [...erwartet.keys()].filter((id) => !anzahl.has(id))),
    ...liste('Doppelt', [...anzahl].filter(([, n]) => n > 1).map(([id, n]) => `${id} (${n}×)`)),
    ...liste('Unbekannt', [...anzahl.keys()].filter((id) => !erwartet.has(id))),
    ...liste('Verändert', [...veraendert]),
  ];
}

function jedeSpielkarteGenauEinmal(zustand: Spielzustand, karten: Spielkarte[]): string[] {
  return vergleicheMitMaterial(spielkartenVorlage(zustand.erweiterung), karten);
}

function jedeAufgabeGenauEinmal(zustand: Spielzustand): string[] {
  const probleme = vergleicheMitMaterial(zustand.erweiterung ? aufgabenVorlage : OHNE_ERWEITERUNG, alleAufgaben(zustand));
  if (zustand.offeneAufgaben.length > OFFENE_AUFGABEN) probleme.push(`${zustand.offeneAufgaben.length} offene Aufgaben, höchstens ${OFFENE_AUFGABEN}.`);
  for (const spieler of zustand.spieler) {
    if (zustand.erweiterung && spieler.geheimeAufgabe === null) probleme.push(`${spieler.id} hat keine geheime Aufgabe.`);
  }
  return probleme;
}

function jedeAuslagekarteGenauEinmal(zustand: Spielzustand): string[] {
  const erwartet = zustand.erweiterung ? auslageVorlage(zustand.spieler.length) : OHNE_ERWEITERUNG;
  return vergleicheMitMaterial(erwartet, alleAuslagekarten(zustand));
}

function hoechstensZweiSchlangen(zustand: Spielzustand): string[] {
  return zustand.spieler
    .filter((spieler) => spieler.schlangen.length > MAX_SCHLANGEN_PRO_SPIELER)
    .map((spieler) => `${spieler.id} hat ${spieler.schlangen.length} Schlangen.`);
}

function keineLeereSchlange(zustand: Spielzustand): string[] {
  return zustand.spieler.flatMap((spieler) =>
    spieler.schlangen.filter((schlange) => schlange.karten.length === 0).map((schlange) => `${schlange.id} von ${spieler.id} ist leer.`),
  );
}

function idsEindeutig(zustand: Spielzustand, karten: Spielkarte[]): string[] {
  const ids = [
    ...zustand.spieler.map((spieler) => spieler.id),
    ...zustand.spieler.flatMap((spieler) => spieler.schlangen.map((schlange) => schlange.id)),
    ...[...karten, ...alleAufgaben(zustand), ...alleAuslagekarten(zustand)].map((stueck) => stueck.id),
  ];
  const gesehen = new Set<string>();
  const doppelt = new Set<string>();
  for (const id of ids) (gesehen.has(id) ? doppelt : gesehen).add(id);
  return doppelt.size > 0 ? [`Mehrfach vergeben: ${[...doppelt].join(', ')}.`] : [];
}

function fusionenVollstaendig(zustand: Spielzustand): string[] {
  const probleme: string[] = [];
  for (const schlange of zustand.spieler.flatMap((spieler) => spieler.schlangen)) {
    const fusionskarten = schlange.karten.filter((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Farbenfusion').map((karte) => karte.id);
    const eintraege = schlange.fusionen.map((fusion) => fusion.karteId);
    for (const id of fusionskarten) {
      const anzahl = eintraege.filter((eintrag) => eintrag === id).length;
      if (anzahl !== 1) probleme.push(`${id} in ${schlange.id} hat ${anzahl} statt einen Eintrag mit den Karten darunter.`);
    }
    for (const fusion of schlange.fusionen) {
      if (!fusionskarten.includes(fusion.karteId)) probleme.push(`Unter ${fusion.karteId} liegen Karten, aber ${schlange.id} enthält diese Farbenfusion nicht.`);
      const [links, rechts] = fusion.unter;
      if (fusion.unter.length !== 2 || links.farbe !== rechts.farbe) {
        probleme.push(`Unter ${fusion.karteId} liegen nicht zwei Farbkarten gleicher Farbe.`);
      }
    }
  }
  return probleme;
}

function verweiseGueltig(zustand: Spielzustand): string[] {
  const anzahl = zustand.spieler.length;
  const gueltig = (index: number) => Number.isInteger(index) && index >= 0 && index < anzahl;
  const probleme: string[] = [];
  const pruefe = (index: number, was: string) => {
    if (!gueltig(index)) probleme.push(`${was} verweist auf Spieler ${index}, es gibt ${anzahl}.`);
  };
  pruefe(zustand.zug.spielerIndex, 'Der Zug');
  if (zustand.schlussrundeAusloeser !== null) pruefe(zustand.schlussrundeAusloeser, 'Der Schlussrunden-Auslöser');
  for (const grube of zustand.ausliegendeGruben) {
    pruefe(grube.gespieltVon, `${grube.karte.id} (gespielt von)`);
    pruefe(grube.vor, `${grube.karte.id} (liegt vor)`);
    if (grube.karte.name !== 'Schlangengrube') probleme.push(`${grube.karte.id} liegt als Schlangengrube aus, ist aber keine.`);
  }
  const { schwebend } = zustand;
  if (schwebend !== null) {
    for (const index of [...schwebend.ausstehend, ...schwebend.abgewehrt]) pruefe(index, `Die schwebende ${schwebend.karte.id}`);
    if (!zustand.spieler.some((spieler) => spieler.id === schwebend.aktion.spielerId)) {
      probleme.push(`Die schwebende Aktion nennt den unbekannten Spieler ${schwebend.aktion.spielerId}.`);
    }
    if (schwebend.aktion.karteId !== schwebend.karte.id || kartenartFuer(schwebend.aktion.typ) !== kartenartVon(schwebend.karte)) {
      probleme.push(`Die schwebende ${schwebend.karte.id} passt nicht zur Aktion ${schwebend.aktion.typ} mit ${schwebend.aktion.karteId}.`);
    }
    const doppelt = schwebend.ausstehend.filter((index) => schwebend.abgewehrt.includes(index));
    if (doppelt.length > 0) probleme.push(`Spieler ${doppelt.join(', ')} steht bei der schwebenden Karte zugleich als ausstehend und abgewehrt.`);
  }
  return probleme;
}

function partiephasePasst(zustand: Spielzustand): string[] {
  const probleme: string[] = [];
  const laufend = zustand.partiephase === 'Laufend';
  if (laufend && zustand.schlussrundeAusloeser !== null) probleme.push('Die Partie läuft, nennt aber einen Schlussrunden-Auslöser.');
  if (!laufend && zustand.schlussrundeAusloeser === null) probleme.push(`Partiephase ${zustand.partiephase} ohne Schlussrunden-Auslöser (A10).`);
  if (zustand.partiephase === 'Beendet' && zustand.schwebend !== null) probleme.push('Die Partie ist beendet, aber eine Karte schwebt noch.');
  return probleme;
}
