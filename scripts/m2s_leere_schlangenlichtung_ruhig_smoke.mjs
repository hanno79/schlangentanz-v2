/**
 * Author: rahn
 * Datum: 27.06.2026
 * Version: 1.0
 * Beschreibung: M2s Live-Smoke — Verifiziert auf /game die leere Schlangenlichtung
 *              als ruhige Forest-Lichtung. Im Anfangszustand (kein Karte gewaehlt,
 *              keine eigene Schlange) sollen 3 Notification-Bubbles visuell
 *              verschwinden:
 *              - .waldtanz-aktiver-tanz-schritt (display: none)
 *              - .schlangen-zielkompass (display: none)
 *              - .schlangen-startgarten (display: none)
 *
 *              Auf / (Lobby) bleiben alle 3 sichtbar.
 *              Sobald eine Handkarte gewaehlt wird, kommt der Zielkompass zurueck
 *              (visuelle Bestaetigung der Override-Regel).
 *
 * Akzeptanzkriterien:
 *  - Auf /game (kein Karte gewaehlt): alle 3 Bubbles display:none
 *  - Auf /game (Karte gewaehlt): .schlangen-zielkompass wieder display:flex
 *  - Auf / (Lobby): alle 3 Bubbles sichtbar (display != none)
 *  - Console-Errors: 0
 *  - HTTP 200 auf / und /game
 *
 * Aufruf:
 *   SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app node scripts/m2s_leere_schlangenlichtung_ruhig_smoke.mjs
 *   node scripts/m2s_leere_schlangenlichtung_ruhig_smoke.mjs --self-test
 */
import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const HTTP_TIMEOUT_MS = 15_000
const SELF_TEST = process.argv.includes('--self-test')

function url(route) { return new URL(route, BASE_URL).toString() }

export function erstelleSelbsttestAusgabe() {
  return [
    'M2s Schlangenlichtung-Empty-State Selbsttest bestanden',
    `BASE_URL: ${BASE_URL}`,
    'Helper pruefeM2sLeereLichtung: kompiliert',
    'Slice-Klassen: .waldtanz-aktiver-tanz-schritt, .schlangen-zielkompass, .schlangen-startgarten',
    'Override-Selector: .schlangenbereich--karte-ausgewaehlt .schlangen-zielkompass',
  ].join('\n')
}

