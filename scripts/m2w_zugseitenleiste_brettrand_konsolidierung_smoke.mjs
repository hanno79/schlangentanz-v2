/**
 * Author: rahn
 * Datum: 30.06.2026
 * Version: 1.0
 * Beschreibung: M2w Live-Smoke — Verifiziert auf /game die konsolidierte
 *              Brettrand-Zugseitenleiste. Im Default-Zustand auf /game sollen
 *              3 redundante Cards visuell verschwinden (display:none):
 *              - .waldtanz-unterholzleiste
 *              - .waldtanz-partie-uhr
 *              - .partiefortschritt
 *
 *              Die 4 verbleibenden Cards (Zugpfad, Spielhilfe, KiZugBuehne,
 *              Zugkompass) tragen konsistente Stitch-Card-Styles.
 *
 *              Auf / (Lobby) bleiben alle 7 Cards sichtbar.
 *
 * Akzeptanzkriterien:
 *  - Auf /game (Default-Zustand): 3 redundante Cards display:none
 *  - Auf / (Lobby): alle 7 Cards sichtbar (display != none)
 *  - Verbleibende Cards tragen 3px-border + hard-shadow-sm
 *  - Console-Errors: 0
 *  - HTTP 200 auf / und /game
 *
 * Aufruf:
 *   SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app node scripts/m2w_zugseitenleiste_brettrand_konsolidierung_smoke.mjs
 *   node scripts/m2w_zugseitenleiste_brettrand_konsolidierung_smoke.mjs --self-test
 */
import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const HTTP_TIMEOUT_MS = 15_000
const SELF_TEST = process.argv.includes('--self-test')

function url(route) { return new URL(route, BASE_URL).toString() }

export function erstelleSelbsttestAusgabe() {
  return [
    'M2w Zugseitenleiste-Konsolidierung Selbsttest bestanden',
    `BASE_URL: ${BASE_URL}`,
    'Helper pruefeM2wZugseitenleiste: kompiliert',
    'Helper sichtInfo: kompiliert',
    'Slice-Klassen: .waldtanz-unterholzleiste, .waldtanz-partie-uhr, .partiefortschritt',
    'Verbleibende Cards: .zugpfad, .waldtanz-spielhilfe, .ki-zug-buehne--brettnah, .zugkompass',
  ].join('\n')
}

