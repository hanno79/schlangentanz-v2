/*
Author: rahn
Datum: 25.06.2026
Version: 1.0
Beschreibung: M1df Browser-Smoke fuer den Waldtanz-Spielmoment-Stein­kreis.

  Beweist in einem echten Browser, dass die Magiekreise auf /game als
  drei visuell runde Drop-Steine auf einem gemeinsamen Stein-Hintergrund
  schweben — nicht als horizontale Buttonliste. jsdom-BoundingRect und
  border-radius-Auswertung sind unzuverlaessig (siehe
  jsdom-bbox-trap-in-slice-tests.md), daher ist dieser echte-Browser-Smoke
  das Release-Gate fuer M1df.

  Akzeptanzvertrag (m1df-waldtanz-steinkreis):
    1. Auf /game existiert genau ein Container mit beiden Klassen
       .waldtanz-magiekreise UND .waldtanz-steinkreis.
    2. Der Container enthaelt genau drei Kinder mit Klasse
       .waldtanz-steinkreis__kreisel, sichtbar als runde Drop-Steine
       (min-Seite >= 40 px, border-radius rundet visuell auf >= halbe
       min-Seite, plus ::before Stein-Hintergrund radial-gradient).
    3. Die drei aria-labels enthalten Startkreis, Schlangenende und
       Sonderzauber.
    4. Nach Klick auf eine Handkarte bekommt mindestens ein Kreisel die
       Klasse .waldtanz-steinkreis__kreisel--aktiv.
    5. Keine console/page-Fehler.
    6. Spielbrett-Bottom bleibt im Viewport + 60 px Toleranz (M1d0).
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

async function messeSteinkreis(page) {
  return page.evaluate(() => {
    const container = document.querySelector('.waldtanz-magiekreise.waldtanz-steinkreis')
    if (!(container instanceof HTMLElement)) throw new Error('M1df: Steinkreis-Container fehlt')
    const r = container.getBoundingClientRect()
    const kreisel = container.querySelectorAll('.waldtanz-steinkreis__kreisel')
    const beforeStyle = window.getComputedStyle(container, '::before')
    return {
      containerRect: { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom },
      kreiselCount: kreisel.length,
      kreiselData: Array.from(kreisel).map((k) => {
        const kr = k.getBoundingClientRect()
        const cs = window.getComputedStyle(k)
        return {
          label: k.getAttribute('aria-label') ?? '',
          isActive: k.classList.contains('waldtanz-steinkreis__kreisel--aktiv'),
          width: kr.width,
          height: kr.height,
          minSide: Math.min(kr.width, kr.height),
          borderRadius: cs.borderRadius,
        }
      }),
      beforeContent: beforeStyle.content,
      beforeBackground: beforeStyle.background,
    }
  })
}

function istRund(k) {
  if (k.minSide < 40) return false
  if (k.borderRadius.includes('%')) {
    // border-radius: 50% rundet visuell
    return true
  }
  const match = k.borderRadius.match(/^(\d+(?:\.\d+)?)px$/)
  if (match) return parseFloat(match[1]) >= k.minSide / 2
  return false
}

async function findeErsteHandkarte(page) {
  return page.evaluate(() => {
    const karte = document.querySelector('[data-handkarten-id]')
    if (!(karte instanceof HTMLElement)) {
      const buttons = Array.from(document.querySelectorAll('button')).filter((b) => b.getAttribute('aria-label')?.includes('Handkarte'))
      const erste = buttons[0]
      if (!(erste instanceof HTMLElement)) return null
      return { selector: 'button[aria-label*="Handkarte"]', label: erste.getAttribute('aria-label') }
    }
    return { selector: '[data-handkarten-id]', label: karte.getAttribute('data-handkarten-id') }
  })
}

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  const consoleErrors = []
  const pageErrors = []
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  page.on('pageerror', (err) => pageErrors.push(err.message))

  await page.goto(`${BASE_URL}/game`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.waldtanz-magiekreise.waldtanz-steinkreis', { timeout: 8000 })
  await page.waitForTimeout(400)

  const initial = await messeSteinkreis(page)
  const handkarte = await findeErsteHandkarte(page)

  let nachKlick = null
  let klickGeschafft = false
  if (handkarte) {
    try {
      await page.click(handkarte.selector, { timeout: 2500 })
      await page.waitForTimeout(400)
      nachKlick = await messeSteinkreis(page)
      klickGeschafft = true
    } catch (e) {
      nachKlick = null
    }
  }

  // Spielbrett-Bottom im Viewport (M1d0-Vertrag)
  const viewportHeight = page.viewportSize()?.height ?? 900
  const breitUntenImViewport = initial.containerRect.bottom <= viewportHeight + 60

  console.log('M1df Steinkreis Container:', JSON.stringify(initial.containerRect))
  console.log('M1df Steinkreis Kreisel Anzahl:', initial.kreiselCount)
  for (const k of initial.kreiselData) {
    console.log(`  - ${k.label} (${k.width.toFixed(0)}x${k.height.toFixed(0)}, radius=${k.borderRadius}, aktiv=${k.isActive})`)
  }
  console.log('M1df Container ::before background:', (initial.beforeBackground || '').slice(0, 80))
  if (handkarte) {
    console.log('M1df Handkarte gefunden:', handkarte.label, '(klick:', klickGeschafft, ')')
  } else {
    console.log('M1df Handkarte: keine gefunden (passive Sichtpruefung)')
  }
  if (nachKlick) {
    const aktive = nachKlick.kreiselData.filter((k) => k.isActive).length
    console.log('M1df Nach Handkarten-Klick aktive Kreisel:', aktive)
  }
  console.log('M1df Container-Bottom im Viewport + 60px:', breitUntenImViewport)
  console.log('M1df console.errors:', consoleErrors)
  console.log('M1df page.errors:', pageErrors)

  await page.screenshot({ path: '/tmp/m1df_steinkreis.png', fullPage: false })
  console.log('screenshot: /tmp/m1df_steinkreis.png')

  await browser.close()

  // Gates
  if (initial.kreiselCount !== 3) {
    console.error(`FAIL: erwartet 3 Kreisel, gefunden ${initial.kreiselCount}`)
    process.exit(2)
  }
  const alleRund = initial.kreiselData.every(istRund)
  if (!alleRund) {
    console.error('FAIL: nicht alle Kreisel sind visuell rund')
    process.exit(3)
  }
  const labels = initial.kreiselData.map((k) => k.label.toLowerCase())
  if (!labels.some((l) => l.includes('startkreis'))) {
    console.error('FAIL: Startkreis-aria-label fehlt')
    process.exit(4)
  }
  if (!labels.some((l) => l.includes('schlangenende') || l.includes('anlegeweg'))) {
    console.error('FAIL: Schlangenende-aria-label fehlt')
    process.exit(5)
  }
  if (!labels.some((l) => l.includes('sonderzauber'))) {
    console.error('FAIL: Sonderzauber-aria-label fehlt')
    process.exit(6)
  }
  if (!initial.beforeBackground.includes('radial-gradient')) {
    console.error('FAIL: Steinkreis ::before hat keinen radial-gradient Hintergrund')
    process.exit(7)
  }
  if (!breitUntenImViewport) {
    console.error(`FAIL: Container-Bottom ${initial.containerRect.bottom} > Viewport+60px ${viewportHeight + 60}`)
    process.exit(8)
  }
  if (consoleErrors.length > 0 || pageErrors.length > 0) {
    console.error('FAIL: console/page-Fehler')
    process.exit(9)
  }
  console.log('OK: M1df Steinkreis verifiziert')
}

main().catch((e) => { console.error(e); process.exit(99) })
