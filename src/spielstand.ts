/*
Author: Claude Code
Datum: 03.08.2026
Version: 1.0
Beschreibung: Die laufende Partie überlebt einen Reload.

`src/engine/serialization.ts` war seit Monaten fertig — 717 Zeilen, sieben
Migrationsschritte, zwei eigene Testdateien, und der Soak-Test prüft den
Roundtrip nach *jedem* Zug über 20 Partien. Nur gerufen hat sie niemand: Ein
Reload verwarf die Partie, und der Fehlerfang musste dem Spieler sagen, sie sei
verloren.

**Warum hier und nicht in `engine/`.** Speichern ist keine Spielregel. Die Engine
ist rein funktional und kennt keine Browser-API; das soll so bleiben, denn genau
daran hängt, dass sie im Test ohne jsdom läuft. (Anders als `ueberhand.ts`, das
in die Engine gehörte — dort rechnete `turnState.ts` die Regel selbst nach.)

**Warum jeder Zugriff abgesichert ist.** `localStorage` wirft in mehr Fällen als
man denkt: im Privatmodus älterer Browser, bei vollem Kontingent, bei blockierten
Drittanbieter-Speichern. Ein Spiel, das daran stirbt, wäre genau der Fehler, den
der Slice vom selben Tag behoben hat.
*/

import { deserialisiere, serialisiere } from './engine'
import type { Spielzustand } from './engine'

/**
 * Der Schlüssel im `localStorage`.
 *
 * Exportiert, weil Tests am **rohen** Eintrag prüfen müssen: `ladeSpielstand`
 * heilt sich selbst — es löscht, was es nicht lesen kann. Wer über diese
 * Funktion prüft, ob ein Eintrag verworfen wurde, bekommt immer ein Ja und misst
 * dabei nichts.
 */
export const SPIELSTAND_SCHLUESSEL = 'schlangentanz-v2:partie'
const SCHLUESSEL = SPIELSTAND_SCHLUESSEL

/** `null`, wenn es keinen Speicher gibt — SSR, Privatmodus, blockiert. */
function speicher(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

/**
 * Die gespeicherte Partie — oder `null`, wenn es keine brauchbare gibt.
 *
 * **Jeder** Fehler führt zu `null` *und* zum Löschen des Eintrags: kein JSON,
 * ungültige Struktur, ein Format aus einer Version, die keine Migration mehr
 * kennt. Der Spieler hat einen kaputten Stand weder verursacht noch kann er ihn
 * beheben — ihm eine Fehlermeldung zu zeigen, hilft ihm nicht, und ihn stehen zu
 * lassen sperrt ihn beim nächsten Reload erneut aus.
 */
export function ladeSpielstand(): Spielzustand | null {
  const s = speicher()
  if (s === null) return null

  let roh: string | null
  try {
    roh = s.getItem(SCHLUESSEL)
  } catch {
    return null
  }
  if (roh === null) return null

  try {
    return deserialisiere(roh)
  } catch {
    verwirfSpielstand()
    return null
  }
}

/** Schreibt die Partie weg. Schlägt das fehl, wird weitergespielt. */
export function speichereSpielstand(zustand: Spielzustand): void {
  const s = speicher()
  if (s === null) return
  try {
    s.setItem(SCHLUESSEL, serialisiere(zustand))
  } catch {
    /* Kontingent voll oder Speicher gesperrt. Kein Grund, die laufende Partie
       abzubrechen — sie ist im Arbeitsspeicher vollständig. */
  }
}

/** Löscht die gespeicherte Partie. */
export function verwirfSpielstand(): void {
  const s = speicher()
  if (s === null) return
  try {
    s.removeItem(SCHLUESSEL)
  } catch {
    /* Nichts zu tun — ein nicht löschbarer Speicher ist auch kein lesbarer. */
  }
}
