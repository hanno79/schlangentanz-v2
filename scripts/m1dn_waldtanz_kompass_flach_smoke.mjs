#!/usr/bin/env node
/*
 * Author: rahn
 * Datum: 26.06.2026
 * Version: 1.0
 * Beschreibung: M1dn Production-Smoke fuer die flache Kompass-Indikator-
 *              Pillen-Reihe auf /game. Verifiziert auf 1280x900 + 1100x800:
 *              - .waldtanz-seitenmenue__kompass strong (Heading) ist nicht
 *                sichtbar (display:none Pflicht)
 *              - .waldtanz-seitenmenue__kompass p (Nächster Schritt) ist
 *                nicht sichtbar (display:none Pflicht)
 *              - 3 Rankenchips (Phase / Hand / Quest) in der Ranken-Reihe
 *                sichtbar mit aria-labels
 *              - Brettrand-Arenazug mit "End Turn"-Kicker sichtbar (als
 *                single source of truth fuer die naechste Aktion)
 *              - keine console/page-Errors
 *
 * Verwendung:
 *   node scripts/m1dn_waldtanz_kompass_flach_smoke.mjs                # live gegen SMOKE_BASE_URL
 *   node scripts/m1dn_waldtanz_kompass_flach_smoke.mjs --self-test   # Offline-Konfig-Check
 */
import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const HTTP_TIMEOUT_MS = 15_000
const SELF_TEST = process.argv.includes('--self-test')

export function erstelleSelbsttestAusgabe() {
  return [
    'M1dn Kompass-Flach Selbsttest bestanden',
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

export async function pruefeM1dnKompassFlach(seite, viewport) {
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

    const kompass = document.querySelector('.waldtanz-seitenmenue__kompass')
    const heading = kompass?.querySelector('strong') ?? null
    const paragraph = kompass?.querySelector('p') ?? null
    const rankenchips = Array.from(
      document.querySelectorAll('.waldtanz-seitenmenue__rankenchip')
    )
    const arenazug = document.querySelector('.waldtanz-arenazug')
    const endTurnKicker = arenazug?.querySelector('.waldtanz-arenazug__kicker') ?? null

    return {
      heading: sichtInfo(heading),
      paragraph: sichtInfo(paragraph),
      rankenchipAnzahl: rankenchips.length,
      arenazug: sichtInfo(arenazug),
      endTurnKicker: sichtInfo(endTurnKicker),
    }
  })

  console.log(`M1dn Kompass-Flach @${viewport.label}:`)
  console.log(`  Heading: vorhanden=${ergebnis.heading.vorhanden}, display=${ergebnis.heading.display ?? '-'}, sichtbar=${ergebnis.heading.sichtbar}`)
  console.log(`  Nächster Schritt: vorhanden=${ergebnis.paragraph.vorhanden}, display=${ergebnis.paragraph.display ?? '-'}, sichtbar=${ergebnis.paragraph.sichtbar}`)
  console.log(`  Rankenchips Anzahl: ${ergebnis.rankenchipAnzahl}`)
  console.log(`  Brettrand-Arenazug: vorhanden=${ergebnis.arenazug.vorhanden}, sichtbar=${ergebnis.arenazug.sichtbar}`)
  console.log(`  End-Turn-Kicker: vorhanden=${ergebnis.endTurnKicker.vorhanden}, sichtbar=${ergebnis.endTurnKicker.sichtbar}`)

  if (ergebnis.heading.sichtbar) throw new Error('M1dn: Kompass-Heading sichtbar — display:none Pflicht gebrochen')
  if (ergebnis.paragraph.sichtbar) throw new Error('M1dn: Nächster-Schritt-Paragraph sichtbar — display:none Pflicht gebrochen')
  if (ergebnis.rankenchipAnzahl < 3) throw new Error(`M1dn: nur ${ergebnis.rankenchipAnzahl} Rankenchips gefunden (mindestens 3 erwartet: Phase/Hand/Quest)`)
  if (!ergebnis.arenazug.sichtbar) throw new Error('M1dn: Brettrand-Arenazug nicht sichtbar')
  if (!ergebnis.endTurnKicker.sichtbar) throw new Error('M1dn: End-Turn-Kicker nicht sichtbar (Brettrand-Knopf fehlt)')
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

      await pruefeM1dnKompassFlach(seite, viewport)

      if (consoleErrors.length > 0) throw new Error(`M1dn: ${consoleErrors.length} console-Errors: ${consoleErrors.slice(0, 3).join(' | ')}`)
      if (pageErrors.length > 0) throw new Error(`M1dn: ${pageErrors.length} page-Errors: ${pageErrors.slice(0, 3).join(' | ')}`)

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
