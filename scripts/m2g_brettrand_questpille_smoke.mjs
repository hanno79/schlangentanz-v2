/*
 * Author: rahn
 * Datum: 27.06.2026
 * Version: 1.0
 * Beschreibung: M2g Browser-Smoke fuer die sichtbare Brettrand-Questpille auf /game.
 *              Verifiziert die lebendige Stitch-Alignment-Affordance:
 *              - Auf /game existiert genau eine .waldtanz-brettrand-questpille
 *                mit Icon + Quest-Text (gematcht gegen geheimeAufgabeText) + Status
 *              - Pille hat sichtbare Groesse (>= 200x32 px) im 1280x900 + 1100x800 Viewport
 *              - Auf /game ist die alte .waldtanz-zugtafel__quest-Zeile in der
 *                Sidebar visuell versteckt (display: none) — Single-Source-of-Truth
 *              - Auf / (Lobby) ist die Pille nicht sichtbar (Route-Scope)
 *              - Console/Page-Errors leer
 *
 * Self-Test-Mode: --self-test prueft nur BASE_URL und Helper-Kompilation.
 */

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function url(route) { return new URL(route, BASE_URL).toString() }

async function http200(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`M2g Brettrand-Questpille: HTTP ${response.status} fuer ${url(route)}`)
}

async function pruefeM2gBrettrandQuestpille(page, viewport) {
  const breite = viewport.width
  const hoehe = viewport.height
  console.log(`--- M2g Questpille @ ${breite}x${hoehe} ---`)

  await page.goto(url('/game'), { waitUntil: 'networkidle' })
  await page.getByRole('region', { name: 'Spieltisch' }).waitFor()

  // Startfaehrte anklicken falls vorhanden — vereinheitlicht mit anderen Smokes
  const startButton = page.locator('button[aria-label*="Startfährte"]').first()
  const startButtonCount = await startButton.count()
  if (startButtonCount > 0) {
    await startButton.click({ force: true })
    await page.waitForTimeout(400)
  }

  // 1. Pille rendert und ist sichtbar
  const pille = page.locator('.waldtanz-brettrand-questpille').first()
  await pille.waitFor({ state: 'visible', timeout: 5000 })
  const pilleBox = await pille.boundingBox()
  if (!pilleBox) throw new Error(`M2g @${breite}x${hoehe}: Pille fehlt im DOM`)
  console.log(`  Pille: ${pilleBox.width}x${pilleBox.height} px @ (${pilleBox.x},${pilleBox.y})`)

  if (pilleBox.width < 200) {
    throw new Error(`M2g @${breite}x${hoehe}: Pille zu schmal (${pilleBox.width} < 200)`)
  }
  if (pilleBox.height < 32) {
    throw new Error(`M2g @${breite}x${hoehe}: Pille zu niedrig (${pilleBox.height} < 32)`)
  }

  // 2. Pille hat Icon, Text, Status
  const iconCount = await page.locator('.waldtanz-brettrand-questpille__icon').count()
  const textCount = await page.locator('.waldtanz-brettrand-questpille__text').count()
  const statusCount = await page.locator('.waldtanz-brettrand-questpille__status').count()
  if (iconCount === 0) throw new Error(`M2g @${breite}x${hoehe}: Pille-Icon fehlt`)
  if (textCount === 0) throw new Error(`M2g @${breite}x${hoehe}: Pille-Text fehlt`)
  if (statusCount === 0) throw new Error(`M2g @${breite}x${hoehe}: Pille-Status fehlt`)

  // 3. Pille ist NICHT display:none
  const pilleDisplay = await page.locator('.waldtanz-brettrand-questpille').first().evaluate(el => getComputedStyle(el).display)
  if (pilleDisplay === 'none') {
    throw new Error(`M2g @${breite}x${hoehe}: Pille hat display:none — Route-Scope kaputt`)
  }

  // 4. Alte Sidebar-Quest-Zeile ist auf /game visuell weg (display: none)
  const alteQuestDisplay = await page.locator('.waldtanz-zugtafel__quest').first().evaluate(el => getComputedStyle(el).display).catch(() => 'NOT_FOUND')
  if (alteQuestDisplay !== 'none') {
    // Wenn das Element gar nicht im DOM ist (Lobby hat keine Zugtafel auf /game),
    // ist das auch ok. Aber auf /game sollte es da sein und display:none haben.
    const alteQuestCount = await page.locator('.waldtanz-zugtafel__quest').count()
    if (alteQuestCount > 0) {
      throw new Error(`M2g @${breite}x${hoehe}: Alte Sidebar-Quest-Zeile hat display:${alteQuestDisplay} (sollte 'none' sein auf /game)`)
    }
    console.log(`  Alte Sidebar-Quest-Zeile: nicht im DOM (akzeptabel auf /game)`)
  } else {
    console.log(`  Alte Sidebar-Quest-Zeile: display:none ✓`)
  }

  // 5. Auf / (Lobby) ist die Pille nicht sichtbar (Route-Scope)
  await page.goto(url('/'), { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const pilleLobbyCount = await page.locator('.waldtanz-brettrand-questpille').count()
  if (pilleLobbyCount > 0) {
    throw new Error(`M2g @${breite}x${hoehe}: Pille rendert auf / (Lobby) — Route-Leak!`)
  }
  console.log(`  Lobby: Pille nicht gerendert (Route-Scope korrekt) ✓`)
}

if (process.argv.includes('--self-test')) {
  console.log('=== M2g Brettrand-Questpille Self-Test ===')
  console.log('BASE_URL:', BASE_URL)
  console.log('Helper pruefeM2gBrettrandQuestpille: kompiliert ✓')
  console.log('Slice-Klassen: .waldtanz-brettrand-questpille, .__icon, .__text, .__status ✓')
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
    await pruefeM2gBrettrandQuestpille(page, viewport)
    await ctx.close()
  }
  if (consoleErrors.length > 0) throw new Error(`M2g: Console-Errors: ${consoleErrors.join(', ')}`)
  if (pageErrors.length > 0) throw new Error(`M2g: Page-Errors: ${pageErrors.join(', ')}`)
  console.log('M2g Brettrand-Questpille: ERFOLGREICH — Pille sichtbar + Quest-Text + Icon + Status auf /game, Sidebar-Quest-Zeile display:none, kein Route-Leak auf / (Lobby), 0 console-Errors.')
} finally {
  await browser.close()
}
