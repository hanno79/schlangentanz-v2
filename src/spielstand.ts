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

/**
 * Führt etwas mit dem Speicher aus — oder liefert den Ersatzwert.
 *
 * ÄNDERUNG [03.08.2026]: Die erste Fassung hatte eine `speicher()`-Hilfe mit
 * eigenem `try/catch` **und** je ein weiteres in jedem Aufrufer. Drei Netze für
 * denselben Sturz. Hier ist es eines: Kein `window`, kein Zugriff, ein Wurf beim
 * Lesen oder Schreiben — alles endet im Ersatzwert.
 */
export function mitSpeicher<T>(tun: (speicher: Storage) => T, ersatz: T): T {
  if (typeof window === 'undefined') return ersatz
  try {
    return tun(window.localStorage)
  } catch {
    return ersatz
  }
}

/**
 * Das Speicherformat, das die Engine heute schreibt. Der Typ bindet die Zahl an
 * `Spielzustand['version']`: Hebt E1 das Format an, meldet der Typecheck diese
 * Stelle.
 */
const SPEICHERFORMAT: Spielzustand['version'] = 1

/**
 * Was im Speicher liegt.
 *
 * - `aelteres-format`: ein Stand aus einer früheren Fassung, die keine Migration
 *   mehr kennt. Erwartet nach jedem Formatwechsel (Plan 2.3: alte Spielstände
 *   werden verworfen), kein Defekt.
 * - `beschaedigt`: alles andere, das sich nicht lesen lässt (kein JSON, ungültige
 *   Struktur, unbekanntes neueres Format). Das sollte nie vorkommen.
 */
export type GespeicherteLage =
  | { art: 'keiner' }
  | { art: 'geladen'; zustand: Spielzustand }
  | { art: 'unlesbar'; grund: 'aelteres-format' | 'beschaedigt'; fehler: Error }

/**
 * Liest den Spielstand, ohne etwas zu ändern, und sagt bei einem unlesbaren
 * Eintrag, warum. Verwerfen und melden ist Sache des Aufrufers: Der Spieler soll
 * erfahren, dass seine Partie weg ist, statt dass sie still verschwindet.
 */
export function pruefeSpielstand(): GespeicherteLage {
  const roh = mitSpeicher((s) => s.getItem(SPIELSTAND_SCHLUESSEL), null)
  if (roh === null) return { art: 'keiner' }

  try {
    return { art: 'geladen', zustand: deserialisiere(roh) }
  } catch (fehler) {
    return {
      art: 'unlesbar',
      grund: istAelteresFormat(roh) ? 'aelteres-format' : 'beschaedigt',
      fehler: fehler instanceof Error ? fehler : new Error(String(fehler)),
    }
  }
}

/** Ein JSON-Objekt mit einer Versionsnummer unter der heutigen. */
function istAelteresFormat(roh: string): boolean {
  let wert: unknown
  try {
    wert = JSON.parse(roh)
  } catch {
    return false
  }
  if (typeof wert !== 'object' || wert === null) return false
  const version = (wert as { version?: unknown }).version
  return typeof version === 'number' && version < SPEICHERFORMAT
}

/**
 * Die gespeicherte Partie — oder `null`, wenn es keine brauchbare gibt. Ein
 * unlesbarer Eintrag wird dabei gelöscht, ohne den Grund zu nennen; wer dem
 * Spieler etwas zeigen muss, nimmt `pruefeSpielstand`.
 */
export function ladeSpielstand(): Spielzustand | null {
  const lage = pruefeSpielstand()
  if (lage.art === 'unlesbar') verwirfSpielstand()
  return lage.art === 'geladen' ? lage.zustand : null
}

/**
 * Schreibt die Partie weg. Schlägt das fehl — Kontingent voll, Speicher
 * gesperrt —, wird weitergespielt: Die Partie ist im Arbeitsspeicher
 * vollständig.
 */
export function speichereSpielstand(zustand: Spielzustand): void {
  mitSpeicher((s) => s.setItem(SPIELSTAND_SCHLUESSEL, serialisiere(zustand)), undefined)
}

/** Löscht die gespeicherte Partie. */
export function verwirfSpielstand(): void {
  mitSpeicher((s) => s.removeItem(SPIELSTAND_SCHLUESSEL), undefined)
}
