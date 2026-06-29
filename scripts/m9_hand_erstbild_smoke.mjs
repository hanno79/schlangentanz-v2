/*
 * Author: rahn
 * Datum: 29.06.2026
 * Version: 1.0
 * Beschreibung: M9 Browser-Smoke — Handkarten-Buehne muss im 1440x900
 *   Erstbild sichtbar sein (top >= 0, bottom <= 900). Vor M9 landete die
 *   Hand bei y=998-1226 (100-300 px unter Viewport-Falz). M9 strafft
 *   grid-template-rows so dass die Hand innerhalb des Erstbildes liegt.
 *
 *   Verifiziert:
 *     1. Hand-Panel: top >= 0 UND bottom <= vpH
 *     2. Arenastein liegt VOR der Hand (reihenfolge stimmt)
 *     3. Erste Handkarte hit-testbar (nicht ueberlagert)
 *     4. Schlangen-Region sichtbar (Arena-Inhalt lebendig)
 *   Viewport: 1440x900 (Hauptakzeptanz aus M9-Plan).
 */

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function metric(rect) {
  return {
    x: Math.round(rect.x), y: Math.round(rect.y),
    w: Math.round(rect.width), h: Math.round(rect.height),
    right: Math.round(rect.right), bottom: Math.round(rect.bottom),
  }
}

async function pruefeM9HandErstbild(page, viewport, label) {
  await page.setViewportSize(viewport)
  await page.goto(new URL('/game', BASE_URL).toString(), { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  const daten = await page.evaluate(() => {
    const rect = (selector) => {
      const el = document.querySelector(selector)
      if (!(el instanceof HTMLElement)) throw new Error(`M9 Erstbild: ${selector} fehlt`)
      const r = el.getBoundingClientRect()
      return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }
    }
    const firstCard = document.querySelector('.handkartenleiste--tiefenfaecher .handkarte__button--karte')
    if (!(firstCard instanceof HTMLElement)) throw new Error('M9 Erstbild: erste Handkarte fehlt')
    const cardRect = firstCard.getBoundingClientRect()
    const hit = Boolean(
      document.elementFromPoint(cardRect.x + cardRect.width / 2, cardRect.y + cardRect.height / 2)
        ?.closest('.handkarte__button--karte')
    )
    return {
      handkartenPanel: rect('.handkarten-panel'),
      arenastein: rect('.info-panel--waldtanz-arena'),
      schlangen: rect('.schlangenbereich'),
      firstCard: { y: cardRect.y, height: cardRect.height, bottom: cardRect.bottom, hit },
    }
  })

  const vpH = viewport.height
  // AENDERUNG 29.06.2026 (M9): Hauptakzeptanz ist "Hand vollstaendig im Erstbild".
  // bottomToleranz = 4 px fuer Browser-Sub-Pixel-Rounding, das Panel selbst
  // muss aber > 0 (also nicht collapsed) sein.
  if (daten.handkartenPanel.top < 0) {
    throw new Error(`M9 ${label}: Hand-Panel startet bei y=${daten.handkartenPanel.top} (negativ — collapsed oder off-screen oben)`)
  }
  if (daten.handkartenPanel.bottom > vpH + 4) {
    throw new Error(`M9 ${label}: Hand-Panel endet bei ${daten.handkartenPanel.bottom}px > ${vpH + 4} (${JSON.stringify(metric(daten.handkartenPanel))})`)
  }
  if (daten.handkartenPanel.height < 80) {
    throw new Error(`M9 ${label}: Hand-Panel zu klein (height=${daten.handkartenPanel.height}px < 80)`)
  }
  if (daten.arenastein.bottom > daten.handkartenPanel.top + 8) {
    throw new Error(`M9 ${label}: Arenastein (${daten.arenastein.bottom}px) reicht in den Hand-Bereich (top ${daten.handkartenPanel.top}px) — Reihenfolge kaputt`)
  }
  if (daten.schlangen.height < 60) {
    throw new Error(`M9 ${label}: Schlangen-Region zu klein (height=${daten.schlangen.height}px) — Arena-Inhalt collapsed`)
  }
  if (daten.firstCard.bottom > vpH + 4) {
    throw new Error(`M9 ${label}: erste Handkarte endet bei ${daten.firstCard.bottom}px > ${vpH + 4} (hit=${daten.firstCard.hit})`)
  }
  if (!daten.firstCard.hit) {
    throw new Error(`M9 ${label}: erste Handkarte nicht hit-testbar (Element am Center ist nicht die Karte selbst — vermutlich ueberlagert)`)
  }
  return daten
}

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (err) => errors.push(`Page-Fehler: ${err.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`Console-Fehler: ${msg.text()}`) })
  await page.addInitScript(() => { Math.random = () => 0.999999 })

  try {
    const haupt = await pruefeM9HandErstbild(page, { width: 1440, height: 900 }, 'Erstbild 1440x900')
    if (errors.length > 0) throw new Error(errors.join('\n'))
    console.log(
      `M9 Hand-Erstbild (1440x900): Hand-Panel ${Math.round(haupt.handkartenPanel.top)}-${Math.round(haupt.handkartenPanel.bottom)}px, Arenastein ${Math.round(haupt.arenastein.bottom)}px, Schlangen ${Math.round(haupt.schlangen.height)}px hoch, erste Karte ${Math.round(haupt.firstCard.bottom)}px hit-testbar.`
    )
  } finally {
    await context.close()
    await browser.close()
  }
}

await main()
