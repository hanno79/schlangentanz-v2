/*
Author: rahn
Datum: 19.06.2026
Version: 1.0
Beschreibung: M1by Browser-Smoke fuer die breite Waldtanz-Spielmatte auf /game.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function url(route) { return new URL(route, BASE_URL).toString() }

async function http200(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`HTTP ${response.status} fuer ${url(route)}`)
  console.log(`HTTP 200  ${url(route)}`)
}

function metric(rect) {
  return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height), right: Math.round(rect.right), bottom: Math.round(rect.bottom) }
}

await Promise.all(['/', '/game'].map(http200))
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
const page = await context.newPage()
const consoleErrors = []
const pageErrors = []
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
page.on('pageerror', (err) => pageErrors.push(err.message))
await page.addInitScript(() => { Math.random = () => 0.999999 })

try {
  await page.goto(url('/game'), { waitUntil: 'networkidle' })
  await page.getByRole('region', { name: 'Spieltisch' }).waitFor()
  const daten = await page.evaluate(() => {
    const element = (selector) => {
      const gefunden = document.querySelector(selector)
      if (!(gefunden instanceof HTMLElement)) throw new Error(`M1by Spielbrettweite: ${selector} fehlt`)
      return gefunden
    }
    const spielbereich = element('.spielbereich--game-route')
    const brett = element('.spielbrett--waldtanz')
    const waldstein = element('.waldtanz-arenastein')
    const zugleiste = element('.waldtanz-zugseitenleiste')
    const gartenkopf = element('.waldtanz-spielerrahmen')
    const handkarte = element('.handkartenleiste--spielkartenfaecher .handkarte__button--karte')
    const handCenter = {
      x: handkarte.getBoundingClientRect().left + handkarte.getBoundingClientRect().width / 2,
      y: handkarte.getBoundingClientRect().top + handkarte.getBoundingClientRect().height / 2,
    }
    const handHit = Boolean(document.elementFromPoint(handCenter.x, handCenter.y)?.closest('.handkarte__button--karte'))
    const styles = {
      brett: getComputedStyle(brett),
      zugleiste: getComputedStyle(zugleiste),
      gartenkopf: getComputedStyle(gartenkopf),
    }
    return {
      viewport: { width: innerWidth, height: innerHeight },
      bodyScrollWidth: document.body.scrollWidth,
      spielbereich: spielbereich.getBoundingClientRect().toJSON(),
      brett: brett.getBoundingClientRect().toJSON(),
      waldstein: waldstein.getBoundingClientRect().toJSON(),
      zugleiste: zugleiste.getBoundingClientRect().toJSON(),
      gartenkopf: gartenkopf.getBoundingClientRect().toJSON(),
      handkarte: { ...handkarte.getBoundingClientRect().toJSON(), hit: handHit },
      brettColumns: styles.brett.gridTemplateColumns,
      zugleisteColumns: styles.zugleiste.gridTemplateColumns,
      gartenkopfBackground: styles.gartenkopf.backgroundColor,
      gartenkopfShadow: styles.gartenkopf.boxShadow,
    }
  })

  const waldstein = daten.waldstein
  const zugleiste = daten.zugleiste
  const waldsteinWidth = waldstein.width
  if (waldsteinWidth < 820) throw new Error(`M1by Spielbrettweite: Waldstein zu schmal (${JSON.stringify(metric(waldstein))})`)
  if (zugleiste.y < waldstein.bottom) throw new Error(`M1by Spielbrettweite: Zugleiste liegt noch neben/ueber dem Waldstein (${JSON.stringify({ waldstein: metric(waldstein), zugleiste: metric(zugleiste) })})`)
  if (zugleiste.width < 820 || zugleiste.height > 170) throw new Error(`M1by Spielbrettweite: Zugleiste nicht als kompakter Unter-dem-Brett-Rail (${JSON.stringify(metric(zugleiste))})`)
  if (daten.gartenkopf.height > 185 || daten.gartenkopfShadow !== 'none') throw new Error(`M1by Spielbrettweite: oberer Gartenkopf ist noch ein dominantes Panel (${JSON.stringify({ box: metric(daten.gartenkopf), shadow: daten.gartenkopfShadow, background: daten.gartenkopfBackground })})`)
  if (daten.bodyScrollWidth > daten.viewport.width + 2 || daten.brett.right > daten.spielbereich.right + 2) throw new Error(`M1by Spielbrettweite: horizontales Clipping (${JSON.stringify({ viewport: daten.viewport, scrollWidth: daten.bodyScrollWidth, brett: metric(daten.brett), spielbereich: metric(daten.spielbereich) })})`)
  if (daten.handkarte.bottom > 900 || !daten.handkarte.hit) throw new Error(`M1by Spielbrettweite: Handkarte nicht im Erstbild klickbar (${JSON.stringify(metric(daten.handkarte))})`)
  if (consoleErrors.length || pageErrors.length) throw new Error(`M1by Spielbrettweite: Browserfehler ${JSON.stringify({ consoleErrors, pageErrors })}`)
  console.log(`M1by Spielbrettweite: Waldstein ${Math.round(waldsteinWidth)}px breit, Zugleiste darunter ${Math.round(daten.zugleiste.width)}x${Math.round(daten.zugleiste.height)}px, Handkarte klickbar.`)
} finally {
  await context.close()
  await browser.close()
}
