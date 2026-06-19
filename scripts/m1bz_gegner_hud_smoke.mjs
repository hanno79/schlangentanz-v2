/*
Author: rahn
Datum: 19.06.2026
Version: 1.0
Beschreibung: M1bz Browser-Smoke fuer das kompakte Gegner-HUD auf /game.
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

async function pruefeGrubenAusnahme(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const errors = []
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })
  page.on('pageerror', (err) => errors.push(err.message))
  await page.addInitScript(() => { Math.random = () => 0.01 })
  try {
    await page.goto(url('/game'), { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: /schlangengrube/i }).first().click()
    await page.getByRole('button', { name: /Schlangengrube im Spielerrahmen/i }).first().waitFor()
    const daten = await page.evaluate(() => {
      const element = (selector) => {
        const gefunden = document.querySelector(selector)
        if (!(gefunden instanceof HTMLElement)) throw new Error(`M1bz Gruben-Ausnahme: ${selector} fehlt`)
        return gefunden
      }
      const rahmen = element('.waldtanz-spielerrahmen')
      const gegnerliste = element('.waldtanz-spielerrahmen__gegnerliste')
      const grubenplatz = element('.waldtanz-spielerrahmen__gegnerplatz--grubenziel')
      const grubenknopf = element('.schlangengrube-grubenfalle__button')
      const waldstein = element('.waldtanz-arenastein')
      const buttonBox = grubenknopf.getBoundingClientRect()
      const center = { x: buttonBox.left + buttonBox.width / 2, y: buttonBox.top + buttonBox.height / 2 }
      const rahmenStyle = getComputedStyle(rahmen)
      return {
        rahmen: rahmen.getBoundingClientRect().toJSON(),
        waldstein: waldstein.getBoundingClientRect().toJSON(),
        gegnerlisteDisplay: getComputedStyle(gegnerliste).display,
        rahmenOverflow: rahmenStyle.overflow,
        rahmenMaxHeight: rahmenStyle.maxHeight,
        grubenplatz: grubenplatz.getBoundingClientRect().toJSON(),
        grubenknopf: { ...buttonBox.toJSON(), hit: Boolean(document.elementFromPoint(center.x, center.y)?.closest('.schlangengrube-grubenfalle__button')) },
      }
    })

    if (daten.gegnerlisteDisplay === 'none' || daten.rahmenOverflow !== 'auto' || Number.parseFloat(daten.rahmenMaxHeight) < 190) {
      throw new Error(`M1bz Gruben-Ausnahme: Gegnerliste reserviert keinen Raum (${JSON.stringify({ display: daten.gegnerlisteDisplay, overflow: daten.rahmenOverflow, maxHeight: daten.rahmenMaxHeight })})`)
    }
    if (daten.waldstein.y < daten.rahmen.bottom - 2) {
      throw new Error(`M1bz Gruben-Ausnahme: Grubenziele ueberlappen den Waldstein (${JSON.stringify({ rahmen: metric(daten.rahmen), waldstein: metric(daten.waldstein) })})`)
    }
    if (!daten.grubenknopf.hit) {
      throw new Error(`M1bz Gruben-Ausnahme: Grubenknopf ist nicht hit-testbar (${JSON.stringify({ platz: metric(daten.grubenplatz), knopf: metric(daten.grubenknopf) })})`)
    }
    if (errors.length) throw new Error(`M1bz Gruben-Ausnahme: Browserfehler ${JSON.stringify(errors)}`)
    console.log(`M1bz Gruben-Ausnahme: Gegnerliste sichtbar, Rahmen ${Math.round(daten.rahmen.height)}px/${daten.rahmenMaxHeight}, Grubenknopf hit-testbar.`)
  } finally {
    await context.close()
  }
}

await Promise.all(['/', '/game'].map(http200))
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
const page = await context.newPage()
const consoleErrors = []
const pageErrors = []
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
page.on('pageerror', (err) => pageErrors.push(err.message))
await page.addInitScript(() => { Math.random = () => 0.62 })

try {
  await page.goto(url('/game'), { waitUntil: 'networkidle' })
  await page.getByRole('region', { name: 'Spieltisch' }).waitFor()
  const daten = await page.evaluate(() => {
    const element = (selector) => {
      const gefunden = document.querySelector(selector)
      if (!(gefunden instanceof HTMLElement)) throw new Error(`M1bz Gegner-HUD: ${selector} fehlt`)
      return gefunden
    }
    const rahmen = element('.waldtanz-spielerrahmen')
    const gartenkopf = element('.waldtanz-spielerrahmen__gartenkopf')
    const statusband = element('.waldtanz-spielerrahmen__statusband')
    const gegnerliste = element('.waldtanz-spielerrahmen__gegnerliste')
    const eigeneReihe = element('.waldtanz-spielerrahmen__reihe--du')
    const topkarten = Array.from(document.querySelectorAll('.waldtanz-spielerrahmen__topkarte')).filter((node) => node instanceof HTMLElement)
    const waldstein = element('.waldtanz-arenastein')
    const handkarte = element('.handkartenleiste--spielkartenfaecher .handkarte__button--karte')
    const handBox = handkarte.getBoundingClientRect()
    const handCenter = { x: handBox.left + handBox.width / 2, y: handBox.top + handBox.height / 2 }
    const styles = {
      rahmen: getComputedStyle(rahmen),
      gartenkopf: getComputedStyle(gartenkopf),
      statusband: getComputedStyle(statusband),
      gegnerliste: getComputedStyle(gegnerliste),
      eigeneReihe: getComputedStyle(eigeneReihe),
    }
    const topBoxes = topkarten.map((karte) => karte.getBoundingClientRect().toJSON())
    return {
      rahmen: rahmen.getBoundingClientRect().toJSON(),
      gartenkopf: gartenkopf.getBoundingClientRect().toJSON(),
      waldstein: waldstein.getBoundingClientRect().toJSON(),
      handkarte: { ...handBox.toJSON(), hit: Boolean(document.elementFromPoint(handCenter.x, handCenter.y)?.closest('.handkarte__button--karte')) },
      rahmenScrollt: rahmen.scrollHeight > rahmen.clientHeight + 2,
      rahmenOverflow: styles.rahmen.overflow,
      gartenkopfBackground: styles.gartenkopf.backgroundColor,
      gartenkopfShadow: styles.gartenkopf.boxShadow,
      statusbandDisplay: styles.statusband.display,
      gegnerlisteDisplay: styles.gegnerliste.display,
      eigeneReiheDisplay: styles.eigeneReihe.display,
      topBoxes,
    }
  })

  if (daten.rahmen.height > 125 || daten.gartenkopf.height > 170 || (daten.rahmenOverflow !== 'visible' && daten.rahmenScrollt) || daten.rahmenOverflow !== 'visible') {
    throw new Error(`M1bz Gegner-HUD: oberer Rahmen bleibt scrollendes Panel (${JSON.stringify({ rahmen: metric(daten.rahmen), gartenkopf: metric(daten.gartenkopf), rahmenScrollt: daten.rahmenScrollt, overflow: daten.rahmenOverflow })})`)
  }
  if (daten.statusbandDisplay !== 'none' || daten.gegnerlisteDisplay !== 'none' || daten.eigeneReiheDisplay !== 'none') {
    throw new Error(`M1bz Gegner-HUD: Listen-/Statusreste dominieren noch (${JSON.stringify({ statusband: daten.statusbandDisplay, gegnerliste: daten.gegnerlisteDisplay, eigeneReihe: daten.eigeneReiheDisplay })})`)
  }
  if (daten.gartenkopfShadow !== 'none' || daten.gartenkopfBackground !== 'rgba(0, 0, 0, 0)') {
    throw new Error(`M1bz Gegner-HUD: Gartenkopf ist noch eine Panelkarte (${JSON.stringify({ shadow: daten.gartenkopfShadow, background: daten.gartenkopfBackground })})`)
  }
  if (daten.topBoxes.length < 3 || daten.topBoxes.some((box) => box.width < 60 || box.height < 78 || box.y > daten.waldstein.y)) {
    throw new Error(`M1bz Gegner-HUD: Top-Laubkarten wirken nicht wie Stitch-Gegnerhand (${JSON.stringify(daten.topBoxes.map(metric))})`)
  }
  if (daten.waldstein.y < daten.rahmen.bottom - 2) {
    throw new Error(`M1bz Gegner-HUD: Waldstein schiebt sich in das Gegner-HUD (${JSON.stringify({ rahmen: metric(daten.rahmen), waldstein: metric(daten.waldstein) })})`)
  }
  if (daten.handkarte.bottom > 900 || !daten.handkarte.hit) {
    throw new Error(`M1bz Gegner-HUD: Handkarte nach HUD-Verdichtung nicht klickbar (${JSON.stringify(metric(daten.handkarte))})`)
  }
  await pruefeGrubenAusnahme(browser)
  if (consoleErrors.length || pageErrors.length) throw new Error(`M1bz Gegner-HUD: Browserfehler ${JSON.stringify({ consoleErrors, pageErrors })}`)
  console.log(`M1bz Gegner-HUD: Rahmen ${Math.round(daten.rahmen.height)}px, Gartenkopf ${Math.round(daten.gartenkopf.height)}px, ${daten.topBoxes.length} Top-Laubkarten, Waldstein ab ${Math.round(daten.waldstein.y)}px.`)
} finally {
  await context.close()
  await browser.close()
}
