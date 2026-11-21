import { useCallback, useEffect, useMemo, useState } from 'react'
import { anwendeAktion, ermittleEntscheider, erzeugeZufall, pruefeAktion } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { naechsterKiSchritt } from '../../ki/schritt'
import { STRATEGIEN } from '../../ki/strategien'
import type { Ki } from '../../ki/strategien/strategie'
import { speichereSpielstand } from '../../spielstand'
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
  /** Woraus die Saat jeder KI-Zufallsquelle kommt; im Spiel `Math.random`, nie der Partie-Zufall (U5). */
  saatquelle?: () => number
}

export interface Spielsteuerung {
  ansicht: TischAnsicht
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

/** Die Instanz der KI, die gerade entscheidet; `null`, wenn ein Mensch entscheidet oder die Partie beendet ist. */
function entscheidendeKi(zustand: Spielzustand, gegner: ReadonlyMap<string, Ki>): Ki | null {
  const entscheider = ermittleEntscheider(zustand)
  if (entscheider === null) return null
  const spieler = zustand.spieler[entscheider]
  if (spieler.steuerung !== 'KI') return null
  const ki = gegner.get(spieler.id)
  if (ki === undefined) throw new Error(`Für ${spieler.name} gibt es keine KI-Instanz; die Partie hat andere Spieler als beim Start.`)
  return ki
}

export function useSpiel(start: Spielzustand, { pause, saatquelle }: SpielOptionen): Spielsteuerung {
  const [zustand, setzeZustand] = useState(start)
  const [gegner] = useState(() => erstelleGegner(start, saatquelle))
  const [ablehnung, setzeAblehnung] = useState<string | null>(null)
  /* Ein Wurf im Zeitgeber oder im Klick erreicht keine Fehlergrenze. Er wird
     festgehalten und beim nächsten Zeichnen geworfen (wie in der Lobby). */
  const [fehler, setzeFehler] = useState<{ fehler: unknown } | null>(null)
  const ansicht = useMemo(() => tischAnsicht(zustand), [zustand])

  /** Ein Schritt ist getan: erst speichern, dann zeigen, damit ein Neuladen nie hinter dem Bild zurückliegt. */
  const weiter = useCallback((neu: Spielzustand) => {
    speichereSpielstand(neu)
    setzeZustand(neu)
    setzeAblehnung(null)
  }, [])

  useEffect(() => {
    const ki = entscheidendeKi(zustand, gegner)
    if (ki === null) return
    const zeitgeber = setTimeout(() => {
      try {
        const aktion = naechsterKiSchritt(zustand, ki)
        if (aktion === null) throw new Error('KI-Schritt: Es entscheidet keine KI, obwohl die Steuerung eine erwartet hat.')
        weiter(anwendeAktion(zustand, aktion).zustand)
      } catch (grund) {
        setzeFehler({ fehler: grund })
      }
    }, pause)
    return () => clearTimeout(zeitgeber)
  }, [zustand, gegner, pause, weiter])

  const fuehreAus = useCallback(
    (aktion: SpielAktion) => {
      const pruefung = pruefeAktion(zustand, aktion)
      if (!pruefung.erlaubt) {
        setzeAblehnung(pruefung.grund)
        return
      }
      try {
        weiter(anwendeAktion(zustand, aktion).zustand)
      } catch (grund) {
        setzeFehler({ fehler: grund })
      }
    },
    [zustand, weiter],
  )

  if (fehler !== null) throw fehler.fehler
  if (!(pause >= 0)) throw new Error(`Die Pause vor einem KI-Schritt muss 0 oder mehr Millisekunden sein, erhalten: ${pause}.`)
  return { ansicht, fuehreAus, ablehnung }
}
