import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

/*
Wo ein Bereich des Tischs weitergeht. Eine Schlange als seitlich scrollende
Zeile oder die Tischfläche zeigt nicht von selbst, dass hinter ihrem Rand noch
Karten liegen: Auf Touch-Geräten gibt es keinen Scrollbalken, und der Rand
kann genau zwischen zwei Karten liegen (O4, Prüfprotokoll Iteration 2). Der
Hook misst das am Element selbst; `Weiter` zeichnet daraus das Zeichen am Rand.
*/

export interface Ueberlauf {
  /** Wie viele Glieder ganz oder teilweise hinter dem rechten Rand liegen; 0, wenn nichts. */
  rechts: number
  /** Wie viele Glieder ganz oder teilweise vor dem linken Rand liegen; 0, wenn nichts. */
  links: number
  unten: boolean
  oben: boolean
}

const NICHTS: Ueberlauf = { rechts: 0, links: 0, unten: false, oben: false }

const gleich = (a: Ueberlauf, b: Ueberlauf) => a.rechts === b.rechts && a.links === b.links && a.unten === b.unten && a.oben === b.oben

function miss(element: HTMLElement): Ueberlauf {
  const box = element.getBoundingClientRect()
  const innenLinks = box.left + element.clientLeft
  const innenRechts = innenLinks + element.clientWidth
  const glieder = Array.from(element.children).map((kind) => kind.getBoundingClientRect())
  const mehrRechts = element.scrollLeft + element.clientWidth < element.scrollWidth - 1
  const mehrLinks = element.scrollLeft > 1
  return {
    rechts: mehrRechts ? glieder.filter((glied) => glied.right > innenRechts + 1).length : 0,
    links: mehrLinks ? glieder.filter((glied) => glied.left < innenLinks - 1).length : 0,
    unten: element.scrollTop + element.clientHeight < element.scrollHeight - 1,
    oben: element.scrollTop > 1,
  }
}

/**
 * Misst, ob und wie weit der Inhalt des Elements über seine Ränder reicht:
 * nach jedem Zeichnen, beim Scrollen und wenn sich seine Grösse oder die eines
 * Glieds ändert (Fenster gedreht, Schrift geladen).
 */
export function useUeberlauf<T extends HTMLElement>(): [RefObject<T | null>, Ueberlauf] {
  const ref = useRef<T>(null)
  const [stand, setzeStand] = useState<Ueberlauf>(NICHTS)

  const aktualisiere = useCallback(() => {
    const element = ref.current
    if (element === null) return
    const neu = miss(element)
    setzeStand((alt) => (gleich(alt, neu) ? alt : neu))
  }, [])

  // Nach jedem Zeichnen: Ein neuer Spielstand ändert den Inhalt, nicht unbedingt die Grösse.
  useLayoutEffect(aktualisiere)

  useEffect(() => {
    const element = ref.current
    if (element === null) return
    element.addEventListener('scroll', aktualisiere, { passive: true })
    window.addEventListener('resize', aktualisiere)
    // jsdom kennt keinen ResizeObserver; dort gibt es auch kein Layout, das sich ändern könnte.
    const beobachter = typeof ResizeObserver === 'function' ? new ResizeObserver(aktualisiere) : null
    beobachter?.observe(element)
    for (const kind of Array.from(element.children)) beobachter?.observe(kind)
    return () => {
      element.removeEventListener('scroll', aktualisiere)
      window.removeEventListener('resize', aktualisiere)
      beobachter?.disconnect()
    }
  }, [aktualisiere])

  return [ref, stand]
}
