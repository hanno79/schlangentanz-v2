/*
Author: rahn
Datum: 15.06.2026
Version: 1.1
Beschreibung: Board-nahe Google-Stitch-Magiekreise fuer Start- und Anlegeziele in der Waldtanz-Schlangenlichtung. M1df rendert die drei Kreise als visuell runde
Drop-Steine auf einem gemeinsamen Stein-Hintergrund (waldtanz-steinkreis),
statt als horizontale Buttonliste. Engine-Regeln, Legal-Aktionen,
Aktionspfade und Aria-Labels bleiben unveraendert.
*/

import type { SpielAktion } from '../engine'

type SonderzauberAktion = Extract<SpielAktion, {
  typ: 'FarbenschutzSpielen' | 'FarbenfusionSpielen' | 'FarbendiebSpielen' | 'SchlangenfrassSpielen' | 'SchlangenblockadeSpielen' | 'SonderkarteSpielen'
}>

interface WaldtanzMagiekreiseProps {
  ausgewaehlteHandkarteId: string | null
  neueSchlangeStartenAktionen: Extract<SpielAktion, { typ: 'NeueSchlangeStarten' }>[]
  karteAnlegenAktionen: Extract<SpielAktion, { typ: 'KarteAnlegen' }>[]
  sonderzauberAktionen: SonderzauberAktion[]
  aktionsLabel: (aktion: SpielAktion) => string
  onAktion: (aktion: SpielAktion) => void
}

function pluralisiere(anzahl: number, singular: string, plural: string): string {
  return `${anzahl} ${anzahl === 1 ? singular : plural}`
}

function positionsLabel(position: Extract<SpielAktion, { typ: 'KarteAnlegen' }>['position']): string {
  return position === 'links' ? 'Linkes Ende' : 'Rechtes Ende'
}

function sonderzauberName(aktion: SonderzauberAktion): string {
  switch (aktion.typ) {
    case 'FarbenschutzSpielen':
      return 'Farbenschutz'
    case 'FarbenfusionSpielen':
      return 'Farbenfusion'
    case 'FarbendiebSpielen':
      return 'Farbendieb'
    case 'SchlangenfrassSpielen':
      return 'Schlangenfrass'
    case 'SchlangenblockadeSpielen':
      return 'Schlangenblockade'
    case 'SonderkarteSpielen':
      return 'Schlangengrube'
  }

  const nichtErfassteAktion: never = aktion
  return nichtErfassteAktion
}

function sonderzauberZiel(aktion: SonderzauberAktion): string {
  switch (aktion.typ) {
    case 'FarbenschutzSpielen':
      return aktion.zielSchlangenId
    case 'FarbenfusionSpielen':
      return aktion.zielSchlangenId
    case 'FarbendiebSpielen':
      return aktion.zielSchlangenId
    case 'SchlangenfrassSpielen':
      return aktion.ziele.map((ziel) => ziel.schlangenId).join(' + ')
    case 'SchlangenblockadeSpielen':
      return aktion.zielSchlangenId
    case 'SonderkarteSpielen':
      return aktion.zielSpielerId
  }

  const nichtErfassteAktion: never = aktion
  return nichtErfassteAktion
}

