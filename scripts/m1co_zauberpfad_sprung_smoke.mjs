/*
Author: rahn
Datum: 20.06.2026
Version: 1.0
Beschreibung: M1co Browser-Smoke fuer Zauberpfad-Sprungfaehrten zum echten Brettobjekt.
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
  await page.addInitScript(() => { Math.random = () => 0.034 })

  try {
    await page.goto(url('/game'), { waitUntil: 'networkidle' })
    await page.getByRole('region', { name: 'Spieltisch' }).waitFor()
    await page.getByRole('button', { name: 'Startfährte blau-06 als neue Schlange starten' }).click()
    await page.getByRole('button', { name: /schlangenfrass-03 Sonderkarte Schlangenfrass/i }).click()

    const zielspur = page.getByRole('note', { name: 'Waldtanz-Zielspur' })
    const sprung = zielspur.getByRole('button', { name: 'Zum 1. Bissspur-Brettobjekt springen' })
    await sprung.click()

    const daten = await page.evaluate(() => {
      const ziel = document.querySelector('.schlangenfrass-bissspur.waldtanz-zielspur-ziel--aktiv')
      if (!(ziel instanceof HTMLElement)) throw new Error('M1co Zauberpfad-Sprung: aktive Bissspur fehlt')
      const box = ziel.getBoundingClientRect()
      const button = ziel.querySelector('button')
      const pfad = document.querySelector('.waldtanz-zielspur__zauberpfad--aktiv')
      const style = getComputedStyle(ziel)
      const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.closest('.schlangenfrass-bissspur') === ziel
      return {
        text: ziel.textContent?.replace(/\s+/g, ' ').trim() ?? '',
        key: ziel.getAttribute('data-zielspur-key'),
        focused: button === document.activeElement,
        pfadAktiv: Boolean(pfad),
        outline: style.outlineWidth,
        hit,
      }
    })

    if (!daten.text.includes('Schlangenfrass-Bissspur') || !daten.text.includes('blau-06')) {
      throw new Error(`M1co Zauberpfad-Sprung: falsches Ziel (${JSON.stringify(daten)})`)
    }
    if (!daten.key?.includes('frass:spieler-1') || !daten.focused || !daten.pfadAktiv || !daten.hit) {
      throw new Error(`M1co Zauberpfad-Sprung: Fokus/Highlight ungueltig (${JSON.stringify(daten)})`)
    }
    if (errors.length > 0) throw new Error(errors.join('\n'))
    console.log(`M1co Zauberpfad-Sprung: ${daten.key}, Fokus=${daten.focused}, Outline=${daten.outline}.`)
  } finally {
    await context.close()
    await browser.close()
  }
}

await main()
