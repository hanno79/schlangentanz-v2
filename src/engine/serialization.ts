/*
Author: rahn
Datum: 31.05.2026
Version: 1.1
Beschreibung: Deterministische Serialisierung und Validierung von Spielzuständen.

ÄNDERUNG [30.07.2026]: AP-0 — Verwendungszweck klargestellt (Onboarding-Finding 5).
Dieses Modul ist bewusst **Test-Infrastruktur, kein Persistenz-Feature**:

- Es gibt in der App kein Speichern/Laden. `serialisiere`/`deserialisiere` haben
  keinen Produktionsaufrufer; ein Reload verwirft die laufende Partie.
- Der eigentliche Zweck ist die Invarianten-Absicherung im Vollpartie-Soak-Test
  (`src/engine/__tests__/vollpartie_simulation.test.ts`): Nach jedem Zug muss ein
  Roundtrip `deserialisiere(serialisiere(zustand))` fehlerfrei durchlaufen. Damit
  fängt `validiereSpielzustand` strukturelle Engine-Fehler (verwaiste
  Farbenfusion-Einträge, unbekannte Kartennamen, inkonsistente Zugpflicht-Zähler)
  auf, die sonst erst in der Wertung als Absturz aufgefallen wären.
- Die Migrationsschritte (`migriere*`) halten ältere Testfixtures lauffähig. Sie
  werden bewusst nicht ausgedünnt, obwohl es in Production nie Altstände gab —
  ihr Wert liegt in der Abwärtskompatibilität der Fixtures.

Wer hier Persistenz ergänzen will, braucht einen eigenen Slice inkl. Fehlerpfad
für ungültige gespeicherte Stände — nicht nur einen localStorage-Aufruf.
*/

import type {
  AufgabenkarteInfo,
  Farbe,
  SchlangenZustand,
  Spielkarte,
  Spielphase,
  Spieler,
  Spielzustand,
  Steuerung,
  Zugphase,
} from './types';
import { SPIELER_MAX, SPIELER_MIN, MAX_KARTEN_PRO_ZUG } from './constants';
import { erstelleErweiterungsSonderkarten, erstelleSpieldeck, erstelleSonderkarten } from './deck';
import { erstelleAufgabenStapel } from './aufgabenKarten';

const ZUGPHASEN: ReadonlySet<Zugphase> = new Set([
  'Nachziehphase',
  'Ausspielphase',
  'Aufgabenpruefung',
  'Zugabschluss',
  'Spielende',
]);

const SPIELPHASEN: ReadonlySet<Spielphase> = new Set(['Normal', 'Endspurt', 'Beendet']);
const FARBEN: ReadonlySet<Farbe> = new Set(['Blau', 'Rot', 'Gelb', 'Violett', 'Braun', 'Grün']);
const SCHLANGEN_ZUSTAENDE: ReadonlySet<SchlangenZustand> = new Set([
  'aktiv',
  'blockiert',
  'geschuetzt',
]);
const STEUERUNGEN: ReadonlySet<Steuerung> = new Set(['Mensch', 'KI']);
const BEKANNTE_SONDERKARTENNAMEN: ReadonlySet<string> = new Set([
  ...erstelleSonderkarten().map((k) => k.name),
  ...erstelleErweiterungsSonderkarten().map((k) => k.name),
]);

const REAKTIONS_TYPEN: ReadonlySet<string> = new Set([
  'SchlangengrubeAbwehr',
  'SchlangenblockadeAbwehr',
  'FarbendiebAbwehr',
  'SchlangenfrassAbwehr',
  'VerdopplerAbwehr',
]);

export function serialisiere(zustand: Spielzustand): string {
  return serialisiereMaterial(zustand);
}

export function deserialisiere(json: string): Spielzustand {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Ungültiger Spielzustand: JSON konnte nicht geparst werden.');
  }

  migriereZugpflichtenVorR19(parsed);
  migriereAussetzenVorR74(parsed);
  migrierePendingReaktionVorR78(parsed);
  migriereSonderkartenHistorieVorR94(parsed);
  migriereSchlangentanzHistorieVorR97(parsed);
  migriereGeheimeAufgabeErfuelltVorK4(parsed);
  migriereEndspurtVerdopplungVorK5(parsed);
  migriereNachziehBerechtigteVorR2_3a(parsed);
  validiereSpielzustand(parsed);
  return parsed;
}

function migriereZugpflichtenVorR19(wert: unknown): void {
  if (!istObjekt(wert) || !istObjekt(wert['zugpflichten'])) return;

  const zugpflichten = wert['zugpflichten'];
  const hatFarbkarten = Object.prototype.hasOwnProperty.call(zugpflichten, 'gespielteFarbkarten');
  const hatSonderkarten = Object.prototype.hasOwnProperty.call(zugpflichten, 'gespielteSonderkarten');
  if (!hatFarbkarten && !hatSonderkarten && zugpflichten['gespielteKarten'] === 0) {
    zugpflichten['gespielteFarbkarten'] = 0;
    zugpflichten['gespielteSonderkarten'] = 0;
  }
  if (!Object.prototype.hasOwnProperty.call(zugpflichten, 'verdopplerBonusAktiv')) {
    zugpflichten['verdopplerBonusAktiv'] = false;
  }
  if (!Object.prototype.hasOwnProperty.call(zugpflichten, 'farbenfusionGespielt')) {
    zugpflichten['farbenfusionGespielt'] = false;
  }
}

