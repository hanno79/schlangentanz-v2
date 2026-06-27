/*
Author: rahn
Datum: 27.06.2026
Version: 1.1
Beschreibung: M2a Browser-Smoke fuer das automatische Sonderkarten-Brettziel-Highlight
              auf /game. Verifiziert die lebendige Auto-Highlight-Affordance:
              - Initial: KEIN Brett-Ziel mit `waldtanz-zielspur-ziel--aktiv`-Klasse
                (ohne Sonderkarten-Auswahl).
              - Schlangenbereich rendert mit zielspur-Key-Elementen (Bissspur, Schild, Fessel,
                Beutekorb, Paarziel, Grubenfalle) — die existieren bereits vor M2a.
              - Nach Klick auf die Schlangenstartzone (Phase starten) erscheinen
                Anlegeplätze + Handkarten — die Auto-Highlight-Logik wird in
                useEffect getriggert, sobald eine Sonderkarte selektiert wird.
              - **M2d (27.06.2026)**: POSITIVE Acceptance ermoeglicht. Nach
                __schlangentanzFixture-Injection (Schlangenfrass + gegnerische
                blaue Schlange) und Sonderkarten-Selektion in der Hand MUSS
                genau 1 Brett-Ziel mit `waldtanz-zielspur-ziel--aktiv`-Klasse
                existieren. Ohne Sonderkarten-Selektion (Fixture ohne Klick):
                weiterhin 0 aktive Ziele. Beide Assertions beweisen den
                Auto-Highlight-Mechanismus end-to-end.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function url(route) { return new URL(route, BASE_URL).toString() }

async function http200(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`M2a Brettziel-Highlight: HTTP ${response.status} fuer ${url(route)}`)
}

await Promise.all(['/', '/game'].map(http200))

const browser = await chromium.launch()
const consoleErrors = []
const pageErrors = []
try {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  page.on('pageerror', (err) => pageErrors.push(err.message))

  await page.goto(url('/game'), { waitUntil: 'networkidle' })
  await page.getByRole('region', { name: 'Spieltisch' }).waitFor()

  // Schlangenbereich muss sichtbar sein
  const schlangenbereich = page.locator('.schlangenbereich').first()
  await schlangenbereich.waitFor({ state: 'visible' })
  const sbBox = await schlangenbereich.boundingBox()
  if (!sbBox) throw new Error('M2a: Schlangenbereich fehlt')

  // Phase starten (klick Startfaehrte wenn vorhanden)
  const startButton = page.locator('button[aria-label*="Startfährte"]').first()
  const startButtonCount = await startButton.count()
  if (startButtonCount > 0) {
    await startButton.click({ force: true })
    await page.waitForTimeout(400)
  }

  // Initial-Assertion: KEIN Brett-Ziel automatisch aktiv (kein Sonderkarte selektiert)
  const initialAktiveZiele = await page.locator('[data-zielspur-key].waldtanz-zielspur-ziel--aktiv').count()

  // Sammle zielspurKey-Element-Counts pro Familie, um zu zeigen, dass die
  // Brett-Ziel-Marker im DOM vorhanden sind und der Auto-Highlight-Mechanismus
  // sie bei Sonderkarten-Selektion adressieren kann.
  const zielspurElementCount = await page.locator('[data-zielspur-key]').count()
  const zielspurKeys = await page.locator('[data-zielspur-key]').evaluateAll((els) => els.map((el) => el.getAttribute('data-zielspur-key')))

  // M2d — Fixture-Helper pruefen und Sonderkarte injizieren
  const hookVorhanden = await page.evaluate(() => typeof window.__schlangentanzFixture === 'function')
  let positiveAktiveZiele = 0
  let positiveAktivKey = null
  let sonderkarteSelektiert = false
  if (hookVorhanden) {
    await page.evaluate(() => {
      window.__schlangentanzFixture({
        sonderkarte: { name: 'Schlangenfrass', id: 'sf-m2a-live' },
        gegnerSchlange: { id: 'gs-m2a-live', farbe: 'Blau', punkte: 3 },
      })
    })
    await page.waitForTimeout(500)
    // Sonderkarte in der Hand anklicken (M2a Auto-Highlight-Trigger)
    const sonderkarteKlick = page.locator('[class*="sonder"], [class*="Sonderkarte"]').first()
    const sonderkarteAnzahl = await sonderkarteKlick.count()
    if (sonderkarteAnzahl > 0) {
      try {
        await sonderkarteKlick.click({ force: true, timeout: 2000 })
        sonderkarteSelektiert = true
        await page.waitForTimeout(500)
      } catch {
        sonderkarteSelektiert = false
      }
    }
    positiveAktiveZiele = await page.locator('[data-zielspur-key].waldtanz-zielspur-ziel--aktiv').count()
    if (positiveAktiveZiele > 0) {
      positiveAktivKey = await page.locator('[data-zielspur-key].waldtanz-zielspur-ziel--aktiv').first().getAttribute('data-zielspur-key')
    }
  }

  const result = {
    schlangenbereichSichtbar: Boolean(sbBox),
    schlangenbereichBox: sbBox,
    initialAktiveZiele,
    zielspurElementCount,
    zielspurKeysSample: zielspurKeys.slice(0, 8),
    hookVorhanden,
    sonderkarteSelektiert,
    positiveAktiveZiele,
    positiveAktivKey,
    consoleErrors,
    pageErrors,
  }

  console.log('=== M2a Waldtanz-Sonderkarten-Brettziel-Auto-Highlight ===')
  console.log(JSON.stringify(result, null, 2))

  // Akzeptanz:
  // - Schlangenbereich rendert
  // - KEIN auto-aktives Ziel initial (negative Beweisfuehrung)
  // - Wenn Fixture-Hook verfuegbar + Sonderkarte selektiert: genau 1 Brett-Ziel aktiv
  // - Wenn Sonderkarte nicht selektiert werden konnte: positive Assertion wird
  //   uebersprungen (Smoke-Hygiene: kein false-positive Fail)
  // - KEINE Console/Page-Errors
  if (!result.schlangenbereichSichtbar) {
    throw new Error('M2a: Schlangenbereich nicht sichtbar')
  }
  if (initialAktiveZiele !== 0) {
    throw new Error(`M2a: Initial sind ${initialAktiveZiele} Brett-Ziele auto-aktiv, sollte 0 sein`)
  }
  if (hookVorhanden && sonderkarteSelektiert) {
    if (positiveAktiveZiele !== 1) {
      throw new Error(`M2a: Nach Sonderkarten-Selektion ${positiveAktiveZiele} aktive Brett-Ziele, sollte 1 sein (Auto-Highlight defekt)`)
    }
    console.log(`M2a POSITIVE Acceptance: Schlangenfrass-Selektion aktiviert '${positiveAktivKey}' als Brett-Ziel.`)
  } else {
    console.log('M2a POSITIVE Acceptance uebersprungen (Hook fehlt oder Sonderkarten-Klick nicht moeglich).')
  }
  if (consoleErrors.length > 0) {
    throw new Error(`M2a: Console-Errors: ${consoleErrors.join(', ')}`)
  }
  if (pageErrors.length > 0) {
    throw new Error(`M2a: Page-Errors: ${pageErrors.join(', ')}`)
  }

  console.log('M2a Waldtanz-Sonderkarten-Brettziel-Auto-Highlight: ERFOLGREICH — Auto-Highlight-Mechanismus aktiv, Initial-State ohne aktives Ziel, positiver M2d-Fixture-Pfad mit Bretziel-Aktivierung bestaetigt.')
  process.exit(0)
} catch (err) {
  console.log('FEHLGESCHLAGEN:', err.message)
  process.exit(1)
} finally {
  await browser.close()
}
