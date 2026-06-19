/*
Author: rahn
Datum: 19.06.2026
Version: 1.0
Beschreibung: M1bq Browser-Smoke fuer die breite Waldtanz-Spielkamera auf /game.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function url(route) { return new URL(route, BASE_URL).toString() }

async function http200(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`HTTP ${response.status} fuer ${url(route)}`)
  console.log(`HTTP 200  ${url(route)}`)
}

function boxMetric(rect) {
  if (!rect) return null
  return { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height), right: Math.round(rect.x + rect.width), bottom: Math.round(rect.y + rect.height) }
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
    await page.getByRole('region', { name: 'Spieltisch' }).waitFor()
    const m = await page.evaluate(() => {
      const q = (selector) => {
        const element = document.querySelector(selector)
        if (!(element instanceof HTMLElement)) throw new Error(`M1bq Spielkamera: ${selector} fehlt`)
        return element.getBoundingClientRect()
      }
      const spielbereich = q('.spielbereich--game-route')
      const seitenrahmen = q('.waldtanz-seitenmenue')
      const brett = q('.spielbrett--waldtanz')
      const waldstein = q('.waldtanz-arenastein')
      const zugleiste = q('.waldtanz-zugseitenleiste')
      const handkarte = q('.handkartenleiste--tiefenfaecher .handkarte__button--karte')
      const firstCardHit = Boolean(document.elementFromPoint(handkarte.x + handkarte.width / 2, handkarte.y + handkarte.height / 2)?.closest('.handkarte__button--karte'))
      return {
        viewport: { width: innerWidth, height: innerHeight },
        bodyScrollWidth: document.body.scrollWidth,
        spielbereich: { x: spielbereich.x, y: spielbereich.y, right: spielbereich.right, width: spielbereich.width, height: spielbereich.height },
        seitenrahmen: { x: seitenrahmen.x, y: seitenrahmen.y, right: seitenrahmen.right, width: seitenrahmen.width, height: seitenrahmen.height },
        brett: { x: brett.x, y: brett.y, right: brett.right, width: brett.width, height: brett.height },
        waldstein: { x: waldstein.x, y: waldstein.y, right: waldstein.right, width: waldstein.width, height: waldstein.height },
        zugleiste: { x: zugleiste.x, y: zugleiste.y, right: zugleiste.right, width: zugleiste.width, height: zugleiste.height },
        handkarte: { x: handkarte.x, y: handkarte.y, width: handkarte.width, height: handkarte.height, bottom: handkarte.bottom, hit: firstCardHit },
      }
    })

    const seitenrahmenWidth = m.seitenrahmen.width
    const brettWidth = m.brett.width
    const waldsteinWidth = m.waldstein.width
    if (seitenrahmenWidth > 190 || seitenrahmenWidth < 130) throw new Error(`M1bq Spielkamera: Seitenrahmen nicht kompakt (${JSON.stringify(m.seitenrahmen)})`)
    if (brettWidth < 980) throw new Error(`M1bq Spielkamera: Spieltisch zu schmal (${JSON.stringify(m.brett)})`)
    const waldstein = m.waldstein
    const zugleiste = m.zugleiste
    if (waldsteinWidth < 820) throw new Error(`M1bq Spielkamera: Waldstein zu schmal (${JSON.stringify(m.waldstein)})`)
    if (zugleiste.y < waldstein.bottom || zugleiste.right > m.brett.right + 2) throw new Error(`M1bq Spielkamera: Waldstein/Zugleiste kollidieren oder laufen aus dem Brett (${JSON.stringify(m)})`)
    if (m.bodyScrollWidth > m.viewport.width + 2 || m.brett.right > m.spielbereich.right + 2) throw new Error(`M1bq Spielkamera: horizontales Clipping (${JSON.stringify(m)})`)
    if (m.handkarte.bottom > 900 || !m.handkarte.hit) throw new Error(`M1bq Spielkamera: Handkarte nicht im Erstbild klickbar (${JSON.stringify(m.handkarte)})`)
    if (errors.length > 0) throw new Error(errors.join('\n'))
    console.log(`M1bq Spielkamera: Seitenrahmen ${Math.round(seitenrahmenWidth)}px, Spieltisch ${Math.round(brettWidth)}px, Waldstein ${Math.round(waldsteinWidth)}px, Handkarte klickbar`)
    console.log(JSON.stringify({ spielbereich: boxMetric(m.spielbereich), seitenrahmen: boxMetric(m.seitenrahmen), brett: boxMetric(m.brett), waldstein: boxMetric(m.waldstein), zugleiste: boxMetric(m.zugleiste), handkarte: boxMetric(m.handkarte) }))
  } finally {
    await context.close()
    await browser.close()
  }
}

await main()