function migriereAussetzenVorR74(wert: unknown): void {
  if (!istObjekt(wert)) return;
  if (!Object.prototype.hasOwnProperty.call(wert, 'aussetzenSpielerIndizes')) {
    wert['aussetzenSpielerIndizes'] = [];
  }
}

function migrierePendingReaktionVorR78(wert: unknown): void {
  if (!istObjekt(wert)) return;
  if (!Object.prototype.hasOwnProperty.call(wert, 'pendingReaktion')) {
    wert['pendingReaktion'] = null;
  }
}

function migriereSonderkartenHistorieVorR94(wert: unknown): void {
  if (!istObjekt(wert) || !Array.isArray(wert['spieler'])) return;
  for (const spieler of wert['spieler']) {
    if (!istObjekt(spieler)) continue;
    if (!Object.prototype.hasOwnProperty.call(spieler, 'ausgespielteSonderkartenNamen')) {
      spieler['ausgespielteSonderkartenNamen'] = [];
    }
  }
}

function migriereSchlangentanzHistorieVorR97(wert: unknown): void {
  if (!istObjekt(wert) || !Array.isArray(wert['spieler'])) return;
  for (const spieler of wert['spieler']) {
    if (!istObjekt(spieler)) continue;
    if (!Object.prototype.hasOwnProperty.call(spieler, 'schlangenhaeutungDreiergruppen')) {
      // ÄNDERUNG [07.06.2026]: R97 migriert Altstände ohne Schlangentanz-Historie auf 0.
      spieler['schlangenhaeutungDreiergruppen'] = 0;
    }
  }
}

function migriereGeheimeAufgabeErfuelltVorK4(wert: unknown): void {
  if (!istObjekt(wert) || !Array.isArray(wert['spieler'])) return;
  for (const spieler of wert['spieler']) {
    if (!istObjekt(spieler)) continue;
    if (!Object.prototype.hasOwnProperty.call(spieler, 'geheimeAufgabeErfuellt')) {
      // ÄNDERUNG [05.07.2026]: K4 — Altstände ohne Flag gelten als "nicht erfüllt".
      spieler['geheimeAufgabeErfuellt'] = false;
    }
  }
}

function migriereEndspurtVerdopplungVorK5(wert: unknown): void {
  if (!istObjekt(wert) || !Array.isArray(wert['spieler'])) return;
  for (const spieler of wert['spieler']) {
    if (!istObjekt(spieler)) continue;
    if (!Object.prototype.hasOwnProperty.call(spieler, 'endspurtVerdoppelteAufgabenIds')) {
      // ÄNDERUNG [05.07.2026]: K5 — Altstände ohne Feld haben keine verdoppelten Aufgaben.
      spieler['endspurtVerdoppelteAufgabenIds'] = [];
    }
  }
}

function sortiereStabil(wert: unknown): unknown {
  if (Array.isArray(wert)) {
    return wert.map(sortiereStabil);
  }
  if (istObjekt(wert)) {
    return Object.fromEntries(
      Object.keys(wert)
        .sort()
        .map((key) => [key, sortiereStabil(wert[key])]),
    );
  }
  return wert;
}

function validiereSpielzustand(wert: unknown): asserts wert is Spielzustand {
  const obj = erwarteObjekt(wert, 'Spielzustand');
  if (obj['version'] !== 1) {
    throw new Error('Ungültiger Spielzustand: Fehlende oder falsche Versionsnummer.');
  }

  const spieler = erwarteArray(obj['spieler'], 'spieler');
  if (spieler.length < SPIELER_MIN || spieler.length > SPIELER_MAX) {
    throw new Error(`Ungültiger Spielzustand: Spieleranzahl muss ${SPIELER_MIN}–${SPIELER_MAX} sein.`);
  }

  const aktiverSpielerIndex = obj['aktiverSpielerIndex'];
  if (!Number.isInteger(aktiverSpielerIndex)) {
    throw new Error('Ungültiger Spielzustand: Aktiver Spieler fehlt oder ist ungültig.');
  }
  const aktiverIndex = aktiverSpielerIndex as number;
  if (aktiverIndex < 0 || aktiverIndex >= spieler.length) {
    throw new Error('Ungültiger Spielzustand: Aktiver Spieler liegt außerhalb des Spielerbereichs.');
  }

  if (!ZUGPHASEN.has(obj['zugphase'] as Zugphase)) {
    throw new Error('Ungültiger Spielzustand: zugphase ist ungültig.');
  }
  if (!SPIELPHASEN.has(obj['spielphase'] as Spielphase)) {
    throw new Error('Ungültiger Spielzustand: spielphase ist ungültig.');
  }

  const zugphase = obj['zugphase'] as Zugphase;
  const spielphase = obj['spielphase'] as Spielphase;
  if (zugphase === 'Spielende' && spielphase !== 'Beendet') {
    throw new Error('Ungültiger Spielzustand: Spielende-Zugphase ist nur bei Beendet-Spielphase erlaubt.');
  }
  if (spielphase === 'Beendet' && zugphase !== 'Spielende') {
    throw new Error('Ungültiger Spielzustand: Beendet-Spielphase erfordert Spielende-Zugphase.');
  }

  validiereZugpflichten(obj['zugpflichten']);
  validiereAussetzen(obj['aussetzenSpielerIndizes'], spieler.length);
  validiereNachziehBerechtigte(obj['nachziehBerechtigteIndizes'], spieler.length, obj['pendingReaktion']);

  const verwendeteIds = new Set<string>();
  for (const einSpieler of spieler) {
    validiereSpieler(einSpieler, verwendeteIds);
  }
  validiereSpielsteuerungsVerteilung(spieler as Spieler[]);

  validiereSpielkartenArray(obj['nachziehstapel'], 'nachziehstapel', verwendeteIds);
  const nachziehstapel = erwarteArray(obj['nachziehstapel'], 'nachziehstapel');
  validiereSpielphaseNachziehstapel(spielphase, nachziehstapel.length);
  validiereSpielkartenArray(obj['ablagestapel'], 'ablagestapel', verwendeteIds);
  validierePendingReaktion(obj['pendingReaktion'], spieler as Spieler[], obj['ablagestapel']);
  validiereAufgabenArray(obj['offeneAufgaben'], 'offeneAufgaben', verwendeteIds);
  validiereAufgabenArray(obj['aufgabenStapel'], 'aufgabenStapel', verwendeteIds);
  validiereEndrunde(obj['endrunde'], spielphase, spieler.length, aktiverIndex);
  validiereKanonischesMaterial(obj as unknown as Spielzustand);
}

