/*
 * Author: rahn
 * Datum: 25.06.2026
 * Version: 1.0
 * Beschreibung: M1dk — Sichtbarer Brettrand-Beschilderungs-Banner fuer die
 *              4 Spielphasen (Nachziehphase, Ausspielphase, Aufgabenpruefung,
 *              Zugabschluss) als Google-Stitch-Pillen-Reihe.
 *              Macht jederzeit sichtbar, in welcher Phase der Spieler sich
 *              befindet — nicht nur ueber den kleinen aktiven Tanz-Schritt.
 *              Engine-Logik bleibt unveraendert; nur Presentation.
 */
import type { Spielzustand } from '../engine'

export interface WaldtanzPhasenBannerProps {
  zugphase: Spielzustand['zugphase']
  istSpielende: boolean
}

interface PhasenEintrag {
  schluessel: Spielzustand['zugphase']
  label: string
  position: number
}

const PHASEN: PhasenEintrag[] = [
  { schluessel: 'Nachziehphase', label: 'Nachziehphase', position: 1 },
  { schluessel: 'Ausspielphase', label: 'Ausspielphase', position: 2 },
  { schluessel: 'Aufgabenpruefung', label: 'Aufgabenprüfung', position: 3 },
  { schluessel: 'Zugabschluss', label: 'Zugabschluss', position: 4 },
]

function phaseKlasse(schluessel: Spielzustand['zugphase'], aktuellePhase: Spielzustand['zugphase'], istSpielende: boolean): string {
  const basis = 'waldtanz-phasen-banner__phase'
  if (istSpielende || schluessel === 'Spielende') return `${basis} ${basis}--abgeschlossen`
  const aktuellePosition = PHASEN.findIndex((phase) => phase.schluessel === aktuellePhase)
  const meinePosition = PHASEN.findIndex((phase) => phase.schluessel === schluessel)
  if (aktuellePosition === -1 || meinePosition === -1) return `${basis} ${basis}--wartend`
  if (meinePosition === aktuellePosition) return `${basis} ${basis}--aktiv`
  if (meinePosition < aktuellePosition) return `${basis} ${basis}--abgeschlossen`
  return `${basis} ${basis}--wartend`
}

function phasenStatusIcon(schluessel: Spielzustand['zugphase'], aktuellePhase: Spielzustand['zugphase'], istSpielende: boolean): string {
  if (istSpielende) return '✓'
  const aktuellePosition = PHASEN.findIndex((phase) => phase.schluessel === aktuellePhase)
  const meinePosition = PHASEN.findIndex((phase) => phase.schluessel === schluessel)
  if (aktuellePosition === -1 || meinePosition === -1) return '·'
  if (meinePosition === aktuellePosition) return '▶'
  if (meinePosition < aktuellePosition) return '✓'
  return '·'
}

export default function WaldtanzPhasenBanner({ zugphase, istSpielende }: WaldtanzPhasenBannerProps) {
  return (
    <div className="waldtanz-phasen-banner" role="navigation" aria-label="Waldtanz-Spielphasen">
      <ol className="waldtanz-phasen-banner__liste" aria-label="Aktuelle und naechste Spielphasen">
        {PHASEN.map((phase) => (
          <li
            key={phase.schluessel}
            className={phaseKlasse(phase.schluessel, zugphase, istSpielende)}
            aria-current={phase.schluessel === zugphase && !istSpielende ? 'step' : undefined}
          >
            <span className="waldtanz-phasen-banner__phase-nummer" aria-hidden="true">{phase.position}</span>
            <span className="waldtanz-phasen-banner__phase-status" aria-hidden="true">
              {phasenStatusIcon(phase.schluessel, zugphase, istSpielende)}
            </span>
            <span className="waldtanz-phasen-banner__phase-label">{phase.label}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}