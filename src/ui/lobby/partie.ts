import { KI_GEGNER_MAX, KI_GEGNER_MIN, erstelleEinzelspielerSpielzustand } from '../../engine'
import { ladeSpielstand, mitSpeicher, speichereSpielstand, verwirfSpielstand } from '../../spielstand'

/*
Partie anlegen, finden und verwerfen, für Lobby, Spieltisch und Fehlerfang.

Die Partie entsteht über die Engine-Schnittstelle (U3) und landet über
`src/spielstand.ts` im Speicher des Browsers. Die Zahl der Gegner steht danach
im Spielstand selbst und wird von dort gelesen, nicht noch einmal gemerkt.
*/

/** Die Gegnerzahlen, die die Engine zulässt (heute 1 bis 3). */
export const GEGNER_AUSWAHL: readonly number[] = Array.from(
  { length: KI_GEGNER_MAX - KI_GEGNER_MIN + 1 },
  (_, index) => KI_GEGNER_MIN + index,
)

export interface Einstellungen {
  gegner: number
  erweiterung: boolean
}

export interface LaufendePartie {
  gegner: number
  /** `null`, wenn zu diesem Spielstand kein Schalter gemerkt ist. */
  erweiterung: boolean | null
}

/*
FALLBACK: Die Engine im Speicherformat 1 hat keinen Erweiterungs-Schalter
(`erstelleEinzelspielerSpielzustand` nimmt nur die Gegnerzahl). Bis E1 ihn in
den Zustand bringt (Plan E1, Kriterium 5), merkt sich die Oberfläche die Wahl
unter einem eigenen Schlüssel neben dem Spielstand, sagt auf dem Spieltisch,
dass die Partie ohne ihn angelegt wurde, und schreibt bei jedem Start eine
Warnung. Angelegt und verworfen wird der Schlüssel nur zusammen mit dem
Spielstand (`starteNeuePartie`, `verwirfPartie`). Mit E1 entfällt er.

Scheitert der Speicher (Privatmodus, voll, gesperrt), fängt `mitSpeicher` das
ab wie beim Spielstand; der Spieltisch zeigt die Erweiterung dann als
„unbekannt“.
*/
const ERWEITERUNG_SCHLUESSEL = 'schlangentanz-v2:erweiterung'

function gemerkteErweiterung(): boolean | null {
  const wert = mitSpeicher((s) => s.getItem(ERWEITERUNG_SCHLUESSEL), null)
  if (wert === '1') return true
  if (wert === '0') return false
  return null
}

/**
 * Legt eine neue Partie an und speichert sie; ein vorhandener Spielstand wird
 * überschrieben. Wirft die Engine, ist nichts gespeichert und der Fehler geht
 * an den Aufrufer.
 */
export function starteNeuePartie({ gegner, erweiterung }: Einstellungen): void {
  const zustand = erstelleEinzelspielerSpielzustand(gegner)
  console.warn('Die Engine kennt den Erweiterungs-Schalter noch nicht (kommt mit E1); die Partie ist ohne ihn angelegt.')
  speichereSpielstand(zustand)
  mitSpeicher((s) => s.setItem(ERWEITERUNG_SCHLUESSEL, erweiterung ? '1' : '0'), undefined)
}

/** Die gespeicherte Partie in Kurzform, oder `null`, wenn es keine brauchbare gibt. */
export function findeLaufendePartie(): LaufendePartie | null {
  const zustand = ladeSpielstand()
  if (zustand === null) return null
  return {
    gegner: zustand.spieler.filter((spieler) => spieler.steuerung === 'KI').length,
    erweiterung: gemerkteErweiterung(),
  }
}

/** Verwirft die gespeicherte Partie samt gemerktem Schalter. */
export function verwirfPartie(): void {
  verwirfSpielstand()
  mitSpeicher((s) => s.removeItem(ERWEITERUNG_SCHLUESSEL), undefined)
}
