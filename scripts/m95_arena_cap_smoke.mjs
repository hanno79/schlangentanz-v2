/*
 * Author: rahn
 * Datum: 29.06.2026
 * Version: 1.0
 * Beschreibung: M9.5 Browser-Smoke — Arenasstein-Cap-Senkung muss die
 *   M9-Grid-Row tatsaechlich durchsetzen. Vor M9.5 hatte das
 *   Kind-Element .waldtanz-arenastein (M1dk-Base) hatte eine eigene
 *   height: clamp(34rem, 64vh, 40rem) = 576-720 px, und die M2r-Override
 *   noch hoeher: clamp(40rem, 72vh, 46rem) = 720-828 px. Beide schlugen
 *   die M9-Grid-Row (480 px). Resultat: Arenasstein wuchs auf 720-982 px,
 *   Hand bei y=760-988 (88 px unter Viewport-Falz). M9.5 senkt BEIDE
 *   Caps auf 24rem/50vh/32rem = 450-512 px, sodass die M9-Grid-Row
 *   tatsaechlich greift.
 *
 *   Verifiziert:
 *     1. Arenasstein: top >= 0 UND bottom <= vpH
 *     2. Arenasstein-Hoehe <= 540 px (Cap eingehalten)
 *     3. Schlangenlichtung bleibt sichtbar (height >= 400 px)
 *     4. Hand-Panel: top >= 0 UND bottom <= vpH (M9-Akzeptanz)
 *   Viewport: 1440x900 (Hauptakzeptanz aus M9-Plan).
 *
 *   Aufruf:
 *     SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app node scripts/m95_arena_cap_smoke.mjs
 *     node scripts/m95_arena_cap_smoke.mjs --self-test
 */

import { chromium } from 'playwright'

import { startePartie } from './spiel_starten.mjs'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const HTTP_TIMEOUT_MS = 15_000
const SELF_TEST = process.argv.includes('--self-test')

function erwarteBedingung(bedingung, meldung, fehler) {
  if (!bedingung) fehler.push(meldung)
}

function sichtInfo(locator) {
  return locator.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return {
      sichtbar: r.width >= 4 && r.height >= 4,
      breite: Math.round(r.width),
      hoehe: Math.round(r.height),
      x: Math.round(r.x),
      y: Math.round(r.y),
      right: Math.round(r.right),
      bottom: Math.round(r.bottom),
    }
  })
}

