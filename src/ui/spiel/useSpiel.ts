import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { anwendeAktion, erzeugeZufall, pruefeAktion } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { waehleFuer } from '../../ki/schritt'
import { entscheiderVon } from '../../ki/sicht'
import type { Entscheider } from '../../ki/sicht'
import { STRATEGIEN } from '../../ki/strategien'
import type { Ki } from '../../ki/strategien/strategie'
import { speichereSpielstand } from '../../spielstand'
import { useWurfImZeichnen } from '../wurfImZeichnen'
import { ergebnisAnsicht } from './ergebnisAnsicht'
import type { ErgebnisAnsicht } from './ergebnisAnsicht'
import { vorschauFuer } from './haeutungsvorschau'
import type { Haeutungsvorschauer } from './haeutungsvorschau'
import { protokollSchritt } from './protokoll'
import { grundAmTisch, personen, tischAnsicht } from './tischAnsicht'
import type { TischAnsicht } from './tischAnsicht'

/*
Die Partie-Steuerung (Plan O3, O6). Sie hält den Spielstand, lässt die
KI-Gegner Schritt für Schritt spielen und nimmt die Aktionen des Menschen
entgegen. Nach jedem Schritt steht der Stand im Speicher des Browsers; wer neu
lädt, ist genau dort, auch wenn eine Abwehrfrage offen ist. Jeder Schritt kommt
ins Protokoll (O6); das Protokoll lebt nur in der Seite und beginnt nach dem
Neuladen leer.

Die KI läuft nur, solange eine KI entscheidet. Ist der Mensch gefragt, am Zug
oder bei einer Abwehrfrage, wartet die Steuerung auf ihn. Ein Fehler von Engine
oder KI wird beim nächsten Zeichnen geworfen; dann zeigt ihn der Fehlerfang des
App-Rahmens mit dem Weg zurück zur Lobby, und kein KI-Schritt läuft mehr.
*/

/** Die Strategie der KI-Gegner, ein Name aus der Registry `src/ki/strategien/index.ts` (Produktentscheidung 2.3). */
export const GEGNER_STRATEGIE = 'solideKi'

/** Pause vor jedem KI-Schritt in Millisekunden (O3 K1); bei „weniger Bewegung“ und im Test 0. */
export const KI_PAUSE = 700

/** Die Pause mit „Schneller“ (O6 K1). */
export const KI_PAUSE_SCHNELL = 250

/** So viele Einträge behält das Protokoll; ältere fallen heraus. */
const PROTOKOLL_LAENGE = 200

export interface SpielOptionen {
  /** Millisekunden vor jedem KI-Schritt. */
  pause: number
  /** Woher die Saaten der KI-Gegner kommen; ohne Angabe aus `Math.random` (O3 K4). Die Testhooks geben unter `?seed=` eine feste Quelle mit. */
  saatquelle?: () => number
}

export interface Protokolleintrag {
  /** Der wievielte Schritt dieser Seite, ab 1; ein Schritt bringt oft mehrere Einträge. */
  schritt: number
  text: string
}

export interface Verlauf {
  /** Das Protokoll, der älteste Eintrag zuerst (O6 K1). */
  eintraege: Protokolleintrag[]
  /** Ob du zuletzt wegen einer Schlangengrube aussetzen musstest; bis zu deiner nächsten Aktion (O6 K4). */
  ausgesetzt: boolean
  /** Ob „Schneller“ an ist (O6 K1). */
  schneller: boolean
  schalteSchneller: () => void
}

export interface Spielsteuerung {
  ansicht: TischAnsicht
  /** Die Wertung, sobald die Partie beendet ist (O8); bis dahin `null`. */
  ergebnis: ErgebnisAnsicht | null
  /** Führt eine Aktion des Menschen aus, eine aus `ansicht.aktionen`. */
  fuehreAus: (aktion: SpielAktion) => void
  /** Der deutsche Grund, wenn die Engine die letzte Aktion des Menschen abgelehnt hat (B2, U12), in Du-Form (O6). */
  ablehnung: string | null
  verlauf: Verlauf
  /** Was eine Schlangenhäutung im jetzigen Stand bringt, aus dem Zwischenstand der Engine (O7). */
  haeutungsVorschau: Haeutungsvorschauer
}

/**
 * Je KI-Gegner eine eigene Instanz seiner Strategie aus der Registry, jede mit
 * eigener Zufallsquelle (O3 K4, U5). Die Saat einer Quelle kommt aus
 * `saatquelle`, nie aus dem Zufall der Partie: Hinge sie daran, rechnete eine
 * Strategie aus ihren Zufallswerten die Partie zurück (P0.3d).
 */
export function erstelleGegner(zustand: Spielzustand, saatquelle: () => number = Math.random): Map<string, Ki> {
  if (!Object.hasOwn(STRATEGIEN, GEGNER_STRATEGIE)) {
    throw new Error(`Die Strategie ${GEGNER_STRATEGIE} steht nicht in der Registry der KI (src/ki/strategien/index.ts).`)
  }
  const fabrik = STRATEGIEN[GEGNER_STRATEGIE]
  return new Map(
    zustand.spieler
      .filter((spieler) => spieler.steuerung === 'KI')
      .map((spieler) => [spieler.id, fabrik(erzeugeZufall(Math.floor(saatquelle() * 2 ** 32)))]),
  )
}

