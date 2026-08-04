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
import {
  befundListe,
  findeAbgeschnittenes,
  findeAusserhalbDesBildes,
  findeStillgelegteBedienelemente,
  findeVerdeckteBedienelemente,
  findeZusammengedruecktes,
} from './messung'
import { oeffne } from './oeffnen'

/**
 * Untergrenze der Spielfläche: ein Drittel des Bildes — Startkreis plus eine
 * Schlangenreihe. Gemessen als Anteil, nicht in Pixeln: Das Brett teilt die
 * Bildhöhe auf, und genau diese Aufteilung ist der Vertrag.
 */
const FLAECHE_MINDESTANTEIL = 1 / 3

test.describe('Brett im Dauerlauf', () => {
  test.beforeEach(async ({ page }) => {
    /* ÄNDERUNG [02.08.2026]: Kartengeben festnageln, wie in
       `brett_waechter.spec.ts`. Ohne das spielte jeder Lauf eine andere Partie —
       und der teuerste Test der Suite fiel gelegentlich um, weil ein
       Reaktionsfenster oder ein Spielende an einer Stelle auftrat, an der die
       Runden-Schleife einen Knopf erwartet. Ein Layout-Vertrag, der mal grün und
       mal rot ist, wird bald gar nicht mehr gelesen — dieselbe Begründung wie
       für `retries: 0` in der Playwright-Konfiguration. */
    await page.addInitScript(() => {
      Math.random = () => 0.999999
    })
    await oeffne(page, '/')
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

  /*
   * ÄNDERUNG [02.08.2026]: Dritte Zusicherung, kein vierter Test.
   *
   * Die beiden vorhandenen haben einen echten Fehler durchgelassen: Das
   * Gegnerprotokoll war ab dem zweiten Zug auf `clientHeight: 0` gedrückt — bei
   * 61 px Inhalt. Es lag nicht außerhalb des Bildes und war von nichts verdeckt;
   * es hatte schlicht keine Höhe mehr. Und weil es formal scrollte, sah auch
   * `findeAbgeschnittenes` nichts (Regel 10: weggescrollt ist erreichbar).
   * Damit war die einzige Spur dessen, was der Gegner getan hat, unsichtbar —
   * und Regel 7 verlangt sie ausdrücklich.
   *
   * Die Prüfung hängt hier statt in einem eigenen Test, weil der Endzustand
   * derselbe ist: Ein zweiter Test hätte dieselben acht Runden mit echten Klicks
   * noch einmal gespielt — gemessen rund zehn Sekunden für eine einzige weitere
   * Zusicherung. `expect.soft` sorgt dafür, dass die erste Fehlmeldung die
   * anderen beiden nicht verdeckt.
   */
  test('nach acht Runden ist noch alles im Bild, bedienbar und lesbar', async ({ page }) => {
    for (let runde = 1; runde <= 8; runde += 1) {
      if (!(await spieleEineRunde(page))) break
    }

    const ausserhalb = await findeAusserhalbDesBildes(page)
    expect.soft(ausserhalb, `außerhalb des Bildes:\n${befundListe(ausserhalb)}`).toHaveLength(0)

    const verdeckt = await findeVerdeckteBedienelemente(page)
    expect.soft(verdeckt, `verdeckt:\n${befundListe(verdeckt)}`).toHaveLength(0)

    const gedrueckt = await findeZusammengedruecktes(page)
    expect
      .soft(gedrueckt, `zeigen nicht einmal eine ganze Zeile:\n${befundListe(gedrueckt)}`)
      .toHaveLength(0)

    /* ÄNDERUNG [02.08.2026]: Regel 2 fehlte hier — ausgerechnet die Regel, die
       docs/SPIELBRETT_SPEC.md als zentrale Layoutregel führt. Sie lief nur im
       Erstbild, und die Kartenstapel, die etwas abschneiden könnten, wachsen
       erst im Spielverlauf. Damit prüft der Dauerlauf jetzt dieselben vier
       Inhaltsfragen wie das Erstbild; welcher Wächter wo läuft, ist keine
       Entscheidung mehr, die pro Slice neu getroffen wird. */
    const abgeschnitten = await findeAbgeschnittenes(page)
    expect
      .soft(abgeschnitten, `schneiden ihren Inhalt ab:\n${befundListe(abgeschnitten)}`)
      .toHaveLength(0)

    /* ÄNDERUNG [03.08.2026, Punkt 1b]: Vierte Zusicherung, aus demselben Grund
       wie die dritte — und diesmal aus dem Codex-Review.

       Die beiden Erreichbarkeits-Wächter oben überspringen seit heute
       `inert`-Teilbäume. Endeten diese acht Runden in einem stillgelegten Brett
       — etwa weil eine Runde versehentlich bis `Spielende` durchläuft —, liefen
       genau sie leer und meldeten grün, ohne noch etwas zu messen. Im Erstbild
       ist das abgedeckt (`brett_waechter.spec.ts`); für den späteren
       Spielverlauf war es die Lücke, für die es diesen Dauerlauf gibt. */
    const stillgelegt = await findeStillgelegteBedienelemente(page)
    expect
      .soft(stillgelegt, `sind \`inert\` und werden von den Wächtern übersprungen:\n${befundListe(stillgelegt)}`)
      .toHaveLength(0)
  })
})
