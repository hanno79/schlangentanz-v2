import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'
import { erwarteGrundlagen, merkmaleOhneFarbe, unterschiedOhneFarbe } from './barrierefreiheit_messung'
import { oeffne } from './oeffnen'

/*
O11 im Testhook-Build, in jeder Geräteklasse: die Lagen, die man nur mitten in
einer Partie sieht (Karte gewählt, Ansage, Abwehrfrage, Häutung, Wertung,
Erweiterung mit Grossansicht). In jeder Lage meldet axe keinen schweren Befund,
kein Text steht unter 4,5 : 1, und bei „weniger Bewegung“ bewegt sich nichts
(Kriterien 3 und 4).

„Farbe ist nie das einzige Merkmal“ (Kriterium 3): Jedes Bedienelement, das
einen Zustand hat (gewählt, gedrückt, an), sieht in diesem Zustand auch ohne
Farbe anders aus. Verglichen wird dasselbe Element vor und nach dem Wechsel.
„Schneller“ prüft `barrierefreiheit.spec.ts` im Volltisch mit angehaltener
Uhr; hier lädt der Testhook-Build die Seite erst nach, und bei angehaltener
Uhr erschiene sie nie.
*/

// Die Adresse des Testhooks steht in jedem `*.hooks.spec.ts` selbst (src/layout_hooks_namensgebung.test.ts).
async function oeffneSzenario(page: Page, name: string): Promise<void> {
  await page.goto(`/spiel?szenario=${name}&tempo=sofort`)
  await expect(page.getByRole('region', { name: 'Zugleiste' })).toBeVisible()
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
}

/** Tippen mit Touch-Geräten, sonst klicken. */
function bediene(info: TestInfo): (element: Locator) => Promise<void> {
  return info.project.use.hasTouch ? (element) => element.tap() : (element) => element.click()
}

const hand = (page: Page) => page.getByRole('region', { name: 'Deine Hand' })
const zugleiste = (page: Page) => page.getByRole('region', { name: 'Zugleiste' })

test.describe('O11 K3/K4: Lagen mitten in der Partie', () => {
  test('O11 K3/K4: Karte gewählt, dann Ansage', async ({ page }, info) => {
    const tippe = bediene(info)
    await oeffneSzenario(page, 'farbkarte-beim-gegner')
    await erwarteGrundlagen(page, 'am Zug')
    await tippe(hand(page).getByRole('button', { name: 'Farbkarte Rot, 1 Punkt' }))
    await erwarteGrundlagen(page, 'Karte gewählt')
    await tippe(page.getByRole('button', { name: 'KI-Gegner 1, Schlange 1: Ende', exact: true }))
    await expect(zugleiste(page).getByRole('button', { name: 'Ausführen' })).toBeVisible()
    await erwarteGrundlagen(page, 'Ansage')
  })

  test('O11 K3/K4: die Abwehrfrage', async ({ page }) => {
    await oeffneSzenario(page, 'angriff-auf-dich')
    await expect(zugleiste(page).getByRole('button', { name: 'Abwehren' })).toBeVisible()
    await erwarteGrundlagen(page, 'Abwehrfrage')
  })

  test('O11 K3/K4: die Schlangenhäutung beim Ordnen', async ({ page }, info) => {
    const tippe = bediene(info)
    await oeffneSzenario(page, 'haeutung-punkte')
    await tippe(hand(page).getByRole('button', { name: 'Sonderkarte Schlangenhäutung' }))
    await tippe(page.getByRole('button', { name: 'Deine Schlange 1 wählen' }))
    await tippe(page.getByRole('button', { name: 'Deine Schlange 1, Karte 1: Farbkarte Rot, 1 Punkt' }))
    await tippe(page.getByRole('button', { name: 'Deine Schlange 1, Karte 3: Farbkarte Rot, 1 Punkt' }))
    await expect(zugleiste(page)).toContainText('Deine Punkte')
    await erwarteGrundlagen(page, 'Häutung ordnen')
  })

  test('O11 K3/K4: die Wertung', async ({ page }) => {
    await page.goto('/spiel?szenario=wertung-beispiele')
    await expect(page.getByTestId('ergebnis')).toBeVisible()
    await erwarteGrundlagen(page, 'Wertung')
  })

  test('O11 K3/K4: mit Erweiterung, auch mit offener Grossansicht einer Aufgabe', async ({ page }, info) => {
    const tippe = bediene(info)
    await oeffneSzenario(page, 'start-erweiterung')
    await erwarteGrundlagen(page, 'Erweiterung')
    await tippe(page.getByRole('region', { name: 'Offene Aufgaben' }).getByRole('button').first())
    await expect(page.getByRole('dialog')).toBeVisible()
    await erwarteGrundlagen(page, 'Grossansicht')
  })
})

test.describe('O11 K3: Farbe ist nie das einzige Merkmal', () => {
  test('O11 K3: eine gewählte Handkarte und ein gewähltes Ziel sehen auch ohne Farbe anders aus', async ({ page }, info) => {
    const tippe = bediene(info)
    await oeffneSzenario(page, 'farbkarte-beim-gegner')
    const karte = hand(page).getByRole('button', { name: 'Farbkarte Rot, 1 Punkt' })
    const vorher = await merkmaleOhneFarbe(karte)
    await tippe(karte)
    await expect(karte).toHaveAttribute('aria-pressed', 'true')
    expect(unterschiedOhneFarbe(vorher, await merkmaleOhneFarbe(karte)), 'gewählte Handkarte').not.toEqual([])

    const ziel = page.getByRole('button', { name: 'KI-Gegner 1, Schlange 1: Ende', exact: true })
    const angeboten = await merkmaleOhneFarbe(ziel)
    await tippe(ziel)
    await expect(ziel).toHaveAttribute('aria-pressed', 'true')
    expect(unterschiedOhneFarbe(angeboten, await merkmaleOhneFarbe(ziel)), 'gewähltes Ziel').not.toEqual([])
  })

  test('O11 K3: die gewählte Gegnerzahl der Lobby sieht auch ohne Farbe anders aus', async ({ page }, info) => {
    const tippe = bediene(info)
    await oeffne(page, '/')
    const zwei = page.locator('.lobby__segment', { has: page.getByRole('radio', { name: '2 Gegner' }) })
    const flaeche = zwei.locator(':scope > span')
    const ungewaehlt = await merkmaleOhneFarbe(flaeche)
    await tippe(zwei)
    await expect(page.getByRole('radio', { name: '2 Gegner' })).toBeChecked()
    expect(unterschiedOhneFarbe(ungewaehlt, await merkmaleOhneFarbe(flaeche)), 'Segment „2“ gewählt und nicht gewählt unterscheiden sich nur in der Farbe').not.toEqual([])
  })
})
