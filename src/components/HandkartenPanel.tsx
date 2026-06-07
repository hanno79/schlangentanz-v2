/*
Author: rahn
Datum: 05.06.2026
Version: 1.1
Beschreibung: Spieltisch-Panel für die Handkarten des aktiven Spielers mit auswählbarer Detailkarte.
# ÄNDERUNG 07.06.2026: R110 erzeugt die Detail-Titel-ID komponentenlokal per useId(),
# damit mehrfach gerenderte Panels keine doppelten DOM-IDs erzeugen.
*/

import { useId } from 'react'
import type { Spielkarte } from '../engine/types'

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

export default function HandkartenPanel({
  handkarten,
  ausgewaehlteHandkarte,
  onKarteWaehlen,
  onKarteDragStart,
  onKarteDragEnd,
}: HandkartenPanelProps) {
  const detailTitelId = useId()

  return (
    <section className="handkarten-panel" aria-label="Handkarten">
      <h4>Handkarten als Kartenleiste</h4>
      {ausgewaehlteHandkarte ? (
        <section className="handkarten-detail" aria-labelledby={detailTitelId}>
          <h5 className="handkarten-detail__titel" id={detailTitelId}>
            Ausgewählte Handkarte: {ausgewaehlteHandkarte.id}
          </h5>
          <p>{karteKurzLabel(ausgewaehlteHandkarte)}</p>
          <p>Klicke dieselbe Karte erneut, um sie wieder abzuwählen.</p>
        </section>
      ) : (
        <p className="handkarten-status">Keine Handkarte ausgewählt.</p>
      )}
      <ul className="handkartenleiste">
        {handkarten.map((karte) => {
          const istFarbkarte = karte.typ === 'Farbkarte'
          const istAusgewaehlt = ausgewaehlteHandkarte?.id === karte.id

          return (
            <li
              key={karte.id}
              className={`handkarte handkarte--${istFarbkarte ? 'farbkarte' : 'sonderkarte'}${istAusgewaehlt ? ' handkarte--ausgewaehlt' : ''}`}
            >
              <button
                type="button"
                className="handkarte__button"
                draggable="true"
                aria-pressed={istAusgewaehlt}
                onClick={() => onKarteWaehlen(karte.id)}
                onDragStart={(event) => {
                  event.dataTransfer.setData('text/plain', karte.id)
                  event.dataTransfer.effectAllowed = 'move'
                  onKarteDragStart(karte.id)
                }}
                onDragEnd={onKarteDragEnd}
              >
                <strong>{karte.id}</strong>
                <span>{istFarbkarte ? `Farbkarte ${karte.farbe}` : `Sonderkarte ${karte.name}`}</span>
                <span>{istFarbkarte ? `${karte.punkte} Punkte` : 'Sonderaktion'}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
