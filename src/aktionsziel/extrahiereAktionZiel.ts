/*
Author: rahn
Datum: 23.06.2026
Version: 1.0
Beschreibung: M1dc leitet aus jeder ausgefuehrten SpielAktion das sichtbare
Brettziel ab. Reine Phasenwechsel und Pflicht-Abwurf ergeben null (kein
Spielmoment-Puls). KarteAnlegen und Sonderkarten mit Brettziel ergeben
das passende Schlange-Objekt; NeueSchlangeStarten die Startzone.
*/

import type { SpielAktion } from '../engine'

export type LetzteAktionZiel = { typ: 'startzone' } | { typ: 'schlange'; id: string }

export function extrahiereAktionZiel(aktion: SpielAktion): LetzteAktionZiel | null {
  switch (aktion.typ) {
    case 'NeueSchlangeStarten':
      return { typ: 'startzone' }
    case 'KarteAnlegen':
      return { typ: 'schlange', id: aktion.schlangenId }
    case 'SchlangenblockadeSpielen':
      return { typ: 'schlange', id: aktion.zielSchlangenId }
    case 'FarbenschutzSpielen':
      return { typ: 'schlange', id: aktion.zielSchlangenId }
    case 'FarbenfusionSpielen':
      return { typ: 'schlange', id: aktion.zielSchlangenId }
    case 'SchlangenfrassSpielen': {
      const erstesZiel = aktion.ziele[0]
      return erstesZiel ? { typ: 'schlange', id: erstesZiel.schlangenId } : null
    }
    case 'SchlangenhaeutungSpielen':
      return { typ: 'schlange', id: aktion.schlangenId }
    case 'FarbendiebSpielen':
      return { typ: 'schlange', id: aktion.zielSchlangenId }
    default:
      return null
  }
}