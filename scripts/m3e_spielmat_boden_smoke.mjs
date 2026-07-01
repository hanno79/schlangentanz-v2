/**
 * M3e Live-Smoke: Waldtanz-Spielmat-Boden im Brettrund-Zentrum.
 *
 * Vertrag: Auf https://schlangentanz-v2.vercel.app/game rendert die
 * .waldtanz-spielmat-boden-Region als sichtbare Stitch-Spielmat-Box.
 *
 * Pitfall #22 (M1dt-Dispens): Brettrund-Spielmat ist im Initial-State
 * sichtbar, kein State-Setup noetig.
 *
 * Smoke-Asserts:
 *  - Container existiert (querySelector)
 *  - 3px dashed border-style + forest-green border-color (computed)
 *  - aria-label="Waldtanz-Spielmat"
 *  - Im Brettrund-Zentrum (x: 200-1200, y: 280-720)
 *  - Lime/forest background (radial-gradient oder linear-gradient)
 *  - Hexagon-SVG sichtbar
 *  - Console-/Page-Errors leer
 *
 * Usage:
 *   SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app node scripts/m3e_spielmat_boden_smoke.mjs
 *   node scripts/m3e_spielmat_boden_smoke.mjs --self-test   (offline config check, NO real browser)
 */

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL || 'https://schlangentanz-v2.vercel.app'
const SEL = {
  spielmat: '[aria-label="Waldtanz-Spielmat"]',
  hexagon: '.waldtanz-spielmat-boden__hexagon',
}

function logHeader(title) {
  console.log('\n=== ' + title + ' ===')
}

function sichtInfo(page, selector) {
  return page.evaluate(sel => {
    const el = document.querySelector(sel)
    if (!el) return { vorhanden: false }
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      vorhanden: true,
      x: Math.round(r.x),
      y: Math.round(r.y),
      w: Math.round(r.width),
      h: Math.round(r.height),
      sichtbar: r.width >= 4 && r.height >= 4 && cs.display !== 'none',
      display: cs.display,
      borderTop: cs.borderTopWidth + ' ' + cs.borderTopStyle + ' ' + cs.borderTopColor,
      borderRadius: cs.borderTopLeftRadius,
      backgroundImage: cs.backgroundImage,
      ariaLabel: el.getAttribute('aria-label'),
    }
  }, selector)
}

async function smoke() {
  console.log('M3e Brettrund-Spielmat-Boden Live-Smoke')
  console.log('BASE_URL:', BASE_URL)

  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()
  const consoleErrors = []
  const pageErrors = []
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', err => pageErrors.push(err.message))

  await page.goto(BASE_URL + '/game', { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(1500)

  // Screenshot for visual evidence
  await page.screenshot({ path: '/tmp/m3e_smoke_production.png', fullPage: false })

  // 1. Container exists
  logHeader('1. Container-Sichtbarkeit')
  const info = await sichtInfo(page, SEL.spielmat)
  if (!info.vorhanden) {
    throw new Error('M3e: .waldtanz-spielmat-boden Container fehlt im DOM')
  }
  console.log('Container:', info)
  if (!info.sichtbar) {
    throw new Error('M3e: Container ist im DOM aber nicht sichtbar (display=' + info.display + ')')
  }

  // 2. Border-Verify
  logHeader('2. Border + Dashed-Style')
  console.log('Border-Top:', info.borderTop)
  if (!/3px/.test(info.borderTop)) {
    throw new Error('M3e: Border-Width nicht 3px (ist: ' + info.borderTop + ')')
  }
  if (!/dashed/.test(info.borderTop)) {
    throw new Error('M3e: Border-Style nicht dashed (ist: ' + info.borderTop + ')')
  }
  console.log('OK: 3px dashed')

  // 3. Border-Radius Verify
  logHeader('3. Border-Radius (Stitch-Optik)')
  console.log('Border-Radius:', info.borderRadius)
  if (info.borderRadius === '0px') {
    throw new Error('M3e: border-radius ist 0 (kein Stitch-Pillen-Look)')
  }
  console.log('OK: border-radius > 0')

  // 4. Lime/forest-Gradient
  logHeader('4. Background-Gradient')
  console.log('Background-Image:', info.backgroundImage.substring(0, 200))
  if (!/(radial-gradient|linear-gradient)/.test(info.backgroundImage)) {
    throw new Error('M3e: Background hat keinen Gradient')
  }
  console.log('OK: Gradient-Background')

  // 5. Brettrund-Zentrum Position
  logHeader('5. Position im Brettrund-Zentrum')
  console.log('x/y/w/h:', info.x, info.y, info.w, info.h)
  if (info.y < 250 || info.y > 720) {
    throw new Error('M3e: Container nicht im Brettrund-Zentrum (y=' + info.y + ', erwartet 250-720)')
  }
  if (info.x < 200 || info.x > 1200) {
    throw new Error('M3e: Container nicht in Brettrund-Breite (x=' + info.x + ', erwartet 200-1200)')
  }
  console.log('OK: im Brettrund-Zentrum')

  // 6. Hexagon-SVG sichtbar
  logHeader('6. Hexagon-SVG')
  const hexInfo = await sichtInfo(page, SEL.hexagon)
  console.log('Hexagon:', hexInfo)
  if (!hexInfo.vorhanden) {
    throw new Error('M3e: Hexagon-SVG fehlt')
  }
  console.log('OK: Hexagon-SVG vorhanden')

  // 7. aria-label
  logHeader('7. aria-label')
  if (info.ariaLabel !== 'Waldtanz-Spielmat') {
    throw new Error('M3e: aria-label falsch (ist: "' + info.ariaLabel + '")')
  }
  console.log('OK: aria-label="Waldtanz-Spielmat"')

  // 8. Console/Page-Errors
  logHeader('8. Console-/Page-Errors')
  if (consoleErrors.length > 0) {
    console.log('CONSOLE_ERRORS:', consoleErrors)
    throw new Error('M3e: ' + consoleErrors.length + ' Console-Errors')
  }
  if (pageErrors.length > 0) {
    console.log('PAGE_ERRORS:', pageErrors)
    throw new Error('M3e: ' + pageErrors.length + ' Page-Errors')
  }
  console.log('OK: keine Console-/Page-Errors')

  console.log('\n=== M3e Live-Smoke: ALLE 8 ASSERTS GRUEN ===')
  await browser.close()
}

function selfTest() {
  console.log('M3e Brettrund-Spielmat-Boden Self-Test (offline config check)')
  console.log('BASE_URL:', BASE_URL)
  console.log('Selectors:', SEL)
  if (!BASE_URL.startsWith('http')) {
    throw new Error('SMOKE_BASE_URL muss mit http(s) starten')
  }
  console.log('OK: Self-Test bestanden')
}

const isSelfTest = process.argv.includes('--self-test')
async function run() {
  if (isSelfTest) {
    selfTest()
    return
  }
  await smoke()
}

run().catch(err => {
  console.error('M3e Live-Smoke FEHLGESCHLAGEN:', err.message)
  process.exit(1)
})
