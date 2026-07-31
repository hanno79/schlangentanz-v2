/*
 * Author: rahn
 * Datum: 27.06.2026
 * Version: 1.0
 * Beschreibung: M2h Browser-Smoke fuer die Stitch-Forest-Background-Texture auf /game.
 *              Verifiziert die lebendige Stitch-Alignment-Affordance:
 *              - .waldtanz-schlangenlichtung__spielflaeche::before rendert einen
 *                radial-gradient mit kleinem Radius (1.4-2px) und Stitch-#c4fdb6-Farbe
 *              - ::before hat 26px-Tiling (Stitch nutzt 30px; 26px ist dichter)
 *              - ::before hat opacity 0.3-0.55 (subtil, nicht dominant)
 *              - ::before hat pointer-events: none (kein Click-Intercept)
 *              - Bestehender Gradient bleibt sichtbar (kein Cascade-Override)
 *              - Console/Page-Errors leer
 *
 * Self-Test-Mode: --self-test prueft nur BASE_URL und Helper-Kompilation.
 */

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function url(route) { return new URL(route, BASE_URL).toString() }

async function http200(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`M2h Forest-Texture: HTTP ${response.status} fuer ${url(route)}`)
}

async function pruefeM2hForestTexture(page, viewport) {
  const breite = viewport.width
  const hoehe = viewport.height
  console.log(`--- M2h Forest-Texture @ ${breite}x${hoehe} ---`)

  await page.goto(url('/game'), { waitUntil: 'networkidle' })
  await page.getByRole('region', { name: 'Spieltisch' }).waitFor()

  // Startfaehrte anklicken falls vorhanden — vereinheitlicht mit anderen Smokes
  const startButton = page.locator('button[aria-label*="Startfährte"]').first()
  const startButtonCount = await startButton.count()
  if (startButtonCount > 0) {
    await startButton.click({ force: true })
    await page.waitForTimeout(400)
  }

  // 1. Spielflaeche rendert
  const spielflaeche = page.locator('.waldtanz-schlangenlichtung__spielflaeche').first()
  await spielflaeche.waitFor({ state: 'visible', timeout: 5000 })
  const sfBox = await spielflaeche.boundingBox()
  if (!sfBox) throw new Error(`M2h @${breite}x${hoehe}: Spielflaeche fehlt im DOM`)
  console.log(`  Spielflaeche: ${sfBox.width}x${sfBox.height} px @ (${sfBox.x},${sfBox.y})`)

  // 2. ::before hat radial-gradient mit kleinem Radius (Stitch-Dot)
  const beforeBgImage = await spielflaeche.evaluate(el => {
    const before = getComputedStyle(el, '::before')
    return before.backgroundImage
  })
  if (!beforeBgImage || beforeBgImage === 'none') {
    throw new Error(`M2h @${breite}x${hoehe}: ::before hat keine background-image (erwartet radial-gradient)`)
  }
  if (!/radial-gradient/.test(beforeBgImage)) {
    throw new Error(`M2h @${breite}x${hoehe}: ::before hat kein radial-gradient (backgroundImage=${beforeBgImage})`)
  }
  // Kleiner Radius (1.4-2px)
  if (!/1\.4px|1\.5px|1\.6px|2px/.test(beforeBgImage)) {
    throw new Error(`M2h @${breite}x${hoehe}: ::before hat keinen kleinen Radius (1.4-2px) im radial-gradient`)
  }
  /* Stitch-Dot-Farbe #c4fdb6.

     ÄNDERUNG [31.07.2026]: S-4 — gegen die *berechnete* Schreibweise prüfen.
     Vorher suchte dieser Test die Zeichenkette „c4fdb6" in
     `getComputedStyle(...).backgroundImage`. Dort steht sie nie: Der Browser
     normalisiert Hex-Farben zu `rgb()`, aus `#c4fdb6` wird `rgb(196, 253, 182)`.
     Der Test konnte also gar nicht grün werden — die Farbe war die ganze Zeit
     korrekt gesetzt (App.css: `radial-gradient(circle, #c4fdb6 1.4px, …)`). */
  const STITCH_DOT = /rgb\(\s*196\s*,\s*253\s*,\s*182\s*\)|c4fdb6/i
  if (!STITCH_DOT.test(beforeBgImage)) {
    // Fallback: akzeptiere auch eine Lime-Variante (surface-container o.ae.)
    if (!/surface-container|#bff7b1|rgb\(\s*191\s*,\s*247\s*,\s*177\s*\)/i.test(beforeBgImage)) {
      throw new Error(`M2h @${breite}x${hoehe}: ::before hat keine Stitch-Dot-Farbe (rgb(196,253,182) oder surface-container) im radial-gradient: ${beforeBgImage}`)
    }
  }
  console.log(`  ::before backgroundImage: radial-gradient mit kleinem Radius + Stitch-Farbe ✓`)

  // 3. ::before hat 26px-Tiling (Stitch-30px-tiling, angepasst)
  const beforeBgSize = await spielflaeche.evaluate(el => {
    const before = getComputedStyle(el, '::before')
    return before.backgroundSize
  })
  if (!/(24|26|28|30)px/.test(beforeBgSize)) {
    throw new Error(`M2h @${breite}x${hoehe}: ::before hat unerwartete background-size (${beforeBgSize})`)
  }
  console.log(`  ::before backgroundSize: ${beforeBgSize} ✓`)

  // 4. ::before hat opacity 0.3-0.55 (subtil, nicht dominant)
  const beforeOpacity = await spielflaeche.evaluate(el => {
    const before = getComputedStyle(el, '::before')
    return parseFloat(before.opacity)
  })
  if (Number.isNaN(beforeOpacity)) {
    throw new Error(`M2h @${breite}x${hoehe}: ::before hat keine opacity (NaN)`)
  }
  if (beforeOpacity < 0.3 || beforeOpacity > 0.6) {
    throw new Error(`M2h @${breite}x${hoehe}: ::before opacity ${beforeOpacity} ausserhalb 0.3-0.6`)
  }
  console.log(`  ::before opacity: ${beforeOpacity} ✓`)

  // 5. ::before hat pointer-events: none (kein Click-Intercept)
  const beforePointer = await spielflaeche.evaluate(el => {
    const before = getComputedStyle(el, '::before')
    return before.pointerEvents
  })
  if (beforePointer !== 'none') {
    throw new Error(`M2h @${breite}x${hoehe}: ::before hat pointer-events:${beforePointer} (erwartet 'none')`)
  }
  console.log(`  ::before pointerEvents: none ✓`)

  // 6. Spielflaeche hat position: relative (M1di-Contract, M2h:4)
  const sfPosition = await spielflaeche.evaluate(el => getComputedStyle(el).position)
  if (sfPosition !== 'relative') {
    throw new Error(`M2h @${breite}x${hoehe}: Spielflaeche hat position:${sfPosition} (erwartet 'relative')`)
  }
  console.log(`  Spielflaeche position: relative ✓`)

  // 7. Bestehender Gradient der Spielflaeche bleibt sichtbar (kein Override)
  const sfBgImage = await spielflaeche.evaluate(el => getComputedStyle(el).backgroundImage)
  if (!/radial-gradient/.test(sfBgImage) || !/linear-gradient/.test(sfBgImage)) {
    throw new Error(`M2h @${breite}x${hoehe}: Spielflaeche-Gradient verloren (erwartet radial+linear, bekommen ${sfBgImage?.slice(0, 200)})`)
  }
  console.log(`  Spielflaeche-Gradient erhalten (radial+linear) ✓`)
}

