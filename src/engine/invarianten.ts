import { MAX_SCHLANGEN_PRO_SPIELER, OFFENE_AUFGABEN } from './constants';
import { erstelleAuslagekarten, erstelleSpielkarten } from './deck';
import { erstelleAufgabenStapel } from './aufgabenKarten';
import { kartenartFuer, kartenartVon } from './karten/register';
import type { Auslagekarte, Spielkarte, Spielzustand } from './types';

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

type Pruefung = (zustand: Spielzustand) => string[];

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
  return INVARIANTEN.map(([name, pruefe]) => {
    const probleme = pruefe(zustand);
    return { name, verletzt: probleme.length > 0, detail: probleme.join(' ') };
  });
}

/** Jede Karte, wo sie liegt (A4, A6, A7.6, A7.7, A7.10). */
export function alleSpielkarten(zustand: Spielzustand): Spielkarte[] {
  return [
    ...zustand.nachziehstapel,
    ...zustand.spieler.flatMap((spieler) => [
      ...spieler.hand,
      ...spieler.ablagestapel,
      ...spieler.schlangen.flatMap((schlange) => [...schlange.karten, ...schlange.fusionen.flatMap((fusion) => fusion.unter)]),
    ]),
    ...zustand.ausliegendeGruben.map((grube) => grube.karte),
    ...(zustand.schwebend === null ? [] : [zustand.schwebend.karte]),
    ...zustand.ausDemSpiel.filter(istSpielkarte),
  ];
}

function istSpielkarte(karte: Spielkarte | Auslagekarte): karte is Spielkarte {
  return karte.typ === 'Farbkarte' || karte.typ === 'Sonderkarte';
}

const kanonisch = (wert: unknown): string => JSON.stringify(wert, Object.keys(wert as object).sort());

/** Vergleicht die vorhandenen Stücke mit dem erwarteten Material: fehlend, doppelt, unbekannt, verändert. */
function vergleicheMitMaterial<T extends { id: string }>(erwartet: readonly T[], vorhanden: readonly T[]): string[] {
  const vorlage = new Map(erwartet.map((stueck) => [stueck.id, kanonisch(stueck)]));
  const anzahl = new Map<string, number>();
  const veraendert = new Set<string>();
  for (const stueck of vorhanden) {
    anzahl.set(stueck.id, (anzahl.get(stueck.id) ?? 0) + 1);
    const soll = vorlage.get(stueck.id);
    if (soll !== undefined && soll !== kanonisch(stueck)) veraendert.add(stueck.id);
  }
  const liste = (titel: string, ids: string[]) => (ids.length > 0 ? [`${titel}: ${ids.join(', ')}.`] : []);
  return [
    ...liste('Fehlt', [...vorlage.keys()].filter((id) => !anzahl.has(id))),
    ...liste('Doppelt', [...anzahl].filter(([, n]) => n > 1).map(([id, n]) => `${id} (${n}×)`)),
    ...liste('Unbekannt', [...anzahl.keys()].filter((id) => !vorlage.has(id))),
    ...liste('Verändert', [...veraendert]),
  ];
}

const material = new Map<boolean, Spielkarte[]>();

function jedeSpielkarteGenauEinmal(zustand: Spielzustand): string[] {
  if (!material.has(zustand.erweiterung)) material.set(zustand.erweiterung, erstelleSpielkarten(zustand.erweiterung));
  return vergleicheMitMaterial(material.get(zustand.erweiterung)!, alleSpielkarten(zustand));
}

function jedeAufgabeGenauEinmal(zustand: Spielzustand): string[] {
  const vorhanden = [
    ...zustand.offeneAufgaben,
    ...zustand.aufgabenStapel,
    ...zustand.spieler.flatMap((spieler) => [...(spieler.geheimeAufgabe === null ? [] : [spieler.geheimeAufgabe]), ...spieler.erfuellteAufgaben]),
  ];
  const probleme = vergleicheMitMaterial(zustand.erweiterung ? erstelleAufgabenStapel() : [], vorhanden);
  if (zustand.offeneAufgaben.length > OFFENE_AUFGABEN) probleme.push(`${zustand.offeneAufgaben.length} offene Aufgaben, höchstens ${OFFENE_AUFGABEN}.`);
  for (const spieler of zustand.spieler) {
    if (zustand.erweiterung && spieler.geheimeAufgabe === null) probleme.push(`${spieler.id} hat keine geheime Aufgabe.`);
  }
  return probleme;
}

function jedeAuslagekarteGenauEinmal(zustand: Spielzustand): string[] {
  const erwartet = zustand.erweiterung
    ? zustand.spieler.flatMap((_, index) => {
        const { comeback, risiko } = erstelleAuslagekarten(index);
        return [comeback, ...risiko];
      })
    : [];
  const vorhanden = [
    ...zustand.spieler.flatMap((spieler) => [...(spieler.comeback === null ? [] : [spieler.comeback.karte]), ...spieler.risikoKarten]),
    ...zustand.ausDemSpiel.filter((karte): karte is Auslagekarte => !istSpielkarte(karte)),
  ];
  return vergleicheMitMaterial(erwartet, vorhanden);
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

function idsEindeutig(zustand: Spielzustand): string[] {
  const ids = [
    ...zustand.spieler.map((spieler) => spieler.id),
    ...zustand.spieler.flatMap((spieler) => spieler.schlangen.map((schlange) => schlange.id)),
    ...alleSpielkarten(zustand).map((karte) => karte.id),
    ...zustand.offeneAufgaben.map((aufgabe) => aufgabe.id),
    ...zustand.aufgabenStapel.map((aufgabe) => aufgabe.id),
    ...zustand.spieler.flatMap((spieler) => [
      ...(spieler.geheimeAufgabe === null ? [] : [spieler.geheimeAufgabe.id]),
      ...spieler.erfuellteAufgaben.map((aufgabe) => aufgabe.id),
      ...(spieler.comeback === null ? [] : [spieler.comeback.karte.id]),
      ...spieler.risikoKarten.map((karte) => karte.id),
    ]),
    ...zustand.ausDemSpiel.filter((karte) => !istSpielkarte(karte)).map((karte) => karte.id),
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