function validiereSpielphaseNachziehstapel(spielphase: Spielphase, nachziehstapelLaenge: number): void {
  if (spielphase === 'Normal' && nachziehstapelLaenge === 0) {
    throw new Error('Ungültiger Spielzustand: Normal-Phase erfordert einen nicht leeren Nachziehstapel.');
  }
  if ((spielphase === 'Endspurt' || spielphase === 'Beendet') && nachziehstapelLaenge !== 0) {
    throw new Error('Ungültiger Spielzustand: Endspurt und Spielende erfordern einen leeren Nachziehstapel.');
  }
}

function berechneEndrundenSpieler(ausloeserIndex: number, spielerAnzahl: number): number[] {
  const indizes: number[] = [];
  for (let i = 1; i < spielerAnzahl; i++) {
    indizes.push((ausloeserIndex + i) % spielerAnzahl);
  }
  return indizes;
}

function istSuffix(vollstaendig: number[], verbleibende: unknown[]): boolean {
  const start = vollstaendig.length - verbleibende.length;
  return start >= 0 && verbleibende.every((idx, position) => idx === vollstaendig[start + position]);
}

function validiereEndrunde(wert: unknown, spielphase: Spielphase, spielerAnzahl: number, aktiverIndex: number): void {
  const obj = erwarteObjekt(wert, 'endrunde');
  const ausloeser = obj['ausloeserSpielerIndex'];
  const verbleibende = erwarteArray(obj['verbleibendeSpielerIndizes'], 'endrunde.verbleibendeSpielerIndizes');

  if (ausloeser !== null) {
    if (!Number.isInteger(ausloeser) || (ausloeser as number) < 0 || (ausloeser as number) >= spielerAnzahl) {
      throw new Error('Ungültiger Spielzustand: endrunde.ausloeserSpielerIndex ist kein gültiger Spielerindex.');
    }
  }

  const indizenSet = new Set<number>();
  for (const idx of verbleibende) {
    if (!Number.isInteger(idx) || (idx as number) < 0 || (idx as number) >= spielerAnzahl) {
      throw new Error('Ungültiger Spielzustand: endrunde.verbleibendeSpielerIndizes enthält ungültigen Spielerindex.');
    }
    if (indizenSet.has(idx as number)) {
      throw new Error('Ungültiger Spielzustand: endrunde.verbleibendeSpielerIndizes enthält doppelten Index.');
    }
    indizenSet.add(idx as number);
  }

  if (spielphase === 'Normal') {
    if (ausloeser !== null || verbleibende.length !== 0) {
      throw new Error('Ungültiger Spielzustand: endrunde muss in Normal-Phase leer sein.');
    }
  } else if (spielphase === 'Endspurt') {
    if (ausloeser === null) {
      throw new Error('Ungültiger Spielzustand: endrunde.ausloeserSpielerIndex muss in Endspurt gesetzt sein.');
    }
    const erwarteteEndrunde = berechneEndrundenSpieler(ausloeser as number, spielerAnzahl);
    if (!istSuffix(erwarteteEndrunde, verbleibende)) {
      throw new Error('Ungültiger Spielzustand: endrunde.verbleibendeSpielerIndizes entspricht nicht der Zugreihenfolge.');
    }
    if (verbleibende.length === 0) {
      throw new Error('Ungültiger Spielzustand: endrunde darf im Endspurt nicht leer sein.');
    }
    if (verbleibende.length === erwarteteEndrunde.length) {
      const ersterEndrundenSpieler = verbleibende[0] as number;
      if (aktiverIndex !== ausloeser && aktiverIndex !== ersterEndrundenSpieler) {
        throw new Error('Ungültiger Spielzustand: aktiver Spieler passt nicht zur Endrunde.');
      }
    } else if (aktiverIndex !== verbleibende[0]) {
      throw new Error('Ungültiger Spielzustand: aktiver Spieler passt nicht zur Endrunde.');
    }
  } else if (spielphase === 'Beendet') {
    if (ausloeser === null || verbleibende.length !== 0) {
      throw new Error('Ungültiger Spielzustand: endrunde ist im Beendet-Zustand ungültig.');
    }
  }
}

