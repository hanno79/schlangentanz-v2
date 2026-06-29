/**
 * Author: Hermes (autonomer Cron-Lauf, Job-ID `0cca22d2b825`)
 * Datum: 29.06.2026
 * Version: 1.0
 * Beschreibung: M6b — Waldtisch-Holzplakette als Forest-Welcome-Banner.
 *              Prominente Stitch-Forest-Holzplakette mit aktivem Spielername +
 *              Phase-Pille + Zugzaehler-Chip + Lebens-Pulse-Dot.
 *              Sichtbar im Schlangenlichtung-Kopf auf /game, kein Engine-Touch.
 */

import type { Zugphase } from '../engine'

interface WaldtanzWaldtischHolzplaketteProps {
  spielerName: string
  zugphase: Zugphase
  gespielteKarten: number
  handkarten: number
  eigeneSchlangen: number
  istGameRoute: boolean
}

function phaseLabel(zugphase: Zugphase): string {
  switch (zugphase) {
    case 'Ausspielphase': return 'Ausspielphase'
    case 'Aufgabenpruefung': return 'Aufgabenpruefung'
    case 'Nachziehphase': return 'Nachziehphase'
    case 'Zugabschluss': return 'Zugabschluss'
    case 'Spielende': return 'Spielende'
  }
}

function phaseKurzLabel(zugphase: Zugphase): string {
  switch (zugphase) {
    case 'Ausspielphase': return 'Ausspielen'
    case 'Aufgabenpruefung': return 'Pruefen'
    case 'Nachziehphase': return 'Nachziehen'
    case 'Zugabschluss': return 'Abschluss'
    case 'Spielende': return 'Ende'
  }
}

export default function WaldtanzWaldtischHolzplakette({
  spielerName,
  zugphase,
  gespielteKarten,
  handkarten,
  eigeneSchlangen,
  istGameRoute,
}: WaldtanzWaldtischHolzplaketteProps) {
  if (!istGameRoute) return null
  const ariaLabel = `Aktiver Wald von ${spielerName}, Phase ${phaseLabel(zugphase)}, ${gespielteKarten} Karten gespielt, ${handkarten} auf der Hand, ${eigeneSchlangen} eigene Schlangen`
  return (
    <aside
      className="waldtanz-waldtisch-plakette"
      aria-label={ariaLabel}
      data-waldtisch-plakette="aktiv"
    >
      <span className="waldtanz-waldtisch-plakette__herz" aria-hidden="true" />
      <strong className="waldtanz-waldtisch-plakette__name">{spielerName}s Wald heute</strong>
      <span className="waldtanz-waldtisch-plakette__phase-pille" aria-label={`Phase ${phaseLabel(zugphase)}`}>
        {phaseKurzLabel(zugphase)}
      </span>
      <span className="waldtanz-waldtisch-plakette__zaehler" aria-label={`${handkarten} Karten auf der Hand`}>
        {handkarten}✋ · {gespielteKarten}✓
      </span>
    </aside>
  )
}
