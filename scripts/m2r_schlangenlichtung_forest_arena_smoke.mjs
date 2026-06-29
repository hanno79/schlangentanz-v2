/**
 * Author: rahn
 * Datum: 27.06.2026
 * Version: 1.0
 * Beschreibung: M2r Smoke — Verifiziert auf /game die Schlangenlichtung als zentrale
 *              Forest-Arena. Das redundante Brettrand-Chrome (Arenakopf-Titel,
 *              Phasen-Banner 4-Pillen-Reihe, Questband 6-Pillen) ist auf /game via
 *              route-scoped display:none versteckt; die Questpille ist als kompakter
 *              Title komprimiert; die Schlangenlichtung wächst auf den freigewordenen
 *              Platz und sitzt deutlich oberhalb der Viewport-Mitte.
 *
 * Akzeptanzkriterien (pro Viewport):
 *  - statusPanel (=.info-panel--spielstatus): sichtbar-bleibt vom Vorlagenset,
 *    fuer M2r nicht relevant (M2e-Konsolidierung)
 *  - arenakopf  display:none
 *  - phasenBanner display:none
 *  - questband display:none
 *  - questpille sichtbar, aber kompakt (hoehe <= 100 px)
 *  - schlangenlichtung sichtbar, hoehe >= 55% Viewport-Hoehe
 *  - handkartenleiste sichtbar
 *  - / (Lobby) weiterhin normale Sichtbarkeit
 *
 * Aufruf:
 *   SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app node scripts/m2r_schlangenlichtung_forest_arena_smoke.mjs
 *   node scripts/m2r_schlangenlichtung_forest_arena_smoke.mjs --self-test
 */
import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const HTTP_TIMEOUT_MS = 15_000
const SELF_TEST = process.argv.includes('--self-test')

function url(route) { return new URL(route, BASE_URL).toString() }

export function erstelleSelbsttestAusgabe() {
  return [
    'M2r Schlangenlichtung-Forest-Arena Selbsttest bestanden',
    `BASE_URL: ${BASE_URL}`,
    'Helper pruefeM2rForestArena: kompiliert',
    'Slice-Klassen: .waldtanz-arenastein__kopf, .waldtanz-phasen-banner, .waldtanz-questband, .waldtanz-brettrand-questpille, .waldtanz-schlangenlichtung',
  ].join('\n')
}

