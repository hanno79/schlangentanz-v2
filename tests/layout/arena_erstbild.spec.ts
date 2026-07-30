/*
Author: Claude Code (AP-2)
Datum: 30.07.2026
Version: 1.0
Beschreibung: Layout-Vertrag „Waldtanz-Arena im 1280×900-Erstbild" — Pilot der
              AP-2-Migration (Onboarding-Finding 2).

Ersetzt `src/App.m95_arena_cap.test.ts`, das dieselben Verträge über
CSS-Quelltext-Regexe prüfte. Zuordnung der alten Asserts:

| alt (CSS-Quelltext)                                  | neu (gemessen)                          |
|------------------------------------------------------|-----------------------------------------|
| M9.5:1/:2 `height`/`max-height: clamp(20rem,42vh,26rem)` | Arenastein-Höhe im rem-Bereich 20–26 |
| M9.5:3 alte Cap-Werte kommen nicht mehr vor          | dito — eine zu hohe Cap bricht den Bereich |
| M9.5:4 Schlangenlichtung `min-height: clamp(16rem,…)` | gemessene Mindesthöhe                  |
| M9.5:5 `appCss` enthält irgendwo `clamp(24rem,50vh,32rem)` | entfällt (s. u.)                  |
| M9.5:6 `display/flex-direction/min-height/overflow`  | berechneter Stil                        |
| M9.5:7 `expect(60+70+…).toBeLessThanOrEqual(900)`    | echte Erstbild-Messung (s. u.)          |

Zwei Anmerkungen zur Migration:

- **M9.5:5 hatte keine geometrische Wirkung.** Der Assert suchte die Zeichenkette
  `clamp(24rem, 50vh, 32rem)` im *gesamten* Stylesheet, ohne Bezug zu einem
  Selektor. Die dahinterliegende Absicht — der Arenastein bleibt in seiner
  Gridzeile — ist durch die Cap-Messung unten abgedeckt und dort schärfer: die
  M3i-Cap (26rem) ist strenger als die M9-Zeilencap (32rem).
- **M9.5:7 konnte nie fehlschlagen.** Der Test rechnete ausschließlich mit
  Literalen (`60+70+30+360+30+220+30 = 800 ≤ 900`) und war damit eine Tautologie
  ohne Bezug zum Code. Ersetzt durch die tatsächliche Erstbild-Messung.

Die Schwellen 930 / 1080 stammen aus dem M3i-Production-Smoke
(`scripts/m3i_stitch_forest_arena_promotion_smoke.mjs`, Pitfall #34) und sind
bewusst identisch gehalten, damit lokaler Vertrag und Production-Smoke nicht
auseinanderlaufen. Gemessen am 30.07.2026: Unterkante erste Handkarte 927 px,
body.scrollHeight 1061 px, Arenastein 378 px.
*/

import { expect, test } from '@playwright/test'
import {
  berechneterStil,
  erwarteHoeheImRemBereich,
  hoeheVon,
  seitenHoehe,
  unterkanteVon,
} from './messung'

// Aus dem M3i-Production-Smoke übernommene Vertragsschwellen.
const ERSTE_HANDKARTE_UNTERKANTE_MAX = 930
const SEITENHOEHE_MAX = 1080

test.beforeEach(async ({ page }) => {
  await page.goto('/game', { waitUntil: 'networkidle' })
})

test.describe('Waldtanz-Arena im 1280×900-Erstbild', () => {
  test('Arenastein bleibt in der M3i-Cap von 20rem bis 26rem', async ({ page }) => {
    const arenastein = page.getByRole('region', { name: 'Waldtanz-Arenastein' })
    await erwarteHoeheImRemBereich(page, arenastein, 20, 26, 'Arenastein-Cap (M3i)')
  })

  test('Arenastein behält seinen Layoutmodus (Cascade-Schutz)', async ({ page }) => {
    const arenastein = page.getByRole('region', { name: 'Waldtanz-Arenastein' })
    expect(await berechneterStil(arenastein, 'display')).toBe('flex')
    expect(await berechneterStil(arenastein, 'flex-direction')).toBe('column')
    expect(await berechneterStil(arenastein, 'overflow')).toBe('hidden')
    expect(await berechneterStil(arenastein, 'min-height')).toBe('0px')
  })

  test('Schlangenlichtung ist sichtbar und hält ihre Mindesthöhe', async ({ page }) => {
    const lichtung = page.locator('.waldtanz-schlangenlichtung')
    await expect(lichtung).toBeVisible()
    // M1di-Vertrag: min-height clamp(16rem, 38vh, 22rem). Geprüft wird die
    // Untergrenze — nach oben darf die Lichtung wachsen, das ist gewollt.
    const rem = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize))
    expect(await hoeheVon(lichtung)).toBeGreaterThanOrEqual(Math.floor(16 * rem) - 1)
  })

  test('erste Handkarte bleibt im Erstbild (M3i-Schwelle 930 px)', async ({ page }) => {
    const ersteHandkarte = page.locator('.handkarte__button--karte').first()
    const unterkante = await unterkanteVon(ersteHandkarte)
    expect(
      unterkante,
      `Unterkante der ersten Handkarte bei ${unterkante}px — die Hand rutscht aus dem Erstbild`,
    ).toBeLessThanOrEqual(ERSTE_HANDKARTE_UNTERKANTE_MAX)
  })

  test('Seite bleibt unter der M3i-Gesamthöhe von 1080 px', async ({ page }) => {
    const hoehe = await seitenHoehe(page)
    expect(hoehe, `body.scrollHeight ${hoehe}px überschreitet die M3i-Schwelle`).toBeLessThanOrEqual(SEITENHOEHE_MAX)
  })

  test('rendert /game ohne Seitenfehler', async ({ page }) => {
    const fehler: string[] = []
    page.on('pageerror', (ausnahme) => fehler.push(ausnahme.message))
    await page.reload({ waitUntil: 'networkidle' })
    expect(fehler).toEqual([])
  })
})
