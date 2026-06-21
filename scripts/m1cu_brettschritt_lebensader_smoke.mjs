/*
Author: rahn
Datum: 21.06.2026
Version: 1.0
Beschreibung: M1cu Browser-Smoke fuer die Brettschritt-Lebensader auf dem
Waldtanz-Arenenstein. Verifiziert pro Stempel den Spieler-Farbstreifen und den
Phasen-Badge, den pulsierenden Aktiver-Tanz-Schritt-Pill und die Route-Scoping
des Pills auf /game. Lokal unter SMOKE_BASE_URL laufen lassen.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const viewports = [
  { width: 1100, height: 900, label: 'enge Desktopkante' },
  { width: 1280, height: 900, label: 'Standardbrett' },
]

function url(route) { return new URL(route, BASE_URL).toString() }

async function http200(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`M1cu Brettschritt-Lebensader: HTTP ${response.status} fuer ${url(route)}`)
}

await Promise.all(['/', '/game'].map(http200))

const browser = await chromium.launch()
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' })
    const page = await context.newPage()
    const consoleErrors = []
    const pageErrors = []
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
    page.on('pageerror', (err) => pageErrors.push(err.message))
    await page.addInitScript(() => { Math.random = () => 0.2 })

    try {
      await page.goto(url('/'), { waitUntil: 'networkidle' })
      const lobbyPill = await page.evaluate(() => Boolean(document.querySelector('[aria-label="Aktiver Tanz-Schritt"]')))
      if (lobbyPill) {
        throw new Error('M1cu Brettschritt-Lebensader: Aktiver-Tanz-Schritt-Pill auf / unerwartet sichtbar')
      }

      await page.goto(url('/game'), { waitUntil: 'networkidle' })
      await page.getByRole('region', { name: 'Spieltisch' }).waitFor()

      const beweis = await page.evaluate(() => {
        const boxData = (rect) => ({
          x: rect.x, y: rect.y, width: rect.width, height: rect.height,
          top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left,
        })
        const arenenstein = document.querySelector('.waldtanz-arenastein')
        if (!(arenenstein instanceof HTMLElement)) throw new Error('M1cu Brettschritt-Lebensader: Waldtanz-Arenenstein fehlt')
        const pill = arenenstein.querySelector('.waldtanz-aktiver-tanz-schritt')
        const stempelReihe = arenenstein.querySelector('.brettschritt-stempel-reihe')
        const stempel = arenenstein.querySelectorAll('.brettschritt-stempel')
        const aktuell = arenenstein.querySelector('.brettschritt-stempel--aktuell')
        const phaseBadges = arenenstein.querySelectorAll('.brettschritt-stempel__phase')
        const pillPhase = pill?.querySelector('.waldtanz-aktiver-tanz-schritt__phase')?.textContent?.trim() ?? null
        const pillText = pill?.querySelector('.waldtanz-aktiver-tanz-schritt__text')?.textContent?.trim() ?? null
        const pillPflicht = pill?.querySelector('.waldtanz-aktiver-tanz-schritt__pflicht')?.textContent?.trim() ?? null
        return {
          arenensteinBox: boxData(arenenstein.getBoundingClientRect()),
          hatPill: pill instanceof HTMLElement,
          pillBox: pill instanceof HTMLElement ? boxData(pill.getBoundingClientRect()) : null,
          pillKlassen: pill instanceof HTMLElement ? pill.className : '',
          pillPhase,
          pillText,
          pillPflicht,
          hatStempelReihe: stempelReihe instanceof HTMLElement,
          stempelAnzahl: stempel.length,
          stempelKlassen: Array.from(stempel).map((s) => s.className),
          phaseBadgeAnzahl: phaseBadges.length,
          phaseBadgeTexte: Array.from(phaseBadges).map((b) => b.textContent?.trim() ?? ''),
          hatAktuell: aktuell instanceof HTMLElement,
        }
      })

      if (!beweis.hatPill) {
        throw new Error('M1cu Brettschritt-Lebensader: Aktiver-Tanz-Schritt-Pill fehlt auf /game')
      }
      if (!beweis.pillText) {
        throw new Error(`M1cu Brettschritt-Lebensader: Aktiver-Tanz-Schritt-Pill ohne Text (${JSON.stringify(beweis)})`)
      }
      if (!beweis.pillPhase) {
        throw new Error('M1cu Brettschritt-Lebensader: Aktiver-Tanz-Schritt-Pill ohne Phasen-Badge')
      }
      if (!/waldtanz-aktiver-tanz-schritt--spieler-\d/.test(beweis.pillKlassen)) {
        throw new Error(`M1cu Brettschritt-Lebensader: Aktiver-Tanz-Schritt-Pill ohne Spieler-Farbstreifen (${beweis.pillKlassen})`)
      }
      if (beweis.pillBox && beweis.pillBox.bottom > viewport.height) {
        throw new Error(`M1cu Brettschritt-Lebensader: Aktiver-Tanz-Schritt-Pill ragt aus dem Viewport (bottom=${beweis.pillBox.bottom}, vh=${viewport.height})`)
      }

      if (beweis.stempelAnzahl > 0) {
        const spielerKlassenOK = beweis.stempelKlassen.every((k) => /brettschritt-stempel--spieler-\d/.test(k))
        if (!spielerKlassenOK) {
          throw new Error(`M1cu Brettschritt-Lebensader: Stempel ohne Spieler-Farbstreifen (${beweis.stempelKlassen.join(' | ')})`)
        }
        if (beweis.phaseBadgeAnzahl !== beweis.stempelAnzahl) {
          throw new Error(`M1cu Brettschritt-Lebensader: Phasen-Badge-Anzahl (${beweis.phaseBadgeAnzahl}) ungleich Stempel-Anzahl (${beweis.stempelAnzahl})`)
        }
        if (beweis.phaseBadgeTexte.some((t) => !t)) {
          throw new Error(`M1cu Brettschritt-Lebensader: leerer Phasen-Badge-Text (${JSON.stringify(beweis.phaseBadgeTexte)})`)
        }
        if (!beweis.hatAktuell) {
          throw new Error('M1cu Brettschritt-Lebensader: kein aktueller Brettschritt-Stempel markiert')
        }
      }

      if (consoleErrors.length || pageErrors.length) {
        throw new Error(`M1cu Brettschritt-Lebensader: Browserfehler ${JSON.stringify({ consoleErrors, pageErrors })}`)
      }
      console.log(`M1cu Brettschritt-Lebensader ${viewport.width}px: Pill "${beweis.pillText}", ${beweis.stempelAnzahl} Stempel, Phase-Badges: ${beweis.phaseBadgeTexte.join('|') || '—'}.`)
    } finally {
      await context.close()
    }
  }
} finally {
  await browser.close()
}