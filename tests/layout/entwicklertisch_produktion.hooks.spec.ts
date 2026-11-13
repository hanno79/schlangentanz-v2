import { expect, test, type Page } from '@playwright/test'

/*
P0.4 Kriterium 3: Im Produktionsbuild ist `/dev` nicht erreichbar.

Der Vertrag liegt im Testhook-Auftrag, weil er beide Builds gegeneinander misst:
Der Produktionsbuild (:4173, vom ersten `webServer` gestartet) darf den Tisch
weder zeigen noch nachladen, der Testhook-Build (:4174) muss es. Ohne die
Gegenprobe bliebe der Vertrag auch dann grün, wenn der Tisch nirgends mehr lädt.
Dass sein Code gar nicht erst im Bundle steht, prüft
`tests/entwicklertisch_bundle.test.ts`.
*/

const PRODUKTION = 'http://localhost:4173'
const TESTHOOKS = 'http://localhost:4174'

/** Öffnet die Adresse und gibt jede dabei angefragte URL zurück. */
async function oeffneUndSammle(page: Page, adresse: string): Promise<string[]> {
  const anfragen: string[] = []
  page.on('request', (anfrage) => anfragen.push(anfrage.url()))
  await page.goto(adresse)
  return anfragen
}

test.describe('P0.4 K3: /dev im Produktionsbuild', () => {
  for (const pfad of ['/dev?seed=1&spieler=2', '/dev/szenarien', '/dev?szenario=spielende']) {
    test(`P0.4 K3: ${pfad} kennt der Produktionsbuild nicht, und er lädt nichts nach`, async ({ page }) => {
      const anfragen = await oeffneUndSammle(page, `${PRODUKTION}${pfad}`)
      // Seit O2 zeigt eine Adresse, die die App nicht kennt, „Diese Seite gibt es nicht“.
      await expect(page.getByTestId('unbekannte-seite')).toBeVisible()
      await expect(page.getByTestId('entwicklertisch')).toHaveCount(0)
      expect(anfragen.filter((url) => /entwicklertisch/i.test(url))).toEqual([])
    })
  }

  test('P0.4 K3 Gegenprobe: derselbe Pfad lädt im Testhook-Build den Tisch als eigenen Chunk', async ({ page }) => {
    const anfragen = await oeffneUndSammle(page, `${TESTHOOKS}/dev?seed=1&spieler=2`)
    await expect(page.getByTestId('entwicklertisch')).toBeVisible()
    await expect(page.getByTestId('unbekannte-seite')).toHaveCount(0)
    expect(anfragen.filter((url) => /entwicklertisch/i.test(url)).length).toBeGreaterThan(0)
  })
})
