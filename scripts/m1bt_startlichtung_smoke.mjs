/*
Author: rahn
Datum: 19.06.2026
Version: 1.0
Beschreibung: M1bt Browser-Smoke fuer die freie, hit-testbare Waldtanz-Startlichtung oberhalb der Handbank.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function url(route) { return new URL(route, BASE_URL).toString() }

async function http200(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`HTTP ${response.status} fuer ${url(route)}`)
  console.log(`HTTP 200  ${url(route)}`)
}

async function main() {
  await Promise.all(['/', '/game'].map(http200))
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', err => errors.push(`Page-Fehler: ${err.message}`))
  page.on('console', msg => { if (msg.type() === 'error') errors.push(`Console-Fehler: ${msg.text()}`) })
  await page.addInitScript(() => { Math.random = () => 0.999999 })

  try {
    await page.goto(url('/game'), { waitUntil: 'networkidle' })
    const startkreis = page.locator('.schlangen-startzone--magiekreis').first()
    await startkreis.waitFor()

    const metrics = await page.evaluate(() => {
      const start = document.querySelector('.schlangen-startzone--magiekreis')
      const hand = document.querySelector('.handkarten-panel')
      const ersteKarte = document.querySelector('.handkarte__button--karte')
      const gruppe = document.querySelector('.schlangenbereich--waldlichtung .schlangen-gruppe')
      if (!(start instanceof HTMLElement) || !(hand instanceof HTMLElement) || !(ersteKarte instanceof HTMLElement) || !(gruppe instanceof HTMLElement)) return null
      const startRect = start.getBoundingClientRect()
      const handRect = hand.getBoundingClientRect()
      const cardRect = ersteKarte.getBoundingClientRect()
      const gruppeRect = gruppe.getBoundingClientRect()
      const startStyle = getComputedStyle(start)
      const gruppeStyle = getComputedStyle(gruppe)
      const center = { x: startRect.x + startRect.width * 0.75, y: startRect.y + Math.min(startRect.height * 0.5, 68) }
      const hitClass = document.elementFromPoint(center.x, center.y)?.closest('.schlangen-startzone--magiekreis')?.className ?? ''
      const faehrten = [...document.querySelectorAll('.schlangen-startzone__faehrte')].map((element) => {
        const rect = element.getBoundingClientRect()
        return { text: element.textContent?.trim().replace(/\s+/g, ' '), top: rect.top, bottom: rect.bottom, width: rect.width }
      })
      return {
        startTop: startRect.top,
        startBottom: startRect.bottom,
        startWidth: startRect.width,
        startHeight: startRect.height,
        handTop: handRect.top,
        cardTop: cardRect.top,
        groupTop: gruppeRect.top,
        borderWidth: startStyle.borderTopWidth,
        borderStyle: startStyle.borderTopStyle,
        boxShadow: startStyle.boxShadow,
        groupBorderWidth: gruppeStyle.borderTopWidth,
        hitClass: String(hitClass),
        faehrten,
      }
    })

    if (!metrics) throw new Error('M1bt Startlichtung: Startkreis, Hand oder Gruppe fehlt')
    if (metrics.startTop > metrics.handTop - 38) throw new Error(`M1bt Startlichtung: Startkreis beginnt zu tief unter der Handbank ${JSON.stringify(metrics)}`)
    if (metrics.startBottom > metrics.handTop - 12) throw new Error(`M1bt Startlichtung: Startkreis wird von der Handbank ueberdeckt ${JSON.stringify(metrics)}`)
    if (metrics.startHeight < 92 || metrics.startWidth < 280) throw new Error(`M1bt Startlichtung: Startkreis zu klein ${JSON.stringify(metrics)}`)
    if (metrics.borderWidth !== '3px' || metrics.borderStyle !== 'dashed') throw new Error(`M1bt Startlichtung: Startkreis ohne 3px-Waldkreis ${JSON.stringify(metrics)}`)
    if (!metrics.boxShadow.includes('rgb(6, 57, 7)')) throw new Error(`M1bt Startlichtung: Hard Shadow fehlt ${JSON.stringify(metrics)}`)
    if (metrics.groupBorderWidth !== '3px') throw new Error(`M1bt Startlichtung: Eigene-Schlangen-Lichtung bleibt zu flach ${JSON.stringify(metrics)}`)
    if (!metrics.hitClass.includes('schlangen-startzone--magiekreis')) throw new Error(`M1bt Startlichtung: Mittelpunkt nicht hit-testbar ${JSON.stringify(metrics)}`)
    if (metrics.faehrten.length !== 5 || !metrics.faehrten.some((f) => f.text.includes('blau-01'))) throw new Error(`M1bt Startlichtung: Startfaehrten fehlen ${JSON.stringify(metrics.faehrten)}`)
    if (metrics.faehrten.some((f) => f.bottom > metrics.handTop - 2)) throw new Error(`M1bt Startlichtung: Startfaehrte rutscht unter die Hand ${JSON.stringify(metrics)}`)
    if (errors.length > 0) throw new Error(errors.join('\n'))
    console.log(`M1bt Startlichtung: Startkreis ${Math.round(metrics.startWidth)}x${Math.round(metrics.startHeight)}px frei vor Handtop ${Math.round(metrics.handTop)}px hit-testbar, ${metrics.faehrten.length} Startfaehrten sichtbar`)
  } finally {
    await context.close()
    await browser.close()
  }
}

await main()