function validiereZugpflichten(wert: unknown): void {
  const zugpflichten = erwarteObjekt(wert, 'zugpflichten');
  const gespielteKarten = zugpflichten['gespielteKarten'] as number;
  const verdopplerBonusAktiv = zugpflichten['verdopplerBonusAktiv'];
  if (!Number.isInteger(gespielteKarten) || gespielteKarten < 0 || gespielteKarten > MAX_KARTEN_PRO_ZUG + (verdopplerBonusAktiv === true ? 1 : 0)) {
    throw new Error('Ungültiger Spielzustand: gespielte Karten in Zugpflichten sind ungültig.');
  }
  const gespielteFarbkarten = zugpflichten['gespielteFarbkarten'] as number;
  const maxKartenProTyp = verdopplerBonusAktiv === true ? 2 : 1;
  if (!Number.isInteger(gespielteFarbkarten) || gespielteFarbkarten < 0 || gespielteFarbkarten > maxKartenProTyp) {
    throw new Error('Ungültiger Spielzustand: gespielte Farbkarten in Zugpflichten sind ungültig.');
  }
  const gespielteSonderkarten = zugpflichten['gespielteSonderkarten'] as number;
  if (!Number.isInteger(gespielteSonderkarten) || gespielteSonderkarten < 0 || gespielteSonderkarten > maxKartenProTyp) {
    throw new Error('Ungültiger Spielzustand: gespielte Sonderkarten in Zugpflichten sind ungültig.');
  }
  if (gespielteFarbkarten + gespielteSonderkarten !== gespielteKarten) {
    throw new Error('Ungültiger Spielzustand: gespielte Kartenarten passen nicht zur Anzahl gespielter Karten.');
  }
  const farbenfusionGespielt = zugpflichten['farbenfusionGespielt'];
  if (typeof farbenfusionGespielt !== 'boolean') {
    throw new Error('Ungültiger Spielzustand: zugpflichten.farbenfusionGespielt muss ein Boolean sein.');
  }
}

