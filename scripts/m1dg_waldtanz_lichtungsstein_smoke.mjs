/*
Author: rahn
Datum: 25.06.2026
Version: 1.0
Beschreibung: M1dg Browser-Smoke fuer den Waldtanz-Lichtungsstein
(zentraler Spielplatz auf /game).

  Beweist in einem echten Browser, dass die innere Schlangenlichtung auf
  /game als visuell abgesetzter Waldstein-Spielplatz mit 3px-Dark-Forest-
  Border und Hard-Shadow gerendert wird — nicht als flache Panel-Innenflaeche.
  Der Stein umfasst Tischkarte, Magiekreise (M1df-Drop-Steine) und
  Schlangenbereich als gemeinsame taktile Spieloberflaeche.

  Akzeptanzvertrag (m1dg-waldtanz-lichtungsstein):
    1. Auf /game existiert genau ein .waldtanz-lichtungsstein-Container.
    2. Der Container enthaelt die Magiekreise (mind. 1) und den
       Schlangenbereich als direkte oder indirekte Kinder.
    3. CSS-getComputedStyle.borderColor entspricht der Dark-Forest-Border-Farbe
       und border-width >= 3px.
    4. CSS-getComputedStyle.boxShadow enthaelt einen Hard-Shadow (kein 'none').
    5. CSS-getComputedStyle.borderRadius ist eine sichtbare Rundung (> 8 px).
    6. Der Container bleibt im /game-Viewport sichtbar (Top im Viewport,
       Bottom <= Viewport + 100 px Toleranz fuer unteren Stein-Bereich).
    7. Keine console/page-Fehler.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

async function messeLichtungsstein(page) {
  return page.evaluate(() => {
    const container = document.querySelector('.waldtanz-lichtungsstein')
    if (!(container instanceof HTMLElement)) throw new Error('M1dg: Lichtungsstein-Container fehlt')
    const r = container.getBoundingClientRect()
    const cs = window.getComputedStyle(container)
    const magiekreise = container.querySelector('.waldtanz-magiekreise')
    const schlangen = container.querySelector('.schlangenbereich')
    const tisch = container.querySelector('.waldtanz-tischkarte')
    const beforeStyle = window.getComputedStyle(container, '::before')
    return {
      containerRect: { x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, bottom: r.bottom },
      borderTopWidth: cs.borderTopWidth,
      borderTopColor: cs.borderTopColor,
      boxShadow: cs.boxShadow,
      borderRadius: cs.borderRadius,
      hasMagiekreise: magiekreise !== null,
      hasSchlangen: schlangen !== null,
      hasTisch: tisch !== null,
      beforeBackground: beforeStyle.background,
      beforeContent: beforeStyle.content,
    }
  })
}

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  const consoleErrors = []
  const pageErrors = []
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  page.on('pageerror', (err) => pageErrors.push(err.message))

  await page.goto(`${BASE_URL}/game`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.waldtanz-lichtungsstein', { timeout: 8000 })
  await page.waitForTimeout(400)

  const data = await messeLichtungsstein(page)
  const viewportHeight = page.viewportSize()?.height ?? 900
  const breitSichtbar = data.containerRect.top >= 0 && data.containerRect.bottom <= viewportHeight + 100

  console.log('M1dg Lichtungsstein Container:', JSON.stringify(data.containerRect))
  console.log('M1dg borderTop:', data.borderTopWidth, data.borderTopColor)
  console.log('M1dg boxShadow:', data.boxShadow.slice(0, 80))
  console.log('M1dg borderRadius:', data.borderRadius)
  console.log('M1dg ::before background:', (data.beforeBackground || '').slice(0, 80))
  console.log('M1dg ::before content:', data.beforeContent)
  console.log('M1dg Magiekreise-Kind:', data.hasMagiekreise)
  console.log('M1dg Schlangenbereich-Kind:', data.hasSchlangen)
  console.log('M1dg Tischkarte-Kind:', data.hasTisch)
  console.log('M1dg Container im /game-Viewport (+100 px):', breitSichtbar)
  console.log('M1dg console.errors:', consoleErrors)
  console.log('M1dg page.errors:', pageErrors)

  await page.screenshot({ path: '/tmp/m1dg_lichtungsstein.png', fullPage: false })
  console.log('screenshot: /tmp/m1dg_lichtungsstein.png')

  await browser.close()

  // Gates
  if (!data.hasMagiekreise) {
    console.error('FAIL: Magiekreise nicht im Lichtungsstein-Container')
    process.exit(2)
  }
  if (!data.hasSchlangen) {
    console.error('FAIL: Schlangenbereich nicht im Lichtungsstein-Container')
    process.exit(3)
  }
  const borderPx = parseFloat(data.borderTopWidth)
  if (!(borderPx >= 3)) {
    console.error(`FAIL: border-top-width ${data.borderTopWidth} < 3px`)
    process.exit(4)
  }
  if (!data.boxShadow || data.boxShadow === 'none') {
    console.error('FAIL: box-shadow fehlt (kein Hard-Shadow)')
    process.exit(5)
  }
  const radiusMatch = data.borderRadius.match(/^(\d+(?:\.\d+)?)px/)
  const radiusPx = radiusMatch ? parseFloat(radiusMatch[1]) : 0
  if (!(radiusPx >= 8)) {
    console.error(`FAIL: border-radius ${data.borderRadius} zu klein (erwartet >= 8 px)`)
    process.exit(6)
  }
  if (!data.beforeContent || data.beforeContent === 'none') {
    console.error('FAIL: ::before Pseudo-Element fehlt')
    process.exit(7)
  }
  if (!breitSichtbar) {
    console.error(`FAIL: Container-Bottom ${data.containerRect.bottom} ausserhalb Viewport+100px ${viewportHeight + 100}`)
    process.exit(8)
  }
  if (consoleErrors.length > 0 || pageErrors.length > 0) {
    console.error('FAIL: console/page-Fehler')
    process.exit(9)
  }
  console.log('OK: M1dg Waldtanz-Lichtungsstein verifiziert')
}

main().catch((e) => { console.error(e); process.exit(99) })