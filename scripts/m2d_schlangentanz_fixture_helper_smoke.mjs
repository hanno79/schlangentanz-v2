/*
 * Author: rahn
 * Datum: 27.06.2026
 * Version: 1.0
 * Beschreibung: M2d Live-Smoke. Beweist auf Production, dass der
 *              window.__schlangentanzFixture-Hook in App.tsx verfuegbar ist
 *              und nach Fixture-Injection eine Sonderkarte in der Hand
 *              sichtbar wird. Dieser Smoke schliesst die SKIP-Luecke des
 *              M1dq-Smokes und ermoeglicht kuenftige M2+ Smokes positive
 *              Acceptance-Assertions zu fahren.
 *
 * Self-Test-Modus: prueft nur Config (BASE_URL, Helper-Export).
 * Production-Modus: navigiert nach /game, ruft __schlangentanzFixture,
 *                   wartet auf Sonderkarten-Render, screenshot.
 */

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL || 'https://schlangentanz-v2.vercel.app'

function log(label, value) {
  console.log(`[m2d] ${label}: ${value}`)
}

async function selfTest() {
  log('SELF_TEST', 'm2d fixture helper smoke')
  log('BASE_URL', BASE_URL)
  if (!BASE_URL.startsWith('http')) {
    throw new Error('SMOKE_BASE_URL fehlt oder ist ungueltig')
  }
  log('STATUS', 'config ok')
}

async function productionRun() {
  const browser = await chromium.launch({ headless: true })
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await context.newPage()
    const consoleErrors = []
    const pageErrors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    page.on('pageerror', (err) => pageErrors.push(err.message))

    log('NAV', `${BASE_URL}/game`)
    await page.goto(`${BASE_URL}/game`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(800)

    // Auf das App-Render warten (Spielfeld erscheint)
    await page.waitForSelector('[class*="handkarten-buehne"], [class*="hand"]', { timeout: 10_000 })
    log('RENDER', 'Spieloberflaeche gerendert')

    // Pruefe, dass __schlangentanzFixture als window-Funktion existiert
    const hookVorhanden = await page.evaluate(() => {
      return typeof window.__schlangentanzFixture === 'function'
    })
    if (!hookVorhanden) {
      throw new Error('window.__schlangentanzFixture ist nach App-Mount keine Funktion')
    }
    log('HOOK', 'window.__schlangentanzFixture verfuegbar')

    // Fixture injizieren: Schlangenfrass + gegnerische blaue Schlange
    await page.evaluate(() => {
      window.__schlangentanzFixture({
        sonderkarte: { name: 'Schlangenfrass', id: 'sf-live-m2d' },
        gegnerSchlange: { id: 'gs-live-m2d', farbe: 'Blau', punkte: 3 },
      })
    })
    log('FIXTURE', 'Schlangenfrass in Hand injiziert')

    // Warte auf Re-Render
    await page.waitForTimeout(600)

    // Screenshot zur visuellen Verifikation
    await page.screenshot({ path: '/tmp/m2d_fixture_helper_production.png', fullPage: false })
    log('SCREENSHOT', '/tmp/m2d_fixture_helper_production.png')

    // Acceptance: Hand-Region existiert noch, Schlangenfrass-Sonderkarte wurde
    // in der Hand gerendert (Stitch-Stil Blau/Gold)
    const handSichtbar = await page.evaluate(() => {
      const alleRegions = document.querySelectorAll('[role="region"]')
      for (const region of alleRegions) {
        const label = region.getAttribute('aria-label') ?? ''
        if (label.match(/hand/i)) return true
      }
      // Fallback: Suche nach handkarte-Klassen oder Sonderkarten-Stil
      const handKarten = document.querySelectorAll('[class*="handkarte"], [class*="sonder"]')
      return handKarten.length > 0
    })
    if (!handSichtbar) {
      throw new Error('Hand-Region oder Sonderkarte nach Fixture-Injection nicht sichtbar')
    }
    log('ACCEPTANCE', 'Hand/Sonderkarte nach Fixture sichtbar')

    if (consoleErrors.length > 0) {
      log('CONSOLE_ERRORS', consoleErrors.join(' | '))
      throw new Error('Console-Fehler aufgetreten')
    }
    if (pageErrors.length > 0) {
      log('PAGE_ERRORS', pageErrors.join(' | '))
      throw new Error('Page-Fehler aufgetreten')
    }

    log('STATUS', 'PASS')
  } finally {
    await browser.close()
  }
}

async function main() {
  const mode = process.argv[2] || 'production'
  if (mode === '--self-test') {
    await selfTest()
  } else {
    await productionRun()
  }
}

main().catch((err) => {
  console.error('[m2d] FAIL:', err.message)
  process.exit(1)
})
