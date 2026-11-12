import type { Spielkarte } from '../engine'
import { farbeCssKlasse } from '../kartenfarben'
import { karteAnzeigename } from '../kartenTexte'

/** Eine Karte, lesbar und eindeutig: Spielname, Art und Id. */
export function Karte({ karte }: { karte: Spielkarte }) {
  if (karte.typ === 'Farbkarte') {
    return (
      <span className={`et-karte et-karte--${farbeCssKlasse(karte.farbe)}`}>
        {karteAnzeigename(karte)} ({karte.farbe}, {karte.punkte}) <small>{karte.id}</small>
      </span>
    )
  }
  return (
    <span className="et-karte et-karte--sonder">
      {karte.name} <small>{karte.id}</small>
    </span>
  )
}

export function Kartenreihe({ karten, leer = 'keine' }: { karten: Spielkarte[]; leer?: string }) {
  if (karten.length === 0) return <span className="et-leer">{leer}</span>
  return (
    <span className="et-kartenreihe">
      {karten.map((karte, index) => (
        <Karte key={`${karte.id}-${index}`} karte={karte} />
      ))}
    </span>
  )
}
