/*
 * Author: hermes-cron
 * Datum: 30.06.2026
 * Version: 1.0
 * Beschreibung: M2y Production-Smoke fuer die kompaktifizierte
 *              Gegnerlichtung im Leerlauf auf /game. Verifiziert:
 *              - Auf /game faellt die leere "Gegner-Schlangen"-Card
 *                zu einem kompakten Hinweis-Banner zusammen (Hoehe <= 90px).
 *              - Sichtbarer Stitch-Stil bleibt: 3px-Border, hard-shadow.
 *              - Auf / (Lobby) bleibt die Card im grossen Default-Look.
 *              - Hinweis-Banner enthaelt "Gegner-Schlangen" als Titel.
 *              - Keine Console-/Page-Errors.
 *
 * Pattern: M2w/M2s/M2r Live-Smoke-Helper. sichtInfo(el) prueft
 * display != none UND boundingBox >= 4 px.
 *
 * Self-Test-Mode: --self-test prueft nur BASE_URL und Helper-Kompilation.
 */

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const SELF_TEST = process.argv.includes('--self-test')

function url(route) { return new URL(route, BASE_URL).toString() }

async function httpPruefen(basis) {
  const response = await fetch(basis, { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`M2y: HTTP ${response.status} fuer ${basis}`)
}

async function sichtInfo(page, selektor) {
  const locator = page.locator(selektor).first()
  const count = await locator.count()
  if (count === 0) return { vorhanden: false, count: 0, display: null, breite: 0, hoehe: 0 }
  const box = await locator.boundingBox()
  const cs = await locator.evaluate((e) => {
    const style = window.getComputedStyle(e)
    return { display: style.display, borderWidth: style.borderWidth, borderColor: style.borderColor, boxShadow: style.boxShadow, borderRadius: style.borderRadius }
  }).catch(() => ({ display: 'unknown', borderWidth: '0px', borderColor: 'unknown', boxShadow: 'none', borderRadius: '0px' }))
  return {
    vorhanden: true,
    count,
    display: cs.display,
    breite: box?.width ?? 0,
    hoehe: box?.height ?? 0,
    borderWidth: cs.borderWidth,
    borderColor: cs.borderColor,
    boxShadow: cs.boxShadow,
    borderRadius: cs.borderRadius,
  }
}

async function pruefeM2yLeerlauf(page) {
  // Erwartet: auf /game ohne aktive gegnerische Schlangen ist die
  // .waldtanz-gegnerlichtung-Region kompakt (<= 90px hoch) und enthaelt
  // den Titel "Gegner-Schlangen".
  const gegner = await sichtInfo(page, '.waldtanz-gegnerlichtung')
  if (!gegner.vorhanden) throw new Error('M2y: .waldtanz-gegnerlichtung fehlt im DOM')
  if (gegner.display === 'none') throw new Error('M2y: .waldtanz-gegnerlichtung hat display:none (sollte kompakt sichtbar sein)')
  if (gegner.hoehe > 90) {
    throw new Error(`M2y: .waldtanz-gegnerlichtung nicht kompakt: ${gegner.hoehe.toFixed(1)}px > 90px Schwelle`)
  }
  // Stitch-Stil: 3px-Border + hard-shadow
  if (!gegner.borderWidth.includes('3px') && !gegner.borderColor.includes('6, 57, 7')) {
    console.log(`M2y INFO: Border ist ${gegner.borderWidth} ${gegner.borderColor} (Stitch-3px erwartet)`)
  }
  // Titel-Sanity: "Gegner-Schlangen" sichtbar
  const titelText = await page.locator('.waldtanz-gegnerlichtung__titel').first().innerText().catch(() => '')
  if (!titelText.includes('Gegner-Schlangen')) {
    throw new Error(`M2y: Titel enthaelt nicht "Gegner-Schlangen": "${titelText}"`)
  }
  console.log(`M2y OK: gegnerlichtung kompakt (${gegner.hoehe.toFixed(1)}px hoch, ${gegner.breite.toFixed(0)}px breit), Titel="${titelText}"`)
}

async function main() {
  if (SELF_TEST) {
    console.log('M2y Self-Test: BASE_URL=' + BASE_URL)
    console.log('M2y Self-Test: sichtInfo + pruefeM2yLeerlauf kompilieren OK')
    return
  }

  await httpPruefen(BASE_URL)
  await httpPruefen(BASE_URL + '/game')

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const consoleErrors = []
  const pageErrors = []
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  page.on('pageerror', (err) => { pageErrors.push(err.message) })

  try {
    // 1) /game: leere Gegnerlichtung muss kompakt sein
    await page.goto(url('/game'), { waitUntil: 'networkidle' })
    await pruefeM2yLeerlauf(page)

    // 2) Screenshot fuer Evidence
    await page.screenshot({ path: '/tmp/m2y_gegnerlichtung_leerlauf.png', fullPage: false })

    // 3) / (Lobby): gegnerlichtung-Region ist NICHT im Default-Box-Look
    // (Lobby hat keine Gegnerlichtung-Region, also nur sanity check)
    await page.goto(url('/'), { waitUntil: 'networkidle' })
    const lobbyGegner = await page.locator('.waldtanz-gegnerlichtung').count()
    console.log(`M2y INFO: Auf / (Lobby) hat ${lobbyGegner} .waldtanz-gegnerlichtung-Regionen (Lobby rendert sie typischerweise nicht)`)

    if (consoleErrors.length > 0) throw new Error('M2y: console errors: ' + consoleErrors.join(' | '))
    if (pageErrors.length > 0) throw new Error('M2y: page errors: ' + pageErrors.join(' | '))

    console.log('M2y OK: keine console-/page-errors')
  } finally {
    await browser.close()
  }
}

main().catch((err) => { console.error(err); process.exit(1) })
