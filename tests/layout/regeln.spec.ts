import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'
import { duldeBekannteAusnahmen } from './ausnahmen'
import {
  befundListe,
  findeAbgeschnittenes,
  findeKleineTippflaechen,
  findeSchwacheKontraste,
  findeZusammengedruecktes,
  kasten,
  waagrechterUeberstand,
} from './messung'
import { oeffne } from './oeffnen'
import { bedienbarkeitsVertraege, nichtsIstStillgelegt, waechterVertraege } from './waechter'

/*
O9: Regelhilfe in jeder Geräteklasse.

Die Regelseite ist länger als jedes Fenster. Sie scrollt in einem eigenen
Bereich, damit kein Knopf erst durch Scrollen der ganzen Seite erreichbar ist;
die generischen Wächter gelten deshalb ohne Ausnahme. Zusätzlich wird jede der
33 Karten in ihren Bereich gescrollt und muss dann ganz im Bild und antippbar
sein.

Die Grossansicht einer Karte ist modal: Alles dahinter ist absichtlich
verdeckt. Für sie gelten eigene Messungen: Sie liegt ganz im Fenster, schneidet
nichts ab, ihr Text ist bis zum letzten Absatz erreichbar, und die Karte ist so
gross, wie es das Fenster zulässt, mindestens 280 px breit. Nur wo das Fenster
dafür zu niedrig ist (Handy quer, 390 px), füllt die Karte die Höhe des Fensters
bis auf 48 px.
*/

duldeBekannteAusnahmen()

/** Tippen mit Touch-Geräten, sonst klicken: so bedient der Mensch die Klasse. */
function bediene(info: TestInfo): (element: Locator) => Promise<void> {
  return info.project.use.hasTouch ? (element) => element.tap() : (element) => element.click()
}

async function oeffneRegeln(page: Page): Promise<void> {
  await oeffne(page, '/regeln')
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
}

const kartenknoepfe = (page: Page) => page.getByRole('region', { name: 'Alle Karten' }).getByRole('button')

test.describe('O9: Regelseite', () => {
  test.beforeEach(async ({ page }) => {
    await oeffneRegeln(page)
  })

  test('O9: verweist auf die Regeln der Website und fasst einen Zug in fünf Schritten zusammen', async ({ page }) => {
    await expect(page.getByRole('link', { name: /schlangentanz\.ch/ })).toHaveAttribute(
      'href',
      'https://schlangentanz.ch/rules',
    )
    const zug = page.getByRole('region', { name: 'Ein Zug in fünf Schritten' })
    await expect(zug.locator('ol > li')).toHaveCount(5)
    await expect(zug.getByText('Ergänzung des Autors').first()).toBeVisible()
  })

  test('O9: alle 33 Karten sind geladen und lassen sich ganz ins Bild scrollen und antippen', async ({ page }) => {
    const knoepfe = kartenknoepfe(page)
    await expect(knoepfe).toHaveCount(33)
    const befunde: string[] = []
    const { width, height } = page.viewportSize()!
    for (const knopf of await knoepfe.all()) {
      await knopf.scrollIntoViewIfNeeded()
      const box = await kasten(knopf)
      const name = await knopf.getAttribute('aria-label')
      if (box.oben < 0 || box.unten > height || box.links < 0 || box.rechts > width) {
        befunde.push(`${name}: ${box.links}..${box.rechts} × ${box.oben}..${box.unten} ausserhalb ${width}×${height}`)
      }
      const getroffen = await knopf.evaluate((element) => {
        const r = element.getBoundingClientRect()
        const treffer = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
        return treffer !== null && element.contains(treffer)
      })
      if (!getroffen) befunde.push(`${name}: in der Mitte verdeckt`)
      const bild = knopf.getByRole('img')
      const geladen = await bild.evaluate((img) => (img as HTMLImageElement).decode().then(() => (img as HTMLImageElement).naturalWidth > 0))
      if (!geladen) befunde.push(`${name}: Bild nicht geladen`)
    }
    expect(befunde, `Kartenknöpfe:\n${befunde.join('\n')}`).toEqual([])
  })

  bedienbarkeitsVertraege()
  waechterVertraege()
  nichtsIstStillgelegt()
})

/** Karten mit kurzem, mittlerem und dem längsten Text. */
const BEISPIELE = ['Blau', 'Farbendieb', 'Lila Riese', 'Risiko-Belohnung']

