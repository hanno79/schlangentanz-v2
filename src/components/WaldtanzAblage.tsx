/*
Author: rahn
Datum: 14.06.2026
Version: 1.0
Beschreibung: Board-nahe Waldtanz-Ablage fuer die zuletzt gespielte oder abgeworfene Karte.
*/

import type { Spielkarte, Spielzustand } from '../engine'
import { farbeCssKlasse } from '../kartenfarben'

interface WaldtanzAblageProps {
  zustand: Spielzustand
}

function kartenBeschreibung(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte'
    ? `Farbkarte ${karte.farbe} · ${karte.punkte} Punkte`
    : `Sonderkarte ${karte.name}`
}

function kartenKlasse(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte'
    ? `waldtanz-ablage__karte waldtanz-ablage__karte--farbkarte schlangekarte__karte--farbe-${farbeCssKlasse(karte.farbe)}`
    : 'waldtanz-ablage__karte waldtanz-ablage__karte--sonderkarte'
}

export default function WaldtanzAblage({ zustand }: WaldtanzAblageProps) {
  const anzahl = zustand.ablagestapel.length
  const letzteKarte = zustand.ablagestapel[anzahl - 1] ?? null
  const darunterKarte = zustand.ablagestapel[anzahl - 2] ?? null

  return (
    <section className="waldtanz-ablage" aria-label="Waldtanz-Ablage">
      <div className="waldtanz-ablage__kopf">
        <h4>Waldtanz-Ablage</h4>
        <span>Ablage: {anzahl} {anzahl === 1 ? 'Karte' : 'Karten'}</span>
      </div>
      {letzteKarte ? (
        <div className="waldtanz-ablage__stapel" aria-label="Ablagestapel als gespielte Karte">
          <article className={kartenKlasse(letzteKarte)}>
            <span className="waldtanz-ablage__label">Letzte Karte</span>
            <strong>{letzteKarte.id}</strong>
            <span>{kartenBeschreibung(letzteKarte)}</span>
          </article>
          {darunterKarte && <p className="waldtanz-ablage__darunter">Darunter: {darunterKarte.id}</p>}
        </div>
      ) : (
        <div className="waldtanz-ablage__leer">
          <p>Noch keine Karten auf der Ablage.</p>
          <p>Der nächste Sonderkarten- oder Abwurfeffekt landet hier sichtbar.</p>
        </div>
      )}
    </section>
  )
}
