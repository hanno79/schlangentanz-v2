/*
Author: rahn
Datum: 04.06.2026
Version: 1.1
Beschreibung: Gemeinsame Test-Helfer für UI-Aktionsnamen und F36-Drag-Drop-Setup in Schlangentanz v2.
*/

import { screen, within } from '@testing-library/react'
import type { SpielAktion } from './engine'
import { erstelleSpielzustand, ermittleLegaleAktionen, starteAusspielphase } from './engine'

export function aktionsName(button: HTMLElement): string {
  return button.getAttribute('aria-label') ?? button.textContent?.trim() ?? ''
}

export function erstelleDataTransfer() {
  const daten: Record<string, string> = {}

  return {
    dropEffect: 'move',
    effectAllowed: 'move',
    setData: (typ: string, wert: string) => {
      daten[typ] = wert
    },
    getData: (typ: string) => daten[typ] ?? '',
  } as unknown as DataTransfer
}

export function erstelleSpieltischMitEineSchlange(schlangenId = 'schlange-spieler-1-f36') {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const [startkarte] = zustand.spieler[0].hand

  zustand.spieler[0].schlangen = [
    { id: schlangenId, zustand: 'aktiv', karten: [startkarte] },
  ]

  const legaleKarteAnlegen = ermittleLegaleAktionen(zustand).find(
    (aktion): aktion is Extract<SpielAktion, { typ: 'KarteAnlegen' }> => {
      if (aktion.typ !== 'KarteAnlegen') {
        return false
      }

      return aktion.handkartenId !== startkarte.id
    },
  )
  if (!legaleKarteAnlegen) {
    throw new Error('Testsetup erwartet eine legale Karten-Anlegeaktion.')
  }

  return { zustand, startkarte, anlegekarteId: legaleKarteAnlegen.handkartenId, legaleKarteAnlegen }
}

export function erstelleSpieltischOhneEigeneSchlangen() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const legaleStartaktion = ermittleLegaleAktionen(zustand).find(
    (aktion): aktion is Extract<SpielAktion, { typ: 'NeueSchlangeStarten' }> => aktion.typ === 'NeueSchlangeStarten',
  )

  if (!legaleStartaktion) {
    throw new Error('Testsetup erwartet eine legale Startaktion für eine neue Schlange.')
  }

  return { zustand, legaleStartaktion }
}

export function ermittleSpielbereiche() {
  const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })

  return {
    spieltisch,
    handBereich: within(spieltisch).getByRole('region', { name: 'Handkarten' }),
    schlangenbereich: within(spieltisch).getByRole('region', { name: 'Schlangenbereich' }),
  }
}