function validierePendingReaktion(wert: unknown, spieler: Spieler[], ablagestapelRaw: unknown): void {
  if (wert === null) return;
  const spielerAnzahl = spieler.length;
  const obj = erwarteObjekt(wert, 'pendingReaktion');
  const typ = obj['typ'];
  if (!REAKTIONS_TYPEN.has(typ as string)) {
    throw new Error('Ungültiger Spielzustand: pendingReaktion.typ ist ungültig.');
  }
  const angreifer = obj['angreifenderSpielerIndex'];
  if (!Number.isInteger(angreifer) || (angreifer as number) < 0 || (angreifer as number) >= spielerAnzahl) {
    throw new Error('Ungültiger Spielzustand: pendingReaktion.angreifenderSpielerIndex ist ungültig.');
  }
  if (typ === 'SchlangengrubeAbwehr' || typ === 'SchlangenblockadeAbwehr') {
    const ziel = obj['zielSpielerIndex'];
    if (!Number.isInteger(ziel) || (ziel as number) < 0 || (ziel as number) >= spielerAnzahl) {
      throw new Error('Ungültiger Spielzustand: pendingReaktion.zielSpielerIndex ist ungültig.');
    }
    if (typ === 'SchlangenblockadeAbwehr') {
      const zielSchlangenId = erwarteString(obj['zielSchlangenId'], 'pendingReaktion.zielSchlangenId');
      const blockadeKartenId = erwarteString(obj['blockadeKartenId'], 'pendingReaktion.blockadeKartenId');
      // Referenzprüfung: zielSchlangenId muss in spieler[ziel].schlangen existieren
      const zielSpieler = spieler[ziel as number];
      if (!zielSpieler.schlangen.some((s) => s.id === zielSchlangenId)) {
        throw new Error('Ungültiger Spielzustand: pendingReaktion.zielSchlangenId existiert nicht in den Schlangen des Zielspielers.');
      }
      // Referenzprüfung: blockadeKartenId muss im Ablagestapel liegen
      if (!Array.isArray(ablagestapelRaw) || !ablagestapelRaw.some((k) => istObjekt(k) && k['id'] === blockadeKartenId)) {
        throw new Error('Ungültiger Spielzustand: pendingReaktion.blockadeKartenId existiert nicht im Ablagestapel.');
      }
    }
    return;
  }

  if (typ === 'FarbendiebAbwehr') {
    const ziel = obj['zielSpielerIndex'];
    if (!Number.isInteger(ziel) || (ziel as number) < 0 || (ziel as number) >= spielerAnzahl) {
      throw new Error('Ungültiger Spielzustand: pendingReaktion.zielSpielerIndex ist ungültig.');
    }
    const zielSchlangenId = erwarteString(obj['zielSchlangenId'], 'pendingReaktion.zielSchlangenId');
    const zielKartenId = erwarteString(obj['zielKartenId'], 'pendingReaktion.zielKartenId');
    const eigeneSchlangenId = erwarteString(obj['eigeneSchlangenId'], 'pendingReaktion.eigeneSchlangenId');
    const einfügeIndex = obj['einfügeIndex'];
    if (!Number.isInteger(einfügeIndex) || (einfügeIndex as number) < 0) {
      throw new Error('Ungültiger Spielzustand: pendingReaktion.einfügeIndex ist ungültig.');
    }
    // Referenzprüfung: zielSchlangenId muss in spieler[ziel].schlangen mit zielKartenId existieren
    const zielSpieler = spieler[ziel as number];
    const zielSchlange = zielSpieler.schlangen.find((s) => s.id === zielSchlangenId);
    if (!zielSchlange) {
      throw new Error('Ungültiger Spielzustand: pendingReaktion.zielSchlangenId existiert nicht in den Schlangen des Zielspielers.');
    }
    if (!zielSchlange.karten.some((k) => k.id === zielKartenId)) {
      throw new Error('Ungültiger Spielzustand: pendingReaktion.zielKartenId existiert nicht in der Zielschlange.');
    }
    // Referenzprüfung: eigeneSchlangenId beim Angreifer
    const angreiferSpieler = spieler[angreifer as number];
    const eigenSchlange = angreiferSpieler.schlangen.find((s) => s.id === eigeneSchlangenId);
    if (!eigenSchlange) {
      throw new Error('Ungültiger Spielzustand: pendingReaktion.eigeneSchlangenId existiert nicht in den Schlangen des Angreifers.');
    }
    if ((einfügeIndex as number) > eigenSchlange.karten.length) {
      throw new Error('Ungültiger Spielzustand: pendingReaktion.einfügeIndex liegt außerhalb der eigenen Schlange.');
    }
    return;
  }

  if (typ === 'SchlangenfrassAbwehr') {
    const verbleibendeZiele = erwarteArray(obj['verbleibendeZiele'], 'pendingReaktion.verbleibendeZiele');
    if (verbleibendeZiele.length < 1) {
      throw new Error('Ungültiger Spielzustand: pendingReaktion.verbleibendeZiele darf nicht leer sein.');
    }
    for (const ziel of verbleibendeZiele as unknown[]) {
      const zielObjekt = erwarteObjekt(ziel, 'pendingReaktion.verbleibendeZiele[]');
      const spielerIndex = zielObjekt['spielerIndex'];
      if (!Number.isInteger(spielerIndex) || (spielerIndex as number) < 0 || (spielerIndex as number) >= spielerAnzahl) {
        throw new Error('Ungültiger Spielzustand: pendingReaktion.verbleibendeZiele[].spielerIndex ist ungültig.');
      }
      const schlangenId = erwarteString(zielObjekt['schlangenId'], 'pendingReaktion.verbleibendeZiele[].schlangenId');
      const kartenId = erwarteString(zielObjekt['kartenId'], 'pendingReaktion.verbleibendeZiele[].kartenId');
      // Referenzprüfung: schlangenId und kartenId müssen im Zustand existieren
      const zielSpieler = spieler[spielerIndex as number];
      const zielSchlange = zielSpieler.schlangen.find((s) => s.id === schlangenId);
      if (!zielSchlange) {
        throw new Error('Ungültiger Spielzustand: pendingReaktion.verbleibendeZiele[].schlangenId existiert nicht.');
      }
      if (!zielSchlange.karten.some((k) => k.id === kartenId)) {
        throw new Error('Ungültiger Spielzustand: pendingReaktion.verbleibendeZiele[].kartenId existiert nicht in der Zielschlange.');
      }
    }
    return;
  }

  const verbleibendeSpielerIndizes = erwarteArray(obj['verbleibendeSpielerIndizes'], 'pendingReaktion.verbleibendeSpielerIndizes');
  if (verbleibendeSpielerIndizes.length === 0) {
    throw new Error('Ungültiger Spielzustand: pendingReaktion.verbleibendeSpielerIndizes darf nicht leer sein.');
  }
  for (const idx of verbleibendeSpielerIndizes as number[]) {
    if (!Number.isInteger(idx) || idx < 0 || idx >= spielerAnzahl) {
      throw new Error('Ungültiger Spielzustand: pendingReaktion.verbleibendeSpielerIndizes enthält ungültige Spielerindizes.');
    }
  }
}

function validiereAussetzen(wert: unknown, spielerAnzahl: number): void {
  const aussetzenSpielerIndizes = erwarteArray(wert, 'aussetzenSpielerIndizes');
  for (const idx of aussetzenSpielerIndizes as number[]) {
    if (!Number.isInteger(idx) || idx < 0 || idx >= spielerAnzahl) {
      throw new Error('Ungültiger Spielzustand: aussetzenSpielerIndizes enthält ungültigen Spielerindex.');
    }
  }
}

