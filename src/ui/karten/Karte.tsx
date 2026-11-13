import './karte.css'
import { KARTENBILD_BREITE, KARTENBILD_HOEHE, kartenbild, RUECKSEITE_BILD } from './kartenbilder'
import type { Bildkarte } from './kartenbilder'
import { kartenname, RUECKSEITE_NAME } from './kartentexte'

interface Kartenbildeigenschaften {
  /** Zusätzliche Klasse, etwa für die Grösse in einem Bereich des Tischs. */
  className?: string
}

function klassen(zusatz: string | undefined): string {
  return zusatz === undefined ? 'karte' : `karte ${zusatz}`
}

/**
 * Eine Karte als Bild. Die Breite bestimmt der umgebende Bereich (`--karte-breite`),
 * die Höhe folgt aus dem Kartenformat. Bedienbar wird sie erst in einem Knopf, den
 * der Tisch darum legt; das Bild selbst kennt keine Spielregel.
 */
export function Karte({ karte, className }: Kartenbildeigenschaften & { karte: Bildkarte }) {
  return (
    <img
      className={klassen(className)}
      src={kartenbild(karte)}
      alt={kartenname(karte)}
      width={KARTENBILD_BREITE}
      height={KARTENBILD_HOEHE}
      draggable={false}
    />
  )
}

/** Eine verdeckte Karte: Nachziehstapel oder fremde Hand. Verrät nichts über die Karte. */
export function Kartenrueckseite({ className }: Kartenbildeigenschaften) {
  return (
    <img
      className={klassen(className)}
      src={RUECKSEITE_BILD}
      alt={RUECKSEITE_NAME}
      width={KARTENBILD_BREITE}
      height={KARTENBILD_HOEHE}
      draggable={false}
    />
  )
}
