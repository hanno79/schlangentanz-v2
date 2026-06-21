/*
Author: rahn
Datum: 21.06.2026
Version: 1.0
Beschreibung: Pulsierender "Aktiver Tanz-Schritt"-Pill auf dem Waldtanz-Arenenstein
zwischen Brettschritt-Stempel-Reihe und Schlangenlichtung. Macht den aktiven
Spieler, die aktuelle Phase und den naechsten Pflichtschritt sichtbar, in der
Farbe des aktiven Spielers. Reine Presentation; keine Engine-Logik.
*/

import type { Spielzustand } from '../engine'

export interface AktiverTanzSchrittDaten {
  aktiverSpielerName: string
  istMensch: boolean
  spielerIndex: number
  phase: Spielzustand['zugphase']
  naechsterSchritt: string
  ueberhand: number
  istSpielende: boolean
  kiZugLaeuft: boolean
}

interface WaldtanzAktiverTanzSchrittProps {
  daten: AktiverTanzSchrittDaten | null
  istSichtbar: boolean
}

function phaseLabel(phase: Spielzustand['zugphase']): string {
  switch (phase) {
    case 'Nachziehphase': return 'Nachziehphase'
    case 'Ausspielphase': return 'Ausspielphase'
    case 'Aufgabenpruefung': return 'Aufgabenprüfung'
    case 'Zugabschluss': return 'Zugabschluss'
    case 'Spielende': return 'Spielende'
  }

  const nichtErfasstePhase: never = phase
  return nichtErfasstePhase
}

function tanzSchrittLabel(daten: AktiverTanzSchrittDaten): string {
  if (daten.istSpielende) return 'Spiel beendet — Sieger-Party läuft.'
  if (daten.kiZugLaeuft) return `${daten.aktiverSpielerName} denkt nach.`
  if (daten.ueberhand > 0) return `${daten.aktiverSpielerName} muss ${daten.ueberhand === 1 ? 'eine Karte' : `${daten.ueberhand} Karten`} abwerfen.`
  return `${daten.aktiverSpielerName} ist am Zug.`
}

function tanzSchrittKlasse(daten: AktiverTanzSchrittDaten): string {
  const basis = `waldtanz-aktiver-tanz-schritt waldtanz-aktiver-tanz-schritt--spieler-${daten.spielerIndex % 4}`
  if (daten.istSpielende) return `${basis} waldtanz-aktiver-tanz-schritt--spielende`
  if (daten.kiZugLaeuft) return `${basis} waldtanz-aktiver-tanz-schritt--ki`
  if (daten.ueberhand > 0) return `${basis} waldtanz-aktiver-tanz-schritt--abwurf`
  if (daten.istMensch) return `${basis} waldtanz-aktiver-tanz-schritt--mensch`
  return `${basis} waldtanz-aktiver-tanz-schritt--ki`
}

export default function WaldtanzAktiverTanzSchritt({ daten, istSichtbar }: WaldtanzAktiverTanzSchrittProps) {
  if (!istSichtbar || !daten) return null

  return (
    <div
      className={tanzSchrittKlasse(daten)}
      role="group"
      aria-label="Aktiver Tanz-Schritt"
    >
      <span className="waldtanz-aktiver-tanz-schritt__streif" aria-hidden="true" />
      <span className="waldtanz-aktiver-tanz-schritt__phase" aria-label={`Aktuelle Phase ${phaseLabel(daten.phase)}`}>
        {phaseLabel(daten.phase)}
      </span>
      <strong className="waldtanz-aktiver-tanz-schritt__text">
        {tanzSchrittLabel(daten)}
      </strong>
      <span className="waldtanz-aktiver-tanz-schritt__pflicht" aria-label={`Nächster Pflichtschritt: ${daten.naechsterSchritt}`}>
        {daten.naechsterSchritt}
      </span>
    </div>
  )
}