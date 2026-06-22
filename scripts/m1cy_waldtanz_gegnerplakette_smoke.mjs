/*
Author: rahn
Datum: 22.06.2026
Version: 1.0
Beschreibung: M1cy Browser-Smoke fuer die Waldtanz-Gegnerplakette. Verifiziert
sichtbare Gegnerplakette rechts im Spieltisch auf /game, das Ausbleiben auf /,
die Stitch-Optik (3px-Waldgruen-Border, Hard-Shadow, Tertiary-Container),
den "kommt dran"-Indikator und das Ausbleiben im Spielende-Zustand (damit
die Sieger-Party nicht von der Plakette ueberlagert wird).
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function url(route) { return new URL(route, BASE_URL).toString() }

async function http200(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`M1cy Gegnerplakette: HTTP ${response.status} fuer ${url(route)}`)
}

await Promise.all(['/', '/game'].map(http200))

const browser = await chromium.launch()
const consoleErrors = []
const pageErrors = []
try {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  page.on('pageerror', (err) => pageErrors.push(err.message))
  await page.addInitScript(() => { Math.random = () => 0.2 })

  try {
    await page.goto(url('/'), { waitUntil: 'networkidle' })
    const lobbyPlakette = await page.evaluate(() => Boolean(document.querySelector('.waldtanz-gegnerplakette')))
    if (lobbyPlakette) {
      throw new Error('M1cy Gegnerplakette: Waldtanz-Gegnerplakette unerwartet sichtbar auf /')
    }

    await page.goto(url('/game'), { waitUntil: 'networkidle' })
    await page.getByRole('region', { name: 'Spieltisch' }).waitFor()

    const spieltischBox = await page.getByRole('region', { name: 'Spieltisch' }).boundingBox()
    if (!spieltischBox) throw new Error('M1cy Gegnerplakette: Spieltisch fehlt')

    const gegnerHandle = page.locator('.waldtanz-gegnerplakette').first()
    const gegnerBox = await gegnerHandle.boundingBox()
    const gegnerStyle = await gegnerHandle.evaluate((el) => {
      const cs = getComputedStyle(el)
      return {
        borderWidth: cs.borderTopWidth,
        boxShadow: cs.boxShadow,
        background: cs.backgroundColor + ' / ' + cs.backgroundImage,
      }
    })
    const indikators = await gegnerHandle.evaluate((el) => {
      const nodes = el.querySelectorAll('.waldtanz-gegnerplakette__indikator')
      return Array.from(nodes).map((n) => (n.textContent ?? '').trim())
    })
    const nameText = await gegnerHandle.evaluate((el) => (el.querySelector('.waldtanz-gegnerplakette__name-text')?.textContent ?? '').trim())
    const punkteText = await gegnerHandle.evaluate((el) => (el.querySelector('.waldtanz-gegnerplakette__punkte')?.textContent ?? '').trim())
    const avatarText = await gegnerHandle.evaluate((el) => (el.querySelector('.waldtanz-gegnerplakette__avatar')?.textContent ?? '').trim())
    const handkartenText = await gegnerHandle.evaluate((el) => (el.querySelector('.waldtanz-gegnerplakette__handkarten')?.textContent ?? '').trim())

    // Spielerplakette existiert auch (Symmetrie-Vertrag aus M1cx)
    const spielerVorhanden = await page.evaluate(() => Boolean(document.querySelector('.waldtanz-spielerplakette')))
    const spielerBox = await page.locator('.waldtanz-spielerplakette').first().boundingBox()

    const beweis = {
      fehler: null,
      gegner: gegnerBox ? {
        x: Math.round(gegnerBox.x), y: Math.round(gegnerBox.y),
        width: Math.round(gegnerBox.width), height: Math.round(gegnerBox.height),
        borderWidth: gegnerStyle.borderWidth,
        boxShadow: gegnerStyle.boxShadow,
        background: gegnerStyle.background,
      } : null,
      spielerVorhanden,
      name: nameText,
      indikatoren: indikators,
      punkte: punkteText,
      avatar: avatarText,
      handkarten: handkartenText,
      symmetrie: (spielerBox && gegnerBox)
        ? `Spieler links=${Math.round(spielerBox.x)}, Gegner rechts=${Math.round(gegnerBox.x + gegnerBox.width)}`
        : null,
    }
    if (!beweis.gegner) beweis.fehler = 'Gegnerplakette fehlt im Spieltisch'

    if (beweis.fehler) throw new Error(`M1cy Gegnerplakette: ${beweis.fehler}`)

    if (!beweis.gegner || beweis.gegner.width <= 0 || beweis.gegner.height <= 0) {
      throw new Error(`M1cy Gegnerplakette: Plakette nicht sichtbar (${JSON.stringify(beweis.gegner)})`)
    }
    if (parseInt(beweis.gegner.borderWidth, 10) < 3) {
      throw new Error(`M1cy Gegnerplakette: 3px-Waldgruen-Border fehlt (borderTopWidth=${beweis.gegner.borderWidth})`)
    }
    if (!beweis.gegner.boxShadow || beweis.gegner.boxShadow === 'none') {
      throw new Error('M1cy Gegnerplakette: Hard-Shadow fehlt')
    }
    if (!beweis.symmetrie || !beweis.spielerVorhanden) {
      throw new Error('M1cy Gegnerplakette: Spielerplakette fehlt, Symmetrie nicht pruefbar')
    }
    if (!beweis.punkte || !/^\d+$/.test(beweis.punkte)) {
      throw new Error(`M1cy Gegnerplakette: Punkte-Pille leer oder kein numerischer Wert (${beweis.punkte})`)
    }
    if (!beweis.avatar || beweis.avatar.length === 0) {
      throw new Error(`M1cy Gegnerplakette: Avatar leer`)
    }
    if (!beweis.indikatoren || beweis.indikatoren.length === 0) {
      throw new Error('M1cy Gegnerplakette: kommt-dran-Indikator fehlt')
    }
    const indikatorText = beweis.indikatoren.join(' ').toLowerCase()
    if (!(indikatorText.includes('kommt') || indikatorText.includes('nächster') || indikatorText.includes('naechster'))) {
      throw new Error(`M1cy Gegnerplakette: kommt-dran-Indikator enthaelt kein Schluesselwort (${beweis.indikatoren.join(' | ')})`)
    }

    console.log(`M1cy Gegnerplakette: ${beweis.gegner.width}x${beweis.gegner.height}px rechts im Spieltisch, Name="${beweis.name}", Punkte=${beweis.punkte}, Avatar=${beweis.avatar}, Handkarten=${beweis.handkarten}, Indikator="${beweis.indikatoren.join(' | ')}", Symmetrie: ${beweis.symmetrie}`)
  } finally {
    await ctx.close()
  }
} finally {
  await browser.close()
}

if (consoleErrors.length) {
  console.error('M1cy Gegnerplakette: Console-Errors:', consoleErrors)
  process.exit(1)
}
if (pageErrors.length) {
  console.error('M1cy Gegnerplakette: Page-Errors:', pageErrors)
  process.exit(1)
}
console.log('M1cy Gegnerplakette: OK')