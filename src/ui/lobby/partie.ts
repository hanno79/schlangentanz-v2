import { useEffect, useState } from 'react'
import { KI_GEGNER_MAX, KI_GEGNER_MIN, erstelleEinzelspielerSpielzustand } from '../../engine'
import { meldeFehler } from '../../fehlerdienst'
import { mitSpeicher, pruefeSpielstand, speichereSpielstand, verwirfSpielstand } from '../../spielstand'

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

/** Verwirft die gespeicherte Partie samt gemerktem Schalter. */
export function verwirfPartie(): void {
  verwirfSpielstand()
  mitSpeicher((s) => s.removeItem(ERWEITERUNG_SCHLUESSEL), undefined)
}

export type Verwurfsgrund = 'aelteres-format' | 'beschaedigt'

export type PartieLage =
  | { art: 'keine' }
  | { art: 'laufend'; partie: LaufendePartie }
  | { art: 'verworfen'; grund: Verwurfsgrund; fehler: Error }

/** Was im Speicher liegt, in Kurzform. Liest nur und ändert nichts. */
function leseGespeichertePartie(): PartieLage {
  const lage = pruefeSpielstand()
  switch (lage.art) {
    case 'keiner':
      return { art: 'keine' }
    case 'geladen':
      return {
        art: 'laufend',
        partie: {
          gegner: lage.zustand.spieler.filter((spieler) => spieler.steuerung === 'KI').length,
          erweiterung: gemerkteErweiterung(),
        },
      }
    case 'unlesbar':
      return { art: 'verworfen', grund: lage.grund, fehler: lage.fehler }
  }
}

/* Jede Lage wird genau einmal aufgeräumt und gemeldet, auch wenn der StrictMode
   den Effekt zweimal ausführt. */
const aufgeraeumt = new WeakSet<PartieLage>()

/*
Ein unlesbarer Stand wird verworfen (samt gemerktem Schalter) und gemeldet.

Die Abgrenzung beim Melden: Ein älteres Speicherformat ist kein Defekt, sondern
die erwartete Folge eines Formatwechsels (Plan 2.3; E1 lehnt Format 1 mit
Absicht ab). An den Fehlerdienst gemeldet, käme nach jedem Wechsel ein Bericht
je wiederkehrendem Spieler, und die echten Fehler gingen darin unter; es bleibt
bei einer Warnung in der Konsole. Alles andere, was sich nicht lesen lässt, ist
ein Defekt (eigener Code hat Unlesbares geschrieben, oder etwas Fremdes hat den
Eintrag verändert) und geht an den Fehlerdienst.
*/
function raeumeVerworfeneAuf(lage: Extract<PartieLage, { art: 'verworfen' }>): void {
  if (aufgeraeumt.has(lage)) return
  aufgeraeumt.add(lage)
  verwirfPartie()
  if (lage.grund === 'aelteres-format') {
    console.warn('Gespeicherte Partie im älteren Speicherformat verworfen:', lage.fehler.message)
    return
  }
  console.error('Gespeicherte Partie beschädigt und verworfen:', lage.fehler)
  meldeFehler(lage.fehler, { ort: 'spielstand', grund: lage.grund })
}

/**
 * Die gespeicherte Partie für eine Seite: einmal beim Öffnen gelesen. Ist sie
 * unlesbar, liefert der Hook das als `verworfen` (die Seite zeigt es an) und
 * räumt nach dem Zeichnen auf. Gelesen wird im Zeichnen, verworfen erst im
 * Effekt, damit ein zweites Zeichnen denselben Befund sieht.
 */
export function useGespeichertePartie(): PartieLage {
  const [lage] = useState(leseGespeichertePartie)
  useEffect(() => {
    if (lage.art === 'verworfen') raeumeVerworfeneAuf(lage)
  }, [lage])
  return lage
}
