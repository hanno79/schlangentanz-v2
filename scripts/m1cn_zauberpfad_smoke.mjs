/*
Author: rahn
Datum: 20.06.2026
Version: 1.0
Beschreibung: M1cn Browser-Smoke fuer konkrete Zauberpfade in der Waldtanz-Zielspur.
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
    await zielspur.getByRole('list', { name: 'Konkrete Zauberpfade' }).waitFor()
    await zielspur.scrollIntoViewIfNeeded()

    const daten = await page.evaluate(() => {
      const zielspur = document.querySelector('.waldtanz-zielspur--zielwahl-faehrten')
      if (!(zielspur instanceof HTMLElement)) throw new Error('M1cn Zauberpfad: Zielspur fehlt')
      const pfade = Array.from(zielspur.querySelectorAll('.waldtanz-zielspur__zauberpfad')).map((pfad) => pfad.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      const pfadListe = zielspur.querySelector('.waldtanz-zielspur__zauberpfade')
      const ersterPfad = zielspur.querySelector('.waldtanz-zielspur__zauberpfad')
      const bissspur = document.querySelector('.schlangenfrass-bissspur')
      const style = pfadListe instanceof HTMLElement ? getComputedStyle(pfadListe) : null
      const box = ersterPfad instanceof HTMLElement ? ersterPfad.getBoundingClientRect() : null
      const hit = ersterPfad instanceof HTMLElement && box ? document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.closest('.waldtanz-zielspur__zauberpfad') === ersterPfad : false
      return { pfade, display: style?.display ?? '', columns: style?.gridTemplateColumns ?? '', hasBissspur: Boolean(bissspur), hit }
    })

    if (!daten.pfade.some(text => text.includes('Bissspur') && text.includes('Karte lösen'))) {
      throw new Error(`M1cn Zauberpfad: Bissspur-Zauberpfad fehlt (${JSON.stringify(daten)})`)
    }
    if (!daten.hasBissspur) throw new Error(`M1cn Zauberpfad: echtes Bissspur-Brettobjekt fehlt (${JSON.stringify(daten)})`)
    if (daten.display !== 'grid' || !daten.columns || !daten.hit) {
      throw new Error(`M1cn Zauberpfad: computed Layout/Hit-Test ungültig (${JSON.stringify(daten)})`)
    }
    if (errors.length > 0) throw new Error(errors.join('\n'))
    console.log(`M1cn Zauberpfad: ${daten.pfade.join(' | ')}.`)
  } finally {
    await context.close()
    await browser.close()
  }
}

await main()
