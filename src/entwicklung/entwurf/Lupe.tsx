import { useEffect, useRef } from 'react'
import type { AufgabenkarteInfo, Spielkarte } from '../../engine'
import { Karte } from '../../ui/karten/Karte'
import { kartenname } from '../../ui/karten/kartentexte'

/**
 * Grossansicht einer Karte. Auf dem Handy sind die Karten am Tisch zu klein, um
 * ihren Text zu lesen; hier steht sie so gross, wie der Schirm es erlaubt.
 * Als modaler Dialog: Escape und ein Tippen neben die Karte schliessen ihn.
 */
export function Lupe({ karte, schliesse }: { karte: Spielkarte | AufgabenkarteInfo; schliesse: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const element = dialog.current
    if (element !== null && !element.open) element.showModal()
  }, [])

  return (
    <dialog
      ref={dialog}
      className="lupe"
      aria-label={kartenname(karte)}
      onClose={schliesse}
      onClick={(ereignis) => {
        if (ereignis.target === dialog.current) dialog.current.close()
      }}
    >
      <Karte karte={karte} className="lupe-karte" />
      <button type="button" className="knopf knopf--zweit" onClick={() => dialog.current?.close()}>
        Schliessen
      </button>
    </dialog>
  )
}
