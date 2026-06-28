/*
Author: Hermes
Datum: 28.06.2026
Beschreibung: M3c Browser-Smoke fuer die Stitch-inspirierten Player-Cards
  im sonnigen Nest. Beweist in einem echten Browser, dass die Lobby auf /
  einen sichtbaren Player-Cards-Vertrag erfuellt:
    1. 4 .lobby-avatar gerendert (Host + 3 KI)
    2. 2x2-Grid (zwei gleiche grid-template-columns Werte)
    3. Avatar-Groesse >= 100x100 px (Stitch hat 128x128)
    4. Baumstamm-Shadow enthaelt 12px und Hex-Farbwert (var-resolved)
    5. Name-Pillen mit den 4 erwarteten Spieler-Namen sichtbar
    6. 3 Difficulty-Pillen mit Text "mutig", "listig", "fies"
    7. Keine console-Fehler, keine Page-Fehler

  Akzeptanzvertrag (m3c-sonniges-nest-player-cards):
    - 4 Avatare gerendert
    - grid-template-columns enthaelt 2 identische Spalten-Werte
    - Avatar >= 100x100 px
    - .lobby-baumhaus box-shadow enthaelt "12px" und eine Hex-Farbe
    - 4 .lobby-slot__name mit erwartetem Text
    - 3 .lobby-slot__difficulty mit den Texten "mutig"/"listig"/"fies"
    - Host-Slot (lobby-slot--host) hat KEINE Difficulty-Pille
    - consoleErrors.length == 0, pageErrors.length == 0
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

async function messeLobby(page) {
  return page.evaluate(() => {
    const avatars = Array.from(document.querySelectorAll('.lobby-avatar'))
    const grid = document.querySelector('.lobby-spieler-grid')
    const gridCs = grid ? window.getComputedStyle(grid) : null
    const baumhaus = document.querySelector('.lobby-baumhaus')
    const baumhausCs = baumhaus ? window.getComputedStyle(baumhaus) : null
    const namePills = Array.from(document.querySelectorAll('.lobby-slot__name'))
    const namePillTexts = namePills.map((p) => (p.textContent ?? '').trim())
    const difficultyPills = Array.from(document.querySelectorAll('.lobby-slot__difficulty'))
    const difficultyTexts = difficultyPills.map((p) => (p.textContent ?? '').trim())
    const hostSlot = document.querySelector('.lobby-slot--host')
    const hostDifficulty = hostSlot?.querySelector('.lobby-slot__difficulty')

    // Avatar-Groesse
    let avatarWidth = 0
    let avatarHeight = 0
    if (avatars.length > 0) {
      const rect = avatars[0].getBoundingClientRect()
      avatarWidth = rect.width
      avatarHeight = rect.height
    }

    // grid-template-columns zerlegen (Browser liefert "640px 640px" o.ae.)
    const gridCols = gridCs?.gridTemplateColumns ?? ''
    const cols = gridCols.split(/\s+/).filter(Boolean)

    return {
      avatarCount: avatars.length,
      gridColumns: gridCols,
      cols,
      avatarWidth,
      avatarHeight,
      baumhausBoxShadow: baumhausCs?.boxShadow ?? '',
      baumhausBorderRadius: baumhausCs?.borderRadius ?? '',
      namePillTexts,
      difficultyTexts,
      hostHasNoDifficulty: hostDifficulty === null || hostDifficulty === undefined,
    }
  })
}

async function main() {
  const consoleErrors = []
  const pageErrors = []
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => { pageErrors.push(err.message) })
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
  // Warten bis die Lobby gerendert ist.
  await page.locator('.lobby-avatar').first().waitFor({ state: 'visible', timeout: 5000 })
  const daten = await messeLobby(page)
  console.log('M3c Avatar-Count:', daten.avatarCount)
  console.log('M3c grid-template-columns:', daten.gridColumns)
  console.log('M3c Spalten-Anzahl:', daten.cols.length)
  console.log('M3c Avatar-Groesse:', `${daten.avatarWidth.toFixed(1)}x${daten.avatarHeight.toFixed(1)} px`)
  console.log('M3c Baumstamm box-shadow:', daten.baumhausBoxShadow.slice(0, 80))
  console.log('M3c Baumstamm border-radius:', daten.baumhausBorderRadius)
  console.log('M3c Name-Pillen:', daten.namePillTexts.join(', '))
  console.log('M3c Difficulty-Texte:', daten.difficultyTexts.join(', '))
  console.log('M3c Host-Slot ohne Difficulty:', daten.hostHasNoDifficulty)

  await browser.close()

  if (daten.avatarCount !== 4) {
    console.error(`FAIL: erwartet 4 Avatare, gefunden ${daten.avatarCount}`)
    process.exit(1)
  }
  if (daten.cols.length !== 2) {
    console.error(`FAIL: erwartet 2 Spalten im Grid, gefunden ${daten.cols.length}`)
    process.exit(2)
  }
  if (daten.cols[0] !== daten.cols[1]) {
    console.error(`FAIL: Spalten ungleich: "${daten.cols[0]}" vs "${daten.cols[1]}"`)
    process.exit(3)
  }
  if (daten.avatarWidth < 100 || daten.avatarHeight < 100) {
    console.error(`FAIL: Avatar-Groesse ${daten.avatarWidth}x${daten.avatarHeight} < 100x100 px`)
    process.exit(4)
  }
  if (!/12px/.test(daten.baumhausBoxShadow)) {
    console.error(`FAIL: Baumstamm-Shadow ohne "12px": "${daten.baumhausBoxShadow}"`)
    process.exit(5)
  }
  if (!/rgb\(/.test(daten.baumhausBoxShadow) && !/#[0-9a-fA-F]{3,6}/.test(daten.baumhausBoxShadow)) {
    console.error(`FAIL: Baumstamm-Shadow ohne Farbwert: "${daten.baumhausBoxShadow}"`)
    process.exit(6)
  }
  const expectedNames = ['Slippy Host', 'Orange Crush', 'Lime Loop', 'Berry Boa']
  for (const name of expectedNames) {
    if (!daten.namePillTexts.includes(name)) {
      console.error(`FAIL: Name-Pille "${name}" fehlt (gefunden: ${daten.namePillTexts.join(', ')})`)
      process.exit(7)
    }
  }
  const expectedDifficulties = ['mutig', 'listig', 'fies']
  for (const diff of expectedDifficulties) {
    if (!daten.difficultyTexts.includes(diff)) {
      console.error(`FAIL: Difficulty-Pille "${diff}" fehlt (gefunden: ${daten.difficultyTexts.join(', ')})`)
      process.exit(8)
    }
  }
  if (!daten.hostHasNoDifficulty) {
    console.error('FAIL: Host-Slot hat eine Difficulty-Pille (sollte KEINE haben)')
    process.exit(9)
  }
  if (consoleErrors.length > 0) {
    console.error('FAIL: console-Fehler:', consoleErrors)
    process.exit(10)
  }
  if (pageErrors.length > 0) {
    console.error('FAIL: page-Fehler:', pageErrors)
    process.exit(11)
  }
  console.log('OK: M3c Sonniges-Nest-Player-Cards verifiziert')
}

main().catch((e) => { console.error(e); process.exit(99) })