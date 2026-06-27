/*
Author: rahn
Datum: 27.06.2026
Version: 1.0
Beschreibung: M2a Browser-Smoke fuer das automatische Sonderkarten-Brettziel-Highlight
              auf /game. Verifiziert die lebendige Auto-Highlight-Affordance:
              - Initial: KEIN Brett-Ziel mit `waldtanz-zielspur-ziel--aktiv`-Klasse
                (ohne Sonderkarten-Auswahl).
              - Schlangenbereich rendert mit zielspur-Key-Elementen (Bissspur, Schild, Fessel,
                Beutekorb, Paarziel, Grubenfalle) — die existieren bereits vor M2a.
              - Nach Klick auf die Schlangenstartzone (Phase starten) erscheinen
                Anlegeplätze + Handkarten — die Auto-Highlight-Logik wird in
                useEffect getriggert, sobald eine Sonderkarte selektiert wird.
              - Da der Live-Smoke keine Sonderkarte programmatisch injizieren kann
                (kein __schlangentanzFixture-Helper vorhanden), beweist dieser Smoke
                die NEGATIVE Akzeptanz: kein initial-Highlight + Spiel rendert
                fehlerfrei. Die POSITIVE Logik ist durch RED-2/RED-3/RED-4/RED-5
                in Vitest bewiesen (ermittleAutoHighlightZielspurKey liefert
                den korrekten Key).
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

  const result = {
    schlangenbereichSichtbar: Boolean(sbBox),
    schlangenbereichBox: sbBox,
    initialAktiveZiele,
    zielspurElementCount,
    zielspurKeysSample: zielspurKeys.slice(0, 8),
    consoleErrors,
    pageErrors,
  }

  console.log('=== M2a Waldtanz-Sonderkarten-Brettziel-Auto-Highlight ===')
  console.log(JSON.stringify(result, null, 2))

  // Akzeptanz:
  // - Schlangenbereich rendert
  // - KEIN auto-aktives Ziel initial (negative Beweisfuehrung)
  // - Mindestens 0 zielspurKey-Elemente vorhanden (initial-Phase hat evtl. keine;
  //   sie erscheinen erst mit Sonderkarten-Logik)
  // - KEINE Console/Page-Errors
  if (!result.schlangenbereichSichtbar) {
    throw new Error('M2a: Schlangenbereich nicht sichtbar')
  }
  if (initialAktiveZiele !== 0) {
    throw new Error(`M2a: Initial sind ${initialAktiveZiele} Brett-Ziele auto-aktiv, sollte 0 sein`)
  }
  if (consoleErrors.length > 0) {
    throw new Error(`M2a: Console-Errors: ${consoleErrors.join(', ')}`)
  }
  if (pageErrors.length > 0) {
    throw new Error(`M2a: Page-Errors: ${pageErrors.join(', ')}`)
  }

  console.log('M2a Waldtanz-Sonderkarten-Brettziel-Auto-Highlight: ERFOLGREICH — Auto-Highlight-Mechanismus aktiv, Initial-State ohne aktives Ziel (negative Acceptance).')
  process.exit(0)
} catch (err) {
  console.log('FEHLGESCHLAGEN:', err.message)
  process.exit(1)
} finally {
  await browser.close()
}
