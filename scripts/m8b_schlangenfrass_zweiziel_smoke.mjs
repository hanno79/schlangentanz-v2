/*
 * Author: hermes-cron
 * Datum: 30.06.2026
 * Version: 1.0
 * Beschreibung: M8b Browser-Smoke fuer die 2-Gegner-Schlangenfrass-
 *              Zielauswahl (State-Lift in WaldtanzGegnerlichtung).
 *              Verifiziert:
 *              - Auf /game ist die Waldtanz-Gegnerlichtung sichtbar mit
 *                konsolidierter Region.
 *              - Die CSS-Klasse `waldtanz-gegnerlichtung` ist im DOM
 *                vorhanden.
 *              - Ohne Schlangenfrass-Karte keine Bissspuren sichtbar
 *                (negativer Initial-Assert).
 *              - Auf / (Lobby) ist die Gegnerlichtung NICHT sichtbar
 *                (Route-Scope).
 *              - M8a-Pille rendert weiterhin (kein Regress).
 *              - Keine Console-/Page-Errors.
 *
 *              M1dt-Dispens: Der vollstaendige 2-Ziel-Schlangenfrass-
 *              Pfad braucht einen konstruierten 3-Spieler-Zustand mit
 *              Schlangenfrass-Handkarte. Da kein M2d-Fixture-Helper in
 *              Production existiert, verifiziert dieser Smoke den
 *              STRUCTURAL Contract (Region, Route-Scope, keine
 *              Regression der M8a-Pille).
 *
 * Self-Test-Mode: --self-test prueft nur BASE_URL und Helper-Kompilation.
 */

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const SELF_TEST = process.argv.includes('--self-test')

function url(route) { return new URL(route, BASE_URL).toString() }

async function httpPruefen(basis) {
  const response = await fetch(basis, { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`M8b: HTTP ${response.status} fuer ${basis}`)
}

async function sichtInfo(page, selektor) {
  return await page.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!(el instanceof HTMLElement)) return { vorhanden: false }
    const rect = el.getBoundingClientRect()
    const style = getComputedStyle(el)
    return {
      vorhanden: true,
      display: style.display,
      sichtbar: rect.width >= 4 && rect.height >= 4 && style.display !== 'none' && style.visibility !== 'hidden',
      breite: Math.round(rect.width),
      hoehe: Math.round(rect.height),
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      textInhalt: el.textContent?.trim().slice(0, 80) ?? '',
    }
  }, selektor)
}

async function pruefeM8bGegnerlichtung(page, viewport) {
  const breite = viewport.width
  const hoehe = viewport.height
  console.log(`--- M8b Gegnerlichtung State-Lift @ ${breite}x${hoehe} ---`)

  await page.goto(url('/game'), { waitUntil: 'networkidle' })

  // Phase 1: Region "Waldtanz-Gegnerlichtung" muss vorhanden sein.
  const gegnerlichtung = page.getByRole('region', { name: 'Waldtanz-Gegnerlichtung' })
  const gegnerlichtungCount = await gegnerlichtung.count()
  if (gegnerlichtungCount === 0) {
    throw new Error(`M8b @${breite}x${hoehe}: Region 'Waldtanz-Gegnerlichtung' fehlt im DOM`)
  }
  console.log(`  Region 'Waldtanz-Gegnerlichtung': ${gegnerlichtungCount}x vorhanden ✓`)

  // Phase 2: Erste Instanz der Region muss sichtbar sein.
  const ersteSicht = await sichtInfo(page, '.waldtanz-gegnerlichtung')
  if (!ersteSicht.vorhanden) {
    throw new Error(`M8b @${breite}x${hoehe}: CSS-Klasse .waldtanz-gegnerlichtung fehlt im DOM`)
  }
  if (!ersteSicht.sichtbar) {
    throw new Error(`M8b @${breite}x${hoehe}: Erste Gegnerlichtung-Instanz unsichtbar (display=${ersteSicht.display}, ${ersteSicht.breite}x${ersteSicht.hoehe})`)
  }
  console.log(`  Erste Gegnerlichtung sichtbar: ${ersteSicht.breite}x${ersteSicht.hoehe} px @ (${ersteSicht.x},${ersteSicht.y})`)

  // Phase 3: Negativer Initial-Assert — ohne Schlangenfrass-Spielzug keine
  // 2-Ziel-Bissspur sichtbar.
  const bissspurAnzahlInitial = await page.locator('.schlangenfrass-zweiziel-kompass').count()
  if (bissspurAnzahlInitial > 0) {
    throw new Error(`M8b @${breite}x${hoehe}: 2-Ziel-Bissspur sichtbar ohne aktive Schlangenfrass-Aktion (Initial-State)`)
  }
  console.log(`  Initial: 0 2-Ziel-Bissspuren sichtbar ✓ (kein Schlangenfrass aktiv)`)

  // Phase 4: M8a-Pille rendert weiterhin (kein Regress durch State-Lift).
  // Im Initial-State ist sie unsichtbar (letzteAktion === null), aber im DOM.
  const pilleVorhanden = await page.locator('[data-testid="waldtanz-letzte-aktion-hinweis"]').count()
  if (pilleVorhanden === 0) {
    throw new Error(`M8b @${breite}x${hoehe}: M8a-Pille fehlt im DOM (Regress durch State-Lift)`)
  }
  console.log(`  M8a-Pille im DOM: ${pilleVorhanden}x ✓ (kein Regress)`)

  // Phase 5: Auf / (Lobby) ist die Gegnerlichtung NICHT sichtbar.
  await page.goto(url('/'), { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const lobbyGegnerlichtung = await sichtInfo(page, '.waldtanz-gegnerlichtung')
  if (lobbyGegnerlichtung.vorhanden && lobbyGegnerlichtung.sichtbar) {
    throw new Error(`M8b @${breite}x${hoehe}: Gegnerlichtung auf / (Lobby) sichtbar — Route-Scope kaputt (${lobbyGegnerlichtung.breite}x${lobbyGegnerlichtung.hoehe})`)
  }
  console.log(`  Auf / (Lobby): Gegnerlichtung unsichtbar ✓ (Route-Scope hält)`)
}

async function fuehreSelbsttestAus() {
  console.log(`M8b Self-Test: Skript kompiliert, BASE_URL = ${BASE_URL}`)
  console.log('OK')
}

async function fuehreLiveSmokeAus() {
  await httpPruefen(BASE_URL)
  const browser = await chromium.launch()
  try {
    for (const viewport of [
      { width: 1280, height: 900 },
      { width: 1100, height: 800 },
    ]) {
      const seite = await browser.newPage({ viewport })
      const consoleErrors = []
      const pageErrors = []
      seite.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
      seite.on('pageerror', (err) => pageErrors.push(err.message))
      await pruefeM8bGegnerlichtung(seite, viewport)
      if (consoleErrors.length > 0) throw new Error(`M8b: ${consoleErrors.length} console-Errors: ${consoleErrors.slice(0, 3).join(' | ')}`)
      if (pageErrors.length > 0) throw new Error(`M8b: ${pageErrors.length} page-Errors: ${pageErrors.slice(0, 3).join(' | ')}`)
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
