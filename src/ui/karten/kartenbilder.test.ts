// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { aufgabenPool, erstelleErweiterungsSonderkarten, erstelleSpieldeck } from '../../engine'
import type { Farbe } from '../../engine'
import {
  aufgabenbild,
  farbkartenbild,
  kartenbild,
  LOGO_BILD,
  RUECKSEITE_BILD,
  sonderkartenbild,
  ZUSATZKARTEN,
} from './kartenbilder'

/*
O1, Kriterium 1: Für jeden Kartennamen des Materials (mit Erweiterung) und jede
Aufgabe gibt es ein Bild.

Geprüft wird gegen zwei Quellen, weil keine allein reicht: Teil A der Spec
(Spiegel der Website) nennt das ganze Material mit allen 15 Aufgaben, die
heutige Engine kennt erst 14 (C1). Die Engine ist aber das, was die Oberfläche
später tatsächlich anzeigen muss.
*/

const WURZEL = resolve(__dirname, '../../..')
const OEFFENTLICH = join(WURZEL, 'public')
const KARTENORDNER = join(OEFFENTLICH, 'karten')
const SPEC = readFileSync(join(WURZEL, 'docs/GAME_SPEC.md'), 'utf8')

/** Der Text eines Spec-Abschnitts von seiner Überschrift bis zur nächsten gleicher Tiefe. */
function abschnitt(ueberschrift: string): string {
  const start = SPEC.indexOf(ueberschrift)
  if (start < 0) throw new Error(`abschnitt: „${ueberschrift}“ steht nicht in docs/GAME_SPEC.md`)
  const tiefe = ueberschrift.match(/^#+/)?.[0] ?? '#'
  const rest = SPEC.slice(start + ueberschrift.length)
  const ende = rest.search(new RegExp(`\\n${tiefe} `))
  return ende < 0 ? rest : rest.slice(0, ende)
}

/** Die Zellen jeder Tabellenzeile (ohne Kopf und Trennzeile). */
function tabellenzeilen(text: string): string[][] {
  return text
    .split('\n')
    .filter((zeile) => zeile.startsWith('|') && !/^\|\s*-/.test(zeile))
    .map((zeile) => zeile.slice(1, -1).split('|').map((zelle) => zelle.trim()))
    .slice(1)
}

const A1 = tabellenzeilen(abschnitt('### A1 Spielmaterial'))
const ohneEtikett = (name: string) => name.replace(/\s*\[Erweiterung\]$/, '')
const SPEC_FARBEN = A1.filter(([kategorie]) => kategorie === 'Farbkarten').map(([, , text]) => text.split(' ')[0])
const SPEC_SONDERKARTEN = A1.filter(([kategorie]) => kategorie === 'Sonderkarten').map(([, , name]) => ohneEtikett(name))
const SPEC_ZUSATZ = A1.filter(([kategorie]) => kategorie.startsWith('Zusätzliches Spielmaterial')).map(([, , text]) => text)
const SPEC_AUFGABEN = tabellenzeilen(abschnitt('#### Verfügbare Aufgabenkarten')).map(([, name]) => name)

/** Liest Breite und Höhe aus dem Kopf einer WebP-Datei (VP8X, VP8 oder VP8L). */
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

/** Der Pfad unter `public/` zu einer Bildadresse der Seite (`/karten/x.webp`). */
const dateiZu = (adresse: string) => join(OEFFENTLICH, ...adresse.split('/').filter(Boolean))

describe('O1: Für jede Karte des Materials gibt es ein Bild (Kriterium 1)', () => {
  it('O1/A1: die Spec nennt 6 Farben, 10 Sonderkarten, Comeback- und Risiko-Belohnungs-Karten', () => {
    expect(SPEC_FARBEN, 'A1: Farbkarten in docs/GAME_SPEC.md').toEqual(['Blau', 'Rot', 'Gelb', 'Violett', 'Braun', 'Grün'])
    expect(SPEC_SONDERKARTEN, 'A1: Sonderkarten in docs/GAME_SPEC.md').toHaveLength(10)
    expect(SPEC_ZUSATZ.map((text) => text.split(' ')[0]), 'A1: Zusätzliches Spielmaterial').toEqual([
      'Comeback-Karten',
      'Risiko-Belohnungs-Karten',
    ])
  })

  it.each(SPEC_FARBEN)('O1/A1: Farbkarte %s hat ein Bild', (farbe) => {
    expect(existsSync(dateiZu(farbkartenbild(farbe as Farbe))), `Bilddatei für Farbkarte ${farbe} fehlt`).toBe(true)
  })

  it.each(SPEC_SONDERKARTEN)('O1/A1: Sonderkarte %s hat ein Bild', (name) => {
    expect(existsSync(dateiZu(sonderkartenbild(name))), `Bilddatei für Sonderkarte ${name} fehlt`).toBe(true)
  })

  it.each(SPEC_ZUSATZ)('O1/A1: %s hat ein Bild', (text) => {
    const name = ZUSATZKARTEN[text.split(' ')[0]]
    expect(name, `ZUSATZKARTEN kennt „${text}“ nicht`).toBeDefined()
    expect(existsSync(dateiZu(sonderkartenbild(name))), `Bilddatei für ${name} fehlt`).toBe(true)
  })

  it('O1/A9: die Spec nennt 15 Aufgaben', () => {
    expect(SPEC_AUFGABEN, 'A9: Tabelle „Verfügbare Aufgabenkarten“').toHaveLength(15)
  })

  it.each(SPEC_AUFGABEN)('O1/A9: Aufgabe %s hat ein Bild', (name) => {
    expect(existsSync(dateiZu(aufgabenbild(name))), `Bilddatei für Aufgabe ${name} fehlt`).toBe(true)
  })

  it('O1: jede Karte, die die Engine heute erzeugt, hat ein Bild (Spieldeck, Erweiterung, Aufgaben)', () => {
    const karten = [...erstelleSpieldeck(), ...erstelleErweiterungsSonderkarten(), ...aufgabenPool]
    const ohneBild = karten.filter((karte) => !existsSync(dateiZu(kartenbild(karte)))).map((karte) => karte.id)
    expect(ohneBild, 'Karten der Engine ohne Bilddatei').toEqual([])
  })

  it('O1: ein unbekannter Kartenname ist ein Fehler, kein leeres Bild', () => {
    expect(() => sonderkartenbild('Gibtsnicht')).toThrow(/Gibtsnicht/)
    expect(() => aufgabenbild('Gibtsnicht')).toThrow(/Gibtsnicht/)
  })

  it('O1: Logo und Kartenrückseite (Platzhalter) liegen unter public/', () => {
    expect(existsSync(dateiZu(LOGO_BILD)), `${LOGO_BILD} fehlt`).toBe(true)
    expect(existsSync(dateiZu(RUECKSEITE_BILD)), `${RUECKSEITE_BILD} fehlt`).toBe(true)
    expect(RUECKSEITE_BILD, 'Die Rückseite ist bis zur Datei des Autors ein Platzhalter').toMatch(/platzhalter/)
  })
})

describe('O1: Die Kartenbilder sind zugeschnitten', () => {
  const vorderseiten = [
    ...SPEC_FARBEN.map((farbe) => farbkartenbild(farbe as Farbe)),
    ...[...SPEC_SONDERKARTEN, 'Comeback', 'Risiko-Belohnung'].map(sonderkartenbild),
    ...SPEC_AUFGABEN.map(aufgabenbild),
  ]

  it.each(vorderseiten)('O1: %s ist ohne Rand im Kartenformat (Breite zu Höhe 0,60 bis 0,63)', (adresse) => {
    const { breite, hoehe } = webpGroesse(dateiZu(adresse))
    // Die Website liefert 604×900 mit grauem Rand (Seitenverhältnis 0,67); die Karte selbst ist schmaler.
    expect(breite / hoehe, `${adresse}: ${breite}×${hoehe}`).toBeGreaterThanOrEqual(0.6)
    expect(breite / hoehe, `${adresse}: ${breite}×${hoehe}`).toBeLessThanOrEqual(0.63)
    expect(hoehe, `${adresse}: zu klein, um auf dem Handy lesbar zu sein`).toBeGreaterThanOrEqual(700)
  })

  it('O1: unter public/karten liegt keine Datei, die keiner Karte gehört', () => {
    const benutzt = new Set([...vorderseiten, LOGO_BILD, RUECKSEITE_BILD].map((adresse) => adresse.split('/').pop()))
    const fremd = readdirSync(KARTENORDNER).filter((datei) => !benutzt.has(datei))
    expect(fremd, 'Dateien in public/karten ohne Zuordnung in kartenbilder.ts').toEqual([])
  })
})
