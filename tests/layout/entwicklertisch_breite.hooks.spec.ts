import { expect, test, type Page } from '@playwright/test'
import { befundListe, findeAbgeschnittenes, findeAusserhalbDesBildes } from './messung'

/*
P0.4, Iteration 2: Der Entwicklertisch passt in jede Geräteklasse.

Gemessen in allen drei Testhook-Projekten (Desktop, Tablet quer, Handy
hochkant). Die Seite darf nicht breiter sein als das Fenster, nichts darf
abgeschnitten sein, und kein Text darf rechts aus dem Bild ragen. Lange
Kartennamen und Ids brechen um, statt die Seite zu verbreitern.
*/

const ADRESSEN = [
  '/dev',
  '/dev/szenarien',
  '/dev/szenarien/',
  '/dev?seed=1&spieler=4',
  '/dev?szenario=spielende',
  '/dev?szenario=reaktionsfenster',
  '/dev?szenario=kaputt-doppelte-karte',
]

/** Sichtbare Elemente mit eigenem Text, die rechts über das Fenster hinausragen. */
async function textRechtsAusserhalb(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const breite = document.documentElement.clientWidth
    const befunde: string[] = []
    for (const element of Array.from(document.querySelectorAll('body *'))) {
      if (!(element as HTMLElement).checkVisibility()) continue
      const eigenerText = Array.from(element.childNodes)
        .filter((knoten) => knoten.nodeType === Node.TEXT_NODE)
        .map((knoten) => knoten.nodeValue ?? '')
        .join('')
        .trim()
      if (eigenerText === '') continue
      const rechts = element.getBoundingClientRect().right
      if (rechts > breite + 1) befunde.push(`${element.tagName} "${eigenerText.slice(0, 40)}" bis ${Math.round(rechts)} px`)
    }
    return befunde
  })
}

for (const adresse of ADRESSEN) {
  test.describe(`P0.4: ${adresse} passt ins Fenster`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(adresse)
      await expect(page.getByTestId('entwicklertisch'), `${adresse} zeigt keinen Entwicklertisch`).toBeVisible()
      await expect(page.getByTestId('fehlermeldung').filter({ hasText: 'Unbekannte Seite' })).toHaveCount(0)
    })

    test('P0.4: die Seite ist nicht breiter als das Fenster', async ({ page }) => {
      const { scrollBreite, fensterBreite } = await page.evaluate(() => ({
        scrollBreite: document.documentElement.scrollWidth,
        fensterBreite: document.documentElement.clientWidth,
      }))
      expect(scrollBreite, `Seite ${scrollBreite} px breit bei ${fensterBreite} px Fenster`).toBeLessThanOrEqual(
        fensterBreite,
      )
    })

    test('P0.4: kein Text ragt rechts aus dem Bild', async ({ page }) => {
      const befunde = await textRechtsAusserhalb(page)
      expect(befunde, `${befunde.length} Element(e) ragen rechts hinaus:\n${befunde.join('\n')}`).toEqual([])
    })

    test('P0.4: nichts ist abgeschnitten, kein Bedienelement liegt ausserhalb', async ({ page }) => {
      const abgeschnitten = await findeAbgeschnittenes(page)
      expect(abgeschnitten, `Abgeschnitten:${befundListe(abgeschnitten)}`).toEqual([])
      const ausserhalb = await findeAusserhalbDesBildes(page)
      expect(ausserhalb, `Ausserhalb des Bildes:${befundListe(ausserhalb)}`).toEqual([])
    })
  })
}
