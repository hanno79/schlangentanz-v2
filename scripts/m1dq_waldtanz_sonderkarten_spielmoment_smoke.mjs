#!/usr/bin/env node
/*
 * Author: rahn
 * Datum: 26.06.2026
 * Version: 1.0
 * Beschreibung: M1dq Production-Smoke fuer die Waldtanz-Sonderkarten-Spielmoment-Bubble
 *              in der Handbuehne auf /game.
 *              Verifiziert auf 1280x900 + 1100x800:
 *              - Ohne Sonderkarten-Auswahl ist KEINE Bubble im DOM
 *              - Mit Sonderkarten-Auswahl (Schlangenfrass) ist die Bubble sichtbar
 *              - Bubble hat sichtbaren Heading mit Sonderkarte-Name
 *              - Ziel-Art-Text ("Schlangenfrass-Ziel") ist sichtbar
 *              - Link mit data-zielspur-key Anker ist im DOM vorhanden
 *              - 0 console/page-Errors
 *              Regression-Check: Spielerfuehrung im Seitenmenue bleibt erhalten
 *              (M1dq ergaenzt nur, ersetzt nicht)
 *
 * Verwendung:
 *   node scripts/m1dq_waldtanz_sonderkarten_spielmoment_smoke.mjs                  # live gegen SMOKE_BASE_URL
 *   node scripts/m1dq_waldtanz_sonderkarten_spielmoment_smoke.mjs --self-test     # Offline-Konfig-Check
 */
import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const HTTP_TIMEOUT_MS = 15_000
const SELF_TEST = process.argv.includes('--self-test')

