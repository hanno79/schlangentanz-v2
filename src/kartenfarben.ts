/*
Author: rahn
Datum: 12.06.2026
Version: 1.0
Beschreibung: Gemeinsame CSS-Klassenabbildung für sichtbare Farbkartenflächen.
# ÄNDERUNG 12.06.2026: R177 führt farbspezifische Kartenflächen für Hand und Schlangen ein.
*/
import type { Farbe } from './engine/types'

export function farbeCssKlasse(farbe: Farbe): string {
  switch (farbe) {
    case 'Blau':
      return 'blau'
    case 'Rot':
      return 'rot'
    case 'Gelb':
      return 'gelb'
    case 'Violett':
      return 'violett'
    case 'Braun':
      return 'braun'
    case 'Grün':
      return 'gruen'
  }
}
