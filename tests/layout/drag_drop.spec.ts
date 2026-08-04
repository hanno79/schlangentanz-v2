/*
Author: Claude Code (Etappe 6)
Datum: 04.08.2026
Version: 1.0
Beschreibung: Ziehen einer Handkarte auf ein Brettziel — die zweite Bedienart.

Drag & Drop war seit G-8 nicht verdrahtet. Der alte Hook hing am Zonenbegriff des
entfallenen `Schlangenbereich.tsx` und wurde gelöscht, statt 199 Zeilen ungetesteten
Code als Scheinfortschritt liegen zu lassen (`docs/PLAYABILITY_GATE.md`).

**Was hier geprüft wird, und was ausdrücklich nicht.** Der Zug erzeugt keine eigene
Aktion: `useKarteZiehen` wählt die Karte über denselben Aufruf wie ein Klick und
löst beim Loslassen den Ziel-Knopf aus, der ohnehin dasteht. Diese Verträge prüfen
deshalb das *Ergebnis am Brett* — dass eine Schlange entsteht, dass ein gesperrtes
Ziel nichts tut — und nicht die Zeigermechanik. Die Regeln liegen in der Engine und
sind dort geprüft.

Gemessen wird mit echten Zeigerbewegungen (`mouse.move`/`down`/`up`), nicht mit
HTML5-`dragstart`: Letzteres funktioniert auf Touch-Geräten nicht und ließe sich nur
über synthetische DataTransfer-Objekte nachstellen — ein Vertrag, der etwas anderes
prüft als das, was ein Mensch tut.
*/

import { expect, test, type Locator, type Page } from '@playwright/test'
import { oeffne } from './oeffnen'

/** Mitte eines Elements — Zielpunkt für den Zeiger. */
async function mitte(locator: Locator): Promise<{ x: number; y: number }> {
  await expect(locator).toBeVisible()
  const kasten = await locator.boundingBox()
  if (kasten === null) throw new Error('Element hat keine Bounding-Box.')
  return { x: kasten.x + kasten.width / 2, y: kasten.y + kasten.height / 2 }
}

/**
 * Zieht `von` nach `nach`.
 *
 * Die Zwischenschritte sind nicht Zierde: `useKarteZiehen` macht aus dem Druck erst
 * ab sechs Pixel Bewegung einen Zug — ein Sprung direkt zum Ziel wäre ein Klick auf
 * die Handkarte und würde nichts ablegen.
 */
async function ziehe(page: Page, von: Locator, nach: Locator): Promise<void> {
  const start = await mitte(von)
  const ziel = await mitte(nach)
  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  for (const anteil of [0.25, 0.5, 0.75, 1]) {
    await page.mouse.move(start.x + (ziel.x - start.x) * anteil, start.y + (ziel.y - start.y) * anteil)
  }
  await page.mouse.up()
}

test.describe('Handkarte ziehen', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Math.random = () => 0.999999
    })
    await oeffne(page, '/')
    await page.getByRole('button', { name: /Duell starten/ }).click()
    await expect(page.getByRole('region', { name: 'Deine Hand' })).toBeVisible()
  })

  test('eine Farbkarte auf den Startkreis erzeugt eine Schlange', async ({ page }) => {
    const vorher = await page.locator('.brett-schlange').count()
    const handkarte = page.locator('.brett-hand__karten .brett-karte').first()
    await ziehe(page, handkarte, page.locator('.brett-startkreis'))

    await expect(
      page.locator('.brett-schlange'),
      'Nach dem Ablegen auf dem Startkreis muss eine Schlange mehr dastehen.',
    ).toHaveCount(vorher + 1)
  })

  test('dasselbe Ziel per Klick erreicht dasselbe', async ({ page }) => {
    /* Die eigentliche Zusage der Etappe: Drag ist eine Bedienart, kein zweiter
       Regelweg. Wären es zwei Wege, könnten sie auseinanderlaufen — und dieser
       Vertrag wäre der Ort, an dem es auffällt. */
    const vorher = await page.locator('.brett-schlange').count()
    await page.locator('.brett-hand__karten .brett-karte').first().click()
    await page.locator('.brett-startkreis').click()
    await expect(page.locator('.brett-schlange')).toHaveCount(vorher + 1)
  })

  test('ein Zug ins Leere ändert nichts am Brett', async ({ page }) => {
    const vorherSchlangen = await page.locator('.brett-schlange').count()
    const vorherHand = await page.locator('.brett-hand__karten .brett-karte').count()
    const handkarte = page.locator('.brett-hand__karten .brett-karte').first()
    const start = await mitte(handkarte)

    await page.mouse.move(start.x, start.y)
    await page.mouse.down()
    // In die Titelzeile ziehen — dort ist kein Ablageziel.
    await page.mouse.move(start.x, 40)
    await page.mouse.move(start.x, 20)
    await page.mouse.up()

    await expect(page.locator('.brett-schlange')).toHaveCount(vorherSchlangen)
    expect(
      await page.locator('.brett-hand__karten .brett-karte').count(),
      'Eine ins Leere gezogene Karte darf nicht gespielt werden.',
    ).toBe(vorherHand)
  })

  test('der Zug wählt die Karte — wie ein Klick', async ({ page }) => {
    /* Bricht der Zug ab, muss der Zustand derselbe sein wie nach einem Klick auf
       die Karte: gewählt. Sonst müsste der Spieler raten, warum das Brett plötzlich
       Ziele zeigt oder eben nicht. */
    const handkarte = page.locator('.brett-hand__karten .brett-karte').first()
    const start = await mitte(handkarte)
    await page.mouse.move(start.x, start.y)
    await page.mouse.down()
    await page.mouse.move(start.x + 30, start.y - 30)
    await page.mouse.up()

    await expect(
      page.locator('.brett-hand__karten .brett-karte').first(),
      'Nach einem abgebrochenen Zug ist die Karte gewählt, genau wie nach einem Klick.',
    ).toHaveAttribute('aria-pressed', 'true')
  })
})