/*
ÄNDERUNG [03.08.2026]: R2.3a, angeregt vom Codex-Review.

Ohne diesen Schritt verlöre ein Spielstand, der **mitten in einer
Reaktionskette** gespeichert wurde, den Nachzug des Angreifers: Seine Karte war
längst gespielt, aber die Liste gab es damals noch nicht. Beim Auflösen würde nur
noch ein abwehrender Verteidiger vermerkt — der Angreifer ginge leer aus.

Aus `pendingReaktion.angreifenderSpielerIndex` lässt sich genau rekonstruieren,
wer die Angriffskarte gespielt hat. Nicht rekonstruierbar ist, ob ein
Verteidiger in derselben Kette schon abgewehrt hat; solche Ketten sind aber
höchstens einen Zug alt, und der Fall ist eng.
*/
function migriereNachziehBerechtigteVorR2_3a(parsed: unknown): void {
  if (typeof parsed !== 'object' || parsed === null) return;
  const obj = parsed as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(obj, 'nachziehBerechtigteIndizes')) return;

  /* Nur setzen, wenn es etwas zu retten gibt. Ohne ausstehende Reaktion bedeuten
     „Feld fehlt" und „leere Liste" dasselbe; das Feld trotzdem zu schreiben würde
     jeden Roundtrip verändern, ohne irgendeine Aussage zu gewinnen. */
  const pending = obj['pendingReaktion'] as { angreifenderSpielerIndex?: unknown } | null | undefined;
  if (!pending) return;

  const angreifer = pending.angreifenderSpielerIndex;
  if (Number.isInteger(angreifer)) {
    obj['nachziehBerechtigteIndizes'] = [angreifer];
  }
}

/*
ÄNDERUNG [03.08.2026]: R2.3a. `nachziehBerechtigteIndizes` ist optional — ältere
Spielstände kennen es nicht und laden deshalb **ohne** Migrationsschritt weiter.
Geprüft wird es trotzdem: Ein kaputter Eintrag würde später einen Spieler über
einen Unsinns-Index adressieren, und das fiele erst beim Nachziehen auf.
*/
function validiereNachziehBerechtigte(wert: unknown, spielerAnzahl: number, pendingReaktion: unknown): void {
  if (wert === undefined) return;
  const indizes = erwarteArray(wert, 'nachziehBerechtigteIndizes');
  for (const idx of indizes as number[]) {
    if (!Number.isInteger(idx) || idx < 0 || idx >= spielerAnzahl) {
      throw new Error('Ungültiger Spielzustand: nachziehBerechtigteIndizes enthält ungültigen Spielerindex.');
    }
  }
  /* ÄNDERUNG [03.08.2026]: Codex-Review. Eine gefüllte Liste **ohne** ausstehende
     Reaktion kann die Engine nicht erzeugen — `anwendeAktion` zieht am Ende jeder
     Aktion nach und leert sie dabei. Ein solcher Stand ist also entweder
     manipuliert oder aus einer kaputten Fassung; würde er geladen, zöge beim
     nächsten Sonderkartenzug ein Spieler eine Karte zu viel. */
  if (indizes.length > 0 && (pendingReaktion === null || pendingReaktion === undefined)) {
    throw new Error('Ungültiger Spielzustand: nachziehBerechtigteIndizes ohne ausstehende Reaktion.');
  }
}

function validiereSpielsteuerung(wert: unknown): void {
  if (!STEUERUNGEN.has(wert as Steuerung)) {
    throw new Error(
      `Ungültiger Spielzustand: spieler.steuerung fehlt oder ist ungültig (erlaubt: 'Mensch' oder 'KI').`,
    );
  }
}

function validiereSpielsteuerungsVerteilung(spieler: Spieler[]): void {
  const menschen = spieler.filter((einSpieler) => einSpieler.steuerung === 'Mensch');
  if (menschen.length !== 1) {
    throw new Error('Ungültiger Spielzustand: Es muss genau ein menschlicher Spieler vorhanden sein.');
  }
}

