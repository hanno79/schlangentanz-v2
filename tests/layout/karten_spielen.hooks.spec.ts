import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'
import { serialisiere, zugBeendenGesperrt } from '../../src/engine'
import { erzeugeSzenario } from '../../src/entwicklung/szenarien'
import { SPIELSTAND_SCHLUESSEL } from '../../src/spielstand'
import { befundListe, findeAbgeschnittenes, findeKleineTippflaechen, kasten, waagrechterUeberstand } from './messung'
import { ausserhalbDesFensters, unerreichbareZiele } from './ziele_messung'

/*
O5 im echten Browser, in jeder Geräteklasse: Karten spielen mit der Maus auf
dem Desktop und mit dem Finger auf Tablet und Handy (Kriterium 9). Die
Spielstände kommen über `/spiel?szenario=` aus dem Testhook-Build; `tempo=sofort`
lässt die KI danach ohne Pause spielen.

Bei jedem Schritt der Zielwahl ist jedes angebotene Ziel erreichbar und frei,
die Zugleiste steht ganz im Bild, und die Seite wird nicht breiter.
*/

const gespeichert = (page: Page) => page.evaluate((schluessel) => window.localStorage.getItem(schluessel), SPIELSTAND_SCHLUESSEL)

/** Tippen mit Touch-Geräten, sonst klicken. */
function bediene(info: TestInfo): (element: Locator) => Promise<void> {
  return info.project.use.hasTouch ? (element) => element.tap() : (element) => element.click()
}

async function oeffneSzenario(page: Page, name: string): Promise<void> {
  await page.goto(`/spiel?szenario=${name}&tempo=sofort`)
  await expect(page.getByRole('region', { name: 'Zugleiste' })).toBeVisible()
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
}

const zugleiste = (page: Page) => page.getByRole('region', { name: 'Zugleiste' })
const hand = (page: Page) => page.getByRole('region', { name: 'Deine Hand' })

/** Was bei jedem Schritt der Zielwahl gelten muss. */
async function pruefeSchritt(page: Page, schritt: string): Promise<void> {
  const { gezaehlt, befunde } = await unerreichbareZiele(page)
  expect(befunde, `${schritt}: ${befunde.length} von ${gezaehlt} Zielen nicht frei erreichbar:${befundListe(befunde)}`).toEqual([])
  expect(await waagrechterUeberstand(page), `${schritt}: Seite breiter als das Fenster`).toBe(0)
  expect(await ausserhalbDesFensters(page, '[aria-label="Zugleiste"] button'), `${schritt}: Knöpfe der Zugleiste`).toEqual([])
  const klein = await findeKleineTippflaechen(page)
  expect(klein, `${schritt}: zu kleine Tippflächen:${befundListe(klein)}`).toEqual([])
  const abgeschnitten = await findeAbgeschnittenes(page)
  expect(abgeschnitten, `${schritt}: abgeschnitten:${befundListe(abgeschnitten)}`).toEqual([])
}

/* Je Karte der Weg durch die Ziele bis vor „Ausführen“, mit den zugänglichen Namen der Ziele. */
const WEGE: { szenario: string; karte: string; ziele: string[]; zugleiste?: RegExp }[] = [
  { szenario: 'farbkarte-beim-gegner', karte: 'Farbkarte Rot, 1 Punkt', ziele: ['KI-Gegner 1, Schlange 1: Ende'] },
  { szenario: 'farbendieb', karte: 'Sonderkarte Farbendieb', ziele: ['KI-Gegner 1, Schlange 1, Karte 1: Farbkarte Blau, 1 Punkt', 'Deine Schlange 1: zwischen Karte 1 und 2'] },
  { szenario: 'frass-zwei-spieler', karte: 'Sonderkarte Schlangenfrass', zugleiste: /^c\)/, ziele: ['KI-Gegner 1, Schlange 1, Karte 3: Farbkarte Blau, 1 Punkt', 'KI-Gegner 2, Schlange 1, Karte 1: Farbkarte Gelb, 1 Punkt'] },
  { szenario: 'blockade-abwehr', karte: 'Sonderkarte Schlangenblockade', ziele: ['KI-Gegner 1, Schlange 1 wählen', 'KI-Gegner 1, Schlange 1: zwischen Karte 2 und 3'] },
  { szenario: 'fusion-eigen', karte: 'Sonderkarte Farbenfusion', ziele: ['Deine Schlange 1, Karte 1: Farbkarte Blau, 1 Punkt', 'Deine Schlange 1, Karte 2: Farbkarte Blau, 1 Punkt'] },
  { szenario: 'schlangengrube', karte: 'Sonderkarte Schlangengrube', ziele: ['KI-Gegner 1 wählen'] },
  { szenario: 'nur-sonderkarten', karte: 'Sonderkarte Schlangenblockade', ziele: ['Ohne Wirkung auf deine Ablage'] },
]

