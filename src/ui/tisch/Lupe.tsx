import { useEffect, useRef } from 'react'
import type { Bildkarte } from '../karten/kartenbilder'
import { Karte } from '../karten/Karte'
import { kartenname } from '../karten/kartentexte'
import { KARTENGROESSE } from './groessen'
import { TISCH } from './texte'

/**
 * Grossansicht einer Karte. Am Tisch sind Aufgaben zu klein, um ihren Text zu
 * lesen; hier steht die Karte so gross, wie der Schirm es erlaubt, mit dem
 * grossen Bild. Als modaler Dialog: Escape und ein Tippen neben die Karte
 * schliessen ihn.
 */
export function Lupe({ karte, schliesse }: { karte: Bildkarte; schliesse: () => void }) {
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
      <button type="button" className="tisch-knopf" onClick={() => dialog.current?.close()}>
        {TISCH.schliessen}
      </button>
    </dialog>
  )
}

/** Eine offen liegende Karte, die man zum Lesen gross ansehen kann. */
export function GrossKnopf({ karte, name, zeigeGross }: { karte: Bildkarte; name?: string; zeigeGross: (karte: Bildkarte) => void }) {
  return (
    <button type="button" className="kartenknopf" aria-label={name ?? kartenname(karte)} onClick={() => zeigeGross(karte)}>
      <Karte karte={karte} sizes={KARTENGROESSE.mitte} />
    </button>
  )
}
