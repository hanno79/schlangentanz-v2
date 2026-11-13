import '../tokens.css'
import './grossansicht.css'
import { useEffect, useId, useRef, type MouseEvent } from 'react'
import { Karte } from './Karte'
import type { Bildkarte } from './kartenbilder'
import { Kartentext } from './Kartentext'
import { KARTENHILFE_TEXTE } from './hilfe/texte'

/** Lag der Klick ausserhalb des Dialogs, also auf dem abgedunkelten Hintergrund? */
function aufDemHintergrund(ereignis: MouseEvent<HTMLDialogElement>): boolean {
  // Auch der Rand zwischen Bild und Text ist der Dialog selbst; dort schliesst ein Klick nicht.
  if (ereignis.target !== ereignis.currentTarget) return false
  const rahmen = ereignis.currentTarget.getBoundingClientRect()
  return (
    ereignis.clientX < rahmen.left ||
    ereignis.clientX > rahmen.right ||
    ereignis.clientY < rahmen.top ||
    ereignis.clientY > rahmen.bottom
  )
}

/**
 * Grossansicht einer Karte: das Bild so gross, wie das Fenster es zulässt, und
 * daneben oder darunter ihr Text aus der Spielanleitung (O9). Ein modaler
 * Dialog; „Schliessen“, Escape und ein Tippen neben den Dialog schliessen ihn.
 * Danach ruft er `schliesse`, und der Aufrufer nimmt ihn weg.
 */
export function Grossansicht({ karte, schliesse }: { karte: Bildkarte; schliesse: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const schliessen = useRef<HTMLButtonElement>(null)
  const titelId = useId()

  useEffect(() => {
    const element = dialog.current
    if (element === null || element.open) return
    element.showModal()
    // Der Knopf steht in der festen Fusszeile: Ihn zu fokussieren scrollt den Text nicht weg.
    schliessen.current?.focus()
  }, [])

  return (
    <dialog
      ref={dialog}
      className="grossansicht"
      aria-labelledby={titelId}
      onClose={schliesse}
      onClick={(ereignis) => {
        if (aufDemHintergrund(ereignis)) ereignis.currentTarget.close()
      }}
    >
      <div className="grossansicht__koerper">
        <div className="grossansicht__bild">
          <Karte karte={karte} />
        </div>
        <Kartentext karte={karte} titelId={titelId} />
      </div>
      <div className="grossansicht__fuss">
        <button ref={schliessen} type="button" className="grossansicht__schliessen" onClick={() => dialog.current?.close()}>
          {KARTENHILFE_TEXTE.schliessen}
        </button>
      </div>
    </dialog>
  )
}
