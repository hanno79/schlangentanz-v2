import { expect, test, type Page } from '@playwright/test'
import { findeAusserhalbDesBildes, findeKleineTippflaechen, findeVerdeckteBedienelemente } from './messung'

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

/*
O11 (TF-PRUEF-027): Umgekehrt gibt es sichtbare Felder, deren Label nur
vorgelesen wird (1 × 1 px). Gemessen wird dann das Feld selbst: Es zählt die
grösste Fläche aus Feld und Labels, nicht nur die der Labels.
*/

/** Ein sichtbares Textfeld 240 × 48 px mit einem Label, das nur vorgelesen wird. */
async function zeigeFeld(page: Page, stil: string, deckel = false): Promise<void> {
  await page.setContent(`
    <body style="margin: 0">
      <label for="feld" style="${VERSTECKT}">Suche</label>
      <input id="feld" type="text" style="position: absolute; left: 16px; width: 240px; height: 48px; box-sizing: border-box; ${stil}">
      ${deckel ? '<div style="position: fixed; inset: 0; background: white; z-index: 1"></div>' : ''}
    </body>
  `)
}

test.describe('O11 (TF-PRUEF-027): Wächter messen ein sichtbares Feld mit nur vorgelesenem Label am Feld', () => {
  test('O11: ein Feld 100 px unter dem Bildrand gilt als ausserhalb des Bildes', async ({ page }) => {
    await zeigeFeld(page, 'top: calc(100vh + 100px);')
    expect(await findeAusserhalbDesBildes(page)).toHaveLength(1)
  })

  test('O11: ein zugedecktes Feld gilt als vollständig verdeckt', async ({ page }) => {
    await zeigeFeld(page, 'top: 16px;', true)
    expect(await findeVerdeckteBedienelemente(page)).toHaveLength(1)
  })

  test('O11: ein freies Feld im Bild ist gross genug und meldet keiner der Wächter', async ({ page }) => {
    await zeigeFeld(page, 'top: 16px;')
    expect(await findeAusserhalbDesBildes(page)).toEqual([])
    expect(await findeVerdeckteBedienelemente(page)).toEqual([])
    expect(await findeKleineTippflaechen(page)).toEqual([])
  })
})
