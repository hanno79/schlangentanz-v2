/*
 * Author: rahn
 * Datum: 19.06.2026
 * Version: 1.0
 * Beschreibung: M1cg Browser-Smoke fuer den horizontalen Zugpfad als Waldstein-Spielsteine auf /game.
 */

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const viewports = [
  { width: 1100, height: 900 },
  { width: 1280, height: 900 },
]

function url(route) { return new URL(route, BASE_URL).toString() }
function metric(rect) {
  return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height), top: Math.round(rect.top), right: Math.round(rect.right), bottom: Math.round(rect.bottom), left: Math.round(rect.left) }
}

async function http200(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`M1cg Zugpfad-Waldsteine: HTTP ${response.status} fuer ${url(route)}`)
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
    await page.addInitScript(() => { Math.random = () => 0.999999 })

    try {
      await page.goto(url('/game'), { waitUntil: 'networkidle' })
      await page.getByRole('region', { name: 'Zugpfad' }).waitFor()
      const daten = await page.evaluate(() => {
        const boxData = (rect) => ({ x: rect.x, y: rect.y, width: rect.width, height: rect.height, top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left })
        const zugpfad = document.querySelector('.zugpfad--waldsteine')
        const strecke = document.querySelector('.zugpfad__strecke--waldsteine')
        const rail = document.querySelector('.waldtanz-zugseitenleiste')
        if (!(zugpfad instanceof HTMLElement) || !(strecke instanceof HTMLElement) || !(rail instanceof HTMLElement)) throw new Error('M1cg Zugpfad-Waldsteine: Zugpfad, Strecke oder Unterholz-Rail fehlt')
        const stationen = Array.from(strecke.querySelectorAll('.zugpfad__station--waldstein')).filter((el) => el instanceof HTMLElement)
        const aktive = strecke.querySelector('.zugpfad__station--aktiv.zugpfad__station--waldstein')
        if (!(aktive instanceof HTMLElement)) throw new Error('M1cg Zugpfad-Waldsteine: aktive Spielstein-Station fehlt')
        const rects = stationen.map((el) => boxData(el.getBoundingClientRect()))
        const tops = rects.map((rect) => rect.top)
        const maxTopDelta = Math.max(...tops) - Math.min(...tops)
        const aktiveBox = aktive.getBoundingClientRect()
        const center = { x: aktiveBox.left + aktiveBox.width / 2, y: aktiveBox.top + aktiveBox.height / 2 }
        const activeHit = Boolean(document.elementFromPoint(center.x, center.y)?.closest('.zugpfad__station--waldstein'))
        const style = getComputedStyle(strecke)
        return {
          zugpfad: boxData(zugpfad.getBoundingClientRect()),
          rail: boxData(rail.getBoundingClientRect()),
          stationen: rects,
          maxTopDelta,
          activeHit,
          streckeOverflow: style.overflow,
          streckeScrollWidth: strecke.scrollWidth,
          streckeClientWidth: strecke.clientWidth,
          gridTemplateColumns: style.gridTemplateColumns,
        }
      })

      const { stationen, maxTopDelta, streckeOverflow } = daten
      if (stationen.length !== 2) throw new Error(`M1cg Zugpfad-Waldsteine: Produktion erwartet zwei Spielsteine im Default-Spiel, gefunden ${stationen.length}`)
      if (maxTopDelta > 10) throw new Error(`M1cg Zugpfad-Waldsteine: Spielsteine liegen nicht in einer horizontalen Spur ${JSON.stringify({ maxTopDelta, stationen: stationen.map(metric) })}`)
      if (streckeOverflow !== 'visible') throw new Error(`M1cg Zugpfad-Waldsteine: Strecke bleibt intern gescrollt (${streckeOverflow})`)
      if (daten.streckeScrollWidth > daten.streckeClientWidth + 3) throw new Error(`M1cg Zugpfad-Waldsteine: Strecke laeuft horizontal ueber ${JSON.stringify({ scroll: daten.streckeScrollWidth, client: daten.streckeClientWidth })}`)
      if (!daten.activeHit) throw new Error('M1cg Zugpfad-Waldsteine: aktive Station ist nicht hit-testbar')
      if (daten.zugpfad.height > daten.rail.height + 4 || daten.zugpfad.bottom > daten.rail.bottom + 4) throw new Error(`M1cg Zugpfad-Waldsteine: Zugpfad bricht aus der Unterholzleiste ${JSON.stringify({ zugpfad: metric(daten.zugpfad), rail: metric(daten.rail) })}`)
      if (consoleErrors.length || pageErrors.length) throw new Error(`M1cg Zugpfad-Waldsteine: Browserfehler ${JSON.stringify({ consoleErrors, pageErrors })}`)
      console.log(`M1cg Zugpfad-Waldsteine ${viewport.width}px: ${stationen.length} Spielsteine horizontal, TopDelta ${Math.round(maxTopDelta)}px, Rail ${Math.round(daten.rail.width)}x${Math.round(daten.rail.height)}px.`)
    } finally {
      await context.close()
    }
  }
} finally {
  await browser.close()
}
