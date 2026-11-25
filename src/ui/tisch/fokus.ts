import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

/*
Der Fokus bleibt am Tisch (Plan O11, Kriterium 1). Wer nur mit der Tastatur
spielt, drückt Knöpfe, die danach verschwinden oder gesperrt sind:
„Ausführen“ nach dem Spielen, deine Handkarten, sobald ein Gegner dran ist,
„Ablegen“ samt Dialog. Der Browser setzt den Fokus dann auf die leere Seite,
und der nächste Tab beginnt wieder oben. Der Tisch fängt das ab: Nach jedem
Zeichnen prüft er, ob der Fokus aus einem seiner Elemente auf die leere Seite
gefallen ist, und setzt ihn auf den nächsten sinnvollen Knopf.

Holt die Tastatur den Fokus auf ein Element, scrollt der Tisch es ganz ins
Bild. Der Browser tut das von selbst nur, wenn das Element gar nicht zu sehen
ist; ragt es zwei Pixel in eine seitlich scrollende Zeile, bleibt es dahinter
(TF-TISCH-044). Wie viel Rand dabei frei bleibt, damit kein Zeichen „geht
weiter“ darauf liegt, sagt `scroll-padding` der Bereiche (karten.css). Mit
Maus oder Finger scrollt nichts nach: Was man antippt, ist schon zu sehen.

Der Fokus springt nur, wenn das Element mit dem Fokus verschwunden oder gesperrt ist.
Hat jemand den Fokus selbst weggenommen (neben den Tisch geklickt) oder steht
er noch nie im Tisch (Seite eben geöffnet), bleibt er, wo er ist.
*/

/**
 * Wohin der Fokus springt: der erste bedienbare Knopf der Zugleiste (nach dem
 * Spielen „Zug beenden“, während ein Gegner spielt „Schneller“, bei der
 * Abwehrfrage „Durchlassen“), sonst deine erste spielbare Handkarte, sonst die
 * Zugleiste selbst.
 */
function ersatz(tisch: HTMLElement): HTMLElement | null {
  const zugleiste = tisch.querySelector<HTMLElement>('.st-zugleiste')
  return zugleiste?.querySelector<HTMLElement>('button:not(:disabled)') ?? tisch.querySelector<HTMLElement>('.st-hand-karten button:not(:disabled)') ?? zugleiste
}

const gesperrt = (element: Element) => element instanceof HTMLButtonElement && element.disabled

/** Hält den Fokus im Tisch, an dessen Wurzel die zurückgegebene Referenz hängt. */
export function useFokusHalten(): RefObject<HTMLDivElement | null> {
  const wurzel = useRef<HTMLDivElement>(null)
  const zuletzt = useRef<Element | null>(null)

  useEffect(() => {
    const tisch = wurzel.current
    if (tisch === null) return
    const merke = (ereignis: FocusEvent) => {
      const ziel = ereignis.target instanceof Element ? ereignis.target : null
      zuletzt.current = ziel
      if (ziel?.matches(':focus-visible') === true) ziel.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
    tisch.addEventListener('focusin', merke)
    return () => tisch.removeEventListener('focusin', merke)
  }, [])

  // Nach jedem Zeichnen: Ein neuer Stand oder eine neue Auswahl kann den Knopf mit dem Fokus entfernen.
  useEffect(() => {
    const tisch = wurzel.current
    const vorher = zuletzt.current
    if (tisch === null || vorher === null) return
    const aktiv = document.activeElement
    const aufLeererSeite = aktiv === null || aktiv === document.body || gesperrt(aktiv)
    const weg = !vorher.isConnected || gesperrt(vorher)
    // Ein offener Dialog führt seinen Fokus selbst.
    if (!aufLeererSeite || !weg || tisch.querySelector('dialog[open]') !== null) return
    ersatz(tisch)?.focus()
  })

  return wurzel
}
