import { expect, test, type Page } from '@playwright/test'
import { erzeugeSzenario } from '../../src/entwicklung/szenarien'
import { neuePartie, volltisch } from '../../src/ui/tisch/__tests__/szenarien'
import { brichtImWort } from './barrierefreiheit_messung'
import { befundListe, findeAbgeschnittenes, findeAusserhalbDesBildes, kasten, waagrechterUeberstand } from './messung'
import { halteUhrAn, legeSpielstand, oeffne } from './oeffnen'

/*
O11, Feinschliff: Fenster unter den fünf Geräteklassen, hier das kleinste
verbreitete Querformat 568 × 320 (iPhone SE der ersten Generation), mit Touch.
Die Prüfer von O2b und O4 fanden dort eine Kopfleiste, deren Texte umbrachen
und „Zur Lobb“ abschnitten, eine Tischfläche, die seitlich 16 px abschnitt,
deine Schlangen, die 20 px Höhe zurückhielten, und in der Lobby einen Knopf
„Abbreche/n“ und Knöpfe ausserhalb des Bildes (TF-TISCH-004, TF-APP-018).
Der Prüfer von O11 fand dazu: Bist du selbst am Zug, lag die Zugleiste zum
Teil unter dem Bildrand, „mehr ↓“ auf „Zur Lobby“, und beim Ordnen der
Häutung war „Ausführen“ nicht erreichbar (TF-TISCH-049).
*/

test.use({ viewport: { width: 568, height: 320 }, hasTouch: true, isMobile: true })

test.describe('O11 (TF-TISCH-004): der Tisch bei 568 × 320', () => {
  test.beforeEach(async ({ page }) => {
    await halteUhrAn(page)
    await legeSpielstand(page, volltisch())
    await oeffne(page, '/spiel')
  })

  test('O11: „Zur Lobby“ steht ganz da, und kein Text der Kopfleiste liegt auf einem anderen', async ({ page }) => {
    const kopf = page.locator('.st-kopf')
    const lobby = kopf.getByRole('link', { name: 'Zur Lobby' })
    const knopf = await kasten(lobby)
    expect(await lobby.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), '„Zur Lobby“ schneidet seinen Text ab').toBe(true)
    expect(knopf.rechts, '„Zur Lobby“ ragt über das Fenster').toBeLessThanOrEqual(568)
    const ueberlappungen = await kopf.evaluate((wurzel) => {
      const teile = Array.from(wurzel.querySelectorAll('.st-statuszeile-titel, .st-statuszeile-text, .st-kopf-stapel, .st-abzeichen, a'))
      const boxen = teile.map((teil) => ({ teil: teil.textContent?.trim() ?? '', box: teil.getBoundingClientRect() }))
      const treffer: string[] = []
      for (let a = 0; a < boxen.length; a += 1) {
        for (let b = a + 1; b < boxen.length; b += 1) {
          const [x, y] = [boxen[a].box, boxen[b].box]
          if (x.width === 0 || y.width === 0) continue
          if (x.left < y.right - 1 && y.left < x.right - 1 && x.top < y.bottom - 1 && y.top < x.bottom - 1) treffer.push(`${boxen[a].teil} / ${boxen[b].teil}`)
        }
      }
      return treffer
    })
    expect(ueberlappungen, 'Texte der Kopfleiste übereinander').toEqual([])
    expect(await brichtImWort(lobby), '„Zur Lobby“ bricht mitten im Wort um').toBe(false)
  })

  test('O11: deine Schlangen halten keine Höhe zurück, und die Tischfläche schneidet seitlich nichts ab', async ({ page }) => {
    const eigene = page.getByRole('region', { name: 'Deine Schlangen' })
    const zurueck = await eigene.evaluate((el) => el.scrollHeight - el.clientHeight)
    expect(zurueck, `„Deine Schlangen“ hält ${zurueck} px zurück`).toBeLessThanOrEqual(1)
    const seitlich = await page.locator('.st-flaeche').evaluate((el) => el.scrollWidth - el.clientWidth)
    expect(seitlich, `die Tischfläche schneidet ${seitlich} px ab`).toBeLessThanOrEqual(1)
    expect(await waagrechterUeberstand(page)).toBe(0)
    const abgeschnitten = await findeAbgeschnittenes(page)
    expect(abgeschnitten, `abgeschnitten:${befundListe(abgeschnitten)}`).toEqual([])
  })
})

/**
 * Jedes Bedienelement am Tisch ist erreichbar, notfalls indem die Seite oder
 * sein Bereich scrollt: danach ganz im Fenster und an seiner Mitte frei. Kein
 * Zeichen „geht weiter“ liegt auf einem Bedienelement, und die Tischfläche
 * bleibt mindestens 100 px hoch.
 */
