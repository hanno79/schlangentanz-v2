import { expect, test, type Page } from '@playwright/test'
import { befundListe, findeAbgeschnittenes } from './messung'

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
  '/dev?seed=1&spieler=4&erweiterung=1',
  '/dev?szenario=alle-orte',
  '/dev?szenario=kaputt-doppelte-karte',
  '/dev?szenario=wertung-beispiele',
  '/dev?szenario=wertung-beispiele-kette',
  '/dev?szenario=wertung-joker',
]

/**
 * Sichtbare Elemente mit eigenem Text und Bedienelemente, die rechts über das
 * Fenster hinausragen. Nur waagrecht: Der Tisch ist eine lange Seite, nach unten
 * zu scrollen ist gewollt (`findeAusserhalbDesBildes` zählt auch das).
 */
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
      const bedienelement = element.matches('a, button, input, select, summary')
      if (eigenerText === '' && !bedienelement) continue
      const rechts = element.getBoundingClientRect().right
      const name = eigenerText || element.textContent?.trim() || ''
      if (rechts > breite + 1) befunde.push(`${element.tagName} "${name.slice(0, 40)}" bis ${Math.round(rechts)} px`)
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

    test('P0.4: kein Text und kein Bedienelement ragt rechts aus dem Bild', async ({ page }) => {
      const befunde = await textRechtsAusserhalb(page)
      expect(befunde, `${befunde.length} Element(e) ragen rechts hinaus:\n${befunde.join('\n')}`).toEqual([])
    })

    test('P0.4: nichts ist abgeschnitten', async ({ page }) => {
      const abgeschnitten = await findeAbgeschnittenes(page)
      expect(abgeschnitten, `Abgeschnitten:${befundListe(abgeschnitten)}`).toEqual([])
    })
  })
}
