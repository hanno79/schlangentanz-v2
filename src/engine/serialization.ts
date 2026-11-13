import { istKartenaktion, pruefeAktionsform } from './aktionen/pruefen';
import type { SpielAktion } from './aktionen/typen';
import { FARBEN, SONDERKARTENNAMEN } from './deck';
import { abweichendeFelder, fehlertext, istGanzeZahl, istObjekt, istText } from './form';
import { pruefeInvarianten } from './invarianten';
import type { Spielzustand } from './types';

/*
Speicherformat 2. Ein Spielstand im Format 1 wird abgelehnt: Mit dem Neuaufbau
werden alte Spielstände verworfen (Plan 2.3), Migrationen gibt es keine.

Geladen wird in zwei Stufen. Erst die Form: jedes Feld da, keines zu viel, jeder
Wert vom richtigen Typ; der Fehler nennt den Pfad. Dann die Invarianten
(`invarianten.ts`): Material vollständig und unverändert, Verweise gültig.
*/

export function serialisiere(zustand: Spielzustand): string {
  return JSON.stringify(sortiereStabil(zustand));
}

export function deserialisiere(json: string): Spielzustand {
  let roh: unknown;
  try {
    roh = JSON.parse(json);
  } catch {
    throw new Error('Ungültiger Spielstand: Er ist kein gültiges JSON.');
  }
  if (!istObjekt(roh)) throw new Error('Ungültiger Spielstand: Er ist kein Objekt.');
  if (roh.version === 1) {
    throw new Error('Ungültiger Spielstand: Format 1 wird nicht mehr geladen; seit dem Neuaufbau gilt Format 2, alte Spielstände werden verworfen.');
  }
  if (roh.version !== 2) throw new Error(`Ungültiger Spielstand: Format ${String(roh.version)} ist unbekannt, erwartet ist Format 2.`);

  pruefeZustandsform(roh);
  const verletzt = pruefeInvarianten(roh).find((befund) => befund.verletzt);
  if (verletzt !== undefined) throw new Error(`Ungültiger Spielstand: ${verletzt.name} verletzt. ${verletzt.detail}`);
  return roh;
}

/** Was beim Speichern und Wiederladen verloren ginge oder abgelehnt würde; leer, wenn nichts. */
export function pruefeSpeichernUndLaden(zustand: Spielzustand): string[] {
  const gespeichert = serialisiere(zustand);
  try {
    return serialisiere(deserialisiere(gespeichert)) === gespeichert ? [] : ['Nach dem Laden weicht der Zustand ab.'];
  } catch (fehler) {
    return [`Die Engine wirft: ${fehlertext(fehler)}`];
  }
}

function sortiereStabil(wert: unknown): unknown {
  if (Array.isArray(wert)) return wert.map(sortiereStabil);
  if (istObjekt(wert)) {
    return Object.fromEntries(
      Object.keys(wert)
        .sort()
        .map((schluessel) => [schluessel, sortiereStabil(wert[schluessel])]),
    );
  }
  return wert;
}

function fehler(pfad: string, was: string): never {
  throw new Error(`Ungültiger Spielstand: ${pfad} ${was}.`);
}

function objekt(wert: unknown, pfad: string, felder: readonly string[]): Record<string, unknown> {
  if (!istObjekt(wert)) fehler(pfad, 'ist kein Objekt');
  const abweichend = abweichendeFelder(wert, felder);
  if (abweichend.length > 0) fehler(`${pfad}:`, abweichend.join(', '));
  return wert;
}

function liste(wert: unknown, pfad: string, element: (eintrag: unknown, pfad: string) => void): void {
  if (!Array.isArray(wert)) fehler(pfad, 'ist keine Liste');
  wert.forEach((eintrag, index) => element(eintrag, `${pfad}[${index}]`));
}

function text(wert: unknown, pfad: string): void {
  if (!istText(wert)) fehler(pfad, 'ist kein Text');
}

function zahl(wert: unknown, pfad: string, minimum = 0): void {
  if (!istGanzeZahl(wert, minimum)) fehler(pfad, `ist keine ganze Zahl ab ${minimum}`);
}

function wahrheitswert(wert: unknown, pfad: string): void {
  if (typeof wert !== 'boolean') fehler(pfad, 'ist nicht wahr oder falsch');
}

function einer(wert: unknown, pfad: string, erlaubt: readonly unknown[]): void {
  if (!erlaubt.includes(wert)) fehler(pfad, `ist ungültig (erlaubt: ${erlaubt.join(', ')})`);
}

