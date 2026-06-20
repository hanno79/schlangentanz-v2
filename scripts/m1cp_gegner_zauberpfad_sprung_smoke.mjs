/*
Author: rahn
Datum: 20.06.2026
Version: 1.1
Beschreibung: M1cp Browser-Smoke fuer Zauberpfad-Sprungfaehrten zu gegnerischen Brettobjekten.
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
  await page.addInitScript(() => { Math.random = () => 0.2 })

  try {
    await page.goto(url('/game'), { waitUntil: 'networkidle' })
    await page.getByRole('region', { name: 'Spieltisch' }).waitFor()
    await page.getByRole('button', { name: /Startfährte .* als neue Schlange starten/ }).first().click()
    await page.getByRole('button', { name: 'Weiter zur Aufgabenprüfung' }).click()
    await page.getByRole('button', { name: 'Weiter zum Zugabschluss' }).click()
    await page.getByRole('button', { name: 'Zug an nächsten Spieler geben' }).click()
    await page.getByRole('button', { name: 'Gegnerzug am Brett abspielen' }).click()
    const ausspielphaseStarten = page.getByRole('button', { name: 'Ausspielphase starten' })
    if (await ausspielphaseStarten.count() > 0) await ausspielphaseStarten.click()

    await page.getByRole('button', { name: /farbendieb-01 Sonderkarte Farbendieb/i }).click()
    const zielspur = page.getByRole('note', { name: 'Waldtanz-Zielspur' })
    const sprung = zielspur.getByRole('button', { name: /Zum 1\. Beutekorb-Brettobjekt springen/ }).first()
    await sprung.waitFor({ timeout: 10_000 })
    await sprung.focus()
    await page.keyboard.press('Enter')
    await page.waitForFunction(() => document.querySelector('.farbendieb-beutekorb.waldtanz-zielspur-ziel--aktiv'))

    const proof = await page.evaluate(() => {
      const ziel = document.querySelector('.farbendieb-beutekorb.waldtanz-zielspur-ziel--aktiv')
      if (!(ziel instanceof HTMLElement)) throw new Error('M1cp Gegner-Zauberpfad: aktiver Beutekorb fehlt')
      const button = ziel.querySelector('button')
      const pfad = document.querySelector('.waldtanz-zielspur__zauberpfad--aktiv')
      return {
        text: ziel.textContent?.replace(/\s+/g, ' ').trim() ?? '',
        key: ziel.getAttribute('data-zielspur-key'),
        focused: button === document.activeElement,
        pfadAktiv: Boolean(pfad),
      }
    })

    if (proof.key !== 'dieb:spieler-2:schlange-spieler-2-1:gelb-15' || !proof.text.includes('Beutekorb') || !proof.focused || !proof.pfadAktiv) {
      throw new Error(`M1cp Gegner-Zauberpfad: Fokus/Highlight ungueltig (${JSON.stringify(proof)})`)
    }
    if (errors.length > 0) throw new Error(errors.join('\n'))
    console.log(`M1cp Gegner-Zauberpfad-Sprung: ${proof.key}, Fokus=${proof.focused}.`)
  } finally {
    await context.close()
    await browser.close()
  }
}

await main()
