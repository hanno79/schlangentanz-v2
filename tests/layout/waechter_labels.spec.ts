import { expect, test, type Page } from '@playwright/test'
import { findeAusserhalbDesBildes, findeVerdeckteBedienelemente } from './messung'

/*
O2b, Iteration 2 (Mangel 1 im Protokoll, TF-PRUEF-025): Ein Auswahlfeld, das
unsichtbar klein ist und über sein Label bedient wird (Segmente und Schalter
der Lobby), zählt für die Wächter „ausserhalb des Bildes“ und „vollständig
verdeckt“ mit der Fläche seines Labels, so wie schon für die Tippfläche.
Vorher übersprangen beide Wächter das 1×1-px-Feld, und ein Schalter unter dem
Bildrand blieb unbemerkt.

Gemessen auf einer eigenen kleinen Seite, damit der Vertrag nur die Wächter
prüft und nicht die Lobby.
*/

const VERSTECKT =
  'position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip-path: inset(50%); border: 0;'

/** Ein Label mit verstecktem Kästchen; `stil` setzt die Lage des Labels. */
async function zeigeLabel(page: Page, stil: string, deckel = false): Promise<void> {
  await page.setContent(`
    <body style="margin: 0">
      <label style="display: block; position: absolute; left: 16px; width: 240px; height: 48px; ${stil}">
        Mit Erweiterung <input type="checkbox" style="${VERSTECKT}">
      </label>
      ${deckel ? '<div style="position: fixed; inset: 0; background: white; z-index: 1"></div>' : ''}
    </body>
  `)
}

test.describe('O2b: Wächter messen versteckte Auswahlfelder an ihrem Label', () => {
  test('O2b: ein Label unter dem Bildrand gilt als ausserhalb des Bildes', async ({ page }) => {
    await zeigeLabel(page, 'top: calc(100vh + 100px);')
    const befunde = await findeAusserhalbDesBildes(page)
    expect(befunde.map((befund) => befund.element)).toEqual([expect.stringContaining('Mit Erweiterung')])
  })

  test('O2b: ein zugedecktes Label gilt als vollständig verdeckt', async ({ page }) => {
    await zeigeLabel(page, 'top: 16px;', true)
    const befunde = await findeVerdeckteBedienelemente(page)
    expect(befunde.map((befund) => befund.element)).toEqual([expect.stringContaining('Mit Erweiterung')])
  })

  test('O2b: ein freies Label im Bild meldet keiner der beiden Wächter', async ({ page }) => {
    await zeigeLabel(page, 'top: 16px;')
    expect(await findeAusserhalbDesBildes(page)).toEqual([])
    expect(await findeVerdeckteBedienelemente(page)).toEqual([])
  })
})
