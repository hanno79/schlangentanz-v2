import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { tischAnsicht } from './tischAnsicht'
import type { TischAnsicht } from './tischAnsicht'

/*
Die Partie-Steuerung (Plan O3). Sie hält den Spielstand, lässt die KI-Gegner
Schritt für Schritt spielen und nimmt die Aktionen des Menschen entgegen. Nach
jedem Schritt steht der Stand im Speicher des Browsers; wer neu lädt, ist genau
dort, auch wenn eine Abwehrfrage offen ist.

Die KI läuft nur, solange eine KI entscheidet. Ist der Mensch gefragt, am Zug
oder bei einer Abwehrfrage, wartet die Steuerung auf ihn. Ein Fehler von Engine
oder KI wird beim nächsten Zeichnen geworfen; dann zeigt ihn der Fehlerfang des
App-Rahmens mit dem Weg zurück zur Lobby, und kein KI-Schritt läuft mehr.
*/

/** Die Strategie der KI-Gegner, ein Name aus der Registry `src/ki/strategien/index.ts`. */
export const GEGNER_STRATEGIE = 'zufallsKi'

/** Pause vor jedem KI-Schritt in Millisekunden (O3 K1); bei „weniger Bewegung“ und im Test 0. */
export const KI_PAUSE = 700

export interface SpielOptionen {
  /** Millisekunden vor jedem KI-Schritt. */
  pause: number
}

export interface Spielsteuerung {
  ansicht: TischAnsicht
  /** Die Wertung, sobald die Partie beendet ist (O8); bis dahin `null`. */
  ergebnis: ErgebnisAnsicht | null
  /** Führt eine Aktion des Menschen aus, eine aus `ansicht.aktionen`. */
  fuehreAus: (aktion: SpielAktion) => void
  /** Der deutsche Grund, wenn die Engine die letzte Aktion des Menschen abgelehnt hat (B2, U12). */
  ablehnung: string | null
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

export function useSpiel(start: Spielzustand, { pause }: SpielOptionen): Spielsteuerung {
  const [zustand, setzeZustand] = useState(start)
  const [gegner] = useState(() => erstelleGegner(start))
  const [ablehnung, setzeAblehnung] = useState<string | null>(null)
  const halteFehlerFest = useWurfImZeichnen()
  const ansicht = useMemo(() => tischAnsicht(zustand), [zustand])
  const ergebnis = useMemo(() => (zustand.partiephase === 'Beendet' ? ergebnisAnsicht(zustand) : null), [zustand])

  /**
   * Spielt die Aktion, die `waehle` liefert: erst speichern, dann zeigen, damit
   * ein Neuladen nie hinter dem Bild zurückliegt. Ein Wurf von Engine oder KI
   * geht an den Fehlerfang.
   */
  const spiele = useCallback(
    (waehle: () => SpielAktion) => {
      try {
        const neu = anwendeAktion(zustand, waehle()).zustand
        speichereSpielstand(neu)
        setzeZustand(neu)
        setzeAblehnung(null)
      } catch (grund) {
        halteFehlerFest(grund)
      }
    },
    [zustand, halteFehlerFest],
  )

  useEffect(() => {
    const amZug = entscheidendeKi(zustand, gegner)
    if (amZug === null) return
    const zeitgeber = setTimeout(() => spiele(() => waehleFuer(zustand, amZug.entscheider, amZug.ki)), pause)
    return () => clearTimeout(zeitgeber)
  }, [zustand, gegner, pause, spiele])

  const fuehreAus = useCallback(
    (aktion: SpielAktion) => {
      const pruefung = pruefeAktion(zustand, aktion)
      if (pruefung.erlaubt) spiele(() => aktion)
      else setzeAblehnung(pruefung.grund)
    },
    [zustand, spiele],
  )

  if (!(pause >= 0)) throw new Error(`Die Pause vor einem KI-Schritt muss 0 oder mehr Millisekunden sein, erhalten: ${pause}.`)
  return { ansicht, ergebnis, fuehreAus, ablehnung }
}
