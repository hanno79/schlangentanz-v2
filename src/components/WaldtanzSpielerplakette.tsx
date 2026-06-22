/*
Author: rahn
Datum: 22.06.2026
Version: 1.0
Beschreibung: M1cx macht den aktiven Spieler am Waldtanz-Brett als
körperliche Stitch-Spielerplakette sichtbar. Die Plakette sitzt links
neben der Handkartenleiste, zeigt Avatar, Spielername, große Punktzahl
und Handkarten-Zahl des aktiven Spielers mit 3px-Waldgrün-Border,
Hard-Shadow und Primary-Container-Hintergrund.
# AENDERUNG 22.06.2026: M1cx initial — Spielerplakette als Stitch-Spielobjekt.
*/

import { useId } from 'react'

interface WaldtanzSpielerplaketteProps {
  spielerName: string
  istMensch: boolean
  punkte: number
  handkarten: number
}

export default function WaldtanzSpielerplakette({
  spielerName,
  istMensch,
  punkte,
  handkarten,
}: WaldtanzSpielerplaketteProps) {
  const titelId = useId()
  return (
    <section
      className="waldtanz-spielerplakette"
      aria-labelledby={titelId}
      data-spielerplakette="aktiv"
    >
      <h3 id={titelId} className="waldtanz-spielerplakette__name">
        <span className="waldtanz-spielerplakette__avatar" aria-label="Spieler-Avatar">
          {istMensch ? '🧙' : '🐸'}
        </span>
        <span className="waldtanz-spielerplakette__name-text">{spielerName}</span>
      </h3>
      <span
        className="waldtanz-spielerplakette__punkte"
        aria-label={`Punktzahl: ${punkte} ${punkte === 1 ? 'Punkt' : 'Punkte'}`}
      >
        {punkte}
      </span>
      <span
        className="waldtanz-spielerplakette__handkarten"
        aria-label={`${handkarten} Handkarten`}
      >
        {handkarten} <span aria-hidden="true">🃏</span>
      </span>
    </section>
  )
}