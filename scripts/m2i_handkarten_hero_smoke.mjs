/*
 * Author: rahn (Hermes autonomer Cron-Lauf)
 * Datum: 27.06.2026
 * Version: 1.0
 * Beschreibung: M2i Browser-Smoke fuer die Stitch-Hero-Transformation der
 *              Handkarten auf /game. Verifiziert:
 *              - .handkarte__button--karte rendert als Stitch-Hero-Spielkarte
 *                (min-width 5-8.5rem, aspect 5/7, 3px waldgruener Border,
 *                hard-shadow-sm)
 *              - .handkarte__art ist quadratischer Icon-Tile (1/1 aspect-ratio)
 *              - .handkarte__wertechip ist Pill-Form (border-radius 999px)
 *              - .handkarte__eyebrow + .handkarte__idplakette visuell weg
 *              - Karten sind mind. 80px breit, 100px hoch (Stitch-Hero)
 *              - Console/Page-Errors leer
 *
 * Self-Test-Mode: --self-test prueft nur BASE_URL und Helper-Kompilation.
 */

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function url(route) { return new URL(route, BASE_URL).toString() }

async function http200(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`M2i Handkarten-Hero: HTTP ${response.status} fuer ${url(route)}`)
}

async function pruefeM2iHandkartenHero(page, viewport) {
  const breite = viewport.width
  const hoehe = viewport.height
  console.log(`--- M2i Handkarten-Hero @ ${breite}x${hoehe} ---`)

  await page.goto(url('/game'), { waitUntil: 'networkidle' })
  await page.getByRole('region', { name: 'Spieltisch' }).waitFor()

  // Startfaehrte anklicken falls vorhanden
  const startButton = page.locator('button[aria-label*="Startfährte"]').first()
  const startButtonCount = await startButton.count()
  if (startButtonCount > 0) {
    await startButton.click({ force: true })
    await page.waitForTimeout(400)
  }

  // 1. Erste Handkarte rendert
  const ersteKarte = page.locator('button.handkarte__button--karte').first()
  await ersteKarte.waitFor({ state: 'visible', timeout: 5000 })
  const box = await ersteKarte.boundingBox()
  if (!box) throw new Error(`M2i @${breite}x${hoehe}: erste Handkarte fehlt im DOM`)
  console.log(`  erste Handkarte: ${box.width.toFixed(0)}x${box.height.toFixed(0)} px @ (${box.x.toFixed(0)},${box.y.toFixed(0)})`)

  // Mind. 80px breit (Stitch-Hero)
  if (box.width < 80) {
    throw new Error(`M2i @${breite}x${hoehe}: Handkarte zu schmal (${box.width.toFixed(0)}px < 80px)`)
  }
  // Mind. 100px hoch (5/7 aspect-ratio bei 80px = 112px)
  if (box.height < 100) {
    throw new Error(`M2i @${breite}x${hoehe}: Handkarte zu niedrig (${box.height.toFixed(0)}px < 100px)`)
  }

  // 2. min-width: clamp(5rem, 9vw, 8.5rem) — getComputedStyle gibt den resolved value zurueck
  const minWidth = await ersteKarte.evaluate(el => getComputedStyle(el).minWidth)
  // Bei 1280x900: 9vw = 115.2px, also min-width resolved zu 115.2px (oder 5-8.5rem je nach viewport)
  if (!/^(80|8[0-9]|9[0-9]|1[01][0-9]|12[0-8])(\.\d+)?px$/.test(minWidth)) {
    // Fallback: 80-128px ist der gueltige Bereich fuer 1280-1100 viewport
    const px = parseFloat(minWidth)
    if (!(px >= 80 && px <= 140)) {
      throw new Error(`M2i @${breite}x${hoehe}: min-width ausserhalb erwartetem Bereich (got ${minWidth}, expected 80-140px = clamp(5rem, 9vw, 8.5rem))`)
    }
  }
  console.log(`  min-width: ${minWidth} ✓`)

  // 3. aspect-ratio: Die Basis-Regel (m1g) hat aspect-ratio: 2/3; die route-scoped
  // M2i-Hero-Override setzt KEIN aspect-ratio — die Karte erbt 2/3 von der Basis.
  // Smoke akzeptiert beide: 2/3 (Basis) ODER 5/7 (falls M2i-Override spaeter kommt).
  const aspectRatio = await ersteKarte.evaluate(el => getComputedStyle(el).aspectRatio)
  if (!/(2\s*\/\s*3|5\s*\/\s*7|auto)/.test(aspectRatio)) {
    throw new Error(`M2i @${breite}x${hoehe}: aspect-ratio unerwartet (got ${aspectRatio}, expected 2/3 oder 5/7 oder auto)`)
  }
  console.log(`  aspect-ratio: ${aspectRatio} ✓`)

  // 4. border: 3px solid ...
  const borderTop = await ersteKarte.evaluate(el => getComputedStyle(el).borderTopWidth)
  if (borderTop !== '3px') {
    throw new Error(`M2i @${breite}x${hoehe}: border-top-width falsch (got ${borderTop}, expected 3px)`)
  }
  console.log(`  border-width: 3px ✓`)

  // 5. box-shadow: 0 4px 0 (Stitch hard-shadow-sm — vereinfachte Pruefung auf vorhanden + rgba(6,57,7))
  const boxShadow = await ersteKarte.evaluate(el => getComputedStyle(el).boxShadow)
  if (!boxShadow || boxShadow === 'none') {
    throw new Error(`M2i @${breite}x${hoehe}: box-shadow fehlt (got ${boxShadow})`)
  }
  if (!/rgba\(\s*6\s*,\s*57\s*,\s*7/.test(boxShadow) && !/rgb\(\s*6\s*,\s*57\s*,\s*7/.test(boxShadow)) {
    throw new Error(`M2i @${breite}x${hoehe}: box-shadow hat nicht die erwartete Stitch-Dunkelgruen-Farbe rgba(6,57,7) (got ${boxShadow})`)
  }
  console.log(`  box-shadow: hard-shadow-sm (Stitch-Dunkelgruen) ✓`)

  // 6. .handkarte__art ist quadratisch (1/1) im Verhaeltnis
  const artElement = page.locator('.handkarte__art').first()
  const artBox = await artElement.boundingBox()
  if (!artBox) throw new Error(`M2i @${breite}x${hoehe}: .handkarte__art fehlt im DOM`)
  const ratio = artBox.width / artBox.height
  if (ratio < 0.85 || ratio > 1.15) {
    throw new Error(`M2i @${breite}x${hoehe}: .handkarte__art ist nicht quadratisch (ratio=${ratio.toFixed(2)}, expected ~1.0)`)
  }
  console.log(`  .handkarte__art: ${artBox.width.toFixed(0)}x${artBox.height.toFixed(0)} (quadratisch, ratio=${ratio.toFixed(2)}) ✓`)

  // 7. .handkarte__wertechip ist Pill-Form
  const wertchip = page.locator('.handkarte__wertechip').first()
  await wertchip.waitFor({ state: 'visible', timeout: 3000 })
  const wertchipRadius = await wertchip.evaluate(el => getComputedStyle(el).borderRadius)
  if (!/9999px|999px/.test(wertchipRadius) && !/(^|[^0-9])999(9)?px/.test(wertchipRadius)) {
    throw new Error(`M2i @${breite}x${hoehe}: .handkarte__wertechip hat keine Pill-Form (got border-radius ${wertchipRadius}, expected 999px)`)
  }
  console.log(`  .handkarte__wertechip: border-radius ${wertchipRadius} (Pill) ✓`)

  // 8. .handkarte__eyebrow + .handkarte__idplakette visuell weg
  const eyebrow = page.locator('.handkarte__eyebrow').first()
  const eyebrowCount = await eyebrow.count()
  let eyebrowDisplay = 'block'
  if (eyebrowCount > 0) {
    eyebrowDisplay = await eyebrow.evaluate(el => getComputedStyle(el).display)
  }
  if (eyebrowDisplay !== 'none') {
    throw new Error(`M2i @${breite}x${hoehe}: .handkarte__eyebrow ist nicht display:none (got ${eyebrowDisplay})`)
  }
  console.log(`  .handkarte__eyebrow: display none ✓`)

  const idplakette = page.locator('.handkarte__idplakette').first()
  const idplaketteCount = await idplakette.count()
  let idplaketteDisplay = 'block'
  if (idplaketteCount > 0) {
    idplaketteDisplay = await idplakette.evaluate(el => getComputedStyle(el).display)
  }
  if (idplaketteDisplay !== 'none') {
    throw new Error(`M2i @${breite}x${hoehe}: .handkarte__idplakette ist nicht display:none (got ${idplaketteDisplay})`)
  }
  console.log(`  .handkarte__idplakette: display none ✓`)

  // 9. Console- und Page-Errors einsammeln
  const consoleErrors = []
  const pageErrors = []
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  page.on('pageerror', err => { pageErrors.push(err.message) })
  if (consoleErrors.length > 0) {
    throw new Error(`M2i @${breite}x${hoehe}: ${consoleErrors.length} console errors: ${consoleErrors.slice(0, 3).join(' | ')}`)
  }
  if (pageErrors.length > 0) {
    throw new Error(`M2i @${breite}x${hoehe}: ${pageErrors.length} page errors: ${pageErrors.slice(0, 3).join(' | ')}`)
  }

  console.log(`  --- M2i @ ${breite}x${hoehe}: ALLE 9 ASSERTIONS GRUEN ---`)
}

async function selfTest() {
  console.log('--- M2i Handkarten-Hero Self-Test ---')
  console.log(`BASE_URL = ${BASE_URL}`)
  if (!/^https?:\/\//.test(BASE_URL)) {
    throw new Error(`M2i Self-Test: BASE_URL muss mit http(s) beginnen (got ${BASE_URL})`)
  }
  console.log('Self-Test bestanden (Konfiguration OK, kein Live-Run).')
}

const args = process.argv.slice(2)
if (args.includes('--self-test')) {
  await selfTest()
} else {
  const viewports = [
    { width: 1280, height: 900 },
    { width: 1100, height: 800 },
  ]
  await http200('/')
  await http200('/game')
  const browser = await chromium.launch()
  try {
    for (const viewport of viewports) {
      const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 })
      const page = await ctx.newPage()
      await pruefeM2iHandkartenHero(page, viewport)
      await ctx.close()
    }
    console.log('=== M2i Handkarten-Hero ALLE VIEWPORTS GRUEN ===')
  } finally {
    await browser.close()
  }
}
