/*
 * Author: hermes-cron
 * Datum: 29.06.2026
 * Version: 1.0
 * Beschreibung: M8a Browser-Smoke fuer die sichtbare "Zuletzt ausgefuehrt"-Pille
 *              am Brettrand. Verifiziert:
 *              - Auf /game erscheint die Pille sobald eine Aktion ausgefuehrt
 *                wurde (Startfaehrte -> Handkarte -> Anlegeplatz-Klick).
 *              - Pille hat sichtbare Groesse (>= 180x40 px) und sichtbaren Border.
 *              - Pille enthaelt Eyebrow "Zuletzt ausgefuehrt" + Aktions-Text.
 *              - aria-live="polite" und role="status" fuer A11y.
 *              - Auf / (Lobby) ist die Pille nicht sichtbar.
 *              - Keine Console-/Page-Errors.
 *
 * Self-Test-Mode: --self-test prueft nur BASE_URL und Helper-Kompilation.
 */

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const SELF_TEST = process.argv.includes('--self-test')

function url(route) { return new URL(route, BASE_URL).toString() }

async function httpPruefen(basis) {
  const response = await fetch(basis, { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`M8a: HTTP ${response.status} fuer ${basis}`)
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
      borderTopWidth: style.borderTopWidth,
      borderRadius: style.borderTopLeftRadius,
      boxShadow: style.boxShadow,
      ariaLive: el.getAttribute('aria-live'),
      role: el.getAttribute('role'),
      textInhalt: el.textContent?.trim().slice(0, 80) ?? '',
    }
  }, selektor)
}

