/*
Author: rahn
Datum: 19.06.2026
Version: 1.0
Beschreibung: M1bw Smoke fuer entflechtete Waldtanz-Lichtung: Tischkarte, Startkreis und Handbank bleiben sichtbar getrennt und hit-testbar.
*/

import { chromium } from 'playwright'

const baseUrl = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function url(route) {
  return new URL(route, baseUrl).toString()
}

function kurz(rect) {
  return rect ? Object.fromEntries(Object.entries(rect).map(([key, value]) => [key, Math.round(value)])) : null
}

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(`Page-Fehler: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`Console-Fehler: ${message.text()}`)
  })

  try {
    await page.addInitScript(() => { Math.random = () => 0.999999 })
    await page.goto(url('/game'), { waitUntil: 'networkidle' })

    const messung = await page.evaluate(() => {
      const rectFor = (selector) => {
        const element = document.querySelector(selector)
        const rect = element?.getBoundingClientRect()
        return rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height, bottom: rect.bottom, right: rect.right } : null
      }
      const hitWithin = (selector) => {
        const element = document.querySelector(selector)
        const rect = element?.getBoundingClientRect()
        if (!element || !rect) return false
        return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)?.closest(selector) === element
      }
      const startzone = document.querySelector('.schlangen-startzone')
      const startRect = startzone?.getBoundingClientRect() ?? null
      const pruefpunkte = startRect
        ? [0.25, 0.5, 0.75].map((anteil) => {
            const x = startRect.x + startRect.width / 2
            const y = startRect.y + startRect.height * anteil
            const hit = document.elementFromPoint(x, y)
            return {
              x,
              y,
              hitClass: hit?.closest('.schlangen-startzone, .waldtanz-tischkarte, .handkarten-panel, .waldtanz-waldtaschen')?.className ?? hit?.className ?? '',
            }
          })
        : []

      return {
        text: document.body.innerText,
        arena: rectFor('.waldtanz-arenastein'),
        tischkarte: rectFor('.waldtanz-tischkarte'),
        startzone: rectFor('.schlangen-startzone'),
        handbank: rectFor('.handkarten-panel'),
        tischkarteHit: hitWithin('.waldtanz-tischkarte'),
        handbankHit: hitWithin('.handkarten-panel'),
        pruefpunkte,
      }
    })

    const sichtbarerText = messung.text.toLocaleLowerCase('de-DE')
    for (const wort of ['Leuchtender Waldstein', 'Kartenaltar', 'Startkreis', 'Deine Hand', 'Ablagestapel', 'Startfährte']) {
      if (!sichtbarerText.includes(wort.toLocaleLowerCase('de-DE'))) throw new Error(`M1bw Lichtung: sichtbare Beschriftung fehlt: ${wort}`)
    }
    if (!messung.arena || !messung.tischkarte || !messung.startzone || !messung.handbank) {
      throw new Error(`M1bw Lichtung: erwartete Spielobjekte fehlen (${JSON.stringify(messung)})`)
    }
    if (messung.tischkarte.bottom + 8 > messung.startzone.y) {
      throw new Error(`M1bw Lichtung: Tischkarte ueberlappt Startkreis (${JSON.stringify({ tischkarte: kurz(messung.tischkarte), startzone: kurz(messung.startzone) })})`)
    }
    if (messung.startzone.bottom + 8 > messung.handbank.y) {
      throw new Error(`M1bw Lichtung: Startkreis laeuft in die Handbank (${JSON.stringify({ startzone: kurz(messung.startzone), handbank: kurz(messung.handbank) })})`)
    }
    const schlechteHits = messung.pruefpunkte.filter((punkt) => !String(punkt.hitClass).includes('schlangen-startzone'))
    if (schlechteHits.length > 0) {
      throw new Error(`M1bw Lichtung: Startkreis-Pruefpunkte nicht hit-testbar (${JSON.stringify(schlechteHits)})`)
    }
    if (!messung.tischkarteHit || !messung.handbankHit) {
      throw new Error(`M1bw Lichtung: Tischkarte/Handbank nicht hit-testbar (${JSON.stringify({ tischkarteHit: messung.tischkarteHit, handbankHit: messung.handbankHit })})`)
    }
    if (messung.arena.bottom > 900 || messung.handbank.bottom > 900) {
      throw new Error(`M1bw Lichtung: Spielobjekte verlassen den ersten Viewport (${JSON.stringify({ arena: kurz(messung.arena), handbank: kurz(messung.handbank) })})`)
    }
    if (errors.length > 0) throw new Error(errors.join('\n'))
    console.log(`M1bw Lichtung: Tischkarte endet bei ${Math.round(messung.tischkarte.bottom)}px, Startkreis ${Math.round(messung.startzone.y)}-${Math.round(messung.startzone.bottom)}px, Handbank ab ${Math.round(messung.handbank.y)}px; Startkreis hit-testbar.`)
  } finally {
    await context.close()
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
