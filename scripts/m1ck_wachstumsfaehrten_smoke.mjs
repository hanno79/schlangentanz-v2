/*
Author: rahn
Datum: 19.06.2026
Version: 1.0
Beschreibung: M1ck Browser-Smoke fuer direkte Wachstumsfaehrten nach dem ersten Startzug.
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
    await page.getByRole('button', { name: 'Startfährte blau-01 als neue Schlange starten' }).click()
    await page.getByLabel('Farbkarte blau-01: Blau mit 1 Punkten').waitFor()
    await page.getByRole('button', { name: 'Weiter zur Aufgabenprüfung' }).click()
    await page.getByRole('button', { name: 'Weiter zum Zugabschluss' }).click()
    await page.getByRole('button', { name: 'Zug an nächsten Spieler geben' }).click()
    await page.getByRole('button', { name: 'Gegnerzug am Brett abspielen' }).click()
    await page.getByRole('button', { name: 'Ausspielphase starten' }).click()

    const faehrten = page.getByRole('list', { name: /Wachstumsfährten für schlange-/ })
    await faehrten.waitFor()
    const buttons = faehrten.getByRole('button', { name: /Wachstumsfährte .* für Pfad .* (links|rechts) anlegen/ })
    const count = await buttons.count()
    if (count < 2) throw new Error(`M1ck Wachstumsfaehrten: erwartete mindestens 2 Buttons, gefunden ${count}`)

    const metrics = await buttons.evaluateAll(elements => elements.map((element) => {
      if (!(element instanceof HTMLElement)) throw new Error('M1ck Wachstumsfaehrten: Button ist kein HTMLElement')
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

    if (!metrics.every(m => m.label?.startsWith('Wachstumsfährte ') && m.border === '3px' && m.shadow !== 'none' && m.hit)) {
      throw new Error(`M1ck Wachstumsfaehrten: Buttons nicht sichtbar/hit-testbar (${JSON.stringify(metrics)})`)
    }

    const firstLabel = await buttons.first().getAttribute('aria-label')
    await buttons.first().click()
    await page.waitForFunction(() => document.querySelectorAll('.schlangekarte--eigene .schlangekarte__karte--spielkarte').length >= 2)
    const state = await page.evaluate(() => ({
      eigeneKarten: document.querySelectorAll('.schlangekarte--eigene .schlangekarte__karte--spielkarte').length,
      aktion: document.body.textContent?.includes('Zuletzt ausgeführt: Karte '),
    }))

    if (!state.aktion || state.eigeneKarten < 2) {
      throw new Error(`M1ck Wachstumsfaehrten: Klick erweitert die Schlange nicht (${JSON.stringify({ firstLabel, state })})`)
    }
    if (errors.length > 0) throw new Error(errors.join('\n'))
    console.log(`M1ck Wachstumsfaehrten: ${count} Wachstumswege hit-testbar, erster Weg erweitert die Schlange.`)
  } finally {
    await context.close()
    await browser.close()
  }
}

await main()
