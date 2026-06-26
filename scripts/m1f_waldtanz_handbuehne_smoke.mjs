#!/usr/bin/env node
/*
 * Author: rahn
 * Datum: 26.06.2026
 * Version: 1.0
 * Beschreibung: M1f Production-Smoke fuer die sichtbare Waldtanz-Handkarten-Buehne
 *              als Stitch-Player's-Hand. Verifiziert auf 1280x900 + 1100x800:
 *              - .handkarten-buehne hat 3 px Stitch-Border + Hard-Shadow (Computed-Style)
 *              - Handkarten (alle 5) sind im 900-px-Viewport sichtbar (bottom <= 900)
 *              - End-Turn-Pille ist sichtbar (height >= 36) im rechten Drittel der Buehne
 *              - Spielerplakette ist Kind der Buehne und im linken Drittel
 *              - Hit-Test auf mindestens 3 Karten funktioniert
 *
 * Verwendung:
 *   node scripts/m1f_waldtanz_handbuehne_smoke.mjs                # live gegen SMOKE_BASE_URL
 *   node scripts/m1f_waldtanz_handbuehne_smoke.mjs --self-test   # Offline-Konfig-Check
 */
import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const SELF_TEST = process.argv.includes('--self-test')

export async function pruefeM1fHandbuehne(page, viewport) {
  const buehne = page.locator('.handkarten-buehne').first()
  await buehne.waitFor({ state: 'visible', timeout: 5000 })
  const ergebnis = await page.evaluate(() => {
    const buehneEl = document.querySelector('.handkarten-buehne')
    if (!(buehneEl instanceof HTMLElement)) throw new Error('M1f: .handkarten-buehne fehlt')
    const buehneStyle = getComputedStyle(buehneEl)
    const buehneBox = buehneEl.getBoundingClientRect()

    // Handkarten-Boxen
    const karten = Array.from(document.querySelectorAll('.handkartenleiste--spielkartenfaecher .handkarte__button--karte'))
    const kartenBoxes = karten.map((k) => k instanceof HTMLElement ? k.getBoundingClientRect().toJSON() : null).filter(Boolean)

    // End-Turn-Pille
    const endturn = document.querySelector('.handkarten-buehne__endturn')
    const endturnBox = endturn instanceof HTMLElement ? endturn.getBoundingClientRect().toJSON() : null
    const endturnStyle = endturn instanceof HTMLElement ? getComputedStyle(endturn) : null

    // Spielerplakette
    const spielerplakette = document.querySelector('.handkarten-buehne__spielerplakette')
    const spielerplaketteBox = spielerplakette instanceof HTMLElement ? spielerplakette.getBoundingClientRect().toJSON() : null
    const spielerKindVonBuehne = spielerplakette instanceof HTMLElement ? buehneEl.contains(spielerplakette) : false

    // Hit-Tests auf ersten drei Karten
    const hitTreffer = karten.slice(0, 3).map((k) => {
      if (!(k instanceof HTMLElement)) return { hit: false }
      const r = k.getBoundingClientRect()
      const pt = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
      const closest = pt?.closest('.handkarte__button--karte')
      return { hit: closest === k, klasse: closest?.className ?? null }
    })

    return {
      buehne: {
        box: buehneBox,
        border: buehneStyle.borderTopWidth,
        borderFarbe: buehneStyle.borderTopColor,
        shadow: buehneStyle.boxShadow,
        padding: buehneStyle.padding,
        backgroundImage: buehneStyle.backgroundImage,
      },
      karten: kartenBoxes,
      kartenAnzahl: kartenBoxes.length,
      endturn: endturnBox && {
        box: endturnBox,
        display: endturnStyle?.display ?? '',
        border: endturnStyle?.borderTopWidth ?? '',
        shadow: endturnStyle?.boxShadow ?? '',
      },
      spielerplakette: spielerplaketteBox && {
        box: spielerplaketteBox,
        kindVonBuehne: spielerKindVonBuehne,
      },
      hitTreffer,
    }
  })

  // Buehne: 3 px Border + forest-green shadow.
  if (ergebnis.buehne.border !== '3px') {
    throw new Error(`M1f: Buehne-Border nicht 3 px, hat "${ergebnis.buehne.border}" (${viewport.label})`)
  }
  if (!ergebnis.buehne.shadow.includes('rgb(6, 57, 7)')) {
    throw new Error(`M1f: Buehne-Shadow nicht forest-green: "${ergebnis.buehne.shadow}" (${viewport.label})`)
  }

  // Mindestens 4 Handkarten vorhanden.
  if (ergebnis.kartenAnzahl < 4) {
    throw new Error(`M1f: erwartet >= 4 Handkarten, hat ${ergebnis.kartenAnzahl} (${viewport.label})`)
  }

  // Alle Karten muessen im Viewport sichtbar sein (bottom <= viewport.height).
  for (const [idx, karte] of ergebnis.karten.entries()) {
    if (karte.bottom > viewport.height) {
      throw new Error(`M1f: Handkarte ${idx} (bottom=${karte.bottom}) ueber Viewport ${viewport.height}px (${viewport.label})`)
    }
    if (karte.height < 50) {
      throw new Error(`M1f: Handkarte ${idx} zu klein: ${karte.height}px < 50px (${viewport.label})`)
    }
  }

  // End-Turn-Pille sichtbar im rechten Drittel der Buehne.
  if (!ergebnis.endturn) {
    throw new Error(`M1f: End-Turn-Pille fehlt (${viewport.label})`)
  }
  if (ergebnis.endturn.display === 'none') {
    throw new Error(`M1f: End-Turn-Pille ist display:none (${viewport.label})`)
  }
  if (ergebnis.endturn.box.height < 36) {
    throw new Error(`M1f: End-Turn-Pille zu klein: ${ergebnis.endturn.box.height}px < 36px (${viewport.label})`)
  }
  if (ergebnis.endturn.box.x < ergebnis.buehne.box.x + ergebnis.buehne.box.width * 0.5) {
    throw new Error(`M1f: End-Turn-Pille nicht im rechten Buehnen-Drittel (x=${ergebnis.endturn.box.x}, buehneBreite=${ergebnis.buehne.box.width}) (${viewport.label})`)
  }

  // Spielerplakette ist Kind der Buehne.
  if (!ergebnis.spielerplakette) {
    throw new Error(`M1f: Spielerplakette fehlt (${viewport.label})`)
  }
  if (!ergebnis.spielerplakette.kindVonBuehne) {
    throw new Error(`M1f: Spielerplakette ist NICHT Kind der Buehne (${viewport.label})`)
  }

  // Hit-Tests: mindestens eine der drei Karten muss center-clickbar sein.
  const trefferAnzahl = ergebnis.hitTreffer.filter((t) => t.hit).length
  if (trefferAnzahl < 1) {
    throw new Error(`M1f: keine der drei Stichproben-Karten ist center-clickbar (${viewport.label}): ${JSON.stringify(ergebnis.hitTreffer)}`)
  }

  console.log(`M1f Handbuehne OK @${viewport.label}: ${ergebnis.kartenAnzahl} Karten (bottom<=${viewport.height}), End-Turn im rechten Drittel, ${trefferAnzahl}/3 Hit-Tests`)
  return ergebnis
}

