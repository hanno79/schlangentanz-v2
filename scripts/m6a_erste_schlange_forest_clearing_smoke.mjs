#!/usr/bin/env node
// M6a: Deine erste Schlange als Stitch-Waldlichtung-Onboarding.
// Live-Smoke: prueft auf /game, dass der Onboarding-Container ohne eigene
// Schlangen sichtbar ist. Verwendet den pruefeM6a-Helper.

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const VIEWPORT = { width: 1280, height: 900 }

async function pruefeM6a(page) {
  await page.goto(`${BASE_URL}/game`, { waitUntil: 'networkidle' })
  // Auf das Onboarding warten — kein eigener Schlangen-State initial.
  await page.locator('.erste-schlange-onboarding').first().waitFor({ state: 'visible', timeout: 8000 })
  const onboarding = await page.locator('.erste-schlange-onboarding').first().boundingBox()
  const headline = await page.locator('.erste-schlange-onboarding__headline').first().textContent()
  const dropRing = await page.locator('.erste-schlange-onboarding__drop-ring').first().boundingBox()
  const animation = await page.locator('.erste-schlange-onboarding__drop-ring').first().evaluate(
    (el) => window.getComputedStyle(el).animationName,
  )
  const schritte = await page.locator('.erste-schlange-onboarding__schritt').allTextContents()
  const silhouetteBox = await page.locator('.erste-schlange-onboarding__silhouette').first().boundingBox()
  return { onboarding, headline, dropRing, animation, schritte, silhouetteBox }
}

async function main() {
  console.log(`M6a: Live-Smoke gegen ${BASE_URL} mit Viewport ${VIEWPORT.width}x${VIEWPORT.height}`)
  const browser = await chromium.launch()
  try {
    const context = await browser.newContext({ viewport: VIEWPORT })
    const page = await context.newPage()
    const daten = await pruefeM6a(page)
    console.log('Onboarding-Box:', daten.onboarding)
    console.log('Headline:', daten.headline)
    console.log('Drop-Ring-Box:', daten.dropRing)
    console.log('Drop-Ring-Animation:', daten.animation)
    console.log('Schritt-Texte:', daten.schritte)
    console.log('Silhouette-Box:', daten.silhouetteBox)

    // Akzeptanz
    if (!daten.onboarding) throw new Error('Onboarding-Container nicht sichtbar')
    if (daten.onboarding.width < 200) throw new Error(`Onboarding zu schmal: ${daten.onboarding.width}`)
    if (daten.onboarding.height < 150) throw new Error(`Onboarding zu niedrig: ${daten.onboarding.height}`)
    if (daten.headline?.trim() !== 'Deine erste Schlange') {
      throw new Error(`Headline-Fehler: ${daten.headline}`)
    }
    if (!daten.animation || daten.animation === 'none') {
      throw new Error(`Drop-Ring-Animation fehlt: ${daten.animation}`)
    }
    if (!daten.schritte.includes('1) Handkarte wählen')) {
      throw new Error(`Schritt 1 fehlt: ${daten.schritte}`)
    }
    if (!daten.schritte.some((s) => s.includes('Kreis ziehen'))) {
      throw new Error(`Schritt 2 fehlt: ${daten.schritte}`)
    }
    await page.screenshot({ path: '/tmp/m6a_production.png', fullPage: false })
    console.log('Screenshot: /tmp/m6a_production.png')
    console.log('OK: M6a Deine-erste-Schlange-Onboarding verifiziert')
  } finally {
    await browser.close()
  }
}

if (process.argv.includes('--self-test')) {
  console.log('M6a Self-Test OK (Skript-Kompilation)')
  process.exit(0)
}

main().catch((err) => {
  console.error('M6a FEHLER:', err)
  process.exit(1)
})