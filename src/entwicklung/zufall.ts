/**
 * Reproduzierbarer Zufall aus einer Saat (Mulberry32).
 *
 * Die Engine zieht keinen eigenen Zufall (U4), sie bekommt ihn als Parameter.
 * Gleiche Saat heisst hier deshalb gleiche Partie, Zug für Zug.
 */
export function erzeugeZufall(saat: number): () => number {
  let stand = saat >>> 0
  return () => {
    stand = (stand + 0x6d2b79f5) | 0
    let t = Math.imul(stand ^ (stand >>> 15), 1 | stand)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