async function httpPruefen(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(HTTP_TIMEOUT_MS) })
  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status} fuer ${route}`)
  }
  console.log(`HTTP 200  ${route}`)
}

async function sichtInfo(locator) {
  try {
    const box = await locator.boundingBox()
    if (!box || box.width < 2 || box.height < 2) {
      let display
      try {
        display = await locator.evaluate((el) => getComputedStyle(el).display)
      } catch {
        display = 'detached'
      }
      return { sichtbar: false, breite: box?.width ?? 0, hoehe: box?.height ?? 0, display }
    }
    const display = await locator.evaluate((el) => getComputedStyle(el).display)
    return { sichtbar: display !== 'none', breite: box.width, hoehe: box.height, display }
  } catch (err) {
    return { sichtbar: false, breite: 0, hoehe: 0, display: 'error', fehler: String(err) }
  }
}

async function pruefeM2wZugseitenleiste(page, viewport, label) {
  await page.setViewportSize(viewport)
  await page.goto(url('/game'), { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)

  // Auf Production ist /game direkt erreichbar (kein Lobby-Start noetig).
  // Falls ein Startbutton existiert (Lobby-Variante), klicken wir ihn.
  const startButton = page.locator('button', { hasText: /Waldparty|Grosse Runde|Duell/ }).first()
  if (await startButton.count() > 0) {
    await startButton.click({ force: true })
    await page.waitForTimeout(800)
  }

  // 1) Die 3 hidden Cards pruefen.
  const unterholzleiste = page.locator('[class~="waldtanz-unterholzleiste"]').first()
  const partieUhr = page.locator('[class~="waldtanz-partie-uhr"]').first()
  const partieFortschritt = page.locator('[class~="partiefortschritt"]').first()

  const unterInfo = await sichtInfo(unterholzleiste)
  const partieUhrInfo = await sichtInfo(partieUhr)
  const partieInfo = await sichtInfo(partieFortschritt)

  console.log(`\n[${label}] /game HIDDEN-CARDS`)
  console.log(`  unterholzleiste sichtbar=${unterInfo.sichtbar}  display=${unterInfo.display}  ${unterInfo.breite}x${unterInfo.hoehe}  (erwartet: display:none)`)
  console.log(`  partie-uhr      sichtbar=${partieUhrInfo.sichtbar}  display=${partieUhrInfo.display}  ${partieUhrInfo.breite}x${partieUhrInfo.hoehe}  (erwartet: display:none)`)
  console.log(`  partiefortschritt sichtbar=${partieInfo.sichtbar}  display=${partieInfo.display}  ${partieInfo.breite}x${partieInfo.hoehe}  (erwartet: display:none)`)

  if (unterInfo.display !== 'none') {
    throw new Error(`[${label}] unterholzleiste nicht versteckt: display=${unterInfo.display}`)
  }
  if (partieUhrInfo.display !== 'none') {
    throw new Error(`[${label}] partie-uhr nicht versteckt: display=${partieUhrInfo.display}`)
  }
  if (partieInfo.display !== 'none') {
    throw new Error(`[${label}] partiefortschritt nicht versteckt: display=${partieInfo.display}`)
  }

  // 2) Die 4 verbleibenden Cards pruefen.
  const zugpfad = page.locator('[class~="zugpfad"]').first()
  const spielhilfe = page.locator('[class~="waldtanz-spielhilfe"]').first()
  const zugkompass = page.locator('[class~="zugkompass"]').first()
  const kiZugBuehne = page.locator('[class~="ki-zug-buehne--brettnah"]').first()

  const zugpfadInfo = await sichtInfo(zugpfad)
  const spielhilfeInfo = await sichtInfo(spielhilfe)
  const zugkompassInfo = await sichtInfo(zugkompass)
  const kiZugInfo = await sichtInfo(kiZugBuehne)

  console.log(`\n[${label}] /game VISIBLE-CARDS`)
  console.log(`  zugpfad         sichtbar=${zugpfadInfo.sichtbar}  display=${zugpfadInfo.display}  ${zugpfadInfo.breite}x${zugpfadInfo.hoehe}  (erwartet: sichtbar)`)
  console.log(`  spielhilfe      sichtbar=${spielhilfeInfo.sichtbar}  display=${spielhilfeInfo.display}  ${spielhilfeInfo.breite}x${spielhilfeInfo.hoehe}  (erwartet: sichtbar)`)
  console.log(`  zugkompass      sichtbar=${zugkompassInfo.sichtbar}  display=${zugkompassInfo.display}  ${zugkompassInfo.breite}x${zugkompassInfo.hoehe}  (erwartet: sichtbar)`)
  console.log(`  ki-zug-buehne   sichtbar=${kiZugInfo.sichtbar}  display=${kiZugInfo.display}  ${kiZugInfo.breite}x${kiZugInfo.hoehe}  (erwartet: sichtbar)`)

  if (zugpfadInfo.display === 'none') {
    throw new Error(`[${label}] zugpfad unerwartet versteckt: display=${zugpfadInfo.display}`)
  }
  if (spielhilfeInfo.display === 'none') {
    throw new Error(`[${label}] spielhilfe unerwartet versteckt: display=${spielhilfeInfo.display}`)
  }
  if (zugkompassInfo.display === 'none') {
    throw new Error(`[${label}] zugkompass unerwartet versteckt: display=${zugkompassInfo.display}`)
  }
  if (kiZugInfo.display === 'none') {
    throw new Error(`[${label}] ki-zug-buehne unerwartet versteckt: display=${kiZugInfo.display}`)
  }

  // 3) Card-Container-Styling pruefen: Border + Box-Shadow
  const cardStyleChecks = [
    { name: 'zugpfad', locator: zugpfad },
    { name: 'spielhilfe', locator: spielhilfe },
    { name: 'zugkompass', locator: zugkompass },
  ]
  console.log(`\n[${label}] /game CARD-STYLES`)
  for (const c of cardStyleChecks) {
    const styles = await c.locator.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { borderWidth: cs.borderTopWidth, borderColor: cs.borderTopColor, boxShadow: cs.boxShadow, borderRadius: cs.borderTopLeftRadius }
    })
    console.log(`  ${c.name}: border=${styles.borderWidth} ${styles.borderColor}  shadow="${styles.boxShadow}"  radius=${styles.borderRadius}`)
    if (parseFloat(styles.borderWidth) < 2) {
      throw new Error(`[${label}] ${c.name} hat zu duennen Border: ${styles.borderWidth}`)
    }
    if (styles.boxShadow === 'none' || styles.boxShadow === '') {
      throw new Error(`[${label}] ${c.name} hat keinen Box-Shadow: "${styles.boxShadow}"`)
    }
  }

  console.log(`[${label}] OK`)
}

async function pruefeM2wLobby(page, viewport, label) {
  await page.setViewportSize(viewport)
  await page.goto(url('/'), { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  // Auf / (Lobby) bleiben alle Cards sichtbar. Wir pruefen, dass die 3
  // hidden-cards aus /game auf / wieder sichtbar sind.
  const unterholzleiste = page.locator('[class~="waldtanz-unterholzleiste"]').first()
  const partieUhr = page.locator('[class~="waldtanz-partie-uhr"]').first()
  const partieFortschritt = page.locator('[class~="partiefortschritt"]').first()

  const unterInfo = await sichtInfo(unterholzleiste)
  const partieUhrInfo = await sichtInfo(partieUhr)
  const partieInfo = await sichtInfo(partieFortschritt)

  console.log(`\n[${label}] / LOBBY`)
  console.log(`  unterholzleiste  sichtbar=${unterInfo.sichtbar}  display=${unterInfo.display}  (erwartet: display != none)`)
  console.log(`  partie-uhr       sichtbar=${partieUhrInfo.sichtbar}  display=${partieUhrInfo.display}  (erwartet: display != none)`)
  console.log(`  partiefortschritt sichtbar=${partieInfo.sichtbar}  display=${partieInfo.display}  (erwartet: display != none)`)

  if (unterInfo.display === 'none') {
    throw new Error(`[${label}] LOBBY: unterholzleiste fälschlich versteckt (route-scoped Hide greift auf /)`)
  }
  if (partieUhrInfo.display === 'none') {
    throw new Error(`[${label}] LOBBY: partie-uhr fälschlich versteckt (route-scoped Hide greift auf /)`)
  }
  if (partieInfo.display === 'none') {
    throw new Error(`[${label}] LOBBY: partiefortschritt fälschlich versteckt (route-scoped Hide greift auf /)`)
  }

  console.log(`[${label}] OK`)
}

async function pruefeKonsoleSeite(page) {
  const errors = []
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`)
  })
  return errors
}

async function main() {
  if (SELF_TEST) {
    console.log(erstelleSelbsttestAusgabe())
    return
  }

  console.log(`M2w Live-Smoke gegen ${BASE_URL}`)

  await httpPruefen('/')
  await httpPruefen('/game')

  const browser = await chromium.launch()
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    const page = await ctx.newPage()
    const fehler = await pruefeKonsoleSeite(page)

    await pruefeM2wZugseitenleiste(page, { width: 1280, height: 900 }, '1280x900')
    await pruefeM2wLobby(page, { width: 1280, height: 900 }, '1280x900-Lobby')

    if (fehler.length > 0) {
      throw new Error(`Konsole-/Page-Errors gefunden:\n${fehler.join('\n')}`)
    }
    console.log('\nM2w SMOKE BESTANDEN — Zugseitenleiste ist konsolidiert.')
  } finally {
    await browser.close()
  }
}


main().catch((err) => {
  console.error('M2w SMOKE FEHLGESCHLAGEN:', err)
  process.exit(1)
})
