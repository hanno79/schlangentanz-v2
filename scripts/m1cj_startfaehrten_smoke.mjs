/*
Author: rahn
Datum: 19.06.2026
Version: 1.0
Beschreibung: M1cj Browser-Smoke fuer direkt klickbare Startfaehrten im ersten Waldtanz-Zug.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
function url(route) { return new URL(route, BASE_URL).toString() }

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', err => errors.push(`Page-Fehler: ${err.message}`))
  page.on('console', msg => { if (msg.type() === 'error') errors.push(`Console-Fehler: ${msg.text()}`) })
  await page.addInitScript(() => { Math.random = () => 0.999999 })

  try {
    await page.goto(url('/game'), { waitUntil: 'networkidle' })
    await page.getByRole('region', { name: 'Spieltisch' }).waitFor()
    const buttons = page.locator('.schlangen-startzone__faehrte-button')
    const count = await buttons.count()
    if (count !== 5) throw new Error(`M1cj Startfaehrten: erwartete 5 Buttons, gefunden ${count}`)

    const metrics = await buttons.evaluateAll(elements => elements.map((element) => {
      if (!(element instanceof HTMLElement)) throw new Error('M1cj Startfaehrten: Button ist kein HTMLElement')
      const box = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.closest('button')
      return {
        label: element.getAttribute('aria-label'),
        width: box.width,
        height: box.height,
        border: style.borderTopWidth,
        shadow: style.boxShadow,
        hit: hit === element,
      }
    }))

    if (!metrics.every(m => m.label?.startsWith('Startfährte ') && m.border === '3px' && m.shadow !== 'none' && m.hit)) {
      throw new Error(`M1cj Startfaehrten: Buttons nicht sichtbar/hit-testbar (${JSON.stringify(metrics)})`)
    }

    const letzteStartfaehrte = page.getByRole('button', { name: 'Startfährte blau-09 als neue Schlange starten' })
    await letzteStartfaehrte.focus()
    await page.keyboard.press('Enter')
    await page.getByLabel('Farbkarte blau-09: Blau mit 1 Punkten').waitFor()
    const state = await page.evaluate(() => ({
      aktion: document.body.textContent?.includes('Zuletzt ausgeführt: Neue Schlange starten mit Karte blau-09'),
      falscheKarte: Boolean(document.querySelector('.schlangenbereich--waldlichtung [aria-label="Farbkarte blau-01: Blau mit 1 Punkten"]')),
      eigeneSchlange: Boolean(document.querySelector('.schlangekarte--eigene')),
    }))

    if (!state.aktion || !state.eigeneSchlange || state.falscheKarte) {
      throw new Error(`M1cj Startfaehrten: Klick startet nicht die gewaehlte Karte (${JSON.stringify(state)})`)
    }
    if (errors.length > 0) throw new Error(errors.join('\n'))
    console.log(`M1cj Startfaehrten: ${count} Startwege hit-testbar, blau-09 startet direkt die gewaehlte Schlange.`)
  } finally {
    await context.close()
    await browser.close()
  }
}

await main()
