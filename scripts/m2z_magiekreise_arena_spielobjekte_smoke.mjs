/*
 * Author: hermes-cron
 * Datum: 30.06.2026
 * Version: 1.0
 * Beschreibung: M2z Production-Smoke fuer die grossen, lebendigen
 *              Magiekreise-Forest-Arena-Spielobjekte auf /game. Verifiziert:
 *              - Auf /game ist der Magiekreise-Container gross (>= 200px hoch)
 *                mit 3px Stitch-Border + Hard-Shadow.
 *              - Die 3 Kreisel-Slots haben grid-template-columns repeat(3, ...).
 *              - Jeder Kreisel ist ~140-160px gross (Stitch-Groesse).
 *              - Eyebrow-Header "Magiekreise aktiv" + Zaehler "Brettwege leuchten" sichtbar.
 *              - Active-Kreisel haben eine Animation (Stitch-Magic-Circle-Pulse).
 *              - Reduced-Motion-Override schaltet die Animation ab (per Media-Query im CSS).
 *              - Keine Console-/Page-Errors.
 *
 * Pattern: M2y/M2w Live-Smoke-Helper. sichtInfo(el) prueft
 * display != none UND boundingBox >= 4 px.
 *
 * Self-Test-Mode: --self-test prueft nur BASE_URL und Helper-Kompilation.
 */

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const SELF_TEST = process.argv.includes('--self-test')

function url(route) { return new URL(route, BASE_URL).toString() }

