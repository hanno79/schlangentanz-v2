import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'
import { SPIELSTAND_SCHLUESSEL } from '../../src/spielstand'
import { befundListe, findeAbgeschnittenes, findeKleineTippflaechen, waagrechterUeberstand } from './messung'

/*
O6 im echten Browser, in jeder Geräteklasse: die Abwehrfrage an dich, mit Maus
auf dem Desktop und mit dem Finger auf Tablet und Handy (Kriterien 2 und 3),
das Aussetzen (Kriterium 4) und das Protokoll (Kriterium 1). Die Spielstände
kommen über `/spiel?szenario=` aus dem Testhook-Build.
*/

const gespeichert = (page: Page) => page.evaluate((schluessel) => window.localStorage.getItem(schluessel), SPIELSTAND_SCHLUESSEL)

function bediene(info: TestInfo): (element: Locator) => Promise<void> {
  return info.project.use.hasTouch ? (element) => element.tap() : (element) => element.click()
}

const zugleiste = (page: Page) => page.getByRole('region', { name: 'Zugleiste' })
const frage = (page: Page) => zugleiste(page).getByRole('group', { name: 'Abwehrfrage' })
const handkarten = (page: Page) => page.getByRole('region', { name: 'Deine Hand' }).getByRole('list', { name: 'Handkarten' }).getByRole('img')

/** Was während der Abwehrfrage gelten muss: Frage und Knöpfe ganz im Bild, die Hand sichtbar, nichts zu klein oder abgeschnitten. */
async function pruefeFrage(page: Page, handgroesse: number): Promise<void> {
  await expect(frage(page)).toBeInViewport({ ratio: 1 })
  for (const knopf of await frage(page).getByRole('button').all()) await expect(knopf).toBeInViewport({ ratio: 1 })
  await expect(handkarten(page)).toHaveCount(handgroesse)
  for (const karte of await handkarten(page).all()) await expect(karte, 'O6 K2: deine Hand bleibt während der Frage sichtbar').toBeInViewport({ ratio: 0.5 })
  expect(await waagrechterUeberstand(page)).toBe(0)
  const klein = await findeKleineTippflaechen(page)
  expect(klein, `zu kleine Tippflächen:${befundListe(klein)}`).toEqual([])
  const abgeschnitten = await findeAbgeschnittenes(page)
  expect(abgeschnitten, `abgeschnitten:${befundListe(abgeschnitten)}`).toEqual([])
}

test.describe('O6: Abwehr, Aussetzen und Protokoll am Tisch', () => {
  test('O6 K2/K3: Schlangengrube auf dich: Frage mit Angreifer, Karte und Ziel; „Abwehren“ lässt eine Karte weniger auf der Hand', async ({ page }, info) => {
    const tippe = bediene(info)
    await page.clock.install()
    await page.goto('/spiel?szenario=angriff-auf-dich&tempo=sofort')
    await expect(frage(page)).toContainText('KI-Gegner 1 sagt an: Schlangengrube auf dich.')
    // Ab hier steht die Uhr, damit KI-Gegner 1 nach der Abwehr nicht weiterspielt und du nicht schon wieder auffüllst.
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000))
    await pruefeFrage(page, 5)
    const vorher = await gespeichert(page)
    await tippe(frage(page).getByRole('button', { name: 'Abwehren' }))
    await expect(frage(page)).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Deine Hand · 4 Karten' })).toBeVisible()
    expect(await gespeichert(page)).not.toBe(vorher)
    await expect(page.getByRole('log', { name: 'Protokoll' })).toContainText('Du wehrst Schlangengrube mit Farbenschutz ab.')
  })

  test('O6 K2/D33: ohne Farbenschutz gibt es nur „Durchlassen“', async ({ page }, info) => {
    const tippe = bediene(info)
    await page.goto('/spiel?szenario=angriff-ohne-schutz&tempo=sofort')
    await expect(frage(page)).toContainText('KI-Gegner 1 sagt an: Schlangenfrass frisst Violett aus deiner Schlange 1.')
    await expect(frage(page).getByRole('button', { name: 'Abwehren' })).toHaveCount(0)
    await pruefeFrage(page, 5)
    await tippe(frage(page).getByRole('button', { name: 'Durchlassen' }))
    await expect(frage(page)).toHaveCount(0)
  })

  test('O6 K4: Aussetzen: die Zugleiste sagt es, das Protokoll auch, und die Partie läuft bis zu deinem Zug', async ({ page }) => {
    await page.goto('/spiel?szenario=grube-vor-dir&tempo=sofort')
    await expect(zugleiste(page)).toContainText('Du hast wegen der Schlangengrube einen Zug ausgesetzt.', { timeout: 15_000 })
    await expect(page.getByRole('log', { name: 'Protokoll' })).toContainText('Du setzt diesen Zug aus (Schlangengrube).')
    // Danach spielt KI-Gegner 1 weiter, bis du entscheidest: an deinem Zug oder bei einer Abwehrfrage.
    await expect(page.getByRole('status')).toContainText(/Du (bist|entscheidest)/, { timeout: 15_000 })
    await expect(zugleiste(page).getByText('Du hast wegen der Schlangengrube einen Zug ausgesetzt.')).toBeInViewport({ ratio: 1 })
    expect(await waagrechterUeberstand(page)).toBe(0)
  })
})
