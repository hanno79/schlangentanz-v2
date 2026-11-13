import './karte.css'
import { KARTENBILD_BREITE, KARTENBILD_HOEHE, KLEINBILD_BREITE, kartenbild, kleinbild, RUECKSEITE_BILD } from './kartenbilder'
import type { Bildkarte } from './kartenbilder'
import { kartenname, RUECKSEITE_NAME } from './kartentexte'

interface Kartenbildeigenschaften {
  /** Zusätzliche Klasse, etwa für die Grösse in einem Bereich des Tischs. */
  className?: string
}

function klassen(zusatz: string | undefined): string {
  return zusatz === undefined ? 'karte' : `karte ${zusatz}`
}

interface Karteneigenschaften extends Kartenbildeigenschaften {
  karte: Bildkarte
  /**
   * Wie breit die Karte höchstens gezeichnet wird, als `sizes` des Bildes
   * (etwa „96px“). Dann darf der Browser die kleine Fassung laden, solange sie
   * für die Pixeldichte reicht. Ohne Angabe (Grossansicht) gilt das grosse Bild.
   */
  sizes?: string
}

/**
 * Eine Karte als Bild. Die Breite bestimmt der umgebende Bereich (`--karte-breite`),
 * die Höhe folgt aus dem Kartenformat. Bedienbar wird sie erst in einem Knopf, den
 * der Tisch darum legt; das Bild selbst kennt keine Spielregel.
 */
export function Karte({ karte, className, sizes }: Karteneigenschaften) {
  const gross = kartenbild(karte)
  return (
    <img
      className={klassen(className)}
      src={gross}
      srcSet={sizes === undefined ? undefined : `${kleinbild(gross)} ${KLEINBILD_BREITE}w, ${gross} ${KARTENBILD_BREITE}w`}
      sizes={sizes}
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
