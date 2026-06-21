/*
Author: rahn
Datum: 21.06.2026
Version: 1.0
Beschreibung: M1cr Browser-Smoke fuer die Brettschritt-Stempel-Struktur am Waldtanz-Arenenstein.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const viewports = [
  { width: 1100, height: 900, label: 'enge Desktopkante' },
  { width: 1280, height: 900, label: 'Standardbrett' },
]

function url(route) { return new URL(route, BASE_URL).toString() }
function metric(rect) {
  return {
    x: Math.round(rect?.x ?? 0), y: Math.round(rect?.y ?? 0),
    width: Math.round(rect?.width ?? 0), height: Math.round(rect?.height ?? 0),
    right: Math.round(rect?.right ?? 0), bottom: Math.round(rect?.bottom ?? 0),
  }
}

async function http200(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`M1cr Brettschritt-Stempel: HTTP ${response.status} fuer ${url(route)}`)
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
      const lobbyProof = await page.evaluate(() => {
        return { hatStempelListe: Boolean(document.querySelector('.brettschritt-stempel-reihe')) }
      })
      if (lobbyProof.hatStempelListe) {
        throw new Error(`M1cr Brettschritt-Stempel: Stempel-Reihe auf / unerwartet sichtbar (${JSON.stringify(lobbyProof)})`)
      }

      await page.goto(url('/game'), { waitUntil: 'networkidle' })
      await page.getByRole('region', { name: 'Spieltisch' }).waitFor()

      const leererBeweis = await page.evaluate(() => {
        const boxData = (rect) => ({ x: rect.x, y: rect.y, width: rect.width, height: rect.height, top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left })
        const arenenstein = document.querySelector('.waldtanz-arenastein')
        if (!(arenenstein instanceof HTMLElement)) throw new Error('M1cr Brettschritt-Stempel: Waldtanz-Arenenstein fehlt')
        const stempelContainer = arenenstein.querySelector('.waldtanz-arenastein__stempel')
        const stempelReihe = arenenstein.querySelector('.brettschritt-stempel-reihe')
        const stempel = arenenstein.querySelectorAll('.brettschritt-stempel')
        const aktuell = arenenstein.querySelector('.brettschritt-stempel--aktuell')
        const vergangen = arenenstein.querySelectorAll('.brettschritt-stempel--vergangen')
        return {
          arenensteinBox: boxData(arenenstein.getBoundingClientRect()),
          hatStempelContainer: stempelContainer instanceof HTMLElement,
          stempelContainerBox: stempelContainer instanceof HTMLElement ? boxData(stempelContainer.getBoundingClientRect()) : null,
          hatStempelReihe: stempelReihe instanceof HTMLElement,
          stempelReiheBox: stempelReihe instanceof HTMLElement ? boxData(stempelReihe.getBoundingClientRect()) : null,
          stempelAnzahl: stempel.length,
          hatAktuell: aktuell instanceof HTMLElement,
          vergangenAnzahl: vergangen.length,
          reihenGrid: stempelReihe instanceof HTMLElement ? getComputedStyle(stempelReihe).gridTemplateColumns : null,
        }
      })

      if (leererBeweis.stempelAnzahl === 0 && !leererBeweis.hatStempelContainer && !leererBeweis.hatStempelReihe) {
        // Leerlaufzustand: kein Container, keine Liste -> das ist OK, der Brettschritt erscheint erst nach Discard/Abwurf
      } else if (leererBeweis.stempelAnzahl > 0) {
        if (!leererBeweis.hatStempelReihe) {
          throw new Error('M1cr Brettschritt-Stempel: Stempel gerendert ohne Liste')
        }
        if (!leererBeweis.hatAktuell) {
          throw new Error('M1cr Brettschritt-Stempel: kein aktueller Brettschritt-Stempel hervorgehoben')
        }
        if (leererBeweis.vergangenAnzahl >= leererBeweis.stempelAnzahl) {
          throw new Error(`M1cr Brettschritt-Stempel: zu viele vergangene Stempel (${leererBeweis.vergangenAnzahl} von ${leererBeweis.stempelAnzahl})`)
        }
        if (leererBeweis.stempelAnzahl > 3) {
          throw new Error(`M1cr Brettschritt-Stempel: zu viele Stempel gerendert (${leererBeweis.stempelAnzahl})`)
        }
      }

      const stempelContainerBox = leererBeweis.stempelContainerBox
      if (stempelContainerBox && stempelContainerBox.bottom > viewport.height) {
        throw new Error(`M1cr Brettschritt-Stempel: Stempel-Container ragt aus dem Viewport (${JSON.stringify(metric(stempelContainerBox))})`)
      }

      const reihenGrid = leererBeweis.reihenGrid ?? ''
      if (leererBeweis.hatStempelReihe && !reihenGrid.split(' ').some((teil) => teil.includes('px'))) {
        throw new Error(`M1cr Brettschritt-Stempel: Stempel-Reihe hat keine 3px-basierten Spalten (${reihenGrid})`)
      }

      if (consoleErrors.length || pageErrors.length) {
        throw new Error(`M1cr Brettschritt-Stempel: Browserfehler ${JSON.stringify({ consoleErrors, pageErrors })}`)
      }
      console.log(`M1cr Brettschritt-Stempel ${viewport.width}px: Arenenstein ${Math.round(leererBeweis.arenensteinBox.width)}x${Math.round(leererBeweis.arenensteinBox.height)}px, ${leererBeweis.stempelAnzahl} Stempel im Live-Zustand.`)
    } finally {
      await context.close()
    }
  }
} finally {
  await browser.close()
}
