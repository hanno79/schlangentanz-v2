import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/*
Wo ein Bereich des Tischs weitergeht. Eine Schlange als seitlich scrollende
Zeile oder die Tischfläche zeigt nicht von selbst, dass hinter ihrem Rand noch
Karten liegen: Auf Touch-Geräten gibt es keinen Scrollbalken, und der Rand
kann genau zwischen zwei Karten liegen (O4, Prüfprotokoll Iteration 2). Der
Hook misst das am Element selbst; `Weiter` zeichnet daraus das Zeichen am Rand.

Während der Zielwahl (O5) stehen in einer Schlange auch Ziele, etwa die Felder
an den Enden. Sie sind keine Karten und zählen nicht mit; liegt eines hinter
dem Rand, sagt es das Zeichen eigens.
*/

export interface Ueberlauf {
  /** Wie viele Karten ganz oder teilweise hinter dem rechten Rand liegen; 0, wenn nichts. */
  rechts: number
  /** Wie viele Karten ganz oder teilweise vor dem linken Rand liegen; 0, wenn nichts. */
  links: number
  /** Ob hinter dem rechten bzw. linken Rand ein angebotenes Ziel liegt (O5). */
  zielRechts: boolean
  zielLinks: boolean
  unten: boolean
  oben: boolean
}

const NICHTS: Ueberlauf = { rechts: 0, links: 0, zielRechts: false, zielLinks: false, unten: false, oben: false }

const gleich = (a: Ueberlauf, b: Ueberlauf) =>
  a.rechts === b.rechts && a.links === b.links && a.zielRechts === b.zielRechts && a.zielLinks === b.zielLinks && a.unten === b.unten && a.oben === b.oben

/** Ein Glied, das nur ein Ziel trägt und keine Karte ist (`data-zielplatz`). */
const istZielplatz = (glied: Element) => glied.hasAttribute('data-zielplatz')
/** Ob im Glied ein angebotenes Ziel steht. */
const hatZiel = (glied: Element) => glied.querySelector('[data-ziel]:not(:disabled)') !== null || glied.matches('[data-ziel]:not(:disabled)')

function miss(element: HTMLElement): Ueberlauf {
  const box = element.getBoundingClientRect()
  const innenLinks = box.left + element.clientLeft
  const innenRechts = innenLinks + element.clientWidth
  const glieder = Array.from(element.children).map((kind) => ({ kind, rand: kind.getBoundingClientRect() }))
  const mehrRechts = element.scrollLeft + element.clientWidth < element.scrollWidth - 1
  const mehrLinks = element.scrollLeft > 1
  const hintenRechts = mehrRechts ? glieder.filter(({ rand }) => rand.right > innenRechts + 1) : []
  const vorneLinks = mehrLinks ? glieder.filter(({ rand }) => rand.left < innenLinks - 1) : []
  const karten = (liste: typeof glieder) => liste.filter(({ kind }) => !istZielplatz(kind)).length
  return {
    rechts: karten(hintenRechts),
    links: karten(vorneLinks),
    zielRechts: hintenRechts.some(({ kind }) => hatZiel(kind)),
    zielLinks: vorneLinks.some(({ kind }) => hatZiel(kind)),
    unten: element.scrollTop + element.clientHeight < element.scrollHeight - 1,
    oben: element.scrollTop > 1,
  }
}

/**
 * Misst, ob und wie weit der Inhalt des Elements über seine Ränder reicht:
 * nach jedem Zeichnen, beim Scrollen und wenn sich seine Grösse oder die eines
 * Glieds ändert (Fenster gedreht, Schrift geladen). Die Beobachter hängen am
 * Element selbst: Wird es ausgehängt und neu eingehängt (die Hand wird leer und
 * wieder gefüllt), bekommt das neue Element eigene (O4, Hinweis 4).
 */
export function useUeberlauf<T extends HTMLElement>(): [(element: T | null) => void, Ueberlauf] {
  // Das Element steht im Zustand, damit die Beobachter mit ihm wechseln, und im Ref für das Messen.
  const ref = useRef<T | null>(null)
  const [element, setzeElement] = useState<T | null>(null)
  const [stand, setzeStand] = useState<Ueberlauf>(NICHTS)

  const aktualisiere = useCallback(() => {
    if (ref.current === null) return
    const neu = miss(ref.current)
    setzeStand((alt) => (gleich(alt, neu) ? alt : neu))
  }, [])

  const haengeAn = useCallback((neu: T | null) => {
    ref.current = neu
    setzeElement(neu)
  }, [])

  // Nach jedem Zeichnen: Ein neuer Spielstand ändert den Inhalt, nicht unbedingt die Grösse.
  useLayoutEffect(aktualisiere)

  useEffect(() => {
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
  }, [element, aktualisiere])

  return [haengeAn, stand]
}
