/*
Author: rahn
Datum: 19.06.2026
Version: 1.0
Beschreibung: M1br Browser-Smoke fuer runde Magiekreis-Dropzonen in der Waldtanz-Lichtung.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function url(route) { return new URL(route, BASE_URL).toString() }

async function http200(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`HTTP ${response.status} fuer ${url(route)}`)
  console.log(`HTTP 200  ${url(route)}`)
}

async function main() {
  await Promise.all(['/', '/game'].map(http200))
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', err => errors.push(`Page-Fehler: ${err.message}`))
  page.on('console', msg => { if (msg.type() === 'error') errors.push(`Console-Fehler: ${msg.text()}`) })
  await page.addInitScript(() => { Math.random = () => 0.999999 })

  try {
    await page.goto(url('/game'), { waitUntil: 'networkidle' })
    const region = page.getByRole('region', { name: 'Waldtanz-Magiekreise' })
    await region.waitFor()
    const ersteHandkarte = page.locator('.handkartenleiste--tiefenfaecher .handkarte__button--karte').first()
    await ersteHandkarte.click()

    const metrics = await page.evaluate(() => {
      const kreise = [...document.querySelectorAll('.waldtanz-magiekreise__kreis')].map((element) => {
        const rect = element.getBoundingClientRect()
        const style = getComputedStyle(element)
        const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)?.closest('.waldtanz-magiekreise__kreis') === element
        return {
          text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80),
          width: rect.width,
          height: rect.height,
          x: rect.x,
          y: rect.y,
          bottom: rect.bottom,
          borderRadius: style.borderTopLeftRadius,
          borderStyle: style.borderTopStyle,
          hit,
          aktiv: element.classList.contains('waldtanz-magiekreise__kreis--aktiv'),
        }
      })
      const panel = document.querySelector('.waldtanz-magiekreise')
      const panelStyle = panel instanceof HTMLElement ? getComputedStyle(panel) : null
      const panelRect = panel instanceof HTMLElement ? panel.getBoundingClientRect() : null
      return {
        kreise,
        panelBackground: panelStyle?.backgroundColor,
        panelBorderColor: panelStyle?.borderTopColor,
        panelOverflow: panelStyle ? `${panelStyle.overflowX}/${panelStyle.overflowY}` : null,
        panel: panel instanceof HTMLElement && panelRect ? {
          width: panelRect.width,
          height: panelRect.height,
          scrollHeight: panel.scrollHeight,
          clientHeight: panel.clientHeight,
        } : null,
        bodyScrollWidth: document.body.scrollWidth,
        viewportWidth: innerWidth,
      }
    })

    if (metrics.kreise.length !== 3) throw new Error(`M1br Magiekreise: erwartet 3 Kreise, bekommen ${metrics.kreise.length}`)
    for (const [index, kreis] of metrics.kreise.entries()) {
      const aspectDelta = Math.abs(kreis.width - kreis.height) / Math.max(kreis.width, kreis.height)
      if (aspectDelta > 0.18) throw new Error(`M1br Magiekreise: Kreis ${index + 1} nicht rund genug ${JSON.stringify(kreis)}`)
      if (kreis.width < 72 || kreis.height < 72) throw new Error(`M1br Magiekreise: Kreis ${index + 1} zu klein ${JSON.stringify(kreis)}`)
      if (!kreis.hit) throw new Error(`M1br Magiekreise: Kreis ${index + 1} ist am Mittelpunkt nicht hit-testbar ${JSON.stringify(kreis)}`)
      if (!/px$/.test(kreis.borderRadius)) throw new Error(`M1br Magiekreise: Kreis ${index + 1} ohne berechneten Radius ${JSON.stringify(kreis)}`)
    }
    if (metrics.panelBackground !== 'rgba(0, 0, 0, 0)') throw new Error(`M1br Magiekreise: Panel-Hintergrund noch sichtbar ${JSON.stringify(metrics)}`)
    if (!metrics.panelBorderColor?.includes('rgba(0, 0, 0, 0)')) throw new Error(`M1br Magiekreise: Panel-Rand noch sichtbar ${JSON.stringify(metrics)}`)
    if (metrics.panelOverflow !== 'visible/visible') throw new Error(`M1br Magiekreise: Panel clippt Kreise noch (${metrics.panelOverflow}) ${JSON.stringify(metrics.panel)}`)
    if (!metrics.kreise.some((kreis) => kreis.aktiv)) throw new Error(`M1br Magiekreise: nach Handkartenauswahl leuchtet kein Brettkreis ${JSON.stringify(metrics.kreise)}`)
    if (metrics.bodyScrollWidth > metrics.viewportWidth + 2) throw new Error(`M1br Magiekreise: horizontales Clipping ${JSON.stringify(metrics)}`)
    if (errors.length > 0) throw new Error(errors.join('\n'))
    console.log('M1br Magiekreise: 3 runde Dropzonen hit-testbar, Auswahl aktiviert mindestens einen Kreis')
    console.log(JSON.stringify(metrics.kreise.map((kreis) => ({ w: Math.round(kreis.width), h: Math.round(kreis.height), border: kreis.borderStyle, aktiv: kreis.aktiv }))))
  } finally {
    await context.close()
    await browser.close()
  }
}

await main()
