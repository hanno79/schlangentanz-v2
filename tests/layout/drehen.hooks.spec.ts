import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'
import { SPIELSTAND_SCHLUESSEL } from '../../src/spielstand'
import { befundListe, findeAbgeschnittenes, findeAusserhalbDesBildes, waagrechterUeberstand } from './messung'

/*
O11, Kriterium 5, in jeder Geräteklasse: Wer das Gerät mitten in der Partie
dreht, verliert nichts. Gedreht wird zweimal (Breite und Höhe getauscht, dann
zurück), jeweils mitten in einer Auswahl, mit offener Ansage, im Dialog „Zu
viele Handkarten“ und in der Grossansicht. Danach sind Spielstand, gewählte
Karte, gewähltes Ziel, Ansage, Protokoll und offene Dialoge wie vorher, und
die Zugleiste liegt ganz im Bild.
*/

const gespeichert = (page: Page) => page.evaluate((schluessel) => window.localStorage.getItem(schluessel), SPIELSTAND_SCHLUESSEL)
const zugleiste = (page: Page) => page.getByRole('region', { name: 'Zugleiste' })
const hand = (page: Page) => page.getByRole('region', { name: 'Deine Hand' })

function bediene(info: TestInfo): (element: Locator) => Promise<void> {
  return info.project.use.hasTouch ? (element) => element.tap() : (element) => element.click()
}

async function oeffneSzenario(page: Page, name: string): Promise<void> {
  await page.goto(`/spiel?szenario=${name}&tempo=sofort`)
  await expect(zugleiste(page)).toBeVisible()
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
}

/** Dreht das Gerät: Breite und Höhe tauschen. */
async function drehe(page: Page): Promise<void> {
  const groesse = page.viewportSize()
  if (groesse === null) throw new Error('Testaufbau: Das Fenster hat keine feste Grösse.')
  await page.setViewportSize({ width: groesse.height, height: groesse.width })
}

/**
 * Was nach dem Drehen gleich sein muss, als Text zum Vergleichen. Texte als
 * `textContent`: `innerText` hinge vom Umbruch ab, und der ändert sich beim
 * Drehen gewollt.
 */
async function lage(page: Page): Promise<string> {
  return JSON.stringify({
    stand: await gespeichert(page),
    zugleiste: await zugleiste(page).textContent(),
    gedrueckt: await page.locator('[aria-pressed="true"]').evaluateAll((knoepfe) => knoepfe.map((knopf) => knopf.getAttribute('aria-label') ?? knopf.textContent)),
    protokoll: await page.getByRole('log', { name: 'Protokoll' }).textContent(),
    dialoge: await page.locator('dialog[open]').count(),
  })
}

async function erwarteImBild(page: Page, schritt: string): Promise<void> {
  expect(await waagrechterUeberstand(page), `${schritt}: Seite breiter als das Fenster`).toBe(0)
  const ausserhalb = await findeAusserhalbDesBildes(page)
  expect(ausserhalb, `${schritt}: Bedienelemente ausserhalb des Bildes:${befundListe(ausserhalb)}`).toEqual([])
  const abgeschnitten = await findeAbgeschnittenes(page)
  expect(abgeschnitten, `${schritt}: abgeschnitten:${befundListe(abgeschnitten)}`).toEqual([])
}

/** Dreht hin und zurück und prüft nach jedem Drehen, dass nichts verloren ist. */
async function dreheUndVergleiche(page: Page, wo: string): Promise<void> {
  const vorher = await lage(page)
  await drehe(page)
  await expect.poll(() => lage(page), { message: `${wo}: nach dem Drehen` }).toBe(vorher)
  await erwarteImBild(page, `${wo}, gedreht`)
  await drehe(page)
  await expect.poll(() => lage(page), { message: `${wo}: nach dem Zurückdrehen` }).toBe(vorher)
  await erwarteImBild(page, `${wo}, zurückgedreht`)
}

test.describe('O11 K5: Drehen mitten in der Partie verliert nichts', () => {
  test('O11 K5: mit gewählter Karte und mit Ansage', async ({ page }, info) => {
    const tippe = bediene(info)
    await oeffneSzenario(page, 'farbendieb')
    await tippe(hand(page).getByRole('button', { name: 'Sonderkarte Farbendieb' }))
    await dreheUndVergleiche(page, 'Karte gewählt')
    await tippe(page.getByRole('button', { name: 'KI-Gegner 1, Schlange 1, Karte 1: Farbkarte Blau, 1 Punkt', exact: true }))
    await dreheUndVergleiche(page, 'erstes Ziel gewählt')
    const ziel = page.getByRole('button', { name: 'Deine Schlange 1: zwischen Karte 1 und 2', exact: true })
    await ziel.scrollIntoViewIfNeeded()
    await tippe(ziel)
    await expect(zugleiste(page)).toContainText('Ansage:')
    await dreheUndVergleiche(page, 'Ansage')
    await tippe(zugleiste(page).getByRole('button', { name: 'Ausführen' }))
    await expect(zugleiste(page)).not.toContainText('Ansage:')
    await dreheUndVergleiche(page, 'nach dem Ausführen')
  })

  test('O11 K5: im Dialog „Zu viele Handkarten“ mit einer gewählten Karte', async ({ page }, info) => {
    const tippe = bediene(info)
    await oeffneSzenario(page, 'zu-viele-handkarten')
    const dialog = page.getByRole('dialog', { name: 'Zu viele Handkarten' })
    await tippe(dialog.getByRole('button', { name: 'Farbkarte Rot, 1 Punkt' }))
    await dreheUndVergleiche(page, 'Dialog')
    await expect(dialog).toBeVisible()
  })

  test('O11 K5: in der Grossansicht', async ({ page }, info) => {
    const tippe = bediene(info)
    await oeffneSzenario(page, 'start-erweiterung')
    await tippe(page.getByRole('region', { name: 'Offene Aufgaben' }).getByRole('button').first())
    const offen = page.getByRole('dialog')
    await expect(offen).toBeVisible()
    const titel = await offen.innerText()
    await drehe(page)
    await expect(offen).toBeVisible()
    expect(await offen.innerText()).toBe(titel)
    await drehe(page)
    await expect(offen).toBeVisible()
  })
})
