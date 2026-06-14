/*
Author: rahn
Datum: 05.06.2026
Version: 1.1
Beschreibung: Spieltisch-Panel für die Handkarten des aktiven Spielers mit auswählbarer Detailkarte.
# ÄNDERUNG 07.06.2026: R110 erzeugt die Detail-Titel-ID komponentenlokal per useId(),
# damit mehrfach gerenderte Panels keine doppelten DOM-IDs erzeugen.
# ÄNDERUNG 07.06.2026: R159 entfernt das separate aria-label und benennt das Panel über sichtbaren Handkarten-Text.
# ÄNDERUNG 12.06.2026: R177 ergänzt farbspezifische Klassen für echte Kartenflächen statt generischer Klickkarten.
*/

import { useId } from 'react'
import type { Spielkarte } from '../engine/types'
import { farbeCssKlasse } from '../kartenfarben'

interface HandkartenPanelProps {
  handkarten: Spielkarte[]
  ausgewaehlteHandkarte: Spielkarte | null
  onKarteWaehlen: (karteId: string) => void
  onKarteDragStart: (karteId: string) => void
  onKarteDragEnd: () => void
}

function karteKurzLabel(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte'
    ? `Farbkarte ${karte.farbe} · ${karte.punkte} Punkte`
    : `Sonderkarte ${karte.name} · Sonderaktion`
}

function karteSymbol(karte: Spielkarte): string {
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

function karteFarbklasse(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte' ? ` handkarten-preview--farbe-${farbeCssKlasse(karte.farbe)}` : ' handkarten-preview--sonderkarte'
}

export default function HandkartenPanel({
  handkarten,
  ausgewaehlteHandkarte,
  onKarteWaehlen,
  onKarteDragStart,
  onKarteDragEnd,
}: HandkartenPanelProps) {
  const handkartenTitelId = useId()
  const detailTitelId = useId()

  return (
    <section className="handkarten-panel" aria-labelledby={handkartenTitelId}>
      <h4><span id={handkartenTitelId}>Handkarten</span> als Kartenleiste</h4>
      {ausgewaehlteHandkarte ? (
        <section className={`handkarten-detail handkarten-preview${karteFarbklasse(ausgewaehlteHandkarte)}`} aria-labelledby={detailTitelId}>
          <article className="handkarten-preview__karte" aria-label={`Vorschau ${ausgewaehlteHandkarte.id}`}>
            <span className="handkarten-preview__eyebrow">Zugkarte bereit</span>
            <span className="handkarten-preview__symbol" aria-hidden="true">{karteSymbol(ausgewaehlteHandkarte)}</span>
            <strong>{ausgewaehlteHandkarte.id}</strong>
            <span className="handkarten-preview__typ">
              {ausgewaehlteHandkarte.typ === 'Farbkarte'
                ? `Farbkarte ${ausgewaehlteHandkarte.farbe}`
                : `Sonderkarte ${ausgewaehlteHandkarte.name}`}
            </span>
            <span className="handkarten-preview__werteplakette">
              {ausgewaehlteHandkarte.typ === 'Farbkarte' ? `${ausgewaehlteHandkarte.punkte} Punkte` : 'Sonderaktion'}
            </span>
          </article>
          <div className="handkarten-preview__text">
            <h5 className="handkarten-detail__titel" id={detailTitelId}>Ausgewählte Handkarte: {ausgewaehlteHandkarte.id}</h5>
            <p className="handkarten-preview__headline">Aktuelle Karte am Waldtanz-Tisch</p>
            <p>{karteKurzLabel(ausgewaehlteHandkarte)}</p>
            <p>Ausgewählte Karte schwebt über dem Fächer.</p>
            <p>Ziehe sie auf eine leuchtende Brettzone oder klicke ein Ziel im Schlangenbereich.</p>
            <p>Klicke dieselbe Karte erneut, um sie wieder abzuwählen.</p>
          </div>
        </section>
      ) : (
        <p className="handkarten-status">Keine Handkarte ausgewählt.</p>
      )}
      <ul className="handkartenleiste handkartenleiste--waldtanz-faecher">
        {handkarten.map((karte) => {
          const istFarbkarte = karte.typ === 'Farbkarte'
          const istAusgewaehlt = ausgewaehlteHandkarte?.id === karte.id

          return (
            <li
              key={karte.id}
              className={`handkarte handkarte--spielkarte handkarte--${istFarbkarte ? 'farbkarte' : 'sonderkarte'}${istFarbkarte ? ` handkarte--farbe-${farbeCssKlasse(karte.farbe)}` : ''}${istAusgewaehlt ? ' handkarte--ausgewaehlt' : ''}`}
            >
              <button
                type="button"
                className="handkarte__button handkarte__button--karte"
                draggable="true"
                aria-label={`${karte.id} ${istFarbkarte ? `Farbkarte ${karte.farbe}` : `Sonderkarte ${karte.name}`} ${istFarbkarte ? `${karte.punkte} Punkte` : 'Sonderaktion'}`}
                aria-pressed={istAusgewaehlt}
                onClick={() => onKarteWaehlen(karte.id)}
                onDragStart={(event) => {
                  event.dataTransfer.setData('text/plain', karte.id)
                  event.dataTransfer.effectAllowed = 'move'
                  onKarteDragStart(karte.id)
                }}
                onDragEnd={onKarteDragEnd}
              >
                <span className="handkarte__eyebrow">Waldtanzkarte</span>
                <span className="handkarte__symbol" aria-hidden="true">{karteSymbol(karte)}</span>
                <strong>{karte.id}</strong>
                <span className="handkarte__typ">{istFarbkarte ? `Farbkarte ${karte.farbe}` : `Sonderkarte ${karte.name}`}</span>
                <span className="handkarte__farbe">{istFarbkarte ? karte.farbe : karte.name}</span>
                <span className="handkarte__punkte">{istFarbkarte ? `${karte.punkte} Punkte` : 'Sonderaktion'}</span>
                <span className="handkarte__spielhinweis">Auswählen oder ziehen</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