export default function WaldtanzMagiekreise({
  ausgewaehlteHandkarteId,
  neueSchlangeStartenAktionen,
  karteAnlegenAktionen,
  sonderzauberAktionen,
  aktionsLabel,
  onAktion,
}: WaldtanzMagiekreiseProps) {
  const sichtbareStartAktionen = ausgewaehlteHandkarteId ? neueSchlangeStartenAktionen.filter((aktion) => aktion.handkartenId === ausgewaehlteHandkarteId) : []
  const sichtbareAnlegeAktionen = ausgewaehlteHandkarteId ? karteAnlegenAktionen.filter((aktion) => aktion.handkartenId === ausgewaehlteHandkarteId) : []
  const sichtbareSonderzauberAktionen = ausgewaehlteHandkarteId ? sonderzauberAktionen.filter((aktion) => aktion.handkartenId === ausgewaehlteHandkarteId) : []
  const startkreisAnzahl = sichtbareStartAktionen.length
  const schlangenendeAnzahl = sichtbareAnlegeAktionen.length
  const sonderzauberAnzahl = sichtbareSonderzauberAktionen.length
  const brettwegeAnzahl = startkreisAnzahl + schlangenendeAnzahl + sonderzauberAnzahl
  const istAktiv = Boolean(ausgewaehlteHandkarteId && brettwegeAnzahl > 0)
  const statusText = istAktiv ? 'Magiekreise aktiv' : 'Magiekreise warten'
  const hilfeText = istAktiv
    ? 'Spiele die Karte direkt in einen leuchtenden Kreis der Waldlichtung.'
    : 'Wähle eine Handkarte, damit Startkreis, Schlangenenden und Sonderzauber aufleuchten.'

  return (
    <section className={`waldtanz-magiekreise waldtanz-steinkreis${istAktiv ? ' waldtanz-steinkreis--aktiv' : ' waldtanz-steinkreis--wartend'}`} aria-label="Waldtanz-Magiekreise" data-ist-ziel-aktiv={istAktiv ? 'true' : 'false'}>
      <div className="waldtanz-magiekreise__kopf">
        <span className="waldtanz-magiekreise__badge">{statusText}</span>
        <strong>{ausgewaehlteHandkarteId ? `Zielkarte: ${ausgewaehlteHandkarteId}` : 'Keine Zielkarte ausgewählt'}</strong>
        <span className="waldtanz-magiekreise__zaehler">{brettwegeAnzahl} Brettwege leuchten</span>
      </div>
      <ul className="waldtanz-magiekreise__liste waldtanz-steinkreis__liste" aria-label="Leuchtende Brettwege">
        <li
          className={`waldtanz-magiekreise__kreis waldtanz-steinkreis__kreisel${startkreisAnzahl > 0 ? ' waldtanz-magiekreise__kreis--aktiv waldtanz-steinkreis__kreisel--aktiv' : ''}`}
          aria-label={`Startkreis: ${pluralisiere(startkreisAnzahl, 'Startweg', 'Startwege')}`}
        >
          <span className="waldtanz-steinkreis__kreisel-stein" aria-hidden="true" />
          <span className="waldtanz-steinkreis__kreisel-slot" aria-hidden="true">
            <span className="waldtanz-steinkreis__kreisel-symbol" aria-hidden="true">＋</span>
            <strong>Startkreis</strong>
            <small>{pluralisiere(startkreisAnzahl, 'Startweg', 'Startwege')}</small>
          </span>
          {sichtbareStartAktionen.map((aktion) => (
            <button
              key={aktion.handkartenId}
              type="button"
              className="waldtanz-magiekreise__aktion waldtanz-magiekreise__aktion--start waldtanz-steinkreis__aktion"
              aria-label={`Magiekreis: Karte ${aktion.handkartenId} als neue Schlange starten`}
              onClick={() => onAktion(aktion)}
            >
              <span>In den Kreis legen</span>
              <strong>{aktion.handkartenId}</strong>
            </button>
          ))}
        </li>
        <li
          className={`waldtanz-magiekreise__kreis waldtanz-steinkreis__kreisel${schlangenendeAnzahl > 0 ? ' waldtanz-magiekreise__kreis--aktiv waldtanz-steinkreis__kreisel--aktiv' : ''}`}
          aria-label={`Schlangenende: ${pluralisiere(schlangenendeAnzahl, 'Anlegeweg', 'Anlegewege')}`}
        >
          <span className="waldtanz-steinkreis__kreisel-stein" aria-hidden="true" />
          <span className="waldtanz-steinkreis__kreisel-slot" aria-hidden="true">
            <span className="waldtanz-steinkreis__kreisel-symbol" aria-hidden="true">➜</span>
            <strong>Schlangenende</strong>
            <small>{pluralisiere(schlangenendeAnzahl, 'Anlegeweg', 'Anlegewege')}</small>
          </span>
          {sichtbareAnlegeAktionen.map((aktion) => (
            <button
              key={`${aktion.handkartenId}-${aktion.schlangenId}-${aktion.position}`}
              type="button"
              className="waldtanz-magiekreise__aktion waldtanz-magiekreise__aktion--anlegen waldtanz-steinkreis__aktion"
              aria-label={`Magiekreis: Karte ${aktion.handkartenId} an Schlange ${aktion.schlangenId} ${aktion.position} anlegen`}
              onClick={() => onAktion(aktion)}
            >
              <span>{positionsLabel(aktion.position)}</span>
              <strong>{aktion.handkartenId}</strong>
            </button>
          ))}
        </li>
        <li
          className={`waldtanz-magiekreise__kreis waldtanz-magiekreise__kreis--sonderzauber waldtanz-steinkreis__kreisel waldtanz-steinkreis__kreisel--sonderzauber${sonderzauberAnzahl > 0 ? ' waldtanz-magiekreise__kreis--aktiv waldtanz-steinkreis__kreisel--aktiv' : ''}`}
          aria-label={`Sonderzauber: ${pluralisiere(sonderzauberAnzahl, 'Zauberweg', 'Zauberwege')}`}
        >
          <span className="waldtanz-steinkreis__kreisel-stein" aria-hidden="true" />
          <span className="waldtanz-steinkreis__kreisel-slot" aria-hidden="true">
            <span className="waldtanz-steinkreis__kreisel-symbol" aria-hidden="true">✦</span>
            <strong>Sonderzauber</strong>
            <small>{pluralisiere(sonderzauberAnzahl, 'Zauberweg', 'Zauberwege')}</small>
          </span>
          {sichtbareSonderzauberAktionen.map((aktion) => (
            <button
              key={`${aktion.typ}-${aktionsLabel(aktion)}`}
              type="button"
              className="waldtanz-magiekreise__aktion waldtanz-magiekreise__aktion--sonderzauber waldtanz-steinkreis__aktion"
              aria-label={`Magiekreis-Sonderzauber: ${aktionsLabel(aktion)}`}
              onClick={() => onAktion(aktion)}
            >
              <span>{sonderzauberName(aktion)}</span>
              <strong>{sonderzauberZiel(aktion)}</strong>
            </button>
          ))}
        </li>
      </ul>
      <p>{hilfeText}</p>
    </section>
  )
}