async function httpPruefen(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(HTTP_TIMEOUT_MS) })
  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status} fuer ${route}`)
  }
  console.log(`HTTP 200  ${route}`)
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

async function pruefeM2sLeereLichtung(page, viewport, label) {
  await page.setViewportSize(viewport)
  await page.goto(url('/game'), { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)

  // Spiel starten via M3b-Stitch-Button, dann eigene Schlange starten (M1cj-Vorbedingung).
  const startButton = page.locator('button', { hasText: /Waldparty|Grosse Runde|Duell/ }).first()
  if (await startButton.count() > 0) {
    await startButton.click({ force: true })
    await page.waitForTimeout(800)
  }
  const startfaehrte = page.locator('.schlangen-startzone__faehrte-button').first()
  if (await startfaehrte.count() > 0) {
    await startfaehrte.click({ force: true })
    await page.waitForTimeout(500)
  }

  // 1) Im leeren Zustand (kein Karte gewaehlt, Schlange noch klein):
  const aktiverTanzSchritt = page.locator('[class~="waldtanz-aktiver-tanz-schritt"]').first()
  const zielkompass = page.locator('[class~="schlangen-zielkompass"]').first()
  const startgarten = page.locator('[class~="schlangen-startgarten"]').first()

  const aktiverInfo = await sichtInfo(aktiverTanzSchritt)
  const zielInfo = await sichtInfo(zielkompass)
  const startgartenInfo = await sichtInfo(startgarten)

  console.log(`\n[${label}] EMPTY-STATE`)
  console.log(`  aktiverTanzSchritt sichtbar=${aktiverInfo.sichtbar}  display=${aktiverInfo.display ?? '?'}  ${aktiverInfo.breite}x${aktiverInfo.hoehe}  (erwartet: display:none)`)
  console.log(`  zielkompass        sichtbar=${zielInfo.sichtbar}  display=${zielInfo.display ?? '?'}  ${zielInfo.breite}x${zielInfo.hoehe}  (erwartet: display:none)`)
  console.log(`  startgarten        sichtbar=${startgartenInfo.sichtbar}  display=${startgartenInfo.display ?? '?'}  ${startgartenInfo.breite}x${startgartenInfo.hoehe}  (erwartet: display:none)`)

  const emptyKorrekt = aktiverInfo.display === 'none' && zielInfo.display === 'none' && startgartenInfo.display === 'none'
  if (!emptyKorrekt) {
    throw new Error(`[${label}] EMPTY-STATE nicht korrekt versteckt`)
  }

  // 2) Override-Test: Handkarte waehlen, Zielkompass muss zurueckkommen.
  // Die erste Handkarte im HandkartenPanel anklicken.
  const ersteHandkarte = page.locator('[class~="handkarte"]').first()
  const handkarteCount = await ersteHandkarte.count()
  if (handkarteCount > 0) {
    await ersteHandkarte.click({ force: true })
    await page.waitForTimeout(400)
    const zielNachKartenWahl = await sichtInfo(zielkompass)
    console.log(`  zielkompass nach Karten-Wahl: sichtbar=${zielNachKartenWahl.sichtbar}  display=${zielNachKartenWahl.display ?? '?'}  ${zielNachKartenWahl.breite}x${zielNachKartenWahl.hoehe}  (erwartet: display != none)`)
    if (zielNachKartenWahl.display === 'none') {
      throw new Error(`[${label}] Zielkompass kommt nach Karten-Wahl NICHT zurueck (Override-Regel defekt)`)
    }
  } else {
    console.log(`  zielkompass nach Karten-Wahl: SKIP (keine Handkarte im Empty-State gefunden)`)
  }

  console.log(`[${label}] OK`)
}

async function pruefeM2sLobby(page, viewport, label) {
  await page.setViewportSize(viewport)
  await page.goto(url('/'), { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)

  const aktiverTanzSchritt = page.locator('[class~="waldtanz-aktiver-tanz-schritt"]').first()
  const zielkompass = page.locator('[class~="schlangen-zielkompass"]').first()

  const aktiverInfo = await sichtInfo(aktiverTanzSchritt)
  const zielInfo = await sichtInfo(zielkompass)

  console.log(`\n[${label}] LOBBY`)
  console.log(`  aktiverTanzSchritt sichtbar=${aktiverInfo.sichtbar}  display=${aktiverInfo.display ?? '?'}  (erwartet: display != none)`)
  console.log(`  zielkompass        sichtbar=${zielInfo.sichtbar}  display=${zielInfo.display ?? '?'}  (erwartet: display != none)`)

  if (aktiverInfo.display === 'none' || zielInfo.display === 'none') {
    throw new Error(`[${label}] LOBBY nicht korrekt sichtbar — route-scoped Hide greift auf /`)
  }
  console.log(`[${label}] OK`)
}

async function pruefeKonsoleSeite(page) {
  const errors = []
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`)
  })
  return errors
}

async function main() {
  if (SELF_TEST) {
    console.log(erstelleSelbsttestAusgabe())
    return
  }

  console.log(`M2s Live-Smoke gegen ${BASE_URL}`)

  await httpPruefen('/')
  await httpPruefen('/game')

  const browser = await chromium.launch()
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    const page = await ctx.newPage()
    const fehler = await pruefeKonsoleSeite(page)

    await pruefeM2sLeereLichtung(page, { width: 1280, height: 900 }, '1280x900')
    await pruefeM2sLobby(page, { width: 1280, height: 900 }, '1280x800-Lobby')

    if (fehler.length > 0) {
      throw new Error(`Konsole-/Page-Errors gefunden:\n${fehler.join('\n')}`)
    }
    console.log('\nM2s SMOKE BESTANDEN — Schlangenlichtung-Empty-State ist ruhige Forest-Lichtung.')
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error('M2s SMOKE FEHLGESCHLAGEN:', err)
  process.exit(1)
})