/** Der Gegner, der gerade entscheidet, mit seiner Instanz; `null`, wenn ein Mensch entscheidet oder die Partie beendet ist. */
function entscheidendeKi(zustand: Spielzustand, gegner: ReadonlyMap<string, Ki>): { entscheider: Entscheider; ki: Ki } | null {
  const entscheider = entscheiderVon(zustand)
  if (entscheider?.steuerung !== 'KI') return null
  const ki = gegner.get(zustand.spieler[entscheider.index].id)
  if (ki === undefined) throw new Error(`Für ${entscheider.name} gibt es keine KI-Instanz; die Partie hat andere Spieler als beim Start.`)
  return { entscheider, ki }
}

interface Protokollstand {
  eintraege: Protokolleintrag[]
  ausgesetzt: boolean
}

const LEERES_PROTOKOLL: Protokollstand = { eintraege: [], ausgesetzt: false }

export function useSpiel(start: Spielzustand, { pause, saatquelle }: SpielOptionen): Spielsteuerung {
  const [zustand, setzeZustand] = useState(start)
  const [gegner] = useState(() => erstelleGegner(start, saatquelle))
  const [ablehnung, setzeAblehnung] = useState<string | null>(null)
  const [protokoll, setzeProtokoll] = useState(LEERES_PROTOKOLL)
  const [schneller, setzeSchneller] = useState(false)
  const halteFehlerFest = useWurfImZeichnen()
  const ansicht = useMemo(() => tischAnsicht(zustand), [zustand])
  const ergebnis = useMemo(() => (zustand.partiephase === 'Beendet' ? ergebnisAnsicht(zustand) : null), [zustand])
  // Gelesen erst, wenn die KI gewählt hat: Schaltet „Schneller“ während der Pause um, rechnet die KI nicht neu.
  const wartezeit = useRef(pause)
  useEffect(() => {
    wartezeit.current = schneller ? Math.min(pause, KI_PAUSE_SCHNELL) : pause
  }, [schneller, pause])
  const vorschau = useMemo(() => vorschauFuer(zustand), [zustand])

  /**
   * Spielt die Aktion: erst speichern, dann zeigen, damit ein Neuladen nie
   * hinter dem Bild zurückliegt; danach ins Protokoll. Deine eigene Aktion
   * nimmt den Hinweis aufs Aussetzen weg. Ein Wurf von Engine oder KI geht an
   * den Fehlerfang.
   */
  const spiele = useCallback(
    (aktion: SpielAktion) => {
      try {
        const { zustand: neu, ereignisse } = anwendeAktion(zustand, aktion)
        const saetze = protokollSchritt(zustand, aktion, ereignisse, ansicht)
        const person = personen(zustand)
        const ausgesetzt = ereignisse.some((ereignis) => ereignis.typ === 'Ausgesetzt' && person(ereignis.spielerIndex).ich)
        const vonDir = aktion.spielerId === ansicht.ich.id
        speichereSpielstand(neu)
        setzeZustand(neu)
        setzeAblehnung(null)
        setzeProtokoll((alt) => {
          const schritt = (alt.eintraege.at(-1)?.schritt ?? 0) + 1
          return {
            eintraege: [...alt.eintraege, ...saetze.map((text) => ({ schritt, text }))].slice(-PROTOKOLL_LAENGE),
            ausgesetzt: ausgesetzt || (alt.ausgesetzt && !vonDir),
          }
        })
      } catch (grund) {
        halteFehlerFest(grund)
      }
    },
    [zustand, ansicht, halteFehlerFest],
  )

  /*
   * O6 K5: Die KI wählt gleich zu Beginn der Pause; gezeigt wird ihr Schritt,
   * wenn die Pause ab ihrem Beginn um ist. So dauert es gleich lange, ob sie
   * viel rechnet, etwa weil sie einen Farbenschutz hält und das Abwehren
   * abwägt, oder nichts zu wählen hat. Nur wenn sie länger rechnet als die
   * Pause, kommt ihr Schritt später.
   */
  useEffect(() => {
    const amZug = entscheidendeKi(zustand, gegner)
    if (amZug === null) return
    const beginn = Date.now()
    let zeitgeber = setTimeout(() => {
      let aktion: SpielAktion
      try {
        aktion = waehleFuer(zustand, amZug.entscheider, amZug.ki)
      } catch (grund) {
        halteFehlerFest(grund)
        return
      }
      const rest = wartezeit.current - (Date.now() - beginn)
      if (rest > 0) zeitgeber = setTimeout(() => spiele(aktion), rest)
      else spiele(aktion)
    }, 0)
    return () => clearTimeout(zeitgeber)
  }, [zustand, gegner, spiele, halteFehlerFest])

  const fuehreAus = useCallback(
    (aktion: SpielAktion) => {
      const pruefung = pruefeAktion(zustand, aktion)
      if (pruefung.erlaubt) spiele(aktion)
      else setzeAblehnung(grundAmTisch(zustand, pruefung))
    },
    [zustand, spiele],
  )

  const schalteSchneller = useCallback(() => setzeSchneller((an) => !an), [])

  if (!(pause >= 0)) throw new Error(`Die Pause vor einem KI-Schritt muss 0 oder mehr Millisekunden sein, erhalten: ${pause}.`)
  return { ansicht, ergebnis, fuehreAus, ablehnung, haeutungsVorschau: vorschau, verlauf: { eintraege: protokoll.eintraege, ausgesetzt: protokoll.ausgesetzt, schneller, schalteSchneller } }
}