for (const kartenname of BEISPIELE) {
  test.describe(`O9: Grossansicht ${kartenname}`, () => {
    test.beforeEach(async ({ page }, info) => {
      await oeffneRegeln(page)
      const knopf = page.getByRole('button', { name: `${kartenname}: Text zeigen` })
      await knopf.scrollIntoViewIfNeeded()
      await bediene(info)(knopf)
      await expect(page.getByRole('dialog')).toBeVisible()
      await page.evaluate(() => document.fonts.ready.then(() => undefined))
    })

    // Eine Messung, ein Seitenaufruf: Lage, Grösse der Karte und Text werden am selben offenen Dialog gelesen.
    test('O9: Dialog ganz im Fenster, Karte gross genug, Text bis zum letzten Absatz erreichbar, nichts abgeschnitten', async ({
      page,
    }) => {
      const { width, height } = page.viewportSize()!
      const dialog = page.getByRole('dialog')
      const box = await kasten(dialog)
      expect(box.links, 'linker Rand des Dialogs').toBeGreaterThanOrEqual(0)
      expect(box.oben, 'oberer Rand des Dialogs').toBeGreaterThanOrEqual(0)
      expect(box.rechts, 'rechter Rand des Dialogs').toBeLessThanOrEqual(width)
      expect(box.unten, 'unterer Rand des Dialogs').toBeLessThanOrEqual(height)
      expect(await waagrechterUeberstand(page), 'waagrechter Überstand der Seite').toBe(0)
      const dialogUeberstand = await dialog.evaluate((d) => d.scrollWidth - d.clientWidth)
      expect(dialogUeberstand, 'waagrechter Überstand im Dialog').toBeLessThanOrEqual(0)

      // Mindestens 280 px breit; nur wo das Fenster dafür zu niedrig ist, füllt die Karte die Höhe bis auf 48 px.
      const karte = await kasten(dialog.getByRole('img'))
      const verlangt = Math.min(280, Math.floor(((height - 48) * 470) / 766))
      expect(karte.breite, `Breite der Karte bei ${height} px Fensterhöhe`).toBeGreaterThanOrEqual(verlangt)
      expect(karte.unten, 'Unterkante der Karte').toBeLessThanOrEqual(height)

      await expect(dialog.locator('.kartentext__kurz')).toBeVisible()
      const letzter = dialog.locator('.kartentext p, .kartentext li').last()
      await letzter.scrollIntoViewIfNeeded()
      const absatz = await kasten(letzter)
      expect(absatz.unten, 'letzter Absatz unten im Bild').toBeLessThanOrEqual(height)
      expect(absatz.rechts, 'letzter Absatz rechts im Bild').toBeLessThanOrEqual(width)
      for (const [art, befunde] of [
        ['abgeschnitten', await findeAbgeschnittenes(page)],
        ['zusammengedrückt', await findeZusammengedruecktes(page)],
        ['zu blass', await findeSchwacheKontraste(page)],
      ] as const) {
        expect(befunde, `${art}:${befundListe(befunde)}`).toEqual([])
      }
    })

    test('O9: „Schliessen“ ist mindestens 44 px gross, im Bild und schliesst', async ({ page }, info) => {
      const schliessen = page.getByRole('dialog').getByRole('button', { name: 'Schliessen' })
      const box = await kasten(schliessen)
      const { height, width } = page.viewportSize()!
      expect(box.unten <= height && box.rechts <= width && box.oben >= 0, `Schliessen bei ${JSON.stringify(box)}`).toBe(true)
      expect(await findeKleineTippflaechen(page), 'zu kleine Tippflächen').toEqual([])
      await bediene(info)(schliessen)
      await expect(page.getByRole('dialog')).toBeHidden()
    })

    test('O9: ein Tippen neben den Dialog schliesst ihn', async ({ page }, info) => {
      const box = await kasten(page.getByRole('dialog'))
      const x = Math.max(1, Math.floor(box.links / 2))
      const y = Math.max(1, Math.floor(box.oben / 2))
      if (info.project.use.hasTouch) await page.touchscreen.tap(x, y)
      else await page.mouse.click(x, y)
      await expect(page.getByRole('dialog')).toBeHidden()
    })
  })
}

test.describe('O9: Grossansicht mit der Tastatur', () => {
  test('O9: Enter öffnet, Escape schliesst, der Fokus kehrt zur Karte zurück', async ({ page }) => {
    await oeffneRegeln(page)
    const knopf = page.getByRole('button', { name: 'Farbenfusion: Text zeigen' })
    await knopf.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog', { name: 'Farbenfusion' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Schliessen' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(knopf).toBeFocused()
  })
})
