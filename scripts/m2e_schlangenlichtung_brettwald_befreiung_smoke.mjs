/**
 * Author: rahn
 * Datum: 27.06.2026
 * Version: 1.0
 * Beschreibung: M2e Smoke — Verifiziert auf /game die Schlangenlichtung-Brettwald-
 *              Befreiung: die linke .info-panel--spielstatus-Sidebar und die untere
 *              .waldtanz-hud-Panel-Reihe (Wertung/Material/Spieleruebersicht) sind
 *              auf /game via route-scoped display:none versteckt, die zentrale
 *              .spielbrett--waldtanz-Region ist visuell prominent (>= 55% Viewport-Hoehe
 *              im 900px-Erstbild).
 *
 * Aufruf:
 *   SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app node scripts/m2e_schlangenlichtung_brettwald_befreiung_smoke.mjs
 *   node scripts/m2e_schlangenlichtung_brettwald_befreiung_smoke.mjs --self-test
 */
import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const HTTP_TIMEOUT_MS = 15_000
const SELF_TEST = process.argv.includes('--self-test')

export function erstelleSelbsttestAusgabe() {
  return [
    'M2e Schlangenlichtung-Brettwald-Befreiung Selbsttest bestanden',
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

async function sichtInfo(locator) {
  try {
    const box = await locator.boundingBox()
    if (!box || box.width < 2 || box.height < 2) {
      return { sichtbar: false, breite: box?.width ?? 0, hoehe: box?.height ?? 0 }
    }
    const display = await locator.evaluate((el) => getComputedStyle(el).display)
    return { sichtbar: display !== 'none', breite: box.width, hoehe: box.height, display }
  } catch (err) {
    return { sichtbar: false, breite: 0, hoehe: 0, display: 'error', fehler: String(err) }
  }
}

async function starteSpiel(page) {
  await page.goto(`${BASE_URL}/game`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  const startButton = page.locator('button', { hasText: /Waldparty|Grosse Runde|Duell/ }).first()
  if (await startButton.count() > 0) {
    await startButton.click({ force: true })
    await page.waitForTimeout(800)
  }
}

async function pruefeBrettwaldBefreiung(page, viewport, label) {
  await page.setViewportSize(viewport)
  await starteSpiel(page)

  // Starte die erste eigene Schlange ueber die Startfaehrte (Vorbedingung fuer eigenes Brett)
  const startfaehrte = page.locator('.schlangen-startzone__faehrte-button').first()
  if (await startfaehrte.count() > 0) {
    await startfaehrte.click({ force: true })
    await page.waitForTimeout(500)
  }
  const nachzieh = page.locator('button', { hasText: /Karte ziehen|Nachziehen/ }).first()
  if (await nachzieh.count() > 0) {
    await nachzieh.click({ force: true }).catch(() => {})
    await page.waitForTimeout(400)
  }

  // Sidebar-Status-Panel (sollte display:none haben)
  const statusPanel = page.locator('.info-panel--spielstatus').first()
  const statusInfo = await sichtInfo(statusPanel)
  const statusComputedDisplay = await statusPanel.evaluate((el) => getComputedStyle(el).display).catch(() => '?')

  // Untere HUD-Reihe (Wertung/Material/Spieleruebersicht)
  const hudPanel = page.locator('.waldtanz-hud').first()
  const hudInfo = await sichtInfo(hudPanel)
  const hudComputedDisplay = await hudPanel.evaluate((el) => getComputedStyle(el).display).catch(() => '?')

  // Brettschritt-Bereich (sollte sichtbar und gross sein)
  const brett = page.locator('.spielbrett--waldtanz').first()
  const brettInfo = await sichtInfo(brett)
  const viewportH = viewport.height
  const brettHoeheAnteil = brettInfo.sichtbar ? brettInfo.hoehe / viewportH : 0

  // Schlangenlichtung (sollte erhalten sein)
  const lichtung = page.locator('[class~="waldtanz-schlangenlichtung"]').first()
  const lichtungInfo = await sichtInfo(lichtung)

  // HandkartenPanel (sollte noch da sein)
  const hand = page.locator('[class~="handkartenleiste"]').first()
  const handInfo = await sichtInfo(hand)

  return {
    label,
    viewport: { breite: viewport.width, hoehe: viewport.height },
    statusPanel: { ...statusInfo, computedDisplay: statusComputedDisplay },
    hudPanel: { ...hudInfo, computedDisplay: hudComputedDisplay },
    brett: { ...brettInfo, hoeheAnteil: Math.round(brettHoeheAnteil * 100) / 100 },
    lichtung: lichtungInfo,
    hand: handInfo,
  }
}

function akzeptanzPruefen(ergebnis) {
  const fehler = []
  if (ergebnis.statusPanel.computedDisplay !== 'none') {
    fehler.push(`statusPanel nicht display:none (computed=${ergebnis.statusPanel.computedDisplay})`)
  }
  if (ergebnis.hudPanel.computedDisplay !== 'none') {
    fehler.push(`hudPanel nicht display:none (computed=${ergebnis.hudPanel.computedDisplay})`)
  }
  if (!ergebnis.brett.sichtbar) {
    fehler.push('brett nicht sichtbar')
  }
  if (ergebnis.brett.hoeheAnteil < 0.55) {
    fehler.push(`brett zu niedrig: ${Math.round(ergebnis.brett.hoeheAnteil * 100)}% < 55% der Viewport-Hoehe`)
  }
  if (!ergebnis.lichtung.sichtbar) {
    fehler.push('Schlangenlichtung fehlt (Konsolidierung zu aggressiv)')
  }
  if (!ergebnis.hand.sichtbar) {
    fehler.push('Handkartenleiste fehlt')
  }
  return fehler
}

async function main() {
  if (SELF_TEST) {
    console.log(erstelleSelbsttestAusgabe())
    return
  }
  await httpPruefen(new URL('/game', BASE_URL).toString())
  const browser = await chromium.launch()
  const ergebnisse = []
  try {
    const context = await browser.newContext()
    const page = await context.newPage()
    const consoleErrors = []
    page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`))
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(`console.error: ${msg.text()}`)
    })

    for (const viewport of [{ width: 1280, height: 900 }, { width: 1100, height: 800 }]) {
      const erg = await pruefeBrettwaldBefreiung(page, viewport, viewport.width + 'x' + viewport.height)
      ergebnisse.push(erg)
    }

    console.log('\n=== M2e Schlangenlichtung-Brettwald-Befreiung ===')
    for (const erg of ergebnisse) {
      const akzeptanz = akzeptanzPruefen(erg)
      console.log(`\n[${erg.label}]`)
      console.log(`  statusPanel.display=${erg.statusPanel.computedDisplay}  (erwartet: none)`)
      console.log(`  hudPanel.display=${erg.hudPanel.computedDisplay}  (erwartet: none)`)
      console.log(`  brett sichtbar=${erg.brett.sichtbar}  ${erg.brett.breite}x${erg.brett.hoehe}  (Anteil: ${Math.round(erg.brett.hoeheAnteil * 100)}% — erwartet >= 55%)`)
      console.log(`  lichtung sichtbar=${erg.lichtung.sichtbar}  ${erg.lichtung.breite}x${erg.lichtung.hoehe}`)
      console.log(`  hand sichtbar=${erg.hand.sichtbar}  ${erg.hand.breite}x${erg.hand.hoehe}`)
      if (akzeptanz.length > 0) {
        console.log(`  FEHLER: ${akzeptanz.join('; ')}`)
      } else {
        console.log(`  OK`)
      }
    }
    if (consoleErrors.length > 0) {
      console.log(`\nConsole-Errors: ${consoleErrors.length}`)
      for (const e of consoleErrors.slice(0, 5)) console.log(`  ${e}`)
    }

    const alleFehler = ergebnisse.flatMap(akzeptanzPruefen)
    if (alleFehler.length > 0) {
      console.log(`\nM2e SMOKE FEHLGESCHLAGEN: ${alleFehler.length} Akzeptanzverletzungen`)
      process.exit(1)
    }
    console.log('\nM2e SMOKE BESTANDEN — Schlangenlichtung ist die visuelle Buehne auf /game.')
  } finally {
    await browser.close()
  }
}

main().catch((err) => { console.error('M2e Smoke-Fehler:', err); process.exit(1) })
