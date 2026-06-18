/*
Author: rahn
Datum: 15.06.2026
Version: 1.0
Beschreibung: Greifbare Waldtanz-Mini-Spielkarte für Karten in Schlangenpfaden.
*/
import type { ReactNode } from 'react'
import type { Farbe, Spielkarte } from '../engine'
import { farbeCssKlasse } from '../kartenfarben'

interface SchlangenPfadKarteProps {
  karte: Spielkarte
  istKopf: boolean
  istSchwanz: boolean
  regenbogenWildfarbe?: Farbe
  className?: string
  children?: ReactNode
}

function karteSymbol(karte: Spielkarte): string {
  if (karte.typ === 'Sonderkarte' && karte.name === 'Regenbogenschlange') return '🌈'
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

function kartenWertLabel(karte: Spielkarte, regenbogenWildfarbe?: Farbe): string {
  if (karte.typ === 'Sonderkarte' && karte.name === 'Regenbogenschlange' && regenbogenWildfarbe) {
    return `0 Punkte · verbindet ${regenbogenWildfarbe}`
  }
  return karte.typ === 'Farbkarte' ? `${karte.punkte} Punkte` : 'Sonderaktion'
}

function schlangenKartenAriaLabel(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte'
    ? `Farbkarte ${karte.id}: ${karte.farbe} mit ${karte.punkte} Punkten`
    : `Sonderkarte ${karte.id}: ${karte.name}`
}

export default function SchlangenPfadKarte({ karte, istKopf, istSchwanz, regenbogenWildfarbe, className = '', children }: SchlangenPfadKarteProps) {
  const pfadKlasse = `${istKopf ? ' schlangekarte__karte--kopf' : ''}${istSchwanz ? ' schlangekarte__karte--schwanz' : ''}${!istKopf && !istSchwanz ? ' schlangekarte__karte--koerper' : ''}`
  const typKlasse = karte.typ === 'Farbkarte'
    ? `schlangekarte__karte--farbkarte schlangekarte__karte--farbe-${farbeCssKlasse(karte.farbe)}`
    : 'schlangekarte__karte--sonderkarte'
  const istRegenbogenWildkarte = karte.typ === 'Sonderkarte' && karte.name === 'Regenbogenschlange' && Boolean(regenbogenWildfarbe)
  const regenbogenKlasse = istRegenbogenWildkarte ? ' schlangekarte__karte--regenbogenpfad' : ''

  return (
    <div
      className={`schlangekarte__karte schlangekarte__karte--spielkarte${pfadKlasse} ${typKlasse}${regenbogenKlasse}${className}`}
      role="listitem"
      aria-label={schlangenKartenAriaLabel(karte)}
    >
      <span className="schlangekarte__karte-eyebrow">Schlangenkarte</span>
      <span className="schlangekarte__karte-symbol" aria-hidden="true">{karteSymbol(karte)}</span>
      <strong>{karte.id}</strong>
      {istKopf && istSchwanz ? <span className="schlangekarte__pfadmarke">Kopf & Schwanz</span> : null}
      {istKopf && !istSchwanz ? <span className="schlangekarte__pfadmarke">Kopf</span> : null}
      {istSchwanz && !istKopf ? <span className="schlangekarte__pfadmarke">Schwanz</span> : null}
      <span className="schlangekarte__karte-typ">{kartenTypLabel(karte)}</span>
      {istRegenbogenWildkarte ? <span className="regenbogenpfad-chip">Wildfarbe {regenbogenWildfarbe}</span> : null}
      <span className="schlangekarte__karte-wert">{kartenWertLabel(karte, regenbogenWildfarbe)}</span>
      {istRegenbogenWildkarte ? <span className="regenbogenpfad-hinweis">Farbgruppen-Joker</span> : null}
      {children}
    </div>
  )
}
