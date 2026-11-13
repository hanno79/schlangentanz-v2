// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Farbe } from '../../engine'
import { erstelleAufgabenStapel } from '../../engine/aufgabenKarten'
import { erstelleAuslagekarten, erstelleSpielkarten } from '../../engine/deck'
import { SPEC_AUFGABEN, SPEC_FARBEN, SPEC_SONDERKARTEN, SPEC_ZUSATZ } from '../../test/specText'
import {
  aufgabenbild,
  farbkartenbild,
  kartenbild,
  LOGO_BILD,
  RUECKSEITE_BILD,
  sonderkartenbild,
  ZUSATZKARTEN,
} from './kartenbilder'
import { webpGroesse } from './__tests__/webp'

/*
O1, Kriterium 1: Für jeden Kartennamen des Materials (mit Erweiterung) und jede
Aufgabe gibt es ein Bild.

Geprüft wird gegen zwei Quellen: Teil A der Spec (Spiegel der Website) nennt
das ganze Material, das Material der Engine ist das, was die Oberfläche
tatsächlich anzeigen muss. Weicht eine Quelle von der anderen ab, fällt das
hier auf und nicht erst am Tisch als fehlendes Bild.
*/

const WURZEL = resolve(__dirname, '../../..')
const OEFFENTLICH = join(WURZEL, 'public')
const KARTENORDNER = join(OEFFENTLICH, 'karten')

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

  it('O1: jede Karte aus dem Material der Engine hat ein Bild (Spielkarten mit Erweiterung, Aufgaben, Comeback, Risiko)', () => {
    const karten = [
      ...erstelleSpielkarten(true),
      ...erstelleAufgabenStapel(),
      ...[0, 1, 2, 3].flatMap((spieler) => {
        const { comeback, risiko } = erstelleAuslagekarten(spieler)
        return [comeback, ...risiko]
      }),
    ]
    // Gegen einen leeren Lauf: 6 Farben, 10 Sonderkarten, 15 Aufgaben, Comeback, Risiko-Belohnung.
    expect(new Set(karten.map(kartenbild)).size, 'verschiedene Kartenbilder im Material der Engine').toBe(33)
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