async function erwarteImEigenenZugBedienbar(page: Page, lage: string): Promise<void> {
  const knoepfe = page.locator('[data-testid="spiel"]').locator('button:visible, a[href]:visible')
  const anzahl = await knoepfe.count()
  expect(anzahl, `${lage}: Testaufbau, Bedienelemente am Tisch`).toBeGreaterThan(3)
  const befunde: string[] = []
  for (let stelle = 0; stelle < anzahl; stelle += 1) {
    const knopf = knoepfe.nth(stelle)
    await knopf.scrollIntoViewIfNeeded()
    const befund = await knopf.evaluate((element) => {
      const box = element.getBoundingClientRect()
      const name = element.getAttribute('aria-label') ?? (element.textContent ?? '').trim().slice(0, 40)
      if (box.top < -1 || box.bottom > window.innerHeight + 1 || box.left < -1 || box.right > window.innerWidth + 1) {
        return `${name}: nach dem Scrollen bei ${Math.round(box.top)}..${Math.round(box.bottom)}, Fenster ${window.innerHeight} px hoch`
      }
      const mitte = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)
      if (mitte === null || !(mitte === element || element.contains(mitte))) return `${name}: an der Mitte verdeckt von ${mitte?.className ?? 'nichts'}`
      for (const zeichen of Array.from(document.querySelectorAll('.st-weiter-zeichen'))) {
        const z = zeichen.getBoundingClientRect()
        if (z.left < box.right - 1 && box.left < z.right - 1 && z.top < box.bottom - 1 && box.top < z.bottom - 1) return `${name}: unter dem Zeichen „${(zeichen.textContent ?? '').trim()}“`
      }
      return null
    })
    if (befund !== null) befunde.push(befund)
  }
  expect(befunde, `${lage}: ${befunde.join(' · ')}`).toEqual([])
  const flaeche = await page.locator('.st-flaeche').evaluate((element) => element.getBoundingClientRect().height)
  expect(flaeche, `${lage}: Tischfläche ${Math.round(flaeche)} px hoch`).toBeGreaterThanOrEqual(100)
  expect(await waagrechterUeberstand(page), `${lage}: Seite breiter als das Fenster`).toBe(0)
}

test.describe('O11 (TF-TISCH-049): der eigene Zug bei 568 × 320', () => {
  const hand = (page: Page) => page.getByRole('region', { name: 'Deine Hand' })

  test('O11: am Zug, mit gewählter Karte und mit Ansage ist jede Aktion erreichbar', async ({ page }) => {
    await legeSpielstand(page, erzeugeSzenario('farbkarte-beim-gegner'))
    await oeffne(page, '/spiel')
    await erwarteImEigenenZugBedienbar(page, 'am Zug')
    await hand(page).getByRole('button', { name: 'Farbkarte Rot, 1 Punkt' }).tap()
    await erwarteImEigenenZugBedienbar(page, 'Karte gewählt')
    const ziel = page.getByRole('button', { name: 'KI-Gegner 1, Schlange 1: Ende', exact: true })
    await ziel.scrollIntoViewIfNeeded()
    await ziel.tap()
    await expect(page.getByRole('region', { name: 'Zugleiste' }).getByRole('button', { name: 'Ausführen' })).toBeVisible()
    await erwarteImEigenenZugBedienbar(page, 'Ansage')
  })

  test('O11: beim Ordnen der Häutung ist „Ausführen“ erreichbar und spielt die neue Folge', async ({ page }) => {
    await legeSpielstand(page, erzeugeSzenario('haeutung-punkte'))
    await oeffne(page, '/spiel')
    await hand(page).getByRole('button', { name: 'Sonderkarte Schlangenhäutung' }).tap()
    for (const name of ['Deine Schlange 1 wählen', 'Deine Schlange 1, Karte 1: Farbkarte Rot, 1 Punkt', 'Deine Schlange 1, Karte 3: Farbkarte Rot, 1 Punkt', 'Deine Schlange 1, Karte 1: Farbkarte Rot, 1 Punkt', 'Deine Schlange 1, Karte 2: Farbkarte Blau, 1 Punkt']) {
      const knopf = page.getByRole('button', { name, exact: true })
      await knopf.scrollIntoViewIfNeeded()
      await knopf.tap()
    }
    const ausfuehren = page.getByRole('region', { name: 'Zugleiste' }).getByRole('button', { name: 'Ausführen' })
    await expect(ausfuehren).toBeEnabled()
    await erwarteImEigenenZugBedienbar(page, 'Häutung ordnen')
    const vorher = await page.evaluate(() => window.localStorage.getItem('schlangentanz-v2:partie'))
    await ausfuehren.scrollIntoViewIfNeeded()
    await ausfuehren.tap()
    await expect.poll(() => page.evaluate(() => window.localStorage.getItem('schlangentanz-v2:partie'))).not.toBe(vorher)
  })
})

test.describe('O11 (TF-APP-018): die Lobby bei 568 × 320', () => {
  /** Kein Bedienelement liegt ausserhalb des Bildes, und eine offene Rückfrage liegt ganz darin. */
  async function erwarteAllesImBild(page: Page, lage: string): Promise<void> {
    const ausserhalb = await findeAusserhalbDesBildes(page)
    expect(ausserhalb, `${lage}: ausserhalb von 0 bis 320 px:${befundListe(ausserhalb)}`).toEqual([])
    const frage = page.getByRole('alertdialog')
    if ((await frage.count()) > 0) await expect(frage, `${lage}: die Rückfrage liegt ganz im Bild`).toBeInViewport({ ratio: 1 })
    expect(await waagrechterUeberstand(page), `${lage}: Seite breiter als das Fenster`).toBe(0)
  }

  test('O11: ohne Spielstand', async ({ page }) => {
    await oeffne(page, '/')
    await erwarteAllesImBild(page, 'leer')
  })

  test('O11: mit laufender Partie und mit offener Rückfrage; kein Knopf bricht mitten im Wort um', async ({ page }) => {
    await legeSpielstand(page, neuePartie())
    await oeffne(page, '/')
    await erwarteAllesImBild(page, 'laufende Partie')
    await page.getByRole('button', { name: 'Neue Partie' }).tap()
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await erwarteAllesImBild(page, 'Rückfrage')
    for (const name of ['Weiterspielen', 'Ja, neue Partie', 'Abbrechen']) {
      expect(await brichtImWort(page.getByRole('button', { name })), `„${name}“ bricht mitten im Wort um`).toBe(false)
    }
  })
})
