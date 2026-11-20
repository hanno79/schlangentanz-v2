import type { Spielzustand } from '../engine'

/** Ein Spieler am Tisch mit Name und Id, wie Lage, Gruben und Ereignisse ihn nennen. */
export function name(zustand: Spielzustand, index: number | null): string {
  if (index === null) return 'niemand'
  const spieler = zustand.spieler[index]
  return spieler === undefined ? `unbekannter Spieler ${index}` : `${spieler.name} (${spieler.id})`
}
