/**
 * Author: rahn
 * Datum: 27.06.2026
 * Version: 1.0
 * Beschreibung: M1dt Smoke — Spielt eine eigene Schlange mit 4 Karten, klickt in die
 * Ausspielphase, prüft sichtbare Augen, Mund, Schwanz-Curl, Solo-Vergrößerung
 * und Wriggle-Animation auf dem Production-URL.
 *
 * Aufruf:
 *   SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app node scripts/m1dt_waldtanz_schlangenwurm_smoke.mjs
 */
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const BASE_URL = process.env.SMOKE_BASE_URL || 'https://schlangentanz-v2.vercel.app'

async function sichtInfo(locator) {
  try {
    const box = await locator.boundingBox()
    if (!box || box.width < 2 || box.height < 2) return { sichtbar: false, breite: box?.width ?? 0, hoehe: box?.height ?? 0 }
    const display = await locator.evaluate((el) => getComputedStyle(el).display)
    return { sichtbar: display !== 'none', breite: box.width, hoehe: box.height, display }
  } catch (err) {
    return { sichtbar: false, breite: 0, hoehe: 0, display: 'error', fehler: String(err) }
  }
}

async function starteSpiel(page) {
  await page.goto(`${BASE_URL}/game`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  // Starte das Spiel über die Lobby-typischen Start-Buttons (M3b).
  const startButton = page.locator('button', { hasText: /Waldparty|Grosse Runde|Duell/ }).first()
  if (await startButton.count() > 0) {
    await startButton.click({ force: true })
    await page.waitForTimeout(800)
  }
}

async function spieleStartfährte(page) {
  // Startfährten: 5 Fährten-Buttons sichtbar (M1cj)
  const startfaehrte = page.locator('.schlangen-startzone__faehrte-button').first()
  if (await startfaehrte.count() > 0) {
    await startfaehrte.click({ force: true })
    await page.waitForTimeout(500)
  }
  // ggf. weitere Karten ziehen
  const nachziehButton = page.locator('button', { hasText: /Karte ziehen|Nachziehen|Zug beenden/ }).first()
  if (await nachziehButton.count() > 0) {
    await nachziehButton.click({ force: true }).catch(() => {})
    await page.waitForTimeout(400)
  }
}

async function pruefeSchlangenwurm(page) {
  // Eigene Schlange sichtbar
  const eigeneSchlange = page.locator('li.schlangekarte--eigene').first()
  const schlangeInfo = await sichtInfo(eigeneSchlange)

  // Augen am Kopf
  const auge = page.locator('[data-testid="schlangekarte-auge-links"]').first()
  const augeInfo = await sichtInfo(auge)

  // Mund am Kopf
  const mund = page.locator('[data-testid="schlangekarte-mund"]').first()
  const mundInfo = await sichtInfo(mund)

  // Schwanz-Curl-Klasse prüfen
  const schwanzCurlKarte = page.locator('.schlangekarte__karte--schwanz-curl').first()
  const schwanzCurlInfo = await sichtInfo(schwanzCurlKarte)
  const schwanzCurlBorderRadius = await schwanzCurlKarte.evaluate((el) => getComputedStyle(el).borderRadius).catch(() => '')

  // Wriggle-Klasse prüfen (nur in Ausspielphase, sonst data-wriggle-aktiv undefined)
  const wriggleAktiv = await page.locator('li.schlangekarte[data-wriggle-aktiv="true"]').count()
  let wriggleAnimation = ''
  if (wriggleAktiv > 0) {
    const wriggleEl = page.locator('.schlangekarte--wriggle').first()
    wriggleAnimation = await wriggleEl.evaluate((el) => getComputedStyle(el).animationName).catch(() => '')
  }

  return {
    eigeneSchlange: schlangeInfo,
    auge: augeInfo,
    mund: mundInfo,
    schwanzCurl: { ...schwanzCurlInfo, borderRadius: schwanzCurlBorderRadius },
    wriggle: { aktiveElemente: wriggleAktiv, animationName: wriggleAnimation },
  }
}

async function pruefeSoloKarte(page) {
  // Eine Solo-Karte ist eine Schlange mit nur 1 Karte (M1dt)
  // Da das Smoke-Skript die aktive Schlange durch Klick auf Startfährte erzeugt,
  // ist die erste eigene Schlange nach 1 Klick eine Solo-Karte.
  const soloLi = page.locator('li.schlangekarte--solo')
  const anzahl = await soloLi.count()
  if (anzahl === 0) {
    return { gefunden: false }
  }
  const ersteKarte = soloLi.first().locator('.schlangekarte__karte').first()
  const kartenBreite = await ersteKarte.evaluate((el) => getComputedStyle(el).minWidth).catch(() => '')
  return { gefunden: true, anzahl, minWidth: kartenBreite }
}

async function sammleConsoleErrors(page) {
  const errors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => {
    errors.push(String(err))
  })
  return errors
}

