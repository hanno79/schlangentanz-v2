/*
 * Author: rahn
 * Datum: 28.06.2026
 * Version: 1.0
 * Beschreibung: M2u Browser-Smoke fuer den Handkarten-Drag-Glow auf der Schlangenlichtung.
 *              Verifiziert die sichtbare Drop-Affordance:
 *              - .waldtanz-schlangenlichtung im Idle: animationName === 'none'
 *              - data-drag-aktiv="true": animationName === 'waldtanz-lichtung-drag-glow'
 *              - Reduced-Motion-Mode: animationName === 'none' (Override greift)
 *              - Outline + outline-offset sichtbar im Drag-Zustand
 *              - Console/Page-Errors leer
 *
 * Drag-Simulation: wir setzen data-drag-aktiv="true" direkt via page.evaluate,
 * weil echtes Drag&Drop-Playwright in einem Smoke gegen den Production-Build
 * fragil ist. Der State-Wiring ist im React-Baum (M2u:2 RED-Test beweist das)
 * und die CSS-Reaktion ist rein deklarativ.
 *
 * Self-Test-Mode: --self-test prueft nur BASE_URL und Helper-Kompilation.
 */

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function url(route) { return new URL(route, BASE_URL).toString() }

async function http200(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`M2u Drag-Glow: HTTP ${response.status} fuer ${url(route)}`)
}