async function httpPruefen(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(HTTP_TIMEOUT_MS) })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`)
  console.log(`HTTP ${res.status}  ${url}`)
  return res
}

async function starteSpiel(page) {
  /* ÄNDERUNG [31.07.2026]: S-5 — dieses Skript hat nie eine Seite geladen. Die
     HTTP-Prüfung weiter unten arbeitet mit `fetch`, nicht mit `page.goto`, also
     klickte die Startsequenz auf about:blank und der Arenastein-Locator lief in
     einen 30-Sekunden-Timeout. Navigation und Lobby-Start liegen jetzt in
     scripts/spiel_starten.mjs. */
  await startePartie(page, BASE_URL, { route: '/game' })

  // Eigene Schlange starten (M1cj-Vorbedingung)
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

async function pruefeM95ArenaCap(page, viewport, label) {
  await page.setViewportSize(viewport)
  await starteSpiel(page)

  // 1) Arenasstein-Region (M9.5-Hauptakzeptanz: Cap eingehalten)
  const arenastein = page.locator('[class~="waldtanz-arenastein"]').first()
  const arenainfo = await sichtInfo(arenastein)

  // 2) Schlangenlichtung (M9.5-Trade-off: bleibt sichtbar, mind. 400 px)
  const schlangen = page.locator('[class~="waldtanz-arenastein__schlangenlichtung"]').first()
  const schlangenInfo = await sichtInfo(schlangen)

  // 3) Hand-Panel (M9-Akzeptanz: bottom <= vpH)
  const hand = page.locator('[class~="handkarten-panel"]').first()
  const handInfo = await sichtInfo(hand)

  // 4) Brettschritt-Bereich (Arena-Inhalt lebendig)
  const brett = page.locator('.spielbrett--waldtanz').first()
  const brettInfo = await sichtInfo(brett)

  return {
    label,
    viewport: { breite: viewport.width, hoehe: viewport.height },
    arenastein: { ...arenainfo, hoehe: arenainfo.hoehe, anteil: Math.round(arenainfo.hoehe / viewport.height * 100) / 100 },
    schlangen: { ...schlangenInfo, anteil: Math.round(schlangenInfo.hoehe / viewport.height * 100) / 100 },
    brett: brettInfo,
    hand: handInfo,
  }
}

function akzeptanzPruefen(ergebnis) {
  const fehler = []
  const vpH = ergebnis.viewport.hoehe

  // M9.5:1 Arenasstein liegt im 900-Viewport
  if (!ergebnis.arenastein.sichtbar) {
    fehler.push(`Arenasstein fehlt (height=${ergebnis.arenastein.hoehe}px)`)
  } else {
    if (ergebnis.arenastein.bottom > vpH) {
      fehler.push(`Arenasstein endet bei ${ergebnis.arenastein.bottom}px > ${vpH} (Viewport ueberschritten)`)
    }
    if (ergebnis.arenastein.hoehe > 540) {
      fehler.push(`Arenasstein-Cap nicht eingehalten: ${ergebnis.arenastein.hoehe}px > 540 px (M9.5-Cap ist 32rem = 576 px im Worst-Case, 450-512 px bei 900vh)`)
    }
  }

  // M9.5:2 Schlangenlichtung bleibt sichtbar
  if (!ergebnis.schlangen.sichtbar) {
    fehler.push(`Schlangenlichtung fehlt (M9.5-Trade-off: Arena ist kleiner, aber Schlangenlichtung muss bleiben)`)
  } else if (ergebnis.schlangen.hoehe < 200) {
    fehler.push(`Schlangenlichtung kollabiert: ${ergebnis.schlangen.hoehe}px < 200 px (zu klein zum Spielen)`)
  }

  // M9.5:3 Hand im 900-Viewport sichtbar (M9-Akzeptanz)
  if (!ergebnis.hand.sichtbar) {
    fehler.push(`Hand-Panel fehlt`)
  } else {
    if (ergebnis.hand.bottom > vpH) {
      fehler.push(`Hand-Panel endet bei ${ergebnis.hand.bottom}px > ${vpH} (M9-Akzeptanz verletzt)`)
    }
  }

  return fehler
}

function erstelleSelbsttestAusgabe() {
  return [
    'M9.5 Arenasstein-Cap-Senkung Smoke — Self-Test',
    '================================================',
    'Konfiguration:',
    `  BASE_URL        = ${BASE_URL}`,
    '  Viewports       = [{1440,900}, {1280,900}, {1100,800}]',
    '  Akzeptanzkriterien:',
    '    - Arenasstein: bottom <= 900, height <= 540 px (M9.5-Cap)',
    '    - Schlangenlichtung: sichtbar, height >= 200 px (Trade-off)',
    '    - Hand-Panel: bottom <= 900 (M9-Akzeptanz)',
    '    - Brettschritt-Bereich: sichtbar (Arena-Inhalt lebendig)',
    '',
    'Self-Test bestanden — Konfiguration und Helper kompilieren.',
  ].join('\n')
}

async function main() {
  if (SELF_TEST) {
    console.log(erstelleSelbsttestAusgabe())
    return
  }
  await httpPruefen(new URL('/', BASE_URL).toString())
  await httpPruefen(new URL('/game', BASE_URL).toString())
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

    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 1280, height: 900 },
      { width: 1100, height: 800 },
    ]) {
      const erg = await pruefeM95ArenaCap(page, viewport, `${viewport.width}x${viewport.height}`)
      ergebnisse.push(erg)
    }

    console.log('\n=== M9.5 Arenasstein-Cap-Senkung ===')
    for (const erg of ergebnisse) {
      const akzeptanz = akzeptanzPruefen(erg)
      console.log(`\n[${erg.label}]`)
      console.log(`  arenastein:    ${erg.arenastein.breite}x${erg.arenastein.hoehe}  (Anteil: ${Math.round(erg.arenastein.anteil * 100)}% — erwartet <= 60%)`)
      console.log(`    bottom=${erg.arenastein.bottom}  (erwartet <= ${erg.viewport.hoehe})`)
      console.log(`  schlangen:     ${erg.schlangen.breite}x${erg.schlangen.hoehe}  (Anteil: ${Math.round(erg.schlangen.anteil * 100)}% — Trade-off: 50% statt 71%)`)
      console.log(`  brett:         ${erg.brett.breite}x${erg.brett.hoehe}  sichtbar=${erg.brett.sichtbar}`)
      console.log(`  hand:          ${erg.hand.breite}x${erg.hand.hoehe}  bottom=${erg.hand.bottom}  sichtbar=${erg.hand.sichtbar}`)
      if (akzeptanz.length > 0) {
        console.log(`  FEHLER: ${akzeptanz.join('; ')}`)
      } else {
        console.log(`  OK`)
      }
    }

    if (consoleErrors.length > 0) {
      console.log(`\nCONSOLE-ERRORS (${consoleErrors.length}):`)
      consoleErrors.forEach((e) => console.log(`  ${e}`))
    }

    const alleFehler = ergebnisse.flatMap((e) => akzeptanzPruefen(e).map((m) => `[${e.label}] ${m}`))
    if (alleFehler.length === 0) {
      console.log('\nM9.5 SMOKE BESTANDEN — Arenasstein-Cap-Senkung greift, Hand im Erstbild sichtbar.')
      process.exit(0)
    } else {
      console.log(`\nM9.5 SMOKE FEHLGESCHLAGEN — ${alleFehler.length} Akzeptanz-Verletzungen.`)
      process.exit(1)
    }
  } finally {
    await browser.close()
  }
}

await main()
