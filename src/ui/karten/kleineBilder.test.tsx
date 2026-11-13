import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { erstelleSpielkarten } from '../../engine/deck'
import { webpGroesse } from './__tests__/webp'
import { Karte, Kartenrueckseite } from './Karte'
import { KLEINBILD_BREITE, LOGO_BILD } from './kartenbilder'

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

/** Alle Kartenbilder ausser dem Logo; das Logo steht nie als kleine Karte am Tisch. */
const KARTENBILDER = readdirSync(GROSS).filter((datei) => datei.endsWith('.webp') && `/karten/${datei}` !== LOGO_BILD)

describe('O4: Kleine Fassung jedes Kartenbilds', () => {
  it('O4: es gibt 33 Kartenbilder, also 33 kleine Fassungen', () => {
    expect(KARTENBILDER).toHaveLength(33)
  })

  it.each(KARTENBILDER)('O4: %s hat eine kleine Fassung, 240 px breit, im selben Format', (datei) => {
    const pfad = join(KLEIN, datei)
    expect(existsSync(pfad), `public/karten-klein/${datei} fehlt (scripts/kartenbilder_zuschneiden.py --nur-klein)`).toBe(true)
    const klein = webpGroesse(pfad)
    const gross = webpGroesse(join(GROSS, datei))
    expect(klein.breite, `${datei}: Breite der kleinen Fassung`).toBe(KLEINBILD_BREITE)
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
