// Geräteklasse nach Fensterbreite für den Probe-Task PROBE-1 (docs/abnahme/probe/PROBE-1.md).

export type Geraeteklasse = 'Handy' | 'Tablet' | 'Desktop'

/** Ab dieser Breite in CSS-Pixeln gilt ein Fenster als Tablet. */
export const TABLET_AB = 600
/** Bis zu dieser Breite einschliesslich gilt ein Fenster als Tablet. */
export const TABLET_BIS = 1024

export function geraeteklasseFuer(breite: number): Geraeteklasse {
  if (breite < TABLET_AB) return 'Handy'
  if (breite <= TABLET_BIS) return 'Tablet'
  return 'Desktop'
}
