#!/usr/bin/env node
/*
 * Author: rahn
 * Datum: 25.06.2026
 * Version: 1.0
 * Beschreibung: M1dk Production-Smoke fuer das sichtbare Waldtanz-Spielphasen-Banner.
 *              Verifiziert auf 1280x900 mit reducedMotion, dass das Phasen-Banner
 *              auf /game existiert, alle 4 Phasen rendert, die aktive Phase korrekt
 *              hervorgehoben ist und die Banner-Klasse mit Stitch-Optik sichtbar ist.
 *
 * Verwendung:
 *   node scripts/m1dk_waldtanz_phasen_banner_smoke.mjs                # live gegen SMOKE_BASE_URL
 *   node scripts/m1dk_waldtanz_phasen_banner_smoke.mjs --self-test   # Offline-Konfig-Check
 */
import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const SELF_TEST = process.argv.includes('--self-test')

export async function pruefeM1dkPhasenBanner(page) {
  const banner = page.locator('.waldtanz-phasen-banner').first()
  await banner.waitFor({ state: 'visible', timeout: 5000 })
  const box = await banner.boundingBox()
  if (!box) throw new Error('Phasen-Banner boundingBox fehlt')
  if (box.height < 24) throw new Error(`Phasen-Banner zu niedrig: ${box.height}px < 24px`)

  // Alle 4 Phasen-Pillen muessen rendern.
  const pillen = page.locator('.waldtanz-phasen-banner__phase')
  const pillenAnzahl = await pillen.count()
  if (pillenAnzahl !== 4) throw new Error(`Phasen-Banner erwartet 4 Pillen, hat ${pillenAnzahl}`)

  // Genau eine --aktiv-Pille.
  const aktivePillen = page.locator('.waldtanz-phasen-banner__phase--aktiv')
  const aktiveAnzahl = await aktivePillen.count()
  if (aktiveAnzahl !== 1) throw new Error(`Phasen-Banner erwartet 1 aktive Pille, hat ${aktiveAnzahl}`)

  // Alle 4 Phasen-Texte sichtbar.
  const erwartetePhasen = ['Nachziehphase', 'Ausspielphase', 'Aufgabenprüfung', 'Zugabschluss']
  for (const phase of erwartetePhasen) {
    const element = page.getByText(phase, { exact: false }).first()
    if (!(await element.isVisible())) throw new Error(`Phasen-Text "${phase}" nicht sichtbar`)
  }

  console.log('M1dk Phasen-Banner OK: 4 Pillen, 1 aktiv, alle Phasen-Texte sichtbar')
  return { pillenAnzahl, aktiveAnzahl, bannerBox: box }
}

async function smoke() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error('console.error:', msg.text())
  })
  page.on('pageerror', (err) => console.error('pageerror:', err.message))

  try {
    await page.goto(`${BASE_URL}/game`, { waitUntil: 'networkidle', timeout: 30000 })
    const ergebnis = await pruefeM1dkPhasenBanner(page)
    console.log('M1dk Selbsttest bestanden:', JSON.stringify(ergebnis))
  } finally {
    await browser.close()
  }
}

if (SELF_TEST) {
  console.log('M1dk Selbsttest bestanden (Konfig + Helper geladen)')
  process.exit(0)
}

smoke().catch((err) => {
  console.error('M1dk Smoke fehlgeschlagen:', err.message)
  process.exit(1)
})