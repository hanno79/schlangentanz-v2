/*
Author: Claude Code (S-1)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Beschriftungen der Phasen-Aktionen und ihre Bedienorte.

Hintergrund (Fixplan G1): Dieselbe Phasen-Aktion wird an mehreren Stellen
angeboten — am Brettrand, in der Handleiste, im Zugkompass und in der
Aktionsliste. Das ist gewollt („boardnah spielbar"), die Beschriftungen lagen
aber als freie Zeichenketten in fünf Dateien. Dadurch trugen bis zu zwei
gleichzeitig sichtbare Knöpfe denselben Accessible Name:

  /game  Zugabschluss    „Zug an nächsten Spieler geben"   2×
  /      Zugabschluss    „Zug an nächsten Spieler geben"   2×
  /      Überhand        „Überzählige Karten abwerfen"     2×
  /      Nachziehphase   „Ausspielphase starten"           2×

Für Screenreader-Nutzer sind solche Knöpfe nicht unterscheidbar; Playwright
bricht aus demselben Grund mit `strict mode violation` ab.

**Regel.** Genau ein Knopf je Aktion trägt den kanonischen Namen — der, den die
Spielerführung als Sprungziel anbietet. Jeder weitere Bedienort hängt seinen
Ort an. `src/App.phasenaktion_namen.test.tsx` prüft das über alle Routen und
Zugphasen hinweg.
*/

/** Kanonische Beschriftungen der Phasen-Aktionen. */
export const PHASENAKTION = {
  ausspielphaseStarten: 'Ausspielphase starten',
  weiterZurAufgabenpruefung: 'Weiter zur Aufgabenprüfung',
  weiterZumZugabschluss: 'Weiter zum Zugabschluss',
  ueberzaehligeAbwerfen: 'Überzählige Karten abwerfen',
  zugBeenden: 'Zug an nächsten Spieler geben',
} as const

/** Alle kanonischen Beschriftungen — für Tests und Guards. */
export const PHASENAKTION_TEXTE: readonly string[] = Object.values(PHASENAKTION)

/**
 * Bedienorte, an denen Phasen-Aktionen angeboten werden.
 *
 * `brettrand` und `aktionsliste` sind die kanonischen Orte: Sie tragen den
 * Namen ohne Zusatz und kommen nie gleichzeitig mit derselben Aktion vor
 * (der Brettrand-Knopf rendert nur auf `/game`, die Aktionsliste dort nur,
 * wenn der Brettrand-Knopf die Aktion nicht zeigt).
 */
export type Bedienort = 'brettrand' | 'aktionsliste' | 'zugkompass' | 'handleiste'

const ORT_ZUSATZ: Record<Bedienort, string> = {
  brettrand: '',
  aktionsliste: '',
  zugkompass: ' — Zugkompass',
  handleiste: ' — Handleiste',
}

/**
 * Accessible Name für einen Phasen-Aktions-Knopf am gegebenen Bedienort.
 *
 * Der Zusatz landet bewusst nur im Accessible Name, nicht im sichtbaren Text:
 * Der Ort ist visuell ohnehin klar, akustisch aber nicht.
 */
export function phasenAktionName(text: string, ort: Bedienort): string {
  return `${text}${ORT_ZUSATZ[ort]}`
}
