import { useId } from 'react'
import type { ReactNode } from 'react'
import type { SpielAktion } from '../../engine'

interface KnopfMitGrundEigenschaften {
  klasse: string
  /** Die Aktion der Engine, die der Knopf spielt; `null`, solange die Engine sie nicht anbietet. Dann ist er gesperrt. */
  aktion: SpielAktion | null
  /** Warum der Knopf gesperrt ist; steht nur da, solange er gesperrt ist. */
  grund: string | null
  fuehreAus: (aktion: SpielAktion) => void
  children: ReactNode
}

/**
 * Ein Knopf mit dem Grund, warum er gesperrt ist (DESIGN.md, „Komponenten“):
 * Gesperrt steht der Grund daneben, und der Knopf verweist mit
 * `aria-describedby` darauf, damit ihn auch hört, wer den Knopf nur vorgelesen
 * bekommt. Gebraucht in der Zugleiste („Zug beenden“) und im Dialog „Zu viele
 * Handkarten“ („Ablegen“); wie Knopf und Grund dort stehen, legt der Ort fest.
 */
export function KnopfMitGrund({ klasse, aktion, grund, fuehreAus, children }: KnopfMitGrundEigenschaften) {
  const grundId = useId()
  const gezeigt = aktion === null ? grund : null
  return (
    <span className={gezeigt === null ? 'st-mitgrund' : 'st-mitgrund st-mitgrund--gesperrt'}>
      {gezeigt !== null && (
        <span id={grundId} className="st-grund">
          {gezeigt}
        </span>
      )}
      <button type="button" className={klasse} disabled={aktion === null} aria-describedby={gezeigt === null ? undefined : grundId} onClick={() => aktion !== null && fuehreAus(aktion)}>
        {children}
      </button>
    </span>
  )
}
