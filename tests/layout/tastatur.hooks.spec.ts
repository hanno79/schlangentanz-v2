import { expect, test, type Page } from '@playwright/test'
import { SPIELSTAND_SCHLUESSEL } from '../../src/spielstand'
import { erwarteSichtbarenFokus, tabBis } from './barrierefreiheit_messung'

/*
O11, Kriterium 1, in jeder Geräteklasse: Eine Partie geht allein mit der
Tastatur ein paar Züge weit, und der Fokus ist immer zu sehen. Bedient wird nur
mit Tab, Umschalt+Tab, Enter, Leertaste und Escape; kein Klick, kein Tippen.
Nach jeder Aktion steht der Fokus auf einem Element (nie auf der leeren Seite),
und man sieht ihn. Die KI spielt dabei ohne Pause (`tempo=sofort`).
*/

// Die Adresse des Testhooks steht in jedem `*.hooks.spec.ts` selbst (src/layout_hooks_namensgebung.test.ts).
async function oeffneSzenario(page: Page, name: string): Promise<void> {
  await page.goto(`/spiel?szenario=${name}&tempo=sofort`)
  await expect(page.getByRole('region', { name: 'Zugleiste' })).toBeVisible()
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
}

const gespeichert = (page: Page) => page.evaluate((schluessel) => window.localStorage.getItem(schluessel), SPIELSTAND_SCHLUESSEL)
const zugleiste = (page: Page) => page.getByRole('region', { name: 'Zugleiste' })
const hand = (page: Page) => page.getByRole('region', { name: 'Deine Hand' })

test.describe('O11 K1: eine Partie allein mit der Tastatur', () => {
  test('O11 K1: Karte wählen, Ziel wählen, ausführen, Zug beenden, nächste Karte, Escape', async ({ page }) => {
    await oeffneSzenario(page, 'farbkarte-beim-gegner')
    const start = await gespeichert(page)

    await tabBis(page, 'Farbkarte Rot, 1 Punkt')
    await page.keyboard.press('Space')
    await expect(hand(page).getByRole('button', { name: 'Farbkarte Rot, 1 Punkt' })).toHaveAttribute('aria-pressed', 'true')
    await erwarteSichtbarenFokus(page, 'Karte gewählt')

    await tabBis(page, 'KI-Gegner 1, Schlange 1: Ende')
    await page.keyboard.press('Enter')
    await expect(zugleiste(page)).toContainText('Ansage:')
    await erwarteSichtbarenFokus(page, 'Ziel gewählt')

    await tabBis(page, 'Ausführen')
    await page.keyboard.press('Enter')
    await expect.poll(() => gespeichert(page), { message: 'nach „Ausführen“ ist gespielt' }).not.toBe(start)
    expect(await erwarteSichtbarenFokus(page, 'nach „Ausführen“')).toBe('Zug beenden')

    await page.keyboard.press('Enter')
    await expect(page.getByRole('status')).toContainText('Du bist', { timeout: 15_000 })
    await erwarteSichtbarenFokus(page, 'nach den Zügen der Gegner')

    const karte = hand(page).getByRole('button', { name: /^Farbkarte/ }).first()
    const name = (await karte.getAttribute('aria-label')) ?? ''
    await tabBis(page, name)
    await page.keyboard.press('Enter')
    await expect(karte).toHaveAttribute('aria-pressed', 'true')
    await page.keyboard.press('Escape')
    await expect(karte).toHaveAttribute('aria-pressed', 'false')
    await erwarteSichtbarenFokus(page, 'nach Escape')
  })

  test('O11 K1: mit gewählter Karte zeigt jeder Tab-Halt einer ganzen Runde den Fokus', async ({ page }) => {
    await oeffneSzenario(page, 'farbkarte-beim-gegner')
    await tabBis(page, 'Farbkarte Rot, 1 Punkt')
    await page.keyboard.press('Space')
    await tabBis(page, 'Farbkarte Rot, 1 Punkt', { hoechstens: 60 })
  })

  test('O11 K1: abwehren mit der Tastatur', async ({ page }) => {
    await oeffneSzenario(page, 'angriff-auf-dich')
    await tabBis(page, 'Abwehren')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('log', { name: 'Protokoll' })).toContainText('Du wehrst')
    // Danach spielt KI-Gegner 1 weiter; gemessen wird, wenn du wieder dran bist.
    await expect(page.getByRole('status')).toContainText('Du bist', { timeout: 15_000 })
    await erwarteSichtbarenFokus(page, 'nach der Abwehr')
  })

  test('O11 K1: überzählige Karten mit der Tastatur ablegen', async ({ page }) => {
    await oeffneSzenario(page, 'zu-viele-handkarten')
    const dialog = page.getByRole('dialog', { name: 'Zu viele Handkarten' })
    await expect(dialog).toBeVisible()
    await erwarteSichtbarenFokus(page, 'Dialog geöffnet')
    for (const name of ['Farbkarte Rot, 1 Punkt', 'Farbkarte Blau, 1 Punkt']) {
      await tabBis(page, name)
      await page.keyboard.press('Space')
    }
    await tabBis(page, 'Ablegen')
    await page.keyboard.press('Enter')
    await expect(dialog).toBeHidden()
    // Danach spielt KI-Gegner 1; gemessen wird, wenn du wieder dran bist.
    await expect(page.getByRole('status')).toContainText('Du bist', { timeout: 15_000 })
    await erwarteSichtbarenFokus(page, 'nach dem Ablegen')
  })

  test('O11 K1: die Häutung mit der Tastatur ordnen, Escape bricht ab', async ({ page }) => {
    await oeffneSzenario(page, 'haeutung-punkte')
    await tabBis(page, 'Sonderkarte Schlangenhäutung')
    await page.keyboard.press('Enter')
    await tabBis(page, 'Deine Schlange 1 wählen')
    await page.keyboard.press('Enter')
    await tabBis(page, 'Deine Schlange 1, Karte 1: Farbkarte Rot, 1 Punkt', { rueckwaerts: true })
    await page.keyboard.press('Enter')
    await tabBis(page, 'Deine Schlange 1, Karte 3: Farbkarte Rot, 1 Punkt')
    await page.keyboard.press('Enter')
    await expect(zugleiste(page)).toContainText('Deine Punkte')
    await erwarteSichtbarenFokus(page, 'Häutung ordnen')
    await page.keyboard.press('Escape')
    await expect(hand(page).getByRole('button', { name: 'Sonderkarte Schlangenhäutung' })).toHaveAttribute('aria-pressed', 'false')
    await erwarteSichtbarenFokus(page, 'Häutung abgebrochen')
  })

  test('O11 K1: die Grossansicht einer Aufgabe öffnen und mit Escape schliessen', async ({ page }) => {
    await oeffneSzenario(page, 'start-erweiterung')
    await tabBis(page, /^Aufgabe /)
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog')).toBeVisible()
    await erwarteSichtbarenFokus(page, 'Grossansicht offen')
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    expect(await erwarteSichtbarenFokus(page, 'Grossansicht geschlossen')).toMatch(/^Aufgabe /)
  })
})
