import { expect, test, type Page } from '@playwright/test'
import { serialisiere } from '../../src/engine'
import { starteEntwicklerPartie } from '../../src/entwicklung/partie'
import { erzeugeSzenario } from '../../src/entwicklung/szenarien'
import { SPIELSTAND_SCHLUESSEL } from '../../src/spielstand'
import { waagrechterUeberstand } from './messung'
import { halteUhrAn } from './oeffnen'

/*
O3 im echten Browser, in jeder Geräteklasse: die Testhooks unter `/spiel`
(Kriterium 7) im Testhook-Build, ihr Fehlen im Produktionsbuild, Neuladen mitten
in der Partie (Kriterium 2) und die Pause vor jedem KI-Schritt (Kriterium 1).

Die Projekte laufen mit `reducedMotion: 'reduce'` (playwright.config.ts); dort
spielt die KI ohne Pause. Der Vertrag zur Pause schaltet „weniger Bewegung“ aus
und hält die Uhr der Seite an, damit er die 700 ms abzählt statt abzuwarten.
*/

const PRODUKTION = 'http://localhost:4173'

const gespeichert = (page: Page) => page.evaluate((schluessel) => window.localStorage.getItem(schluessel), SPIELSTAND_SCHLUESSEL)

const status = (page: Page) => page.getByRole('status')

test.describe('O3 K7: /spiel mit Testhooks', () => {
  test('O3 K7/K2: ?szenario= legt den Stand an, die Adresse behält nur das Tempo, Neuladen setzt während der Abwehrfrage dort fort', async ({ page }) => {
    await page.goto('/spiel?szenario=angriff-auf-dich&tempo=sofort')
    await expect(status(page)).toContainText('Du entscheidest, ob du abwehrst.')
    expect(new URL(page.url()).search).toBe('?tempo=sofort')
    const stand = await gespeichert(page)
    expect(stand).toBe(serialisiere(erzeugeSzenario('angriff-auf-dich')))
    await page.reload()
    await expect(status(page)).toContainText('KI-Gegner 1 spielt Schlangengrube')
    await expect(status(page)).toContainText('Du entscheidest, ob du abwehrst.')
    expect(await gespeichert(page), 'Neuladen ändert den Stand nicht').toBe(stand)
    expect(await waagrechterUeberstand(page)).toBe(0)
  })

  test('O3 K7: ?seed= mit spieler beginnt die Partie aus dieser Saat', async ({ page }) => {
    await page.goto('/spiel?seed=3&spieler=3')
    await expect(page.getByRole('region', { name: 'Gegner' }).getByRole('article')).toHaveCount(2)
    expect(new URL(page.url()).search).toBe('')
    expect(await gespeichert(page)).toBe(serialisiere(starteEntwicklerPartie(3, 3, false)))
  })

  test('O3 K1/K7: mit ?tempo=sofort spielen die drei KI-Gegner ihre letzten Züge, bis die Partie beendet ist', async ({ page }) => {
    await page.goto('/spiel?szenario=schlussrunde-ohne-dich&tempo=sofort')
    // Seit O8 steht nach Spielende die Wertung statt des Tischs.
    await expect(page.getByTestId('ergebnis')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('list', { name: 'Wertung' }).getByRole('listitem', { name: 'Du', exact: true })).toBeVisible()
    expect(await waagrechterUeberstand(page)).toBe(0)
  })

  test('O3 K7: ein falscher Parameter sagt, was falsch ist, und führt zur Lobby', async ({ page }) => {
    await page.goto('/spiel?szenario=gibtsnicht')
    await expect(page.getByRole('alert')).toContainText('gibtsnicht')
    await page.getByRole('link', { name: 'Zurück zur Lobby' }).click()
    await expect(page.getByTestId('lobby')).toBeVisible()
  })

  test('O3 K7 Gegenprobe: der Produktionsbuild kennt die Parameter nicht und legt keinen Stand an', async ({ page }) => {
    await page.goto(`${PRODUKTION}/spiel?szenario=angriff-auf-dich&tempo=sofort`)
    await expect(page.getByTestId('spiel')).toContainText('Es läuft keine Partie')
    expect(await gespeichert(page)).toBeNull()
  })
})

test.describe('O3 K1: Pause vor jedem KI-Schritt', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } })

  /* Der Stand kommt hier über den Speicher wie aus der Lobby, nicht über `?szenario=`:
     Die Testhooks werden nachgeladen, und React zeigt nachgeladenen Inhalt erst nach
     einem Zeitgeber, der bei angehaltener Uhr nie abläuft. */
  test('O3 K1: ohne „weniger Bewegung“ folgt jeder KI-Schritt nach 700 ms, nicht früher', async ({ page }) => {
    const start = serialisiere(erzeugeSzenario('schlussrunde-ohne-dich'))
    await halteUhrAn(page)
    await page.addInitScript(([schluessel, wert]) => window.localStorage.setItem(schluessel, wert), [SPIELSTAND_SCHLUESSEL, start] as const)
    await page.goto('/spiel')
    await expect(status(page)).toContainText('KI-Gegner 1 ist')
    expect(await gespeichert(page)).toBe(start)
    await page.clock.runFor(699)
    expect(await gespeichert(page), 'vor 700 ms').toBe(start)
    await page.clock.runFor(1)
    await expect.poll(() => gespeichert(page), { message: 'nach 700 ms genau ein Schritt' }).not.toBe(start)
    const erster = await gespeichert(page)
    await page.clock.runFor(699)
    expect(await gespeichert(page), 'der zweite Schritt wartet wieder 700 ms').toBe(erster)
    await page.clock.runFor(1)
    await expect.poll(() => gespeichert(page)).not.toBe(erster)
  })
})
