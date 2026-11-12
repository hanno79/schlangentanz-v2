// Die drei Geräteklassen der Abnahme (docs/UMSETZUNGSPLAN.md, Abschnitte 2.3 und 3.4).
// Einzige Quelle für playwright.config.ts und scripts/pruefung/bildschirmfotos.mjs.
//
// deviceScaleFactor 1, damit ein Bildschirmfoto genau so viele Pixel hat wie das
// Fenster. isMobile bei den Touch-Klassen, damit Chromium wie auf einem Gerät das
// viewport-Meta-Tag beachtet; hasTouch schaltet Touch-Ereignisse und
// `(pointer: coarse)` ein.

import { existsSync } from 'node:fs'

/** @type {ReadonlyArray<import('./geraeteklassen.d.mts').Geraeteklasse>} */
export const GERAETEKLASSEN = Object.freeze([
  {
    name: 'desktop',
    titel: 'Desktop 1280×900',
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    hasTouch: false,
    isMobile: false,
  },
  {
    name: 'tablet',
    titel: 'Tablet quer 1024×768, Touch',
    viewport: { width: 1024, height: 768 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
  },
  {
    name: 'handy',
    titel: 'Handy hochkant 390×844, Touch',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
  },
])

/** Die Browser-Kontextoptionen einer Geräteklasse, für Playwright-Projekte und `browser.newContext`. */
export function kontextOptionen({ viewport, deviceScaleFactor, hasTouch, isMobile }) {
  return { viewport, deviceScaleFactor, hasTouch, isMobile }
}

/**
 * Pfad zu einem eigenen Chromium aus PW_CHROMIUM_PFAD, sonst undefined (dann nimmt
 * Playwright sein mit `npx playwright install chromium` geladenes). Ein gesetzter
 * Pfad, unter dem nichts liegt, ist ein Fehler und kein stiller Rückfall.
 */
export function chromiumPfad() {
  const pfad = process.env.PW_CHROMIUM_PFAD
  if (pfad === undefined || pfad === '') return undefined
  if (!existsSync(pfad)) {
    throw new Error(`PW_CHROMIUM_PFAD zeigt auf „${pfad}“, dort liegt keine Datei. Variable korrigieren oder entfernen.`)
  }
  return pfad
}
