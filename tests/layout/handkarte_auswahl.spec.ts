/*
Author: Claude Code (S-4)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Layout-Vertrag für die Rückmeldung bei ausgewählter Handkarte
              (Fixplan G5).

Auf /game bekam der Spieler keine sichtbare Rückmeldung, welche Karte er
ausgewählt hat. Ursache war ein Specificity-Wettrüsten zwischen zwei Slices:

- `--handkarte-selected-glow` (App.css) legt einen lime-grünen Schein um die
  gewählte Karte, angewandt über
  `.handkartenleiste[data-hat-ausgewaehlt="true"] …` mit Spezifität 0,4,0.
- M2i baute für die Hero-Optik auf /game eine Regel mit doppeltem
  Klassen-Selektor auf 0,5,0 — laut eigenem Kommentar ausdrücklich, „um
  spaetere M1x-Slice-Regeln abzuwehren". Sie deklariert `box-shadow` mit und
  überschrieb damit auch den Auswahl-Glow.

Gemessen ergab das für die gewählte Karte `rgb(6, 57, 7) 0px 4px 0px 0px` —
denselben flachen Rahmenschatten wie bei jeder anderen Karte.

Geprüft wird deshalb der Zustand, nicht die Regel: Die gewählte Karte muss sich
sichtbar von den übrigen unterscheiden. Welche Deklaration das gewinnt, ist dem
Vertrag gleichgültig — ein erneutes Hochrüsten der Spezifität fällt hier auf.
*/

import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0.999999
  })
  await page.goto('/game', { waitUntil: 'networkidle' })
})

test.describe('Handkarten-Auswahl', () => {
  test('die gewählte Karte hebt sich sichtbar von den übrigen ab', async ({ page }) => {
    const karten = page.locator('.handkartenleiste--spielkartenfaecher .handkarte__button--karte')
    await karten.first().click()

    const gewaehlt = page.locator('.handkarte--ausgewaehlt .handkarte__button--karte')
    await expect(gewaehlt, 'nach dem Klick trägt keine Karte den Auswahl-Zustand').toHaveCount(1)

    const schatten = await gewaehlt.evaluate((element) => getComputedStyle(element).boxShadow)
    const andere = await page
      .locator('.handkarte:not(.handkarte--ausgewaehlt) .handkarte__button--karte')
      .first()
      .evaluate((element) => getComputedStyle(element).boxShadow)

    expect(
      schatten,
      `Die gewählte Karte trägt denselben Schatten wie die ungewählten (${schatten}) — der Spieler sieht seine Auswahl nicht`,
    ).not.toBe(andere)
  })

  test('die gewählte Karte trägt den lime-grünen Auswahl-Schein', async ({ page }) => {
    await page.locator('.handkartenleiste--spielkartenfaecher .handkarte__button--karte').first().click()

    /* Auf den eingeschwungenen Zustand warten: Der Schatten wird per Transition
       animiert, und mitten darin liefert getComputedStyle Zwischenwerte
       (z. B. `rgba(41, 93, 6, 0.882) 0px 2.74411px …`). Gemeint ist der
       Endzustand, nicht ein Einzelbild der Animation. */
    await expect
      .poll(
        async () => {
          const schatten = await page
            .locator('.handkarte--ausgewaehlt .handkarte__button--karte')
            .evaluate((element) => getComputedStyle(element).boxShadow)
          // Grünanteil muss deutlich über Rot und Blau liegen — dieselbe Regel,
          // die der Production-Smoke M1db anlegt.
          return [...schatten.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)].some(
            (treffer) => {
              const [r, g, b] = [Number(treffer[1]), Number(treffer[2]), Number(treffer[3])]
              return g > r && g > b && g > 120
            },
          )
        },
        { message: 'Kein lime-grüner Schein im box-shadow der gewählten Karte' },
      )
      .toBe(true)
  })
})
