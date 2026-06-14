/*
Author: rahn
Datum: 14.06.2026
Version: 1.0
Beschreibung: Board-naher Verdoppler-Bonuszauber fuer globale Sonderkartenaktionen im Waldtanz-Spieltisch.
*/
import type { SpielAktion } from '../engine'

interface WaldtanzBonuszauberProps {
  aktionen: Extract<SpielAktion, { typ: 'VerdopplerSpielen' }>[]
  ausgewaehlteHandkarteId: string | null
  onAktion: (aktion: SpielAktion) => void
}

export default function WaldtanzBonuszauber({ aktionen, ausgewaehlteHandkarteId, onAktion }: WaldtanzBonuszauberProps) {
  const aktion = ausgewaehlteHandkarteId
    ? aktionen.find((eintrag) => eintrag.handkartenId === ausgewaehlteHandkarteId) ?? null
    : null

  if (!aktion) return null

  return (
    <section className="waldtanz-bonuszauber" aria-label="Waldtanz-Bonuszauber">
      <div className="waldtanz-bonuszauber__kopf">
        <strong>Verdoppler-Zauber bereit</strong>
        <span className="waldtanz-bonuszauber__karte">{aktion.handkartenId}</span>
      </div>
      <p>Eine Extra-Karte für diesen Zug freischalten.</p>
      <button
        type="button"
        className="waldtanz-bonuszauber__button"
        aria-label={`Verdoppler-Bonuszauber mit Karte ${aktion.handkartenId} aktivieren`}
        onClick={() => onAktion(aktion)}
      >
        <span aria-hidden="true">Bonuszauber zünden</span>
        <span aria-hidden="true">+1 Karte</span>
      </button>
    </section>
  )
}