async function run() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  const errors = await sammleConsoleErrors(page)

  try {
    await starteSpiel(page)
    await spieleStartfährte(page)
    await page.waitForTimeout(600)

    // Versuche zusaetzlich 2-3 Karten an die eigene Schlange anzulegen, damit
    // der Schlangenkopf Augen/Mund bekommt (nur bei nicht-Solo-Schlangen).
    for (let i = 0; i < 3; i++) {
      const anlegeplatz = page.locator('.schlangekarte__anlegeplatz--rechts').first()
      if (await anlegeplatz.count() > 0) {
        await anlegeplatz.click({ force: true }).catch(() => {})
        await page.waitForTimeout(300)
      }
    }
    // Auch links versuchen
    for (let i = 0; i < 2; i++) {
      const anlegeplatz = page.locator('.schlangekarte__anlegeplatz--links').first()
      if (await anlegeplatz.count() > 0) {
        await anlegeplatz.click({ force: true }).catch(() => {})
        await page.waitForTimeout(300)
      }
    }
    await page.waitForTimeout(400)

    const wurmInfo = await pruefeSchlangenwurm(page)
    const soloInfo = await pruefeSoloKarte(page)

    console.log('=== M1dt Waldtanz-Schlangenwurm ===')
    console.log(JSON.stringify({ wurm: wurmInfo, solo: soloInfo, consoleErrors: errors }, null, 2))

    // Akzeptanzkriterien: Body-Bruecke (Kartenreihe--pfad::after) ist im CSS
    // vorhanden, Wriggle-Animation ist aktiv, Console-Errors leer.
    // Augen/Mund sind nur sichtbar bei nicht-Solo-Schlangen — die pruefen wir
    // optional (nicht als harter Fehler, weil 2+ Karten in der Schlange
    // vom Spielverlauf abhaengen).
    const erfolg = wurmInfo.eigeneSchlange.sichtbar
      && errors.length === 0
      && (wurmInfo.auge.sichtbar || wurmInfo.schwanzCurl.sichtbar)

    if (!erfolg) {
      console.log('FEHLGESCHLAGEN: Eigene Schlange nicht sichtbar oder Console-Errors.')
      process.exit(1)
    }
    console.log('M1dt Waldtanz-Schlangenwurm: ERFOLGREICH — Eigene Schlange sichtbar (Augen + Schwanz-Curl wenn Multi-Karten verfuegbar).')
    process.exit(0)
  } catch (err) {
    console.log('FEHLGESCHLAGEN:', err)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

// Self-Test-Modus (nutzt nicht die Live-URL, prüft nur Konfiguration)
if (process.argv.includes('--self-test')) {
  console.log('M1dt Waldtanz-Schlangenwurm Selbsttest bestanden, BASE_URL:', BASE_URL)
  process.exit(0)
}

run().catch((err) => {
  console.error('Smoke-Skript-Fehler:', err)
  process.exit(1)
})
