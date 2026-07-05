/*
Author: rahn
Datum: 05.07.2026
Version: 1.0
Beschreibung: Zentrale Factory für die data-zielspur-key-Strings. Ein einziger Ort
              erzeugt die Schlüssel für Brett-Ziele (Anker) UND für die Sprung-Links
              (Handbühne/Spielmoment). Ohne diese Factory divergierten die Formate
              (Audit-Fund: Schlangenblockade/Farbendieb-Sprünge sprangen ins Leere,
              weil dem Link die zielSpielerId fehlte).
*/

export const STARTKREIS_KEY = 'startkreis'

export function frassKey(spielerId: string, schlangenId: string, kartenId: string): string {
  return `frass:${spielerId}:${schlangenId}:${kartenId}`
}

export function schutzKey(schlangenId: string): string {
  return `schutz:${schlangenId}`
}

export function fusionKey(schlangenId: string, kartenId: string): string {
  return `fusion:${schlangenId}:${kartenId}`
}

export function blockadeKey(zielSpielerId: string, zielSchlangenId: string): string {
  return `blockade:${zielSpielerId}:${zielSchlangenId}`
}

export function diebKey(zielSpielerId: string, zielSchlangenId: string, zielKartenId: string): string {
  return `dieb:${zielSpielerId}:${zielSchlangenId}:${zielKartenId}`
}

export function anlegenKey(schlangenId: string, position: string): string {
  return `anlegen:${schlangenId}:${position}`
}

export function haeutungKey(spielerId: string, schlangenId: string): string {
  return `haeutung:${spielerId}:${schlangenId}`
}