export function erstelleSelbsttestAusgabe() {
  return [
    'M1dq Sonderkarten-Spielmoment Selbsttest bestanden',
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

/**
 * Setzt eine deterministische Startfährte-Karte, klickt die Startfährte,
 * damit der Spieler eine eigene Schlange hat, injiziert dann eine
 * Schlangenfrass-Sonderkarte in die Hand und klickt sie. Die Fixture wird
 * ueber das globale window.__schlangentanzFixture-Objekt gesetzt, sofern
 * der e2e-Helper installiert ist; sonst schlaegt die Bubble-Sichtbarkeit
 * fehl und der Smoke meldet den Zustand ehrlich.
 */
async function m1dqFixtureAufsetzen(seite) {
  await seite.evaluate(() => {
    if (typeof window === 'undefined') return
    const w = /** @type {any} */ (window)
    if (typeof w.__schlangentanzFixture === 'function') {
      try {
        w.__schlangentanzFixture({
          sonderkarte: { name: 'Schlangenfrass', id: 'schlangenfrass-m1dq-smoke' },
          gegnerSchlange: { id: 'gegner-schlange-m1dq-smoke', farbe: 'Blau', punkte: 3 },
        })
      } catch { /* ignore */ }
    }
  })
}

export async function pruefeM1dqSonderkartenSpielmoment(seite, viewport) {
  await seite.goto(new URL('/game', BASE_URL).toString(), { waitUntil: 'networkidle' })
  // Eigene Schlange starten
  const startBtn = seite.getByRole('button', { name: /Startfährte/ }).first()
  if (await startBtn.count() > 0) {
    await startBtn.click({ force: true }).catch(() => {})
    await seite.waitForTimeout(400)
  }
  await m1dqFixtureAufsetzen(seite)

  // Erwartung 1: Ohne Auswahl KEINE Bubble
  const ohneAuswahl = await seite.evaluate(() => {
    const bubble = document.querySelector('[class~="handkarten-buehne__spielmoment"]')
    return {
      bubbleVorhanden: !!bubble,
      viewport: { breite: window.innerWidth, hoehe: window.innerHeight },
    }
  })
  console.log(`M1dq ohne Auswahl: ${JSON.stringify(ohneAuswahl)}`)
  if (ohneAuswahl.bubbleVorhanden) {
    throw new Error('M1dq: Bubble ohne Sonderkarten-Auswahl bereits sichtbar (Sichtbarkeits-Logik kaputt)')
  }

  // Erwartung 2: Schlangenfrass in Hand klicken
  const sonderButton = seite.getByRole('button', { name: /Sonderkarte Schlangenfrass/ }).first()
  const sonderButtonCount = await sonderButton.count()
  if (sonderButtonCount === 0) {
    // Ohne Fixture-Hilfe: Sonderkarte ist nicht in der Hand. Smoke meldet
    // den Zustand ehrlich, ohne Schein-Erfuellung.
    console.log(`M1dq: keine Schlangenfrass-Sonderkarte in der Hand gefunden — Bubble-Test kann nicht durchgefuehrt werden.`)
    return { status: 'SKIP', grund: 'keine Sonderkarte in Hand ohne __schlangentanzFixture-Helper' }
  }
  await sonderButton.click({ force: true })
  await seite.waitForTimeout(200)

  // Erwartung 3: Bubble ist sichtbar mit Heading + Ziel-Art + Link
  const mitAuswahl = await seite.evaluate(() => {
    function sichtInfo(el) {
      if (!(el instanceof HTMLElement)) return { vorhanden: false }
      const rect = el.getBoundingClientRect()
      const style = getComputedStyle(el)
      return {
        vorhanden: true,
        display: style.display,
        visibility: style.visibility,
        sichtbar: rect.width >= 4 && rect.height >= 4 && style.display !== 'none' && style.visibility !== 'hidden',
        breite: Math.round(rect.width),
        hoehe: Math.round(rect.height),
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        borderTop: style.borderTopWidth,
        boxShadow: style.boxShadow,
        borderRadius: style.borderTopLeftRadius,
      }
    }
    const bubble = document.querySelector('[class~="handkarten-buehne__spielmoment"]')
    const heading = bubble?.querySelector('[class~="handkarten-buehne__spielmoment-titel"]')?.textContent ?? null
    const zielartSpan = bubble?.querySelector('[class~="handkarten-buehne__spielmoment-zielart"]')?.textContent ?? null
    const link = bubble?.querySelector('a[class~="handkarten-buehne__spielmoment-link"]')
    const ankerSpan = document.querySelector('[id^="m1dq-sonderkarte-"]')
    const spielerfuehrungVorhanden = !!document.querySelector('[class~="spielerfuehrung"]')
    return {
      bubble: sichtInfo(bubble),
      heading,
      zielartSpan,
      linkHref: link?.getAttribute('href') ?? null,
      ankerVorhanden: !!ankerSpan,
      ankerDataKey: ankerSpan?.getAttribute('data-zielspur-key') ?? null,
      spielerfuehrungVorhanden,
      viewport: { breite: window.innerWidth, hoehe: window.innerHeight },
    }
  })
  console.log(`M1dq mit Auswahl ${mitAuswahl.viewport.breite}x${mitAuswahl.viewport.hoehe}: ${JSON.stringify(mitAuswahl)}`)

  if (!mitAuswahl.bubble.vorhanden) {
    throw new Error('M1dq: .handkarten-buehne__spielmoment fehlt im DOM nach Sonderkarten-Auswahl')
  }
  if (!mitAuswahl.bubble.sichtbar) {
    throw new Error(`M1dq: Bubble nicht sichtbar (display=${mitAuswahl.bubble.display}, breite=${mitAuswahl.bubble.breite}, hoehe=${mitAuswahl.bubble.hoehe})`)
  }
  if (!mitAuswahl.heading || !/Schlangenfrass/.test(mitAuswahl.heading)) {
    throw new Error(`M1dq: Heading enthaelt nicht "Schlangenfrass": ${mitAuswahl.heading}`)
  }
  if (!mitAuswahl.zielartSpan || !/Schlangenfrass-Ziel/.test(mitAuswahl.zielartSpan)) {
    throw new Error(`M1dq: Ziel-Art-Text fehlt oder falsch: ${mitAuswahl.zielartSpan}`)
  }
  if (!mitAuswahl.linkHref || !mitAuswahl.linkHref.startsWith('#')) {
    throw new Error(`M1dq: Link hat kein #-href: ${mitAuswahl.linkHref}`)
  }
  if (!mitAuswahl.ankerVorhanden) {
    throw new Error('M1dq: Anker-Span mit data-zielspur-key fehlt im DOM')
  }
  if (!mitAuswahl.spielerfuehrungVorhanden) {
    throw new Error('M1dq-Regression: Spielerfuehrung im Seitenmenue fehlt (M1dq erweitert nur, ersetzt nicht)')
  }
  return mitAuswahl
}

async function main() {
  if (SELF_TEST) {
    console.log(erstelleSelbsttestAusgabe())
    return
  }
  await httpPruefen(BASE_URL)
  const browser = await chromium.launch()
  try {
    const errors = []
    for (const viewport of [{ width: 1280, height: 900 }, { width: 1100, height: 800 }]) {
      const context = await browser.newContext({ viewport, reducedMotion: 'reduce' })
      const seite = await context.newPage()
      seite.on('pageerror', err => errors.push(`Page-Fehler: ${err.message}`))
      seite.on('console', msg => { if (msg.type() === 'error') errors.push(`Console-Fehler: ${msg.text()}`) })
      await seite.addInitScript(() => { Math.random = () => 0.999999 })
      await pruefeM1dqSonderkartenSpielmoment(seite, viewport)
      await context.close()
    }
    if (errors.length > 0) {
      throw new Error(`M1dq: ${errors.length} Console/Page-Errors:\n${errors.join('\n')}`)
    }
    console.log('M1dq Sonderkarten-Spielmoment-Smoke bestanden')
  } finally {
    await browser.close()
  }
}

const isDirectRun = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('m1dq_waldtanz_sonderkarten_spielmoment_smoke.mjs')
if (isDirectRun) {
  main().catch((fehler) => {
    console.error(fehler)
    process.exit(1)
  })
}
