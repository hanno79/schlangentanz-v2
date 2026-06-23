/*
Author: rahn
Datum: 23.06.2026
Version: 1.0
Beschreibung: M1dd Browser-Smoke fuer das Aktionsdock-im-Spielbrett auf /game.

  Prueft, dass auf /game im 1280x900-Erstbild das Aktionendock
  (Element mit Klasse aktionen-panel--brettinline) als Kind des
  spielbrett--waldtanz-Sections gerendert wird, im Viewport sichtbar
  bleibt (bottom <= 900 + 60px Animations-Puffer) und nicht als
  position:absolute/fixed aus dem Grid herausfaellt.

  Beweist die M1dd Route-Scoping-Aenderung in einem echten Browser.
  jsdom-BoundingRect-Trivialtrue wird damit umgangen (siehe
  small-slice-release-workflow/references/jsdom-bbox-trap-in-slice-tests.md).
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function metric(rect) {
  return { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height), right: Math.round(rect.right), bottom: Math.round(rect.bottom) }
}

function rectIncludes(parent, child) {
  return (
    child.x >= parent.x - 1 &&
    child.y >= parent.y - 1 &&
    child.right <= parent.right + 1 &&
    child.bottom <= parent.bottom + 1
  )
}

async function panelDaten(page) {
  return page.evaluate(() => {
    const rect = (sel) => {
      const el = document.querySelector(sel)
      if (!(el instanceof HTMLElement)) throw new Error(`M1dd Smoke: ${sel} fehlt`)
      const r = el.getBoundingClientRect()
      return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }
    }
    const cs = (sel) => {
      const el = document.querySelector(sel)
      if (!(el instanceof HTMLElement)) throw new Error(`M1dd Smoke: ${sel} fehlt`)
      const c = getComputedStyle(el)
      return { gridArea: c.gridArea, position: c.position, maxHeight: c.maxHeight, overflow: c.overflow }
    }
    const dock = document.querySelector('.aktionen-panel--brettinline')
    if (!(dock instanceof HTMLElement)) throw new Error('M1dd Smoke: aktionen-panel--brettinline fehlt auf /game')
    const dockParent = dock.parentElement
    if (!dockParent) throw new Error('M1dd Smoke: Aktionendock hat keinen Parent')
    const inSpielbrett = !!dock.closest('[class~="spielbrett--waldtanz"]')
    return {
      spielbrett: rect('.spielbrett--waldtanz'),
      aktionendock: rect('.aktionen-panel--brettinline'),
      dockCss: cs('.aktionen-panel--brettinline'),
      dockParentKlasse: dockParent.className,
      inSpielbrett,
    }
  })
}

async function pruefeErstbild(page) {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(new URL('/game', BASE_URL).toString(), { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  return panelDaten(page)
}

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (err) => errors.push(`Page-Fehler: ${err.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`Console-Fehler: ${msg.text()}`) })
  await page.addInitScript(() => { Math.random = () => 0.999999 })

  try {
    const d = await pruefeErstbild(page)
    if (errors.length > 0) throw new Error(errors.join('\n'))

    // Aktionendock MUSS strukturell innerhalb des Spielbretts liegen.
    if (!d.inSpielbrett) {
      throw new Error(`M1dd: Aktionendock nicht in spielbrett--waldtanz (Parent-Klasse=${d.dockParentKlasse})`)
    }

    // Aktionendock MUSS im 1280x900-Erstbild sichtbar sein (bottom <= 960 mit Puffer).
    const maxBottom = 900 + 60
    if (d.aktionendock.bottom > maxBottom) {
      throw new Error(`M1dd: Aktionendock-Bottom ${d.aktionendock.bottom}px > Viewport 900px + 60px (Vertical-Overflow)`)
    }

    // Aktionendock MUSS innerhalb der Spielbrett-Box liegen (kein Austritt).
    if (!rectIncludes(d.spielbrett, d.aktionendock)) {
      throw new Error(`M1dd: Aktionendock ${JSON.stringify(metric(d.aktionendock))} ausserhalb Spielbrett ${JSON.stringify(metric(d.spielbrett))}`)
    }

    // Aktionendock MUSS im Grid verankert sein (grid-area nicht 'auto').
    if (d.dockCss.gridArea === 'auto' || !d.dockCss.gridArea) {
      throw new Error(`M1dd: Aktionendock grid-area="${d.dockCss.gridArea}" (erwartet: aktionsdock)`)
    }

    // Aktionendock darf nicht position:absolute/fixed aus dem Grid fallen.
    if (d.dockCss.position === 'absolute' || d.dockCss.position === 'fixed') {
      throw new Error(`M1dd: Aktionendock position:${d.dockCss.position} (erwartet: static/relative)`)
    }

    // max-height MUSS durch die neue Klasse begrenzt sein. Browser
    // normalisieren clamp(3.5rem, 8vh, 4.5rem) bei 1280x900 zu einem konkreten
    // px-Wert zwischen 56px (3.5rem bei 16px-root) und 72px (4.5rem). Wir
    // akzeptieren daher entweder den literalen clamp()-String oder einen
    // numerischen Wert im erwarteten Fenster.
    const rawMax = d.dockCss.maxHeight
    let maxPx = null
    const pxMatch = rawMax.match(/^([\d.]+)px$/)
    if (pxMatch) maxPx = parseFloat(pxMatch[1])
    const minExpected = 3.5 * 16 * 0.95 // 53.2px Untergrenze mit kleiner Rem-Toleranz
    const maxExpected = 4.5 * 16 * 1.05 // 75.6px Obergrenze
    if (maxPx !== null) {
      if (maxPx < minExpected || maxPx > maxExpected) {
        throw new Error(`M1dd: Aktionendock max-height=${maxPx}px ausserhalb erwartetem clamp-Fenster [${Math.round(minExpected)}px..${Math.round(maxExpected)}px]`)
      }
    } else if (!/clamp/.test(rawMax)) {
      throw new Error(`M1dd: Aktionendock max-height="${rawMax}" (erwartet: clamp(...) oder px im Fenster ${Math.round(minExpected)}..${Math.round(maxExpected)}px)`)
    }

    console.log(`M1dd Erstbild 1280x900: Spielbrett ${Math.round(d.spielbrett.bottom)}px, Aktionendock ${Math.round(d.aktionendock.height)}px hoch (bottom=${Math.round(d.aktionendock.bottom)}px), grid-area=${d.dockCss.gridArea}, max-height=${d.dockCss.maxHeight}, inSpielbrett=${d.inSpielbrett}.`)
  } finally {
    await context.close()
    await browser.close()
  }
}

await main()
