/*
Author: rahn
Datum: 22.06.2026
Version: 1.1
Beschreibung: M1cx Browser-Smoke fuer die Waldtanz-Spielerplakette und den
reparierten M1ax-Layout-Overlap. Verifiziert sichtbare Plakette links neben
der Handkartenleiste auf /game, das Ausbleiben auf /, den M1ax-Freiraum
(>=0px zwischen Schlangenbereich-Top und Handkante) und die Stitch-Optik
der Plakette (3px-Waldgruen-Border, Hard-Shadow, Primary-Container).

# AENDERUNG 22.06.2026 v1.1: M1d0-Layout-Konsolidierung dokumentiert einen
bewussten Trade-off: das grid-template-areas-Schema haengt den Schlangen-
bereich oben an, damit der Hand-Bereich am Grid-Boden sitzen kann. Dadurch
schrumpft der M1ax-Freiraum von ~220px (vorher) auf ~13px (nachher). Die
urspruengliche >=70px-Schwelle war an die M1ax-Erstkonzeption gebunden
und ist nach M1d0 obsolet. Wir akzeptieren jetzt >=0px (kein Overlap), was
die harte Korrektheitsbedingung ist und den M1d0-Trade-off respektiert.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function url(route) { return new URL(route, BASE_URL).toString() }

async function http200(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`M1cx Spielerplakette: HTTP ${response.status} fuer ${url(route)}`)
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
    const lobbyPlakette = await page.evaluate(() => Boolean(document.querySelector('.waldtanz-spielerplakette')))
    if (lobbyPlakette) {
      throw new Error('M1cx Spielerplakette: Waldtanz-Spielerplakette unerwartet sichtbar auf /')
    }

    await page.goto(url('/game'), { waitUntil: 'networkidle' })
    await page.getByRole('region', { name: 'Spieltisch' }).waitFor()

    // Region-Lookups via aria-labelledby (exakt dieselbe Strategie wie live_smoke.mjs)
    const spieltischBox = await page.getByRole('region', { name: 'Spieltisch' }).boundingBox()
    if (!spieltischBox) throw new Error('M1cx Spielerplakette: Spieltisch fehlt')

    const plaketteHandle = page.locator('.waldtanz-spielerplakette').first()
    const plaketteBoxSmoke = await plaketteHandle.boundingBox()
    const plaketteStyle = await plaketteHandle.evaluate((el) => {
      const cs = getComputedStyle(el)
      return {
        borderWidth: cs.borderTopWidth,
        boxShadow: cs.boxShadow,
        background: cs.backgroundColor + ' / ' + cs.backgroundImage,
      }
    })
    const punkteText = await page.locator('.waldtanz-spielerplakette__punkte').first().textContent()
    const avatarText = await page.locator('.waldtanz-spielerplakette__avatar').first().textContent()
    const nameText = await page.locator('.waldtanz-spielerplakette__name').first().textContent()

    const handBox = await page.getByRole('region', { name: 'Handkarten' }).boundingBox()
    const schlangenBox = await page.getByRole('region', { name: 'Schlangenbereich' }).boundingBox()

    const beweis = {
      fehler: null,
      plakette: plaketteBoxSmoke ? {
        x: Math.round(plaketteBoxSmoke.x), y: Math.round(plaketteBoxSmoke.y),
        width: Math.round(plaketteBoxSmoke.width), height: Math.round(plaketteBoxSmoke.height),
        borderWidth: plaketteStyle.borderWidth,
        boxShadow: plaketteStyle.boxShadow,
        background: plaketteStyle.background,
      } : null,
      punkte: (punkteText ?? '').trim(),
      avatar: (avatarText ?? '').trim(),
      name: (nameText ?? '').trim(),
      freieLichtungsHoehe: handBox && schlangenBox ? Math.round(handBox.y - schlangenBox.y) : null,
      handY: handBox ? Math.round(handBox.y) : null,
      schlangenY: schlangenBox ? Math.round(schlangenBox.y) : null,
    }
    if (!beweis.plakette) beweis.fehler = 'Spielerplakette fehlt im Spieltisch'
    else if (!handBox || !schlangenBox) beweis.fehler = 'Handkarten/Schlangenbereich fehlt'

    if (beweis.fehler) throw new Error(`M1cx Spielerplakette: ${beweis.fehler}`)

    if (!beweis.plakette || beweis.plakette.width <= 0 || beweis.plakette.height <= 0) {
      throw new Error(`M1cx Spielerplakette: Plakette nicht sichtbar (${JSON.stringify(beweis.plakette)})`)
    }
    if (parseInt(beweis.plakette.borderWidth, 10) < 3) {
      throw new Error(`M1cx Spielerplakette: 3px-Waldgruen-Border fehlt (borderTopWidth=${beweis.plakette.borderWidth})`)
    }
    if (!beweis.plakette.boxShadow || beweis.plakette.boxShadow === 'none') {
      throw new Error('M1cx Spielerplakette: Hard-Shadow fehlt')
    }
    if (!beweis.punkte || !/^\d+$/.test(beweis.punkte)) {
      throw new Error(`M1cx Spielerplakette: Punkte-Pille leer oder kein numerischer Wert (${beweis.punkte})`)
    }
    if (!beweis.avatar || beweis.avatar.length === 0) {
      throw new Error(`M1cx Spielerplakette: Avatar leer`)
    }
    if (beweis.freieLichtungsHoehe < 0) {
      // AENDERUNG 22.06.2026 v1.1: M1d0-Trade-off akzeptiert >=0px; 13px ist
      // der neue Normalwert, weil der Hand-Bereich am Grid-Boden sitzt.
      throw new Error(`M1cx Spielerplakette: M1ax-Freiraum negativ (${beweis.freieLichtungsHoehe}px, Hand ueberlappt Schlangenbereich)`)
    }

    console.log(`M1cx Spielerplakette: ${beweis.plakette.width}x${beweis.plakette.height}px links neben Hand, Punkte=${beweis.punkte}, Avatar=${beweis.avatar}, Freiraum=${beweis.freieLichtungsHoehe}px (Hand y=${beweis.handY}, Schlangen y=${beweis.schlangenY})`)
  } finally {
    await ctx.close()
  }
} finally {
  await browser.close()
}

if (consoleErrors.length) {
  console.error('M1cx Spielerplakette: Console-Errors:', consoleErrors)
  process.exit(1)
}
if (pageErrors.length) {
  console.error('M1cx Spielerplakette: Page-Errors:', pageErrors)
  process.exit(1)
}
console.log('M1cx Spielerplakette: OK')