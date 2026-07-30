/*
Author: Claude Code (AP-2)
Datum: 30.07.2026
Version: 1.0
Beschreibung: Mess-Primitive für Layout-Verträge (AP-2, Onboarding-Finding 2).

Diese Datei ist die *eine* Quelle für Geometrie-Messungen — analog zur
`zielspurKey`-Factory in `src/components/zielspurKey.ts`. Vorher bildete jede
Testdatei ihre eigene Variante eines CSS-Klammer-Parsers nach; 120 Dateien tragen
heute noch eine Kopie davon.

Übersetzungsregeln von CSS-Quelltext-Assert nach Messung:

| bisher im CSS-Quelltext            | hier gemessen                          |
|------------------------------------|----------------------------------------|
| `height: clamp(a, b, c)`           | `hoeheVon()` liegt zwischen a und c    |
| `display: none`                    | Playwright `toBeHidden()`              |
| `order: -1`                        | `reihenfolgeAufDemSchirm()`            |
| `overflow-x: auto`                 | `scrolltHorizontal()`                  |
| sonstige Eigenschaften             | `berechneterStil()`                    |

Wichtig: `clamp()`-Verträge werden als **Bereich** geprüft, nicht als exakter
Pixelwert. Ein exakter Wert wäre nur die alte Brüchigkeit in neuer Verpackung —
er würde bei jeder Root-Font-Size- oder Viewport-Nuance umfallen, ohne dass der
Vertrag verletzt wäre.
*/

import { expect, type Locator, type Page } from '@playwright/test'

export interface Kasten {
  breite: number
  hoehe: number
  oben: number
  unten: number
  links: number
  rechts: number
}

/** Bounding-Box auf ganze Pixel gerundet. Wirft, wenn das Element nicht sichtbar ist. */
export async function kasten(locator: Locator): Promise<Kasten> {
  await expect(locator).toBeVisible()
  const box = await locator.boundingBox()
  if (box === null) {
    throw new Error('Element hat keine Bounding-Box (nicht gerendert oder display:none).')
  }
  return {
    breite: Math.round(box.width),
    hoehe: Math.round(box.height),
    oben: Math.round(box.y),
    unten: Math.round(box.y + box.height),
    links: Math.round(box.x),
    rechts: Math.round(box.x + box.width),
  }
}

export async function hoeheVon(locator: Locator): Promise<number> {
  return (await kasten(locator)).hoehe
}

export async function unterkanteVon(locator: Locator): Promise<number> {
  return (await kasten(locator)).unten
}

export async function oberkanteVon(locator: Locator): Promise<number> {
  return (await kasten(locator)).oben
}

/** Berechneter Stilwert, so wie ihn der Browser nach der gesamten Kaskade auflöst. */
export async function berechneterStil(locator: Locator, eigenschaft: string): Promise<string> {
  return locator.evaluate(
    (element, prop) => getComputedStyle(element as HTMLElement).getPropertyValue(prop).trim(),
    eigenschaft,
  )
}

/**
 * Root-Font-Size in Pixeln. Nötig, um `clamp()`-Verträge in `rem` auszudrücken
 * statt in Pixelwerten, die von der Viewport-Breite abhängen.
 */
export async function remInPixel(page: Page): Promise<number> {
  return page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize))
}

/** Gesamthöhe des Dokuments — ersetzt die `body.scrollHeight`-Prüfungen der Smokes. */
export async function seitenHoehe(page: Page): Promise<number> {
  return page.evaluate(() => document.body.scrollHeight)
}

/** Scrollt das Element tatsächlich horizontal? Ersetzt `overflow-x: auto`-Asserts. */
export async function scrolltHorizontal(locator: Locator): Promise<boolean> {
  return locator.evaluate((element) => {
    const el = element as HTMLElement
    const stil = getComputedStyle(el)
    const kannScrollen = stil.overflowX === 'auto' || stil.overflowX === 'scroll'
    return kannScrollen && el.scrollWidth > el.clientWidth
  })
}

/**
 * Reihenfolge, in der die Elemente tatsächlich auf dem Schirm stehen — zuerst nach
 * Oberkante, bei gleicher Zeile nach linker Kante. Ersetzt `order:`-Asserts im
 * CSS-Quelltext und `compareDocumentPosition`-Prüfungen, die nur die DOM-Reihenfolge
 * kennen und deshalb an Flex-/Grid-Umsortierungen vorbeimessen.
 */
export async function reihenfolgeAufDemSchirm(locators: Locator[]): Promise<number[]> {
  const kaesten = await Promise.all(locators.map((locator) => kasten(locator)))
  return kaesten
    .map((box, index) => ({ box, index }))
    .sort((a, b) => (a.box.oben !== b.box.oben ? a.box.oben - b.box.oben : a.box.links - b.box.links))
    .map((eintrag) => eintrag.index)
}

/**
 * Prüft einen `clamp(min, praeferenz, max)`-Vertrag als Bereich in `rem`.
 * Die Toleranz fängt Rundung auf Subpixel ab.
 */
export async function erwarteHoeheImRemBereich(
  page: Page,
  locator: Locator,
  minRem: number,
  maxRem: number,
  hinweis: string,
): Promise<void> {
  const rem = await remInPixel(page)
  const hoehe = await hoeheVon(locator)
  expect(hoehe, `${hinweis}: Höhe ${hoehe}px unterschreitet ${minRem}rem (${minRem * rem}px)`).toBeGreaterThanOrEqual(
    Math.floor(minRem * rem) - 1,
  )
  expect(hoehe, `${hinweis}: Höhe ${hoehe}px überschreitet ${maxRem}rem (${maxRem * rem}px)`).toBeLessThanOrEqual(
    Math.ceil(maxRem * rem) + 1,
  )
}