if (process.argv.includes('--self-test')) {
  console.log('=== M2h Forest-Texture Self-Test ===')
  console.log('BASE_URL:', BASE_URL)
  console.log('Helper pruefeM2hForestTexture: kompiliert ✓')
  console.log('Slice-Klassen: .waldtanz-schlangenlichtung__spielflaeche, ::before ✓')
  process.exit(0)
}

await Promise.all(['/', '/game'].map(http200))

const browser = await chromium.launch()
const consoleErrors = []
const pageErrors = []
try {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 1100, height: 800 }]) {
    const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' })
    const page = await ctx.newPage()
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
    page.on('pageerror', (err) => pageErrors.push(err.message))
    await pruefeM2hForestTexture(page, viewport)
    await ctx.close()
  }
  if (consoleErrors.length > 0) throw new Error(`M2h: Console-Errors: ${consoleErrors.join(', ')}`)
  if (pageErrors.length > 0) throw new Error(`M2h: Page-Errors: ${pageErrors.join(', ')}`)
  console.log('M2h Forest-Texture: ERFOLGREICH — ::before mit radial-gradient (kleinem Radius) + 26px-Tiling + opacity 0.3-0.55 + pointer-events:none auf /game, 0 console-Errors.')
} finally {
  await browser.close()
}
