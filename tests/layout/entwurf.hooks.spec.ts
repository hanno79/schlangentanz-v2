import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'
import { duldeBekannteAusnahmen } from './ausnahmen'
import { befundListe, kasten, type Befund } from './messung'
import { nichtsIstStillgelegt, waechterVertraege } from './waechter'

/*
O1, Kriterium 3: Die drei Entwurfsseiten (Lobby, Tisch, Ergebnis) zeigen in
jeder Geräteklasse alles ohne waagrechtes Scrollen; nichts ist abgeschnitten
oder überdeckt.

Die Entwürfe sind wie die spätere App gebaut: Was nicht auf den Schirm passt,
scrollt in einem eigenen Bereich, und die Bedienleiste unten steht fest. Deshalb
gelten hier die Wächter ohne Ausnahme, auch „kein Bedienelement ausserhalb des
Bildes“: Ein Knopf, den man erst durch Scrollen der ganzen Seite findet, wäre
auf dem Handy ein Fehler.

Der Tisch wird in drei Zuständen gemessen, weil sich die Zugleiste und die
Schlangen mit der Auswahl ändern: ohne Auswahl, mit einer Farbkarte (Ziele an
den Schlangenenden) und mit dem Farbendieb (Ziele sind Karten der Gegner).
*/

// Die Entwürfe sind unter drei Geräteklassen abgenommen und werden nicht
// nachgebessert; was in Handy quer rot ist, steht in tests/layout/geraeteklassen_ausnahmen.json (P0.3c).
duldeBekannteAusnahmen()

const SEITEN: { adresse: string; leitelement: string }[] = [
  { adresse: '/dev/entwurf', leitelement: 'entwurf-uebersicht' },
  { adresse: '/dev/entwurf/lobby', leitelement: 'entwurf-lobby' },
  { adresse: '/dev/entwurf/tisch', leitelement: 'entwurf-tisch' },
  { adresse: '/dev/entwurf/tisch?gegner=1', leitelement: 'entwurf-tisch' },
  { adresse: '/dev/entwurf/tisch?karte=rot-01', leitelement: 'entwurf-tisch' },
  { adresse: '/dev/entwurf/tisch?karte=farbendieb-01', leitelement: 'entwurf-tisch' },
  { adresse: '/dev/entwurf/ergebnis', leitelement: 'entwurf-ergebnis' },
]

async function oeffneEntwurf(page: Page, adresse: string, leitelement: string): Promise<void> {
  await page.goto(adresse)
  await expect(page.getByTestId(leitelement), `${adresse} hat ${leitelement} nicht aufgebaut`).toBeVisible()
}

/** Tippen mit Touch-Geräten, sonst klicken: so bedient der Mensch die Klasse. */
function bediene(info: TestInfo): (element: Locator) => Promise<void> {
  return info.project.use.hasTouch ? (element) => element.tap() : (element) => element.click()
}

/** Bilder, die nicht geladen sind oder kein Pixel haben. */
async function kaputteBilder(page: Page): Promise<string[]> {
  return page.evaluate(async () => {
    const bilder = Array.from(document.images)
    await Promise.all(bilder.map((bild) => (bild.complete ? null : bild.decode().catch(() => null))))
    return bilder.filter((bild) => !bild.complete || bild.naturalWidth === 0).map((bild) => bild.src)
  })
}

/** Sichtbare Bedienelemente unter 44 × 44 px (Plan O4.5, Touch-Ziele). */
async function zuKleineBedienelemente(page: Page): Promise<Befund[]> {
  return page.evaluate(() => {
    const befunde: { element: string; detail: string }[] = []
    for (const element of Array.from(document.querySelectorAll('button, a[href], [role="button"], input, select'))) {
      if (!(element as HTMLElement).checkVisibility()) continue
      const box = element.getBoundingClientRect()
      if (box.width < 2 || box.height < 2) continue
      if (box.width >= 43.5 && box.height >= 43.5) continue
      const name = element.getAttribute('aria-label') || (element.textContent || '').trim().slice(0, 30)
      befunde.push({ element: `${element.tagName} "${name}"`, detail: `${Math.round(box.width)}×${Math.round(box.height)} px` })
    }
    return befunde
  })
}

