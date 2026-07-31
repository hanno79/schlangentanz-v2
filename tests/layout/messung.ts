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

/* ============================================================
   ÄNDERUNG [31.07.2026]: G-0 — generische Brett-Wächter.

   Die Messungen oben prüfen je *ein* benanntes Element. Genau daran ist der
   alte Zustand vorbeigelaufen: Jede einzelne Box hielt ihren Vertrag, während
   die Seite als Ganzes unbenutzbar war — 8 von 12 Bedienelementen verdeckt,
   6 außerhalb des Bildes, 14 Elemente mit abgeschnittenem Inhalt.

   Die folgenden Primitive fragen deshalb nicht „ist Element X richtig?",
   sondern „ist irgendwo auf dieser Seite etwas abgeschnitten, verdeckt oder
   außerhalb des Bildes?". Siehe docs/SPIELBRETT_SPEC.md.
   ============================================================ */

/** Ein Befund eines Wächters — Element-Kennung plus Messwerte. */
export interface Befund {
  element: string
  detail: string
}

/* Die Wächter laufen vollständig im Browser: `page.evaluate` serialisiert nur
   das Ergebnis, nicht die Funktion drumherum. Die Kennungs-Hilfe wird deshalb in
   jedem Block lokal definiert statt von außen hereingereicht. */

/**
 * Elemente, deren Inhalt größer ist als ihre Box und die ihn abschneiden.
 *
 * Das ist Regel 2 aus docs/SPIELBRETT_SPEC.md: Der Inhalt bestimmt die Höhe;
 * passt er nicht, scrollt sein Container — er wird nicht abgeschnitten.
 * Scrollbare Container (`overflow: auto`/`scroll`) sind ausgenommen, denn dort
 * kommt der Spieler an den Rest heran.
 */
export async function findeAbgeschnittenes(page: Page): Promise<Befund[]> {
  return page.evaluate(() => {
    const kennung = (element: Element): string => {
      const klasse = (element.className && element.className.toString().split(' ')[0]) || ''
      const name = element.getAttribute('aria-label') || (element.textContent || '').trim().slice(0, 30)
      const basis = klasse || element.tagName
      return name ? `${basis} "${name}"` : basis
    }
    const befunde: { element: string; detail: string }[] = []
    for (const element of Array.from(document.querySelectorAll('*'))) {
      const box = element.getBoundingClientRect()
      if (box.width < 4 || box.height < 4) continue
      if (!(element as HTMLElement).checkVisibility()) continue
      const stil = getComputedStyle(element)
      const schneidetAb = (achse: string) => /hidden|clip/.test(achse)
      const zuHoch = schneidetAb(stil.overflowY) && element.scrollHeight > element.clientHeight + 3
      const zuBreit = schneidetAb(stil.overflowX) && element.scrollWidth > element.clientWidth + 3
      if (!zuHoch && !zuBreit) continue
      befunde.push({
        element: kennung(element),
        detail: `Inhalt ${element.scrollHeight}×${element.scrollWidth} in Box ${element.clientHeight}×${element.clientWidth}`,
      })
    }
    return befunde
  })
}

/** Bedienelemente, die ganz oder teilweise außerhalb des sichtbaren Bereichs liegen. */
export async function findeAusserhalbDesBildes(page: Page): Promise<Befund[]> {
  return page.evaluate(() => {
    const kennung = (element: Element): string => {
      const klasse = (element.className && element.className.toString().split(' ')[0]) || ''
      const name = element.getAttribute('aria-label') || (element.textContent || '').trim().slice(0, 30)
      const basis = klasse || element.tagName
      return name ? `${basis} "${name}"` : basis
    }
    const hoehe = window.innerHeight
    const breite = window.innerWidth
    const befunde: { element: string; detail: string }[] = []
    for (const element of Array.from(document.querySelectorAll('button, a[href], [role="button"], input, select'))) {
      if (!(element as HTMLElement).checkVisibility()) continue
      const box = element.getBoundingClientRect()
      if (box.width < 2 || box.height < 2) continue
      if (box.bottom <= hoehe + 1 && box.top >= -1 && box.right <= breite + 1 && box.left >= -1) continue
      befunde.push({
        element: kennung(element),
        detail: `liegt bei ${Math.round(box.top)}..${Math.round(box.bottom)} (Bild ist ${hoehe}px hoch)`,
      })
    }
    return befunde
  })
}

/**
 * Bedienelemente, die an keiner Stelle frei liegen — also von etwas anderem
 * vollständig überdeckt werden.
 *
 * Abgetastet wird eine Zeile auf mittlerer Höhe. Ein einzelner Punkt reicht
 * nicht: Überlappende Karten in einem Fächer sind gewollt, solange jede Karte
 * *irgendwo* getroffen werden kann.
 */
export async function findeVerdeckteBedienelemente(page: Page): Promise<Befund[]> {
  return page.evaluate(() => {
    const kennung = (element: Element): string => {
      const klasse = (element.className && element.className.toString().split(' ')[0]) || ''
      const name = element.getAttribute('aria-label') || (element.textContent || '').trim().slice(0, 30)
      const basis = klasse || element.tagName
      return name ? `${basis} "${name}"` : basis
    }
    const befunde: { element: string; detail: string }[] = []
    for (const element of Array.from(document.querySelectorAll('button, a[href], [role="button"]'))) {
      if (!(element as HTMLElement).checkVisibility()) continue
      const box = element.getBoundingClientRect()
      if (box.width < 2 || box.height < 2) continue
      // Außerhalb des Bildes zählt beim anderen Wächter, nicht doppelt hier.
      if (box.bottom > window.innerHeight || box.top < 0) continue
      let frei = 0
      for (let anteil = 0.05; anteil <= 0.95; anteil += 0.05) {
        const treffer = document.elementFromPoint(box.x + box.width * anteil, box.y + box.height / 2)
        if (treffer && (element === treffer || element.contains(treffer))) frei += 1
      }
      if (frei > 0) continue
      befunde.push({ element: kennung(element), detail: 'an keiner Stelle frei — vollständig überdeckt' })
    }
    return befunde
  })
}

/** Anzahl sichtbarer Elemente mit nennenswerter Fläche — das Budget aus Regel 1 und 3. */
export async function zaehleSichtbareElemente(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      Array.from(document.querySelectorAll('*')).filter((element) => {
        const box = element.getBoundingClientRect()
        return box.width > 4 && box.height > 4 && (element as HTMLElement).checkVisibility()
      }).length,
  )
}

/** Formatiert Befunde für eine lesbare Fehlermeldung. */
export function befundListe(befunde: Befund[]): string {
  return befunde.map((b) => `\n  · ${b.element} — ${b.detail}`).join('')
}
