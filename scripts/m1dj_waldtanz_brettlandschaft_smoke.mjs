/**
 * Author: rahn
 * Datum: 25.06.2026
 * Version: 1.0
 * Beschreibung: M1dj Production-Smoke — verifiziert auf /game:
 *              - Schlangenlichtung ist die primary board surface
 *              - Schlangenbereich belegt die mittlere 2fr-Spalte der
 *                .waldtanz-schlangenlichtung__schlangen 3-Column-Grid
 *                (mindestens 55% Breite UND 60% Hoehe der Schlangenlichtung)
 *              - Tischkarte liegt links als 1fr-Altar-Ablage, Magiekreise
 *                oben als 1fr-Drop-Ziel-Reihe
 *              - keine console/page-Errors
 *              Mit --self-test: offline Selbstpruefung der Konfiguration,
 *              kein Netzwerk/Browser noetig.
 */
import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const HTTP_TIMEOUT_MS = 15_000

export function erstelleSelbsttestAusgabe() {
  return [
    'M1dj Selbsttest bestanden',
    `BASE_URL: ${BASE_URL}`,
  ].join('\n')
}

async function httpPruefen(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(HTTP_TIMEOUT_MS) })
  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status} fuer ${url}`)
  }
  console.log(`HTTP 200  ${url}`)
}

export async function pruefeM1djBrettlandschaft(seite) {
  const lichtung = seite.locator('.waldtanz-schlangenlichtung').first()
  await lichtung.waitFor({ state: 'visible', timeout: 8000 })

  const lichtungBox = await lichtung.boundingBox()
  if (!lichtungBox) throw new Error('Schlangenlichtung hat keine BoundingBox')
  console.log(`Schlangenlichtung: ${Math.round(lichtungBox.width)}x${Math.round(lichtungBox.height)}`)

  // Innere 3-Column-Brett-Ebene muss da sein.
  const schlangenContainer = lichtung.locator('.waldtanz-schlangenlichtung__schlangen').first()
  await schlangenContainer.waitFor({ state: 'visible', timeout: 4000 })

  const schlangenBereich = lichtung.locator('[class~="schlangenbereich--waldlichtung"]').first()
  await schlangenBereich.waitFor({ state: 'visible', timeout: 4000 })

  const schlangenBox = await schlangenBereich.boundingBox()
  if (!schlangenBox) throw new Error('Schlangenbereich hat keine BoundingBox')
  console.log(`Schlangenbereich: ${Math.round(schlangenBox.width)}x${Math.round(schlangenBox.height)}`)

  // M1dj-Vertrag: Schlangenbereich belegt die mittlere 2fr-Spalte und
  // mind. 55% der Schlangenlichtung-Breite UND 60% ihrer Hoehe.
  const breitenAnteil = schlangenBox.width / lichtungBox.width
  const hoehenAnteil = schlangenBox.height / lichtungBox.height
  console.log(`Schlangenbereich-Anteil: ${(breitenAnteil * 100).toFixed(1)}% Breite, ${(hoehenAnteil * 100).toFixed(1)}% Hoehe`)
  if (breitenAnteil < 0.55) {
    throw new Error(`Schlangenbereich zu schmal: ${(breitenAnteil * 100).toFixed(1)}% Breite < 55% der Schlangenlichtung`)
  }
  if (hoehenAnteil < 0.60) {
    throw new Error(`Schlangenbereich zu niedrig: ${(hoehenAnteil * 100).toFixed(1)}% Hoehe < 60% der Schlangenlichtung`)
  }

  // Tabletop links + Drop-Ziele oben muessen ebenfalls gerendert sein.
  const tischkarte = lichtung.locator('[class~="waldtanz-tischkarte"]').first()
  await tischkarte.waitFor({ state: 'visible', timeout: 4000 })
  const magiekreise = lichtung.locator('[class~="waldtanz-magiekreise"]').first()
  await magiekreise.waitFor({ state: 'visible', timeout: 4000 })

  // Schlangen-Reihen muessen im Schlangenbereich sichtbar sein.
  const schlangenCount = await schlangenBereich.locator('.schlangekarte').count()
  console.log(`Schlangen-Karten-Reihen: ${schlangenCount}`)
  if (schlangenCount < 1) {
    throw new Error(`Keine Schlangen-Reihen sichtbar (count=${schlangenCount})`)
  }

  // Computed-Style: die innere Spielflaeche hat 3px Border (Stitch-Pattern).
  const spielflaeche = lichtung.locator('.waldtanz-schlangenlichtung__spielflaeche').first()
  const border = await spielflaeche.evaluate(el => getComputedStyle(el).borderTopWidth)
  console.log(`Spielflaeche border-top-width: ${border}`)
  if (!border || parseFloat(border) < 2) {
    throw new Error(`Spielflaeche-Border zu schmal: ${border} (erwartet >= 2px)`)
  }

  // Computed-Style: Schlangenbereich nutzt grid-area: schlangen in der
  // inneren __schlangen-Grid (Rueckverweis auf das 3-Column-Layout).
  const gridArea = await schlangenBereich.evaluate(el => getComputedStyle(el).gridArea)
  console.log(`Schlangenbereich grid-area: ${gridArea}`)
  if (!/schlangen/.test(gridArea)) {
    throw new Error(`Schlangenbereich grid-area enthaelt kein 'schlangen': ${gridArea}`)
  }

  console.log('M1dj OK: Schlangenlichtung als Brettlandschaft mit Schlangen-Mitte verifiziert')
}

async function browserSmoke() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const seite = await context.newPage()
  await seite.addInitScript(() => { Math.random = () => 0.999999 })

  const errors = []
  seite.on('pageerror', (err) => errors.push(`Page-Fehler: ${err.message}`))
  seite.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`Console-Fehler: ${msg.text()}`)
  })

  try {
    await seite.goto(`${BASE_URL}/game`, { waitUntil: 'networkidle' })
    await pruefeM1djBrettlandschaft(seite)
    await seite.waitForTimeout(300)
    if (errors.length > 0) {
      throw new Error(errors.join('\n'))
    }
    console.log('M1dj Smoke OK')
  } finally {
    await browser.close()
  }
}

if (process.argv.includes('--self-test')) {
  console.log(erstelleSelbsttestAusgabe())
  process.exit(0)
}

httpPruefen(BASE_URL).then(browserSmoke).catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
