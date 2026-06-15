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
}

function countNeueSchlangeStarten(
  aktionen: WaldtanzMagiekreiseProps['neueSchlangeStartenAktionen'],
  karteId: string | null,
): number {
  return karteId ? aktionen.filter((aktion) => aktion.handkartenId === karteId).length : 0
}

function countKarteAnlegen(
  aktionen: WaldtanzMagiekreiseProps['karteAnlegenAktionen'],
  karteId: string | null,
): number {
  return karteId ? aktionen.filter((aktion) => aktion.handkartenId === karteId).length : 0
}

function pluralisiere(anzahl: number, singular: string, plural: string): string {
  return `${anzahl} ${anzahl === 1 ? singular : plural}`
}

export default function WaldtanzMagiekreise({
  ausgewaehlteHandkarteId,
  neueSchlangeStartenAktionen,
  karteAnlegenAktionen,
}: WaldtanzMagiekreiseProps) {
  const startkreisAnzahl = countNeueSchlangeStarten(neueSchlangeStartenAktionen, ausgewaehlteHandkarteId)
  const schlangenendeAnzahl = countKarteAnlegen(karteAnlegenAktionen, ausgewaehlteHandkarteId)
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
        </li>
        <li className={`waldtanz-magiekreise__kreis${schlangenendeAnzahl > 0 ? ' waldtanz-magiekreise__kreis--aktiv' : ''}`} aria-label={`Schlangenende: ${pluralisiere(schlangenendeAnzahl, 'Anlegeweg', 'Anlegewege')}`}>
          <span aria-hidden="true">➜</span>
          <strong>Schlangenende</strong>
          <small>{pluralisiere(schlangenendeAnzahl, 'Anlegeweg', 'Anlegewege')}</small>
        </li>
      </ul>
      <p>{hilfeText}</p>
    </section>
  )
}
