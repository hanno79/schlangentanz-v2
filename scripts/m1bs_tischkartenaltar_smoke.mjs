/*
Author: rahn
Datum: 19.06.2026
Version: 1.0
Beschreibung: M1bs Browser-Smoke fuer den prominenten Waldtanz-Tischkartenaltar.
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
    const region = page.getByRole('region', { name: 'Waldtanz-Tischkarte' })
    await region.waitFor()

    const metrics = await page.evaluate(() => {
      const altar = document.querySelector('.waldtanz-tischkarte__altar')
      const karte = document.querySelector('.waldtanz-tischkarte__karte--altar, .waldtanz-tischkarte__leer')
      const lichtkegel = document.querySelector('.waldtanz-tischkarte__lichtkegel')
      const magiekreise = document.querySelector('.waldtanz-magiekreise')
      if (!(altar instanceof HTMLElement) || !(karte instanceof HTMLElement)) return null
      const altarRect = altar.getBoundingClientRect()
      const karteRect = karte.getBoundingClientRect()
      const altarStyle = getComputedStyle(altar)
      const lichtkegelStyle = lichtkegel instanceof HTMLElement ? getComputedStyle(lichtkegel) : null
      const magiekreisRect = magiekreise instanceof HTMLElement ? magiekreise.getBoundingClientRect() : null
      const probePoints = [
        { x: altarRect.x + altarRect.width / 2, y: altarRect.y + altarRect.height / 2 },
        { x: altarRect.x + altarRect.width / 2, y: altarRect.bottom - Math.min(18, altarRect.height * 0.14) },
      ].map((punkt) => ({ ...punkt, hit: document.elementFromPoint(punkt.x, punkt.y)?.closest('.waldtanz-tischkarte__altar') === altar }))
      const magiekreisHit = magiekreise instanceof HTMLElement && magiekreisRect
        ? document.elementFromPoint(magiekreisRect.x + magiekreisRect.width / 2, magiekreisRect.y + magiekreisRect.height / 2)?.closest('.waldtanz-magiekreise') === magiekreise
        : false
      return {
        text: altar.textContent?.trim().replace(/\s+/g, ' ').slice(0, 180),
        width: altarRect.width,
        height: altarRect.height,
        top: altarRect.top,
        bottom: altarRect.bottom,
        cardWidth: karteRect.width,
        cardHeight: karteRect.height,
        borderWidth: altarStyle.borderTopWidth,
        borderStyle: altarStyle.borderTopStyle,
        boxShadow: altarStyle.boxShadow,
        backgroundImage: altarStyle.backgroundImage,
        lichtkegelBackground: lichtkegelStyle?.backgroundImage ?? '',
        probePoints,
        magiekreisHit,
      }
    })

    if (!metrics) throw new Error('M1bs Tischkartenaltar: Altar oder Karte fehlt')
    if (!metrics.text.includes('Kartenaltar') || !metrics.text.includes('Ablagestapel:')) throw new Error(`M1bs Tischkartenaltar: Copy fehlt ${JSON.stringify(metrics)}`)
    if (metrics.height < 130 || metrics.width < 180) throw new Error(`M1bs Tischkartenaltar: Altar zu klein ${JSON.stringify(metrics)}`)
    if (metrics.cardWidth < 100 || metrics.cardHeight < 120) throw new Error(`M1bs Tischkartenaltar: Karten-/Legeplatz zu klein ${JSON.stringify(metrics)}`)
    if (metrics.borderWidth !== '3px' || metrics.borderStyle !== 'solid') throw new Error(`M1bs Tischkartenaltar: kein 3px-Rand ${JSON.stringify(metrics)}`)
    if (!metrics.boxShadow.includes('rgb(6, 57, 7)')) throw new Error(`M1bs Tischkartenaltar: Hard Shadow fehlt ${JSON.stringify(metrics)}`)
    if (!metrics.backgroundImage.includes('radial-gradient') || !metrics.lichtkegelBackground.includes('radial-gradient')) throw new Error(`M1bs Tischkartenaltar: Lichtkegel fehlt ${JSON.stringify(metrics)}`)
    if (!metrics.probePoints.every((punkt) => punkt.hit)) throw new Error(`M1bs Tischkartenaltar: Altar wird überdeckt ${JSON.stringify(metrics.probePoints)}`)
    if (!metrics.magiekreisHit) throw new Error(`M1bs Tischkartenaltar: Magiekreise werden durch die Altar-Kompaktierung überdeckt ${JSON.stringify(metrics)}`)
    if (errors.length > 0) throw new Error(errors.join('\n'))
    console.log(`M1bs Tischkartenaltar: ${Math.round(metrics.width)}x${Math.round(metrics.height)}px, Karte ${Math.round(metrics.cardWidth)}x${Math.round(metrics.cardHeight)}px, 3px-Rand und Lichtkegel sichtbar`)
  } finally {
    await context.close()
    await browser.close()
  }
}

await main()