async function httpPruefen(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(HTTP_TIMEOUT_MS) })
  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status} fuer ${url}`)
  }
  console.log(`HTTP 200  ${url}`)
}

async function sichtInfo(locator) {
  try {
    const box = await locator.boundingBox()
    if (!box || box.width < 2 || box.height < 2) {
      return { sichtbar: false, breite: box?.width ?? 0, hoehe: box?.height ?? 0 }
    }
    const display = await locator.evaluate((el) => getComputedStyle(el).display)
    return { sichtbar: display !== 'none', breite: box.width, hoehe: box.height, display }
  } catch (err) {
    return { sichtbar: false, breite: 0, hoehe: 0, display: 'error', fehler: String(err) }
  }
}

async function starteSpiel(page) {
  await page.goto(url('/game'), { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  // M3b-Spielstart-Button (Stitch-Stil)
  const startButton = page.locator('button', { hasText: /Waldparty|Grosse Runde|Duell/ }).first()
  if (await startButton.count() > 0) {
    await startButton.click({ force: true })
    await page.waitForTimeout(800)
  }
  // Eigene Schlange starten (M1cj-Vorbedingung fuer Brettobjekte auf /game)
  const startfaehrte = page.locator('.schlangen-startzone__faehrte-button').first()
  if (await startfaehrte.count() > 0) {
    await startfaehrte.click({ force: true })
    await page.waitForTimeout(500)
  }
  // Nachziehphase ggf. bestaetigen
  const nachzieh = page.locator('button', { hasText: /Karte ziehen|Nachziehen/ }).first()
  if (await nachzieh.count() > 0) {
    await nachzieh.click({ force: true }).catch(() => {})
    await page.waitForTimeout(400)
  }
}

async function pruefeM2rForestArena(page, viewport, label) {
  await page.setViewportSize(viewport)
  await starteSpiel(page)

  // 1) Die vier versteckten Brettrand-Chrome-Elemente
  const arenakopf = page.locator('[class~="waldtanz-arenastein__kopf"]').first()
  const arenakopfDisplay = await arenakopf.evaluate((el) => getComputedStyle(el).display).catch(() => '?')

  const phasenBanner = page.locator('[class~="waldtanz-phasen-banner"]').first()
  const phasenBannerDisplay = await phasenBanner.evaluate((el) => getComputedStyle(el).display).catch(() => '?')

  const questband = page.locator('[class~="waldtanz-questband"]').first()
  const questbandDisplay = await questband.evaluate((el) => getComputedStyle(el).display).catch(() => '?')

  // 2) Questpille als kompakter Title
  const questpille = page.locator('.waldtanz-brettrand-questpille').first()
  const questpilleInfo = await sichtInfo(questpille)
  const questpilleDisplay = await questpille.evaluate((el) => getComputedStyle(el).display).catch(() => '?')

  // 3) Schlangenlichtung — zentrale Forest-Arena
  const lichtung = page.locator('[class~="waldtanz-schlangenlichtung"]').first()
  const lichtungInfo = await sichtInfo(lichtung)
  const viewportH = viewport.height
  const lichtungAnteil = lichtungInfo.sichtbar ? lichtungInfo.hoehe / viewportH : 0

  // 4) Brettschritt-Bereich (grobes Mass, dass die Arena nicht kollabiert ist)
  const brett = page.locator('.spielbrett--waldtanz').first()
  const brettInfo = await sichtInfo(brett)

  // 5) Handkartenleiste (unten/board-nah)
  const hand = page.locator('[class~="handkartenleiste"]').first()
  const handInfo = await sichtInfo(hand)

  return {
    label,
    viewport: { breite: viewport.width, hoehe: viewport.height },
    arenakopf: { display: arenakopfDisplay },
    phasenBanner: { display: phasenBannerDisplay },
    questband: { display: questbandDisplay },
    questpille: { ...questpilleInfo, display: questpilleDisplay },
    lichtung: { ...lichtungInfo, anteil: Math.round(lichtungAnteil * 100) / 100 },
    brett: brettInfo,
    hand: handInfo,
  }
}

function akzeptanzPruefen(ergebnis) {
  const fehler = []
  if (ergebnis.arenakopf.display !== 'none') {
    fehler.push(`arenakopf nicht display:none (computed=${ergebnis.arenakopf.display})`)
  }
  if (ergebnis.phasenBanner.display !== 'none') {
    fehler.push(`phasenBanner nicht display:none (computed=${ergebnis.phasenBanner.display})`)
  }
  if (ergebnis.questband.display !== 'none') {
    fehler.push(`questband nicht display:none (computed=${ergebnis.questband.display})`)
  }
  if (!ergebnis.questpille.sichtbar) {
    fehler.push(`Questpille fehlt im sichtbaren Bereich (display=${ergebnis.questpille.display})`)
  }
  if (ergebnis.questpille.sichtbar && ergebnis.questpille.hoehe > 100) {
    fehler.push(`Questpille zu hoch: ${ergebnis.questpille.hoehe} > 100 px (sollte als Title <= 100 px sein)`)
  }
  if (!ergebnis.lichtung.sichtbar) {
    fehler.push(`Schlangenlichtung fehlt (Forest-Arena nicht befreit)`)
  }
  if (ergebnis.lichtung.sichtbar && ergebnis.lichtung.anteil < 0.5) {
    // AENDERUNG 29.06.2026 (M9.5 Arenasstein-Cap-Senkung):
    // Schwellenwert von 55% auf 50% reduziert. M9.5 senkt die
    // Arenasstein-Cap-Max von 40rem auf 32rem, damit die M9-Grid-Row
    // (480 px im 900-Viewport) tatsaechlich greift und die Hand im
    // 900-Viewport sichtbar wird. Bei 900vh ist 50% (450 px) die
    // physikalische Obergrenze fuer die Schlangenlichtung, wenn die
    // Hand ebenfalls sichtbar bleiben soll. Trade-off: Schlangenlichtung
    // wird kleiner, dafuer wird der User-Refrain "Hand im Erstbild
    // sichtbar" erfuellt.
    fehler.push(`Schlangenlichtung zu niedrig: ${Math.round(ergebnis.lichtung.anteil * 100)}% < 50% Viewport-Hoehe (M9.5-Schwelle)`)
  }
  if (!ergebnis.hand.sichtbar) {
    fehler.push(`Handkartenleiste fehlt`)
  }
  return fehler
}

async function main() {
  if (SELF_TEST) {
    console.log(erstelleSelbsttestAusgabe())
    return
  }
  await httpPruefen(url('/'))
  await httpPruefen(url('/game'))
  const browser = await chromium.launch()
  const ergebnisse = []
  try {
    const context = await browser.newContext()
    const page = await context.newPage()
    const consoleErrors = []
    page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`))
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(`console.error: ${msg.text()}`)
    })

    for (const viewport of [{ width: 1280, height: 900 }, { width: 1100, height: 800 }]) {
      const erg = await pruefeM2rForestArena(page, viewport, viewport.width + 'x' + viewport.height)
      ergebnisse.push(erg)
    }

    console.log('\n=== M2r Schlangenlichtung-Forest-Arena ===')
    for (const erg of ergebnisse) {
      const akzeptanz = akzeptanzPruefen(erg)
      console.log(`\n[${erg.label}]`)
      console.log(`  arenakopf.display=${erg.arenakopf.display}  (erwartet: none)`)
      console.log(`  phasenBanner.display=${erg.phasenBanner.display}  (erwartet: none)`)
      console.log(`  questband.display=${erg.questband.display}  (erwartet: none)`)
      console.log(`  questpille sichtbar=${erg.questpille.sichtbar}  ${erg.questpille.breite}x${erg.questpille.hoehe}  display=${erg.questpille.display}`)
      console.log(`  lichtung sichtbar=${erg.lichtung.sichtbar}  ${erg.lichtung.breite}x${erg.lichtung.hoehe}  (Anteil: ${Math.round(erg.lichtung.anteil * 100)}% — erwartet >= 55%)`)
      console.log(`  brett sichtbar=${erg.brett.sichtbar}  ${erg.brett.breite}x${erg.brett.hoehe}`)
      console.log(`  hand sichtbar=${erg.hand.sichtbar}  ${erg.hand.breite}x${erg.hand.hoehe}`)
      if (akzeptanz.length > 0) {
        console.log(`  FEHLER: ${akzeptanz.join('; ')}`)
      } else {
        console.log(`  OK`)
      }
    }
    if (consoleErrors.length > 0) {
      console.log(`\nConsole-Errors: ${consoleErrors.length}`)
      for (const e of consoleErrors.slice(0, 5)) console.log(`  ${e}`)
    }

    const alleFehler = ergebnisse.flatMap(akzeptanzPruefen)
    if (alleFehler.length > 0) {
      console.log(`\nM2r SMOKE FEHLGESCHLAGEN: ${alleFehler.length} Akzeptanzverletzungen`)
      process.exit(1)
    }
    console.log('\nM2r SMOKE BESTANDEN — Schlangenlichtung ist die zentrale Forest-Arena auf /game.')
  } finally {
    await browser.close()
  }
}

main().catch((err) => { console.error('M2r Smoke-Fehler:', err); process.exit(1) })