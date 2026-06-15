/*
Author: rahn
Datum: 15.06.2026
Version: 1.0
Beschreibung: Zentrale Waldtanz-Tischkarte fuer den zuletzt ausgespielten Ablagestapel im Arenastein.
*/

import type { Spielkarte, Spielzustand } from '../engine'
import { farbeCssKlasse } from '../kartenfarben'

interface WaldtanzTischkarteProps {
  zustand: Spielzustand
}

function kartenSymbol(karte: Spielkarte): string {
  if (karte.typ !== 'Farbkarte') return '✨'
  switch (karte.farbe) {
    case 'Blau': return '💧'
    case 'Rot': return '🔥'
    case 'Gelb': return '☀️'
    case 'Violett': return '🌙'
    case 'Braun': return '🌰'
    case 'Grün': return '🌿'
  }
}

function kartenTypLabel(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte' ? `Farbkarte ${karte.farbe}` : `Sonderkarte ${karte.name}`
}

function kartenWertLabel(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte' ? `${karte.punkte} Punkte` : 'Sonderaktion'
}

function kartenKlasse(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte'
    ? `waldtanz-tischkarte__karte waldtanz-tischkarte__karte--farbkarte schlangekarte__karte--farbe-${farbeCssKlasse(karte.farbe)}`
    : 'waldtanz-tischkarte__karte waldtanz-tischkarte__karte--sonderkarte'
}

export default function WaldtanzTischkarte({ zustand }: WaldtanzTischkarteProps) {
  const anzahl = zustand.ablagestapel.length
  const letzteKarte = zustand.ablagestapel[anzahl - 1] ?? null
  const darunterKarte = zustand.ablagestapel[anzahl - 2] ?? null

  return (
    <section className="waldtanz-tischkarte" aria-label="Waldtanz-Tischkarte">
      <div className="waldtanz-tischkarte__kopf">
        <span className="waldtanz-tischkarte__badge">Waldkreis</span>
        <h4>Tischkarte im Waldkreis</h4>
      </div>
      {letzteKarte ? (
        <article className={kartenKlasse(letzteKarte)} aria-label={`Zuletzt ausgespielte Tischkarte ${letzteKarte.id}`}>
          <span className="waldtanz-tischkarte__label">Zuletzt ausgespielt</span>
          <span className="waldtanz-tischkarte__symbol" aria-hidden="true">{kartenSymbol(letzteKarte)}</span>
          <strong>{letzteKarte.id}</strong>
          <span className="waldtanz-tischkarte__typ">{kartenTypLabel(letzteKarte)}</span>
          <span className="waldtanz-tischkarte__wert">{kartenWertLabel(letzteKarte)}</span>
        </article>
      ) : (
        <div className="waldtanz-tischkarte__leer">
          <strong>Noch keine Tischkarte</strong>
          <p>Die nächste ausgespielte Sonder- oder Abwurfkarte landet hier im Blickfeld.</p>
        </div>
      )}
      {darunterKarte && <p className="waldtanz-tischkarte__darunter">Darunter wartet {darunterKarte.id}</p>}
    </section>
  )
}
