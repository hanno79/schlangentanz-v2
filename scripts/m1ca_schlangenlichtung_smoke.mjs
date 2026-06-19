/*
Author: rahn
Datum: 19.06.2026
Version: 1.0
Beschreibung: M1ca Browser-Smoke fuer die zentrale Schlangenlichtung und demotete leere Gegnerlisten auf /game.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const url = (route) => new URL(route, BASE_URL).toString()
const metric = (rect) => ({ x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height), right: Math.round(rect.right), bottom: Math.round(rect.bottom) })

async function http200(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`HTTP ${response.status} fuer ${url(route)}`)
  console.log(`HTTP 200  ${url(route)}`)
}

await Promise.all(['/', '/game'].map(http200))
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
const page = await context.newPage()
const consoleErrors = []
const pageErrors = []
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
page.on('pageerror', (err) => pageErrors.push(err.message))
await page.addInitScript(() => { Math.random = () => 0.999999 })

try {
  await page.goto(url('/game'), { waitUntil: 'networkidle' })
  await page.getByRole('region', { name: 'Spieltisch' }).waitFor()
  await page.locator('.schlangen-startzone').click()
  await page.locator('.schlangekarte--eigene').first().waitFor()

  const daten = await page.evaluate(() => {
    const element = (selector) => {
      const gefunden = document.querySelector(selector)
      if (!(gefunden instanceof HTMLElement)) throw new Error(`M1ca Schlangenlichtung: ${selector} fehlt`)
      return gefunden
    }
    const lichtung = element('.schlangen-gruppe--eigene-lichtung')
    const startzone = element('.schlangen-startzone')
    const eigeneSchlange = element('.schlangekarte--eigene')
    const gegner = element('.schlangen-gruppe--gegnerfelder')
    const handkarte = element('.handkartenleiste--spielkartenfaecher .handkarte__button--karte')
    const lichtungStyle = getComputedStyle(lichtung)
    const gegnerStyle = getComputedStyle(gegner)
    const snakeBox = eigeneSchlange.getBoundingClientRect()
    const snakeProben = [0.25, 0.38, 0.5].map((anteil) => {
      const x = snakeBox.left + snakeBox.width / 2
      const y = snakeBox.top + snakeBox.height * anteil
      return Boolean(document.elementFromPoint(x, y)?.closest('.schlangekarte--eigene'))
    })
    const startBox = startzone.getBoundingClientRect()
    const handBox = handkarte.getBoundingClientRect()
    return {
      lichtung: lichtung.getBoundingClientRect().toJSON(),
      startzone: startBox.toJSON(),
      eigeneSchlange: { ...snakeBox.toJSON(), hit: snakeProben.some(Boolean), probeHits: snakeProben },
      handkarte: handBox.toJSON(),
      display: lichtungStyle.display,
      gridTemplateColumns: lichtungStyle.gridTemplateColumns,
      borderWidth: lichtungStyle.borderTopWidth,
      boxShadow: lichtungStyle.boxShadow,
      gegnerDisplay: gegnerStyle.display,
    }
  })

  if (daten.display !== 'grid' || Number.parseFloat(daten.borderWidth) < 3 || daten.boxShadow === 'none') {
    throw new Error(`M1ca Schlangenlichtung: eigene Lichtung ist keine koerperliche Brettspur (${JSON.stringify({ display: daten.display, border: daten.borderWidth, shadow: daten.boxShadow })})`)
  }
  if (daten.gegnerDisplay !== 'none') {
    throw new Error(`M1ca Schlangenlichtung: leere Gegnerliste ist weiter sichtbar (${JSON.stringify({ gegnerDisplay: daten.gegnerDisplay })})`)
  }
  if (daten.startzone.width < 90 || daten.startzone.height < 70) {
    throw new Error(`M1ca Schlangenlichtung: Startkreis verliert Brettflaeche (${JSON.stringify(metric(daten.startzone))})`)
  }
  if (daten.eigeneSchlange.width < 180 || !daten.eigeneSchlange.hit) {
    throw new Error(`M1ca Schlangenlichtung: erste eigene Schlange ist nicht als zentrale Reihe hit-testbar (${JSON.stringify({ startzone: metric(daten.startzone), schlange: metric(daten.eigeneSchlange) })})`)
  }
  if (daten.eigeneSchlange.bottom > daten.handkarte.y - 4) {
    throw new Error(`M1ca Schlangenlichtung: Schlangenreihe wird von der Handbank ueberdeckt (${JSON.stringify({ schlange: metric(daten.eigeneSchlange), hand: metric(daten.handkarte) })})`)
  }
  if (consoleErrors.length || pageErrors.length) throw new Error(`M1ca Schlangenlichtung: Browserfehler ${JSON.stringify({ consoleErrors, pageErrors })}`)
  console.log(`M1ca Schlangenlichtung: Lichtung ${Math.round(daten.lichtung.width)}x${Math.round(daten.lichtung.height)}px, Startkreis ${Math.round(daten.startzone.width)}x${Math.round(daten.startzone.height)}px, erste Schlange hit-testbar, leere Gegnerliste verborgen.`)
} finally {
  await context.close()
  await browser.close()
}