function validiereSpieler(wert: unknown, verwendeteIds: Set<string>): asserts wert is Spieler {
  const spieler = erwarteObjekt(wert, 'spieler-Eintrag');
  registriereId(erwarteString(spieler['id'], 'spieler.id'), verwendeteIds);
  erwarteString(spieler['name'], 'spieler.name');
  validiereSpielsteuerung(spieler['steuerung']);
  validiereSpielkartenArray(spieler['hand'], 'spieler.hand', verwendeteIds);
  validiereSonderkartenHistorie(spieler['ausgespielteSonderkartenNamen']);
  validiereSchlangentanzHistorie(spieler['schlangenhaeutungDreiergruppen']);
  validiereAufgabenArray(spieler['erfuellteAufgaben'], 'spieler.erfuellteAufgaben', verwendeteIds);

  // ÄNDERUNG [29.06.2026]: R181 — geheimeAufgabe ist non-nullable, daher kein Null-Check mehr nötig.
  if (spieler['geheimeAufgabe'] === null || spieler['geheimeAufgabe'] === undefined) {
    throw new Error('Ungültiger Spielzustand: spieler.geheimeAufgabe fehlt.');
  }
  validiereAufgabenkarte(spieler['geheimeAufgabe'], 'spieler.geheimeAufgabe', verwendeteIds);

  // ÄNDERUNG [05.07.2026]: K4 — Flag ist optional; wenn vorhanden, muss es ein Boolean sein.
  const geheimeAufgabeErfuellt = spieler['geheimeAufgabeErfuellt'];
  if (geheimeAufgabeErfuellt !== undefined && typeof geheimeAufgabeErfuellt !== 'boolean') {
    throw new Error('Ungültiger Spielzustand: spieler.geheimeAufgabeErfuellt muss ein Boolean sein.');
  }

  // ÄNDERUNG [05.07.2026]: K5 — endspurtVerdoppelteAufgabenIds ist optional; wenn vorhanden,
  // ein String-Array, dessen Ids zu erfüllten Aufgaben des Spielers gehören müssen.
  const endspurtIds = spieler['endspurtVerdoppelteAufgabenIds'];
  if (endspurtIds !== undefined) {
    const idListe = erwarteArray(endspurtIds, 'spieler.endspurtVerdoppelteAufgabenIds');
    const erfuellteIds = new Set(
      erwarteArray(spieler['erfuellteAufgaben'], 'spieler.erfuellteAufgaben').map((a) =>
        istObjekt(a) ? a['id'] : undefined,
      ),
    );
    for (const id of idListe) {
      if (typeof id !== 'string' || id.trim() === '') {
        throw new Error('Ungültiger Spielzustand: spieler.endspurtVerdoppelteAufgabenIds enthält ungültige Id.');
      }
      if (!erfuellteIds.has(id)) {
        throw new Error('Ungültiger Spielzustand: endspurtVerdoppelteAufgabenIds verweist auf nicht erfüllte Aufgabe.');
      }
    }
  }

  const schlangen = erwarteArray(spieler['schlangen'], 'spieler.schlangen');
  for (const schlangeWert of schlangen) {
    const schlange = erwarteObjekt(schlangeWert, 'schlange');
    registriereId(erwarteString(schlange['id'], 'schlange.id'), verwendeteIds);
    if (!SCHLANGEN_ZUSTAENDE.has(schlange['zustand'] as SchlangenZustand)) {
      throw new Error('Ungültiger Spielzustand: Schlangenzustand ist ungültig.');
    }
    validiereSpielkartenArray(schlange['karten'], 'schlange.karten', verwendeteIds);
    validiereFarbenfusionen(schlange);
  }
}

function validiereSonderkartenHistorie(wert: unknown): void {
  for (const eintrag of erwarteArray(wert, 'Sonderkartenhistorie')) {
    if (typeof eintrag !== 'string' || eintrag.trim() === '') {
      throw new Error('Ungültiger Spielzustand: Sonderkartenhistorie darf nur nicht-leere Textwerte enthalten.');
    }
    if (!BEKANNTE_SONDERKARTENNAMEN.has(eintrag)) {
      throw new Error('Ungültiger Spielzustand: Sonderkartenhistorie enthält unbekannten Sonderkartennamen.');
    }
  }
}

function validiereSchlangentanzHistorie(wert: unknown): void {
  if (!Number.isInteger(wert) || (wert as number) < 0) {
    throw new Error(
      'Ungültiger Spielzustand: spieler.schlangenhaeutungDreiergruppen muss eine nicht-negative ganze Zahl sein.',
    );
  }
}

function validiereFarbenfusionen(schlange: Record<string, unknown>): void {
  const karten = erwarteArray(schlange['karten'], 'schlange.karten') as Record<string, unknown>[];
  const farbenfusionsIds = new Set<string>(
    karten
      .filter((k) => k['typ'] === 'Sonderkarte' && k['name'] === 'Farbenfusion')
      .map((k) => k['id'] as string),
  );

  const farbenfusionen = schlange['farbenfusionen'];
  if (farbenfusionen === undefined || farbenfusionen === null) {
    if (farbenfusionsIds.size > 0) {
      throw new Error('Ungültiger Spielzustand: Farbenfusion-Karte in schlange.karten ohne farbenfusionen-Eintrag.');
    }
    return;
  }

  const eintraege = erwarteArray(farbenfusionen, 'schlange.farbenfusionen');
  const geseheneIds = new Set<string>();

  for (const eintrag of eintraege) {
    const e = erwarteObjekt(eintrag, 'schlange.farbenfusionen[]');
    const kartenId = erwarteString(e['kartenId'], 'schlange.farbenfusionen[].kartenId');
    if (!farbenfusionsIds.has(kartenId)) {
      throw new Error('Ungültiger Spielzustand: farbenfusionen-Eintrag ohne zugehörige Farbenfusion-Karte in schlange.karten.');
    }
    if (geseheneIds.has(kartenId)) {
      throw new Error('Ungültiger Spielzustand: Doppelte kartenId in schlange.farbenfusionen.');
    }
    geseheneIds.add(kartenId);
    const punkte = e['punkte'];
    if (!Number.isInteger(punkte) || (punkte as number) <= 0) {
      throw new Error('Ungültiger Spielzustand: farbenfusionen[].punkte muss eine positive ganze Zahl sein.');
    }
  }

  for (const kartenId of farbenfusionsIds) {
    if (!geseheneIds.has(kartenId)) {
      throw new Error('Ungültiger Spielzustand: Farbenfusion-Karte in schlange.karten ohne farbenfusionen-Eintrag.');
    }
  }
}

function validiereSpielkartenArray(
  wert: unknown,
  feldname: string,
  verwendeteIds: Set<string>,
): asserts wert is Spielkarte[] {
  for (const karte of erwarteArray(wert, feldname)) {
    validiereSpielkarte(karte, feldname, verwendeteIds);
  }
}

