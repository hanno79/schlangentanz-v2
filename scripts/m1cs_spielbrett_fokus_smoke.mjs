/*
Author: rahn
Datum: 21.06.2026
Version: 1.0
Beschreibung: M1cs Browser-Smoke fuer den Brettfokus auf /game: Rangtafel sichtbar,
Punktetafel-Liste, Material und Spieleruebersicht ausgeblendet.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function url(route) { return new URL(route, BASE_URL).toString() }

async function http200(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`M1cs Spielbrett-Fokus: HTTP ${response.status} fuer ${url(route)}`)
}

await Promise.all(['/', '/game'].map(http200))

const browser = await chromium.launch()
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const consoleErrors = []
  const pageErrors = []
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  page.on('pageerror', (err) => pageErrors.push(err.message))
  await page.addInitScript(() => { Math.random = () => 0.2 })

  try {
    // 1) /game: Rangtafel sichtbar, Punktetafel + Material + Spieleruebersicht ausgeblendet
    await page.goto(url('/game'), { waitUntil: 'networkidle' })
    await page.getByRole('region', { name: 'Spieltisch' }).waitFor()

    const gameBeweis = await page.evaluate(() => {
      const box = (rect) => ({ x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) })
      const wertung = document.querySelector('.wertung-panel--brettfokus')
      if (!(wertung instanceof HTMLElement)) throw new Error('M1cs Spielbrett-Fokus: Wertung-Panel mit brettfokus-Klasse fehlt')
      const rangTafel = wertung.querySelector('.waldtanz-rangtafel')
      if (!rangTafel) throw new Error('M1cs Spielbrett-Fokus: Waldtanz-Rangtafel fehlt im Wertung-Panel')
      const rangKarten = Array.from(wertung.querySelectorAll('.waldtanz-rangtafel__karte'))
      const punktetafelHeading = Array.from(wertung.querySelectorAll('h3')).find(h => h.textContent === 'Punktetafel')
      const material = document.querySelector('.material-aufgaben-panel--brettfokus')
      const spieleruebersicht = document.querySelector('.spieleruebersicht-panel--brettfokus')
      const wertungRect = wertung.getBoundingClientRect()
      return {
        rangTafelSichtbar: rangTafel instanceof HTMLElement && wertung.contains(rangTafel),
        rangKartenAnzahl: rangKarten.length,
        punktetafelUnsichtbar: !punktetafelHeading,
        materialUnsichtbar: material === null || getComputedStyle(material).display === 'none',
        spieleruebersichtUnsichtbar: spieleruebersicht === null || getComputedStyle(spieleruebersicht).display === 'none',
        wertung: box(wertungRect),
      }
    })

    if (!gameBeweis.rangTafelSichtbar) throw new Error(`M1cs Spielbrett-Fokus: Rangtafel nicht im Wertung-Panel (${JSON.stringify(gameBeweis)})`)
    if (gameBeweis.rangKartenAnzahl < 2) throw new Error(`M1cs Spielbrett-Fokus: zu wenige Rangtafel-Karten (${JSON.stringify(gameBeweis)})`)
    if (!gameBeweis.punktetafelUnsichtbar) throw new Error(`M1cs Spielbrett-Fokus: Punktetafel-Liste sichtbar (${JSON.stringify(gameBeweis)})`)
    if (!gameBeweis.materialUnsichtbar) throw new Error(`M1cs Spielbrett-Fokus: Material-Panel sichtbar (${JSON.stringify(gameBeweis)})`)
    if (!gameBeweis.spieleruebersichtUnsichtbar) throw new Error(`M1cs Spielbrett-Fokus: Spieleruebersicht-Panel sichtbar (${JSON.stringify(gameBeweis)})`)

    // 2) /: alle drei Panels voll sichtbar (mit Punktetafel)
    await page.goto(url('/'), { waitUntil: 'networkidle' })
    await page.getByRole('region', { name: 'Spieltisch' }).waitFor()

    const lobbyBeweis = await page.evaluate(() => {
      const wertung = document.querySelector('.info-panel--wertung')
      const material = document.querySelector('.info-panel--material')
      const spieleruebersicht = document.querySelector('.info-panel--spieleruebersicht')
      const punktetafelHeading = wertung ? Array.from(wertung.querySelectorAll('h3')).find(h => h.textContent === 'Punktetafel') : null
      return {
        hatWertung: wertung !== null,
        hatMaterial: material !== null,
        hatSpieleruebersicht: spieleruebersicht !== null,
        hatPunktetafel: punktetafelHeading !== null,
      }
    })
    if (!lobbyBeweis.hatWertung || !lobbyBeweis.hatMaterial || !lobbyBeweis.hatSpieleruebersicht || !lobbyBeweis.hatPunktetafel) {
      throw new Error(`M1cs Spielbrett-Fokus: Lobby-Panels fehlen (${JSON.stringify(lobbyBeweis)})`)
    }

    if (consoleErrors.length > 0) throw new Error(`M1cs Spielbrett-Fokus: Console-Fehler: ${consoleErrors.join(' | ')}`)
    if (pageErrors.length > 0) throw new Error(`M1cs Spielbrett-Fokus: Page-Fehler: ${pageErrors.join(' | ')}`)

    console.log(`M1cs Spielbrett-Fokus: Wertung ${gameBeweis.wertung.width}x${gameBeweis.wertung.height}px, ${gameBeweis.rangKartenAnzahl} Rangtafel-Karten, Punktetafel/Material/Spieleruebersicht auf /game ausgeblendet.`)
  } finally {
    await context.close()
  }
} finally {
  await browser.close()
}
