/*
Author: rahn
Datum: 19.06.2026
Version: 1.0
Beschreibung: M1bv Production-/Local-Smoke fuer kompakte Waldtaschen im Waldtanz-Spielbrett.
*/

import { chromium } from 'playwright'

const baseUrl = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function url(route) {
  return new URL(route, baseUrl).toString()
}

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(`Page-Fehler: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`Console-Fehler: ${message.text()}`)
  })

  try {
    await page.addInitScript(() => { Math.random = () => 0.999999 })
    await page.goto(url('/game'), { waitUntil: 'networkidle' })

    const messung = await page.evaluate(() => {
      const taschen = document.querySelector('.waldtanz-waldtaschen')
      const lichtung = document.querySelector('.waldtanz-arenastein__schlangenlichtung')
      const cards = Array.from(document.querySelectorAll('.waldtanz-waldtaschen > section'))
      const heading = document.querySelector('.waldtanz-waldtaschen__kopf h4')
      const boxes = [taschen, lichtung, heading, ...cards].map((element) => element?.getBoundingClientRect() ?? null)
      const style = taschen ? getComputedStyle(taschen) : null
      const cardStyles = cards.map((element) => getComputedStyle(element))
      const firstCardCenter = boxes[3]
        ? { x: boxes[3].x + boxes[3].width / 2, y: boxes[3].y + boxes[3].height / 2 }
        : null
      const hit = firstCardCenter ? document.elementFromPoint(firstCardCenter.x, firstCardCenter.y)?.closest('.waldtanz-waldtaschen > section')?.className ?? '' : ''
      return {
        text: taschen?.textContent ?? '',
        waldtaschen: boxes[0],
        lichtung: boxes[1],
        heading: boxes[2],
        kartenHoehen: boxes.slice(3).map((box) => box?.height ?? 0),
        borderWidths: cardStyles.map((s) => s.borderTopWidth),
        shadow: cardStyles[0]?.boxShadow ?? '',
        overflowX: style?.overflowX ?? '',
        hit,
      }
    })

    if (!messung.waldtaschen || !messung.lichtung || !messung.heading) {
      throw new Error(`M1bv Waldtaschen: erwartete Regionen fehlen (${JSON.stringify(messung)})`)
    }
    if (!messung.text.includes('Waldtaschen') || !messung.text.includes('Ziehstapel') || !messung.text.includes('Quests')) {
      throw new Error(`M1bv Waldtaschen: sichtbare Taschen-Beschriftung fehlt (${messung.text})`)
    }
    if (messung.waldtaschen.width < 145 || messung.waldtaschen.width > 220) {
      throw new Error(`M1bv Waldtaschen: Taschenleiste zu schmal/breit (${Math.round(messung.waldtaschen.width)}px)`)
    }
    if (messung.waldtaschen.x <= messung.lichtung.x + messung.lichtung.width) {
      throw new Error(`M1bv Waldtaschen: nicht rechts neben der Lichtung (${JSON.stringify({ waldtaschen: messung.waldtaschen, lichtung: messung.lichtung })})`)
    }
    if (Math.max(...messung.kartenHoehen) > 150) {
      throw new Error(`M1bv Waldtaschen: eine Tasche bleibt zu hoch (${messung.kartenHoehen.map(Math.round).join(', ')}px)`)
    }
    if (!messung.borderWidths.every((breite) => breite === '3px')) {
      throw new Error(`M1bv Waldtaschen: nicht alle Taschen haben 3px-Rand (${messung.borderWidths.join(', ')})`)
    }
    if (!messung.shadow.includes('rgb(6, 57, 7)')) {
      throw new Error(`M1bv Waldtaschen: Hard Shadow fehlt (${messung.shadow})`)
    }
    if (messung.overflowX !== 'visible') {
      throw new Error(`M1bv Waldtaschen: horizontale Waldtaschen dürfen nicht clippen (${messung.overflowX})`)
    }
    if (!String(messung.hit).includes('waldtanz-nachziehstapel')) {
      throw new Error(`M1bv Waldtaschen: erste Tasche nicht hit-testbar (${messung.hit})`)
    }
    if (errors.length > 0) throw new Error(errors.join('\n'))
    console.log(`M1bv Waldtaschen: ${Math.round(messung.waldtaschen.width)}px rechts neben Lichtung, Kartenhoehen ${messung.kartenHoehen.map(Math.round).join('/')}px, hit-testbar`)
  } finally {
    await context.close()
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