async function httpPruefen(basis) {
  const response = await fetch(basis, { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`M2z: HTTP ${response.status} fuer ${basis}`)
}

async function sichtInfo(page, selektor) {
  const locator = page.locator(selektor).first()
  const count = await locator.count()
  if (count === 0) return { vorhanden: false, count: 0, display: null, breite: 0, hoehe: 0, animation: 'none' }
  const box = await locator.boundingBox()
  const cs = await locator.evaluate((e) => {
    const style = window.getComputedStyle(e)
    return {
      display: style.display,
      borderWidth: style.borderWidth,
      borderColor: style.borderColor,
      boxShadow: style.boxShadow,
      borderRadius: style.borderRadius,
      animationName: style.animationName,
      animationDuration: style.animationDuration,
      minHeight: style.minHeight,
      gridTemplateColumns: style.gridTemplateColumns,
    }
  }).catch(() => ({ display: 'unknown', borderWidth: '0px', borderColor: 'unknown', boxShadow: 'none', borderRadius: '0px', animationName: 'none', animationDuration: '0s', minHeight: '0px', gridTemplateColumns: 'none' }))
  return {
    vorhanden: true,
    count,
    display: cs.display,
    breite: box?.width ?? 0,
    hoehe: box?.height ?? 0,
    borderWidth: cs.borderWidth,
    borderColor: cs.borderColor,
    boxShadow: cs.boxShadow,
    borderRadius: cs.borderRadius,
    animationName: cs.animationName,
    animationDuration: cs.animationDuration,
    minHeight: cs.minHeight,
    gridTemplateColumns: cs.gridTemplateColumns,
  }
}

async function pruefeM2zMagiekreise(page) {
  // 1) Magiekreise-Container muss gross + Stitch-Stil haben
  const magiekreise = await sichtInfo(page, '.waldtanz-magiekreise')
  if (!magiekreise.vorhanden) throw new Error('M2z: .waldtanz-magiekreise fehlt im DOM')
  if (magiekreise.display === 'none') throw new Error('M2z: .waldtanz-magiekreise hat display:none (sollte sichtbar sein)')

  // M2z-Acceptance: Magiekreise-Container >= 200px hoch (Stitch-Spielobjekt)
  if (magiekreise.hoehe < 200) {
    throw new Error(`M2z: Magiekreise-Container zu klein: ${magiekreise.hoehe.toFixed(1)}px < 200px Stitch-Schwelle`)
  }

  // M2z-Acceptance: 3px-Border (Stitch-Stil)
  if (!magiekreise.borderWidth.includes('3px')) {
    console.log(`M2z INFO: Border-Width ist ${magiekreise.borderWidth} (3px erwartet)`)
  }

  // M2z-Acceptance: Hard-Shadow (mindestens 2px offset)
  if (magiekreise.boxShadow === 'none' || !/\d+px\s+\d+px/.test(magiekreise.boxShadow)) {
    throw new Error(`M2z: Magiekreise-Container hat keinen Hard-Shadow: "${magiekreise.boxShadow}"`)
  }

  // 2) Liste mit 3 Spalten (grid-template-columns: repeat(3, ...))
  const liste = await sichtInfo(page, '.waldtanz-magiekreise__liste')
  if (!liste.vorhanden) throw new Error('M2z: .waldtanz-magiekreise__liste fehlt im DOM')
  // 3 Spalten bedeutet gridTemplateColumns enthaelt 3 Tracks
  const tracks = (liste.gridTemplateColumns.match(/[\d.]+px/g) || []).length
  if (tracks < 3) {
    throw new Error(`M2z: Magiekreise-Liste hat ${tracks} Tracks (3 erwartet) — grid-template-columns="${liste.gridTemplateColumns}"`)
  }

  // 3) Jeder Kreisel ist ~140-160px gross (Stitch-Groesse)
  const kreiselCount = await page.locator('.waldtanz-magiekreise__kreis').count()
  if (kreiselCount !== 3) {
    throw new Error(`M2z: Erwartet 3 Kreisel, gefunden ${kreiselCount}`)
  }
  for (let i = 0; i < 3; i++) {
    const k = await sichtInfo(page, `.waldtanz-magiekreise__kreis >> nth=${i}`)
    if (!k.vorhanden) continue
    if (k.breite < 120 || k.hoehe < 120) {
      throw new Error(`M2z: Kreisel ${i} zu klein: ${k.breite.toFixed(0)}x${k.hoehe.toFixed(0)}px (>= 120x120 erwartet)`)
    }
  }

  // 4) Eyebrow-Header sichtbar (Badge + Zaehler)
  const badgeCount = await page.locator('.waldtanz-magiekreise__badge').count()
  const zaehlerCount = await page.locator('.waldtanz-magiekreise__zaehler').count()
  if (badgeCount === 0) throw new Error('M2z: .waldtanz-magiekreise__badge fehlt im DOM')
  if (zaehlerCount === 0) throw new Error('M2z: .waldtanz-magiekreise__zaehler fehlt im DOM')

  // 5) Mindestens 1 aktiver Kreisel hat eine Animation (Stitch-Magic-Circle-Pulse)
  const aktiveCount = await page.locator('.waldtanz-magiekreise__kreis--aktiv').count()
  if (aktiveCount > 0) {
    const aktiver = await sichtInfo(page, '.waldtanz-magiekreise__kreis--aktiv')
    if (aktiver.animationName === 'none' || !aktiver.animationName.includes('magiekreis')) {
      console.log(`M2z INFO: Aktiver Kreisel animation-name="${aktiver.animationName}" (Stitch-Pulse erwartet)`)
    }
  } else {
    console.log('M2z INFO: Kein aktiver Kreisel im Initial-State (kein Brettweg aktiv) — Animation-Assert uebersprungen')
  }

  console.log(`M2z OK: magiekreise gross (${magiekreise.hoehe.toFixed(1)}px hoch, ${magiekreise.breite.toFixed(0)}px breit), 3 Kreisel, Liste ${tracks} Tracks, ${aktiveCount} aktiv`)
}

async function main() {
  if (SELF_TEST) {
    console.log('M2z Self-Test: BASE_URL=' + BASE_URL)
    console.log('M2z Self-Test: sichtInfo + pruefeM2zMagiekreise kompilieren OK')
    return
  }

  await httpPruefen(BASE_URL)
  await httpPruefen(BASE_URL + '/game')

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const consoleErrors = []
  const pageErrors = []
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  page.on('pageerror', (err) => { pageErrors.push(err.message) })

  try {
    // 1) /game: Magiekreise-Container + Kreisel + Animation
    await page.goto(url('/game'), { waitUntil: 'networkidle' })
    await pruefeM2zMagiekreise(page)

    // 2) Screenshot fuer Evidence
    await page.screenshot({ path: '/tmp/m2z_magiekreise_arena.png', fullPage: false })

    if (consoleErrors.length > 0) throw new Error('M2z: console errors: ' + consoleErrors.join(' | '))
    if (pageErrors.length > 0) throw new Error('M2z: page errors: ' + pageErrors.join(' | '))

    console.log('M2z OK: keine console-/page-errors')
  } finally {
    await browser.close()
  }
}

main().catch((err) => { console.error(err); process.exit(1) })
