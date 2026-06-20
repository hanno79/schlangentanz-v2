/*
Author: rahn
Datum: 20.06.2026
Version: 1.0
Beschreibung: M1cm Browser-Smoke fuer sichtbare Zielwahl-Faehrten nach Handkartenwahl.
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
    await page.getByRole('button', { name: 'Weiter zur Aufgabenprüfung' }).click()
    await page.getByRole('button', { name: 'Weiter zum Zugabschluss' }).click()
    await page.getByRole('button', { name: 'Zug an nächsten Spieler geben' }).click()
    await page.getByRole('button', { name: 'Gegnerzug am Brett abspielen' }).click()
    await page.getByRole('button', { name: 'Ausspielphase starten' }).click()
    await page.getByRole('button', { name: /blau-03 Farbkarte/ }).click()
    const zielspur = page.getByRole('note', { name: 'Waldtanz-Zielspur' })
    await zielspur.getByRole('list', { name: 'Spielbare Brettwege' }).waitFor()
    await zielspur.scrollIntoViewIfNeeded()

    const daten = await page.evaluate(() => {
      const zielspur = document.querySelector('.waldtanz-zielspur--zielwahl-faehrten')
      if (!(zielspur instanceof HTMLElement)) throw new Error('M1cm Zielwahl-Fährten: Zielspur fehlt')
      const wege = Array.from(zielspur.querySelectorAll('.waldtanz-zielspur__weg')).map((weg) => weg.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      const style = getComputedStyle(zielspur)
      const box = zielspur.getBoundingClientRect()
      const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.closest('.waldtanz-zielspur--zielwahl-faehrten') === zielspur
      return { wege, borderTopWidth: style.borderTopWidth, boxShadow: style.boxShadow, backgroundImage: style.backgroundImage, top: Math.round(box.top), bottom: Math.round(box.bottom), hit }
    })

    if (!daten.wege.some(text => text.includes('Startkreis') && text.includes('neue Schlange'))) {
      throw new Error(`M1cm Zielwahl-Fährten: Startkreis-Fährte fehlt (${JSON.stringify(daten.wege)})`)
    }
    if (!daten.wege.some(text => text.includes('Wachstumsenden') && text.includes('Schlangenpfad'))) {
      throw new Error(`M1cm Zielwahl-Fährten: Wachstums-Fährte fehlt (${JSON.stringify(daten.wege)})`)
    }
    if (daten.borderTopWidth !== '3px' || !daten.boxShadow || !daten.backgroundImage.includes('linear-gradient')) {
      throw new Error(`M1cm Zielwahl-Fährten: Stitch-Stil nicht berechnet (${JSON.stringify(daten)})`)
    }
    if (!daten.hit) throw new Error(`M1cm Zielwahl-Fährten: Zielspur-Mitte nicht hit-testbar (${JSON.stringify(daten)})`)
    if (errors.length > 0) throw new Error(errors.join('\n'))
    console.log(`M1cm Zielwahl-Fährten: ${daten.wege.join(' | ')}; Zielspur ${daten.top}-${daten.bottom}px.`)
  } finally {
    await context.close()
    await browser.close()
  }
}

await main()
