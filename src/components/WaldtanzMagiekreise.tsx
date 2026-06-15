/*
Author: rahn
Datum: 15.06.2026
Version: 1.0
Beschreibung: Board-nahe Google-Stitch-Magiekreise fuer Start- und Anlegeziele in der Waldtanz-Schlangenlichtung.
*/

import type { SpielAktion } from '../engine'

interface WaldtanzMagiekreiseProps {
  ausgewaehlteHandkarteId: string | null
  neueSchlangeStartenAktionen: Extract<SpielAktion, { typ: 'NeueSchlangeStarten' }>[]
  karteAnlegenAktionen: Extract<SpielAktion, { typ: 'KarteAnlegen' }>[]
  onAktion: (aktion: SpielAktion) => void
}

function pluralisiere(anzahl: number, singular: string, plural: string): string {
  return `${anzahl} ${anzahl === 1 ? singular : plural}`
}

function positionsLabel(position: Extract<SpielAktion, { typ: 'KarteAnlegen' }>['position']): string {
  return position === 'links' ? 'Linkes Ende' : 'Rechtes Ende'
}

export default function WaldtanzMagiekreise({
  ausgewaehlteHandkarteId,
  neueSchlangeStartenAktionen,
  karteAnlegenAktionen,
  onAktion,
}: WaldtanzMagiekreiseProps) {
  const sichtbareStartAktionen = ausgewaehlteHandkarteId ? neueSchlangeStartenAktionen.filter((aktion) => aktion.handkartenId === ausgewaehlteHandkarteId) : []
  const sichtbareAnlegeAktionen = ausgewaehlteHandkarteId ? karteAnlegenAktionen.filter((aktion) => aktion.handkartenId === ausgewaehlteHandkarteId) : []
  const startkreisAnzahl = sichtbareStartAktionen.length
  const schlangenendeAnzahl = sichtbareAnlegeAktionen.length
  const brettwegeAnzahl = startkreisAnzahl + schlangenendeAnzahl
  const istAktiv = Boolean(ausgewaehlteHandkarteId && brettwegeAnzahl > 0)
  const statusText = istAktiv ? 'Magiekreise aktiv' : 'Magiekreise warten'
  const hilfeText = istAktiv
    ? 'Spiele die Karte direkt in einen leuchtenden Kreis der Waldlichtung.'
    : 'Wähle eine Handkarte, damit Startkreis und Schlangenenden aufleuchten.'

  return (
    <section className={`waldtanz-magiekreise${istAktiv ? ' waldtanz-magiekreise--aktiv' : ''}`} aria-label="Waldtanz-Magiekreise">
      <div className="waldtanz-magiekreise__kopf">
        <span className="waldtanz-magiekreise__badge">{statusText}</span>
        <strong>{ausgewaehlteHandkarteId ? `Zielkarte: ${ausgewaehlteHandkarteId}` : 'Keine Zielkarte ausgewählt'}</strong>
        <span className="waldtanz-magiekreise__zaehler">{brettwegeAnzahl} Brettwege leuchten</span>
      </div>
      <ul className="waldtanz-magiekreise__liste" aria-label="Leuchtende Brettwege">
        <li className={`waldtanz-magiekreise__kreis${startkreisAnzahl > 0 ? ' waldtanz-magiekreise__kreis--aktiv' : ''}`} aria-label={`Startkreis: ${pluralisiere(startkreisAnzahl, 'Startweg', 'Startwege')}`}>
          <span aria-hidden="true">＋</span>
          <strong>Startkreis</strong>
          <small>{pluralisiere(startkreisAnzahl, 'Startweg', 'Startwege')}</small>
          {sichtbareStartAktionen.map((aktion) => (
            <button
              key={aktion.handkartenId}
              type="button"
              className="waldtanz-magiekreise__aktion waldtanz-magiekreise__aktion--start"
              aria-label={`Magiekreis: Karte ${aktion.handkartenId} als neue Schlange starten`}
              onClick={() => onAktion(aktion)}
            >
              <span>In den Kreis legen</span>
              <strong>{aktion.handkartenId}</strong>
            </button>
          ))}
        </li>
        <li className={`waldtanz-magiekreise__kreis${schlangenendeAnzahl > 0 ? ' waldtanz-magiekreise__kreis--aktiv' : ''}`} aria-label={`Schlangenende: ${pluralisiere(schlangenendeAnzahl, 'Anlegeweg', 'Anlegewege')}`}>
          <span aria-hidden="true">➜</span>
          <strong>Schlangenende</strong>
          <small>{pluralisiere(schlangenendeAnzahl, 'Anlegeweg', 'Anlegewege')}</small>
          {sichtbareAnlegeAktionen.map((aktion) => (
            <button
              key={`${aktion.handkartenId}-${aktion.schlangenId}-${aktion.position}`}
              type="button"
              className="waldtanz-magiekreise__aktion waldtanz-magiekreise__aktion--anlegen"
              aria-label={`Magiekreis: Karte ${aktion.handkartenId} an Schlange ${aktion.schlangenId} ${aktion.position} anlegen`}
              onClick={() => onAktion(aktion)}
            >
              <span>{positionsLabel(aktion.position)}</span>
              <strong>{aktion.handkartenId}</strong>
            </button>
          ))}
        </li>
      </ul>
      <p>{hilfeText}</p>
    </section>
  )
}
