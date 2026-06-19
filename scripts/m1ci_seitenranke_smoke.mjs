/*
Author: rahn
Datum: 19.06.2026
Version: 1.0
Beschreibung: M1ci Browser-Smoke fuer die schmale Waldtanz-Seitenranke auf /game.
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
    await page.getByRole('region', { name: 'Spieltisch' }).waitFor()
    const m = await page.evaluate(() => {
      const rect = (selector) => {
        const element = document.querySelector(selector)
        if (!(element instanceof HTMLElement)) throw new Error(`M1ci Seitenranke: ${selector} fehlt`)
        const box = element.getBoundingClientRect()
        const style = getComputedStyle(element)
        return { x: box.x, y: box.y, right: box.right, bottom: box.bottom, width: box.width, height: box.height, overflow: style.overflow, pointerEvents: style.pointerEvents }
      }
      const seitenranke = rect('.waldtanz-seitenmenue--seitenranke')
      const brett = rect('.spielbrett--waldtanz')
      const waldstein = rect('.waldtanz-arenastein')
      const rankenChips = Array.from(document.querySelectorAll('.waldtanz-seitenmenue__rankenchip')).map((element) => {
        const box = element.getBoundingClientRect()
        return { label: element.getAttribute('aria-label'), width: box.width, height: box.height }
      })
      const handkarte = document.querySelector('.handkartenleiste--tiefenfaecher .handkarte__button--karte')
      if (!(handkarte instanceof HTMLElement)) throw new Error('M1ci Seitenranke: erste Handkarte fehlt')
      const handBox = handkarte.getBoundingClientRect()
      const handHit = Boolean(document.elementFromPoint(handBox.x + handBox.width / 2, handBox.y + handBox.height / 2)?.closest('.handkarte__button--karte'))
      return { viewportWidth: innerWidth, bodyScrollWidth: document.body.scrollWidth, seitenranke, brett, waldstein, rankenChips, handkarte: { bottom: handBox.bottom, hit: handHit } }
    })

    if (m.seitenranke.width > 128 || m.seitenranke.width < 90) throw new Error(`M1ci Seitenranke: Rahmen nicht rankenschmal (${JSON.stringify(m.seitenranke)})`)
    if (m.seitenranke.overflow !== 'visible' || m.seitenranke.pointerEvents !== 'none') throw new Error(`M1ci Seitenranke: Ranke soll statisch und klickdurchlässig sein (${JSON.stringify(m.seitenranke)})`)
    if (m.brett.width < 1030 || m.waldstein.width < 900) throw new Error(`M1ci Seitenranke: Brett gewinnt nicht genug Raum (${JSON.stringify({ brett: m.brett, waldstein: m.waldstein })})`)
    if (m.rankenChips.length !== 3 || !m.rankenChips.some(chip => chip.label === 'Phase: Ausspielphase')) throw new Error(`M1ci Seitenranke: Rankenwerte fehlen (${JSON.stringify(m.rankenChips)})`)
    if (m.bodyScrollWidth > m.viewportWidth + 2 || m.brett.right > m.viewportWidth + 2) throw new Error(`M1ci Seitenranke: horizontales Clipping (${JSON.stringify(m)})`)
    if (m.handkarte.bottom > 900 || !m.handkarte.hit) throw new Error(`M1ci Seitenranke: Handkarte nicht im Erstbild klickbar (${JSON.stringify(m.handkarte)})`)
    if (errors.length > 0) throw new Error(errors.join('\n'))
    console.log(`M1ci Seitenranke: Rahmen ${Math.round(m.seitenranke.width)}px, Brett ${Math.round(m.brett.width)}px, Waldstein ${Math.round(m.waldstein.width)}px, Handkarte klickbar.`)
  } finally {
    await context.close()
    await browser.close()
  }
}

await main()