function spielkarte(wert: unknown, pfad: string): void {
  const typ = istObjekt(wert) ? wert.typ : undefined;
  if (typ === 'Farbkarte') {
    const karte = objekt(wert, pfad, ['typ', 'id', 'farbe', 'punkte']);
    text(karte.id, `${pfad}.id`);
    einer(karte.farbe, `${pfad}.farbe`, FARBEN);
    zahl(karte.punkte, `${pfad}.punkte`, 1);
  } else if (typ === 'Sonderkarte') {
    const karte = objekt(wert, pfad, ['typ', 'id', 'name']);
    text(karte.id, `${pfad}.id`);
    einer(karte.name, `${pfad}.name`, SONDERKARTENNAMEN);
  } else {
    fehler(pfad, 'ist keine Farb- oder Sonderkarte');
  }
}

function sonderkarte(wert: unknown, pfad: string): void {
  spielkarte(wert, pfad);
  if ((wert as { typ: string }).typ !== 'Sonderkarte') fehler(pfad, 'ist keine Sonderkarte');
}

function farbkarte(wert: unknown, pfad: string): void {
  spielkarte(wert, pfad);
  if ((wert as { typ: string }).typ !== 'Farbkarte') fehler(pfad, 'ist keine Farbkarte');
}

function aufgabe(wert: unknown, pfad: string): void {
  const karte = objekt(wert, pfad, ['typ', 'id', 'name', 'punkte', 'bedingung']);
  einer(karte.typ, `${pfad}.typ`, ['Aufgabenkarte']);
  text(karte.id, `${pfad}.id`);
  text(karte.name, `${pfad}.name`);
  zahl(karte.punkte, `${pfad}.punkte`, 1);
  text(karte.bedingung, `${pfad}.bedingung`);
}

function auslagekarte(wert: unknown, pfad: string): void {
  const karte = objekt(wert, pfad, ['typ', 'id']);
  einer(karte.typ, `${pfad}.typ`, ['Comeback', 'Risiko-Belohnung']);
  text(karte.id, `${pfad}.id`);
}

function schlange(wert: unknown, pfad: string): void {
  const roh = objekt(wert, pfad, ['id', 'karten', 'fusionen']);
  text(roh.id, `${pfad}.id`);
  liste(roh.karten, `${pfad}.karten`, spielkarte);
  liste(roh.fusionen, `${pfad}.fusionen`, (eintrag, fusionPfad) => {
    const fusion = objekt(eintrag, fusionPfad, ['karteId', 'unter']);
    text(fusion.karteId, `${fusionPfad}.karteId`);
    liste(fusion.unter, `${fusionPfad}.unter`, farbkarte);
    if ((fusion.unter as unknown[]).length !== 2) fehler(`${fusionPfad}.unter`, 'hat nicht genau zwei Karten');
  });
}

function spieler(wert: unknown, pfad: string): void {
  const roh = objekt(wert, pfad, [
    'id',
    'name',
    'steuerung',
    'hand',
    'schlangen',
    'ablagestapel',
    'ausgespielteSonderkarten',
    'schlangenhaeutungDreiergruppen',
    'erfuellteAufgaben',
    'geheimeAufgabe',
    'geheimeAufgabeErfuellt',
    'comeback',
    'risikoKarten',
  ]);
  text(roh.id, `${pfad}.id`);
  text(roh.name, `${pfad}.name`);
  einer(roh.steuerung, `${pfad}.steuerung`, ['Mensch', 'KI']);
  liste(roh.hand, `${pfad}.hand`, spielkarte);
  liste(roh.schlangen, `${pfad}.schlangen`, schlange);
  liste(roh.ablagestapel, `${pfad}.ablagestapel`, spielkarte);
  liste(roh.ausgespielteSonderkarten, `${pfad}.ausgespielteSonderkarten`, (name, namePfad) => einer(name, namePfad, SONDERKARTENNAMEN));
  zahl(roh.schlangenhaeutungDreiergruppen, `${pfad}.schlangenhaeutungDreiergruppen`);
  liste(roh.erfuellteAufgaben, `${pfad}.erfuellteAufgaben`, aufgabe);
  if (roh.geheimeAufgabe !== null) aufgabe(roh.geheimeAufgabe, `${pfad}.geheimeAufgabe`);
  wahrheitswert(roh.geheimeAufgabeErfuellt, `${pfad}.geheimeAufgabeErfuellt`);
  if (roh.comeback !== null) {
    const comeback = objekt(roh.comeback, `${pfad}.comeback`, ['karte', 'verbraucht']);
    auslagekarte(comeback.karte, `${pfad}.comeback.karte`);
    wahrheitswert(comeback.verbraucht, `${pfad}.comeback.verbraucht`);
  }
  liste(roh.risikoKarten, `${pfad}.risikoKarten`, auslagekarte);
}

