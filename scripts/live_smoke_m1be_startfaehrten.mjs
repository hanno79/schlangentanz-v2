/*
Author: rahn
Datum: 18.06.2026
Version: 1.0
Beschreibung: M1be Browser-Smoke — prüft Startfährten im /game-Startkreis und echte Startkreis-Ausführung.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function url(route) {
  return new URL(route, BASE_URL).toString()
}

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const errors = []

  page.on('pageerror', (err) => errors.push(`Page-Fehler: ${err.message}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`Console-Fehler: ${msg.text()}`)
  })
  await page.addInitScript(() => { Math.random = () => 0.999999 })

  try {
    await page.goto(url('/game'), { waitUntil: 'networkidle' })

    const startzone = page.locator('.schlangen-startzone--magiekreis').first()
    const startfaehrten = startzone.locator('.schlangen-startzone__faehrte')
    const fallbackButtons = page.getByRole('button', { name: /Startkreis mit Karte/ })

    await startzone.waitFor({ state: 'visible' })
    const faehrtenAnzahl = await startfaehrten.count()
    if (faehrtenAnzahl < 2) throw new Error(`M1be: zu wenige Startfährten sichtbar (${faehrtenAnzahl})`)
    if (await fallbackButtons.count() !== 0) throw new Error('M1be: alte Startkreis-Buttonliste ist auf /game noch sichtbar')

    const stil = await startfaehrten.first().evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        border: style.borderTopWidth,
        radius: style.borderTopLeftRadius,
        shadow: style.boxShadow,
        text: element.textContent,
      }
    })
    if (stil.border !== '3px' || !stil.shadow.includes('rgb(6, 57, 7)')) {
      throw new Error(`M1be: Startfährte nicht chunky genug (${JSON.stringify(stil)})`)
    }

    await startzone.click()
    await page.getByRole('button', { name: /Schlange schlange-spieler-1-1/ }).waitFor({ state: 'visible' })

    if (errors.length > 0) throw new Error(errors.join('\n'))
    console.log(`M1be Startfährten: ${faehrtenAnzahl} Plättchen sichtbar, keine Fallbackbuttons, Startkreis legt ${stil.text?.trim()} an`)
  } finally {
    await context.close()
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