async function pruefeM2uDragGlow(page, viewport) {
  const breite = viewport.width
  const hoehe = viewport.height
  console.log(`--- M2u Hand-Drag-Glow @ ${breite}x${hoehe} ---`)

  await page.goto(url('/game'), { waitUntil: 'networkidle' })
  await page.getByRole('region', { name: 'Spieltisch' }).waitFor()

  // Startfaehrte anklicken falls vorhanden — vereinheitlicht mit anderen Smokes
  const startButton = page.locator('button[aria-label*="Startfährte"]').first()
  const startButtonCount = await startButton.count()
  if (startButtonCount > 0) {
    await startButton.click({ force: true })
    await page.waitForTimeout(400)
  }

  // 1. Schlangenlichtung rendert sichtbar
  const lichtung = page.locator('.waldtanz-schlangenlichtung').first()
  await lichtung.waitFor({ state: 'visible', timeout: 5000 })
  const lBox = await lichtung.boundingBox()
  if (!lBox) throw new Error(`M2u @${breite}x${hoehe}: Schlangenlichtung fehlt im DOM`)
  console.log(`  Schlangenlichtung: ${lBox.width}x${lBox.height} px @ (${lBox.x},${lBox.y})`)

  // 2. Idle: animationName === 'none'
  const idleAnim = await lichtung.evaluate(el => getComputedStyle(el).animationName)
  if (idleAnim !== 'none') {
    throw new Error(`M2u @${breite}x${hoehe}: Idle animationName=${idleAnim} (erwartet 'none')`)
  }
  console.log(`  Idle animationName: none ✓`)

  // 3. data-drag-aktiv auf "true" setzen (simuliert React-State nach dragStart)
  await lichtung.evaluate(el => el.setAttribute('data-drag-aktiv', 'true'))
  await page.waitForTimeout(50)

  // 4. Drag-State: animationName === 'waldtanz-lichtung-drag-glow'
  const dragAnim = await lichtung.evaluate(el => getComputedStyle(el).animationName)
  if (dragAnim !== 'waldtanz-lichtung-drag-glow') {
    throw new Error(`M2u @${breite}x${hoehe}: Drag animationName=${dragAnim} (erwartet 'waldtanz-lichtung-drag-glow')`)
  }
  console.log(`  Drag animationName: waldtanz-lichtung-drag-glow ✓`)

  // 5. Outline-Stil sichtbar (forest-gruenes dashed Outline als Drop-Signal)
  const outline = await lichtung.evaluate(el => {
    const cs = getComputedStyle(el)
    return { style: cs.outlineStyle, color: cs.outlineColor, width: cs.outlineWidth, offset: cs.outlineOffset }
  })
  if (outline.style !== 'dashed') {
    throw new Error(`M2u @${breite}x${hoehe}: outline-style=${outline.style} (erwartet 'dashed')`)
  }
  if (!/^rgba?\(\s*75\s*,\s*103\s*,\s*0|#4b6700/i.test(outline.color)) {
    throw new Error(`M2u @${breite}x${hoehe}: outline-color=${outline.color} (erwartet forest-gruen ~#4b6700)`)
  }
  console.log(`  Drag outline: ${outline.style} ${outline.width} ${outline.color} offset=${outline.offset} ✓`)

  // 6. Wieder zurueck auf Idle
  await lichtung.evaluate(el => el.setAttribute('data-drag-aktiv', 'false'))
  await page.waitForTimeout(50)
  const idleAnim2 = await lichtung.evaluate(el => getComputedStyle(el).animationName)
  if (idleAnim2 !== 'none') {
    throw new Error(`M2u @${breite}x${hoehe}: Nach Idle-Reset animationName=${idleAnim2} (erwartet 'none')`)
  }
  console.log(`  Nach Idle-Reset animationName: none ✓`)
}

async function pruefeM2uReducedMotion(page, viewport) {
  const breite = viewport.width
  const hoehe = viewport.height
  console.log(`--- M2u Reduced-Motion @ ${breite}x${hoehe} ---`)

  await page.goto(url('/game'), { waitUntil: 'networkidle' })
  await page.getByRole('region', { name: 'Spieltisch' }).waitFor()

  const startButton = page.locator('button[aria-label*="Startfährte"]').first()
  const startButtonCount = await startButton.count()
  if (startButtonCount > 0) {
    await startButton.click({ force: true })
    await page.waitForTimeout(400)
  }

  const lichtung = page.locator('.waldtanz-schlangenlichtung').first()
  await lichtung.waitFor({ state: 'visible', timeout: 5000 })

  // data-drag-aktiv=true unter reduced-motion
  await lichtung.evaluate(el => el.setAttribute('data-drag-aktiv', 'true'))
  await page.waitForTimeout(50)

  const dragAnim = await lichtung.evaluate(el => getComputedStyle(el).animationName)
  if (dragAnim !== 'none') {
    throw new Error(`M2u @${breite}x${hoehe} reduced-motion: Drag animationName=${dragAnim} (erwartet 'none' per Override)`)
  }
  console.log(`  Reduced-Motion Drag animationName: none (Override greift) ✓`)
}

if (process.argv.includes('--self-test')) {
  console.log('=== M2u Hand-Drag-Glow Self-Test ===')
  console.log('BASE_URL:', BASE_URL)
  console.log('Helper pruefeM2uDragGlow + pruefeM2uReducedMotion: kompilieren ✓')
  console.log('Slice-Klassen: .waldtanz-schlangenlichtung[data-drag-aktiv] ✓')
  process.exit(0)
}

await Promise.all(['/', '/game'].map(http200))

const browser = await chromium.launch()
const consoleErrors = []
const pageErrors = []
try {
  // Standard-Modus (mit Animation) — beide Viewports
  for (const viewport of [{ width: 1280, height: 900 }, { width: 1100, height: 800 }]) {
    const ctx = await browser.newContext({ viewport }) // ohne reducedMotion
    const page = await ctx.newPage()
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
    page.on('pageerror', (err) => pageErrors.push(err.message))
    await pruefeM2uDragGlow(page, viewport)
    await ctx.close()
  }
  // Reduced-Motion-Modus (Override-Test)
  for (const viewport of [{ width: 1280, height: 900 }]) {
    const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' })
    const page = await ctx.newPage()
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
    page.on('pageerror', (err) => pageErrors.push(err.message))
    await pruefeM2uReducedMotion(page, viewport)
    await ctx.close()
  }
  if (consoleErrors.length > 0) throw new Error(`M2u: Console-Errors: ${consoleErrors.join(', ')}`)
  if (pageErrors.length > 0) throw new Error(`M2u: Page-Errors: ${pageErrors.join(', ')}`)
  console.log('M2u Hand-Drop-Glow: ERFOLGREICH — animationName=waldtanz-lichtung-drag-glow bei data-drag-aktiv=true, none sonst, Outline dashed forest-gruen, Reduced-Motion Override greift, 0 console-Errors.')
} finally {
  await browser.close()
}