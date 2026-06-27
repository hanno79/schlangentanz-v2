/*
Author: rahn
Datum: 22.06.2026
Version: 1.0
Beschreibung: M1cy macht den naechsten Gegner am Waldtanz-Brett als zweite
koerperliche Stitch-Gegnerplakette symmetrisch zur Spielerplakette sichtbar.
Die Plakette sitzt rechts neben der Handkartenleiste und zeigt Avatar,
Spielername, grosse Punktzahl und Handkarten-Zahl des naechsten Gegners
mit 3px-Waldgruen-Border, Hard-Shadow und Tertiary-Container-Hintergrund.
Zusaetzlich markiert ein "Nächster Zug"-Indikator, dass dieser Gegner als
naechstes an der Reihe ist. So erzaehlt das Spielbrett die Geschichte
beider Akteure auf einen Blick: Spieler links, Handkarten Mitte, naechster
Gegner rechts.
# AENDERUNG 22.06.2026: M1cy initial — Gegnerplakette als Stitch-Spielobjekt.
# AENDERUNG 27.06.2026: M1cz — Gegnerhand-Kartenfaecher. Die ersten bis zu
3 Handkarten-Farben des Gegners werden als dekorative "Leaf-Tiles" hinter
dem Avatar gezeigt (Stitch-Peek-Stil: surface-container-highest, 3px
waldgruen-Border, hard-shadow-sm, Eco-Icon, leichte Rotation -6/+3/-2,
hover translateY(0.5rem), pointer-events:none, aria-hidden).
*/

import { useId } from 'react'
import type { Farbe } from '../engine'

interface WaldtanzGegnerplaketteProps {
  spielerName: string
  istMensch: boolean
  punkte: number
  handkarten: number
  /** M1cz: Bis zu 3 Karten-Farben des Gegners als dekorative Peek-Tiles. */
  gegnerHandFarben?: Farbe[]
}

const ROTATIONEN = ['-6deg', '3deg', '-2deg'] as const

export default function WaldtanzGegnerplakette({
  spielerName,
  istMensch,
  punkte,
  handkarten,
  gegnerHandFarben = [],
}: WaldtanzGegnerplaketteProps) {
  const titelId = useId()
  const peekFarben = gegnerHandFarben.slice(0, 3)
  return (
    <section
      className="waldtanz-gegnerplakette"
      aria-labelledby={titelId}
      data-gegnerplakette="naechster"
    >
      {peekFarben.length > 0 && (
        <ul
          className="waldtanz-gegnerplakette__handfaecher"
          data-gegner-hand-faecher=""
          aria-hidden="true"
        >
          {peekFarben.map((farbe, index) => (
            <li
              key={`peek-${index}-${farbe}`}
              className="waldtanz-gegnerplakette__handkarte"
              data-gegner-hand-tile=""
              data-peek-rotation={ROTATIONEN[index] ?? '0deg'}
              aria-hidden="true"
            >
              <span className="waldtanz-gegnerplakette__handkarte-eco" aria-hidden="true">
                eco
              </span>
            </li>
          ))}
        </ul>
      )}
      <h3 id={titelId} className="waldtanz-gegnerplakette__name">
        <span className="waldtanz-gegnerplakette__name-text">{`Gegner — ${spielerName}`}</span>
        <span className="waldtanz-gegnerplakette__avatar" aria-label="Gegner-Avatar">
          {istMensch ? '🧙' : '🐸'}
        </span>
      </h3>
      <span className="waldtanz-gegnerplakette__indikator" aria-label="Nächster Zug">
        <span aria-hidden="true">▶</span> kommt dran
      </span>
      <span
        className="waldtanz-gegnerplakette__punkte"
        aria-label={`Punktzahl: ${punkte} ${punkte === 1 ? 'Punkt' : 'Punkte'}`}
      >
        {punkte}
      </span>
      <span
        className="waldtanz-gegnerplakette__handkarten"
        aria-label={`${handkarten} Handkarten`}
      >
        {handkarten} <span aria-hidden="true">🃏</span>
      </span>
    </section>
  )
}
