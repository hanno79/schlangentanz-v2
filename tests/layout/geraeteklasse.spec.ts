import { expect, test } from '@playwright/test'
import { GERAETEKLASSEN } from '../../scripts/pruefung/geraeteklassen.mjs'
import { oeffne } from './oeffnen'

/*
P0.3c: Jedes Playwright-Projekt misst wirklich das Gerät seiner Geräteklasse.

Dass die Konfiguration die richtigen Zahlen trägt, prüft `tests/pruefwerkzeuge.test.ts`.
Hier misst die Seite selbst nach, was im Browser ankommt: Fenster, Ausrichtung,
grober Zeiger und Touch. Ohne diese Messung fiele ein Projekt, das zwar richtig
heisst, aber etwa ohne Touch läuft, erst beim nächsten Oberflächen-Task auf.
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

  expect(gemessen, klasse.titel).toEqual({
    breite: width,
    hoehe: height,
    hochkant: height > width,
    grob: klasse.hasTouch,
    touch: klasse.hasTouch,
    pixelverhaeltnis: 1,
  })
})
