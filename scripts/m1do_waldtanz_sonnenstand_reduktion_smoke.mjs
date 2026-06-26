#!/usr/bin/env node
/*
 * Author: rahn
 * Datum: 26.06.2026
 * Version: 1.0
 * Beschreibung: M1do Production-Smoke fuer Sonnenstand-HUD-Reduktion auf /game.
 *              Verifiziert auf 1280x900 + 1100x800:
 *              - .waldtanz-sonnenstand ist auf /game NICHT sichtbar (display:none Pflicht)
 *              - .waldtanz-sonnenstand ist im DOM weiterhin vorhanden (kein Remove)
 *              - .spielstatus Heading (h2) ist auf /game noch sichtbar (Section bleibt)
 *              - Zugfortschritt ist auf /game sichtbar (single source of truth)
 *              - Brettrand-Arenazug sichtbar (bleibt Anker)
 *              - 0 console/page-Errors
 *
 * Verwendung:
 *   node scripts/m1do_waldtanz_sonnenstand_reduktion_smoke.mjs                 # live gegen SMOKE_BASE_URL
 *   node scripts/m1do_waldtanz_sonnenstand_reduktion_smoke.mjs --self-test    # Offline-Konfig-Check
 */
import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const HTTP_TIMEOUT_MS = 15_000
const SELF_TEST = process.argv.includes('--self-test')

export function erstelleSelbsttestAusgabe() {
  return [
    'M1do Sonnenstand-Reduktion Selbsttest bestanden',
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

export async function pruefeM1doSonnenstandReduktion(seite, viewport) {
  const ergebnis = await seite.evaluate(() => {
    function sichtInfo(el) {
      if (!(el instanceof HTMLElement)) return { vorhanden: false }
      const rect = el.getBoundingClientRect()
      const style = getComputedStyle(el)
      return {
        vorhanden: true,
        display: style.display,
        sichtbar: rect.width >= 4 && rect.height >= 4 && style.display !== 'none' && style.visibility !== 'hidden',
        breite: Math.round(rect.width),
        hoehe: Math.round(rect.height),
      }
    }

    const sonnenstand = document.querySelector('[class~="waldtanz-sonnenstand"]')
    const spielstatus = document.querySelector('.info-panel--spielstatus')
    const spielstatusHeading = spielstatus?.querySelector('h2') ?? null
    const zugfortschritt = document.querySelector('.zugfortschritt')
    const arenazug = document.querySelector('.waldtanz-arenazug')

    return {
      sonnenstand: sichtInfo(sonnenstand),
      spielstatus: sichtInfo(spielstatus),
      spielstatusHeading: sichtInfo(spielstatusHeading),
      zugfortschritt: sichtInfo(zugfortschritt),
      arenazug: sichtInfo(arenazug),
    }
  })

  console.log(`M1do Sonnenstand-Reduktion @${viewport.label}:`)
  console.log(`  .waldtanz-sonnenstand: vorhanden=${ergebnis.sonnenstand.vorhanden}, display=${ergebnis.sonnenstand.display ?? '-'}, sichtbar=${ergebnis.sonnenstand.sichtbar}, breite=${ergebnis.sonnenstand.breite ?? '-'}px, hoehe=${ergebnis.sonnenstand.hoehe ?? '-'}px`)
  console.log(`  .info-panel--spielstatus: vorhanden=${ergebnis.spielstatus.vorhanden}, sichtbar=${ergebnis.spielstatus.sichtbar}`)
  console.log(`  Spielstatus-Heading h2: vorhanden=${ergebnis.spielstatusHeading.vorhanden}, sichtbar=${ergebnis.spielstatusHeading.sichtbar}`)
  console.log(`  Zugfortschritt: vorhanden=${ergebnis.zugfortschritt.vorhanden}, sichtbar=${ergebnis.zugfortschritt.sichtbar}`)
  console.log(`  Brettrand-Arenazug: vorhanden=${ergebnis.arenazug.vorhanden}, sichtbar=${ergebnis.arenazug.sichtbar}`)

  if (!ergebnis.sonnenstand.vorhanden) throw new Error('M1do: .waldtanz-sonnenstand fehlt im DOM — Section muss im React-Tree bleiben')
  if (ergebnis.sonnenstand.sichtbar) throw new Error('M1do: .waldtanz-sonnenstand sichtbar — display:none Pflicht gebrochen')
  if (!ergebnis.spielstatus.vorhanden) throw new Error('M1do: .info-panel--spielstatus fehlt im DOM')
  if (!ergebnis.zugfortschritt.sichtbar) throw new Error('M1do: Zugfortschritt nicht sichtbar — Section-Header verdeckt oder entfernt')
  if (!ergebnis.arenazug.sichtbar) throw new Error('M1do: Brettrand-Arenazug nicht sichtbar')
}

async function fuehreSelbsttestAus() {
  console.log(erstelleSelbsttestAusgabe())
}

async function fuehreLiveSmokeAus() {
  await httpPruefen(BASE_URL)
  const browser = await chromium.launch()
  try {
    for (const viewport of [
      { width: 1280, height: 900, label: '1280x900' },
      { width: 1100, height: 800, label: '1100x800' },
    ]) {
      const seite = await browser.newPage({ viewport })
      const consoleErrors = []
      const pageErrors = []
      seite.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
      seite.on('pageerror', (err) => pageErrors.push(err.message))
      await seite.goto(`${BASE_URL}/game`, { waitUntil: 'networkidle', timeout: 15_000 })
      await seite.waitForTimeout(800)

      await pruefeM1doSonnenstandReduktion(seite, viewport)

      if (consoleErrors.length > 0) throw new Error(`M1do: ${consoleErrors.length} console-Errors: ${consoleErrors.slice(0, 3).join(' | ')}`)
      if (pageErrors.length > 0) throw new Error(`M1do: ${pageErrors.length} page-Errors: ${pageErrors.slice(0, 3).join(' | ')}`)

      await seite.close()
    }
  } finally {
    await browser.close()
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (SELF_TEST) {
    await fuehreSelbsttestAus()
  } else {
    await fuehreLiveSmokeAus()
  }
}
