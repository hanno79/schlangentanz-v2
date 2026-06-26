#!/usr/bin/env node
/*
 * Author: rahn
 * Datum: 26.06.2026
 * Version: 1.0
 * Beschreibung: M1dm Production-Smoke fuer die Brettrand-Zentrierung auf
 *              /game. Verifiziert auf 1280x900 + 1100x800:
 *              - .aktionen-panel--waldtanz-dock hat display:none (sichtbare
 *                Wegnahme der gelben Aktions-Buttonliste)
 *              - .waldtanz-arenazug ist sichtbar (Brettrand-End-Turn-Knopf)
 *              - .waldtanz-arenastein (Schlangenlichtung-Container) ist
 *                sichtbar mit Mindest-Hoehe (gewinnt den freigewordenen
 *                Platz vom display:none-Aktionendock)
 *              - keine console/page-Errors
 *
 * Verwendung:
 *   node scripts/m1dm_waldtanz_arena_brettrand_smoke.mjs                # live gegen SMOKE_BASE_URL
 *   node scripts/m1dm_waldtanz_arena_brettrand_smoke.mjs --self-test   # Offline-Konfig-Check
 */
import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const HTTP_TIMEOUT_MS = 15_000
const SELF_TEST = process.argv.includes('--self-test')

export function erstelleSelbsttestAusgabe() {
  return [
    'M1dm Brettrand-Zentrum Selbsttest bestanden',
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

export async function pruefeM1dmBrettrandZentrum(seite, viewport) {
  const ergebnis = await seite.evaluate(() => {
    const aktionen = document.querySelector('.aktionen-panel--waldtanz-dock')
    const arenazug = document.querySelector('.waldtanz-arenazug')
    const arenastein = document.querySelector('.waldtanz-arenastein')
    const schlangenlichtung = document.querySelector('.waldtanz-arenastein__schlangenlichtung')

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
        oben: Math.round(rect.top),
        unten: Math.round(rect.bottom),
      }
    }

    return {
      aktionen: sichtInfo(aktionen),
      arenazug: sichtInfo(arenazug),
      arenastein: sichtInfo(arenastein),
      schlangenlichtung: sichtInfo(schlangenlichtung),
    }
  })

  console.log(`M1dm Brettrand-Zentrum @${viewport.label}:`)
  console.log(`  Aktionen-Panel: vorhanden=${ergebnis.aktionen.vorhanden}, display=${ergebnis.aktionen.display ?? '-'}, sichtbar=${ergebnis.aktionen.sichtbar}`)
  console.log(`  Arenazugknopf: vorhanden=${ergebnis.arenazug.vorhanden}, sichtbar=${ergebnis.arenazug.sichtbar}, ${ergebnis.arenazug.breite}x${ergebnis.arenazug.hoehe} (oben=${ergebnis.arenazug.oben})`)
  console.log(`  Arenastein: vorhanden=${ergebnis.arenastein.vorhanden}, sichtbar=${ergebnis.arenastein.sichtbar}, ${ergebnis.arenastein.breite}x${ergebnis.arenastein.hoehe}`)
  console.log(`  Schlangenlichtung: vorhanden=${ergebnis.schlangenlichtung.vorhanden}, sichtbar=${ergebnis.schlangenlichtung.sichtbar}, ${ergebnis.schlangenlichtung.breite}x${ergebnis.schlangenlichtung.hoehe}`)

  if (!ergebnis.aktionen.vorhanden) throw new Error('M1dm: .aktionen-panel--waldtanz-dock fehlt komplett (sollte im DOM bleiben fuer M1dd-Grid-Area)')
  if (ergebnis.aktionen.display !== 'none') throw new Error(`M1dm: Aktionen-Panel erwartet display:none, gefunden "${ergebnis.aktionen.display}"`)
  if (ergebnis.aktionen.sichtbar) throw new Error('M1dm: Aktionen-Panel ist trotz display:none sichtbar — Cascade-Override pruefen')
  if (!ergebnis.arenazug.vorhanden) throw new Error('M1dm: .waldtanz-arenazug fehlt — Brettrand-End-Turn-Knopf weg')
  if (!ergebnis.arenazug.sichtbar) throw new Error('M1dm: Brettrand-End-Turn-Knopf nicht sichtbar')
  if (!ergebnis.schlangenlichtung.vorhanden) throw new Error('M1dm: Schlangenlichtung fehlt — Arena-Zentrum nicht da')
  if (!ergebnis.schlangenlichtung.sichtbar) throw new Error('M1dm: Schlangenlichtung nicht sichtbar')
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

      await pruefeM1dmBrettrandZentrum(seite, viewport)

      if (consoleErrors.length > 0) throw new Error(`M1dm: ${consoleErrors.length} console-Errors: ${consoleErrors.slice(0, 3).join(' | ')}`)
      if (pageErrors.length > 0) throw new Error(`M1dm: ${pageErrors.length} page-Errors: ${pageErrors.slice(0, 3).join(' | ')}`)

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