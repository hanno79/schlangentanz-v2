/*
 * Author: rahn
 * Datum: 26.06.2026
 * Version: 1.0
 * Beschreibung: M1ds Production-Smoke fuer den sichtbaren Stitch-Spielmoment
 *              der Waldtanz-Handkarten auf /game.
 *              Verifiziert auf 1280x900 + 1100x800:
 *              - "Karte spielen →"-Tooltip sitzt absolut positioniert
 *                ueber der Karte (position: absolute, top: -X.Xrem)
 *              - Beim echten Hover wird der Tooltip sichtbar
 *                (opacity 0 → opacity 1, transform translateY)
 *              - Beim Klick auf eine Handkarte rendert sich das
 *                "BEREIT"-Badge an der ausgewaehlten Karte
 *              - BEREIT-Badge ist sichtbar (display !== 'none', bbox >= 4px)
 *              - Hover-Lift der Handkarte (transform: translateY(-2.5rem) scale(1.12))
 *              - 0 console/page-Errors
 *              Regression-Check: Handkarten-UL bleibt erhalten, data-hat-ausgewaehlt
 *              Toggle funktioniert (M1db-Vertrag bleibt)
 *
 * Verwendung:
 *   node scripts/m1ds_waldtanz_spielkarten_hebdichhoch_smoke.mjs                  # live gegen SMOKE_BASE_URL
 *   node scripts/m1ds_waldtanz_spielkarten_hebdichhoch_smoke.mjs --self-test     # Offline-Konfig-Check
 */
import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const HTTP_TIMEOUT_MS = 15_000
const SELF_TEST = process.argv.includes('--self-test')

export function erstelleSelbsttestAusgabe() {
  return [
    'M1ds Spielkarten-Heb-Dich-Hoch Selbsttest bestanden',
    `BASE_URL: ${BASE_URL}`,
  ].join('\n')
}

