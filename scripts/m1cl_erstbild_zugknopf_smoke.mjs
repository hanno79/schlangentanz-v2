/*
Author: rahn
Datum: 19.06.2026
Version: 1.0
Beschreibung: M1cl Browser-Smoke fuer den im Erstbild sichtbaren board-nahen Waldtanz-Zugknopf.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
function url(route) { return new URL(route, BASE_URL).toString() }

function metric(rect) {
  return {
    y: Math.round(rect.y),
    height: Math.round(rect.height),
    bottom: Math.round(rect.bottom),
  }
}

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
    await page.getByRole('button', { name: 'Weiter zur Aufgabenprüfung' }).waitFor()

    const daten = await page.evaluate(() => {
      const rect = (selector) => {
        const element = document.querySelector(selector)
        if (!(element instanceof HTMLElement)) throw new Error(`M1cl Erstbild-Zugknopf: ${selector} fehlt`)
        const box = element.getBoundingClientRect()
        return { y: box.y, height: box.height, bottom: box.bottom }
      }
      const button = document.querySelector('.waldtanz-arenazug__hauptknopf')
      if (!(button instanceof HTMLElement)) throw new Error('M1cl Erstbild-Zugknopf: Hauptknopf fehlt')
      const buttonBox = button.getBoundingClientRect()
      const hit = document.elementFromPoint(buttonBox.x + buttonBox.width / 2, buttonBox.y + buttonBox.height / 2)?.closest('button') === button
      return {
        spielbrett: rect('.spielbrett--waldtanz'),
        arena: rect('.waldtanz-arenastein'),
        hand: rect('.handkarten-panel'),
        zugleiste: rect('.waldtanz-zugseitenleiste'),
        arenazug: rect('.waldtanz-arenazug'),
        button: { y: buttonBox.y, height: buttonBox.height, bottom: buttonBox.bottom, hit },
      }
    })

    if (daten.arena.height < 520) {
      throw new Error(`M1cl Erstbild-Zugknopf: Waldstein zu niedrig (${JSON.stringify(metric(daten.arena))})`)
    }
    if (daten.hand.bottom > 900 || daten.zugleiste.bottom > 900) {
      throw new Error(`M1cl Erstbild-Zugknopf: Hand oder Unterholzleiste fallen aus dem Erstbild (${JSON.stringify({ hand: metric(daten.hand), zugleiste: metric(daten.zugleiste) })})`)
    }
    if (daten.arenazug.bottom > 900 || daten.button.bottom > 900 || !daten.button.hit) {
      throw new Error(`M1cl Erstbild-Zugknopf: Zugknopf nicht im Erstbild hit-testbar (${JSON.stringify({ arenazug: metric(daten.arenazug), button: { ...metric(daten.button), hit: daten.button.hit } })})`)
    }
    if (daten.spielbrett.bottom > 930) {
      throw new Error(`M1cl Erstbild-Zugknopf: Spielbrettkamera bleibt zu lang (${JSON.stringify(metric(daten.spielbrett))})`)
    }
    if (errors.length > 0) throw new Error(errors.join('\n'))
    console.log(`M1cl Erstbild-Zugknopf: Waldstein ${Math.round(daten.arena.height)}px, Zugknopf endet bei ${Math.round(daten.arenazug.bottom)}px und ist hit-testbar.`)
  } finally {
    await context.close()
    await browser.close()
  }
}

await main()
