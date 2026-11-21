import { useLayoutEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import type { Spielkarte } from '../../engine'
import { Karte } from '../karten/Karte'
import type { Haeutung } from './haeutung'

/*
Eine Karte der Schlange, die gerade gehäutet wird (O7, DESIGN.md
„Schlangenhäutung“), als Knopf wie jedes Ziel: In der Stufe `abschnitt` ist sie
ein angebotenes Ende, angetippt gedrückt; beim Ordnen gehört sie zum Abschnitt,
markiert gedrückt, und die Pfeiltasten verschieben sie. Wer verschoben hat,
behält den Fokus auf derselben Karte an ihrer neuen Stelle.
*/

const RICHTUNG: Readonly<Record<string, -1 | 1>> = { ArrowLeft: -1, ArrowRight: 1 }

export function HaeutungsKarte({ haeutung, karte, name, groesse }: { haeutung: Haeutung; karte: Spielkarte; name: string; groesse: string }) {
  const knopf = useRef<HTMLButtonElement>(null)
  const ordnen = haeutung.stufe === 'ordnen'
  // Beim Ordnen ist jede Karte des Abschnitts angeboten; bei den Enden nicht mehr das schon gedrückte.
  const angeboten = ordnen || haeutung.gedrueckt !== karte.id
  const nummer = haeutung.fokus?.karteId === karte.id ? haeutung.fokus.nummer : null

  useLayoutEffect(() => {
    if (nummer !== null) knopf.current?.focus()
  }, [nummer])

  const beiTaste = (ereignis: KeyboardEvent<HTMLButtonElement>) => {
    const richtung = RICHTUNG[ereignis.key]
    if (!ordnen || richtung === undefined) return
    ereignis.preventDefault()
    haeutung.verschiebe(karte.id, richtung)
  }

  return (
    <button
      ref={knopf}
      type="button"
      className="st-ziel st-ziel--karte"
      data-ziel={angeboten ? `haeutung:${karte.id}` : undefined}
      aria-label={name}
      aria-pressed={haeutung.gedrueckt === karte.id}
      onClick={() => haeutung.tippe(karte.id)}
      onKeyDown={beiTaste}
    >
      <Karte karte={karte} sizes={groesse} />
    </button>
  )
}
