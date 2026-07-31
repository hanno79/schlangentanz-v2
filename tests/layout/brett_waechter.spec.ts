/*
Author: Claude Code (G-0)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Generische Wächter über die ganze Spielseite (docs/SPIELBRETT_SPEC.md).

Die übrigen Verträge in diesem Verzeichnis prüfen je *ein* benanntes Element.
Genau daran ist der alte Zustand vorbeigelaufen: Jede einzelne Box hielt ihren
Vertrag, während die Seite als Ganzes unbenutzbar war.

Gemessen auf `/game` am 31.07.2026 bei 1280×900:

| Wächter | Verstöße |
|---|---|
| Inhalt abgeschnitten | 14 |
| Bedienelement außerhalb des Bildes | 6 von 12 |
| Bedienelement vollständig verdeckt | 8 von 12 |
| sichtbare Elemente | 298 (Budget: 90) |

Darunter alle fünf Startfährten und der Startkreis — die erste Handlung im
Spiel. Ein Mausklick auf den Startfährte-Knopf (y = 1381) bewirkte nichts.

Diese vier Fragen stellt sonst niemand. Sie sind bewusst *nicht* an bestimmte
Klassennamen gebunden: Sie überleben jeden Umbau und gelten für jede Route.

**Stand:** Auf `/game` sind alle vier als `test.fail()` markiert — dieselbe
Praxis wie im Lobby-Vertrag. Der Anspruch bleibt sichtbar, ohne die Suite rot zu
färben. Sobald das neue Brett auf `/game` liegt (Paket G-8), meldet Playwright
„unerwartet grün" und die Marker fallen weg.
*/

import { expect, test } from '@playwright/test'
import {
  befundListe,
  findeAbgeschnittenes,
  findeAusserhalbDesBildes,
  findeVerdeckteBedienelemente,
  zaehleSichtbareElemente,
} from './messung'

/** Regel 1 und 3 aus der Spezifikation: sieben Regionen, eine Rahmenebene. */
const ELEMENT_BUDGET = 90

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.999999
  })
  await page.goto('/game', { waitUntil: 'networkidle' })
})

test.describe('Brett-Wächter auf /game', () => {
  test.fail('kein sichtbares Element schneidet seinen Inhalt ab', async ({ page }) => {
    const befunde = await findeAbgeschnittenes(page)
    expect(
      befunde,
      `${befunde.length} Element(e) schneiden ihren Inhalt ab:${befundListe(befunde)}`,
    ).toEqual([])
  })

  test.fail('kein Bedienelement liegt außerhalb des Bildes', async ({ page }) => {
    const befunde = await findeAusserhalbDesBildes(page)
    expect(
      befunde,
      `${befunde.length} Bedienelement(e) außerhalb des Bildes:${befundListe(befunde)}`,
    ).toEqual([])
  })

  test.fail('kein Bedienelement ist vollständig verdeckt', async ({ page }) => {
    const befunde = await findeVerdeckteBedienelemente(page)
    expect(
      befunde,
      `${befunde.length} Bedienelement(e) vollständig verdeckt:${befundListe(befunde)}`,
    ).toEqual([])
  })

  test.fail(`die Seite zeigt höchstens ${ELEMENT_BUDGET} Elemente`, async ({ page }) => {
    const anzahl = await zaehleSichtbareElemente(page)
    expect(
      anzahl,
      `${anzahl} sichtbare Elemente — das Budget aus docs/SPIELBRETT_SPEC.md ist ${ELEMENT_BUDGET}`,
    ).toBeLessThanOrEqual(ELEMENT_BUDGET)
  })
})
