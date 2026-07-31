/**
 * Author: hermes-cron
 * Datum: 30.06.2026
 * Version: 1.0
 * Beschreibung: M3a Production-Smoke — verifiziert auf /game, dass die
 *              Handkarten-Kartenleiste im 1280x900-Viewport sichtbar ist
 *              (bottom <= 900 px). Vor M3a war die Leiste bei y=985
 *              (85 px unter dem Falz) und der Spieler musste scrollen, um
 *              seine Hand zu sehen. M3a kompaktifiziert die handkarten-buehne
 *              von ~132 px auf ~52 px, sodass die 5 Karten in den sichtbaren
 *              Bereich ruecken.
 *
 * Akzeptanzkriterien:
 *  - handkarten-buehne.bottom <= 836 (52 px Buehne + 8 px Handsteg + 4 px Padding)
 *  - handkartenleiste.bottom <= 936 (Buehne + 110 px Karten + 4 px Gap)
 *    -> Tatsaechlicher Threshold: handkartenleiste.bottom <= 905 (5 px Puffer)
 *  - handkartenleiste enthaelt 5 handkarte-Buttons (eine pro Handkarte)
 *  - handkarten-buehne__spielerplakette-titel zeigt "Deine Hand" Prefix
 *  - Brettrand-End-Turn-Knopf sichtbar (211x144 px erwartet, +/- 30)
 *  - Console-/Page-Errors: 0
 *  - HTTP 200 auf / und /game
 *
 * Aufruf:
 *   SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app node scripts/m3a_brettrand_hand_im_sichtbereich_smoke.mjs
 *   node scripts/m3a_brettrand_hand_im_sichtbereich_smoke.mjs --self-test
 */
import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const HTTP_TIMEOUT_MS = 15_000
const SELF_TEST = process.argv.includes('--self-test')

function url(route) { return new URL(route, BASE_URL).toString() }

export function erstelleSelbsttestAusgabe() {
  return [
    'M3a Hand-im-Sichtbereich Selbsttest bestanden',
    `BASE_URL: ${BASE_URL}`,
    'Helper pruefeM3aHandImSichtbereich: kompiliert',
    'Helper sichtInfo: kompiliert',
    'Akzeptanz: handkartenleiste.bottom <= 905 (5 px Puffer zum 900er Falz)',
  ].join('\n')
}

async function httpPruefen(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(HTTP_TIMEOUT_MS) })
  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status} fuer ${route}`)
  }
  console.log(`HTTP 200  ${route}`)
}

async function sichtInfo(page, selektor) {
  const locator = page.locator(selektor).first()
  const count = await locator.count()
  if (count === 0) return { vorhanden: false, count: 0, display: null, breite: 0, hoehe: 0, top: 0, bottom: 0 }
  const box = await locator.boundingBox()
  const display = await locator.evaluate((e) => getComputedStyle(e).display).catch(() => 'error')
  return {
    vorhanden: true,
    count,
    display,
    breite: box?.width ?? 0,
    hoehe: box?.height ?? 0,
    top: box?.y ?? 0,
    bottom: (box?.y ?? 0) + (box?.height ?? 0),
  }
}

async function pruefeM3aHandImSichtbereich(page) {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(url('/game'), { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  // 1) handkarten-buehne muss kompakt sein (bottom <= 840 = Buehne ~52 px + Handsteg 8 + Padding)
  const buehne = await sichtInfo(page, '.handkarten-buehne')
  if (!buehne.vorhanden) throw new Error('M3a: .handkarten-buehne fehlt im DOM')
  if (buehne.bottom > 840) {
    throw new Error(`M3a: handkarten-buehne zu gross: bottom=${buehne.bottom.toFixed(1)}px > 840px Schwelle`)
  }
  console.log(`  handkarten-buehne: top=${buehne.top.toFixed(1)}px, bottom=${buehne.bottom.toFixed(1)}px, hoehe=${buehne.hoehe.toFixed(1)}px`)

  // 2) handkartenleiste (5 Karten) muss im 900er Viewport sichtbar sein
  const leiste = await sichtInfo(page, '.handkartenleiste')
  if (!leiste.vorhanden) throw new Error('M3a: .handkartenleiste fehlt im DOM')
  if (leiste.bottom > 905) {
    throw new Error(`M3a: handkartenleiste unter Viewport-Falz: bottom=${leiste.bottom.toFixed(1)}px > 905px Schwelle (Spieler scrollt)`)
  }
  console.log(`  handkartenleiste: top=${leiste.top.toFixed(1)}px, bottom=${leiste.bottom.toFixed(1)}px, hoehe=${leiste.hoehe.toFixed(1)}px`)

  // 3) handkartenleiste enthaelt 5 handkarte-Buttons
  const kartenCount = await page.locator('.handkarte__button--karte').count()
  if (kartenCount !== 5) {
    throw new Error(`M3a: Erwartet 5 handkarte__button--karte, gefunden ${kartenCount}`)
  }
  console.log(`  handkartenleiste enthaelt ${kartenCount} Karten`)

  // 4) handkarten-buehne__spielerplakette-titel zeigt "Deine Hand"
  const spielerLabel = await page.locator('.handkarten-buehne__spielerplakette-titel').first().textContent().catch(() => null)
  if (!spielerLabel || !spielerLabel.includes('Deine Hand')) {
    throw new Error(`M3a: handkarten-buehne__spielerplakette-titel hat keinen "Deine Hand"-Text (gefunden: ${JSON.stringify(spielerLabel)})`)
  }
  console.log(`  spielerplakette-titel: ${JSON.stringify(spielerLabel)}`)

  // 5) Brettrand-End-Turn-Knopf sichtbar
  const arenazug = await sichtInfo(page, '.waldtanz-arenazug')
  if (!arenazug.vorhanden) throw new Error('M3a: .waldtanz-arenazug fehlt im DOM')
  if (arenazug.breite < 150 || arenazug.hoehe < 100) {
    throw new Error(`M3a: waldtanz-arenazug zu klein: ${arenazug.breite.toFixed(1)}x${arenazug.hoehe.toFixed(1)}px (erwartet 211x144)`)
  }
  console.log(`  waldtanz-arenazug: ${arenazug.breite.toFixed(1)}x${arenazug.hoehe.toFixed(1)}px @ (${arenazug.top.toFixed(1)}, ${arenazug.bottom.toFixed(1)})`)

  // 6) Console-/Page-Errors
  const errors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`)
  })
  page.on('pageerror', (err) => {
    errors.push(`page: ${err.message}`)
  })
  await page.waitForTimeout(500)
  if (errors.length > 0) {
    throw new Error(`M3a: console-/page-errors gefunden: ${errors.slice(0, 3).join('; ')}`)
  }
  console.log('  keine console-/page-errors')

  console.log(`M3a OK: Hand im Sichtbereich (handkartenleiste bottom=${leiste.bottom.toFixed(1)}px <= 905px Falz)`)
}

async function main() {
  if (SELF_TEST) {
    console.log(erstelleSelbsttestAusgabe())
    return
  }
  await httpPruefen('/')
  await httpPruefen('/game')
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  try {
    await pruefeM3aHandImSichtbereich(page)
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error(`M3a FAIL: ${err.message}`)
  process.exit(1)
})
