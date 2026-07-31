/*
Author: Claude Code (AP-4)
Datum: 30.07.2026
Version: 1.0
Beschreibung: Layout-Vertrag für den Dokumentrahmen (AP-4, Onboarding-Finding 6).

Ersetzt den CSS-Quelltext-Assert aus `src/App.m1f_waldtanz_seitenmenue.test.tsx`,
der die Regel `#root { width: 100%; max-width: none; border-inline: 0 }` als
Zeichenkette festhielt. Jene Regel existierte ausschließlich, um eine
Vite-Starter-Regel (`width: 1126px`) wieder aufzuheben — der Assert schützte also
eine Gegenregel statt eines sichtbaren Ergebnisses. Beide Regeln sind seit AP-4
entfernt; geprüft wird jetzt das Ergebnis: der Rahmen nimmt die volle Breite ein
und schneidet den Spielbereich nicht seitlich ab.
*/

import { expect, test } from '@playwright/test'
import { kasten } from './messung'

const VIEWPORT_BREITE = 1280

for (const route of ['/', '/game']) {
  test(`#root nimmt auf ${route} die volle Viewport-Breite ein`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' })
    const root = page.locator('#root')
    const box = await kasten(root)

    expect(box.breite, `#root ist ${box.breite}px breit statt ${VIEWPORT_BREITE}px`).toBe(VIEWPORT_BREITE)
    expect(box.links, '#root beginnt nicht am linken Rand').toBe(0)
  })
}

test('Seite scrollt nicht horizontal', async ({ page }) => {
  await page.goto('/game', { waitUntil: 'networkidle' })
  const ueberbreite = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(ueberbreite, `Dokument ist ${ueberbreite}px breiter als der Viewport`).toBeLessThanOrEqual(0)
})
