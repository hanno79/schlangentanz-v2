/*
Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Gemeinsame spielerfreundliche Labels für interne Zugphasenwerte.
*/

import type { Zugphase } from './engine'

export function zugphaseLabel(phase: Zugphase): string {
  switch (phase) {
    case 'Nachziehphase':
      return 'Karte ziehen'
    case 'Ausspielphase':
      return 'Karten ausspielen'
    case 'Aufgabenpruefung':
      return 'Aufgaben prüfen'
    case 'Zugabschluss':
      return 'Zug abschließen'
    case 'Spielende':
      return 'Spiel beendet'
  }
}
