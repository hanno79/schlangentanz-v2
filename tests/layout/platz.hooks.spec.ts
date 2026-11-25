import { expect, test, type Page } from '@playwright/test'
import { hoeheVon } from './messung'

/*
O11, Feinschliff aus den Prüfungen von O5 und O7: In Handy quer (844 × 390,
Touch) blieb der Tischfläche mit einer gewählten Karte und beim Ordnen einer
Schlangenhäutung zu wenig Höhe (157 bzw. 106 px), weil das gesperrte „Zug
beenden“ mit seinem dreizeiligen Grund in der Zugleiste stand (O5 Hinweis 2,
O7 Hinweis 1). Das Fenster ist hier fest eingestellt, damit jede Geräteklasse
dieselbe Lage misst. Das Protokoll auf dem Desktop misst `platz.spec.ts`.
*/

const zugleiste = (page: Page) => page.getByRole('region', { name: 'Zugleiste' })
const hand = (page: Page) => page.getByRole('region', { name: 'Deine Hand' })
const flaeche = (page: Page) => page.locator('.st-flaeche')

/** Öffnet `/spiel` mit diesen Testhooks, etwa `szenario=haeutung-punkte`. */
async function oeffneSzenario(page: Page, parameter: string): Promise<void> {
  await page.goto(`/spiel?${parameter.includes('=') ? parameter : `szenario=${parameter}`}&tempo=sofort`)
  await expect(zugleiste(page)).toBeVisible()
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
}

test.describe('O11: Handy quer lässt der Tischfläche Höhe', () => {
  test.use({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true })

  test('O11: mit gewählter Karte misst die Tischfläche mindestens 200 px', async ({ page }) => {
    await oeffneSzenario(page, 'farbkarte-beim-gegner')
    await hand(page).getByRole('button', { name: 'Farbkarte Rot, 1 Punkt' }).tap()
    await expect(zugleiste(page)).toContainText('Lege die Karte')
    const hoehe = await hoeheVon(flaeche(page))
    expect(hoehe, `Tischfläche mit gewählter Karte: ${hoehe} px`).toBeGreaterThanOrEqual(200)
  })

  test('O11: beim Ordnen der Häutung misst die Tischfläche mindestens 150 px', async ({ page }) => {
    await oeffneSzenario(page, 'haeutung-punkte')
    await hand(page).getByRole('button', { name: 'Sonderkarte Schlangenhäutung' }).tap()
    await page.getByRole('button', { name: 'Deine Schlange 1 wählen' }).tap()
    await page.getByRole('button', { name: 'Deine Schlange 1, Karte 1: Farbkarte Rot, 1 Punkt' }).tap()
    await page.getByRole('button', { name: 'Deine Schlange 1, Karte 3: Farbkarte Rot, 1 Punkt' }).tap()
    await expect(zugleiste(page)).toContainText('Deine Punkte')
    const hoehe = await hoeheVon(flaeche(page))
    expect(hoehe, `Tischfläche beim Ordnen: ${hoehe} px`).toBeGreaterThanOrEqual(150)
  })

  test('O11: ohne gewählte Karte steht das gesperrte „Zug beenden“ mit seinem Grund da', async ({ page }) => {
    await oeffneSzenario(page, 'farbkarte-beim-gegner')
    const knopf = zugleiste(page).getByRole('button', { name: 'Zug beenden' })
    await expect(knopf).toBeDisabled()
    await expect(knopf).toHaveAccessibleDescription(/mindestens eine Karte/)
  })
})
