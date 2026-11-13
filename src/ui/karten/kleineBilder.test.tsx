import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { erstelleSpielkarten } from '../../engine/deck'
import { Karte, Kartenrueckseite } from './Karte'

/*
O4: Am Tisch sind Karten 30 bis 96 px breit, die Bilder unter public/karten
aber 470 px und mehr. Für kleine Karten gibt es deshalb eine zweite Fassung,
240 px breit, unter public/karten-klein; der Browser wählt sie über `srcset`,
solange sie für die Pixeldichte des Geräts reicht. Die Grossansicht bleibt bei
der grossen Fassung.
*/

const WURZEL = resolve(__dirname, '../../..')
const GROSS = join(WURZEL, 'public', 'karten')
const KLEIN = join(WURZEL, 'public', 'karten-klein')
const KLEINE_BREITE = 240

/** Breite und Höhe aus dem Kopf einer WebP-Datei (VP8X, VP8 oder VP8L). */
function webpGroesse(pfad: string): { breite: number; hoehe: number } {
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

/** Alle Kartenbilder ausser dem Logo; das Logo steht nie als kleine Karte am Tisch. */
const KARTENBILDER = readdirSync(GROSS).filter((datei) => datei.endsWith('.webp') && datei !== 'logo.webp')

describe('O4: Kleine Fassung jedes Kartenbilds', () => {
  it('O4: es gibt 33 Kartenbilder, also 33 kleine Fassungen', () => {
    expect(KARTENBILDER).toHaveLength(33)
  })

  it.each(KARTENBILDER)('O4: %s hat eine kleine Fassung, 240 px breit, im selben Format', (datei) => {
    const pfad = join(KLEIN, datei)
    expect(existsSync(pfad), `public/karten-klein/${datei} fehlt (scripts/kartenbilder_zuschneiden.py --nur-klein)`).toBe(true)
    const klein = webpGroesse(pfad)
    const gross = webpGroesse(join(GROSS, datei))
    expect(klein.breite, `${datei}: Breite der kleinen Fassung`).toBe(KLEINE_BREITE)
    expect(Math.abs(klein.breite / klein.hoehe - gross.breite / gross.hoehe), `${datei}: Seitenverhältnis`).toBeLessThan(0.01)
    expect(statSync(pfad).size, `${datei}: kleine Fassung zu gross`).toBeLessThanOrEqual(16 * 1024)
  })

  it('O4: unter public/karten-klein liegt nichts ohne grosse Fassung', () => {
    const fremd = readdirSync(KLEIN).filter((datei) => !KARTENBILDER.includes(datei))
    expect(fremd).toEqual([])
  })
})

describe('O4: Karte wählt zwischen kleiner und grosser Fassung', () => {
  const blau = erstelleSpielkarten(false).find((karte) => karte.typ === 'Farbkarte' && karte.farbe === 'Blau')!

  it('O4: mit Grössenangabe bietet die Karte beide Fassungen an', () => {
    render(<Karte karte={blau} sizes="64px" />)
    const bild = screen.getByRole('img', { name: 'Farbkarte Blau, 1 Punkt' })
    expect(bild.getAttribute('srcset')).toBe('/karten-klein/farbe-blau.webp 240w, /karten/farbe-blau.webp 470w')
    expect(bild.getAttribute('sizes')).toBe('64px')
    expect(bild.getAttribute('src')).toBe('/karten/farbe-blau.webp')
  })

  it('O4: ohne Grössenangabe (Grossansicht) bleibt es bei der grossen Fassung', () => {
    render(<Karte karte={blau} />)
    const bild = screen.getByRole('img')
    expect(bild.getAttribute('srcset')).toBeNull()
    expect(bild.getAttribute('src')).toBe('/karten/farbe-blau.webp')
  })

  it('O4: die Rückseite ist ein SVG und braucht keine zweite Fassung', () => {
    render(<Kartenrueckseite />)
    expect(screen.getByRole('img').getAttribute('srcset')).toBeNull()
  })
})