async function pruefeM8aAktionsHinweis(page, viewport) {
  const breite = viewport.width
  const hoehe = viewport.height
  console.log(`--- M8a Aktions-Hinweis @ ${breite}x${hoehe} ---`)

  await page.goto(url('/game'), { waitUntil: 'networkidle' })

  // Phase 1: vor Aktion darf die Pille NICHT sichtbar sein (letzteAktion === null)
  const vorAktion = await sichtInfo(page, '.waldtanz-letzte-aktion-hinweis')
  if (vorAktion.vorhanden && vorAktion.sichtbar) {
    throw new Error(`M8a @${breite}x${hoehe}: Pille ist vor erster Aktion sichtbar (letzteAktion sollte null sein). Box=${vorAktion.breite}x${vorAktion.hoehe}`)
  }
  console.log(`  Vor Aktion: Pille unsichtbar ✓ (letzteAktion === null)`)

  // Phase 2: Aktion ausfuehren — Startfaehrte klicken, Handkarte waehlen, Anlegeplatz klicken
  const startBtn = page.locator('.schlangen-startzone__faehrte-button').first()
  const startBtnCount = await startBtn.count()
  if (startBtnCount === 0) {
    throw new Error(`M8a @${breite}x${hoehe}: keine Startfaehrte gefunden — Brettspiel-Vorbedingung fehlt`)
  }
  await startBtn.click({ force: true })
  await page.waitForTimeout(400)

  // Handkarte waehlen
  const handkarte = page.locator('.handkartenleiste--spielkartenfaecher .handkarte__button--karte').first()
  await handkarte.waitFor({ state: 'visible', timeout: 5_000 })
  await handkarte.click({ force: true })
  await page.waitForTimeout(200)

  // Anlegeplatz rechts klicken (spielt die Karte, loest wechsleZustand aus)
  const anlegeplatz = page.locator('.schlangekarte__anlegeplatz--rechts').first()
  await anlegeplatz.waitFor({ state: 'visible', timeout: 5_000 })
  await anlegeplatz.click({ force: true })
  await page.waitForTimeout(600)

  // Phase 3: Pille muss jetzt sichtbar sein
  const nachAktion = await sichtInfo(page, '.waldtanz-letzte-aktion-hinweis')
  if (!nachAktion.vorhanden) {
    throw new Error(`M8a @${breite}x${hoehe}: Pille fehlt im DOM nach Aktion`)
  }
  if (!nachAktion.sichtbar) {
    throw new Error(`M8a @${breite}x${hoehe}: Pille unsichtbar nach Aktion (display=${nachAktion.display}, ${nachAktion.breite}x${nachAktion.hoehe})`)
  }
  console.log(`  Nach Aktion: Pille sichtbar ✓ ${nachAktion.breite}x${nachAktion.hoehe} px @ (${nachAktion.x},${nachAktion.y})`)
  console.log(`  Border: ${nachAktion.borderTopWidth}, Radius: ${nachAktion.borderRadius}`)

  if (nachAktion.breite < 180) {
    throw new Error(`M8a @${breite}x${hoehe}: Pille zu schmal (${nachAktion.breite} < 180)`)
  }
  if (nachAktion.hoehe < 40) {
    throw new Error(`M8a @${breite}x${hoehe}: Pille zu niedrig (${nachAktion.hoehe} < 40)`)
  }

  // 3px-Border mit Stitch-Charakteristik (forest-green)
  const borderMatch = nachAktion.borderTopWidth.match(/^([\d.]+)px$/)
  const borderPx = borderMatch ? parseFloat(borderMatch[1]) : 0
  if (borderPx < 2) {
    throw new Error(`M8a @${breite}x${hoehe}: Pille-Border zu duenn (${nachAktion.borderTopWidth})`)
  }

  // Box-Shadow mit hard-shadow Charakter
  if (!nachAktion.boxShadow || nachAktion.boxShadow === 'none') {
    throw new Error(`M8a @${breite}x${hoehe}: Pille-Box-Shadow fehlt (Stitch-hard-shadow erwartet)`)
  }

  // A11y: aria-live + role
  if (nachAktion.ariaLive !== 'polite') {
    throw new Error(`M8a @${breite}x${hoehe}: aria-live='${nachAktion.ariaLive}' (erwartet 'polite')`)
  }
  if (nachAktion.role !== 'status') {
    throw new Error(`M8a @${breite}x${hoehe}: role='${nachAktion.role}' (erwartet 'status')`)
  }

  // Eyebrow + Text
  const eyebrowCount = await page.locator('.waldtanz-letzte-aktion-hinweis__eyebrow').count()
  const textCount = await page.locator('.waldtanz-letzte-aktion-hinweis__text').count()
  if (eyebrowCount === 0) throw new Error(`M8a @${breite}x${hoehe}: Eyebrow fehlt`)
  if (textCount === 0) throw new Error(`M8a @${breite}x${hoehe}: Aktions-Text fehlt`)

  const eyebrowText = await page.locator('.waldtanz-letzte-aktion-hinweis__eyebrow').first().textContent()
  console.log(`  Eyebrow: "${eyebrowText?.trim()}"`)
  if (!eyebrowText?.toLowerCase().includes('zuletzt')) {
    throw new Error(`M8a @${breite}x${hoehe}: Eyebrow enthaelt nicht 'zuletzt' (gefunden: '${eyebrowText?.trim()}')`)
  }

  // Phase 4: Auf / (Lobby) ist die Pille nicht sichtbar
  await page.goto(url('/'), { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const lobbyPille = await sichtInfo(page, '.waldtanz-letzte-aktion-hinweis')
  if (lobbyPille.vorhanden && lobbyPille.sichtbar) {
    throw new Error(`M8a @${breite}x${hoehe}: Pille auf / (Lobby) sichtbar — Route-Scope kaputt (${lobbyPille.breite}x${lobbyPille.hoehe})`)
  }
  console.log(`  Auf / (Lobby): Pille unsichtbar ✓`)
}

async function fuehreSelbsttestAus() {
  console.log(`M8a Self-Test: Skript kompiliert, BASE_URL = ${BASE_URL}`)
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
      await pruefeM8aAktionsHinweis(seite, viewport)
      if (consoleErrors.length > 0) throw new Error(`M8a: ${consoleErrors.length} console-Errors: ${consoleErrors.slice(0, 3).join(' | ')}`)
      if (pageErrors.length > 0) throw new Error(`M8a: ${pageErrors.length} page-Errors: ${pageErrors.slice(0, 3).join(' | ')}`)
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
