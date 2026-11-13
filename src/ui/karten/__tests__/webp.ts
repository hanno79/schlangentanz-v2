import { readFileSync } from 'node:fs'

/** Liest Breite und Höhe aus dem Kopf einer WebP-Datei (VP8X, VP8 oder VP8L). */
export function webpGroesse(pfad: string): { breite: number; hoehe: number } {
  const daten = readFileSync(pfad)
  if (daten.toString('ascii', 0, 4) !== 'RIFF' || daten.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error(`webpGroesse: ${pfad} ist keine WebP-Datei`)
  }
  const art = daten.toString('ascii', 12, 16)
  if (art === 'VP8X') return { breite: daten.readUIntLE(24, 3) + 1, hoehe: daten.readUIntLE(27, 3) + 1 }
  if (art === 'VP8 ') return { breite: daten.readUInt16LE(26) & 0x3fff, hoehe: daten.readUInt16LE(28) & 0x3fff }
  if (art === 'VP8L') {
    const bits = daten.readUInt32LE(21)
    return { breite: (bits & 0x3fff) + 1, hoehe: ((bits >> 14) & 0x3fff) + 1 }
  }
  throw new Error(`webpGroesse: ${pfad} hat den unbekannten Block „${art}“`)
}
