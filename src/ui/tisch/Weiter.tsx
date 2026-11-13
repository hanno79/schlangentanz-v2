import { WEITER } from './texte'
import type { Ueberlauf } from './ueberlauf'

/**
 * Das Zeichen am Rand eines Bereichs, hinter dem noch etwas liegt: an einer
 * Schlange „+3 ›“ (so viele Karten liegen noch hinter dem Rand), an der
 * Tischfläche „mehr ↓“. Es steht über dem Rand, nimmt keine Klicks an und
 * wird nicht vorgelesen; die Zahl der Karten steht schon im Namen der Schlange.
 * `data-weiter` nennt die Richtung, daran erkennt es der Layout-Vertrag.
 */
export function Weiter({ ueberlauf }: { ueberlauf: Ueberlauf }) {
  return (
    <>
      {ueberlauf.links > 0 && (
        <span className="st-weiter st-weiter--links" data-weiter="links" aria-hidden="true">
          <span className="st-weiter-zeichen">{WEITER.links(ueberlauf.links)}</span>
        </span>
      )}
      {ueberlauf.rechts > 0 && (
        <span className="st-weiter st-weiter--rechts" data-weiter="rechts" aria-hidden="true">
          <span className="st-weiter-zeichen">{WEITER.rechts(ueberlauf.rechts)}</span>
        </span>
      )}
      {ueberlauf.oben && (
        <span className="st-weiter st-weiter--oben" data-weiter="oben" aria-hidden="true">
          <span className="st-weiter-zeichen">{WEITER.oben}</span>
        </span>
      )}
      {ueberlauf.unten && (
        <span className="st-weiter st-weiter--unten" data-weiter="unten" aria-hidden="true">
          <span className="st-weiter-zeichen">{WEITER.unten}</span>
        </span>
      )}
    </>
  )
}
