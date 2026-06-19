import { chromium } from 'playwright'

const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:4173'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
const consoleErrors = []
const pageErrors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text())
})
page.on('pageerror', (error) => pageErrors.push(String(error)))

try {
  await page.goto(`${baseUrl}/game`, { waitUntil: 'networkidle' })
  const metrics = await page.evaluate(() => {
    const kopf = document.querySelector('.spielbereich--game-route .waldtanz-arenastein__kopf')
    const text = document.querySelector('.spielbereich--game-route .waldtanz-arenastein__kopf p')
    const lichtung = document.querySelector('.spielbereich--game-route .waldtanz-arenastein__schlangenlichtung')
    const startkreis = document.querySelector('.spielbereich--game-route .schlangen-startzone')
    if (!kopf || !text || !lichtung || !startkreis) return null
    const kopfRect = kopf.getBoundingClientRect()
    const lichtungRect = lichtung.getBoundingClientRect()
    const startRect = startkreis.getBoundingClientRect()
    const startMitteX = startRect.left + startRect.width / 2
    const startPruefY = startRect.bottom - 8
    const hit = document.elementFromPoint(startMitteX, startPruefY)
    const kopfStyle = getComputedStyle(kopf)
    const textStyle = getComputedStyle(text)
    return {
      plakette: { width: kopfRect.width, height: kopfRect.height, bottom: kopfRect.bottom, pointerEvents: kopfStyle.pointerEvents, transform: kopfStyle.transform, background: kopfStyle.backgroundColor },
      textClipped: textStyle.clipPath,
      lichtungTop: lichtungRect.top,
      startHit: Boolean(hit?.closest('.schlangen-startzone')),
      startPruefY,
    }
  })

  if (!metrics) throw new Error('M1bu Steinplakette: notwendige Brettobjekte fehlen')
  if (metrics.plakette.width > 390) throw new Error(`M1bu Steinplakette: Plakette zu breit (${metrics.plakette.width}px)`)
  if (metrics.plakette.height > 48) throw new Error(`M1bu Steinplakette: Plakette zu hoch (${metrics.plakette.height}px)`)
  if (metrics.plakette.pointerEvents !== 'none') throw new Error('M1bu Steinplakette: Plakette fängt Klicks ab')
  if (!metrics.textClipped.includes('inset')) throw new Error('M1bu Steinplakette: Hilfetext ist nicht visuell demotet')
  if (metrics.plakette.bottom > metrics.lichtungTop + 58) throw new Error('M1bu Steinplakette: Plakette drückt zu tief in die Lichtung')
  if (!metrics.startHit) throw new Error(`M1bu Steinplakette: Startkreis am Prüfpunkt ${metrics.startPruefY}px nicht hit-testbar`)
  if (consoleErrors.length || pageErrors.length) throw new Error(`M1bu Steinplakette: Browserfehler ${JSON.stringify({ consoleErrors, pageErrors })}`)
  console.log(`M1bu Steinplakette: ${Math.round(metrics.plakette.width)}x${Math.round(metrics.plakette.height)}px, klickdurchlässig, Startkreis hit-testbar`)
} finally {
  await browser.close()
}
