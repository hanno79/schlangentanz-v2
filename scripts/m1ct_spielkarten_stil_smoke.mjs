/*
Author: rahn
Datum: 21.06.2026
Version: 1.0
Beschreibung: M1ct Browser-Smoke fuer den verspielten Stitch-Spielkarten-Stil:
grosses Symbol, fetter Kartenname, farbiges Werteplakett, sichtbarer
Spielen-Hinweis im Karteninneren und Auswahl-Lift-Animation auf /game.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function url(route) { return new URL(route, BASE_URL).toString() }

async function http200(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`M1ct Spielkarten-Stil: HTTP ${response.status} fuer ${url(route)}`)
}

await Promise.all(['/', '/game'].map(http200))

const browser = await chromium.launch()
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const consoleErrors = []
  const pageErrors = []
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  page.on('pageerror', (err) => pageErrors.push(err.message))
  await page.addInitScript(() => { Math.random = () => 0.2 })

  try {
    await page.goto(url('/game'), { waitUntil: 'networkidle' })
    await page.getByRole('region', { name: 'Spieltisch' }).waitFor()

    const beweis = await page.evaluate(() => {
      const spieltisch = document.querySelector('[class~="spielbereich"], [class~="waldtanz-spieltisch"]')
      const spieltischRegion = Array.from(document.querySelectorAll('section, [role="region"]'))
        .find(el => el.getAttribute('aria-label') === 'Spieltisch' || el.querySelector('[aria-label="Waldtanz-Spielkartenfächer"]'))
      // M1db-Update 22.06.2026: Handkarten-Bereich ist jetzt ein UL mit
      // aria-label "Waldtanz-Spielkartenfächer", nicht mehr eine region/Handkarten.
      // Wir finden ihn via aria-label-Match statt role-Suche.
      const handkartenListe = Array.from(document.querySelectorAll('ul, [role="list"]'))
        .find(el => el.getAttribute('aria-label') === 'Waldtanz-Spielkartenfächer')
      const handkartenRegion = handkartenListe ?? Array.from(document.querySelectorAll('[role="region"]'))
        .find(el => el.getAttribute('aria-label') === 'Handkarten')
      const karten = handkartenRegion
        ? Array.from(handkartenRegion.querySelectorAll('button, [role="button"]')).filter(b => /Farbkarte|Sonderkarte/.test(b.getAttribute('aria-label') || ''))
        : []
      const erste = karten[0]
      if (!(erste instanceof HTMLElement)) throw new Error('M1ct Spielkarten-Stil: keine Handkarten gefunden')

      const symbol = erste.querySelector('.handkarte__symbol')
      const titel = erste.querySelector('.handkarte__titel')
      const wertechip = erste.querySelector('.handkarte__wertechip')
      const spielhinweis = erste.querySelector('.handkarte__spielhinweis')

      const symbolStyle = symbol instanceof HTMLElement ? getComputedStyle(symbol) : null
      const titelStyle = titel instanceof HTMLElement ? getComputedStyle(titel) : null
      const wertechipStyle = wertechip instanceof HTMLElement ? getComputedStyle(wertechip) : null
      const spielhinweisStyle = spielhinweis instanceof HTMLElement ? getComputedStyle(spielhinweis) : null

      const symbolRect = symbol instanceof HTMLElement ? symbol.getBoundingClientRect() : null
      const titelRect = titel instanceof HTMLElement ? titel.getBoundingClientRect() : null
      const wertechipRect = wertechip instanceof HTMLElement ? wertechip.getBoundingClientRect() : null

      // Style probe: parse font-size to number
      const fontSizePx = (str) => {
        if (!str) return 0
        const n = parseFloat(str)
        return Number.isFinite(n) ? n : 0
      }
      const symbolFontSizePx = symbolStyle ? fontSizePx(symbolStyle.fontSize) : 0
      const titelFontSizePx = titelStyle ? fontSizePx(titelStyle.fontSize) : 0
      const wertechipFontSizePx = wertechipStyle ? fontSizePx(wertechipStyle.fontSize) : 0

      return {
        anzahlKarten: karten.length,
        symbolSichtbar: symbol !== null,
        titelSichtbar: titel !== null,
        wertechipSichtbar: wertechip !== null,
        spielhinweisVorhanden: spielhinweis !== null,
        symbolFontSizePx,
        symbolHoehe: symbolRect ? Math.round(symbolRect.height) : 0,
        titelFontSizePx,
        titelHoehe: titelRect ? Math.round(titelRect.height) : 0,
        wertechipFontSizePx,
        wertechipHoehe: wertechipRect ? Math.round(wertechipRect.height) : 0,
        spielhinweisOpacity: spielhinweisStyle ? parseFloat(spielhinweisStyle.opacity) : 0,
      }
    })

    if (beweis.anzahlKarten < 3) throw new Error(`M1ct Spielkarten-Stil: zu wenige Handkarten (${JSON.stringify(beweis)})`)
    if (!beweis.symbolSichtbar) throw new Error(`M1ct Spielkarten-Stil: Symbol-Element fehlt (${JSON.stringify(beweis)})`)
    if (!beweis.titelSichtbar) throw new Error(`M1ct Spielkarten-Stil: Titel-Element fehlt (${JSON.stringify(beweis)})`)
    if (!beweis.wertechipSichtbar) throw new Error(`M1ct Spielkarten-Stil: Werteplakett fehlt (${JSON.stringify(beweis)})`)
    // M1d0 22.06.2026: Auf /game wird das Handkarten-Symbol im Bottom-Row-Grid
    // bewusst auf 1.35rem (~24px) reduziert. Der M1ct-Schwellwert ist daher
    // auf 22px gesenkt (Original-Anspruch "grosses Symbol" bleibt erfuellt,
    // aber kompakt genug fuer das neue Layout).
    if (beweis.symbolFontSizePx < 22) throw new Error(`M1ct Spielkarten-Stil: Symbol-Schrift zu klein (${beweis.symbolFontSizePx}px)`)
    if (beweis.titelFontSizePx < 13) throw new Error(`M1ct Spielkarten-Stil: Titel-Schrift zu klein (${beweis.titelFontSizePx}px)`)
    if (beweis.wertechipFontSizePx < 11) throw new Error(`M1ct Spielkarten-Stil: Werteplakett-Schrift zu klein (${beweis.wertechipFontSizePx}px)`)
    if (beweis.spielhinweisVorhanden && beweis.spielhinweisOpacity > 0.5) {
      throw new Error(`M1ct Spielkarten-Stil: Spielhinweis im Ruhezustand sichtbar (opacity ${beweis.spielhinweisOpacity})`)
    }

    // Auswahl-Lift verifizieren
    const ersteKarte = page
      .locator('ul[aria-label="Waldtanz-Spielkartenfächer"] button, [role="region"][aria-label="Handkarten"] [role="button"]')
      .filter({ hasText: /Farbkarte|Sonderkarte/ })
      .first()
    await ersteKarte.click({ force: true })
    const auswahlBeweis = await page.evaluate(() => {
      const li = document.querySelector('li.handkarte--ausgewaehlt')
      if (!li) return { gefunden: false }
      const btn = li.querySelector('.handkarte__button--karte')
      if (!(btn instanceof HTMLElement)) return { gefunden: false }
      const style = getComputedStyle(btn)
      return {
        gefunden: true,
        transform: style.transform,
        boxShadow: style.boxShadow,
        borderWidth: style.borderTopWidth,
      }
    })
    if (!auswahlBeweis.gefunden) throw new Error(`M1ct Spielkarten-Stil: ausgewaehlte Handkarte fehlt (${JSON.stringify(auswahlBeweis)})`)
    if (auswahlBeweis.transform === 'none') throw new Error(`M1ct Spielkarten-Stil: Auswahl-Lift-Transform fehlt (${JSON.stringify(auswahlBeweis)})`)

    if (consoleErrors.length > 0) throw new Error(`M1ct Spielkarten-Stil: Console-Fehler: ${consoleErrors.join(' | ')}`)
    if (pageErrors.length > 0) throw new Error(`M1ct Spielkarten-Stil: Page-Fehler: ${pageErrors.join(' | ')}`)

    console.log(`M1ct Spielkarten-Stil: ${beweis.anzahlKarten} Handkarten, Symbol ${beweis.symbolFontSizePx}px/${beweis.symbolHoehe}px, Titel ${beweis.titelFontSizePx}px, Werteplakett ${beweis.wertechipFontSizePx}px, Spielhinweis opacity ${beweis.spielhinweisOpacity}, Auswahl-Lift aktiv.`)
  } finally {
    await context.close()
  }
} finally {
  await browser.close()
}
