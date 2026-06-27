/*
Author: rahn
Datum: 15.06.2026
Version: 1.0
Beschreibung: Greifbare Waldtanz-Mini-Spielkarte für Karten in Schlangenpfaden.
# ÄNDERUNG 27.06.2026: M1dt macht eigene Schlangen zu lebendigen Stitch-Würmern
(Augen + Mund am Kopf, curl-Border-Radius am Schwanz, optional Solo-Markierung).
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
  // M1dt: Wenn true und es ist der Kopf (kein Solo), zeige Stitch-Schlangen-Augen + Mund.
  // Solo-Karten (1 Karte) tragen Kopf & Schwanz und bekommen kein Gesicht, nur curl.
  zeigeKopfGesicht?: boolean
  // M1dt: Wenn true, bekommt die Schwanz-Karte die curl-Klasse (asymmetrisches Border-Radius).
  zeigeSchwanzCurl?: boolean
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

export default function SchlangenPfadKarte({ karte, istKopf, istSchwanz, regenbogenWildfarbe, className = '', children, zeigeKopfGesicht = false, zeigeSchwanzCurl = false }: SchlangenPfadKarteProps) {
  const istSolo = istKopf && istSchwanz
  const pfadKlasse = `${istKopf ? ' schlangekarte__karte--kopf' : ''}${istSchwanz ? ' schlangekarte__karte--schwanz' : ''}${!istKopf && !istSchwanz ? ' schlangekarte__karte--koerper' : ''}${istSchwanz && zeigeSchwanzCurl ? ' schlangekarte__karte--schwanz-curl' : ''}`
  const typKlasse = karte.typ === 'Farbkarte'
    ? `schlangekarte__karte--farbkarte schlangekarte__karte--farbe-${farbeCssKlasse(karte.farbe)}`
    : 'schlangekarte__karte--sonderkarte'
  const istRegenbogenWildkarte = karte.typ === 'Sonderkarte' && karte.name === 'Regenbogenschlange' && Boolean(regenbogenWildfarbe)
  const regenbogenKlasse = istRegenbogenWildkarte ? ' schlangekarte__karte--regenbogenpfad' : ''
  const istEigenerKopf = istKopf && !istSolo && zeigeKopfGesicht

  return (
    <div
      className={`schlangekarte__karte schlangekarte__karte--spielkarte${pfadKlasse} ${typKlasse}${regenbogenKlasse}${className}`}
      role="listitem"
      aria-label={schlangenKartenAriaLabel(karte)}
    >
      {istEigenerKopf && (
        <span className="schlangekarte__gesicht" aria-hidden="true">
          <span data-testid="schlangekarte-auge-links" className="schlangekarte__auge schlangekarte__auge--links">
            <span className="schlangekarte__pupille" />
          </span>
          <span data-testid="schlangekarte-auge-rechts" className="schlangekarte__auge schlangekarte__auge--rechts">
            <span className="schlangekarte__pupille" />
          </span>
          <span data-testid="schlangekarte-mund" className="schlangekarte__mund" />
        </span>
      )}
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