function zug(wert: unknown, pfad: string): void {
  const roh = objekt(wert, pfad, [
    'spielerIndex',
    'teilzug',
    'gespielteFarbkarten',
    'gespielteSonderkarten',
    'verdopplerGespielt',
    'farbenfusionGespielt',
    'abschnitt',
  ]);
  zahl(roh.spielerIndex, `${pfad}.spielerIndex`);
  einer(roh.teilzug, `${pfad}.teilzug`, [1, 2]);
  zahl(roh.gespielteFarbkarten, `${pfad}.gespielteFarbkarten`);
  zahl(roh.gespielteSonderkarten, `${pfad}.gespielteSonderkarten`);
  wahrheitswert(roh.verdopplerGespielt, `${pfad}.verdopplerGespielt`);
  wahrheitswert(roh.farbenfusionGespielt, `${pfad}.farbenfusionGespielt`);
  einer(roh.abschnitt, `${pfad}.abschnitt`, ['Ausspielen', 'Abwerfen']);
}

function schwebend(wert: unknown, pfad: string): void {
  const roh = objekt(wert, pfad, ['karte', 'aktion', 'ausstehend', 'abgewehrt']);
  sonderkarte(roh.karte, `${pfad}.karte`);
  const formfehler = pruefeAktionsform(roh.aktion);
  if (formfehler !== null) fehler(`${pfad}.aktion:`, formfehler);
  if (!istKartenaktion(roh.aktion as SpielAktion)) fehler(`${pfad}.aktion`, 'spielt keine Karte mit Wirkung');
  liste(roh.ausstehend, `${pfad}.ausstehend`, (index, indexPfad) => zahl(index, indexPfad));
  liste(roh.abgewehrt, `${pfad}.abgewehrt`, (index, indexPfad) => zahl(index, indexPfad));
}

function pruefeZustandsform(wert: unknown): asserts wert is Spielzustand {
  const roh = objekt(wert, 'Spielstand', [
    'version',
    'erweiterung',
    'spieler',
    'partiephase',
    'zug',
    'schlussrundeAusloeser',
    'nachziehstapel',
    'ausliegendeGruben',
    'schwebend',
    'ausDemSpiel',
    'offeneAufgaben',
    'aufgabenStapel',
    'schlangenZaehler',
  ]);
  wahrheitswert(roh.erweiterung, 'erweiterung');
  liste(roh.spieler, 'spieler', spieler);
  einer(roh.partiephase, 'partiephase', ['Laufend', 'Schlussrunde', 'Beendet']);
  zug(roh.zug, 'zug');
  if (roh.schlussrundeAusloeser !== null) zahl(roh.schlussrundeAusloeser, 'schlussrundeAusloeser');
  liste(roh.nachziehstapel, 'nachziehstapel', spielkarte);
  liste(roh.ausliegendeGruben, 'ausliegendeGruben', (eintrag, pfad) => {
    const grube = objekt(eintrag, pfad, ['karte', 'gespieltVon', 'vor']);
    sonderkarte(grube.karte, `${pfad}.karte`);
    zahl(grube.gespieltVon, `${pfad}.gespieltVon`);
    zahl(grube.vor, `${pfad}.vor`);
  });
  if (roh.schwebend !== null) schwebend(roh.schwebend, 'schwebend');
  liste(roh.ausDemSpiel, 'ausDemSpiel', (eintrag, pfad) => {
    const typ = istObjekt(eintrag) ? eintrag.typ : undefined;
    if (typ === 'Comeback' || typ === 'Risiko-Belohnung') auslagekarte(eintrag, pfad);
    else spielkarte(eintrag, pfad);
  });
  liste(roh.offeneAufgaben, 'offeneAufgaben', aufgabe);
  liste(roh.aufgabenStapel, 'aufgabenStapel', aufgabe);
  zahl(roh.schlangenZaehler, 'schlangenZaehler');
}