function validiereAufgabenArray(
  wert: unknown,
  feldname: string,
  verwendeteIds: Set<string>,
): asserts wert is AufgabenkarteInfo[] {
  for (const aufgabe of erwarteArray(wert, feldname)) {
    validiereAufgabenkarte(aufgabe, feldname, verwendeteIds);
  }
}

function validiereSpielkarte(
  wert: unknown,
  feldname: string,
  verwendeteIds: Set<string>,
): asserts wert is Spielkarte {
  const karte = erwarteObjekt(wert, feldname);

  if (karte['typ'] === 'Farbkarte') {
    if (!FARBEN.has(karte['farbe'] as Farbe) || typeof karte['punkte'] !== 'number') {
      throw new Error(`Ungültiger Spielzustand: ${feldname} enthält ungültige Farbkarte.`);
    }
  } else if (karte['typ'] === 'Sonderkarte') {
    erwarteString(karte['name'], `${feldname}.name`);
  } else if (karte['typ'] === 'Aufgabenkarte') {
    throw new Error(`Ungültiger Spielzustand: ${feldname} enthält Aufgabenkarte statt Spielkarte.`);
  } else {
    throw new Error(`Ungültiger Spielzustand: ${feldname} enthält ungültige Spielkarte.`);
  }

  registriereId(erwarteString(karte['id'], `${feldname}.id`), verwendeteIds);
}

function validiereAufgabenkarte(
  wert: unknown,
  feldname: string,
  verwendeteIds: Set<string>,
): asserts wert is AufgabenkarteInfo {
  const aufgabe = erwarteObjekt(wert, feldname);
  if (aufgabe['typ'] !== 'Aufgabenkarte') {
    throw new Error(`Ungültiger Spielzustand: ${feldname} enthält keine Aufgabenkarte.`);
  }
  registriereId(erwarteString(aufgabe['id'], `${feldname}.id`), verwendeteIds);
  erwarteString(aufgabe['name'], `${feldname}.name`);
  erwarteString(aufgabe['bedingung'], `${feldname}.bedingung`);
  if (typeof aufgabe['punkte'] !== 'number' || aufgabe['punkte'] <= 0) {
    throw new Error(`Ungültiger Spielzustand: ${feldname}.punkte ist ungültig.`);
  }
}

function validiereKanonischesSet<T extends { id: string }>(
  erstellen: () => T[],
  sammeln: (z: Spielzustand) => T[],
  bezeichnung: string,
  zustand: Spielzustand,
): void {
  const erwartet = new Map(erstellen().map((x) => [x.id, serialisiereMaterial(x)]));
  const vorhanden = sammeln(zustand);
  if (vorhanden.length !== erwartet.size) {
    throw new Error(`Ungültiger Spielzustand: ${bezeichnung}material ist nicht vollständig.`);
  }
  for (const item of vorhanden) {
    if (erwartet.get(item.id) !== serialisiereMaterial(item)) {
      throw new Error(`Ungültiger Spielzustand: ${bezeichnung}material enthält nicht-kanonischen Eintrag.`);
    }
  }
}

function validiereKanonischesMaterial(zustand: Spielzustand): void {
  validiereKanonischesSet(erstelleSpieldeck, sammleSpielkarten, 'Karten', zustand);
  validiereKanonischesSet(erstelleAufgabenStapel, sammleAufgaben, 'Aufgaben', zustand);
}

function sammleSpielkarten(zustand: Spielzustand): Spielkarte[] {
  return [
    ...zustand.spieler.flatMap((spieler) => [
      ...spieler.hand,
      ...spieler.schlangen.flatMap((schlange) => schlange.karten),
    ]),
    ...zustand.nachziehstapel,
    ...zustand.ablagestapel,
  ];
}

function sammleAufgaben(zustand: Spielzustand): AufgabenkarteInfo[] {
  return [
    ...zustand.spieler.flatMap((spieler) => [
      spieler.geheimeAufgabe,
      ...spieler.erfuellteAufgaben,
    ]),
    ...zustand.offeneAufgaben,
    ...zustand.aufgabenStapel,
  ];
}

function serialisiereMaterial(wert: unknown): string {
  return JSON.stringify(sortiereStabil(wert));
}

function registriereId(id: string, verwendeteIds: Set<string>): void {
  if (verwendeteIds.has(id)) {
    throw new Error(`Ungültiger Spielzustand: Doppelte ID ${id}.`);
  }
  verwendeteIds.add(id);
}

function erwarteObjekt(wert: unknown, feldname: string): Record<string, unknown> {
  if (!istObjekt(wert)) {
    throw new Error(`Ungültiger Spielzustand: ${feldname} ist kein gültiges Objekt.`);
  }
  return wert;
}

function erwarteArray(wert: unknown, feldname: string): unknown[] {
  if (!Array.isArray(wert)) {
    throw new Error(`Ungültiger Spielzustand: ${feldname} fehlt oder ist kein Array.`);
  }
  return wert;
}

function erwarteString(wert: unknown, feldname: string): string {
  if (typeof wert !== 'string' || wert.length === 0) {
    throw new Error(`Ungültiger Spielzustand: ${feldname} fehlt oder ist ungültig.`);
  }
  return wert;
}

function istObjekt(wert: unknown): wert is Record<string, unknown> {
  return wert !== null && typeof wert === 'object' && !Array.isArray(wert);
}
