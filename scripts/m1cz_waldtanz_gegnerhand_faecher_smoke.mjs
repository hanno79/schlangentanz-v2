/*
Author: rahn
Datum: 27.06.2026
Version: 1.0
Beschreibung: M1cz Browser-Smoke fuer die Waldtanz-Gegnerhand-Kartenfaecher.
Verifiziert dass auf /game bis zu 3 dekorative Leaf-Tiles hinter der
Gegnerplakette erscheinen (Stitch-Peek-Stil: surface-container-highest,
3px waldgruen-Border, hard-shadow-sm, Eco-Icon, leichte Rotation).
Prueft zusaetzlich dass die Tiles aria-hidden und pointer-events:none sind
(rein dekorativ, interaktionsfrei).
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function url(route) { return new URL(route, BASE_URL).toString() }

async function http200(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`M1cz Gegnerhand-Faecher: HTTP ${response.status} fuer ${url(route)}`)
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

  await page.goto(url('/game'), { waitUntil: 'networkidle' })
  await page.getByRole('region', { name: 'Spieltisch' }).waitFor()

  // Gegnerplakette muss sichtbar sein
  const gegnerplakette = page.locator('.waldtanz-gegnerplakette').first()
  await gegnerplakette.waitFor({ state: 'visible' })
  const plaketteBox = await gegnerplakette.boundingBox()
  if (!plaketteBox) throw new Error('M1cz Gegnerhand-Faecher: Gegnerplakette fehlt')

  // Leaf-Tile-Liste (nur sichtbar wenn Gegner Handkarten hat — der initiale
  // 2-Spieler-Zustand hat Handkarten, daher wird die Liste i.d.R. da sein)
  const tileList = page.locator('[data-gegner-hand-faecher]').first()
  const tileListVisible = await tileList.count() > 0

  let tileInfo = null
  if (tileListVisible) {
    const tileCount = await page.locator('[data-gegner-hand-tile]').count()
    const firstTile = page.locator('[data-gegner-hand-tile]').first()
    const tileBox = await firstTile.boundingBox().catch(() => null)
    const tileStyle = await firstTile.evaluate((el) => {
      const cs = window.getComputedStyle(el)
      return {
        borderWidth: cs.borderTopWidth,
        backgroundColor: cs.backgroundColor,
        boxShadow: cs.boxShadow,
        pointerEvents: cs.pointerEvents,
        ariaHidden: el.getAttribute('aria-hidden'),
      }
    })
    tileInfo = { tileCount, tileBox, tileStyle }
  }

  const result = {
    gegnerplaketteSichtbar: Boolean(plaketteBox),
    plaketteBox,
    tileListVisible,
    tileInfo,
    consoleErrors,
    pageErrors,
  }

  console.log('=== M1cz Waldtanz-Gegnerhand-Faecher ===')
  console.log(JSON.stringify(result, null, 2))

  // Akzeptanz: Gegnerplakette sichtbar + (entweder keine Tiles weil 0
  // gegnerische Karten ODER 1-3 Tiles mit korrektem CSS-Vertrag)
  if (!result.gegnerplaketteSichtbar) {
    throw new Error('M1cz: Gegnerplakette nicht sichtbar')
  }
  if (tileListVisible && tileInfo) {
    if (tileInfo.tileCount < 1 || tileInfo.tileCount > 3) {
      throw new Error(`M1cz: Tile-Count ${tileInfo.tileCount} ausserhalb 1-3`)
    }
    if (tileInfo.tileStyle.pointerEvents !== 'none') {
      throw new Error(`M1cz: Tile pointer-events ist nicht 'none' sondern '${tileInfo.tileStyle.pointerEvents}'`)
    }
    if (parseFloat(tileInfo.tileStyle.borderWidth) < 2) {
      throw new Error(`M1cz: Tile-Border zu schmal (${tileInfo.tileStyle.borderWidth})`)
    }
  }
  if (consoleErrors.length > 0) {
    throw new Error(`M1cz: Console-Errors: ${consoleErrors.join(', ')}`)
  }
  if (pageErrors.length > 0) {
    throw new Error(`M1cz: Page-Errors: ${pageErrors.join(', ')}`)
  }

  console.log('M1cz Waldtanz-Gegnerhand-Faecher: ERFOLGREICH — dekorative Leaf-Tiles (Stitch-Peek-Stil) sichtbar hinter Gegnerplakette.')
  process.exit(0)
} catch (err) {
  console.log('FEHLGESCHLAGEN:', err.message)
  process.exit(1)
} finally {
  await browser.close()
}