test.describe('O5 K9: Karten spielen mit Maus und Finger', () => {
  for (const weg of WEGE) {
    test(`O5 K9/K3: ${weg.karte} in „${weg.szenario}“: jeder Schritt erreichbar, Ansage, Ausführen`, async ({ page }, info) => {
      const tippe = bediene(info)
      await oeffneSzenario(page, weg.szenario)
      const start = await gespeichert(page)
      expect(start).toBe(serialisiere(erzeugeSzenario(weg.szenario)))
      await tippe(hand(page).getByRole('button', { name: weg.karte }).first())
      await expect(hand(page).getByRole('button', { name: weg.karte }).first()).toHaveAttribute('aria-pressed', 'true')
      await pruefeSchritt(page, `${weg.karte} gewählt`)
      if (weg.zugleiste !== undefined) {
        await tippe(zugleiste(page).getByRole('button', { name: weg.zugleiste }))
        await pruefeSchritt(page, 'Option gewählt')
      }
      for (const ziel of weg.ziele) {
        const knopf = page.getByRole('button', { name: ziel, exact: true })
        await knopf.scrollIntoViewIfNeeded()
        await tippe(knopf)
        await pruefeSchritt(page, `${ziel} gewählt`)
      }
      const ausfuehren = zugleiste(page).getByRole('button', { name: 'Ausführen' })
      await expect(ausfuehren).toBeVisible()
      expect(await gespeichert(page), 'vor „Ausführen“ ist nichts gespielt').toBe(start)
      await tippe(ausfuehren)
      await expect.poll(() => gespeichert(page), { message: 'nach „Ausführen“ ist gespielt' }).not.toBe(start)
    })
  }

  test('O5 K9/K5: nach einer Farbkarte beendet „Zug beenden“ den Zug', async ({ page }, info) => {
    const tippe = bediene(info)
    await oeffneSzenario(page, 'farbkarte-beim-gegner')
    const zugBeenden = zugleiste(page).getByRole('button', { name: 'Zug beenden' })
    await expect(zugBeenden).toBeDisabled()
    await tippe(hand(page).getByRole('button', { name: 'Farbkarte Blau, 1 Punkt' }))
    await tippe(page.getByRole('button', { name: 'Deine Schlange 1: Ende', exact: true }))
    await tippe(zugleiste(page).getByRole('button', { name: 'Ausführen' }))
    await expect(zugBeenden).toBeEnabled()
    const vorher = await gespeichert(page)
    await tippe(zugBeenden)
    await expect.poll(() => gespeichert(page), { message: 'der Zug ist beendet' }).not.toBe(vorher)
    // Danach ist ein Gegner dran, oder dein neuer Zug beginnt ohne gespielte Karte: beenden geht nicht.
    await expect(zugleiste(page).getByRole('button', { name: 'Zug beenden', disabled: false })).toHaveCount(0)
  })

  test('O5 K9/K1: Escape und nochmaliges Antippen heben die Auswahl auf', async ({ page }, info) => {
    const tippe = bediene(info)
    await oeffneSzenario(page, 'farbkarte-beim-gegner')
    const rot = hand(page).getByRole('button', { name: 'Farbkarte Rot, 1 Punkt' })
    await tippe(rot)
    await expect(page.locator('[data-ziel]')).toHaveCount(6)
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-ziel]')).toHaveCount(0)
    await tippe(rot)
    await expect(page.locator('[data-ziel]')).toHaveCount(6)
    await tippe(rot)
    await expect(page.locator('[data-ziel]')).toHaveCount(0)
    await expect(rot).toHaveAttribute('aria-pressed', 'false')
  })

  test('O5 K9/K8: zu viele Handkarten: der Dialog steht ganz im Bild, zwei Karten ablegen', async ({ page }, info) => {
    const tippe = bediene(info)
    await oeffneSzenario(page, 'zu-viele-handkarten')
    const dialog = page.getByRole('dialog', { name: 'Zu viele Handkarten' })
    await expect(dialog).toBeVisible()
    const fenster = page.viewportSize()!
    const rahmen = await kasten(dialog)
    expect(rahmen.oben, 'Dialog oben im Bild').toBeGreaterThanOrEqual(0)
    expect(rahmen.unten, 'Dialog unten im Bild').toBeLessThanOrEqual(fenster.height)
    expect(await waagrechterUeberstand(page)).toBe(0)
    const karten = dialog.locator('button[aria-pressed]')
    await expect(karten).toHaveCount(7)
    const klein = await findeKleineTippflaechen(page)
    expect(klein, `zu kleine Tippflächen:${befundListe(klein)}`).toEqual([])
    const start = await gespeichert(page)
    const ablegen = dialog.getByRole('button', { name: 'Ablegen' })
    await tippe(karten.nth(0))
    await expect(ablegen).toBeDisabled()
    await karten.nth(6).scrollIntoViewIfNeeded()
    await tippe(karten.nth(6))
    await expect(ablegen).toBeEnabled()
    await tippe(ablegen)
    await expect(dialog).toBeHidden()
    expect(await gespeichert(page)).not.toBe(start)
  })

  test('O5 Iteration 2: neben dem gesperrten „Zug beenden“ steht der Grund der Engine, auch mit gewählter Karte und Ansage', async ({ page }, info) => {
    const tippe = bediene(info)
    await oeffneSzenario(page, 'farbkarte-beim-gegner')
    const grund = zugBeendenGesperrt(erzeugeSzenario('farbkarte-beim-gegner'))!
    const zugBeenden = zugleiste(page).getByRole('button', { name: 'Zug beenden' })
    const pruefe = async (lage: string) => {
      await expect(zugBeenden, lage).toBeDisabled()
      await expect(zugBeenden, lage).toHaveAccessibleDescription(grund)
      const text = zugleiste(page).getByText(grund)
      await expect(text, lage).toBeInViewport({ ratio: 1 })
      const [k, g] = [await kasten(zugBeenden), await kasten(text)]
      const abstand = Math.max(0, k.links - g.rechts, g.links - k.rechts, k.oben - g.unten, g.oben - k.unten)
      expect(abstand, `${lage}: der Grund steht neben dem Knopf`).toBeLessThanOrEqual(16)
      expect(await waagrechterUeberstand(page), lage).toBe(0)
    }
    await pruefe('ohne Karte')
    await tippe(hand(page).getByRole('button', { name: 'Farbkarte Rot, 1 Punkt' }))
    await pruefe('Karte gewählt')
    await tippe(page.getByRole('button', { name: 'KI-Gegner 1, Schlange 1: Ende', exact: true }))
    await pruefe('Ansage')
  })

  test('O5: „Zur Lobby“ bleibt mitten in der Zielwahl bedienbar und führt zur Lobby', async ({ page }, info) => {
    const tippe = bediene(info)
    await oeffneSzenario(page, 'farbendieb')
    await tippe(hand(page).getByRole('button', { name: 'Sonderkarte Farbendieb' }))
    await tippe(page.getByRole('link', { name: 'Zur Lobby' }))
    await expect(page.getByTestId('lobby')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Weiterspielen' })).toBeVisible()
  })
})
