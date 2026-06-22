/*
Author: rahn
Datum: 22.06.2026
Version: 1.2
Beschreibung: Sichtbare Brettschritt-Stempel der letzten drei Ablagekarten auf
dem Waldtanz-Arenenstein. M1cu erweitert den Stempel um einen
Spieler-Farbstreifen (welcher Spieler hat die Karte gespielt) und einen
kompakten Phasen-Badge (in welcher Phase wurde die Karte abgelegt). M1cw
ergaenzt eine zweite Zeile mit der Aktions-Konsequenz (was die Handlung
bewirkt hat), damit die Spielerin pro Stempel nachvollziehen kann, welche
Aktion die Karte auf den Ablagestapel gebracht hat. Die client-seitig gepflegte
`brettschrittEintraege`-Liste synchronisiert sich beim Wachsen des
ablagestapel mit der Spieler-/Phasen-/Konsequenz-Zuordnung.
*/

import type { Spielkarte, Spielzustand } from '../engine'
import { farbeCssKlasse } from '../kartenfarben'

export interface BrettschrittEintrag {
  karteId: string
  spielerId: string
  spielerIndex: number
  phase: string
  konsequenz?: string
}

interface WaldtanzBrettschrittStempelProps {
  zustand: Spielzustand
  eintraege?: BrettschrittEintrag[]
}

function phaseBadgeLabel(phase: string): string {
  switch (phase) {
    case 'Ausspielphase': return 'Ausspiel'
    case 'Aufgabenpruefung': return 'Aufgaben'
    case 'Zugabschluss': return 'Zugende'
    case 'Nachziehphase': return 'Ziehen'
    case 'Spielende': return 'Ende'
    case 'Reaktion': return 'Reaktion'
    default: return phase
  }
}

function kartenStempelLabel(karte: Spielkarte): string {
  if (karte.typ === 'Farbkarte') {
    return `${karte.id} · ${karte.farbe} · ${karte.punkte}`
  }
  return `${karte.id} · ${karte.name}`
}

function stempelKlasse(karte: Spielkarte, index: number, anzahl: number, spielerIndex: number): string {
  const basis = `brettschritt-stempel brettschritt-stempel--${karte.typ === 'Farbkarte' ? 'farbkarte' : 'sonderkarte'}`
  const rollenSuffix = index === anzahl - 1 ? ' brettschritt-stempel--aktuell' : ' brettschritt-stempel--vergangen'
  const spielerSuffix = ` brettschritt-stempel--spieler-${spielerIndex % 4}`
  const farbSuffix = karte.typ === 'Farbkarte' ? ` schlangekarte__karte--farbe-${farbeCssKlasse(karte.farbe)}` : ''
  return `${basis}${rollenSuffix}${spielerSuffix}${farbSuffix}`
}

function findeEintrag(karteId: string, eintraege: BrettschrittEintrag[]): BrettschrittEintrag | null {
  return eintraege.find((eintrag) => eintrag.karteId === karteId) ?? null
}

export default function WaldtanzBrettschrittStempel({ zustand, eintraege = [] }: WaldtanzBrettschrittStempelProps) {
  const letzteDrei = zustand.ablagestapel.slice(-3)
  if (letzteDrei.length === 0) return null

  return (
    <div className="waldtanz-arenastein__stempel" role="group" aria-label="Brettschritt-Stempel der letzten Ablage">
      <ol className="brettschritt-stempel-reihe" aria-label="Brettschritt-Stempel">
        {letzteDrei.map((karte, index) => {
          const eintrag = findeEintrag(karte.id, eintraege)
          const spielerIndex = eintrag?.spielerIndex ?? 0
          const phaseBadge = eintrag ? phaseBadgeLabel(eintrag.phase) : '?'
          const konsequenzText = eintrag?.konsequenz?.trim() ?? ''
          const konsequenzLabel = konsequenzText ? ` · Konsequenz: ${konsequenzText}` : ''
          return (
            <li key={karte.id} className={stempelKlasse(karte, index, letzteDrei.length, spielerIndex)} aria-label={`Brettschritt-Stempel ${kartenStempelLabel(karte)} · ${phaseBadge}${konsequenzLabel}`}>
              <span className="brettschritt-stempel__rolle" aria-hidden="true">{index === letzteDrei.length - 1 ? 'aktuell' : 'vergangen'}</span>
              <span className="brettschritt-stempel__phase" aria-hidden="true">{phaseBadge}</span>
              <strong className="brettschritt-stempel__id">{karte.id}</strong>
              <span className="brettschritt-stempel__label">{kartenStempelLabel(karte)}</span>
              {konsequenzText && (
                <span className="brettschritt-stempel__konsequenz">{konsequenzText}</span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}