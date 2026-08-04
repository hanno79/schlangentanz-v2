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
import { zaehleSichtbareElemente } from './messung'
import { nichtsIstStillgelegt, waechterVertraege } from './waechter'

/** Regel 1 und 3 aus der Spezifikation: sieben Regionen, eine Rahmenebene. */
const ELEMENT_BUDGET = 90

function waechterFuer(route: string, markiere: boolean, optionen: { ohneBudget?: boolean } = {}) {
  const pruefe = markiere ? test.fail : test

  test.describe(`Brett-Wächter auf ${route}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => {
        Math.random = () => 0.999999
      })
      await page.goto(route, { waitUntil: 'networkidle' })
    })

    waechterVertraege(pruefe)

    /* ÄNDERUNG [03.08.2026, Punkt 1b]: Die Wächter überspringen seit heute
       `inert`-Teilbäume. Damit hinge dieser ganze Vertrag daran, dass hier
       nichts versehentlich stillgelegt ist — wäre es das, meldeten zwei Wächter
       leere Listen und blieben grün, ohne noch etwas zu messen. Deshalb steht
       die Erwartung ausdrücklich da. Das Gegenstück prüft
       `sieger_party.hooks.spec.ts`: Dort *muss* das Brett `inert` sein. */
    nichtsIstStillgelegt(pruefe)

    const budgetPruefe = optionen.ohneBudget ? test.skip : pruefe
    budgetPruefe(`die Seite zeigt höchstens ${ELEMENT_BUDGET} Elemente`, async ({ page }) => {
      const anzahl = await zaehleSichtbareElemente(page)
      expect(
        anzahl,
        `${anzahl} sichtbare Elemente — das Budget aus docs/SPIELBRETT_SPEC.md ist ${ELEMENT_BUDGET}`,
      ).toBeLessThanOrEqual(ELEMENT_BUDGET)
    })
  })
}

/* Seit G-8 zeigt `/game` das neue Brett — die vier Wächter gelten dort scharf.
   Bis dahin verletzte die alte Ansicht alle vier und war als bekannte Lücke
   markiert; die temporäre Route `/brett` ist mit dem Umschalten entfallen. */
waechterFuer('/game', false)

/* Die Lobby ist der einzige Weg ins Spiel. Ein Startknopf außerhalb des Bildes
   oder unter einem anderen Element macht das Spiel unerreichbar — genau das war
   vor G-8 der Fall (Knopf bei y=1092). Das Elementbudget gilt hier nicht: Die
   Lobby ist eine andere Art Seite als das Brett. */
waechterFuer('/', false, { ohneBudget: true })
