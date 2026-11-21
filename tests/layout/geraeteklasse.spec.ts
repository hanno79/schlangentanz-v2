import { expect, test } from '@playwright/test'
import { GERAETEKLASSEN } from '../../scripts/pruefung/geraeteklassen.mjs'
import { oeffne } from './oeffnen'

/*
P0.3c: Jedes Playwright-Projekt misst wirklich das Gerät seiner Geräteklasse.

Dass die Konfiguration die richtigen Zahlen trägt, prüft `tests/pruefwerkzeuge.test.ts`.
Hier misst die Seite selbst nach, was im Browser ankommt: Fenster, Ausrichtung,
grober Zeiger und Touch. Ohne diese Messung fiele ein Projekt, das zwar richtig
heisst, aber etwa ohne Touch läuft, erst beim nächsten Oberflächen-Task auf.

Touch wird nur bei den Klassen mit `hasTouch` gemessen. Ohne `hasTouch` meldet
Chromium in `navigator.maxTouchPoints` die Touch-Hardware des Prüfrechners, die
Playwright nicht abschalten kann; auf dem Prüfrechner waren das am 21.11.2026 zehn
Touchpunkte. Der Vertrag würde sonst den Rechner prüfen statt der Geräteklasse.
Der grobe Zeiger, auf den die Oberfläche reagiert, wird in allen Klassen geprüft.
*/

test('P0.3c: Fenster, Ausrichtung, Zeiger und Touch entsprechen der Geräteklasse des Projekts', async ({ page }, info) => {
  const klasse = GERAETEKLASSEN.find(({ name }) => name === info.project.name)
  if (klasse === undefined) throw new Error(`Projekt „${info.project.name}“ hat keine Geräteklasse in scripts/pruefung/geraeteklassen.mjs.`)
  const { width, height } = klasse.viewport

  await oeffne(page, '/')
  const gemessen = await page.evaluate(() => ({
    breite: window.innerWidth,
    hoehe: window.innerHeight,
    hochkant: matchMedia('(orientation: portrait)').matches,
    grob: matchMedia('(pointer: coarse)').matches,
    touch: navigator.maxTouchPoints > 0,
    pixelverhaeltnis: window.devicePixelRatio,
  }))

  const { touch, ...fenster } = gemessen
  expect(fenster, klasse.titel).toEqual({
    breite: width,
    hoehe: height,
    hochkant: height > width,
    grob: klasse.hasTouch,
    pixelverhaeltnis: klasse.deviceScaleFactor,
  })
  if (klasse.hasTouch) expect(touch, `${klasse.titel}: navigator.maxTouchPoints > 0 erwartet`).toBe(true)
})
