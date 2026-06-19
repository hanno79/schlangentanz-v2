/*
Author: rahn
Datum: 19.06.2026
Version: 1.0
Beschreibung: M1cf Browser-Smoke fuer die kompakte Unterholzleiste unter dem Waldstein auf /game.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const viewports = [
  { width: 1100, height: 900, label: 'enge Desktopkante' },
  { width: 1280, height: 900, label: 'Standardbrett' },
]

function url(route) { return new URL(route, BASE_URL).toString() }
function metric(rect) {
  return { x: Math.round(rect?.x ?? 0), y: Math.round(rect?.y ?? 0), width: Math.round(rect?.width ?? 0), height: Math.round(rect?.height ?? 0), right: Math.round(rect?.right ?? 0), bottom: Math.round(rect?.bottom ?? 0) }
}

async function http200(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`M1cf Unterholzleiste: HTTP ${response.status} fuer ${url(route)}`)
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
    await page.addInitScript(() => { Math.random = () => 0.028 })

    try {
      await page.goto(url('/game'), { waitUntil: 'networkidle' })
      await page.getByRole('region', { name: 'Spieltisch' }).waitFor()
      const handDaten = await page.evaluate(() => {
        const boxData = (rect) => ({ x: rect.x, y: rect.y, width: rect.width, height: rect.height, top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left })
        const hand = document.querySelector('.handkarten-panel')
        if (!(hand instanceof HTMLElement)) throw new Error('M1cf Unterholzleiste: Handbank fehlt')
        const handkarten = Array.from(document.querySelectorAll('.handkartenleiste--spielkartenfaecher .handkarte__button--karte')).filter((karte) => karte instanceof HTMLElement)
        for (const karte of handkarten) {
          const rect = karte.getBoundingClientRect()
          const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
          const hit = Boolean(document.elementFromPoint(center.x, center.y)?.closest('.handkarte__button--karte'))
          if (hit && rect.bottom <= innerHeight) return { hand: boxData(hand.getBoundingClientRect()), handkarte: { ...boxData(rect), hit } }
        }
        throw new Error('M1cf Unterholzleiste: keine Handkarte im Erstbild hit-testbar')
      })
      await page.evaluate(() => {
        const verdoppler = Array.from(document.querySelectorAll('.handkartenleiste--spielkartenfaecher .handkarte__button--karte')).find((button) => button.textContent?.includes('Verdoppler'))
        if (!(verdoppler instanceof HTMLElement)) throw new Error('M1cf Unterholzleiste: deterministische Verdoppler-Handkarte fehlt')
        verdoppler.click()
        window.scrollTo(0, 0)
      })
      await page.getByRole('region', { name: 'Waldtanz-Bonuszauber' }).waitFor({ state: 'visible' })
      const daten = await page.evaluate(() => {
        const element = (selector) => {
          const gefunden = document.querySelector(selector)
          if (!(gefunden instanceof HTMLElement)) throw new Error(`M1cf Unterholzleiste: ${selector} fehlt`)
          return gefunden
        }
        const zugleiste = element('.waldtanz-zugseitenleiste')
        const unterholz = element('.waldtanz-unterholzleiste')
        const arena = element('.waldtanz-arenastein')
        const zugpfad = element('.zugpfad')
        const spielhilfe = element('.waldtanz-spielhilfe')
        const zugkompass = element('.zugkompass')
        const wegweiserLink = element('.waldtanz-spielhilfe .spielerfuehrung__aktionslink')
        const bonuszauber = element('.waldtanz-bonuszauber')
        const bonusButton = element('.waldtanz-bonuszauber__button')
        const linkBox = wegweiserLink.getBoundingClientRect()
        const linkCenter = { x: linkBox.left + linkBox.width / 2, y: linkBox.top + linkBox.height / 2 }
        const linkHit = Boolean(document.elementFromPoint(linkCenter.x, linkCenter.y)?.closest('.spielerfuehrung__aktionslink'))
        const bonusButtonBox = bonusButton.getBoundingClientRect()
        const bonusButtonCenter = { x: bonusButtonBox.left + bonusButtonBox.width / 2, y: bonusButtonBox.top + bonusButtonBox.height / 2 }
        const bonusButtonHit = Boolean(document.elementFromPoint(bonusButtonCenter.x, bonusButtonCenter.y)?.closest('.waldtanz-bonuszauber__button'))
        const boxData = (rect) => ({ x: rect.x, y: rect.y, width: rect.width, height: rect.height, top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left })
        return {
          viewport: { width: innerWidth, height: innerHeight },
          arena: boxData(arena.getBoundingClientRect()),
          zugleiste: boxData(zugleiste.getBoundingClientRect()),
          unterholz: boxData(unterholz.getBoundingClientRect()),
          spielhilfe: boxData(spielhilfe.getBoundingClientRect()),
          wegweiserLink: { box: boxData(linkBox), hit: linkHit },
          bonusButton: { box: boxData(bonusButtonBox), hit: bonusButtonHit },
          directChildren: Array.from(zugleiste.children)
            .filter((el) => el instanceof HTMLElement)
            .map((el) => {
              const rect = el.getBoundingClientRect()
              return { className: el.className, text: el.textContent ?? '', box: boxData(rect), overflow: getComputedStyle(el).overflow }
            }),
          childHeights: [unterholz, zugpfad, spielhilfe, zugkompass, bonuszauber].map((el) => Math.round(el.getBoundingClientRect().height)),
          zugleisteColumns: getComputedStyle(zugleiste).gridTemplateColumns,
          zugleisteOverflow: getComputedStyle(zugleiste).overflow,
          unterholzText: unterholz.textContent ?? '',
        }
      })

      if (daten.zugleiste.y <= handDaten.hand.bottom) throw new Error(`M1cf Unterholzleiste: Zugleiste ueberlappt Handbank ${JSON.stringify({ hand: metric(handDaten.hand), zugleiste: metric(daten.zugleiste) })}`)
      const kindOben = Math.min(...daten.directChildren.map((kind) => kind.box.top))
      const umgebrocheneKinder = daten.directChildren.filter((kind) => kind.box.top > kindOben + 18).map((kind) => ({ className: kind.className, box: metric(kind.box) }))
      const bonusKinder = daten.directChildren.filter((kind) => String(kind.className).includes('waldtanz-bonuszauber'))
      if (daten.zugleiste.height > 112 || daten.zugleiste.bottom > viewport.height + 8) throw new Error(`M1cf Unterholzleiste: Unterholz-Rail ist zu hoch/angeschnitten ${JSON.stringify(metric(daten.zugleiste))}`)
      if (umgebrocheneKinder.length) throw new Error(`M1cf Unterholzleiste: Rail-Kinder brechen aus der Unterholz-Zeile ${JSON.stringify(umgebrocheneKinder)}`)
      if (daten.arena.height < 520) throw new Error(`M1cf Unterholzleiste: Waldstein wurde versehentlich geschrumpft ${JSON.stringify(metric(daten.arena))}`)
      if (!handDaten.handkarte.hit || handDaten.handkarte.bottom > viewport.height) throw new Error(`M1cf Unterholzleiste: Handkarte nicht klickbar im Erstbild ${JSON.stringify(metric(handDaten.handkarte))}`)
      if (!daten.wegweiserLink.hit || daten.wegweiserLink.box.bottom > daten.spielhilfe.bottom + 2) throw new Error(`M1cf Unterholzleiste: Wegweiser-Link ist im kompakten Rail abgeschnitten ${JSON.stringify({ link: metric(daten.wegweiserLink.box), spielhilfe: metric(daten.spielhilfe) })}`)
      if (!daten.bonusButton.hit || daten.bonusButton.box.bottom > daten.zugleiste.bottom + 2) throw new Error(`M1cf Unterholzleiste: Bonuszauber-Button nicht hit-testbar in der Rail ${JSON.stringify({ button: metric(daten.bonusButton.box), zugleiste: metric(daten.zugleiste) })}`)
      if (!daten.unterholzText.includes('Unterholzleiste') || !daten.unterholzText.includes('Eine spielbare Aktion')) throw new Error(`M1cf Unterholzleiste: Leistenkopf nicht spielerfuehrend ${JSON.stringify(daten.unterholzText)}`)
      if (!daten.zugleisteColumns.split(' ').some((teil) => Number.parseFloat(teil) < 160)) throw new Error(`M1cf Unterholzleiste: keine verdichteten Spalten ${daten.zugleisteColumns}`)
      if (bonusKinder.some((kind) => kind.overflow !== 'hidden')) throw new Error(`M1cf Unterholzleiste: Bonuszauber ist nicht kompakt gedeckelt ${JSON.stringify(bonusKinder)}`)
      if (daten.childHeights.some((height) => height > 118)) throw new Error(`M1cf Unterholzleiste: Kindpanel nicht kompakt ${JSON.stringify(daten.childHeights)}`)
      if (daten.zugleisteOverflow !== 'visible') throw new Error(`M1cf Unterholzleiste: Zugleiste ist weiterhin Scrollbox ${daten.zugleisteOverflow}`)
      if (consoleErrors.length || pageErrors.length) throw new Error(`M1cf Unterholzleiste: Browserfehler ${JSON.stringify({ consoleErrors, pageErrors })}`)
      console.log(`M1cf Unterholzleiste ${viewport.width}px: Rail ${Math.round(daten.zugleiste.width)}x${Math.round(daten.zugleiste.height)}px unter Handbank, Waldstein ${Math.round(daten.arena.height)}px, Handkarte klickbar.`)
    } finally {
      await context.close()
    }
  }
} finally {
  await browser.close()
}
