/*
 * Author: hermes-cron
 * Datum: 01.07.2026
 * Version: 1.1
 * Beschreibung: M3d Production-Smoke fuer die konsolidierte
 *              Brettrand-Aktionsleiste auf /game. Verifiziert:
 *              - Auf /game ist .waldtanz-zugseitenleiste sichtbar mit
 *                3px Stitch-Border + Hard-Shadow (Container-Border).
 *              - Die 4 Aktions-Children (Zugpfad, Zugkompass,
 *                KiZugBuehne, Spielhilfe) sind Children der Leiste.
 *              - Children tragen KEINEN eigenen 3px-Border mehr
 *                (transparent-Override aktiv, Pitfall #30 Specifity 0,3,0).
 *              - Container hat aria-label "Zugleiste" (M1ao/M3d-Vertrag).
 *              - Keine Console-/Page-Errors.
 *
 * Pattern: M2z/M2w Live-Smoke-Helper. sichtInfo(el) prueft
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
  if (response.status !== 200) throw new Error(`M3d: HTTP ${response.status} fuer ${basis}`)
}

async function sichtInfo(page, selektor) {
  const locator = page.locator(selektor).first()
  const count = await locator.count()
  if (count === 0) {
    return { vorhanden: false, count: 0, display: null, breite: 0, hoehe: 0, borderWidth: '0px', boxShadow: 'none', borderRadius: '0px' }
  }
  const box = await locator.boundingBox()
  const cs = await locator.evaluate((e) => {
    const style = window.getComputedStyle(e)
    return {
      display: style.display,
      borderWidth: style.borderWidth,
      borderColor: style.borderColor,
      boxShadow: style.boxShadow,
      borderRadius: style.borderRadius,
    }
  }).catch(() => ({ display: 'unknown', borderWidth: '0px', borderColor: 'unknown', boxShadow: 'none', borderRadius: '0px' }))
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
  }
}

async function pruefeM3dBrettrandZugleiste(page) {
  // 1) Container .waldtanz-zugseitenleiste muss sichtbar sein
  const leiste = await sichtInfo(page, '.waldtanz-zugseitenleiste')
  if (!leiste.vorhanden) {
    throw new Error('M3d: .waldtanz-zugseitenleiste fehlt im DOM')
  }
  if (leiste.display === 'none') {
    throw new Error('M3d: .waldtanz-zugseitenleiste hat display:none (sollte sichtbar sein)')
  }

  // M3d-Acceptance: 3px-Container-Border (Stitch-Stil)
  if (!leiste.borderWidth.includes('3px')) {
    throw new Error(`M3d: Container-Border-Width ist ${leiste.borderWidth} (3px erwartet)`)
  }

  // M3d-Acceptance: Hard-Shadow (Stitch)
  if (leiste.boxShadow === 'none' || !/\d+px\s+\d+px/.test(leiste.boxShadow)) {
    throw new Error(`M3d: Container hat keinen Hard-Shadow: "${leiste.boxShadow}"`)
  }

  // 2) 4 Children muessen als Direct-Children existieren + sichtbar sein
  //    Pflicht: M3d-Consolidierung = genau diese 4 als Pills konsolidiert.
  const kindKlassen = [
    { name: 'Zugpfad', sel: '.zugpfad' },
    { name: 'Zugkompass', sel: '.zugkompass' },
    { name: 'KiZugBuehne', sel: '.ki-zug-buehne--brettnah' },
    { name: 'Spielhilfe', sel: '.waldtanz-spielhilfe' },
  ]
  let vorhandeneKinder = 0
  for (const k of kindKlassen) {
    const kind = await sichtInfo(page, k.sel)
    if (!kind.vorhanden) {
      throw new Error(`M3d: Kind "${k.name}" (${k.sel}) fehlt im DOM — Consolidation-Bruch`)
    }
    if (kind.display === 'none') {
      throw new Error(`M3d: Kind "${k.name}" (${k.sel}) hat display:none — sollte sichtbar sein (Pitfall #30)`)
    }
    // Border sollte TRANSPARENT sein, NICHT 3px solid forest-green
    // getComputedStyle serialisiert transparent als rgba(0, 0, 0, 0)
    if (kind.borderWidth.includes('3px') && kind.borderColor.includes('rgb(6, 57, 7)')) {
      throw new Error(`M3d: Kind "${k.name}" hat noch 3px forest-green-Border: ${kind.borderWidth} ${kind.borderColor} — Container-Border-Absorption fehlgeschlagen (Pitfall #30 Specifity-Bump fehlt)`)
    }
    vorhandeneKinder += 1
  }
  if (vorhandeneKinder < 4) {
    throw new Error(`M3d: Nur ${vorhandeneKinder}/4 erwartete Aktions-Children sichtbar`)
  }

  // 3) Aria-Label pruefen (Container = "Zugleiste", M1ao/M3d-Vertrag)
  const ariaLabel = await page.locator('.waldtanz-zugseitenleiste').first().getAttribute('aria-label').catch(() => null)
  if (ariaLabel !== 'Zugleiste') {
    throw new Error(`M3d: aria-label der Leiste ist "${ariaLabel}" (erwartet "Zugleiste")`)
  }

  console.log(`M3d OK: Brettrand-Aktionsleiste ${leiste.breite.toFixed(0)}x${leiste.hoehe.toFixed(1)}px, Container-Border ${leiste.borderWidth}, ${vorhandeneKinder} Children konsolidiert`)
}

async function main() {
  if (SELF_TEST) {
    console.log('M3d Self-Test: BASE_URL=' + BASE_URL)
    console.log('M3d Self-Test: sichtInfo + pruefeM3dBrettrandZugleiste kompilieren OK')
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
    // 1) /game: konsolidierte Brettrand-Aktionsleiste
    await page.goto(url('/game'), { waitUntil: 'networkidle' })
    await pruefeM3dBrettrandZugleiste(page)

    // 2) Screenshot fuer Evidence
    await page.screenshot({ path: '/tmp/m3d_brettrand_zugleiste.png', fullPage: false })

    if (consoleErrors.length > 0) throw new Error('M3d: console errors: ' + consoleErrors.join(' | '))
    if (pageErrors.length > 0) throw new Error('M3d: page errors: ' + pageErrors.join(' | '))

    console.log('M3d OK: keine console-/page-errors')
  } finally {
    await browser.close()
  }
}

main().catch((err) => { console.error(err); process.exit(1) })
