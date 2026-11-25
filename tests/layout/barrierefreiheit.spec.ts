import { expect, test, type Page } from '@playwright/test'
import type { Spielzustand } from '../../src/engine'
import { langeSchlange, mittelspiel, neuePartie, volltisch, zehnHandkarten } from '../../src/ui/tisch/__tests__/szenarien'
import { bewegungen, erwarteGrundlagen, erwarteSichtbarenFokus, merkmaleOhneFarbe, tabBis, unterschiedOhneFarbe } from './barrierefreiheit_messung'
import { halteUhrAn, legeSpielstand, oeffne } from './oeffnen'

/*
O11 im Produktionsbuild, in jeder Geräteklasse: Lobby, Regeln und der Tisch in
festen Ständen. Je Seite meldet axe keinen schweren Befund (Kriterium 3), kein
Text steht unter 4,5 : 1 (gemessen), bei „weniger Bewegung“ bewegt sich nichts
(Kriterium 4, playwright.config.ts stellt es für alle Verträge ein), und jeder
Tab-Halt zeigt den Fokus (Kriterium 1).
*/

/**
 * Öffnet den Tisch mit diesem Stand. In den Ständen, die axe prüft, bist du am
 * Zug; dort spielt keine KI, und die Uhr muss laufen, weil axe selbst Zeitgeber
 * braucht. Ist eine KI am Zug (Volltisch), steht die Uhr, damit sie nicht spielt.
 */
async function oeffneTisch(page: Page, zustand: Spielzustand, uhrAnhalten = false): Promise<void> {
  if (uhrAnhalten) await halteUhrAn(page)
  await legeSpielstand(page, zustand)
  await oeffne(page, '/spiel')
}

test.describe('O11 K3/K4: Lobby und Regeln', () => {
  test('O11 K3/K4: die leere Lobby', async ({ page }) => {
    await oeffne(page, '/')
    await erwarteGrundlagen(page, 'Lobby')
  })

  test('O11 K3/K4: die Lobby mit laufender Partie und offener Rückfrage', async ({ page }) => {
    await legeSpielstand(page, neuePartie())
    await oeffne(page, '/')
    await erwarteGrundlagen(page, 'Lobby mit Partie')
    await page.getByRole('button', { name: 'Neue Partie' }).click()
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await erwarteGrundlagen(page, 'Lobby mit Rückfrage')
  })

  test('O11 K3/K4: die Regelseite', async ({ page }) => {
    await oeffne(page, '/regeln')
    await erwarteGrundlagen(page, 'Regeln')
  })

  test('O11 K1: in der Lobby zeigt jeder Tab-Halt den Fokus, bis „Neue Partie“', async ({ page }) => {
    await legeSpielstand(page, neuePartie())
    await oeffne(page, '/')
    await tabBis(page, 'Neue Partie')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await erwarteSichtbarenFokus(page, 'Rückfrage geöffnet')
  })
})

test.describe('O11 K3/K4: der Tisch in festen Ständen', () => {
  const STAENDE: { name: string; erzeuge: () => Spielzustand }[] = [
    { name: 'lange Schlange', erzeuge: langeSchlange },
    { name: 'Mittelspiel', erzeuge: mittelspiel },
    { name: 'neue Partie', erzeuge: neuePartie },
  ]

  for (const stand of STAENDE) {
    test(`O11 K3/K4: ${stand.name}`, async ({ page }) => {
      await oeffneTisch(page, stand.erzeuge())
      await erwarteGrundlagen(page, stand.name)
    })
  }

  test('O11 K3/K4: der Dialog „Zu viele Handkarten“', async ({ page }) => {
    await oeffneTisch(page, zehnHandkarten())
    await expect(page.getByRole('dialog', { name: 'Zu viele Handkarten' })).toBeVisible()
    await erwarteGrundlagen(page, 'Dialog Zu viele Handkarten')
  })

  test('O11 K1: im Volltisch zeigt jeder Tab-Halt den Fokus, auch in scrollenden Bereichen', async ({ page }) => {
    await oeffneTisch(page, volltisch(), true)
    await tabBis(page, 'Zur Lobby')
    // Einmal durch die ganze Reihe, bis „Zur Lobby“ wieder den Fokus hat.
    await tabBis(page, 'Zur Lobby', { hoechstens: 120 })
  })

  test('O11 K3: „Schneller“ sieht eingeschaltet auch ohne Farbe anders aus', async ({ page }, info) => {
    await oeffneTisch(page, volltisch(), true)
    const schneller = page.getByRole('region', { name: 'Zugleiste' }).getByRole('button', { name: 'Schneller' })
    await expect(schneller).toHaveAttribute('aria-pressed', 'false')
    const aus = await merkmaleOhneFarbe(schneller)
    await (info.project.use.hasTouch ? schneller.tap() : schneller.click())
    await expect(schneller).toHaveAttribute('aria-pressed', 'true')
    expect(unterschiedOhneFarbe(aus, await merkmaleOhneFarbe(schneller)), '„Schneller“ an und aus unterscheiden sich nur in der Farbe').not.toEqual([])
  })
})

test.describe('O11 K4: die Messung erkennt Bewegung', () => {
  test('O11 K4: ohne „weniger Bewegung“ haben die Karten der Regelseite einen Übergang, mit nicht', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await oeffne(page, '/regeln')
    const ohne = await bewegungen(page)
    expect(ohne.length, 'ohne „weniger Bewegung“ muss die Messung Übergänge finden, sonst misst sie nichts').toBeGreaterThan(0)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    expect(await bewegungen(page)).toEqual([])
  })
})
