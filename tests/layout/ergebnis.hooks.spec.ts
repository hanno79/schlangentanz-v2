import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'
import { berechneEndwertung, deserialisiere } from '../../src/engine'
import { SPIELSTAND_SCHLUESSEL } from '../../src/spielstand'
import { waagrechterUeberstand } from './messung'
import { bedienbarkeitsVertraege, nichtsIstStillgelegt, waechterVertraege } from './waechter'

/*
O8 im echten Browser, in jeder Geräteklasse: die Wertung nach Spielende mit
vier Spielern und der ganzen Aufschlüsselung, der Gleichstand, eine echte
Schlussrunde bis zur Wertung mit „Noch einmal“ und „Zur Lobby“, und der
Zwischenstand am Tisch (Kriterium 5). Die Stände kommen über `/spiel?szenario=`
aus dem Testhook-Build.
*/

const gespeichert = (page: Page) => page.evaluate((schluessel) => window.localStorage.getItem(schluessel), SPIELSTAND_SCHLUESSEL)

/** Tippen mit Touch-Geräten, sonst klicken. */
function bediene(info: TestInfo): (element: Locator) => Promise<void> {
  return info.project.use.hasTouch ? (element) => element.tap() : (element) => element.click()
}

async function oeffneWertung(page: Page, szenario: string): Promise<void> {
  await page.goto(`/spiel?szenario=${szenario}`)
  await expect(page.getByTestId('ergebnis')).toBeVisible()
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
}

const eintrag = (page: Page, name: string) => page.getByRole('list', { name: 'Wertung' }).getByRole('listitem', { name, exact: true })

function alleVertraege(): void {
  bedienbarkeitsVertraege()
  waechterVertraege()
  nichtsIstStillgelegt()
}

test.describe('O8 K1/K2: Wertung mit vier Spielern und Jokern', () => {
  test.beforeEach(async ({ page }) => {
    await oeffneWertung(page, 'wertung-beispiele')
  })

  alleVertraege()

  test('O8 K1/K2: Sieger, Gesamtpunkte, Gruppen je Schlange und die Farbe jedes Jokers stehen da', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('KI-Gegner 2 gewinnt!')
    await expect(eintrag(page, 'KI-Gegner 2').getByTestId('gesamt')).toHaveText('28 Punkte')
    await expect(eintrag(page, 'KI-Gegner 2')).toContainText('Regenbogenschlange als Rot')
    await expect(eintrag(page, 'Du')).toContainText('Farbenfusion als Violett')
    await expect(eintrag(page, 'KI-Gegner 1')).toContainText('Längste Kette: 4 Karten')
  })

  test('O8: nur die Rangliste scrollt; Titel und Knöpfe stehen ohne Scrollen ganz im Bild', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Noch einmal' })).toBeInViewport({ ratio: 1 })
    await expect(page.getByRole('link', { name: 'Zur Lobby' })).toBeInViewport({ ratio: 1 })
    await expect(page.getByRole('heading', { level: 1 })).toBeInViewport({ ratio: 1 })
    // Vier Spieler mit Aufschlüsselung passen in keine Geräteklasse; die Liste zeigt, dass es weitergeht.
    await expect(page.locator('[data-weiter="unten"]')).toBeVisible()
    const liste = page.getByRole('list', { name: 'Wertung' })
    await liste.evaluate((element) => element.scrollTo(0, element.scrollHeight))
    await expect(page.locator('[data-weiter="oben"]')).toBeVisible()
    await expect(eintrag(page, 'KI-Gegner 3')).toBeInViewport()
    expect(await page.evaluate(() => document.scrollingElement!.scrollTop), 'die Seite selbst scrollt nicht').toBe(0)
  })
})

test.describe('O8 K3: Gleichstand', () => {
  test.beforeEach(async ({ page }) => {
    await oeffneWertung(page, 'wertung-beispiele-kette')
  })

  alleVertraege()

  test('O8 K3/D22: beide Sieger stehen im Titel und tragen das Abzeichen', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gleichstand: Du und KI-Gegner 1 gewinnen!')
    await expect(eintrag(page, 'Du').getByText('Sieger', { exact: true })).toBeVisible()
    await expect(eintrag(page, 'KI-Gegner 1').getByText('Sieger', { exact: true })).toBeVisible()
    await expect(eintrag(page, 'KI-Gegner 2').getByText('Sieger', { exact: true })).toHaveCount(0)
  })
})

test.describe('O8 K4: Eine echte Schlussrunde bis zur Wertung', () => {
  test('O8 K1/K4: die KI-Gegner spielen zu Ende, die Wertung stimmt mit der Engine, „Noch einmal“ beginnt neu', async ({ page }, info) => {
    const tippe = bediene(info)
    await page.goto('/spiel?szenario=schlussrunde-ohne-dich&tempo=sofort')
    await expect(page.getByTestId('ergebnis')).toBeVisible({ timeout: 15_000 })
    const ende = deserialisiere((await gespeichert(page))!)
    expect(ende.partiephase).toBe('Beendet')
    for (const wertung of berechneEndwertung(ende).spieler) {
      const name = wertung.spielerId === 'spieler-1' ? 'Du' : wertung.name
      await expect(eintrag(page, name).getByTestId('gesamt')).toHaveText(`${wertung.summe} ${wertung.summe === 1 ? 'Punkt' : 'Punkte'}`)
    }
    expect(await waagrechterUeberstand(page)).toBe(0)

    await tippe(page.getByRole('button', { name: 'Noch einmal' }))
    await expect(page.getByRole('region', { name: 'Deine Hand' })).toBeVisible()
    await expect(page.getByRole('region', { name: 'Gegner' }).getByRole('article')).toHaveCount(3)
    const neu = deserialisiere((await gespeichert(page))!)
    expect(neu.partiephase).toBe('Laufend')
    expect(neu.erweiterung).toBe(false)
  })

  test('O8 K4: „Zur Lobby“ führt zurück, die Lobby bietet „Ergebnis ansehen“ statt „Weiterspielen“', async ({ page }, info) => {
    const tippe = bediene(info)
    await oeffneWertung(page, 'wertung-beispiele')
    await tippe(page.getByRole('link', { name: 'Zur Lobby' }))
    await expect(page.getByTestId('lobby')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Weiterspielen' })).toHaveCount(0)
    await tippe(page.getByRole('button', { name: 'Ergebnis ansehen' }))
    await expect(page.getByTestId('ergebnis')).toBeVisible()
    expect(await waagrechterUeberstand(page)).toBe(0)
  })
})

test.describe('O8 K5: Zwischenstand am Tisch', () => {
  test('O8 K5: jeder Gegner und du zeigen die Punkte ohne Kettenbonus, die Seite bleibt schmal', async ({ page }) => {
    await page.goto('/spiel?szenario=wertung-joker')
    await expect(page.getByRole('region', { name: 'Deine Hand' })).toBeVisible()
    await expect(page.getByRole('article', { name: 'KI-Gegner 3' }).getByTestId('punkte')).toHaveText('Zwischenstand ohne Kettenbonus: 55 Punkte')
    await expect(page.getByRole('region', { name: 'Deine Schlangen' }).getByTestId('punkte')).toBeVisible()
    expect(await waagrechterUeberstand(page)).toBe(0)
  })
})
