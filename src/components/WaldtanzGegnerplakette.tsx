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
*/

import { useId } from 'react'

interface WaldtanzGegnerplaketteProps {
  spielerName: string
  istMensch: boolean
  punkte: number
  handkarten: number
}

export default function WaldtanzGegnerplakette({
  spielerName,
  istMensch,
  punkte,
  handkarten,
}: WaldtanzGegnerplaketteProps) {
  const titelId = useId()
  return (
    <section
      className="waldtanz-gegnerplakette"
      aria-labelledby={titelId}
      data-gegnerplakette="naechster"
    >
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