for (const { adresse, leitelement } of SEITEN) {
  test.describe(`O1: Entwurf ${adresse} passt in die Geräteklasse`, () => {
    test.beforeEach(async ({ page }) => {
      await oeffneEntwurf(page, adresse, leitelement)
    })

    test('O1: die Seite ist nicht breiter als das Fenster', async ({ page }) => {
      const { scrollBreite, fensterBreite } = await page.evaluate(() => ({
        scrollBreite: document.documentElement.scrollWidth,
        fensterBreite: document.documentElement.clientWidth,
      }))
      expect(scrollBreite, `Seite ${scrollBreite} px breit bei ${fensterBreite} px Fenster`).toBeLessThanOrEqual(
        fensterBreite,
      )
    })

    test('O1: jedes Bild ist geladen', async ({ page }) => {
      expect(await kaputteBilder(page), 'nicht geladene Bilder').toEqual([])
    })

    // Gilt auch mit Maus: dieselbe Fläche, keine zweite Gestaltung je Eingabeart.
    test('O1: jedes Bedienelement ist mindestens 44 px gross', async ({ page }) => {
      const befunde = await zuKleineBedienelemente(page)
      expect(befunde, `${befunde.length} Bedienelement(e) unter 44 px:${befundListe(befunde)}`).toEqual([])
    })

    waechterVertraege()
    nichtsIstStillgelegt()
  })
}

test.describe('O1: Entwurf Tisch — Karte wählen, dann Ziel wählen', () => {
  test.beforeEach(async ({ page }) => {
    await oeffneEntwurf(page, '/dev/entwurf/tisch', 'entwurf-tisch')
  })

  test('O1: eigene Hand und eigene Schlangen sind als „deine“ beschriftet und sichtbar', async ({ page }) => {
    await expect(page.getByRole('region', { name: 'Deine Hand' })).toBeVisible()
    await expect(page.getByRole('region', { name: 'Deine Schlangen' })).toBeVisible()
    const hand = page.getByRole('region', { name: 'Deine Hand' }).getByRole('button')
    expect(await hand.count(), 'Handkarten im Entwurf').toBe(5)
  })

  test('O1: Farbendieb wählen zeigt die Ziele, ein Ziel wählen bietet „Ausführen“ an', async ({ page }, info) => {
    const tippe = bediene(info)
    const farbendieb = page.getByRole('button', { name: 'Sonderkarte Farbendieb' })
    await tippe(farbendieb)
    await expect(farbendieb).toHaveAttribute('aria-pressed', 'true')

    const ziele = page.locator('[data-ziel]')
    expect(await ziele.count(), 'Ziele nach der Wahl des Farbendiebs').toBeGreaterThan(0)
    await ziele.first().scrollIntoViewIfNeeded()
    await tippe(ziele.first())

    const zugleiste = page.getByRole('region', { name: 'Zugleiste' })
    await expect(zugleiste.getByRole('button', { name: 'Ausführen' })).toBeVisible()
    await expect(zugleiste.getByRole('button', { name: 'Abbrechen' })).toBeVisible()
  })

  test('O1: eine Aufgabe lässt sich gross ansehen und ist dort mindestens 280 px breit', async ({ page }, info) => {
    const tippe = bediene(info)
    await tippe(page.getByRole('button', { name: /^Aufgabe Farbenpracht/ }).first())
    const lupe = page.getByRole('dialog')
    await expect(lupe).toBeVisible()
    const { breite } = await kasten(lupe.getByRole('img'))
    expect(breite, 'Breite der Karte in der Grossansicht').toBeGreaterThanOrEqual(280)
    await tippe(lupe.getByRole('button', { name: 'Schliessen' }))
    await expect(lupe).toBeHidden()
  })
})

test.describe('O1: Entwurf Ergebnis', () => {
  test('O1: Wertung je Spieler und der Sieger stehen als Text da, nicht nur als Farbe', async ({ page }) => {
    await oeffneEntwurf(page, '/dev/entwurf/ergebnis', 'entwurf-ergebnis')
    const plaetze = page.getByRole('listitem')
    expect(await plaetze.count(), 'Plätze in der Rangliste').toBe(4)
    await expect(plaetze.first()).toContainText('Sieger')
    await expect(page.getByRole('button', { name: 'Neue Partie' })).toBeVisible()
  })
})

test.describe('O1: Entwurf Lobby', () => {
  test('O1: 1 bis 3 Gegner, Erweiterung an/aus, Neue Partie und Weiterspielen', async ({ page }, info) => {
    const tippe = bediene(info)
    await oeffneEntwurf(page, '/dev/entwurf/lobby', 'entwurf-lobby')
    for (const zahl of ['1', '2', '3']) {
      await expect(page.getByRole('button', { name: `${zahl} Gegner`, exact: true })).toBeVisible()
    }
    const schalter = page.getByRole('switch', { name: /Erweiterung/ })
    const vorher = await schalter.getAttribute('aria-checked')
    await tippe(schalter)
    await expect(schalter).not.toHaveAttribute('aria-checked', vorher ?? '')
    await expect(page.getByRole('button', { name: 'Neue Partie' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Weiterspielen' })).toBeVisible()
  })
})
