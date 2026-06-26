#!/usr/bin/env node
/*
 * Author: rahn
 * Datum: 26.06.2026
 * Version: 1.0
 * Beschreibung: M1g Production-Smoke fuer die konsolidierte Spielerplakette auf /game.
 *              Verifiziert auf 1280x900 + 1100x800:
 *              - Linke Grid-Spielerplakette (.waldtanz-spielerplakette) hat
 *                Spieler-Avatar + Punktzahl-Pille (Single Source of Truth)
 *              - Handbuehnen-Spielerplakette (.handkarten-buehne__spielerplakette)
 *                rendert Heading "Deine Hand — Spieler 1" OHNE Avatar und OHNE
 *                Punkte-Anzeige (Heading-Box)
 *              - Beide Plaketten sind im 900-px-Erstbild sichtbar (bottom <= 900)
 *
 * Verwendung:
 *   node scripts/m1g_waldtanz_spielerplakette_konsolidierung_smoke.mjs                # live gegen SMOKE_BASE_URL
 *   node scripts/m1g_waldtanz_spielerplakette_konsolidierung_smoke.mjs --self-test   # Offline-Konfig-Check
 */
import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const SELF_TEST = process.argv.includes('--self-test')

export async function pruefeM1gSpielerplaketteKonsolidierung(page, viewport) {
  const spielerplakette = page.locator('.waldtanz-spielerplakette').first()
  await spielerplakette.waitFor({ state: 'visible', timeout: 5000 })
  const ergebnis = await page.evaluate(() => {
    const gridEl = document.querySelector('.waldtanz-spielerplakette')
    if (!(gridEl instanceof HTMLElement)) throw new Error('M1g: .waldtanz-spielerplakette fehlt')
    const gridBox = gridEl.getBoundingClientRect()

    const avatar = gridEl.querySelector('.waldtanz-spielerplakette__avatar')
    const avatarBox = avatar instanceof HTMLElement ? avatar.getBoundingClientRect().toJSON() : null
    const punktePille = gridEl.querySelector('.waldtanz-spielerplakette__punkte')
    const punkteBox = punktePille instanceof HTMLElement ? punktePille.getBoundingClientRect().toJSON() : null

    const buehneEl = document.querySelector('.handkarten-buehne__spielerplakette')
    if (!(buehneEl instanceof HTMLElement)) throw new Error('M1g: .handkarten-buehne__spielerplakette fehlt')
    const buehneBox = buehneEl.getBoundingClientRect()
    const buehnenAvatar = buehneEl.querySelector('.handkarten-buehne__avatar')
    const buehnenPunkte = Array.from(buehneEl.querySelectorAll('span'))
      .some((s) => /^0 Punkte$/.test(s.textContent?.trim() ?? ''))

    const buehnenHeading = buehneEl.querySelector('strong')
    const buehnenHeadingText = buehnenHeading?.textContent?.trim() ?? ''

    return {
      gridSpielerplakette: { x: gridBox.x, y: gridBox.y, w: gridBox.width, h: gridBox.height, bottom: gridBox.bottom },
      gridAvatar: avatarBox,
      gridPunktePille: punkteBox,
      buehneSpielerplakette: { x: buehneBox.x, y: buehneBox.y, w: buehneBox.width, h: buehneBox.height, bottom: buehneBox.bottom },
      buehneHatAvatar: buehnenAvatar !== null,
      buehneHatPunkte: buehnenPunkte,
      buehneHeadingText: buehnenHeadingText,
      viewport: { w: window.innerWidth, h: window.innerHeight },
    }
  })

  // Linke Spielerplakette: Avatar + Punkte-Pille sichtbar
  if (!ergebnis.gridAvatar) throw new Error('M1g: Avatar in linker Grid-Spielerplakette fehlt')
  if (!ergebnis.gridPunktePille) throw new Error('M1g: Punkte-Pille in linker Grid-Spielerplakette fehlt')

  // Handbuehnen-Spielerplakette: KEIN Avatar, KEINE isolierte Punkte-Anzeige
  if (ergebnis.buehneHatAvatar) throw new Error('M1g: Handbuehnen-Spielerplakette hat noch einen Avatar (Doppel-Cluster)')
  if (ergebnis.buehneHatPunkte) throw new Error('M1g: Handbuehnen-Spielerplakette zeigt noch isolierte Punkte-Zahl (Doppel-Cluster)')
  if (!/^Deine Hand —/.test(ergebnis.buehneHeadingText)) throw new Error(`M1g: Handbuehnen-Heading fehlt: "${ergebnis.buehneHeadingText}"`)

  // Im 900-Viewport muessen beide sichtbar sein
  if (viewport.height === 900 && ergebnis.gridSpielerplakette.bottom > 900) {
    throw new Error(`M1g: Linke Spielerplakette nicht im 900-Viewport (bottom=${ergebnis.gridSpielerplakette.bottom})`)
  }
  if (viewport.height === 900 && ergebnis.buehneSpielerplakette.bottom > 900) {
    throw new Error(`M1g: Handbuehnen-Spielerplakette nicht im 900-Viewport (bottom=${ergebnis.buehneSpielerplakette.bottom})`)
  }

  return ergebnis
}

async function main() {
  if (SELF_TEST) {
    console.log(JSON.stringify({
      selfTest: true,
      baseUrl: BASE_URL,
      helper: 'pruefeM1gSpielerplaketteKonsolidierung',
      script: 'scripts/m1g_waldtanz_spielerplakette_konsolidierung_smoke.mjs',
    }, null, 2))
    return
  }

  const browser = await chromium.launch({ headless: true })
  try {
    for (const viewport of [{ width: 1280, height: 900 }, { width: 1100, height: 800 }]) {
      const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' })
      const page = await ctx.newPage()
      await page.addInitScript(() => { Math.random = () => 0.999999 })
      const consoleErrors = []
      const pageErrors = []
      page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
      page.on('pageerror', (err) => { pageErrors.push(err.message) })

      await page.goto(`${BASE_URL}/game`, { waitUntil: 'networkidle' })
      const ergebnis = await pruefeM1gSpielerplaketteKonsolidierung(page, viewport)
      if (consoleErrors.length > 0) throw new Error(`M1g Console-Errors @${viewport.width}x${viewport.height}: ${consoleErrors.join(' | ')}`)
      if (pageErrors.length > 0) throw new Error(`M1g Page-Errors @${viewport.width}x${viewport.height}: ${pageErrors.join(' | ')}`)
      console.log(`M1g OK @${viewport.width}x${viewport.height}: ${JSON.stringify(ergebnis)}`)
      await ctx.close()
    }
  } finally {
    await browser.close()
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => { console.error(err); process.exit(1) })
}
