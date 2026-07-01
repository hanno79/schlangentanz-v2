#!/usr/bin/env node
/**
 * M3i — Stitch-Forest-Arena-Promotion Live-Smoke (Production)
 *
 * Verifiziert auf https://schlangentanz-v2.vercel.app/game @ 1280x900:
 *   1. Erste-Handkarte-Bottom <= 895px (5px Puffer unter Falz)
 *   2. Schlangenlichtung sichtbar: top >= 250 UND .bottom - .top >= 100
 *   3. body.scrollHeight <= 950 (kein Overflow noetig)
 *   4. arenaStein.bottom <= 700 (Arenasstein nicht mehr dominierend)
 *   5. 0 page-errors, 0 console-errors
 *
 * Author: hermes-cron
 * Datum: 01.07.2026
 */

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL || 'https://schlangentanz-v2.vercel.app'
const VIEWPORT = { width: 1280, height: 900 }

function sichtInfo(box) {
  if (!box) return { vorhanden: false, x: 0, y: 0, breite: 0, hoehe: 0 }
  return {
    vorhanden: true,
    x: Math.round(box.x),
    y: Math.round(box.y),
    breite: Math.round(box.width),
    hoehe: Math.round(box.height),
  }
}

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: VIEWPORT })
  const page = await context.newPage()

  const pageErrors = []
  const consoleErrors = []
  page.on('pageerror', (err) => pageErrors.push(err.message))
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  console.log(`[M3i] Lade ${BASE_URL}/game @ ${VIEWPORT.width}x${VIEWPORT.height}...`)
  await page.goto(`${BASE_URL}/game`, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(800)

  const ergebnisse = {}

  // 1) Erste Handkarte-Button (Handkarte)
  const ersteHandkarte = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('.handkarte__button--karte'))
    if (buttons.length === 0) return null
    const b = buttons[0].getBoundingClientRect()
    return { x: b.x, y: b.y, width: b.width, height: b.height, bottom: b.bottom }
  })
  ergebnisse.ersteHandkarte = sichtInfo(ersteHandkarte)
  if (ersteHandkarte) {
    console.log(`[M3i] Erste-Handkarte: bottom=${ersteHandkarte.bottom}, y=${ersteHandkarte.y}, hoehe=${ersteHandkarte.height}`)
  } else {
    console.log(`[M3i] Erste-Handkarte: NICHT im DOM`)
  }

  // 2) Schlangenlichtung sichtbar
  const schlangenlichtung = await page.evaluate(() => {
    const el = document.querySelector('.waldtanz-schlangenlichtung__spielflaeche, .waldtanz-schlangenlichtung')
    if (!el) return null
    const b = el.getBoundingClientRect()
    return { x: b.x, y: b.y, width: b.width, height: b.height, top: b.top, bottom: b.bottom }
  })
  ergebnisse.schlangenlichtung = sichtInfo(schlangenlichtung)
  if (schlangenlichtung) {
    console.log(`[M3i] Schlangenlichtung: top=${schlangenlichtung.top}, bottom=${schlangenlichtung.bottom}, sichtbereich=${Math.round(schlangenlichtung.bottom - schlangenlichtung.top)}px`)
  }

  // 3) body.scrollHeight
  const bodyHeight = await page.evaluate(() => document.body.scrollHeight)
  ergebnisse.bodyScrollHeight = bodyHeight
  console.log(`[M3i] body.scrollHeight = ${bodyHeight}px`)

  // 4) Arenasstein
  const arenaStein = await page.evaluate(() => {
    const el = document.querySelector('.waldtanz-arenastein')
    if (!el) return null
    const b = el.getBoundingClientRect()
    return { x: b.x, y: b.y, width: b.width, height: b.height, bottom: b.bottom }
  })
  ergebnisse.arenaStein = sichtInfo(arenaStein)
  if (arenaStein) {
    console.log(`[M3i] Arenasstein: bottom=${arenaStein.bottom}, y=${arenaStein.y}, hoehe=${arenaStein.height}`)
  }

  // 5) Page-/Console-Errors
  ergebnisse.pageErrors = pageErrors
  ergebnisse.consoleErrors = consoleErrors

  await browser.close()

  // Akzeptanz-Pruefung
  const asserts = []
  let passed = 0
  let failed = 0

  if (ersteHandkarte) {
    if (ersteHandkarte.bottom <= 895) {
      asserts.push(`✓ Erste-Handkarte-Bottom ${ersteHandkarte.bottom} <= 895`)
      passed++
    } else {
      asserts.push(`✗ Erste-Handkarte-Bottom ${ersteHandkarte.bottom} > 895 (zu tief im Viewport)`)
      failed++
    }
  } else {
    asserts.push(`✗ Erste-Handkarte fehlt im DOM`)
    failed++
  }

  if (schlangenlichtung) {
    const sichtHoehe = schlangenlichtung.bottom - schlangenlichtung.top
    if (schlangenlichtung.top >= 250 && sichtHoehe >= 100) {
      asserts.push(`✓ Schlangenlichtung sichtbar (top=${schlangenlichtung.top}, sichtbereich=${Math.round(sichtHoehe)}px)`)
      passed++
    } else {
      asserts.push(`✗ Schlangenlichtung nicht ausreichend sichtbar (top=${schlangenlichtung.top}, sichtbereich=${Math.round(sichtHoehe)}px < 100 oder top < 250)`)
      failed++
    }
  } else {
    asserts.push(`✗ Schlangenlichtung fehlt im DOM`)
    failed++
  }

  if (bodyHeight <= 950) {
    asserts.push(`✓ body.scrollHeight ${bodyHeight} <= 950`)
    passed++
  } else {
    asserts.push(`✗ body.scrollHeight ${bodyHeight} > 950 (zu viel Scroll noetig)`)
    failed++
  }

  if (arenaStein && arenaStein.bottom <= 700) {
    asserts.push(`✓ Arenasstein-Bottom ${arenaStein.bottom} <= 700`)
    passed++
  } else if (arenaStein) {
    asserts.push(`✗ Arenasstein-Bottom ${arenaStein.bottom} > 700 (zu dominierend)`)
    failed++
  } else {
    asserts.push(`✗ Arenasstein fehlt im DOM`)
    failed++
  }

  if (pageErrors.length === 0 && consoleErrors.length === 0) {
    asserts.push(`✓ 0 page-errors, 0 console-errors`)
    passed++
  } else {
    asserts.push(`✗ ${pageErrors.length} page-errors, ${consoleErrors.length} console-errors`)
    failed++
  }

  console.log(`\n[M3i] Akzeptanz-Ergebnisse:`)
  for (const a of asserts) console.log(`  ${a}`)
  console.log(`\n[M3i] ${passed}/${passed + failed} Asserts bestanden`)

  if (failed > 0) {
    console.error(`\n[M3i] SMOKE FEHLGESCHLAGEN: ${failed} von ${passed + failed} Asserts rot`)
    process.exit(1)
  }
  console.log(`\n[M3i] SMOKE OK — Stitch-Forest-Arena-Promotion ist sichtbar im 1280x900-Erstbild.`)
  process.exit(0)
}

main().catch((err) => {
  console.error(`[M3i] Smoke-Crash:`, err)
  process.exit(2)
})
