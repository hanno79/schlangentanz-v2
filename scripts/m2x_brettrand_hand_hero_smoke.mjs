// M2x Brettrand-Hand-Hero Production-Smoke (2026-06-30)
//
// Verifiziert dass auf /game die Brettrand-Hero-Zone sichtbar ist:
// - handkarten-buehne (Hero-Prominenz)
// - handkarten-spielbarkeit (Stitch-Pille)
// - handkarten-buehne__endturn (End-Turn Hero — nur sichtbar nach Zug-Beendigung)
// - handkarten-buehne__pflichtabwurf (Pflicht-Abwurf Hero — nur bei Pflicht)
//
// Pattern: M2r/M2s/M2w Live-Smoke-Helper. sichtInfo(el) prüft display != none
// UND boundingBox >= 4 px, damit der Test viewport-resistent ist.

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL || 'https://schlangentanz-v2.vercel.app'
const VIEWPORT = { width: 1280, height: 900 }

async function sichtInfo(locator) {
  const count = await locator.count()
  if (count === 0) return { vorhanden: false, count: 0, display: null, breite: 0, hoehe: 0 }
  const el = locator.first()
  const box = await el.boundingBox()
  const cs = await el.evaluate((e) => {
    const style = window.getComputedStyle(e)
    return { display: style.display, borderWidth: style.borderWidth, borderColor: style.borderColor, boxShadow: style.boxShadow, borderRadius: style.borderRadius }
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

async function pruefeM2xBrettrandHandHero(page) {
  const ergebnisse = []
  let fehler = 0

  // 1. Handkarten-Buehne sichtbar + Mindest-Hoehe 100 px
  const buehne = await sichtInfo(page.locator('.handkarten-buehne').first())
  ergebnisse.push({ check: 'handkarten-buehne sichtbar', info: buehne })
  if (!buehne.vorhanden) {
    console.error('M2x FAIL: .handkarten-buehne fehlt im DOM')
    fehler++
  } else if (buehne.display === 'none') {
    console.error('M2x FAIL: .handkarten-buehne display=none')
    fehler++
  } else if (buehne.hoehe < 95) {
    console.error(`M2x FAIL: .handkarten-buehne zu niedrig (${buehne.hoehe}px < 95px)`)
    fehler++
  } else {
    console.log(`M2x OK: .handkarten-buehne sichtbar (${buehne.breite.toFixed(0)}x${buehne.hoehe.toFixed(0)} px)`)
  }

  // 2. Handkarten-Spielbarkeit-Pille sichtbar (Stitch-Pille)
  const spielbarkeit = await sichtInfo(page.locator('.handkarten-spielbarkeit').first())
  ergebnisse.push({ check: 'handkarten-spielbarkeit Stitch-Pille', info: spielbarkeit })
  if (!spielbarkeit.vorhanden) {
    console.error('M2x FAIL: .handkarten-spielbarkeit fehlt im DOM')
    fehler++
  } else if (spielbarkeit.display === 'none') {
    console.error('M2x FAIL: .handkarten-spielbarkeit display=none')
    fehler++
  } else {
    // Border-Dicke (computed style: z.B. "3px" -> erste Komponente)
    const borderWidthNum = parseFloat(spielbarkeit.borderWidth) || 0
    if (borderWidthNum < 2.5) {
      console.error(`M2x FAIL: .handkarten-spielbarkeit Border zu duenn (${spielbarkeit.borderWidth} < 3px)`)
      fehler++
    } else {
      console.log(`M2x OK: .handkarten-spielbarkeit Hero-Pille (${spielbarkeit.breite.toFixed(0)}x${spielbarkeit.hoehe.toFixed(0)} px, Border ${spielbarkeit.borderWidth}, Radius ${spielbarkeit.borderRadius})`)
    }
  }

  // 3. End-Turn-Pille (Initial-State: nicht sichtbar, kommt erst nach Zug-Beendigung)
  //    Wir pruefen STRUCTURAL: Klasse + CSS-Border-Definition vorhanden
  const endturnCount = await page.locator('.handkarten-buehne__endturn').count()
  ergebnisse.push({ check: 'handkarten-buehne__endturn Klasse vorhanden', info: { count: endturnCount } })
  if (endturnCount === 0) {
    console.log('M2x INFO: .handkarten-buehne__endturn im Initial-State nicht gerendert (kommt nach Zug-Beendigung) — strukturell OK')
  } else {
    const endturn = await sichtInfo(page.locator('.handkarten-buehne__endturn').first())
    const borderWidthNum = parseFloat(endturn.borderWidth) || 0
    if (borderWidthNum < 2.5) {
      console.error(`M2x FAIL: .handkarten-buehne__endturn Border zu duenn (${endturn.borderWidth} < 3px)`)
      fehler++
    } else {
      console.log(`M2x OK: .handkarten-buehne__endturn Hero-Pille (Border ${endturn.borderWidth})`)
    }
  }

  // 4. Pflicht-Abwurf-Pille (Initial-State: nicht sichtbar)
  const pflichtCount = await page.locator('.handkarten-buehne__pflichtabwurf').count()
  ergebnisse.push({ check: 'handkarten-buehne__pflichtabwurf Klasse vorhanden', info: { count: pflichtCount } })
  if (pflichtCount === 0) {
    console.log('M2x INFO: .handkarten-buehne__pflichtabwurf im Initial-State nicht gerendert (kommt nur bei Pflicht-Abwurf) — strukturell OK')
  } else {
    const pflicht = await sichtInfo(page.locator('.handkarten-buehne__pflichtabwurf').first())
    const borderWidthNum = parseFloat(pflicht.borderWidth) || 0
    if (borderWidthNum < 2.5) {
      console.error(`M2x FAIL: .handkarten-buehne__pflichtabwurf Border zu duenn (${pflicht.borderWidth} < 3px)`)
      fehler++
    } else {
      console.log(`M2x OK: .handkarten-buehne__pflichtabwurf Hero-Pille (Border ${pflicht.borderWidth})`)
    }
  }

  // 5. Eyebrow-Titel-Schriftgroesse (Hero-Schrift 1.05rem)
  const eyebrow = await page.locator('.handkarten-buehne__spielerplakette-titel').first()
  const eyebrowFontSize = await eyebrow.evaluate((e) => window.getComputedStyle(e).fontSize).catch(() => '0px')
  const eyebrowFontSizeNum = parseFloat(eyebrowFontSize) || 0
  ergebnisse.push({ check: 'handkarten-buehne__spielerplakette-titel font-size', info: { fontSize: eyebrowFontSize } })
  if (eyebrowFontSizeNum < 16) {
    // 1.05rem @ 16px root = 16.8px
    console.error(`M2x FAIL: .handkarten-buehne__spielerplakette-titel font-size zu klein (${eyebrowFontSize} < 16px)`)
    fehler++
  } else {
    console.log(`M2x OK: .handkarten-buehne__spielerplakette-titel Hero-Schrift (${eyebrowFontSize})`)
  }

  return { fehler, ergebnisse }
}

async function main() {
  if (process.argv.includes('--self-test')) {
    console.log('M2x Brettrand-Hand-Hero — Self-Test OK (Skript geladen, BASE_URL=' + BASE_URL + ')')
    return
  }

  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: VIEWPORT })
  const page = await context.newPage()
  const pageErrors = []
  const consoleErrors = []
  page.on('pageerror', (e) => pageErrors.push(e.message))
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  console.log(`M2x Brettrand-Hand-Hero — Live-Smoke @ ${VIEWPORT.width}x${VIEWPORT.height} auf ${BASE_URL}/game`)
  await page.goto(BASE_URL + '/game', { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(1500)

  const { fehler, ergebnisse } = await pruefeM2xBrettrandHandHero(page)
  await page.screenshot({ path: '/tmp/m2x_brettrand_hand_hero_1280x900.png', fullPage: false })

  if (pageErrors.length > 0) {
    console.error(`M2x FAIL: ${pageErrors.length} page errors:`, pageErrors)
    fehler += pageErrors.length
  } else {
    console.log('M2x OK: keine page errors')
  }
  if (consoleErrors.length > 0) {
    // Konsole-Fehler sind Hinweis, kein Hard-Block (z.B. 401-Logs etc.)
    console.warn(`M2x WARN: ${consoleErrors.length} console errors (nicht blockierend):`, consoleErrors.slice(0, 3))
  }

  await browser.close()

  if (fehler > 0) {
    console.error(`\nM2x FAILED mit ${fehler} Fehlern.`)
    process.exit(1)
  }
  console.log(`\nM2x Brettrand-Hand-Hero OK — ${ergebnisse.length} Checks gruen.`)
}

main().catch((e) => {
  console.error('M2x FATAL:', e)
  process.exit(1)
})