async function httpPruefen(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(HTTP_TIMEOUT_MS) })
  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status} fuer ${url}`)
  }
  console.log(`HTTP 200  ${url}`)
}

async function pruefeSpielkartenHebDichHoch(page, viewport, label) {
  await page.setViewportSize(viewport)
  await page.goto(new URL('/game', BASE_URL).toString(), { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  // Phase 0: Initialer DOM-Check — Tooltip vorhanden, BEREIT-Badge NICHT vorhanden
  const phase0 = await page.evaluate(() => {
    const ul = document.querySelector('[class~="handkartenleiste"]')
    if (!(ul instanceof HTMLElement)) throw new Error('M1ds: Handkartenleiste fehlt')
    const buttons = Array.from(ul.querySelectorAll('[class~="handkarte__button--karte"]'))
    if (buttons.length === 0) throw new Error('M1ds: keine Handkarten vorhanden')
    const first = buttons[0]
    if (!(first instanceof HTMLElement)) throw new Error('M1ds: erste Karte kein HTMLElement')

    const hinweis = first.querySelector('.handkarte__spielhinweis')
    const hinweisCs = hinweis instanceof HTMLElement ? getComputedStyle(hinweis) : null

    const badgeVorhanden = first.querySelector('.handkarte__bereit-badge')

    return {
      cardCount: buttons.length,
      firstCardLabel: first.getAttribute('aria-label') ?? '',
      firstCardAriaPressed: first.getAttribute('aria-pressed') ?? '',
      hinweisVorhanden: !!hinweis,
      hinweisText: hinweis?.textContent?.trim() ?? '',
      hinweisPosition: hinweisCs?.position ?? '',
      hinweisTop: hinweisCs?.top ?? '',
      hinweisBorderRadius: hinweisCs?.borderRadius ?? '',
      hinweisOpacity: hinweisCs?.opacity ?? '',
      badgeVorhanden: !!badgeVorhanden,
    }
  })
  console.log(`M1ds ${label} Phase 0:`, JSON.stringify(phase0, null, 2))

  if (!phase0.hinweisVorhanden) {
    throw new Error(`M1ds ${label}: handkarte__spielhinweis-Tooltip fehlt im DOM`)
  }
  if (phase0.hinweisText !== 'Karte spielen →') {
    throw new Error(`M1ds ${label}: Tooltip-Text "${phase0.hinweisText}" statt "Karte spielen →"`)
  }
  if (phase0.hinweisPosition !== 'absolute') {
    throw new Error(`M1ds ${label}: Tooltip position "${phase0.hinweisPosition}" statt "absolute"`)
  }
  if (!/^-\d/.test(phase0.hinweisTop)) {
    throw new Error(`M1ds ${label}: Tooltip top "${phase0.hinweisTop}" ist nicht negativ (sollte ueber der Karte sitzen)`)
  }
  if (phase0.badgeVorhanden) {
    throw new Error(`M1ds ${label}: BEREIT-Badge schon VOR Klick sichtbar — soll nur an ausgewaehlter Karte rendern`)
  }

  // Phase 1: Hover auf erste Karte (echter Browser-Hover via .hover())
  const firstCard = page.locator('[class~="handkarte__button--karte"]').first()
  await firstCard.hover()
  await page.waitForTimeout(300) // transition 160ms

  const phase1 = await page.evaluate(() => {
    const ul = document.querySelector('[class~="handkartenleiste"]')
    if (!(ul instanceof HTMLElement)) throw new Error('M1ds: Handkartenleiste fehlt (Phase 1)')
    const buttons = Array.from(ul.querySelectorAll('[class~="handkarte__button--karte"]'))
    const first = buttons[0]
    if (!(first instanceof HTMLElement)) throw new Error('M1ds: erste Karte kein HTMLElement (Phase 1)')

    const hinweis = first.querySelector('.handkarte__spielhinweis')
    const hinweisCs = hinweis instanceof HTMLElement ? getComputedStyle(hinweis) : null
    const cardCs = getComputedStyle(first)

    const hinweisR = hinweis instanceof HTMLElement ? hinweis.getBoundingClientRect() : null

    return {
      cardTransform: cardCs.transform,
      cardBoxShadow: cardCs.boxShadow.substring(0, 60),
      hinweisOpacity: hinweisCs?.opacity ?? '',
      hinweisTransform: hinweisCs?.transform ?? '',
      hinweisPointerEvents: hinweisCs?.pointerEvents ?? '',
      hinweisBboxWidth: hinweisR?.width ?? 0,
      hinweisBboxHeight: hinweisR?.height ?? 0,
    }
  })
  console.log(`M1ds ${label} Phase 1 (Hover):`, JSON.stringify(phase1, null, 2))

  if (phase1.hinweisOpacity !== '1') {
    throw new Error(`M1ds ${label}: Tooltip-Opacity nach Hover "${phase1.hinweisOpacity}" statt "1"`)
  }
  if (phase1.hinweisPointerEvents !== 'none') {
    throw new Error(`M1ds ${label}: Tooltip pointer-events "${phase1.hinweisPointerEvents}" — soll "none" sein, damit Klick zur Karte durchgeht`)
  }
  if (phase1.hinweisBboxWidth < 4 || phase1.hinweisBboxHeight < 4) {
    throw new Error(`M1ds ${label}: Tooltip-Bbox zu klein ${phase1.hinweisBboxWidth}x${phase1.hinweisBboxHeight}px`)
  }
  // Hover-Lift: Card-Transform muss translateY-Komponente enthalten
  // jsdom kann matrix(1, 0, 0, 1, 0, -40) liefern (40px = 2.5rem bei 16px root)
  if (!/matrix\([^)]*,\s*0,\s*0,\s*1,\s*0,\s*-/.test(phase1.cardTransform) &&
      !/translate/.test(phase1.cardTransform)) {
    throw new Error(`M1ds ${label}: Card-Hover-Transform "${phase1.cardTransform}" enthaelt keine translateY-Komponente`)
  }

  // Phase 2: Klick auf erste Karte → ausgewaehlt → BEREIT-Badge sichtbar
  await firstCard.click()
  await page.waitForTimeout(300)

  const phase2 = await page.evaluate(() => {
    const ul = document.querySelector('[class~="handkartenleiste"]')
    if (!(ul instanceof HTMLElement)) throw new Error('M1ds: Handkartenleiste fehlt (Phase 2)')
    const buttons = Array.from(ul.querySelectorAll('[class~="handkarte__button--karte"]'))
    const first = buttons[0]
    if (!(first instanceof HTMLElement)) throw new Error('M1ds: erste Karte kein HTMLElement (Phase 2)')

    const badge = first.querySelector('.handkarte__bereit-badge')
    const badgeCs = badge instanceof HTMLElement ? getComputedStyle(badge) : null
    const badgeR = badge instanceof HTMLElement ? badge.getBoundingClientRect() : null
    const cardCs = getComputedStyle(first)
    const cardR = first.getBoundingClientRect()

    return {
      ariaPressed: first.getAttribute('aria-pressed') ?? '',
      hatAusgewaehlt: ul.getAttribute('data-hat-ausgewaehlt') ?? '',
      badgeVorhanden: !!badge,
      badgeText: badge?.textContent?.trim() ?? '',
      badgePosition: badgeCs?.position ?? '',
      badgeBottom: badgeCs?.bottom ?? '',
      badgeRight: badgeCs?.right ?? '',
      badgeBorderRadius: badgeCs?.borderRadius ?? '',
      badgeTransform: badgeCs?.transform ?? '',
      badgeBboxWidth: badgeR?.width ?? 0,
      badgeBboxHeight: badgeR?.height ?? 0,
      cardTransform: cardCs.transform,
      cardBboxTop: cardR.top,
      cardBboxBottom: cardR.bottom,
    }
  })
  console.log(`M1ds ${label} Phase 2 (Selected):`, JSON.stringify(phase2, null, 2))

  if (phase2.ariaPressed !== 'true') {
    throw new Error(`M1ds ${label}: Karte aria-pressed "${phase2.ariaPressed}" statt "true" nach Klick`)
  }
  if (phase2.hatAusgewaehlt !== 'true') {
    throw new Error(`M1ds ${label}: UL data-hat-ausgewaehlt "${phase2.hatAusgewaehlt}" statt "true"`)
  }
  if (!phase2.badgeVorhanden) {
    throw new Error(`M1ds ${label}: BEREIT-Badge fehlt nach Klick auf Handkarte`)
  }
  if (phase2.badgeText !== 'BEREIT') {
    throw new Error(`M1ds ${label}: Badge-Text "${phase2.badgeText}" statt "BEREIT"`)
  }
  if (phase2.badgePosition !== 'absolute') {
    throw new Error(`M1ds ${label}: Badge position "${phase2.badgePosition}" statt "absolute"`)
  }
  if (phase2.badgeBboxWidth < 4 || phase2.badgeBboxHeight < 4) {
    throw new Error(`M1ds ${label}: Badge-Bbox zu klein ${phase2.badgeBboxWidth}x${phase2.badgeBboxHeight}px`)
  }
  // BEREIT-Badge muss aus der Karte herausragen (negative bottom/right in CSS)
  // Visuelle Pruefung: badge.bottom (in CSS) ist negativ ODER transform hat rotate
  const badgeRagtHeraus =
    /^-/.test(phase2.badgeBottom) ||
    /^-/.test(phase2.badgeRight) ||
    /rotate|matrix/.test(phase2.badgeTransform)
  if (!badgeRagtHeraus) {
    throw new Error(`M1ds ${label}: Badge ragt nicht aus der Karte heraus — bottom="${phase2.badgeBottom}", right="${phase2.badgeRight}", transform="${phase2.badgeTransform}"`)
  }
}

async function main() {
  if (SELF_TEST) {
    console.log(erstelleSelbsttestAusgabe())
    return
  }

  console.log(`=== M1ds Spielkarten-Heb-Dich-Hoch Smoke gegen ${BASE_URL} ===`)

  // 1) HTTP-Sanity
  await httpPruefen(BASE_URL)
  await httpPruefen(new URL('/game', BASE_URL).toString())

  // 2) Browser-Smoke auf zwei Viewports
  const browser = await chromium.launch()
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      locale: 'de-DE',
    })
    const page = await context.newPage()

    const errors = []
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console: ${msg.text()}`)
    })

    await pruefeSpielkartenHebDichHoch(page, { width: 1280, height: 900 }, '1280x900')
    await pruefeSpielkartenHebDichHoch(page, { width: 1100, height: 800 }, '1100x800')

    if (errors.length > 0) {
      throw new Error(`M1ds Smoke: ${errors.length} Browser-Fehler aufgetreten:\n${errors.join('\n')}`)
    }
  } finally {
    await browser.close()
  }

  console.log('M1ds Spielkarten-Heb-Dich-Hoch: SMOKE GRÜN')
}

main().catch((err) => {
  console.error('M1ds Smoke FEHLGESCHLAGEN:', err.message)
  process.exit(1)
})
