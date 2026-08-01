/*
Author: Claude Code (G-9)
Datum: 01.08.2026
Version: 1.0
Beschreibung: Hält das Brett einer ganzen Partie stand? (docs/SPIELBRETT_SPEC.md)

Die vier Wächter aus `brett_waechter.spec.ts` prüfen das **Erstbild**. Sie waren
alle grün, während die Spielfläche im Spielverlauf auf ein Drittel schrumpfte:

| Runde (2 KI-Gegner, 1280×900) | Spielfläche | ihr Inhalt | Gegnerstreifen |
|---|---|---|---|
| Start | 384 px | 380 px | 76 px |
| 1 | 260 px | 256 px | 200 px |
| 2 | 162 px | 285 px | 298 px |
| 4 | **162 px** | **339 px** | 298 px |

Kein Wächter schlug an, und keiner konnte: Die Fläche *scrollt* ja (Regel 2),
also war nichts abgeschnitten, und ihre Knöpfe blieben per Scroll erreichbar.
Nur spielen ließ sich darauf nicht mehr — die eigenen Schlangen waren auf
Streifen zusammengedrückt.

Die Ursache stand in einer Zeile: `grid-template-rows: auto minmax(0, 1fr) …`.
Die Spielfläche war die einzige dehnbare Zeile und damit die einzige, die für
das Wachstum aller anderen bezahlte — ihr Minimum war null.

Dieser Vertrag spielt deshalb eine echte Partie und misst *danach*.
*/

import { expect, test } from '@playwright/test'
import { befundListe, findeAusserhalbDesBildes, findeVerdeckteBedienelemente } from './messung'

/**
 * Untergrenze der Spielfläche: ein Drittel des Bildes — Startkreis plus eine
 * Schlangenreihe. Gemessen als Anteil, nicht in Pixeln: Das Brett teilt die
 * Bildhöhe auf, und genau diese Aufteilung ist der Vertrag.
 */
const FLAECHE_MINDESTANTEIL = 1 / 3

test.describe('Brett im Dauerlauf', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    // Drei Spieler sind der enge Fall: Der Gegnerstreifen trägt zwei Reihen.
    await page.getByRole('button', { name: /Waldparty starten/ }).click()
    await expect(page.getByRole('region', { name: 'Deine Hand' })).toBeVisible()
  })

  /**
   * Spielt eine Runde mit echten Klicks. Gesperrte Ziele werden übersprungen —
   * ein Zauber ohne Ziel darf nicht als „gespielt" durchgehen.
   */
  async function spieleEineRunde(page: import('@playwright/test').Page) {
    const karten = page.locator('.brett-hand .brett-karte')
    for (let index = 0; index < (await karten.count()); index += 1) {
      await karten.nth(index).click()
      const ziel = page.locator('.brett-startkreis:not([disabled]), .brett-flaeche .brett-anlegeplatz:not([disabled])')
      if ((await ziel.count()) > 0) {
        await ziel.first().click()
        break
      }
    }
    const zugende = page.locator('.brett-aktion button:not([disabled])')
    if ((await zugende.count()) === 0) return false
    await zugende.first().click()
    // Gegnerzug und Nachziehphase laufen ohne Klick durch (Regel 7).
    await expect(page.locator('.brett-aktion button')).toBeVisible({ timeout: 15_000 })
    return true
  }

  test('die Spielfläche behält über eine ganze Partie ihre Größe', async ({ page }) => {
    const flaeche = page.locator('.brett-flaeche')
    const bildhoehe = await page.evaluate(() => window.innerHeight)
    const untergrenze = bildhoehe * FLAECHE_MINDESTANTEIL

    const verlauf: string[] = []
    for (let runde = 1; runde <= 8; runde += 1) {
      if (!(await spieleEineRunde(page))) break
      const hoehe = (await flaeche.boundingBox())?.height ?? 0
      verlauf.push(`Runde ${runde}: ${Math.round(hoehe)} px`)
      expect(hoehe, `Spielfläche zu flach — ${verlauf.join(', ')}`).toBeGreaterThanOrEqual(untergrenze)
    }
  })

  test('nach acht Runden ist noch alles im Bild und bedienbar', async ({ page }) => {
    for (let runde = 1; runde <= 8; runde += 1) {
      if (!(await spieleEineRunde(page))) break
    }

    const ausserhalb = await findeAusserhalbDesBildes(page)
    expect(ausserhalb, `außerhalb des Bildes:\n${befundListe(ausserhalb)}`).toHaveLength(0)

    const verdeckt = await findeVerdeckteBedienelemente(page)
    expect(verdeckt, `verdeckt:\n${befundListe(verdeckt)}`).toHaveLength(0)
  })
})
