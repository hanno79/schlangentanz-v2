/*
Author: rahn
Datum: 20.06.2026
Version: 1.0
Beschreibung: M1cq Browser-Smoke fuer kompaktes Waldtanz-Gegnerzauberfeld.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
function url(route) { return new URL(route, BASE_URL).toString() }

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', err => errors.push(`Page-Fehler: ${err.message}`))
  page.on('console', msg => { if (msg.type() === 'error') errors.push(`Console-Fehler: ${msg.text()}`) })
  await page.addInitScript(() => { Math.random = () => 0.2 })

  try {
    await page.goto(url('/'), { waitUntil: 'networkidle' })
    if (!page.url().startsWith(url('/'))) throw new Error(`Root nicht erreichbar: ${page.url()}`)
    await page.goto(url('/game'), { waitUntil: 'networkidle' })
    await page.getByRole('region', { name: 'Spieltisch' }).waitFor()
    await page.getByRole('button', { name: /Startfährte .* als neue Schlange starten/ }).first().click()
    await page.getByRole('button', { name: 'Weiter zur Aufgabenprüfung' }).click()
    await page.getByRole('button', { name: 'Weiter zum Zugabschluss' }).click()
    await page.getByRole('button', { name: 'Zug an nächsten Spieler geben' }).click()
    await page.getByRole('button', { name: 'Gegnerzug am Brett abspielen' }).click()
    const ausspielphaseStarten = page.getByRole('button', { name: 'Ausspielphase starten' })
    if (await ausspielphaseStarten.count() > 0) await ausspielphaseStarten.click()

    await page.getByRole('button', { name: /farbendieb-01 Sonderkarte Farbendieb/i }).click()
    const zielspur = page.getByRole('note', { name: 'Waldtanz-Zielspur' })
    const sprung = zielspur.getByRole('button', { name: /Zum 1\. Beutekorb-Brettobjekt springen/ }).first()
    await sprung.waitFor({ timeout: 10_000 })
    await sprung.focus()
    await page.keyboard.press('Enter')
    await page.waitForFunction(() => document.querySelector('.schlangen-gruppe--gegnerzauberfeld .farbendieb-beutekorb'))

    const proof = await page.evaluate(() => {
      function rectOf(el) {
        const r = el.getBoundingClientRect()
        return { top: r.top, right: r.right, bottom: r.bottom, left: r.left, width: r.width, height: r.height }
      }
      const feld = document.querySelector('.schlangen-gruppe--gegnerzauberfeld')
      const korb = document.querySelector('.schlangen-gruppe--gegnerzauberfeld .farbendieb-beutekorb')
      const button = korb?.querySelector('button')
      const hand = document.querySelector('.handkarten-panel')
      if (!(feld instanceof HTMLElement)) throw new Error('M1cq: Gegner-Zauberfeld fehlt')
      if (!(korb instanceof HTMLElement)) throw new Error('M1cq: Beutekorb im Gegner-Zauberfeld fehlt')
      if (!(button instanceof HTMLElement)) throw new Error('M1cq: Beutekorb-Button fehlt')
      if (!(hand instanceof HTMLElement)) throw new Error('M1cq: Handpanel fehlt')
      const feldRect = rectOf(feld)
      const korbRect = rectOf(korb)
      const handRect = rectOf(hand)
      const buttonRect = rectOf(button)
      const cx = buttonRect.left + buttonRect.width / 2
      const cy = buttonRect.top + buttonRect.height / 2
      const hit = document.elementFromPoint(cx, cy)
      const hitButton = hit instanceof HTMLElement ? hit.closest('button') : null
      const style = getComputedStyle(feld)
      const korbStyle = getComputedStyle(korb)
      return {
        text: feld.textContent?.replace(/\s+/g, ' ').trim() ?? '',
        feldRect,
        korbRect,
        handTop: handRect.top,
        grid: style.gridTemplateColumns,
        maxHeight: style.maxHeight,
        borderWidth: style.borderTopWidth,
        korbWidth: korbRect.width,
        korbPadding: korbStyle.paddingTop,
        hitTest: hitButton === button,
        focused: button === document.activeElement,
      }
    })

    if (!proof.text.includes('Gegner-Zauberfeld') || !proof.text.includes('Beutekorb')) {
      throw new Error(`M1cq: Gegner-Zauberfeld-Text ungueltig (${JSON.stringify(proof)})`)
    }
    if (proof.feldRect.height > 190 || proof.korbRect.top < 0 || proof.korbRect.bottom > 892) {
      throw new Error(`M1cq: Gegner-Zauberfeld oder Beutekorb nicht kompakt im Viewport (${JSON.stringify(proof)})`)
    }
    if (proof.borderWidth !== '3px' || proof.korbWidth > 240 || proof.korbPadding === '0px') {
      throw new Error(`M1cq: kompakter Stitch-Stil fehlt (${JSON.stringify(proof)})`)
    }
    if (!proof.hitTest || !proof.focused) {
      throw new Error(`M1cq: Beutekorb-Button nicht fokussiert/hit-testbar (${JSON.stringify(proof)})`)
    }
    if (errors.length > 0) throw new Error(errors.join('\n'))
    console.log(`M1cq Gegnerzauberfeld: ${Math.round(proof.feldRect.height)}px hoch, Korb ${Math.round(proof.korbWidth)}px, hit-testbar=${proof.hitTest}.`)
  } finally {
    await context.close()
    await browser.close()
  }
}

await main()
