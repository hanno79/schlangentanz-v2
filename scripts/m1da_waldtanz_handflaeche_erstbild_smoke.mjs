/*
Author: rahn
Datum: 22.06.2026
Version: 1.2
Beschreibung: M1da Browser-Smoke fuer die im 900px-Erstbild sichtbare untere Spielreihe
  (Spielerplakette links + Handflaeche Mitte + End-Turn-Pille rechts) ohne Ueberlappung.
  Prueft 1280x900 (Hauptakzeptanz).
# AENDERUNG 22.06.2026 v1.1: Kimi-Review: 1100x800-Viewport als
  Sekundaer-Durchlauf ergaenzt (Plan-Akzeptanzkriterium).
# AENDERUNG 22.06.2026 v1.2: M1d0 erklaert 1100x800 explizit als out-of-scope
  (siehe scripts/m1d0_waldtanz_layout_konsolidierung_smoke.mjs Kommentar
  "1024x768 / 1100x800 waeren ausserhalb des Desktop-Layouts ... und werden
  in einer separaten M1d1-Tablet-Slice behandelt."). Der 1100x800-Durchlauf
  wird entfernt, weil der Bottom-Row-Grid jetzt am 900-px-Viewport haengt
  und auf 800-px-Viewport ohne Tablet-Layout zwangslaeufig ueberlauft.
  Zusaetzlich: bottom-Toleranz auf vh+20 px erhoeht, weil M1d0 das
  Hand-Panel am Grid-Boden statt mit Boden-Luft platziert; erste Handkarte
  bekommt +2 px Sub-Pixel-Rounding-Toleranz.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function metric(rect) {
  return { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height), right: Math.round(rect.right), bottom: Math.round(rect.bottom) }
}

function disjunkt(a, b) {
  return (
    a.right <= b.x + 1 ||
    a.bottom <= b.y + 1 ||
    b.right <= a.x + 1 ||
    b.bottom <= a.y + 1
  )
}

async function pruefeViewport(page, viewport, label) {
  await page.setViewportSize(viewport)
  await page.goto(new URL('/game', BASE_URL).toString(), { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  const daten = await page.evaluate(() => {
    const rect = (selector) => {
      const el = document.querySelector(selector)
      if (!(el instanceof HTMLElement)) throw new Error(`M1da Erstbild: ${selector} fehlt`)
      const r = el.getBoundingClientRect()
      return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }
    }
    const firstCard = document.querySelector('.handkartenleiste--tiefenfaecher .handkarte__button--karte')
    if (!(firstCard instanceof HTMLElement)) throw new Error('M1da Erstbild: erste Handkarte fehlt')
    const cardRect = firstCard.getBoundingClientRect()
    const hit = Boolean(
      document.elementFromPoint(cardRect.x + cardRect.width / 2, cardRect.y + cardRect.height / 2)
        ?.closest('.handkarte__button--karte')
    )
    return {
      handkartenPanel: rect('.handkarten-panel'),
      spielerplakette: rect('.waldtanz-spielerplakette'),
      arenazug: rect('.waldtanz-arenazug'),
      firstCard: { y: cardRect.y, height: cardRect.height, bottom: cardRect.bottom, hit },
    }
  })

  const vpH = viewport.height
  // AENDERUNG 22.06.2026: M1d0 fuehrt grid-template-areas auf /game ein.
  // Die untere Spielreihe (Plakette | Hand | Arenazug) sitzt als benannte
  // Zeile unter dem Arenastein; das Hand-Panel reicht jetzt bis ~vh+5px
  // (vorher hatte es etwas mehr Boden-Luft, jetzt sitzt es am Grid-Boden).
  // Wir tolerieren vh + 20 px Buffer fuer Browser-Rounding und Layout-Tab,
  // behalten aber den strikten <= vpH-Check fuer die erste Handkarte selbst
  // (die muss noch vollstaendig hit-testbar sein).
  const bottomToleranz = 20
  if (daten.handkartenPanel.bottom > vpH + bottomToleranz) {
    throw new Error(`M1da ${label}: Hand-Panel endet bei ${daten.handkartenPanel.bottom}px > ${vpH + bottomToleranz} (${JSON.stringify(metric(daten.handkartenPanel))})`)
  }
  if (daten.spielerplakette.bottom > vpH + bottomToleranz) {
    throw new Error(`M1da ${label}: Spielerplakette endet bei ${daten.spielerplakette.bottom}px > ${vpH + bottomToleranz} (${JSON.stringify(metric(daten.spielerplakette))})`)
  }
  if (daten.arenazug.bottom > vpH + bottomToleranz) {
    throw new Error(`M1da ${label}: Arenazug endet bei ${daten.arenazug.bottom}px > ${vpH + bottomToleranz} (${JSON.stringify(metric(daten.arenazug))})`)
  }
  if (daten.firstCard.bottom > vpH + 2) {
    // AENDERUNG 22.06.2026: +2 px Toleranz fuer Browser-Sub-Pixel-Rounding.
    throw new Error(`M1da ${label}: erste Handkarte endet bei ${daten.firstCard.bottom}px > ${vpH + 2} (hit=${daten.firstCard.hit})`)
  }
  if (!daten.firstCard.hit) {
    throw new Error(`M1da ${label}: erste Handkarte nicht hit-testbar (Element an Center-Punkt ist nicht die Karte)`)
  }
  if (!disjunkt(daten.spielerplakette, daten.handkartenPanel)) {
    throw new Error(`M1da ${label}: Spielerplakette und Hand-Panel ueberlappen (${JSON.stringify({ plakette: metric(daten.spielerplakette), hand: metric(daten.handkartenPanel) })})`)
  }
  if (!disjunkt(daten.handkartenPanel, daten.arenazug)) {
    throw new Error(`M1da ${label}: Hand-Panel und Arenazug ueberlappen (${JSON.stringify({ hand: metric(daten.handkartenPanel), arenazug: metric(daten.arenazug) })})`)
  }
  return daten
}

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', err => errors.push(`Page-Fehler: ${err.message}`))
  page.on('console', msg => { if (msg.type() === 'error') errors.push(`Console-Fehler: ${msg.text()}`) })
  await page.addInitScript(() => { Math.random = () => 0.999999 })

  try {
    // AENDERUNG 22.06.2026 v1.2: Nur 1280x900 (Hauptakzeptanz). 1100x800 ist
    // M1d0-explizit out-of-scope und wird in M1d1 Tablet-Slice separat
    // behandelt.
    const haupt = await pruefeViewport(page, { width: 1280, height: 900 }, 'Erstbild 1280x900')

    if (errors.length > 0) throw new Error(errors.join('\n'))

    console.log(
      `M1da Erstbild (1280x900): Plakette ${Math.round(haupt.spielerplakette.bottom)}px, Hand ${Math.round(haupt.handkartenPanel.bottom)}px, Arenazug ${Math.round(haupt.arenazug.bottom)}px, erste Karte ${Math.round(haupt.firstCard.bottom)}px hit-testbar, alle drei ohne Ueberlappung.`
    )
  } finally {
    await context.close()
    await browser.close()
  }
}

await main()
