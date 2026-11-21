import { WEITER } from './texte'
import type { Ueberlauf } from './ueberlauf'

/**
 * Das Zeichen am Rand eines Bereichs, hinter dem noch etwas liegt: an einer
 * Schlange „+3 ›“ (so viele Karten liegen noch hinter dem Rand), an der
 * Tischfläche „mehr ↓“. Es steht über dem Rand, nimmt keine Klicks an und
 * wird nicht vorgelesen; die Zahl der Karten steht schon im Namen der Schlange.
 * Liegt hinter dem Rand ein angebotenes Ziel (O5), sagt es das mit „Ziel“ und
 * trägt die Farbe der Ziele. `data-weiter` nennt die Richtung, daran erkennt es
 * der Layout-Vertrag.
 */
const zeichenKlasse = (ziel: boolean) => (ziel ? 'st-weiter-zeichen st-weiter-zeichen--ziel' : 'st-weiter-zeichen')

export function Weiter({ ueberlauf }: { ueberlauf: Ueberlauf }) {
  return (
    <>
      {(ueberlauf.links > 0 || ueberlauf.zielLinks) && (
        <span className="st-weiter st-weiter--links" data-weiter="links" aria-hidden="true">
          <span className={zeichenKlasse(ueberlauf.zielLinks)}>{WEITER.links(ueberlauf.links, ueberlauf.zielLinks)}</span>
        </span>
      )}
      {(ueberlauf.rechts > 0 || ueberlauf.zielRechts) && (
        <span className="st-weiter st-weiter--rechts" data-weiter="rechts" aria-hidden="true">
          <span className={zeichenKlasse(ueberlauf.zielRechts)}>{WEITER.rechts(ueberlauf.rechts, ueberlauf.zielRechts)}</span>
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