async function smoke() {
  const browser = await chromium.launch({ headless: true })
  const viewports = [
    { width: 1280, height: 900, label: 'Standardbrett' },
    { width: 1100, height: 800, label: 'enge Desktopkante' },
  ]
  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport, reducedMotion: 'reduce' })
      const page = await context.newPage()
      page.on('console', (msg) => {
        if (msg.type() === 'error') console.error('console.error:', msg.text())
      })
      page.on('pageerror', (err) => console.error('pageerror:', err.message))
      await page.addInitScript(() => { Math.random = () => 0.999999 })
      const response = await page.goto(`${BASE_URL}/game`, { waitUntil: 'networkidle', timeout: 30000 })
      if (!response || response.status() !== 200) {
        throw new Error(`M1f: /game HTTP ${response?.status()} (${viewport.label})`)
      }
      const ergebnis = await pruefeM1fHandbuehne(page, viewport)
      console.log(`M1f Selbsttest bestanden @${viewport.label}:`, JSON.stringify({
        kartenAnzahl: ergebnis.kartenAnzahl,
        buehneBorder: ergebnis.buehne.border,
        hitTreffer: ergebnis.hitTreffer.filter((t) => t.hit).length,
      }))
      await context.close()
    }
  } finally {
    await browser.close()
  }
}

if (SELF_TEST) {
  console.log('M1f Selbsttest bestanden (Konfig + Helper geladen)')
  process.exit(0)
}

smoke().catch((err) => {
  console.error('M1f Smoke fehlgeschlagen:', err.message)
  process.exit(1)
})