import { expect, test, type Page } from '@playwright/test'
import { serialisiere } from '../../src/engine'
import type { Spielzustand } from '../../src/engine'
import { SPIELSTAND_SCHLUESSEL } from '../../src/spielstand'
import { neuePartie, volltisch } from '../../src/ui/tisch/__tests__/szenarien'
import { befundListe, findeAbgeschnittenes, kasten, waagrechterUeberstand } from './messung'
import { halteUhrAn, oeffne } from './oeffnen'

/*
O11, Feinschliff: Fenster unter den fünf Geräteklassen, hier das kleinste
verbreitete Querformat 568 × 320 (iPhone SE der ersten Generation), mit Touch.
Die Prüfer von O2b und O4 fanden dort eine Kopfleiste, deren Texte umbrachen
und „Zur Lobb“ abschnitten, eine Tischfläche, die seitlich 16 px abschnitt,
deine Schlangen, die 20 px Höhe zurückhielten, und in der Lobby einen Knopf
„Abbreche/n“ und Knöpfe ausserhalb des Bildes (TF-TISCH-004, TF-APP-018).
*/

test.use({ viewport: { width: 568, height: 320 }, hasTouch: true, isMobile: true })

async function legeSpielstand(page: Page, zustand: Spielzustand): Promise<void> {
  await page.addInitScript(([schluessel, wert]) => window.localStorage.setItem(schluessel, wert), [SPIELSTAND_SCHLUESSEL, serialisiere(zustand)] as const)
}

/** Bricht der Text des Elements mitten in einem Wort um? */
const brichtImWort = (page: Page, name: string) =>
  page.getByRole('button', { name }).evaluate((knopf) => {
    const bereich = document.createRange()
    const zeilen = new Set<number>()
    const laeufer = document.createTreeWalker(knopf, NodeFilter.SHOW_TEXT)
    while (laeufer.nextNode()) {
      const text = laeufer.currentNode as Text
      for (const wort of text.data.matchAll(/\S+/g)) {
        zeilen.clear()
        for (let stelle = wort.index; stelle < wort.index + wort[0].length; stelle += 1) {
          bereich.setStart(text, stelle)
          bereich.setEnd(text, stelle + 1)
          zeilen.add(Math.round(bereich.getBoundingClientRect().top))
        }
        if (zeilen.size > 1) return true
      }
    }
    return false
  })

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
    expect(await brichtImWort(page, 'Zur Lobby'), '„Zur Lobby“ bricht mitten im Wort um').toBe(false)
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

test.describe('O11 (TF-APP-018): die Lobby bei 568 × 320', () => {
  /** Alle Knöpfe und, falls offen, die Rückfrage liegen zwischen 0 und 320 px. */
  async function erwarteAllesImBild(page: Page, lage: string): Promise<void> {
    const ausserhalb = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button, a[href], [role="alertdialog"]'))
        .filter((element) => (element as HTMLElement).checkVisibility())
        .map((element) => ({ name: (element.textContent ?? '').trim().slice(0, 40), box: element.getBoundingClientRect() }))
        .filter(({ box }) => box.top < -1 || box.bottom > window.innerHeight + 1)
        .map(({ name, box }) => `${name} bei ${Math.round(box.top)}..${Math.round(box.bottom)}`),
    )
    expect(ausserhalb, `${lage}: ausserhalb von 0 bis 320 px`).toEqual([])
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
      expect(await brichtImWort(page, name), `„${name}“ bricht mitten im Wort um`).toBe(false)
    }
  })
})
